import { LoaderCircle } from 'lucide-react';

/**
 * Suspense fallback shown while a lazily-loaded route chunk is fetching.
 * Kept intentionally light (no heavy deps) so it paints instantly.
 */
export function RouteFallback() {
  return (
    <div className="flex min-h-[55vh] w-full flex-col items-center justify-center gap-3 bg-[#FAF8F5]">
      <LoaderCircle size={28} className="animate-spin text-[#E6321C]" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#171717] font-mono">
        Loading Bingooo Atelier...
      </p>
    </div>
  );
}