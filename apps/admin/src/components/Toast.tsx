import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms, default 4000
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextValue {
  toast: {
    (options: ToastOptions | string, variant?: ToastVariant): void;
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
    warning: (title: string, description?: string, duration?: number) => void;
    info: (title: string, description?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options: ToastOptions | string, variantArg?: ToastVariant) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let item: ToastItem;

    if (typeof options === 'string') {
      item = {
        id,
        title: options,
        variant: variantArg || 'info',
        duration: 4000,
        createdAt: Date.now(),
      };
    } else {
      item = {
        id,
        title: options.title || '',
        description: options.description,
        variant: options.variant || variantArg || 'info',
        duration: options.duration ?? 4000,
        createdAt: Date.now(),
      };
    }

    setToasts((prev) => [...prev, item]);
  }, []);

  const toastObj = Object.assign(
    (options: ToastOptions | string, variant?: ToastVariant) => addToast(options, variant),
    {
      success: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'success', duration }),
      error: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'error', duration }),
      warning: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'warning', duration }),
      info: (title: string, description?: string, duration?: number) =>
        addToast({ title, description, variant: 'info', duration }),
    }
  );

  return (
    <ToastContext.Provider value={{ toast: toastObj, removeToast }}>
      {children}
      {/* Toast container floating at bottom-right */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none sm:max-w-md px-3"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    if (item.duration && item.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, item.duration);
      return () => clearTimeout(timer);
    }
  }, [item.duration, onDismiss]);

  const variantStyles = {
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-[#171717]',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      accent: 'bg-emerald-500',
    },
    error: {
      border: 'border-brand-red/40',
      bg: 'bg-[#171717]',
      icon: <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />,
      accent: 'bg-brand-red',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-[#171717]',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      accent: 'bg-amber-500',
    },
    info: {
      border: 'border-neutral-700',
      bg: 'bg-[#171717]',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
      accent: 'bg-sky-500',
    },
  };

  const style = variantStyles[item.variant || 'info'];

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.bg} text-white shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3`}
      role="alert"
    >
      {/* Visual indicator line */}
      <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${style.accent}`} />

      {style.icon}

      <div className="flex-1 min-w-0 pr-1">
        {item.title && (
          <h4 className="text-sm font-bold text-white tracking-wide leading-snug">
            {item.title}
          </h4>
        )}
        {item.description && (
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
