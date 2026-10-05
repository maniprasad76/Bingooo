import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Sparkles, Tag, X } from 'lucide-react';
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
  useEffect(() => {
    if (!shouldInvite()) return;
    let retries = 0;
    let timer: ReturnType<typeof setTimeout>;
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
    timer = setTimeout(attempt, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-[#171717]/60 backdrop-blur-sm cursor-default"
            onClick={closeInvite}
          />

          {/* Phones: bottom sheet flush with the screen edge. sm+: centered card. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-invite-title"
            className="relative w-full sm:max-w-[420px] max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#DDD3C5] bg-[#F7EEDB] text-[#171717] shadow-2xl font-sans"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="sm:hidden mx-auto mt-2.5 h-1 w-10 rounded-full bg-[#DDD3C5]" aria-hidden="true" />

            <div className="px-6 pt-5 sm:pt-6 sm:px-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD3C5] bg-[#EDE0CC] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#E6321C]">
                  <Sparkles size={11} />
                  Bingooo. Community
                </span>
                <button
                  type="button"
                  onClick={closeInvite}
                  aria-label="Close invitation"
                  className="-mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#6F6A63] hover:bg-[#EDE0CC] hover:text-[#171717] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h2 id="community-invite-title" className="m-0 text-[22px] font-extrabold uppercase leading-tight tracking-[-0.03em]">
                You're invited to our WhatsApp community
              </h2>
              <p className="mt-2.5 mb-0 text-[13px] leading-relaxed text-[#6F6A63]">
                We'd love to have you with us. Members hear about new drops first and get exclusive discounts we don't post anywhere else.
              </p>

              <ul className="mt-5 mb-0 space-y-3.5 p-0 list-none">
                <li className="flex items-start gap-3">
                  <Tag size={16} className="mt-px shrink-0 text-[#E6321C]" aria-hidden="true" />
                  <span className="text-[12.5px] leading-snug">
                    <strong className="font-bold">Member-only discounts</strong> and early access to every new drop
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle size={16} className="mt-px shrink-0 text-[#171717]" aria-hidden="true" />
                  <span className="text-[12.5px] leading-snug">
                    <strong className="font-bold">Talk to our team directly</strong> — if you ever have a question or an issue with an order, just message us there and we'll help you out.
                  </span>
                </li>
              </ul>

              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleJoin}
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#171717] px-4 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#2a2a2a]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Join the community
              </a>
              <button
                type="button"
                onClick={closeInvite}
                className="mt-2 w-full rounded-xl px-4 py-2.5 text-[12px] font-semibold text-[#6F6A63] hover:text-[#171717] transition-colors"
              >
                Maybe later
              </button>
              <p className="mt-1 mb-0 text-center text-[10px] text-[#6F6A63]/80">Free to join · Leave anytime</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
