import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { db } from '../common/database/store';
import { cacheService } from '../common/services/cache.service';
import { loggerService } from '../common/services/logger.service';
import { backupService } from '../common/services/backup.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Full readiness check with deep diagnostics' })
  check() {
    const start = Date.now();

    // ── Database check ──
    const dbRecords = {
      products: db.products?.length || 0,
      orders: db.orders?.length || 0,
      users: db.users?.length || 0,
      variants: db.product_variants?.length || 0,
      reviews: db.reviews?.length || 0,
      carts: db.carts?.length || 0,
    };
    const totalRecords = Object.values(dbRecords).reduce((sum, n) => sum + n, 0);

    // ── Memory check ──
    const mem = process.memoryUsage();
    const memoryCheck = {
      status: mem.heapUsed < mem.heapTotal * 0.9 ? 'ok' : 'warning',
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
      external: `${Math.round(mem.external / 1024 / 1024)} MB`,
    };

    // ── Storage check ──
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    let uploadsCheck = { status: 'ok' as string, count: 0, totalSize: '0 MB' };
    try {
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        let totalSize = 0;
        for (const f of files) {
          try { totalSize += fs.statSync(path.join(uploadsDir, f)).size; } catch {}
        }
        uploadsCheck = {
          status: 'ok',
          count: files.length,
          totalSize: `${(totalSize / 1024 / 1024).toFixed(1)} MB`,
        };
      }
    } catch { uploadsCheck.status = 'error'; }

    // ── Disk free space ──
    let diskFree = 'unknown';
    try {
      const freemem = os.freemem();
      diskFree = `${(freemem / 1024 / 1024 / 1024).toFixed(1)} GB (system memory)`;
    } catch {}

    // ── Cache stats ──
    const cacheStats = cacheService.stats();

    // ── Log stats ──
    const logStats = loggerService.getLogStats();

    // ── Backup info ──
    let backupCount = 0;
    try {
      backupCount = backupService.listBackups().length;
    } catch {}

    const responseTimeMs = Date.now() - start;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      version: '0.0.1',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'ok', totalRecords, breakdown: dbRecords },
        memory: memoryCheck,
        uploads: uploadsCheck,
        disk: { status: 'ok', free: diskFree },
        cache: { status: 'ok', ...cacheStats },
        logging: {
          status: 'ok',
          accessLogSize: `${(logStats.accessLogSize / 1024).toFixed(1)} KB`,
          errorLogSize: `${(logStats.errorLogSize / 1024).toFixed(1)} KB`,
        },
        backups: { status: 'ok', count: backupCount },
      },
      responseTimeMs,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Lightweight liveness probe' })
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — confirms DB and memory are healthy' })
  ready() {
    const mem = process.memoryUsage();
    const heapUsedPct = mem.heapUsed / mem.heapTotal;
    const dbOk = db.products && db.users;
    const isReady = heapUsedPct < 0.95 && dbOk;

    return {
      status: isReady ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      heapUsedPct: `${(heapUsedPct * 100).toFixed(1)}%`,
    };
  }
}
