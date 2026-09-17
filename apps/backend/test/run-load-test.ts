import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { RequestIdInterceptor } from '../src/common/interceptors/request-id.interceptor';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { CacheInterceptor } from '../src/common/interceptors/cache.interceptor';

interface RequestMetric {
  url: string;
  durationMs: number;
  status: number;
  cacheStatus?: string;
  success: boolean;
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function runLoadTest() {
  console.log('\n======================================================');
  console.log('⚡ BINGOOO CONCURRENT LOAD & CACHE VERIFICATION TEST');
  console.log('======================================================\n');

  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(helmet());
  app.use(cookieParser());
  app.use(compression({ threshold: 1024 }));

  app.setGlobalPrefix('api/v1', {
    exclude: ['api/create-order', 'api/verify-payment'],
  });

  const reflector = app.get(Reflector);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
    new CacheInterceptor(reflector),
    new ResponseInterceptor(),
  );

  const TEST_PORT = 3995;
  await app.listen(TEST_PORT);
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

  const metrics: RequestMetric[] = [];

  async function makeRequest(endpoint: string): Promise<RequestMetric> {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      const durationMs = performance.now() - start;
      const cacheStatus = res.headers.get('x-cache') || 'NONE';
      return {
        url: endpoint,
        durationMs,
        status: res.status,
        cacheStatus,
        success: res.ok,
      };
    } catch (err: any) {
      const durationMs = performance.now() - start;
      return {
        url: endpoint,
        durationMs,
        status: 0,
        cacheStatus: 'ERROR',
        success: false,
      };
    }
  }

  try {
    // 1. Warm-up & Cache priming
    console.log('--- Phase 1: Priming In-Memory Cache ---');
    const warmEndpoints = ['/products', '/categories', '/collections', '/banners'];
    for (const ep of warmEndpoints) {
      const first = await makeRequest(ep);
      const second = await makeRequest(ep);
      console.log(`  ${ep}: 1st=${first.durationMs.toFixed(1)}ms (${first.cacheStatus}) | 2nd=${second.durationMs.toFixed(1)}ms (${second.cacheStatus})`);
    }

    // 2. High Concurrency Test: 60 Simultaneous Users
    console.log('\n--- Phase 2: 60 Simultaneous Users (Mixed Read Endpoints) ---');
    const endpoints = [
      '/products',
      '/products?categorySlug=t-shirts',
      '/categories',
      '/collections',
      '/banners',
      '/health',
      '/health/live',
      '/health/ready',
    ];

    const concurrentUsers = 60;
    const tasks: Promise<RequestMetric>[] = [];

    const startTime = performance.now();
    for (let i = 0; i < concurrentUsers; i++) {
      const target = endpoints[i % endpoints.length];
      tasks.push(makeRequest(target));
    }

    const batchResults = await Promise.all(tasks);
    const totalTimeMs = performance.now() - startTime;
    metrics.push(...batchResults);

    // Analyze results
    const durations = batchResults.map((m) => m.durationMs);
    const successCount = batchResults.filter((m) => m.success).length;
    const cacheHits = batchResults.filter((m) => m.cacheStatus === 'HIT').length;

    const p50 = percentile(durations, 50);
    const p90 = percentile(durations, 90);
    const p95 = percentile(durations, 95);
    const p99 = percentile(durations, 99);
    const rps = (concurrentUsers / (totalTimeMs / 1000)).toFixed(1);

    console.log(`\n📊 LOAD TEST RESULTS:`);
    console.log(`  Total Requests:     ${concurrentUsers}`);
    console.log(`  Successful (2xx):   ${successCount} / ${concurrentUsers} (${((successCount / concurrentUsers) * 100).toFixed(0)}%)`);
    console.log(`  Cache Hits:         ${cacheHits} / ${concurrentUsers}`);
    console.log(`  Throughput:         ${rps} req/sec`);
    console.log(`  Total Wall Time:    ${totalTimeMs.toFixed(1)}ms`);
    console.log(`  Latency P50:        ${p50.toFixed(2)}ms`);
    console.log(`  Latency P90:        ${p90.toFixed(2)}ms`);
    console.log(`  Latency P95:        ${p95.toFixed(2)}ms`);
    console.log(`  Latency P99:        ${p99.toFixed(2)}ms`);

    // Verification asserts
    let passed = true;
    if (successCount < concurrentUsers) {
      console.error(`❌ [FAIL] Expected 100% success rate, got ${successCount}/${concurrentUsers}`);
      passed = false;
    } else {
      console.log(`✅ [PASS] 100% of simultaneous user requests succeeded`);
    }

    if (p95 > 300) {
      console.error(`❌ [FAIL] P95 latency exceeded 300ms threshold: ${p95.toFixed(2)}ms`);
      passed = false;
    } else {
      console.log(`✅ [PASS] P95 latency under 300ms SLA: ${p95.toFixed(2)}ms`);
    }

    if (cacheHits > 0) {
      console.log(`✅ [PASS] Repeat requests successfully served from in-memory cache`);
    } else {
      console.warn(`⚠️ [WARN] No cache hits detected`);
    }

    console.log('\n======================================================');
    if (passed) {
      console.log('🎉 LOAD TEST COMPLETED SUCCESSFULLY');
    } else {
      console.error('💥 LOAD TEST DETECTED ISSUES');
    }
    console.log('======================================================\n');
  } finally {
    await app.close();
  }
}

runLoadTest().catch((err) => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
