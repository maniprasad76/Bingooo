import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

/**
 * Generates a unique request ID for every request.
 * If the client sends X-Request-Id, it is preserved.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    // Attach to request object for downstream use
    (request as any).requestId = requestId;

    // Set response header
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-Request-Id', requestId);

    return next.handle();
  }
}
