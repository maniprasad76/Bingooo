// ─────────────────────────────────────────────────────────
// Structured JSON Logger Service
// Writes access, error, and audit logs to data/logs/
// ─────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.resolve(process.cwd(), 'data', 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  userId?: string;
  duration?: number;
  ip?: string;
  userAgent?: string;
  error?: {
    code?: string;
    message?: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
}

class LoggerServiceImpl {
  private accessStream: fs.WriteStream;
  private errorStream: fs.WriteStream;

  constructor() {
    this.accessStream = fs.createWriteStream(path.join(LOG_DIR, 'access.log'), { flags: 'a' });
    this.errorStream = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });
  }

  /** Log an API access entry */
  logAccess(entry: LogEntry): void {
    const line = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      level: entry.level || 'info',
    });
    this.accessStream.write(line + '\n');
  }

  /** Log an error entry */
  logError(entry: LogEntry): void {
    const line = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      level: 'error',
    });
    this.errorStream.write(line + '\n');
    // Also log to console for immediate visibility
    console.error(`[ERROR] ${entry.method} ${entry.path} — ${entry.status} — ${entry.error?.message || 'Unknown error'}`);
  }

  /** Log a warning */
  logWarn(message: string, meta?: Record<string, unknown>): void {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...meta,
    });
    this.accessStream.write(line + '\n');
  }

  /** Get log file paths */
  getLogPaths() {
    return {
      access: path.join(LOG_DIR, 'access.log'),
      error: path.join(LOG_DIR, 'error.log'),
    };
  }

  /** Get recent log entries (tail) */
  getRecentLogs(type: 'access' | 'error', count = 50): LogEntry[] {
    const filePath = path.join(LOG_DIR, `${type}.log`);
    if (!fs.existsSync(filePath)) return [];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      const recent = lines.slice(-count);
      return recent.map((line) => {
        try { return JSON.parse(line); }
        catch { return { timestamp: '', level: 'error' as LogLevel, meta: { raw: line } }; }
      });
    } catch {
      return [];
    }
  }

  /** Get log file sizes */
  getLogStats() {
    const accessPath = path.join(LOG_DIR, 'access.log');
    const errorPath = path.join(LOG_DIR, 'error.log');
    return {
      accessLogSize: fs.existsSync(accessPath) ? fs.statSync(accessPath).size : 0,
      errorLogSize: fs.existsSync(errorPath) ? fs.statSync(errorPath).size : 0,
      logDirectory: LOG_DIR,
    };
  }
}

// Singleton instance
export const loggerService = new LoggerServiceImpl();
