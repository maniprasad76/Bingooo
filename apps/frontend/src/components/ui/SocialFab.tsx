import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  EmailIcon,
  YouTubeIcon,
  XTwitterIcon,
  BINGOOO_INSTAGRAM_URL,
  BINGOOO_EMAIL_SUPPORT,
  getWhatsAppUrl,
} from './SocialIcons';

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
    href: getWhatsAppUrl('Hi Bingooo, I would like to inquire about your menswear and custom designs.'),
    icon: WhatsAppIcon,
    color: '#25D366',
    bgHover: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
  },
  {
    id: 'email',
    name: 'Email Us',
    href: `mailto:${BINGOOO_EMAIL_SUPPORT}?subject=Inquiry%20from%20Bingooo%20Store`,
    icon: EmailIcon,
    color: '#E6321C',
    bgHover: 'hover:bg-[#E6321C] hover:text-white hover:border-[#E6321C]',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: BINGOOO_INSTAGRAM_URL,
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
