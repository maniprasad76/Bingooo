import { createContext, useContext } from 'react';

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

export interface ToastContextValue {
  toast: (optionsOrMessage: string | ToastOptions, type?: ToastType, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
