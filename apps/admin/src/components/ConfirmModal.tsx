import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#171717] border border-neutral-800 rounded-2xl shadow-2xl p-6 text-white animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-40"
          title="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-brand-red/15 text-brand-red border border-brand-red/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDestructive ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-base font-extrabold text-white tracking-wide leading-snug">
              {title}
            </h3>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-brand-red hover:bg-[#c92816] text-white shadow-brand-red/20'
                : 'bg-white hover:bg-neutral-200 text-black'
            }`}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
