import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="status"
          aria-live="assertive"
          className="fixed top-0 inset-x-0 z-[100] bg-[#171717] border-b border-[#E6321C]/60 text-white shadow-lg select-none"
        >
          <div className="max-w-[1360px] mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E6321C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E6321C]"></span>
              </span>
              <WifiOff size={15} className="text-[#E6321C] shrink-0" />
              <div className="flex flex-wrap items-center gap-x-2">
                <strong className="font-extrabold uppercase tracking-wider text-[#F7EEDB]">
                  You are offline
                </strong>
                <span className="text-[#DDD3C5]/80 hidden sm:inline">
                  &bull; Customizer auto-save is storing changes locally. Reconnecting in background...
                </span>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2B2825] hover:bg-[#E6321C] text-[11px] font-bold uppercase tracking-wider transition-colors border border-white/10"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
          className="fixed top-0 inset-x-0 z-[100] bg-[#238636] text-white shadow-md select-none"
        >
          <div className="max-w-[1360px] mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Wifi size={15} />
            <span>Connection Restored &bull; Atelier Synced</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
