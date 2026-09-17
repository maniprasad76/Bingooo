import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useQueryClient } from '@tanstack/react-query';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

export function OfflineBanner() {
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOnline && wasOffline) {
      triggerHaptic('medium');
      queryClient.invalidateQueries();
      const timer = setTimeout(() => {
        resetWasOffline();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, queryClient, resetWasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#171717] text-[#F7EEDB] border-b border-[#DDD3C5]/20 px-4 py-2 text-xs font-mono flex items-center justify-center gap-2 z-50 sticky top-0"
        >
          <WifiOff size={14} className="text-[#E6321C] shrink-0 animate-pulse" />
          <span>You are currently offline. Showing cached atelier collection.</span>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#238636] text-white px-4 py-2 text-xs font-mono flex items-center justify-center gap-2 z-50 sticky top-0"
        >
          <Wifi size={14} className="shrink-0" />
          <span>Back online! Synchronized with latest releases.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
