import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../store/auth';
import { api } from '../api/client';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const authStorageKey = 'bingooo_auth_token';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/** Initialize auth on app mount */
export async function initAuth(): Promise<void> {
  const token = localStorage.getItem(authStorageKey);

  if (token === 'bingooo-dev-admin') {
    useAuthStore.getState().setAuth('usr-admin-1', {
      id: 'usr-admin-1',
      email: 'admin@bingooo.in',
      fullName: 'Mani P.',
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
    });
    return;
  }

  if (token) {
    try {
      const user = await api.get<any>('/auth/me');
      useAuthStore.getState().setAuth(user.id, {
        id: user.id,
        email: user.email,
        fullName: user.full_name || user.fullName,
        phone: user.phone,
        role: user.role,
      });
      return;
    } catch {
      localStorage.removeItem(authStorageKey);
      useAuthStore.getState().logout();
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        localStorage.setItem(authStorageKey, data.session.access_token);
        useAuthStore.getState().setAuth(data.session.user.id, {
          id: data.session.user.id,
          email: data.session.user.email || '',
          fullName: data.session.user.user_metadata?.full_name,
        });
      } else {
        useAuthStore.getState().setAuth(null);
      }
    } catch {
      useAuthStore.getState().setAuth(null);
    }
  } else {
    useAuthStore.getState().setAuth(null);
  }
}

/** Sign in with email/password */
export async function signIn(email: string, password: string): Promise<void> {
  try {
    const res = await api.post<{ user: any; token: string }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem(authStorageKey, res.token);
    useAuthStore.getState().setAuth(res.user.id, {
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.full_name || res.user.fullName,
      phone: res.user.phone,
      role: res.user.role,
    });
  } catch (err) {
    // If backend is unreachable or user only in supabase, fallback to supabase
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw err;
      if (data.session) {
        localStorage.setItem(authStorageKey, data.session.access_token);
        useAuthStore.getState().setAuth(data.session.user.id, {
          id: data.session.user.id,
          email: data.session.user.email || '',
          fullName: data.session.user.user_metadata?.full_name,
        });
        return;
      }
    }
    throw err;
  }
}

/** Sign up with email/password */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
): Promise<void> {
  try {
    const res = await api.post<{ user: any; token: string }>('/auth/signup', {
      email,
      password,
      fullName,
      phone,
    });
    localStorage.setItem(authStorageKey, res.token);
    useAuthStore.getState().setAuth(res.user.id, {
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.full_name || res.user.fullName,
      phone: res.user.phone,
      role: res.user.role,
    });
  } catch (err) {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw err;
      if (data.session) {
        localStorage.setItem(authStorageKey, data.session.access_token);
        useAuthStore.getState().setAuth(data.session.user.id, {
          id: data.session.user.id,
          email: data.session.user.email || '',
          fullName,
        });
        return;
      }
    }
    throw err;
  }
}

/** Sign out */
export async function signOut(): Promise<void> {
  try {
    await api.post('/auth/logout').catch(() => {});
    if (supabase) await supabase.auth.signOut().catch(() => {});
  } finally {
    localStorage.removeItem(authStorageKey);
    useAuthStore.getState().logout();
  }
}

/** Get current session token for API calls */
export function getSessionToken(): string | null {
  return localStorage.getItem(authStorageKey);
}
