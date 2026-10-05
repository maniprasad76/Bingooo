// ─────────────────────────────────────────────────────────
// Supabase Storage client for files that must outlive the container.
// The API host's disk is ephemeral (Render wipes it on every deploy and
// restart), so with DATA_STORE=supabase uploads and backups live here.
// Locally, without DATA_STORE, callers keep using the disk.
// ─────────────────────────────────────────────────────────

import { getRemoteConfig } from '../database/app-records.service';

const REQUEST_TIMEOUT_MS = 30000;

export const PUBLIC_MEDIA_BUCKET = 'product-images';
export const BACKUP_BUCKET = 'backups';

export interface RemoteObject {
  name: string;
  createdAt: string;
  sizeBytes: number;
}

export function isRemoteStorageEnabled(): boolean {
  return getRemoteConfig() !== null;
}

function config() {
  const remote = getRemoteConfig();
  if (!remote) throw new Error('[Storage] Remote storage requires DATA_STORE=supabase.');
  return remote;
}

async function request(pathAndQuery: string, init: { method: string; body?: BodyInit; headers?: Record<string, string> }) {
  const { url, serviceKey } = config();
  const res = await fetch(`${url}/storage/v1/${pathAndQuery}`, {
    method: init.method,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, ...(init.headers || {}) },
    body: init.body,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return res;
}

async function failure(res: Response, action: string): Promise<Error> {
  const text = await res.text().catch(() => '');
  return new Error(`[Storage] ${action} failed: HTTP ${res.status} ${text.slice(0, 200)}`);
}

const encodeKey = (key: string) => key.split('/').map(encodeURIComponent).join('/');

export function publicObjectUrl(bucket: string, key: string): string {
  return `${config().url}/storage/v1/object/public/${bucket}/${encodeKey(key)}`;
}

export async function uploadObject(bucket: string, key: string, body: Buffer | string, contentType: string): Promise<void> {
  const res = await request(`object/${bucket}/${encodeKey(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType, 'x-upsert': 'true' },
    body: typeof body === 'string' ? body : new Uint8Array(body),
  });
  if (!res.ok) throw await failure(res, `Upload ${bucket}/${key}`);
}

export async function downloadObject(bucket: string, key: string): Promise<Buffer> {
  const res = await request(`object/${bucket}/${encodeKey(key)}`, { method: 'GET' });
  if (!res.ok) throw await failure(res, `Download ${bucket}/${key}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Newest first. */
export async function listObjects(bucket: string, prefix = '', limit = 100): Promise<RemoteObject[]> {
  const res = await request(`object/list/${bucket}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }),
  });
  if (!res.ok) throw await failure(res, `List ${bucket}`);
  const rows = (await res.json()) as Array<{ name: string; created_at?: string; metadata?: { size?: number } | null }>;
  return rows
    .filter((r) => r.metadata) // folders come back without metadata
    .map((r) => ({ name: r.name, createdAt: r.created_at || '', sizeBytes: Number(r.metadata?.size || 0) }));
}

export async function deleteObjects(bucket: string, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const res = await request(`object/${bucket}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: keys }),
  });
  if (!res.ok) throw await failure(res, `Delete from ${bucket}`);
}

/** Creates a private bucket if it does not exist yet (idempotent). */
export async function ensurePrivateBucket(bucket: string, fileSizeLimitBytes: number): Promise<void> {
  const res = await request('bucket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: bucket, name: bucket, public: false, file_size_limit: fileSizeLimitBytes }),
  });
  if (res.ok) return;
  const text = await res.text().catch(() => '');
  if (res.status === 409 || /already exists|Duplicate/i.test(text)) return;
  throw new Error(`[Storage] Create bucket ${bucket} failed: HTTP ${res.status} ${text.slice(0, 200)}`);
}
