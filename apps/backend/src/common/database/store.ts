// ─────────────────────────────────────────────────────────
// In-memory data store — replaces Supabase until connected
// Mirrors the exact database schema from migration 001
// ─────────────────────────────────────────────────────────

import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as path from 'path';
import { getDataDir } from '../utils/paths.util';
import { BUILT_IN_ROLES, PERMISSION_CATALOG, ROLE_PERMISSIONS_VERSION } from '../auth/permissions';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'store.json');
// Sanitized first-boot seed shipped with the code (catalog, roles, settings;
// no customer data). Resolved next to the source/dist tree so it is found
// even where DATA_DIR points elsewhere (e.g. /tmp on Vercel).
const SEED_FILE = path.resolve(__dirname, '..', '..', '..', 'data', 'seed.json');


export const db = {
  categories: [] as any[],
  collections: [] as any[],
  products: [] as any[],
  product_images: [] as any[],
  product_variants: [] as any[],
  product_collections: [] as any[],
  users: [] as any[],

  roles: BUILT_IN_ROLES.map((r) => ({ ...r, permissions: [...r.permissions], permissions_version: ROLE_PERMISSIONS_VERSION })) as any[],

  permissions: PERMISSION_CATALOG.map((p) => ({ ...p })) as any[],

  inventory_movements: [] as any[],
  wishlists: [] as any[],
  carts: [] as any[],
  cart_items: [] as any[],
  orders: [] as any[],
  order_items: [] as any[],
  payments: [] as any[],
  refunds: [] as any[],
  returns: [] as any[],
  coupons: [] as any[],
  coupon_redemptions: [] as any[],
  custom_requirements: [] as any[],
  reviews: [] as any[],
  customizations: [] as any[],
  customization_assets: [] as any[],
  shipments: [] as any[],
  notifications: [] as any[],
  audit_logs: [] as any[],
  addresses: [] as any[],
  profiles: [] as any[],
  banners: [] as any[],
  settings: {
    store_name: 'Bingooo Luxury Streetwear',
    store_email: 'care@bingooo.in',
    store_phone: '+91 98765 43210',
    support_hours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
    gst_enabled: false,
    tax_rate_percentage: 0,
    max_upload_size_mb: 15,
    currency: 'INR',
    return_window_days: 7,
    dtg_print_lead_days: 3,
    prepaid_discount_percentage: 5,
  } as any,
  media_assets: [] as any[],
  // Logged-out sessions: { id: sha256(token or jti), expires_at }. Persisted so a
  // restart does not bring revoked tokens back to life.
  revoked_tokens: [] as any[],
  customizer_config: {
    garments: [] as any[],
    updatedAt: new Date().toISOString(),
  } as any,
};

type SaveHook = () => void;
const saveHooks: SaveHook[] = [];

export function registerSaveHook(hook: SaveHook): void {
  saveHooks.push(hook);
}

/**
 * Write via a temp file + rename so a crash mid-write can never leave a
 * truncated store.json behind (rename is atomic on the same filesystem).
 * Uses non-blocking fs.promises I/O: the synchronous equivalent used to
 * freeze the whole event loop — and every concurrent request on it — for
 * the duration of the write, which got worse as the store grew.
 */
async function writeFileAtomic(file: string, contents: string): Promise<void> {
  const tmp = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, contents, 'utf-8');
  try {
    await fsp.rename(tmp, file);
  } catch (err: any) {
    // Windows can refuse to replace a file another process holds open
    // (editor, antivirus). Fall back to copy so the save is not lost.
    if (err?.code !== 'EPERM' && err?.code !== 'EBUSY') throw err;
    await fsp.copyFile(tmp, file);
    await fsp.unlink(tmp);
  }
}

// Disk flushes are coalesced through a single in-flight write + a "write
// again once free" flag, rather than firing one fs write per saveDb() call.
// Under bursty traffic (e.g. an order touching cart, inventory and payment
// rows in succession) this collapses N nearly-identical multi-MB writes into
// one, without ever skipping the latest state. `pendingFlush` resolves once
// whatever is in `db` at shutdown time has actually reached disk.
let flushing = false;
let flushAgain = false;
let pendingFlush: Promise<void> = Promise.resolve();

async function flushToDisk(): Promise<void> {
  if (flushing) {
    flushAgain = true;
    return pendingFlush;
  }
  flushing = true;
  pendingFlush = (async () => {
    try {
      const snapshot = JSON.stringify(db);
      await fsp.mkdir(DATA_DIR, { recursive: true });
      await writeFileAtomic(STORE_FILE, snapshot);
    } catch (err) {
      console.error('[Database] Failed to save store to disk:', err);
    } finally {
      flushing = false;
      if (flushAgain) {
        flushAgain = false;
        await flushToDisk();
      }
    }
  })();
  return pendingFlush;
}

/** Resolves once every flush queued so far has reached disk (used on shutdown). */
export function waitForPendingWrites(): Promise<void> {
  return pendingFlush;
}

export function saveDb() {
  // Fire-and-forget from the caller's perspective (unchanged call sites),
  // but the actual write now happens off the main thread instead of
  // blocking it.
  void flushToDisk();

  // Hooks run synchronously and immediately: index rebuilds are pure
  // in-memory work that must stay instant so the next read is consistent,
  // and the durable remote store must not depend on an ephemeral or
  // read-only local disk. Notified without a circular import (observer
  // pattern).
  for (const hook of saveHooks) {
    try {
      hook();
    } catch (err) {
      console.error('[Database] Save hook error:', err);
    }
  }
}

/** Flushes any write still in flight when Nest shuts down (SIGTERM on redeploy). */
@Injectable()
export class StoreShutdown implements OnApplicationShutdown {
  async onApplicationShutdown() {
    try {
      await waitForPendingWrites();
    } catch (err) {
      console.error('[Database] Could not flush pending writes on shutdown:', (err as Error).message);
    }
  }
}

// Load persisted state from disk if available, otherwise initialize file.
// A store that exists but cannot be parsed is fatal: falling back to the empty
// seed would let the next saveDb() overwrite every user, order and product.
let storePathToLoad: string | null = null;
if (fs.existsSync(STORE_FILE)) {
  storePathToLoad = STORE_FILE;
} else if (fs.existsSync(SEED_FILE)) {
  storePathToLoad = SEED_FILE;
}

if (storePathToLoad) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(storePathToLoad, 'utf-8'));
  } catch (err) {
    throw new Error(
      `[Database] ${storePathToLoad} is unreadable or corrupt; refusing to start so it is not ` +
        `overwritten. Restore it from data/backups/ before restarting. Cause: ${(err as Error).message}`,
    );
  }
  if (parsed && typeof parsed === 'object') {
    for (const [key, val] of Object.entries(parsed)) {
      (db as any)[key] = val;
    }
  }
} else {
  saveDb();
}

