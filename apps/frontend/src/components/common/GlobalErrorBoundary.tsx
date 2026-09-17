import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[GlobalErrorBoundary] Caught fatal render crash:', error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {
      // Ignore cache clearing errors
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111111] text-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#1c1c1c] border border-white/10 shadow-2xl flex flex-col items-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-full bg-[#e6321c]/15 text-[#e6321c] flex items-center justify-center mb-6 ring-8 ring-[#e6321c]/5">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="text-[11px] font-mono tracking-[0.25em] text-[#e6321c] uppercase mb-2">
              BINGOOO ATELIER / SESSION RECOVERY
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-3">
              SOMETHING WENT UNEXPECTED
            </h1>

            <p className="text-sm text-[#aaaaaa] leading-relaxed mb-8">
              A temporary interface exception occurred. Your orders and saved garments are safe. Let’s reload the studio experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#e6321c] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#ff3b24] active:scale-95 transition-all shadow-lg shadow-[#e6321c]/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Studio
              </button>

              <button
                onClick={this.handleHardReset}
                className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset to Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 text-left p-3 rounded bg-black/60 border border-white/5 text-[11px] font-mono text-red-400 max-h-32 overflow-auto w-full">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
