import { useEffect, useState, type ReactNode } from 'react';
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
  const [, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
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
              'fixed top-0 z-50 h-full w-full bg-white shadow-drawer flex flex-col',
              sizeClasses[size],
              drawerSide === 'right' ? 'right-0' : 'left-0',
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
              <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
                <h2 className="text-heading font-bold text-ink">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-muted hover:bg-ink/5 hover:text-ink transition-colors duration-hover"
                  aria-label="Close"
                >
                  <X size={20} />
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
