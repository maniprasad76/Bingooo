import { useState, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
}

const PULL_THRESHOLD = 70;

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);

  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 360]);
  const opacity = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0, 0.5, 1]);

  const handleDragEnd = async () => {
    if (y.get() >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          await queryClient.invalidateQueries();
        }
      } finally {
        setIsRefreshing(false);
        triggerHaptic('light');
      }
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* Pull indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center p-2 rounded-full bg-[#171717] text-white shadow-md"
      >
        <motion.div style={{ rotate }} className={isRefreshing ? 'animate-spin' : ''}>
          <RefreshCw size={16} className="text-[#E6321C]" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        style={{ y }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
