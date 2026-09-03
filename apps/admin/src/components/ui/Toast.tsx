import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'default' | 'danger';

export interface ToastOptions {
  title?: string;
  description?: string;
  message?: string;
  variant?: ToastType;
  type?: ToastType;
  duration?: number;
}

interface ToastItemData {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextValue {
  toast: (optionsOrMessage: string | ToastOptions, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((optionsOrMessage: string | ToastOptions, typeArg: ToastType = 'info', durationArg = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    let title = '';
    let description: string | undefined;
    let variant: ToastType = typeArg;
    let duration = durationArg;

    if (typeof optionsOrMessage === 'string') {
      title = optionsOrMessage;
    } else {
      title = optionsOrMessage.title || optionsOrMessage.message || '';
      description = optionsOrMessage.description;
      variant = optionsOrMessage.variant || optionsOrMessage.type || 'info';
      if (optionsOrMessage.duration) duration = optionsOrMessage.duration;
    }

    const normalizedType: 'success' | 'error' | 'info' =
      variant === 'danger' || variant === 'error'
        ? 'error'
        : variant === 'success'
        ? 'success'
        : 'info';

    setToasts((prev) => [...prev, { id, title, description, type: normalizedType, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed inset-x-4 bottom-4 z-[9999] flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const typeStyles = {
  success: 'border-success/30 bg-[#F0FDF4] text-success',
  error: 'border-danger/30 bg-[#FEF2F2] text-danger',
  info: 'border-border bg-white text-ink shadow-elevated',
};

function ToastItem({ toast, onRemove }: { toast: ToastItemData; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-elevated',
        'min-w-0 max-w-md sm:min-w-[300px]',
        typeStyles[toast.type],
      )}
      role="alert"
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs font-bold text-ink">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded p-0.5 text-muted hover:text-ink transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
