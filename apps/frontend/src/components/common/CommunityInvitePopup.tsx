import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { X, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { WhatsAppIcon, BINGOOO_COMMUNITY_URL } from '../ui/SocialIcons';
import { useUIStore } from '../../store/ui';
import { useCartStore } from '../../store/cart';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

const COMMUNITY_URL = BINGOOO_COMMUNITY_URL;
const STORAGE_KEY = 'bingooo_team_community_v1';
const SHOW_DELAY_MS = 2400; // Trigger smoothly 2.4s after initial mount
const SNOOZE_MS = 24 * 60 * 60 * 1000; // 24 hours snooze if dismissed

// Never interrupt checkout or auth flows
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
    // Storage unavailable
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
      } else if (retries++ < 5) {
        timer = setTimeout(attempt, 8000);
      }
    };

    timer = setTimeout(attempt, SHOW_DELAY_MS);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [openInvite]);

  // Dismiss records 24h snooze
  useEffect(() => {
    if (wasOpenRef.current && !open && !joinedRef.current) {
      writeRecord('dismissed');
    }
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

  const handleDismiss = () => {
    triggerHaptic('light');
    closeInvite();
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="community-invite-title"
          className="fixed z-[95] left-3 right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+84px)] md:left-auto md:right-6 md:bottom-6 md:w-[380px] bg-[#F7EEDB] text-[#171717] border-2 border-[#171717] shadow-[6px_6px_0px_#171717] font-sans overflow-hidden"
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          {/* Top Brand Banner */}
          <div className="bg-[#171717] text-[#F7EEDB] px-3.5 py-1.5 flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase border-b-2 border-[#171717]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>TEAM BINGOOO COMMUNITY</span>
            </div>
            <span className="text-[#E6321C]">WHATSAPP VIP</span>
          </div>

          <div className="p-4 sm:p-5 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close invitation"
              className="absolute right-2.5 top-2.5 w-8 h-8 rounded-none border border-[#171717] bg-[#F7EEDB] text-[#171717] hover:bg-[#E6321C] hover:text-white transition-colors grid place-items-center shadow-[1px_1px_0px_#171717]"
            >
              <X size={15} />
            </button>

            {/* Title */}
            <div className="pr-8">
              <h2 id="community-invite-title" className="m-0 text-lg sm:text-xl font-black uppercase tracking-tight leading-tight text-[#171717]">
                JOIN TEAM BINGOOO<span className="text-[#E6321C]">.</span>
              </h2>
              <p className="mt-1 text-xs text-[#171717]/80 font-medium leading-relaxed">
                Be in our inner circle. Get early drop alerts, secret discounts & direct atelier support.
              </p>
            </div>

            {/* Perks Badges */}
            <div className="my-3 py-2.5 px-3 bg-white/70 border border-[#171717]/20 flex flex-col gap-1.5 text-[11px] font-mono text-[#171717]">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles size={13} className="text-[#E6321C] shrink-0" />
                <span>Priority Early Drop Access</span>
              </div>
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck size={13} className="text-[#25D366] shrink-0" />
                <span>Exclusive Member Flash Discounts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3.5">
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleJoin}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-[#171717] font-black text-xs font-mono uppercase tracking-wider border-2 border-[#171717] shadow-[3px_3px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] transition-all no-underline"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>JOIN COMMUNITY</span>
                <ArrowRight size={13} className="shrink-0 ml-0.5" />
              </a>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-2 px-3 text-[11px] font-mono font-bold text-[#171717]/70 hover:text-[#171717] uppercase tracking-wider text-center transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
