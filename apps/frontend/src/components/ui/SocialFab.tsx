import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

// ─── Clean Minimal Social SVGs ───
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface SocialItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgHover: string;
}

const SOCIAL_ITEMS: SocialItem[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    href: 'https://wa.me/917981787317',
    icon: WhatsAppIcon,
    color: '#25D366',
    bgHover: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: 'https://instagram.com/bingooo.sklm',
    icon: InstagramIcon,
    color: '#E4405F',
    bgHover: 'hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C]',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: YouTubeIcon,
    color: '#FF0000',
    bgHover: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]',
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    href: 'https://twitter.com',
    icon: XTwitterIcon,
    color: '#171717',
    bgHover: 'hover:bg-[#171717] hover:text-white hover:border-[#171717]',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: FacebookIcon,
    color: '#1877F2',
    bgHover: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
  },
];

export function SocialFab() {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={fabRef}
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end pointer-events-auto select-none font-sans"
    >
      {/* ─── Speed Dial Items (Expanded) ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: {
                  staggerChildren: 0.05,
                  staggerDirection: -1,
                },
              },
              closed: {
                transition: {
                  staggerChildren: 0.03,
                  staggerDirection: 1,
                },
              },
            }}
            className="flex flex-col items-end gap-3 mb-3"
          >
            {SOCIAL_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  variants={{
                    open: { opacity: 1, y: 0, scale: 1 },
                    closed: { opacity: 0, y: 16, scale: 0.8 },
                  }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="flex items-center gap-2.5 group"
                >
                  {/* Floating Pill Label */}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#171717] bg-[#F7EEDB] border border-[#DDD3C5] shadow-sm opacity-90 group-hover:opacity-100 group-hover:border-[#E6321C]/40 transition-all pointer-events-none">
                    {item.name}
                  </span>

                  {/* Circular Action Button */}
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.name}`}
                    className={`w-11 h-11 rounded-full bg-[#EDE0CC] border border-[#DDD3C5] text-[#171717] flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 ${item.bgHover}`}
                  >
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main FAB Trigger Button ─── */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close social channels' : 'Open social channels'}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none ${
            isOpen
              ? 'bg-[#171717] text-white shadow-xl scale-95'
              : 'bg-[#E6321C] hover:bg-[#B91F12] text-white shadow-[0_6px_20px_rgba(230,50,28,0.35)] hover:scale-105 active:scale-95'
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} aria-hidden="true" />
            )}
          </motion.div>
        </button>
      </div>
    </div>
  );
}
