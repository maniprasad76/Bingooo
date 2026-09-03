import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../store/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const authStorageKey = 'bingooo_auth_token';
const devAuthEnabled = import.meta.env.VITE_ENABLE_DEV_AUTH === 'true';

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Account sign-in is not configured yet. Add the Supabase browser variables to your environment.');
  }
  return supabase;
}

function syncSession(session: { access_token: string; user: { id: string } } | null): void {
  if (session) {
    localStorage.setItem(authStorageKey, session.access_token);
    useAuthStore.getState().setAuth(session.user.id);
  } else {
    localStorage.removeItem(authStorageKey);
    useAuthStore.getState().setAuth(null);
  }
}

/** Initialize auth listener. Call once on app mount. */
export function initAuth(): void {
  if (!supabase) {
    if (devAuthEnabled) {
      localStorage.setItem(authStorageKey, 'bingooo-dev-admin');
      useAuthStore.getState().setAuth('development-admin');
    } else {
      useAuthStore.getState().setAuth(null);
    }
    return;
  }

  void supabase.auth.getSession().then(({ data }) => syncSession(data.session));
  supabase.auth.onAuthStateChange((_event, session) => syncSession(session));
}

/** Sign in with email/password */
export async function signIn(email: string, password: string): Promise<void> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  syncSession(data.session);
}

/** Sign up with email/password */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  syncSession(data.session);
}

/** Sign out */
export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem(authStorageKey);
  useAuthStore.getState().logout();
}

/** Get current session token for API calls */
export function getSessionToken(): string | null {
  return localStorage.getItem(authStorageKey);
}
