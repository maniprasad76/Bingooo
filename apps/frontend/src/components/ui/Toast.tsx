import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Undo2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'default' | 'danger';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  message?: string;
  variant?: ToastType;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
  onUndo?: () => void;
  undoLabel?: string;
}

interface ToastItemData {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  action?: ToastAction;
  onUndo?: () => void;
  undoLabel?: string;
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

  const addToast = useCallback(
    (optionsOrMessage: string | ToastOptions, typeArg: ToastType = 'info', durationArg = 4500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      let title = '';
      let description: string | undefined;
      let variant: ToastType = typeArg;
      let duration = durationArg;
      let action: ToastAction | undefined;
      let onUndo: (() => void) | undefined;
      let undoLabel: string | undefined;

      if (typeof optionsOrMessage === 'string') {
        title = optionsOrMessage;
      } else {
        title = optionsOrMessage.title || optionsOrMessage.message || '';
        description = optionsOrMessage.description;
        variant = optionsOrMessage.variant || optionsOrMessage.type || 'info';
        if (optionsOrMessage.duration !== undefined) duration = optionsOrMessage.duration;
        action = optionsOrMessage.action;
        onUndo = optionsOrMessage.onUndo;
        undoLabel = optionsOrMessage.undoLabel;
      }

      const normalizedType: 'success' | 'error' | 'info' =
        variant === 'danger' || variant === 'error'
          ? 'error'
          : variant === 'success'
          ? 'success'
          : 'info';

      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          description,
          type: normalizedType,
          duration,
          action,
          onUndo,
          undoLabel,
        },
      ]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 sm:bottom-6 sm:right-6">
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
  success: 'border-[#238636]/30 bg-[#FDF9F4] text-[#238636]',
  error: 'border-[#E6321C]/30 bg-[#FDF0EE] text-[#E6321C]',
  info: 'border-[#DDD3C5] bg-white text-[#171717]',
};

function ToastItem({ toast, onRemove }: { toast: ToastItemData; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const handleUndo = () => {
    if (toast.onUndo) {
      toast.onUndo();
    }
    onRemove(toast.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg select-none',
        'w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[300px] max-w-md',
        typeStyles[toast.type],
      )}
      role="alert"
    >
      <Icon size={18} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#171717] leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-[11px] text-[#6F6A63] mt-0.5 leading-snug">{toast.description}</p>
        )}
      </div>

      {/* Undo Action Button */}
      {toast.onUndo && (
        <button
          type="button"
          onClick={handleUndo}
          className="inline-flex items-center gap-1 rounded-lg bg-[#171717] text-white hover:bg-[#E6321C] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none"
        >
          <Undo2 size={12} />
          <span>{toast.undoLabel || 'Undo'}</span>
        </button>
      )}

      {/* Custom Action Button */}
      {toast.action && !toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onRemove(toast.id);
          }}
          className="rounded-lg border border-[#DDD3C5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#171717] hover:bg-[#EDE0CC]/40 transition-colors shrink-0"
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded p-1 text-[#6F6A63] hover:text-[#171717] hover:bg-black/5 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
