import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { WhatsAppIcon } from '../ui/SocialIcons';
import { useUIStore } from '../../store/ui';
import { useCartStore } from '../../store/cart';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

const COMMUNITY_URL = 'https://chat.whatsapp.com/HRFrD7YPl8f1xdLvPXvDiQ';
const STORAGE_KEY = 'bingooo_community_invite';
const SHOW_DELAY_MS = 3500; // after the Android splash (1.8s) and first paint
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

// Never interrupt someone who is paying, signing in, or reading a receipt.
const QUIET_ROUTES = ['/checkout', '/order-success', '/payment', '/auth', '/login', '/signup', '/forgot-password', '/reset-password'];

type InviteRecord = { status: 'joined' | 'dismissed'; at: number };

function readRecord(): InviteRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InviteRecord) : null;
  } catch {
    return null;
  }
}

function writeRecord(status: InviteRecord['status']) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {
    // Storage unavailable (private mode): the popup may show again next visit.
  }
}

function shouldInvite(): boolean {
  const record = readRecord();
  if (!record) return true;
  if (record.status === 'joined') return false;
  return Date.now() - record.at > SNOOZE_MS;
}

export function CommunityInvitePopup() {
  const { pathname } = useLocation();
  const open = useUIStore((s) => s.communityInviteOpen);
  const openInvite = useUIStore((s) => s.openCommunityInvite);
  const closeInvite = useUIStore((s) => s.closeCommunityInvite);
  const joinedRef = useRef(false);
  const wasOpenRef = useRef(false);
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Schedule once per page load; re-checks the route and other overlays at fire time.
  // The countdown starts at the visitor's first scroll, tap or key press: a sheet that
  // opens on an untouched page interrupts them and becomes the page's Largest
  // Contentful Paint, which browsers stop measuring at the first interaction.
  useEffect(() => {
    if (!shouldInvite()) return;
    let retries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = () => {
      const quiet = QUIET_ROUTES.some((r) => pathRef.current.startsWith(r));
      const ui = useUIStore.getState();
      const busy = ui.mobileMenuOpen || ui.searchModalOpen || useCartStore.getState().drawerOpen;
      if (!quiet && !busy) {
        openInvite();
      } else if (retries++ < 6) {
        timer = setTimeout(attempt, 10000);
      }
    };
    const events = ['scroll', 'pointerdown', 'keydown'] as const;
    const start = () => {
      events.forEach((type) => window.removeEventListener(type, start));
      timer = setTimeout(attempt, SHOW_DELAY_MS);
    };
    events.forEach((type) => window.addEventListener(type, start, { passive: true }));
    return () => {
      events.forEach((type) => window.removeEventListener(type, start));
      clearTimeout(timer);
    };
  }, [openInvite]);

  // Any close that isn't a join (X, backdrop, Esc, Android back) snoozes for a week.
  useEffect(() => {
    if (wasOpenRef.current && !open && !joinedRef.current) writeRecord('dismissed');
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeInvite();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeInvite]);

  const handleJoin = () => {
    joinedRef.current = true;
    writeRecord('joined');
    triggerHaptic('medium');
    closeInvite();
  };

  // A small non-modal card: no full-screen backdrop, the page stays usable behind it.
  // Below md it sits above the floating MobileNav (12px + 56px tall).
  return (
    <AnimatePresence>
      {open && (
        <m.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="community-invite-title"
          className="fixed z-[90] left-3 right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] md:left-auto md:right-6 md:bottom-6 md:w-[360px] rounded-[2px] border border-[#DDD3C5] bg-[#F7EEDB] text-[#171717] shadow-2xl font-sans"
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0, transition: { duration: 0.18 } }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        >
          <div className="p-4 pr-12">
            <button
              type="button"
              onClick={closeInvite}
              aria-label="Close invitation"
              className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-full text-[#6F6A63] hover:bg-[#EDE0CC] hover:text-[#171717] transition-colors"
            >
              <X size={18} />
            </button>
            <h2 id="community-invite-title" className="m-0 text-[15px] font-extrabold uppercase leading-tight tracking-[-0.02em]">
              Join our WhatsApp community
            </h2>
            <p className="mt-1.5 mb-0 text-[13px] leading-snug text-[#5A554E]">
              New drops first, member-only discounts and direct help with orders.
            </p>
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleJoin}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[2px] bg-[#171717] px-4 text-[12px] font-extrabold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#2a2a2a]"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Join free
            </a>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
