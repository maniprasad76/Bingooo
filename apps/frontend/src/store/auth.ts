import { create } from 'zustand';

interface AuthStore {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current user ID from Supabase Auth */
  userId: string | null;
  /** Loading state during initial session check */
  loading: boolean;
  setAuth: (userId: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  userId: null,
  loading: true,
  setAuth: (userId) =>
    set({
      isAuthenticated: !!userId,
      userId,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
  logout: () =>
    set({
      isAuthenticated: false,
      userId: null,
      loading: false,
    }),
}));
