import * as fs from 'fs';
import * as path from 'path';

const IS_VERCEL = !!process.env.VERCEL;

/**
 * Resolves a backend path reliably whether running from:
 * - repository root (`c:/.../bingooo`)
 * - backend package root (`c:/.../bingooo/apps/backend`)
 * - compiled output directory (`apps/backend/dist`)
 * - Vercel serverless environment
 */
export function resolveBackendPath(...subpaths: string[]): string {
  if (IS_VERCEL) {
    return path.resolve('/tmp', ...subpaths);
  }

  // 1. If running from repository root (e.g. npm run dev:api)
  const rootBackendPath = path.resolve(process.cwd(), 'apps', 'backend', ...subpaths);
  const rootBackendDir = path.resolve(process.cwd(), 'apps', 'backend');
  if (fs.existsSync(rootBackendPath) || fs.existsSync(rootBackendDir)) {
    return rootBackendPath;
  }

  // 2. If running inside apps/backend (e.g. npm run dev inside apps/backend)
  const localPath = path.resolve(process.cwd(), ...subpaths);
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  // 3. Relative to this file location (apps/backend/src/common/utils/ -> apps/backend)
  const moduleRelative = path.resolve(__dirname, '..', '..', '..', ...subpaths);
  if (fs.existsSync(moduleRelative)) {
    return moduleRelative;
  }

  return localPath;
}

export function getDataDir(): string {
  const dir = resolveBackendPath('data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignored for read-only environments
    }
  }
  return dir;
}

export function getUploadsDir(): string {
  const dir = resolveBackendPath('uploads');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignored for read-only environments
    }
  }
  return dir;
}

export function getLogsDir(): string {
  const dir = IS_VERCEL ? path.resolve('/tmp', 'logs') : path.join(getDataDir(), 'logs');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // Ignored for read-only environments
    }
  }
  return dir;
}
