// ─────────────────────────────────────────────────────────
// Typed API client for NestJS backend
// Handles auth token injection, query params, standard error parsing,
// timeouts, auto-retries with exponential backoff, and idempotency keys
// ─────────────────────────────────────────────────────────

/**
 * The Vite proxy is used in local development. A deployed storefront can set
 * VITE_API_URL to point at its API without changing any application code.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');
const API_BASE = configuredApiUrl ? `${configuredApiUrl}/api/v1` : '/api/v1';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  raw?: boolean;
  timeoutMs?: number;
  retries?: number;
  idempotencyKey?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;
  requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

/** Retrieve guest session ID or create one if not stored */
export function getGuestSessionId(): string {
  let sessionId = localStorage.getItem('bingooo_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('bingooo_session_id', sessionId);
  }
  return sessionId;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function executeFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    params,
    raw,
    timeoutMs = 35000,
    idempotencyKey,
    ...init
  } = options;

  let url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  headers.set('x-session-id', getGuestSessionId());

  if (idempotencyKey) {
    headers.set('X-Idempotency-Key', idempotencyKey);
  }

  const token = localStorage.getItem('bingooo_auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (raw) {
      return response as unknown as T;
    }

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const isRateLimited = response.status === 429;
      const errorCode = json.error?.code || (isRateLimited ? 'RATE_LIMITED' : 'UNKNOWN');
      const errorMessage = isRateLimited
        ? 'Too many requests. Please slow down and wait a few seconds before trying again.'
        : json.error?.message || response.statusText;

      throw new ApiError(
        response.status,
        errorCode,
        errorMessage,
        json.error?.details,
        json.requestId,
      );
    }

    return json.data as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new ApiError(
        408,
        'REQUEST_TIMEOUT',
        'Request timed out. Please check your internet connection and try again.',
      );
    }
    throw err;
  }
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method?.toUpperCase() || 'GET';
  const defaultRetries = method === 'GET' ? 2 : 0;
  const maxRetries = options.retries !== undefined ? options.retries : defaultRetries;

  let attempt = 0;
  while (true) {
    try {
      return await executeFetch<T>(path, options);
    } catch (err: any) {
      attempt++;
      const isNetworkOr5xx =
        !err.status ||
        err.status >= 500 ||
        err.code === 'REQUEST_TIMEOUT' ||
        err.name === 'TypeError';

      if (attempt <= maxRetries && isNetworkOr5xx) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

export const api = {
  get: <T = unknown>(path: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET', params }),

  post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  upload: <T = unknown>(path: string, formData: FormData, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: formData }),

  patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  delete: <T = unknown>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
