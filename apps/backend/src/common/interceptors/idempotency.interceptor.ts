import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Response, Request } from 'express';
import { idempotencyService } from '../services/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // Only apply to state-modifying methods
    const method = req.method.toUpperCase();
    if (method !== 'POST' && method !== 'PATCH' && method !== 'PUT') {
      return next.handle();
    }

    const idempotencyKey = (
      req.headers['x-idempotency-key'] ||
      req.headers['idempotency-key']
    ) as string | undefined;

    // If no idempotency key provided, proceed normally
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
      return next.handle();
    }

    const cleanKey = idempotencyKey.trim();

    // Check if response is already cached
    const cached = idempotencyService.get(cleanKey);
    if (cached) {
      if (cached.inFlight) {
        throw new ConflictException({
          code: 'IDEMPOTENT_OPERATION_IN_PROGRESS',
          message: 'An identical request is currently processing. Please wait a moment.',
        });
      }

      res.setHeader('X-Cache-Lookup', 'HIT');
      res.setHeader('X-Idempotency-Key', cleanKey);
      if (cached.statusCode) {
        res.status(cached.statusCode);
      }
      return of(cached.data);
    }

    // Try to acquire in-flight lock
    const acquired = idempotencyService.acquireLock(cleanKey);
    if (!acquired) {
      throw new ConflictException({
        code: 'IDEMPOTENT_OPERATION_IN_PROGRESS',
        message: 'An identical request is currently processing. Please wait a moment.',
      });
    }

    res.setHeader('X-Cache-Lookup', 'MISS');
    res.setHeader('X-Idempotency-Key', cleanKey);

    return next.handle().pipe(
      tap((data) => {
        idempotencyService.set(cleanKey, res.statusCode || 200, data);
      }),
      catchError((err) => {
        idempotencyService.releaseLock(cleanKey);
        throw err;
      }),
    );
  }
}
