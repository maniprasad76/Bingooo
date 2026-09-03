import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../store/auth';

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

function syncSession(session: { access_token: string; user: { id: string; email?: string } } | null): void {
  if (session) {
    localStorage.setItem(authStorageKey, session.access_token);
    useAuthStore.getState().setAuth({
      id: session.user.id,
      email: session.user.email,
      role: 'admin',
    });
  } else {
    // If dev auth enabled and manually set, keep dev admin session
    const currentToken = localStorage.getItem(authStorageKey);
    if (devAuthEnabled && currentToken === 'bingooo-dev-admin') {
      useAuthStore.getState().setAuth({
        id: 'dev-admin-id',
        email: 'admin@bingooo.com',
        role: 'Super Admin',
      });
      return;
    }
    localStorage.removeItem(authStorageKey);
    useAuthStore.getState().setAuth(null);
  }
}

export function initAuth(): void {
  const existingToken = localStorage.getItem(authStorageKey);
  if (existingToken === 'bingooo-dev-admin' || (!existingToken && devAuthEnabled)) {
    localStorage.setItem(authStorageKey, 'bingooo-dev-admin');
    useAuthStore.getState().setAuth({
      id: 'dev-admin-id',
      email: 'admin@bingooo.com',
      name: 'Bingooo Lead Admin',
      role: 'Super Admin',
    });
    return;
  }

  if (!supabase) {
    useAuthStore.getState().setAuth(null);
    return;
  }

  void supabase.auth.getSession().then(({ data }) => syncSession(data.session));
  supabase.auth.onAuthStateChange((_event, session) => syncSession(session));
}

export async function signIn(email: string, password: string): Promise<void> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  syncSession(data.session);
}

export function loginAsDevAdmin(): void {
  localStorage.setItem(authStorageKey, 'bingooo-dev-admin');
  useAuthStore.getState().setAuth({
    id: 'dev-admin-id',
    email: 'admin@bingooo.com',
    name: 'Bingooo Master Admin',
    role: 'Super Admin',
  });
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  localStorage.removeItem(authStorageKey);
  useAuthStore.getState().logout();
}
