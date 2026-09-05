import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../utils/crypto.util';
import { db } from '../database/store';

/**
 * Validates authentication tokens and resolves caller's RBAC grants.
 * Supports:
 * 1. Backend-issued JWT tokens
 * 2. Explicit local development admin token (bingooo-dev-admin)
 * 3. Supabase Auth tokens when service role key is present
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Invalid token',
      });
    }

    // 1. Dev admin token
    if (token === 'bingooo-dev-admin') {
      (request as any).user = {
        id: 'usr-admin-1',
        email: 'admin@bingooo.in',
        roles: ['SUPER_ADMIN', 'ADMIN'],
        permissions: ['*'],
      };
      return true;
    }

    // 2. Backend-issued JWT token
    const tokenPayload = verifyToken(token);
    if (tokenPayload) {
      const user = db.users.find((u) => u.id === tokenPayload.sub || u.email === tokenPayload.email);
      const roleCode = user?.role || tokenPayload.role || 'CUSTOMER';
      const roleObj = db.roles.find((r) => r.code === roleCode || r.name.toUpperCase() === roleCode.toUpperCase());

      (request as any).user = {
        id: user ? user.id : tokenPayload.sub,
        email: user ? user.email : tokenPayload.email,
        roles: [roleCode.toUpperCase()],
        permissions: roleObj?.permissions || (roleCode === 'SUPER_ADMIN' ? ['*'] : ['orders.own', 'profile.own']),
      };
      return true;
    }

    // 3. Supabase Auth fallback if configured
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data: authData, error: authError } = await supabase.auth.getUser(token);
        if (!authError && authData.user) {
          (request as any).user = {
            id: authData.user.id,
            email: authData.user.email,
            roles: ['CUSTOMER'],
            permissions: ['orders.own', 'profile.own'],
          };
          return true;
        }
      } catch {
        // Continue to unauthorized exception
      }
    }

    throw new UnauthorizedException({
      code: 'AUTH_REQUIRED',
      message: 'Your session is invalid or has expired.',
    });
  }
}

