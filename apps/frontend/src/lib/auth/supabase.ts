// ─────────────────────────────────────────────────────────
// Supabase Auth Client (mock for Phase 1)
// Replace with real @supabase/supabase-js when credentials are available.
// ─────────────────────────────────────────────────────────

import { useAuthStore } from '../../store/auth';

/** Initialize auth listener. Call once on app mount. */
export function initAuth(): void {
  // TODO: Replace with real Supabase client
  // const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);
  // supabase.auth.onAuthStateChange((event, session) => {
  //   useAuthStore.getState().setAuth(session?.user?.id ?? null);
  // });

  // For now, set unauthenticated
  useAuthStore.getState().setAuth(null);
}

/** Sign in with email/password */
export async function signIn(email: string, password: string): Promise<void> {
  // TODO: Replace with supabase.auth.signInWithPassword({ email, password })
  console.log('Mock sign in:', email, password);
  useAuthStore.getState().setAuth('mock-user-id');
}

/** Sign up with email/password */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  // TODO: Replace with supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  console.log('Mock sign up:', email, password, fullName);
  useAuthStore.getState().setAuth('mock-user-id');
}

/** Sign out */
export async function signOut(): Promise<void> {
  // TODO: Replace with supabase.auth.signOut()
  useAuthStore.getState().logout();
}

/** Get current session token for API calls */
export function getSessionToken(): string | null {
  // TODO: Replace with supabase.auth.getSession() → session.access_token
  return useAuthStore.getState().isAuthenticated ? 'mock-token' : null;
}
