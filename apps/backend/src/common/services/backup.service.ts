// ─────────────────────────────────────────────────────────
// Backup & Restore Service
// Snapshots store.json + upload manifest with auto-rotation
// ─────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { db, saveDb } from '../database/store';
import { rebuildIndexes } from '../database/db-index.service';
import { getDataDir, getUploadsDir } from '../utils/paths.util';
import {
  BACKUP_BUCKET,
  deleteObjects,
  downloadObject,
  ensurePrivateBucket,
  isRemoteStorageEnabled,
  listObjects,
  uploadObject,
} from './remote-storage';

const DATA_DIR = getDataDir();
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = getUploadsDir();
const MAX_BACKUPS = 10;
const MAX_REMOTE_BACKUPS = 20;
const REMOTE_BACKUP_SIZE_LIMIT = 50 * 1024 * 1024;
const AUTO_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export interface BackupInfo {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  recordCounts: {
    products: number;
    orders: number;
    users: number;
    reviews: number;
  };
  /** Where the snapshot survives: 'remote' (Supabase Storage) outlives deploys, 'local' does not. */
  location?: 'local' | 'remote' | 'local+remote';
}

class BackupServiceImpl {
  /** Create a timestamped backup of the current store */
  createBackup(label?: string): BackupInfo {
    // Ensure latest data is saved to disk
    saveDb();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    // The label is caller-supplied and ends up in a filename: reduce it to a
    // safe slug so it can never introduce path separators or `..` segments.
    const safeLabel = (label || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const filename = `${backupId}${safeLabel ? `-${safeLabel}` : ''}.json`;
    const backupPath = path.join(BACKUP_DIR, filename);
    if (path.dirname(path.resolve(backupPath)) !== path.resolve(BACKUP_DIR)) {
      throw new Error('Invalid backup label');
    }

    // Snapshot current store
    const snapshot = {
      _meta: {
        backupId,
        createdAt: new Date().toISOString(),
        label: safeLabel || null,
        uploadsManifest: this.getUploadsManifest(),
      },
      store: JSON.parse(JSON.stringify(db)),
    };

    fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), 'utf-8');

    // Rotate: keep only the newest MAX_BACKUPS
    this.rotateBackups();

    const stats = fs.statSync(backupPath);

    return {
      id: backupId,
      filename,
      createdAt: snapshot._meta.createdAt,
      sizeBytes: stats.size,
      recordCounts: {
        products: db.products?.length || 0,
        orders: db.orders?.length || 0,
        users: db.users?.length || 0,
        reviews: db.reviews?.length || 0,
      },
    };
  }

  /** List all available backups, newest first */
  listBackups(): BackupInfo[] {
    if (!fs.existsSync(BACKUP_DIR)) return [];

    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    return files.map((filename) => {
      const filePath = path.join(BACKUP_DIR, filename);
      const stats = fs.statSync(filePath);
      const id = filename.replace('.json', '');

      let createdAt = stats.mtime.toISOString();
      let recordCounts = { products: 0, orders: 0, users: 0, reviews: 0 };

      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed._meta?.createdAt) createdAt = parsed._meta.createdAt;
        if (parsed.store) {
          recordCounts = {
            products: parsed.store.products?.length || 0,
            orders: parsed.store.orders?.length || 0,
            users: parsed.store.users?.length || 0,
            reviews: parsed.store.reviews?.length || 0,
          };
        }
      } catch { /* skip metadata read errors */ }

      return { id, filename, createdAt, sizeBytes: stats.size, recordCounts };
    });
  }

  /** Restore the database from a specific backup */
  restoreBackup(
    backupId: string,
    options: { skipPreRestore?: boolean } = {},
  ): { success: boolean; restoredAt: string; recordCounts: any } {
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.includes(backupId));
    if (files.length === 0) {
      throw new Error(`Backup "${backupId}" not found`);
    }

    const backupPath = path.join(BACKUP_DIR, files[0]);
    const raw = fs.readFileSync(backupPath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed.store || typeof parsed.store !== 'object') {
      throw new Error('Invalid backup format: missing store data');
    }

    // Create a pre-restore backup first (safety net)
    if (!options.skipPreRestore) this.createBackup('pre-restore');

    // Restore: overwrite current db with backup data
    const storeKeys = Object.keys(parsed.store);
    for (const key of storeKeys) {
      (db as any)[key] = parsed.store[key];
    }

    // Persist restored data
    saveDb();

    // Rebuild indexes
    rebuildIndexes();

    const recordCounts = {
      products: db.products?.length || 0,
      orders: db.orders?.length || 0,
      users: db.users?.length || 0,
      reviews: db.reviews?.length || 0,
    };

    return {
      success: true,
      restoredAt: new Date().toISOString(),
      recordCounts,
    };
  }

  // ── Durable (off-box) backups ─────────────────────────────────────
  // The local backup directory sits on the API host's disk, which Render
  // wipes on every deploy/restart. With DATA_STORE=supabase each snapshot is
  // also copied to a private Supabase Storage bucket so it can be restored
  // after the container that took it is gone.

  /** Create a backup and, when remote storage is configured, upload it before returning. */
  async createBackupDurable(label?: string): Promise<BackupInfo> {
    const info = this.createBackup(label);
    if (!isRemoteStorageEnabled()) return { ...info, location: 'local' };

    const body = fs.readFileSync(path.join(BACKUP_DIR, info.filename), 'utf-8');
    await ensurePrivateBucket(BACKUP_BUCKET, REMOTE_BACKUP_SIZE_LIMIT);
    await uploadObject(BACKUP_BUCKET, info.filename, body, 'application/json');
    await this.pruneRemoteBackups();
    return { ...info, location: 'local+remote' };
  }

  /** Local and remote backups merged, newest first. */
  async listAllBackups(): Promise<BackupInfo[]> {
    const local = this.listBackups().map((b) => ({ ...b, location: 'local' as const }));
    if (!isRemoteStorageEnabled()) return local;

    const byFilename = new Map<string, BackupInfo>(local.map((b) => [b.filename, b]));
    for (const obj of await this.listRemoteBackups()) {
      const existing = byFilename.get(obj.name);
      if (existing) {
        existing.location = 'local+remote';
      } else {
        byFilename.set(obj.name, {
          id: obj.name.replace(/\.json$/, ''),
          filename: obj.name,
          createdAt: obj.createdAt,
          sizeBytes: obj.sizeBytes,
          recordCounts: { products: 0, orders: 0, users: 0, reviews: 0 },
          location: 'remote',
        });
      }
    }
    return [...byFilename.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Restore from a local backup, fetching it from remote storage first if this container never had it. */
  async restoreBackupDurable(backupId: string) {
    const localMatch = fs.readdirSync(BACKUP_DIR).some((f) => f.includes(backupId));
    if (!localMatch && isRemoteStorageEnabled()) {
      // Only names returned by the listing are fetched, never the raw id.
      const remote = (await this.listRemoteBackups()).find((o) => o.name.replace(/\.json$/, '') === backupId);
      if (remote) {
        const body = await downloadObject(BACKUP_BUCKET, remote.name);
        fs.writeFileSync(path.join(BACKUP_DIR, path.basename(remote.name)), body);
      }
    }
    // The safety-net snapshot must survive a redeploy too, so take it durably.
    await this.createBackupDurable('pre-restore');
    return this.restoreBackup(backupId, { skipPreRestore: true });
  }

  /** Newest remote backup's timestamp, or null when there is none. */
  async latestRemoteBackupAt(): Promise<Date | null> {
    const [newest] = await this.listRemoteBackups();
    return newest?.createdAt ? new Date(newest.createdAt) : null;
  }

  private async listRemoteBackups() {
    await ensurePrivateBucket(BACKUP_BUCKET, REMOTE_BACKUP_SIZE_LIMIT);
    const objects = await listObjects(BACKUP_BUCKET, '', 100);
    return objects.filter((o) => o.name.startsWith('backup-') && o.name.endsWith('.json'));
  }

  private async pruneRemoteBackups() {
    const objects = await this.listRemoteBackups();
    await deleteObjects(BACKUP_BUCKET, objects.slice(MAX_REMOTE_BACKUPS).map((o) => o.name));
  }

  /** Get upload files manifest for backup metadata */
  private getUploadsManifest(): { count: number; totalSizeBytes: number; files: string[] } {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return { count: 0, totalSizeBytes: 0, files: [] };
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    let totalSize = 0;
    for (const f of files) {
      try {
        totalSize += fs.statSync(path.join(UPLOADS_DIR, f)).size;
      } catch { /* skip */ }
    }

    return { count: files.length, totalSizeBytes: totalSize, files };
  }

  /** Keep only the newest MAX_BACKUPS files */
  private rotateBackups(): void {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
      .sort();

    while (files.length > MAX_BACKUPS) {
      const oldest = files.shift();
      if (oldest) {
        try {
          fs.unlinkSync(path.join(BACKUP_DIR, oldest));
        } catch { /* ignore deletion errors */ }
      }
    }
  }
}

// Singleton instance
export const backupService = new BackupServiceImpl();

/**
 * Takes an off-box backup at most once a day. Checked hourly rather than on a
 * fixed 24h timer because free-tier hosts sleep and restart often; the check
 * compares against the newest stored backup, so restarts don't multiply them.
 */
@Injectable()
export class BackupScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private timer: NodeJS.Timeout | null = null;
  private firstRun: NodeJS.Timeout | null = null;
  private running = false;

  onApplicationBootstrap() {
    if (!isRemoteStorageEnabled()) return;
    // Give boot-time hydration from Supabase time to finish before the first snapshot.
    this.firstRun = setTimeout(() => this.tick(), 5 * 60 * 1000);
    this.timer = setInterval(() => this.tick(), 60 * 60 * 1000);
    this.firstRun.unref?.();
    this.timer.unref?.();
  }

  onApplicationShutdown() {
    if (this.firstRun) clearTimeout(this.firstRun);
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const latest = await backupService.latestRemoteBackupAt();
      if (!latest || Date.now() - latest.getTime() >= AUTO_BACKUP_INTERVAL_MS) {
        const info = await backupService.createBackupDurable('auto-daily');
        console.log(`[Backup] Daily backup stored off-box: ${info.filename}`);
      }
    } catch (err) {
      console.error('[Backup] Automatic backup failed:', (err as Error).message);
    } finally {
      this.running = false;
    }
  }
}
