import { Navigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import type { ReactNode } from 'react';

/**
 * Route guard for authenticated pages (account, orders, wishlist, etc.).
 * Redirects guests to /login, preserving the intended destination so they
 * can be sent straight back after signing in.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();

  // If already authenticated from persisted storage, render immediately with zero flicker
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If still checking session and not yet authenticated, show loader
  if (loading) {
    return (
      <div className="flex min-h-[55vh] w-full flex-col items-center justify-center gap-3 bg-[#FAF8F5]">
        <LoaderCircle size={28} className="animate-spin text-[#E6321C]" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#171717] font-mono">
          Checking your session...
        </p>
      </div>
    );
  }

  // Not authenticated and session check completed
  return <Navigate to="/login" replace state={{ from: location }} />;
}