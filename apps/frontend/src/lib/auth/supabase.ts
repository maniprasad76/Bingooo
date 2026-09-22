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
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        const session = data.session;
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
        supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession) {
            localStorage.setItem(authStorageKey, newSession.access_token);
            useAuthStore.getState().setAuth(newSession.user.id, {
              id: newSession.user.id,
              email: newSession.user.email || '',
              fullName:
                newSession.user.user_metadata?.full_name ||
                newSession.user.user_metadata?.name ||
                newSession.user.email?.split('@')[0],
              phone: newSession.user.user_metadata?.phone || newSession.user.phone || '',
              role: newSession.user.user_metadata?.role || 'CUSTOMER',
            });
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

  // Set up auth state change listener so future OAuth completions are captured
  if (supabase) {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
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
    });
  }
}

/** Sign in with email/password */
/** Sign in with email/password */
export async function signIn(email: string, password: string): Promise<void> {
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

/** Reset password with new password */
export async function confirmPasswordReset(email: string, newPassword: string): Promise<void> {
  try {
    await api.post('/auth/reset-password', { email, newPassword });
  } catch (err) {
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
    if (supabase) await supabase.auth.signOut().catch(() => {});
  } finally {
    localStorage.removeItem(authStorageKey);
    useAuthStore.getState().logout();
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


