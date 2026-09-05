import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../store/auth';
import { api } from '../api/client';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const authStorageKey = 'bingooo_admin_token';
const devAuthEnabled = import.meta.env.VITE_ENABLE_DEV_AUTH === 'true';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  return supabase;
}

export async function initAuth(): Promise<void> {
  const existingToken = localStorage.getItem(authStorageKey) || localStorage.getItem('bingooo_auth_token');

  if (existingToken === 'bingooo-dev-admin' || (!existingToken && devAuthEnabled)) {
    localStorage.setItem(authStorageKey, 'bingooo-dev-admin');
    useAuthStore.getState().setAuth({
      id: 'dev-admin-id',
      email: 'admin@bingooo.in',
      name: 'Bingooo Lead Admin',
      role: 'Super Admin',
    });
    return;
  }

  if (existingToken) {
    try {
      const user = await api.get<any>('/auth/me');
      localStorage.setItem(authStorageKey, existingToken);
      useAuthStore.getState().setAuth({
        id: user.id,
        email: user.email,
        name: user.full_name || user.fullName || 'Admin User',
        role: user.role || 'Super Admin',
      });
      return;
    } catch {
      // If token expired or invalid, check supabase below
    }
  }

  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        localStorage.setItem(authStorageKey, data.session.access_token);
        useAuthStore.getState().setAuth({
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
        });
        return;
      }
    } catch {
      // ignore
    }
  }

  localStorage.removeItem(authStorageKey);
  useAuthStore.getState().setAuth(null);
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    const res = await api.post<{ user: any; token: string }>('/auth/login', {
      email,
      password,
    });

    const user = res.user;
    localStorage.setItem(authStorageKey, res.token);
    localStorage.setItem('bingooo_auth_token', res.token);

    useAuthStore.getState().setAuth({
      id: user.id,
      email: user.email,
      name: user.full_name || user.fullName || 'Admin User',
      role: user.role || 'Super Admin',
    });
    return;
  } catch (backendErr: any) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        localStorage.setItem(authStorageKey, data.session.access_token);
        useAuthStore.getState().setAuth({
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || 'Admin',
          role: 'admin',
        });
        return;
      }
    }
    throw backendErr;
  }
}

export function loginAsDevAdmin(): void {
  localStorage.setItem(authStorageKey, 'bingooo-dev-admin');
  localStorage.setItem('bingooo_auth_token', 'bingooo-dev-admin');
  useAuthStore.getState().setAuth({
    id: 'dev-admin-id',
    email: 'admin@bingooo.in',
    name: 'Bingooo Master Admin',
    role: 'Super Admin',
  });
}

export async function signOut(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore error on logout
  }
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  localStorage.removeItem(authStorageKey);
  localStorage.removeItem('bingooo_auth_token');
  useAuthStore.getState().logout();
}
