import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp.code as string) || mapStatusToCode(status);
        message = (resp.message as string) || exception.message;
        details = resp.details as Record<string, unknown>;

        // Handle class-validator errors
        if (Array.isArray(resp.message)) {
          code = 'VALIDATION_ERROR';
          message = 'Validation failed';
          details = { errors: resp.message };
        }
      } else {
        message = String(exceptionResponse);
        code = mapStatusToCode(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log server errors
    if (status >= 500) {
      console.error(`[${request.method}] ${request.url} — ${status}`, exception);
    }

    const requestId = (request as any).requestId as string || 'unknown';

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      requestId,
    });
  }
}

function mapStatusToCode(status: number): string {
  switch (status) {
    case 400: return 'VALIDATION_ERROR';
    case 401: return 'AUTH_REQUIRED';
    case 403: return 'FORBIDDEN';
    case 404: return 'PRODUCT_NOT_FOUND';
    case 429: return 'RATE_LIMITED';
    default: return 'INTERNAL_ERROR';
  }
}
