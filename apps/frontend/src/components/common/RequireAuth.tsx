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

  // Wait for initAuth() to finish resolving the session before deciding,
  // otherwise logged-in users would get flickered to /login on refresh.
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}