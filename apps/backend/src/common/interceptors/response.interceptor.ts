import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

/**
 * Wraps all successful responses in the standard API envelope:
 * { success: true, data: ..., meta?: ..., requestId: ... }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request as any).requestId as string || 'unknown';

    return next.handle().pipe(
      map((data) => {
        // If the controller already returned the wrapped shape, ensure top-level and data are present
        if (data && typeof data === 'object' && 'success' in data) {
          if (!('data' in data)) {
            return {
              ...data,
              data,
              requestId,
            };
          }
          return data;
        }

        // Extract meta if the service returned { data, meta }
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
            requestId,
          };
        }

        return {
          success: true,
          ...(data && typeof data === 'object' && !Array.isArray(data) ? data : {}),
          data: data ?? null,
          requestId,
        };
      }),
    );
  }
}
