import { Navigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import type { ReactNode } from 'react';

/**
 * Route guard — redirects to /login if not authenticated or not admin.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle size={28} className="animate-spin text-brand-red" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink font-mono">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
