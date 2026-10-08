import * as crypto from 'crypto';
import { db, saveDb } from '../database/store';

// JWT signing secret must come from the environment. There is no hardcoded
// fallback: a public fallback secret would let anyone forge valid session
// tokens (including SUPER_ADMIN tokens) for this API. Fail fast on use
// instead of silently signing with a known-public value.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required and must not be empty. ' +
        'Refusing to start without a real signing secret.',
    );
  }
  return secret;
}

// ── Session revocation ──────────────────────────────────────────────
// Logged-out tokens live in db.revoked_tokens, which is saved with the rest of
// the store (and mirrored to Supabase in production), so a restart or redeploy
// cannot revive a session the user ended. Only SHA-256 digests are stored.
// Entries are dropped once the token would have expired anyway.

/** Longest session this API issues (7 days) plus a margin, for entries without a readable exp. */
const REVOCATION_TTL_MS = 8 * 24 * 60 * 60 * 1000;

const revocationId = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

/** Lookup cache over db.revoked_tokens; rebuilt whenever the array is replaced (e.g. on boot hydration). */
let cachedList: any[] | null = null;
let cachedExpiry = new Map<string, number>();

function revocations(): Map<string, number> {
  const list: any[] = Array.isArray(db.revoked_tokens) ? db.revoked_tokens : (db.revoked_tokens = []);
  if (list !== cachedList) {
    cachedList = list;
    cachedExpiry = new Map(list.map((e: any) => [String(e.id), Date.parse(e.expires_at) || 0]));
  }
  return cachedExpiry;
}

function jwtParts(value: string): { exp?: number; jti?: string } {
  const parts = value.split('.');
  if (parts.length !== 3) return {};
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return { exp: typeof payload.exp === 'number' ? payload.exp * 1000 : undefined, jti: typeof payload.jti === 'string' ? payload.jti : undefined };
  } catch {
    return {};
  }
}

export function revokeToken(tokenIdOrToken: string): void {
  if (!tokenIdOrToken) return;
  const now = Date.now();
  const { exp, jti } = jwtParts(tokenIdOrToken);
  const expiresAt = exp && exp > now ? exp : now + REVOCATION_TTL_MS;

  // Drop entries that can no longer match a live token.
  db.revoked_tokens = (Array.isArray(db.revoked_tokens) ? db.revoked_tokens : []).filter(
    (e: any) => (Date.parse(e.expires_at) || 0) > now,
  );
  for (const value of jti ? [tokenIdOrToken, jti] : [tokenIdOrToken]) {
    const id = revocationId(value);
    if (!db.revoked_tokens.some((e: any) => e.id === id)) {
      db.revoked_tokens.push({ id, expires_at: new Date(expiresAt).toISOString(), revoked_at: new Date(now).toISOString() });
    }
  }
  saveDb();
}

export function isTokenRevoked(tokenIdOrToken: string): boolean {
  if (!tokenIdOrToken) return false;
  const expiresAt = revocations().get(revocationId(tokenIdOrToken));
  return expiresAt !== undefined && expiresAt > Date.now();
}

/**
 * Derives password hash using PBKDF2-HMAC-SHA512 with 100,000 iterations.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

/**
 * Verifies password against hash using timing-safe comparison to prevent timing attacks.
 * Backward compatible with legacy salt:hash format.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  try {
    if (storedHash.startsWith('pbkdf2$100000$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 4) return false;
      const [, , salt, key] = parts;
      const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      const keyBuf = Buffer.from(key, 'hex');
      const compBuf = Buffer.from(computedHash, 'hex');
      if (keyBuf.length !== compBuf.length) return false;
      return crypto.timingSafeEqual(keyBuf, compBuf);
    }

    // Legacy format salt:key fallback (1000 iterations)
    if (storedHash.includes(':')) {
      const [salt, key] = storedHash.split(':');
      if (!salt || !key) return false;
      const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      const keyBuf = Buffer.from(key, 'hex');
      const compBuf = Buffer.from(computedHash, 'hex');
      if (keyBuf.length !== compBuf.length) return false;
      return crypto.timingSafeEqual(keyBuf, compBuf);
    }
  } catch {
    return false;
  }

  return false;
}

export function generateToken(payload: { userId: string; email: string; role: string; jti?: string }): {
  token: string;
  jti: string;
  expiresIn: number;
} {
  const jti = payload.jti || crypto.randomUUID();
  const expiresIn = 60 * 60 * 24 * 7; // 7 days in seconds

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      jti,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    }),
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${body}`)
    .digest('base64url');

  return {
    token: `${header}.${body}.${signature}`,
    jti,
    expiresIn,
  };
}

export function verifyToken(
  token: string,
): { sub: string; email: string; role: string; jti?: string; iat?: number; exp: number } | null {
  try {
    if (isTokenRevoked(token)) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    // Every token this server issues carries `exp`; one without it is not ours.
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.jti && isTokenRevoked(payload.jti)) return null;

    return payload;
  } catch {
    return null;
  }
}

