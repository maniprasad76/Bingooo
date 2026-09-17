// ─────────────────────────────────────────────────────────
// Request/Response Logging Interceptor
// Logs every request with timing, status, and user context
// ─────────────────────────────────────────────────────────

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { loggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const requestId = request.requestId || request.headers['x-request-id'] || 'unknown';
    const userId = request.user?.id || request.user?.sub || undefined;
    const method = request.method;
    const url = request.url;
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const userAgent = request.headers['user-agent'] || '';

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const status = response.statusCode;

        loggerService.logAccess({
          timestamp: new Date().toISOString(),
          level: status >= 400 ? 'warn' : 'info',
          requestId,
          method,
          path: url,
          status,
          userId,
          duration,
          ip,
          userAgent,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const status = error?.status || error?.getStatus?.() || 500;

        loggerService.logError({
          timestamp: new Date().toISOString(),
          level: 'error',
          requestId,
          method,
          path: url,
          status,
          userId,
          duration,
          ip,
          userAgent,
          error: {
            code: error?.response?.code || error?.code || 'INTERNAL_ERROR',
            message: error?.message || 'Unknown error',
            stack: status >= 500 ? error?.stack : undefined,
          },
        });

        return throwError(() => error);
      }),
    );
  }
}
