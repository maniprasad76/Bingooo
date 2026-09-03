import { create } from 'zustand';

export interface AdminUser {
  id: string;
  email?: string;
  role?: string;
  name?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  setAuth: (user: AdminUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  setAuth: (user) =>
    set({
      isAuthenticated: Boolean(user),
      user,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      loading: false,
    }),
}));
