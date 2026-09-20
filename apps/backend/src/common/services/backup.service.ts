// ─────────────────────────────────────────────────────────
// Backup & Restore Service
// Snapshots store.json + upload manifest with auto-rotation
// ─────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import { db, saveDb } from '../database/store';
import { rebuildIndexes } from '../database/db-index.service';
import { getDataDir, getUploadsDir } from '../utils/paths.util';

const DATA_DIR = getDataDir();
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = getUploadsDir();
const MAX_BACKUPS = 10;

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
}

class BackupServiceImpl {
  /** Create a timestamped backup of the current store */
  createBackup(label?: string): BackupInfo {
    // Ensure latest data is saved to disk
    saveDb();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const filename = `${backupId}${label ? `-${label}` : ''}.json`;
    const backupPath = path.join(BACKUP_DIR, filename);

    // Snapshot current store
    const snapshot = {
      _meta: {
        backupId,
        createdAt: new Date().toISOString(),
        label: label || null,
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
  restoreBackup(backupId: string): { success: boolean; restoredAt: string; recordCounts: any } {
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
    this.createBackup('pre-restore');

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
