import { LoaderCircle } from 'lucide-react';

/**
 * Suspense fallback shown while a lazily-loaded admin route chunk is fetching.
 * Kept intentionally light (no heavy deps) so it paints instantly.
 */
export function RouteFallback() {
  return (
    <div className="flex min-h-[55vh] w-full flex-col items-center justify-center gap-3 bg-[#F7EEDB]">
      <LoaderCircle size={26} className="animate-spin text-brand-red" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted font-mono">
        Loading Operations...
      </p>
    </div>
  );
}