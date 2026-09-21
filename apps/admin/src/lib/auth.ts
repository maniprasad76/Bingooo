// ─────────────────────────────────────────────────────────
// Admin auth helpers — login, Google OAuth, logout, session init
// Restricted exclusively to authorized Super Admin
// ─────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '../store/auth';
import { api } from './api';

const AUTH_KEY = 'bingooo_auth_token';
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'];
export const AUTHORIZED_SUPER_ADMIN_EMAILS = [
  'basaprasaduu@gmail.com',
  'admin@bingooo.in',
  'prasad@bingooo.co.in',
];
export const AUTHORIZED_SUPER_ADMIN_EMAIL = 'basaprasaduu@gmail.com';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://zqmrmgwxhrdscippanuv.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_fHCORRNjkuYGufRUUdvHtw_T5VFXWpl';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/** Initialize auth on app mount — checks for existing token or Supabase Google OAuth */
export async function initAdminAuth(): Promise<void> {
  // 0. Handle tokens directly passed in URL hash (from Supabase OAuth or auth bridge)
  if (supabase && typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
    try {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken) {
        if (refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      // Fall through to getSession
    }
  }

  // 1. Check Supabase Google OAuth session
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const userEmail = data.session.user.email?.toLowerCase();
        if (userEmail && AUTHORIZED_SUPER_ADMIN_EMAILS.includes(userEmail)) {
          localStorage.setItem(AUTH_KEY, data.session.access_token);
          useAuthStore.getState().setAuth({
            id: data.session.user.id,
            email: data.session.user.email || userEmail,
            fullName: data.session.user.user_metadata?.full_name || 'Mani Prasad',
            role: 'SUPER_ADMIN',
          });
          return;
        } else {
          // Unauthorized email: immediately clear session
          await supabase.auth.signOut();
          localStorage.removeItem(AUTH_KEY);
          useAuthStore.getState().logout();
          return;
        }
      }
    } catch {
      // Fall through to stored token verification
    }
  }

  // 2. Check stored token
  const token = localStorage.getItem(AUTH_KEY);
  if (token) {
    try {
      const user = await api.get<any>('/auth/me');
      if (user.role && ADMIN_ROLES.includes(user.role)) {
        useAuthStore.getState().setAuth({
          id: user.id,
          email: user.email,
          fullName: user.full_name || user.fullName,
          role: user.role,
        });
        return;
      }
      // Not an admin — clear session
      localStorage.removeItem(AUTH_KEY);
      useAuthStore.getState().logout();
    } catch {
      localStorage.removeItem(AUTH_KEY);
      useAuthStore.getState().logout();
    }
  } else {
    useAuthStore.getState().setAuth(null);
  }
}

/** Admin login via Email and Password */
export async function adminLogin(email: string, password: string): Promise<void> {
  const res = await api.post<{ user: any; token: string }>('/auth/login', { email, password });

  if (!res.user.role || !ADMIN_ROLES.includes(res.user.role)) {
    throw new Error('This account does not have admin access.');
  }

  localStorage.setItem(AUTH_KEY, res.token);
  useAuthStore.getState().setAuth({
    id: res.user.id,
    email: res.user.email,
    fullName: res.user.full_name || res.user.fullName,
    role: res.user.role,
  });
}

/** Admin login via Google OAuth */
export async function adminGoogleLogin(): Promise<void> {
  if (!supabase) {
    throw new Error('Google Authentication requires Supabase configuration.');
  }

  const adminOrigin = window.location.origin;

  // Set shared cookies & session markers so if Supabase bounces via localhost or frontend, it returns to admin
  try {
    document.cookie = `bingooo_admin_login=1; path=/; max-age=600; SameSite=Lax`;
    document.cookie = `bingooo_admin_origin=${encodeURIComponent(adminOrigin)}; path=/; max-age=600; SameSite=Lax`;
    sessionStorage.setItem('bingooo_admin_login', '1');
    sessionStorage.setItem('bingooo_admin_origin', adminOrigin);
  } catch {}

  // Direct callback on the Admin app itself
  const redirectTarget = `${adminOrigin}/auth/callback?source=admin&admin_origin=${encodeURIComponent(adminOrigin)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTarget,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  if (data?.url) {
    window.location.href = data.url;
  }
}

/** Sign out from both backend and Supabase */
export async function adminLogout(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Silent error on signout
    }
  }
  localStorage.removeItem(AUTH_KEY);
  useAuthStore.getState().logout();
}
