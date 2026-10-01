// ─────────────────────────────────────────────────────────
// Durable record store (Supabase `app_records`, JSONB)
// Source of truth for the in-memory `db`: every saveDb() writes the
// records that changed; boot loads them back before serving traffic.
// See supabase/migrations/004_app_records.sql.
// ─────────────────────────────────────────────────────────

import * as crypto from 'crypto';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { db, saveDb, registerSaveHook } from './store';

const TABLE = 'app_records';
const SINGLETON_ID = '__singleton__';
/** Pseudo-collection holding each array collection's record order. */
const ORDER_COLLECTION = '__order__';
const PAGE_SIZE = 1000;
const UPSERT_BATCH = 200;
const DELETE_BATCH = 100;
const REQUEST_TIMEOUT_MS = 15000;

interface RemoteConfig {
  url: string;
  serviceKey: string;
}

interface RecordRow {
  collection: string;
  id: string;
  data: any;
}

/**
 * Remote persistence is opt-in (DATA_STORE=supabase) so a developer machine
 * holding the production service key never reads or writes production data
 * by accident.
 */
export function getRemoteConfig(): RemoteConfig | null {
  if ((process.env.DATA_STORE || '').toLowerCase() !== 'supabase') return null;
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!url || !serviceKey) {
    throw new Error('[Records] DATA_STORE=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url, serviceKey };
}

async function rest(
  config: RemoteConfig,
  pathAndQuery: string,
  options: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<any> {
  const res = await fetch(`${config.url}/rest/v1/${pathAndQuery}`, {
    method: options.method || 'GET',
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${options.method || 'GET'} ${TABLE} failed: HTTP ${res.status} ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Fingerprinting ──────────────────────────────────────────────────
// JSONB does not preserve key order, so fingerprints use a key-sorted
// canonical form; otherwise every record would look changed after a reload.

function canonical(value: any): any {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value).sort()) {
      const v = value[key];
      if (v !== undefined && typeof v !== 'function') out[key] = canonical(v);
    }
    return out;
  }
  return value;
}

function fingerprint(data: any): string {
  return crypto.createHash('sha1').update(JSON.stringify(canonical(data))).digest('hex');
}

/** Records carry an `id`; join rows without one are keyed by their content. */
function recordId(item: any): string {
  if (item && item.id !== undefined && item.id !== null) return String(item.id);
  return `h:${fingerprint(item).slice(0, 24)}`;
}

const keyOf = (collection: string, id: string) => `${collection}\u0000${id}`;

interface SnapshotEntry extends RecordRow {
  fp: string;
}

/** Flatten the in-memory db into one entry per persisted record. */
function snapshot(): Map<string, SnapshotEntry> {
  const out = new Map<string, SnapshotEntry>();
  const add = (collection: string, id: string, data: any) => {
    // Round-trip through JSON so what we fingerprint is exactly what we store.
    const plain = JSON.parse(JSON.stringify(data));
    out.set(keyOf(collection, id), { collection, id, data: plain, fp: fingerprint(plain) });
  };

  for (const [collection, value] of Object.entries(db)) {
    if (Array.isArray(value)) {
      const order: string[] = [];
      for (const item of value) {
        const id = recordId(item);
        if (!order.includes(id)) order.push(id);
        add(collection, id, item);
      }
      add(ORDER_COLLECTION, collection, order);
    } else if (value && typeof value === 'object') {
      add(collection, SINGLETON_ID, value);
    }
  }
  return out;
}

// ── Write-through ───────────────────────────────────────────────────

let remote: RemoteConfig | null = null;
/** Fingerprint of every record as it currently exists in Supabase. */
const syncedFingerprints = new Map<string, string>();
let flushing = false;
let flushRequested = false;
let retryTimer: NodeJS.Timeout | null = null;
let consecutiveFailures = 0;
let hookRegistered = false;

function quoteForIn(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function pushChanges(config: RemoteConfig): Promise<void> {
  const current = snapshot();
  const upserts = [...current.values()].filter((e) => syncedFingerprints.get(keyOf(e.collection, e.id)) !== e.fp);
  const deletions = [...syncedFingerprints.keys()].filter((k) => !current.has(k));

  for (let i = 0; i < upserts.length; i += UPSERT_BATCH) {
    const batch = upserts.slice(i, i + UPSERT_BATCH);
    const now = new Date().toISOString();
    await rest(config, TABLE, {
      method: 'POST',
      body: batch.map((e) => ({ collection: e.collection, id: e.id, data: e.data, updated_at: now })),
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
    for (const e of batch) syncedFingerprints.set(keyOf(e.collection, e.id), e.fp);
  }

  const byCollection = new Map<string, string[]>();
  for (const key of deletions) {
    const [collection, id] = key.split('\u0000');
    byCollection.set(collection, [...(byCollection.get(collection) || []), id]);
  }
  for (const [collection, ids] of byCollection) {
    for (let i = 0; i < ids.length; i += DELETE_BATCH) {
      const batch = ids.slice(i, i + DELETE_BATCH);
      const filter = `collection=eq.${encodeURIComponent(collection)}&id=in.${encodeURIComponent(
        `(${batch.map(quoteForIn).join(',')})`,
      )}`;
      await rest(config, `${TABLE}?${filter}`, { method: 'DELETE', prefer: 'return=minimal' });
      for (const id of batch) syncedFingerprints.delete(keyOf(collection, id));
    }
  }
}

/**
 * Push pending changes. Single-flight: a save that lands mid-flush is picked
 * up by a follow-up pass. Failed writes stay pending and are retried with
 * backoff, so a Supabase blip delays persistence instead of losing it.
 */
export async function flushToRemote(): Promise<void> {
  if (!remote) return;
  if (flushing) {
    flushRequested = true;
    return;
  }
  flushing = true;
  try {
    do {
      flushRequested = false;
      await pushChanges(remote);
    } while (flushRequested);
    consecutiveFailures = 0;
  } catch (err) {
    consecutiveFailures += 1;
    const delay = Math.min(60000, 1000 * 2 ** Math.min(consecutiveFailures, 6));
    console.error(`[Records] Persist failed (attempt ${consecutiveFailures}), retrying in ${delay}ms:`, (err as Error).message);
    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        flushToRemote().catch(() => {});
      }, delay);
      retryTimer.unref?.();
    }
  } finally {
    flushing = false;
  }
}

/** Resolves once nothing is pending (or throws if the last attempt failed). Used on shutdown and in tests. */
export async function drainRemote(): Promise<void> {
  if (!remote) return;
  while (flushing) await new Promise((r) => setTimeout(r, 25));
  await pushChanges(remote);
}

// ── Hydration ───────────────────────────────────────────────────────

async function loadAllRows(config: RemoteConfig): Promise<RecordRow[]> {
  const rows: RecordRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page: RecordRow[] = await rest(
      config,
      `${TABLE}?select=collection,id,data&order=collection.asc,id.asc&limit=${PAGE_SIZE}&offset=${offset}`,
    );
    rows.push(...(page || []));
    if (!page || page.length < PAGE_SIZE) return rows;
  }
}

/** Rebuild db collections from stored rows, restoring each array's order. */
function applyRows(rows: RecordRow[]) {
  const orders = new Map<string, string[]>();
  const grouped = new Map<string, Map<string, any>>();
  for (const row of rows) {
    if (row.collection === ORDER_COLLECTION) {
      orders.set(row.id, Array.isArray(row.data) ? row.data : []);
      continue;
    }
    if (!grouped.has(row.collection)) grouped.set(row.collection, new Map());
    grouped.get(row.collection)!.set(row.id, row.data);
  }

  for (const [collection, records] of grouped) {
    if (records.size === 1 && records.has(SINGLETON_ID) && !orders.has(collection)) {
      (db as any)[collection] = records.get(SINGLETON_ID);
      continue;
    }
    const ordered: any[] = [];
    const seen = new Set<string>();
    for (const id of orders.get(collection) || []) {
      if (records.has(id) && !seen.has(id)) {
        ordered.push(records.get(id));
        seen.add(id);
      }
    }
    for (const [id, data] of records) if (!seen.has(id)) ordered.push(data);
    (db as any)[collection] = ordered;
  }
  // An array collection whose every record was deleted only survives as its order row.
  for (const [collection, ids] of orders) {
    if (!grouped.has(collection) && ids.length === 0 && Array.isArray((db as any)[collection])) {
      (db as any)[collection] = [];
    }
  }
}

/**
 * One-time migration when app_records is empty: start from what the previous
 * sync engine served (normalized tables override the local seed when they
 * hold data), so the first boot on the new store keeps production state.
 */
async function importLegacyTables(config: RemoteConfig) {
  const load = async (table: string, query = 'select=*') => {
    try {
      const rows = await rest(config, `${table}?${query}`);
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  };
  const categories = await load('categories');
  if (categories.length) db.categories = categories;
  const products = await load('products');
  if (products.length) db.products = products;
  const variants = await load('product_variants');
  if (variants.length) db.product_variants = variants;

  const orders = await load('orders', 'select=*&order=created_at.desc');
  const knownOrderIds = new Set(db.orders.map((o) => o.id));
  for (const order of orders) {
    if (knownOrderIds.has(order.id)) continue;
    if (!order.shipping_address && order.address_snapshot_json) order.shipping_address = order.address_snapshot_json;
    db.orders.push(order);
  }
  const payments = await load('payments', 'select=*&order=created_at.desc');
  const knownPaymentIds = new Set(db.payments.map((p) => p.id));
  for (const payment of payments) if (!knownPaymentIds.has(payment.id)) db.payments.push(payment);
}

/**
 * Load the durable store into memory before the API serves traffic.
 * Throws when remote persistence is enabled but unreachable: starting from
 * the bundled seed instead would later overwrite newer remote records.
 */
export async function hydrateFromAppRecords(): Promise<void> {
  remote = getRemoteConfig();
  if (!remote) {
    console.warn('[Records] DATA_STORE is not "supabase": using local store.json only (not durable).');
    return;
  }

  let rows: RecordRow[] | null = null;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3 && !rows; attempt++) {
    try {
      rows = await loadAllRows(remote);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  if (!rows) {
    throw new Error(
      `[Records] Could not load ${TABLE} from Supabase (did you run supabase/migrations/004_app_records.sql?): ` +
        (lastError as Error)?.message,
    );
  }

  if (rows.length === 0) {
    console.log(`[Records] ${TABLE} is empty: importing legacy tables and seeding it.`);
    await importLegacyTables(remote);
  } else {
    applyRows(rows);
    for (const row of rows) syncedFingerprints.set(keyOf(row.collection, row.id), fingerprint(row.data));
    console.log(`[Records] Loaded ${rows.length} records from Supabase.`);
  }

  // Seeding must succeed before serving: otherwise nothing durable exists yet.
  await pushChanges(remote);
  if (!hookRegistered) {
    hookRegistered = true;
    registerSaveHook(() => {
      flushToRemote().catch(() => {});
    });
  }
  saveDb();
}

/** Flushes pending writes when Nest shuts down (SIGTERM on redeploy). */
@Injectable()
export class AppRecordsShutdown implements OnApplicationShutdown {
  async onApplicationShutdown() {
    try {
      await drainRemote();
    } catch (err) {
      console.error('[Records] Could not flush pending writes on shutdown:', (err as Error).message);
    }
  }
}
