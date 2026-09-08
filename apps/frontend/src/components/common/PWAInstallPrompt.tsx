import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await promptInstall();
    if (!success) {
      setDismissed(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        aria-label="PWA install banner"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-32px)] bg-[#171717] text-[#FAF6EE] rounded-2xl p-4 shadow-2xl border border-white/15 flex items-center justify-between gap-3 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#E6321C] flex items-center justify-center shrink-0 shadow-xs">
            <Download size={18} className="text-white stroke-[2.4]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase font-bold text-[#E6321C] tracking-wider">
                Bingooo App
              </span>
              <Sparkles size={11} className="text-white/70" />
            </div>
            <p className="text-xs font-sans text-white/80 font-medium leading-tight mt-0.5">
              Install Bingooo Atelier for instant 3D customization & offline browsing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-white text-[#171717] text-xs font-heading uppercase font-extrabold tracking-wider hover:bg-[#FAF6EE] transition-colors shadow-xs"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-white/50 hover:text-white transition-colors"
            aria-label="Dismiss app install prompt"
          >
            <X size={16} />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
