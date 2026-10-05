import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';
import { verifyToken, isTokenRevoked } from '../utils/crypto.util';
import { db, saveDb } from '../database/store';

const SUPABASE_FETCH_TIMEOUT_MS = 8000;

// Supabase sessions are verified with a network call to Supabase. Without a
// cache, every request in a flow (e.g. checkout's create-order then
// create-payment) depends on that call, and one slow response logged the
// customer out mid-checkout. Confirmed sessions are reused briefly, never past
// the token's own expiry; revocation and account status are still checked on
// every request.
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000;
const SESSION_CACHE_MAX = 5000;
const verifiedSessions = new Map<string, { authData: any; expiresAt: number }>();

function tokenExpiryMs(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/**
 * Returns the Supabase user for a token, null when Supabase says the token is
 * invalid, and throws 503 when Supabase can't be reached — a network problem
 * must not be reported to the customer as "your session expired".
 */
async function resolveSupabaseUser(token: string, supabaseUrl: string, supabaseKey: string): Promise<any | null> {
  const cacheKey = createHash('sha256').update(token).digest('hex');
  const cached = verifiedSessions.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.authData;
  if (cached) verifiedSessions.delete(cacheKey);

  let response: globalThis.Response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey },
      signal: AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    console.error('[Auth] Supabase session check failed:', (err as Error).message);
    throw new ServiceUnavailableException({
      code: 'AUTH_PROVIDER_UNAVAILABLE',
      message: "We couldn't verify your sign-in just now. Please try again in a moment.",
    });
  }
  if (!response.ok) return null;

  const authData = (await response.json()) as any;
  if (!authData?.id) return null;

  const exp = tokenExpiryMs(token);
  const expiresAt = Math.min(Date.now() + SESSION_CACHE_TTL_MS, exp || Date.now() + SESSION_CACHE_TTL_MS);
  if (expiresAt > Date.now()) {
    if (verifiedSessions.size >= SESSION_CACHE_MAX) {
      const oldest = verifiedSessions.keys().next().value;
      if (oldest) verifiedSessions.delete(oldest);
    }
    verifiedSessions.set(cacheKey, { authData, expiresAt });
  }
  return authData;
}

/** Super-admin emails come only from the ADMIN_EMAILS env var (comma-separated). */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Suspended/disabled accounts must not authenticate, whatever token they hold. */
function isActiveUser(user: any): boolean {
  return !user.status || String(user.status).toLowerCase() === 'active';
}

function rejectInactive(): never {
  throw new UnauthorizedException({
    code: 'ACCOUNT_DISABLED',
    message: 'This account has been disabled. Please contact support.',
  });
}

/**
 * Validates authentication tokens and resolves caller's RBAC grants.
 * Supports:
 * 1. Backend-issued JWT tokens (via Bearer header or HTTP-only cookie)
 * 2. Supabase Auth tokens when service role key is present
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
      // Roles always come from the stored user, never from the token claim, so
      // a deleted account cannot keep acting on a still-unexpired token.
      const user = db.users.find((u) => u.id === tokenPayload.sub);
      if (!user) {
        throw new UnauthorizedException({
          code: 'AUTH_INVALID',
          message: 'Your session is invalid or has expired. Please log in again.',
        });
      }
      if (!isActiveUser(user)) rejectInactive();

      // A password change/reset invalidates every token issued before it.
      const changedAt = user.password_changed_at ? Date.parse(user.password_changed_at) : NaN;
      if (!Number.isNaN(changedAt) && (tokenPayload.iat ?? 0) < Math.floor(changedAt / 1000)) {
        throw new UnauthorizedException({
          code: 'SESSION_REVOKED',
          message: 'Your password was changed. Please log in again.',
        });
      }

      const roleCode = user.role || 'CUSTOMER';
      const roleObj = db.roles.find((r) => r.code === roleCode || r.name.toUpperCase() === roleCode.toUpperCase());

      (request as any).user = {
        id: user.id,
        email: user.email,
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
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const authData = await resolveSupabaseUser(token, supabaseUrl, supabaseKey);
      if (authData) {
        const userEmail = (authData.email || '').toLowerCase().trim();
        // An email only proves identity once Supabase has confirmed it.
        // Without this, anyone could register an admin's (or customer's)
        // address and inherit that account or super-admin rights.
        const emailConfirmed = Boolean(authData.email_confirmed_at);
        const isAuthorizedSuperAdmin =
          emailConfirmed && Boolean(userEmail) && getAdminEmails().includes(userEmail);

        let user = db.users.find((u) => u.id === authData.id);
        if (!user && userEmail) {
          const emailMatch = db.users.find((u) => u.email?.toLowerCase() === userEmail);
          if (emailMatch && !emailConfirmed) {
            throw new UnauthorizedException({
              code: 'EMAIL_NOT_CONFIRMED',
              message: 'Please confirm your email address before signing in.',
            });
          }
          user = emailMatch;
        }
        if (user && !isActiveUser(user)) rejectInactive();

        if (!user && authData.email) {
          user = {
            id: authData.id,
            email: authData.email,
            full_name:
              authData.user_metadata?.full_name ||
              authData.user_metadata?.name ||
              authData.email.split('@')[0],
            phone: authData.user_metadata?.phone || authData.phone || '',
            role: isAuthorizedSuperAdmin ? 'SUPER_ADMIN' : 'CUSTOMER',
            status: 'ACTIVE',
            password_hash: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          db.users.push(user);
          saveDb();
        } else if (user && isAuthorizedSuperAdmin && user.role !== 'SUPER_ADMIN') {
          user.role = 'SUPER_ADMIN';
          user.updated_at = new Date().toISOString();
          saveDb();
        }

        const roleCode = user?.role || (isAuthorizedSuperAdmin ? 'SUPER_ADMIN' : 'CUSTOMER');
        const roleObj = db.roles.find(
          (r) => r.code === roleCode || r.name.toUpperCase() === roleCode.toUpperCase(),
        );

        (request as any).user = {
          id: authData.id,
          email: authData.email,
          roles: [roleCode.toUpperCase()],
          permissions:
            roleCode === 'SUPER_ADMIN'
              ? ['*']
              : roleObj?.permissions || ['orders.own', 'profile.own'],
          token,
        };
        return true;
      }
    }

    throw new UnauthorizedException({
      code: 'AUTH_INVALID',
      message: 'Your session is invalid or has expired. Please log in again.',
    });
  }
}


