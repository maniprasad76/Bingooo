import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'left' | 'right';
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'w-full sm:max-w-sm',
  md: 'w-full sm:max-w-md',
  lg: 'w-full sm:max-w-lg',
  full: 'w-full max-w-full',
};

export function Drawer({
  open,
  isOpen,
  onClose,
  children,
  title,
  side,
  position = 'right',
  size = 'md',
  className,
}: DrawerProps) {
  const isDrawerOpen = open !== undefined ? open : !!isOpen;
  const drawerSide = side || position;

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isDrawerOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, onClose]);

  const slideFrom = drawerSide === 'right' ? { x: '100%' } : { x: '-100%' };
  const slideTo = { x: 0 };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            className={cn(
              'fixed top-0 z-50 h-full w-full bg-[#F7EEDB] flex flex-col',
              drawerSide === 'right' ? 'right-0 border-l-2 border-[#171717] shadow-[-6px_0px_0px_#171717]' : 'left-0 border-r-2 border-[#171717] shadow-[6px_0px_0px_#171717]',
              sizeClasses[size],
              className,
            )}
            initial={slideFrom}
            animate={slideTo}
            exit={slideFrom}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Drawer'}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b-2 border-[#171717] bg-[#F7EEDB] px-5 py-4 shrink-0">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-[#171717]">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-[2px] border-2 border-[#171717] bg-white p-1 text-[#171717] hover:bg-[#E6321C] hover:text-white shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
