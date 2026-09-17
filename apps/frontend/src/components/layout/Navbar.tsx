import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  X,
  Sparkles,
  Package,
  ChevronRight,
  Phone,
  Eye,
  Ruler,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import { Logo } from '../ui/Logo';
import { WhatsAppIcon, getWhatsAppUrl } from '../ui/SocialIcons';
import { triggerHaptic } from '../../lib/native/capacitorBridge';
import { preloadRouteChunk } from '../../lib/utils/preloader';

const navLinks = [
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Women', href: '/shop?category=women' },
  { label: 'Custom', href: '/customize' },
  { label: 'Collections', href: '/shop' },
  { label: 'About', href: '/about' },
];

const categoryShortcuts = [
  { label: 'T-Shirts', spec: '240+ GSM', sub: 'Oversized & Heavy', href: '/category/t-shirts' },
  { label: 'Hoodies', spec: '400 GSM', sub: 'Boxy Winter Fleece', href: '/category/hoodies' },
  { label: 'Shirts', spec: 'RELAXED', sub: 'Cuban & Atelier Cut', href: '/category/shirts' },
  { label: 'Bottoms', spec: 'STREET', sub: 'Cargoes & Denims', href: '/category/jeans' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const openSearchModal = useUIStore((s) => s.openSearchModal);
  const location = useLocation();

  const itemCount = useCartStore((s) => s.itemCount);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Track scroll position for sticky header elevation & compression
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, location.search, closeMobileMenu]);


  // Lock background scroll and close on Escape when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeMobileMenu();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'shadow-md bg-[#FAF8F5]/98 backdrop-blur-xl'
          : 'shadow-2xs bg-[#FAF8F5]'
      )}
    >
      {/* ─── Top Bar ─── */}
      <div className="min-h-[28px] bg-[#171717] text-white flex items-center justify-between px-4 sm:px-8 text-[9px] font-semibold tracking-[0.08em] uppercase select-none">
        <div>FREE DELIVERY ON ORDERS ABOVE ₹999</div>

        <div className="hidden sm:flex items-center gap-[22px]">
          <a
            href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#25D366] text-[#F7EEDB] transition-colors inline-flex items-center gap-1.5 font-bold"
          >
            <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
            <span>BULK ORDERS (WHATSAPP)</span>
          </a>
          <Link to="/track-order" className="hover:text-[#E6321C] transition-colors">TRACK ORDER</Link>
          <Link to="/faq" className="hover:text-[#E6321C] transition-colors">HELP</Link>
        </div>
      </div>

      {/* ─── Header ─── */}
      <nav className="h-[64px] md:h-[76px] bg-[#F7EEDB] border-b border-[#DDD3C5] flex items-center relative z-40">
        <div className="w-[min(calc(100%-32px),1440px)] md:w-[min(calc(100%-48px),1440px)] mx-auto grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-[30px]">
          {/* Left: Navigation links */}
          <div className="hidden md:flex items-center gap-[27px]">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href.includes('?') && location.search === link.href.split('?')[1]);

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onMouseEnter={() => preloadRouteChunk(link.href)}
                  onTouchStart={() => preloadRouteChunk(link.href)}
                  className={cn(
                    'text-[11px] font-semibold uppercase transition-colors tracking-normal',
                    isActive ? 'text-[#E6321C]' : 'text-[#171717] hover:text-[#E6321C]'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Center: Logo */}
          <Link
            to="/"
            className="text-[clamp(25px,2.4vw,34px)] leading-none font-extrabold tracking-[-0.07em] whitespace-nowrap justify-self-center text-[#171717]"
            aria-label="BINGOOO."
          >
            BINGOOO<span className="text-[#E6321C]">.</span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-1.5 md:gap-5">
            <button
              onClick={() => {
                triggerHaptic('light');
                openSearchModal();
              }}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer p-2 md:p-0"
              aria-label="Search"
            >
              <Search className="w-5 h-5 md:w-[17px] md:h-[17px] stroke-[1.6]" />
              <span className="hidden md:inline">Search</span>
            </button>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              onMouseEnter={() => preloadRouteChunk('/account')}
              className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors"
              aria-label="Login"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[17px] h-[17px] stroke-[1.5]">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c.8-4.2 3.4-6 8-6s7.2 1.8 8 6" />
              </svg>
              <span>{isAuthenticated ? 'Account' : 'Login'}</span>
            </Link>

            <Link
              to="/account/wishlist"
              onMouseEnter={() => preloadRouteChunk('/account')}
              className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Wishlist</span>
            </Link>

            <button
              onClick={() => {
                triggerHaptic('light');
                openCartDrawer();
              }}
              onMouseEnter={() => preloadRouteChunk('/cart')}
              className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              <span>({itemCount})</span>
            </button>

            {/* Menu toggle */}
            <button
              onClick={() => {
                triggerHaptic('light');
                openMobileMenu();
              }}
              className="md:hidden p-2 text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Full-Featured Mobile Slide-Over Drawer Portaled to Body ─── */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={closeMobileMenu}
                  onTouchMove={(e) => e.preventDefault()}
                  className="fixed inset-0 z-[9998] bg-[#171717]/65 backdrop-blur-xs md:hidden"
                  aria-hidden="true"
                />

                {/* Slide Drawer Panel */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed top-0 bottom-0 left-0 z-[9999] w-[88vw] max-w-[360px] h-[100dvh] max-h-[100dvh] bg-[#FAF8F5] border-r border-[#DDD3C5] shadow-2xl flex flex-col overflow-hidden md:hidden overscroll-contain"
                  role="dialog"
                  aria-label="Mobile Navigation"
                >
                  {/* Drawer Top Header */}
                  <div className="p-4 border-b border-[#DDD3C5] flex items-center justify-between bg-[#F7EEDB] shrink-0">
                    <div className="flex items-center gap-2.5">
                      <Logo variant="red" size="sm" />
                    </div>
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        closeMobileMenu();
                      }}
                      className="w-8 h-8 rounded-full border border-[#DDD3C5] bg-white hover:bg-[#171717] hover:text-white flex items-center justify-center text-[#171717] transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Drawer Scrollable Content */}
                  <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto text-left overscroll-contain no-scrollbar">
                    {/* Search Quick Bar */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        closeMobileMenu();
                        openSearchModal();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white border border-[#DDD3C5] text-xs text-[#6F6A63] font-sans shadow-2xs hover:border-[#171717] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Search size={15} className="text-[#E6321C] group-hover:scale-110 transition-transform" />
                        <span className="text-[#6F6A63] group-hover:text-[#171717] transition-colors">Search tees, hoodies, fits...</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#171717]/70 bg-[#F7EEDB] px-1.5 py-0.5 rounded border border-[#DDD3C5]">
                        ⌘K
                      </span>
                    </button>

                    {/* ─── Primary Navigation Links ─── */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63] block px-1 mb-2">
                        NAVIGATION
                      </span>

                      <Link
                        to="/shop?category=men"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EDE0CC]/50 text-[#171717] font-bold text-sm uppercase tracking-wider transition-colors group"
                      >
                        <span>MEN</span>
                        <ChevronRight size={15} className="text-[#6F6A63] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/shop?category=women"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EDE0CC]/50 text-[#171717] font-bold text-sm uppercase tracking-wider transition-colors group"
                      >
                        <span>WOMEN</span>
                        <ChevronRight size={15} className="text-[#6F6A63] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/customize"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#E6321C]/8 border border-[#E6321C]/20 text-[#171717] font-extrabold text-sm uppercase tracking-wider transition-colors group hover:bg-[#E6321C]/15"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles size={15} className="text-[#E6321C]" />
                          <span>CUSTOM STUDIO</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E6321C] text-white uppercase">
                          3D ATELIER
                        </span>
                      </Link>

                      <Link
                        to="/shop"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#EDE0CC]/50 text-[#171717] font-bold text-sm uppercase tracking-wider transition-colors group"
                      >
                        <span>ALL COLLECTIONS</span>
                        <ChevronRight size={15} className="text-[#6F6A63] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>

                    {/* ─── Categories Quick Grid ─── */}
                    <div className="space-y-2 pt-2 border-t border-[#DDD3C5]">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63] block px-1">
                        POPULAR FITS
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryShortcuts.map((cat) => (
                          <Link
                            key={cat.label}
                            to={cat.href}
                            onClick={() => {
                              triggerHaptic('light');
                              closeMobileMenu();
                            }}
                            className="p-2.5 rounded-lg bg-white border border-[#DDD3C5] hover:border-[#171717] transition-all flex flex-col justify-between group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase text-[#171717] group-hover:text-[#E6321C] transition-colors">
                                {cat.label}
                              </span>
                              <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[#EDE0CC] text-[#171717]">
                                {cat.spec}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#6F6A63] mt-1 leading-tight">
                              {cat.sub}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* ─── Useful Brand & Service Links ─── */}
                    <div className="space-y-1 pt-2 border-t border-[#DDD3C5]">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63] block px-1 mb-1">
                        HELP & SERVICES
                      </span>
                      <Link
                        to="/size-guide"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Ruler size={14} className="text-[#6F6A63]" />
                          <span>Size & Fit Guide</span>
                        </div>
                        <ChevronRight size={13} className="text-[#6F6A63]" />
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package size={14} className="text-[#6F6A63]" />
                          <span>Track Your Order</span>
                        </div>
                        <ChevronRight size={13} className="text-[#6F6A63]" />
                      </Link>
                      <Link
                        to="/about"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Eye size={14} className="text-[#6F6A63]" />
                          <span>About Bingooo Story</span>
                        </div>
                        <ChevronRight size={13} className="text-[#6F6A63]" />
                      </Link>
                      <Link
                        to="/contact"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Phone size={14} className="text-[#6F6A63]" />
                          <span>Contact Us</span>
                        </div>
                        <ChevronRight size={13} className="text-[#6F6A63]" />
                      </Link>
                    </div>

                    {/* ─── Account / Wishlist ─── */}
                    <div className="pt-2 border-t border-[#DDD3C5]">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={isAuthenticated ? '/account' : '/login'}
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors"
                        >
                          <User size={14} className="text-[#E6321C]" />
                          <span>{isAuthenticated ? 'My Account' : 'Sign In'}</span>
                        </Link>
                        <Link
                          to="/account/wishlist"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors"
                        >
                          <Heart size={14} className="text-[#E6321C]" />
                          <span>Wishlist</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Bottom Pinned Support Footer */}
                  <div
                    className="p-3.5 border-t border-[#DDD3C5] bg-[#F7EEDB] space-y-2 text-left shrink-0"
                    style={{ paddingBottom: 'max(14px, calc(env(safe-area-inset-bottom, 0px) + 12px))' }}
                  >
                    <a
                      href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about your apparel.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#171717] active:bg-[#252525] hover:bg-[#252525] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                      <span>WhatsApp Concierge</span>
                    </a>
                    <div className="text-center text-[9px] font-mono text-[#6F6A63] uppercase tracking-wider">
                      BINGOOO &bull; WEAR WHAT DEFINES YOU
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}

