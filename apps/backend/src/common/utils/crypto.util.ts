import * as crypto from 'crypto';

// In-memory token revocation blacklist (persists across active sessions)
const revokedTokens = new Set<string>();

export function revokeToken(tokenIdOrToken: string): void {
  if (!tokenIdOrToken) return;
  revokedTokens.add(tokenIdOrToken);
}

export function isTokenRevoked(tokenIdOrToken: string): boolean {
  if (!tokenIdOrToken) return false;
  return revokedTokens.has(tokenIdOrToken);
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

  const secret = process.env.JWT_SECRET || 'bingooo-super-secret-jwt-key-2026';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return {
    token: `${header}.${body}.${signature}`,
    jti,
    expiresIn,
  };
}

export function verifyToken(token: string): { sub: string; email: string; role: string; jti?: string } | null {
  try {
    if (isTokenRevoked(token)) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const secret = process.env.JWT_SECRET || 'bingooo-super-secret-jwt-key-2026';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.jti && isTokenRevoked(payload.jti)) return null;

    return payload;
  } catch {
    return null;
  }
}

