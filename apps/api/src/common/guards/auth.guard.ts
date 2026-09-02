import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Auth guard that validates Supabase JWT.
 * Phase 1: accepts any Bearer token and sets a mock user.
 * TODO: Replace with real Supabase JWT verification.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
    }

    const token = authorization.slice(7);

    if (!token) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Invalid token',
      });
    }

    // TODO: Verify JWT with Supabase
    // const { data, error } = await supabase.auth.getUser(token);
    // For now, set mock user
    (request as any).user = {
      id: 'mock-user-id',
      email: 'user@example.com',
      roles: ['CUSTOMER'],
      permissions: [],
    };

    return true;
  }
}
