import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const errorMessage =
    error?.message ||
    error?.statusText ||
    'An unexpected error occurred while loading this view.';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-7 border border-border/80 shadow-card text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertTriangle size={28} />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
            RENDER EXCEPTION
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-ink font-sans mt-1">
            Section Error
          </h2>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-outline gap-2 text-xs"
          >
            <RefreshCw size={13} />
            Reload Page
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary gap-2 text-xs"
          >
            <LayoutDashboard size={13} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
