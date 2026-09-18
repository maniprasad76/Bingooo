// ─────────────────────────────────────────────────────────
// Admin auth helpers — login, logout, session init
// Uses the same backend auth endpoints as the storefront
// ─────────────────────────────────────────────────────────

import { useAuthStore } from '../store/auth';
import { api } from './api';

const AUTH_KEY = 'bingooo_auth_token';
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'];

/** Initialize auth on app mount — checks for existing token */
export async function initAdminAuth(): Promise<void> {
  const token = localStorage.getItem(AUTH_KEY);

  // Dev admin bypass — strictly disabled in production
  const isDevAuthAllowed = import.meta.env.DEV && (import.meta.env as any).VITE_ENABLE_DEV_AUTH === 'true';
  if (isDevAuthAllowed && token === 'bingooo-dev-admin') {
    useAuthStore.getState().setAuth({
      id: 'usr-admin-1',
      email: 'admin@bingooo.in',
      fullName: 'Mani Prasad',
      role: 'SUPER_ADMIN',
    });
    return;
  }

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

/** Admin login */
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

/** Quick dev admin bypass */
export function loginAsDevAdmin(): void {
  localStorage.setItem(AUTH_KEY, 'bingooo-dev-admin');
  useAuthStore.getState().setAuth({
    id: 'usr-admin-1',
    email: 'admin@bingooo.in',
    fullName: 'Mani Prasad',
    role: 'SUPER_ADMIN',
  });
}

/** Sign out */
export function adminLogout(): void {
  localStorage.removeItem(AUTH_KEY);
  useAuthStore.getState().logout();
}
