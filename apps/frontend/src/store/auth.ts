import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string;
  phone?: string;
  role?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  userId: string | null;
  user: UserProfile | null;
  loading: boolean;
  setAuth: (userId: string | null, user?: UserProfile | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  userId: null,
  user: null,
  loading: true,
  setAuth: (userId, user) =>
    set({
      isAuthenticated: Boolean(userId),
      userId,
      user: user || null,
      loading: false,
    }),
  setUser: (user) =>
    set((state) => ({
      user,
      userId: user ? user.id : state.userId,
      isAuthenticated: Boolean(user || state.userId),
    })),
  setLoading: (loading) => set({ loading }),
  logout: () =>
    set({
      isAuthenticated: false,
      userId: null,
      user: null,
      loading: false,
    }),
}));
