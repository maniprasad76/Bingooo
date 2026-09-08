import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 380);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Scroll back to top"
          className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#171717] text-white shadow-xl hover:bg-[#E6321C] border border-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none"
        >
          <ArrowUp size={18} className="stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
