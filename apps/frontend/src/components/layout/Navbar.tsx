import { useState, useEffect } from 'react';
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
  LogOut,
  Shirt,
  HelpCircle,
  ShieldCheck,
  Phone,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import { useRecentlyViewedStore } from '../../store/recentlyViewed';
import { Logo } from '../ui/Logo';
import { WhatsAppIcon, getWhatsAppUrl } from '../ui/SocialIcons';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

const navLinks = [
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Women', href: '/shop?category=women' },
  { label: 'Custom', href: '/customize' },
  { label: 'Collections', href: '/shop' },
  { label: 'About', href: '/about' },
];

const categoryShortcuts = [
  { label: 'T-Shirts', href: '/category/t-shirts' },
  { label: 'Hoodies', href: '/category/hoodies' },
  { label: 'Shirts', href: '/category/shirts' },
  { label: 'Bottoms', href: '/category/jeans' },
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
  const { isAuthenticated, user, logout } = useAuthStore();
  const recentlyViewedCount = useRecentlyViewedStore((s) => s.items.length);

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


  // Lock body scroll and close on Escape when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeMobileMenu();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            <button
              onClick={() => {
                triggerHaptic('light');
                openSearchModal();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[17px] h-[17px] stroke-[1.5]">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <span>Search</span>
            </button>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors"
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
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors"
              aria-label="Wishlist"
            >
              <span className="text-sm leading-none">♡</span>
              <span>Wishlist</span>
            </Link>

            <button
              onClick={() => {
                triggerHaptic('light');
                openCartDrawer();
              }}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-normal text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <span className="text-base leading-none">🛍</span>
              <span className="hidden sm:inline">Cart</span>
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

      {/* ─── Full-Featured Mobile Slide-Over Drawer (Skill Section 14) ─── */}
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
              className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs md:hidden"
              aria-hidden="true"
            />

            {/* Slide Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-[340px] bg-[#FAF8F5] border-r border-[#DDD3C5] shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden"
              role="dialog"
              aria-label="Mobile Navigation"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-[#DDD3C5] flex items-center justify-between bg-[#F7EEDB]/70">
                <Logo variant="red" size="sm" />
                <button
                  onClick={closeMobileMenu}
                  className="p-1.5 rounded-full hover:bg-[#EDE0CC] text-[#171717] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto text-left">
                {/* Search Quick Bar */}
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    openSearchModal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD3C5] text-xs text-[#6F6A63] font-sans shadow-2xs hover:border-[#E6321C] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Search size={15} className="text-[#E6321C]" />
                    <span>Search tees, hoodies, fits...</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#171717]/60 bg-[#F7EEDB] px-1.5 py-0.5 rounded border border-[#DDD3C5]">
                    ⌘K
                  </span>
                </button>


                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/customize"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#B91F12] transition-colors text-center"
                  >
                    <Sparkles size={13} />
                    <span>Custom</span>
                  </Link>
                  <Link
                    to="/shop"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#171717] bg-[#171717] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E6321C] hover:border-[#E6321C] transition-colors text-center"
                  >
                    <ShoppingBag size={13} />
                    <span>Shop All</span>
                  </Link>
                </div>


                {/* Core Navigation Links */}
                <div className="space-y-1 border-b border-[#DDD3C5]/70 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E6321C] block px-2 mb-1.5 font-mono">
                    EXPLORE
                  </span>
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.href;
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors',
                          isActive
                            ? 'bg-[#EDE0CC] text-[#E6321C]'
                            : 'text-[#171717] hover:bg-[#EDE0CC]/60'
                        )}
                      >
                        <span>{link.label}</span>
                        <ChevronRight size={14} className="text-[#6F6A63]/60" />
                      </Link>
                    );
                  })}
                </div>

                {/* Category Shortcuts */}
                <div className="space-y-1 border-b border-[#DDD3C5]/70 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63] block px-2 mb-1.5 font-mono">
                    POPULAR CATEGORIES
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categoryShortcuts.map((cat) => (
                      <Link
                        key={cat.label}
                        to={cat.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#DDD3C5]/60 text-xs font-semibold text-[#171717] hover:border-[#E6321C] transition-colors"
                      >
                        <Shirt size={13} className="text-[#E6321C]" />
                        <span>{cat.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account & Orders */}
                <div className="space-y-1 border-b border-[#DDD3C5]/70 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63] block px-2 mb-1.5 font-mono">
                    MY BINGOOO
                  </span>
                  <Link
                    to="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <User size={15} className="text-[#6F6A63]" />
                      <span>{isAuthenticated ? (user?.fullName || 'My Account') : 'Sign In / Account'}</span>
                    </div>
                    <ChevronRight size={14} className="text-[#6F6A63]/60" />
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package size={15} className="text-[#6F6A63]" />
                      <span>Track Orders</span>
                    </div>
                    <ChevronRight size={14} className="text-[#6F6A63]/60" />
                  </Link>
                  <Link
                    to="/account/wishlist"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart size={15} className="text-[#6F6A63]" />
                      <span>Saved Wishlist</span>
                    </div>
                    <ChevronRight size={14} className="text-[#6F6A63]/60" />
                  </Link>
                  <Link
                    to="/recently-viewed"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye size={15} className="text-[#6F6A63]" />
                      <span>Recently Viewed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {recentlyViewedCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#EDE0CC] text-[10px] font-bold text-[#171717]">
                          {recentlyViewedCount}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-[#6F6A63]/60" />
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      openCartDrawer();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#171717] hover:bg-[#EDE0CC]/60 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag size={15} className="text-[#6F6A63]" />
                      <span>Shopping Bag</span>
                    </div>
                    {itemCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E6321C] text-[10px] font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Bulk Orders WhatsApp Mobile Card */}
                <div className="pt-2 pb-2">
                  <a
                    href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-3.5 bg-[#171717] text-white rounded-none border-l-4 border-[#E6321C] transition-all hover:bg-black"
                  >
                    <div>
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#E6321C] mb-0.5">
                        WHOLESALE & MERCH
                      </div>
                      <div className="text-xs font-black uppercase tracking-wider text-white">
                        Bulk Orders (WhatsApp) →
                      </div>
                    </div>
                    <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0" />
                  </a>
                </div>

                {/* Customer Care & Policies */}
                <div className="space-y-1 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63] block px-2 mb-1.5 font-mono">
                    CUSTOMER CARE
                  </span>
                  <Link
                    to="/contact"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#6F6A63] hover:text-[#171717]"
                  >
                    <HelpCircle size={14} />
                    <span>Help & Support</span>
                  </Link>
                  <Link
                    to="/policies"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#6F6A63] hover:text-[#171717]"
                  >
                    <ShieldCheck size={14} />
                    <span>Shipping & Returns Policy</span>
                  </Link>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#E6321C] hover:bg-[#FDF0EE] rounded-lg w-full text-left mt-2"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Drawer Bottom Support Footer */}
              <div className="p-4 border-t border-[#DDD3C5] bg-[#EDE0CC]/60 space-y-2.5 text-left">
                <a
                  href={getWhatsAppUrl('Hi Bingooo, I would like to chat about your menswear and orders.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wide shadow-xs hover:bg-[#1EBE5D] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>

                <a
                  href="tel:+917981787317"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white border border-[#DDD3C5] text-[#171717] text-xs font-bold uppercase tracking-wide shadow-xs hover:border-[#E6321C] hover:text-[#E6321C] transition-colors"
                >
                  <Phone size={14} className="text-[#E6321C]" />
                  <span>Call Atelier: +91 79817 87317</span>
                </a>

                <div className="text-center text-[10px] text-[#6F6A63] font-sans">
                  Bingooo Mens Wear &bull; Srikakulam Atelier
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

