import type { SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useAuthStore } from '../../store/auth';
import { api } from '../api/client';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const authStorageKey = 'bingooo_auth_token';

const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * The Supabase SDK is ~200 KB, so it is loaded on first use instead of with
 * every page: only signed-in Supabase users, OAuth/magic-link returns and the
 * login/signup/password flows need it.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => createClient(supabaseUrl!, supabaseKey!))
      .catch((err) => {
        clientPromise = null;
        console.warn('[Auth] Could not load the Supabase SDK:', err);
        return null;
      });
  }
  return clientPromise;
}

/** A Supabase session is saved (sb-<project>-auth-token) or is arriving in the URL. */
function supabaseSessionLikely(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) return true;
    }
  } catch {
    // Storage unavailable: fall through to the URL check
  }
  const { hash, search } = window.location;
  return /access_token=|refresh_token=|error_description=/.test(hash) || /[?&]code=/.test(search);
}

function applySupabaseSession(session: Session) {
  localStorage.setItem(authStorageKey, session.access_token);
  useAuthStore.getState().setAuth(session.user.id, {
    id: session.user.id,
    email: session.user.email || '',
    fullName:
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split('@')[0],
    phone: session.user.user_metadata?.phone || session.user.phone || '',
    role: session.user.user_metadata?.role || 'CUSTOMER',
  });
}

let initAuthPromise: Promise<void> | null = null;

/** Initialize auth on app mount with singleton promise deduplication */
export function initAuth(): Promise<void> {
  if (!initAuthPromise) {
    initAuthPromise = runInitAuth().finally(() => {
      useAuthStore.getState().setLoading(false);
    });
  }
  return initAuthPromise;
}

async function runInitAuth(): Promise<void> {
  const isDevAuthAllowed = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH === 'true';
  const token = localStorage.getItem(authStorageKey);

  if (isDevAuthAllowed && token === 'bingooo-dev-admin') {
    useAuthStore.getState().setAuth('usr-admin-1', {
      id: 'usr-admin-1',
      email: 'admin@bingooo.in',
      fullName: 'Mani P.',
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
    });
    return;
  }

  // 1. First priority: Check Supabase session (Google & Facebook OAuth + Supabase email sessions)
  const supabase = supabaseSessionLikely() ? await getSupabase() : null;
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        applySupabaseSession(data.session);

        // Background non-fatal profile sync with backend (never logs out Google user if backend is offline)
        api
          .get<any>('/auth/me')
          .then((profile) => {
            if (profile && profile.id) {
              useAuthStore.getState().setUser({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name || profile.fullName,
                phone: profile.phone,
                role: profile.role,
              });
            }
          })
          .catch(() => {
            // Backend /auth/me failure is non-fatal for Supabase OAuth users
          });

        // Reactive listener for token refresh or sign out
        supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
          if (newSession) {
            applySupabaseSession(newSession);
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem(authStorageKey);
            useAuthStore.getState().logout();
          }
        });

        return;
      }
    } catch (err) {
      console.warn('[Auth] Supabase getSession check failed:', err);
    }
  }

  // 2. Second priority: If no Supabase session, check custom backend token
  if (token) {
    try {
      const user = await api.get<any>('/auth/me');
      if (user && user.id) {
        useAuthStore.getState().setAuth(user.id, {
          id: user.id,
          email: user.email,
          fullName: user.full_name || user.fullName,
          phone: user.phone,
          role: user.role,
        });
        return;
      }
    } catch {
      localStorage.removeItem(authStorageKey);
    }
  }

  // 3. No active session found
  useAuthStore.getState().setAuth(null);

  // Listen for sign-ins completed elsewhere (e.g. another tab). A new subscriber
  // receives the current session straight away (INITIAL_SESSION).
  const listen = (client: SupabaseClient | null) =>
    client?.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session) applySupabaseSession(session);
    });
  if (supabase) listen(supabase);
  else if (supabaseConfigured) {
    // Visitors without a session don't download the ~200 KB SDK: another tab
    // signing in writes sb-<project>-auth-token, which fires a storage event here.
    const onStorage = (e: StorageEvent) => {
      if (!e.newValue || !e.key?.startsWith('sb-') || !e.key.endsWith('-auth-token')) return;
      window.removeEventListener('storage', onStorage);
      void getSupabase().then(listen);
    };
    window.addEventListener('storage', onStorage);
  }
}

/** Sign in with email/password */
export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      localStorage.setItem(authStorageKey, data.session.access_token);
      useAuthStore.getState().setAuth(data.session.user.id, {
        id: data.session.user.id,
        email: data.session.user.email || '',
        fullName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
      });
      return;
    }
    if (error) {
      const isNetworkErr = error.message?.toLowerCase().includes('fetch') || error.message?.toLowerCase().includes('network');
      if (!isNetworkErr) {
        throw new Error(error.message);
      }
    }
  }

  // Fallback to backend API
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
    throw err instanceof Error ? err : new Error('Unable to sign in. Please verify your email and password.');
  }
}

/** Sign up with email/password */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
): Promise<void> {
  const supabase = await getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone || '' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      const isNetworkErr = error.message?.toLowerCase().includes('fetch') || error.message?.toLowerCase().includes('network');
      if (!isNetworkErr) {
        throw new Error(error.message);
      }
    }
    if (data?.session) {
      localStorage.setItem(authStorageKey, data.session.access_token);
      useAuthStore.getState().setAuth(data.session.user.id, {
        id: data.session.user.id,
        email: data.session.user.email || '',
        fullName,
      });
      return;
    } else if (data?.user) {
      return;
    }
  }

  // Fallback to backend API
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
    throw err instanceof Error ? err : new Error('Unable to create account. Please try again.');
  }
}

/** Sign in with OAuth provider (Google, Facebook) */
export async function signInWithProvider(
  provider: 'google' | 'facebook',
  redirectTo?: string,
): Promise<void> {
  const targetUrl = redirectTo || `${window.location.origin}/auth/callback`;

  const supabase = await getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: targetUrl,
      },
    });
    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
    return;
  }

  throw new Error(`${provider === 'google' ? 'Google' : 'Facebook'} authentication requires Supabase configuration.`);
}

/** Request password reset email */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (err) {
    const supabase = await getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return;
    }
    throw err;
  }
}

/** Reset password with secure token and new password */
export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  try {
    await api.post('/auth/reset-password', { token, newPassword });
  } catch (err) {
    const supabase = await getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return;
    }
    throw err;
  }
}


/** Sign out */
export async function signOut(): Promise<void> {
  try {
    await api.post('/auth/logout').catch(() => {});
    // Only a Supabase session needs the SDK to sign out.
    const supabase = supabaseSessionLikely() ? await getSupabase() : null;
    if (supabase) await supabase.auth.signOut().catch(() => {});
  } finally {
    localStorage.removeItem(authStorageKey);
    useAuthStore.getState().logout();
    await clearServiceWorkerCaches();
  }
}

/** Drop service-worker caches so nothing from this session survives sign-out. */
async function clearServiceWorkerCaches(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('bingooo-cache')).map((k) => caches.delete(k)));
  } catch {
    // Cache Storage can be unavailable (private mode); nothing to clear then
  }
}

/** Quick dev admin login bypass for local development */
export function loginAsDevAdmin(): void {
  localStorage.setItem(authStorageKey, 'bingooo-dev-admin');
  useAuthStore.getState().setAuth('usr-admin-1', {
    id: 'usr-admin-1',
    email: 'basaprasaduu@gmail.com',
    fullName: 'Mani Prasad.',
    phone: '+91 7981737817',
    role: 'SUPER_ADMIN',
  });
}

/** Get current session token for API calls */
export function getSessionToken(): string | null {
  return localStorage.getItem(authStorageKey);
}


