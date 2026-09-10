import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isDynamicImportError =
    error instanceof Error &&
    (error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Loading chunk'));

  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : 'An unexpected application error occurred.';

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-12 text-center bg-[#FAF8F5]">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[#DDD3C5] bg-white p-8 shadow-xs">
        <div className="mb-6 flex justify-center">
          <Logo variant="red" size="md" />
        </div>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6321C]/10 text-[#E6321C]">
          <AlertTriangle size={28} />
        </div>

        <h1 className="text-xl font-extrabold text-[#171717] sm:text-2xl font-sans tracking-tight">
          {isDynamicImportError ? 'Updating Atelier Experience' : 'Something Went Wrong'}
        </h1>

        <p className="mt-2 text-sm text-[#6F6A63] leading-relaxed">
          {isDynamicImportError
            ? 'A fresh update of the Bingooo application was deployed. Click below to refresh and load the latest experience.'
            : 'We encountered an unexpected issue while loading this page. You can retry or head back to the storefront.'}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleReload}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            {isDynamicImportError ? 'Refresh Page' : 'Try Again'}
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Back to Home
          </Button>
        </div>

        {/* Technical details accordion (for debugging) */}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
            <summary className="cursor-pointer font-semibold text-neutral-800 select-none">
              Developer Error Details
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-red-600">
              {errorMessage}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
