// ─────────────────────────────────────────────────────────
// Response Cache Interceptor
// Caches GET responses using in-memory TTL cache
// Automatically invalidates on mutating requests
// ─────────────────────────────────────────────────────────

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { cacheService } from '../services/cache.service';

export const CACHE_TTL_KEY = 'cache_ttl';

/**
 * Decorator to mark a controller method as cacheable.
 * @param ttlMs Time-to-live in milliseconds (default: 30000 = 30s)
 */
export const Cacheable = (ttlMs = 30000) => SetMetadata(CACHE_TTL_KEY, ttlMs);

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // On mutating requests, invalidate related cache entries
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const pathPrefix = this.extractResourcePrefix(request.url);
      if (pathPrefix) {
        cacheService.invalidatePrefix(pathPrefix);
      }
      return next.handle();
    }

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Check if handler has @Cacheable decorator
    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler());
    if (!ttl) {
      return next.handle();
    }

    // Build cache key from full URL (includes query params)
    const cacheKey = `api:${request.url}`;
    const cached = cacheService.get(cacheKey);

    if (cached !== null) {
      // Set header to indicate cache hit
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-Cache', 'HIT');
      return of(cached);
    }

    // Execute handler and cache the result
    return next.handle().pipe(
      tap((data) => {
        cacheService.set(cacheKey, data, ttl);
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Cache', 'MISS');
      }),
    );
  }

  /** Extract resource prefix from URL for cache invalidation */
  private extractResourcePrefix(url: string): string | null {
    // e.g. /api/v1/products/some-slug → api:/api/v1/products
    const match = url.match(/^(\/api\/v1\/[^/?]+)/);
    return match ? `api:${match[1]}` : null;
  }
}
