// ─────────────────────────────────────────────────────────
// Admin API client — connects to the shared NestJS backend
// ─────────────────────────────────────────────────────────

const configuredApiUrl = (import.meta as any).env?.VITE_API_URL?.trim().replace(/\/$/, '');
const API_BASE = configuredApiUrl ? `${configuredApiUrl}/api/v1` : '/api/v1';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ReqOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T = unknown>(path: string, opts: ReqOptions = {}): Promise<T> {
  const { body, params, ...init } = opts;

  let url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.append(k, String(v));
    });
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const token = localStorage.getItem('bingooo_auth_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return null as T;
  }

  const text = await res.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok || (json && json.success === false)) {
    throw new ApiError(
      res.status,
      json?.error?.code || 'UNKNOWN',
      json?.error?.message || res.statusText || 'Request failed',
    );
  }

  return (json?.data !== undefined ? json.data : json) as T;
}

export const api = {
  get: <T = unknown>(path: string, params?: Record<string, any>) =>
    request<T>(path, { method: 'GET', params }),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),
  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
  upload: async (file: File, category = 'products'): Promise<{ url: string; name?: string; id?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const token = localStorage.getItem('bingooo_auth_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new ApiError(
        res.status,
        json.error?.code || 'UPLOAD_FAILED',
        json.error?.message || 'Failed to upload image',
      );
    }
    return json.data || json;
  },
};
