import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyToken, isTokenRevoked } from '../utils/crypto.util';
import { db } from '../database/store';

/**
 * Validates authentication tokens and resolves caller's RBAC grants.
 * Supports:
 * 1. Backend-issued JWT tokens (via Bearer header or HTTP-only cookie)
 * 2. Supabase Auth tokens when service role key is present
 * 3. Local development admin token (only in non-production with explicit flag)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    let token: string | undefined;

    // Extract from Authorization header
    const authorization = request.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.slice(7).trim();
    }

    // Fallback: extract from HTTP-only cookie
    if (!token && (request as any).cookies?.access_token) {
      token = (request as any).cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required. Please provide a valid session token.',
      });
    }

    // Check if token has been revoked / logged out
    if (isTokenRevoked(token)) {
      throw new UnauthorizedException({
        code: 'SESSION_REVOKED',
        message: 'Your session has ended or was logged out. Please log in again.',
      });
    }

    // 1. Backend-issued JWT token
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
        token,
        jti: tokenPayload.jti,
      };
      return true;
    }

    // 2. Supabase Auth verification
    // Uses direct REST call to Supabase /auth/v1/user: zero-dependency, works in all Node/Docker
    // environments without WebSocket crashes or heavy client instantiation overhead.
    const supabaseUrl =
      process.env.SUPABASE_URL || 'https://zqmrmgwxhrdscippanuv.supabase.co';
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseKey,
          },
        });

        if (response.ok) {
          const authData = (await response.json()) as any;
          if (authData && authData.id) {
            let user = db.users.find(
              (u) => u.id === authData.id || u.email?.toLowerCase() === authData.email?.toLowerCase(),
            );
            if (!user && authData.email) {
              user = {
                id: authData.id,
                email: authData.email,
                full_name:
                  authData.user_metadata?.full_name ||
                  authData.user_metadata?.name ||
                  authData.email.split('@')[0],
                phone: authData.user_metadata?.phone || authData.phone || '',
                role: 'CUSTOMER',
                status: 'ACTIVE',
                password_hash: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              db.users.push(user);
            }

            const roleCode = user?.role || 'CUSTOMER';
            (request as any).user = {
              id: authData.id,
              email: authData.email,
              roles: [roleCode.toUpperCase()],
              permissions: roleCode === 'SUPER_ADMIN' ? ['*'] : ['orders.own', 'profile.own'],
              token,
            };
            return true;
          }
        }
      } catch {
        // Fall through to unauthorized exception
      }
    }

    throw new UnauthorizedException({
      code: 'AUTH_INVALID',
      message: 'Your session is invalid or has expired. Please log in again.',
    });
  }
}


