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
  Phone,
  Eye,
  ArrowRight,
  Ruler,
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
  { label: 'T-Shirts', spec: '240+ GSM', sub: 'Oversized & Heavy', href: '/category/t-shirts' },
  { label: 'Hoodies', spec: '400 GSM', sub: 'Boxy Winter Fleece', href: '/category/hoodies' },
  { label: 'Shirts', spec: 'RELAXED', sub: 'Cuban & Atelier Cut', href: '/category/shirts' },
  { label: 'Bottoms', spec: 'STREET', sub: 'Cargoes & Denims', href: '/category/jeans' },
];

const drawerTrustItems = [
  { icon: '🚚', title: 'Free Delivery', sub: 'Above ₹999' },
  { icon: '📦', title: '15-Day Exchange', sub: 'Doorstep pickup' },
  { icon: '✦', title: '240+ GSM Luxury', sub: 'Heavyweight cotton' },
  { icon: '♙', title: '100% Secure', sub: 'UPI & Cards' },
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
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[360px] bg-[#FAF8F5] border-r border-[#DDD3C5] shadow-2xl flex flex-col justify-between overflow-hidden md:hidden"
              role="dialog"
              aria-label="Mobile Navigation"
            >
              {/* Drawer Top Header (Editorial Atelier) */}
              <div className="p-4 border-b border-[#DDD3C5] flex items-center justify-between bg-[#F7EEDB]">
                <div className="flex items-center gap-2.5">
                  <Logo variant="red" size="sm" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-[#6F6A63] pl-2.5 border-l border-[#DDD3C5]">
                    EST. 2026
                  </span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    closeMobileMenu();
                  }}
                  className="w-8 h-8 rounded-full border border-[#DDD3C5] bg-white/80 hover:bg-white flex items-center justify-center text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto text-left">
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

                {/* ─── Editorial Gender / Department Split (Inspired by Homepage Category Strip) ─── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#171717]">
                      COLLECTIONS / DEPARTMENTS
                    </span>
                    <span className="text-[9px] font-mono text-[#E6321C] font-bold">
                      DROP 001
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Men Visual Card */}
                    <Link
                      to="/shop?category=men"
                      onClick={() => {
                        triggerHaptic('light');
                        closeMobileMenu();
                      }}
                      className="group relative h-[104px] overflow-hidden rounded-md border border-[#DDD3C5] bg-[#171717] block"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=500&q=80"
                        alt="Men collection"
                        className="h-full w-full object-cover grayscale transition-transform duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                        <span className="text-[8px] font-mono text-[#E6321C] uppercase tracking-wider font-bold">
                          FOR HIM
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight m-0">
                          MEN
                        </h4>
                        <span className="text-[9px] font-bold text-[#F7EEDB] uppercase flex items-center gap-1 group-hover:text-[#E6321C] transition-colors">
                          SHOP NOW <ArrowRight size={10} />
                        </span>
                      </div>
                    </Link>

                    {/* Women Visual Card */}
                    <Link
                      to="/shop?category=women"
                      onClick={() => {
                        triggerHaptic('light');
                        closeMobileMenu();
                      }}
                      className="group relative h-[104px] overflow-hidden rounded-md border border-[#DDD3C5] bg-[#171717] block"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80"
                        alt="Women collection"
                        className="h-full w-full object-cover grayscale transition-transform duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                        <span className="text-[8px] font-mono text-[#E6321C] uppercase tracking-wider font-bold">
                          FOR HER
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight m-0">
                          WOMEN
                        </h4>
                        <span className="text-[9px] font-bold text-[#F7EEDB] uppercase flex items-center gap-1 group-hover:text-[#E6321C] transition-colors">
                          SHOP NOW <ArrowRight size={10} />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* ─── Custom Atelier Card (Inspired by Homepage "YOUR IDEA. OUR CANVAS.") ─── */}
                <Link
                  to="/customize"
                  onClick={() => {
                    triggerHaptic('medium');
                    closeMobileMenu();
                  }}
                  className="group block relative overflow-hidden rounded-md bg-[#171717] border border-[#171717] border-l-4 border-l-[#E6321C] p-3.5 text-white transition-all hover:bg-black shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E6321C]/20 border border-[#E6321C]/30 text-[9px] font-mono font-bold text-[#E6321C] uppercase tracking-wider">
                      <Sparkles size={10} />
                      CUSTOM 3D ATELIER
                    </span>
                    <span className="text-[9px] font-mono text-white/50 uppercase">
                      BINGOOO LAB
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white m-0 group-hover:text-[#F7EEDB] transition-colors">
                    YOUR IDEA. OUR CANVAS.
                  </h3>
                  <p className="text-[11px] text-[#c7c3bd] leading-relaxed mt-1 mb-2.5">
                    Design your bespoke oversized tee, hoodie or boxy fit with precision graphics.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E6321C] group-hover:translate-x-0.5 transition-transform">
                    <span>START CREATING</span>
                    <ArrowRight size={13} />
                  </div>
                </Link>

                {/* ─── Popular Silhouettes (Replaced generic 4 pills with editorial cards) ─── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63]">
                      SIGNATURE SILHOUETTES
                    </span>
                    <Link
                      to="/shop"
                      onClick={closeMobileMenu}
                      className="text-[9px] font-bold uppercase text-[#E6321C] hover:underline"
                    >
                      ALL FITS →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryShortcuts.map((cat) => (
                      <Link
                        key={cat.label}
                        to={cat.href}
                        onClick={() => {
                          triggerHaptic('light');
                          closeMobileMenu();
                        }}
                        className="group flex flex-col justify-between p-2.5 rounded-md bg-white border border-[#DDD3C5] hover:border-[#171717] transition-all hover:bg-[#F7EEDB]/30"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-black uppercase text-[#171717] group-hover:text-[#E6321C] transition-colors">
                            {cat.label}
                          </span>
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EDE0CC] text-[#171717]">
                            {cat.spec}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6F6A63] mt-1.5 leading-tight">
                          {cat.sub}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* ─── Core Atelier Links ─── */}
                <div className="space-y-1 border-t border-b border-[#DDD3C5]/80 py-3">
                  <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63] block px-1 mb-1">
                    EXPLORE ATELIER
                  </span>
                  <Link
                    to="/shop"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-2 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-[#171717] hover:bg-[#EDE0CC]/60 transition-colors"
                  >
                    <span>All Collections & Lookbook</span>
                    <ChevronRight size={13} className="text-[#6F6A63]" />
                  </Link>
                  <Link
                    to="/about"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-2 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-[#171717] hover:bg-[#EDE0CC]/60 transition-colors"
                  >
                    <span>About Bingooo & Textile Roots</span>
                    <ChevronRight size={13} className="text-[#6F6A63]" />
                  </Link>
                  <Link
                    to="/size-guide"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-2 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-[#171717] hover:bg-[#EDE0CC]/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Ruler size={13} className="text-[#E6321C]" />
                      <span>Size & Fit Guide (240+ GSM)</span>
                    </div>
                    <ChevronRight size={13} className="text-[#6F6A63]" />
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-2 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-[#171717] hover:bg-[#EDE0CC]/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package size={13} className="text-[#E6321C]" />
                      <span>Live Order Tracking</span>
                    </div>
                    <ChevronRight size={13} className="text-[#6F6A63]" />
                  </Link>
                </div>

                {/* ─── My Bingooo Account & Quick Access ─── */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63] block px-1 mb-1">
                    MY BINGOOO
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={isAuthenticated ? '/account' : '/login'}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 p-2 rounded-md bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors"
                    >
                      <User size={14} className="text-[#E6321C]" />
                      <span className="truncate">{isAuthenticated ? (user?.fullName?.split(' ')[0] || 'Account') : 'Sign In'}</span>
                    </Link>
                    <Link
                      to="/account/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between p-2 rounded-md bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Heart size={14} className="text-[#E6321C]" />
                        <span>Wishlist</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#6F6A63]">♡</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        closeMobileMenu();
                        openCartDrawer();
                      }}
                      className="flex items-center justify-between p-2 rounded-md bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-[#E6321C]" />
                        <span>Bag</span>
                      </div>
                      {itemCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#E6321C] text-[9px] font-bold text-white leading-none">
                          {itemCount}
                        </span>
                      )}
                    </button>
                    <Link
                      to="/recently-viewed"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between p-2 rounded-md bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Eye size={14} className="text-[#6F6A63]" />
                        <span>Recent</span>
                      </div>
                      {recentlyViewedCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#EDE0CC] text-[9px] font-bold text-[#171717] leading-none">
                          {recentlyViewedCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

                {/* ─── Wholesale & Bulk Merch WhatsApp ─── */}
                <a
                  href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between p-3 bg-[#171717] text-white rounded-md border-l-4 border-[#E6321C] transition-all hover:bg-black group"
                >
                  <div>
                    <div className="text-[8px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#E6321C] mb-0.5">
                      WHOLESALE & MERCH
                    </div>
                    <div className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#F7EEDB] transition-colors flex items-center gap-1">
                      <span>Bulk Orders (WhatsApp)</span>
                      <ArrowRight size={11} className="text-[#E6321C]" />
                    </div>
                  </div>
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0" />
                </a>

                {/* ─── Homepage-Inspired Micro Trust Grid ─── */}
                <div className="p-2.5 rounded-md bg-[#F7EEDB] border border-[#DDD3C5] grid grid-cols-2 gap-2">
                  {drawerTrustItems.map((item) => (
                    <div key={item.title} className="flex items-center gap-1.5">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#171717] leading-tight m-0">{item.title}</p>
                        <p className="text-[8px] text-[#6F6A63] leading-tight m-0">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Care Links */}
                <div className="flex items-center justify-between text-[11px] text-[#6F6A63] px-1 pt-1 pb-2 font-medium">
                  <Link to="/faq" onClick={closeMobileMenu} className="hover:text-[#171717]">FAQ & Help</Link>
                  <span>•</span>
                  <Link to="/policies" onClick={closeMobileMenu} className="hover:text-[#171717]">Shipping & Returns</Link>
                  <span>•</span>
                  <Link to="/contact" onClick={closeMobileMenu} className="hover:text-[#171717]">Contact</Link>
                  {isAuthenticated && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="text-[#E6321C] font-bold hover:underline cursor-pointer"
                      >
                        Log Out
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer Bottom Support Footer */}
              <div className="p-3.5 border-t border-[#DDD3C5] bg-[#EDE0CC]/70 space-y-2 text-left">
                <a
                  href={getWhatsAppUrl('Hi Bingooo, I would like to chat about your menswear and orders.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-2xs hover:bg-[#1EBE5D] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>

                <a
                  href="tel:+917981787317"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-white border border-[#DDD3C5] text-[#171717] text-xs font-bold uppercase tracking-wider shadow-2xs hover:border-[#E6321C] hover:text-[#E6321C] transition-colors"
                >
                  <Phone size={13} className="text-[#E6321C]" />
                  <span>Call Atelier: +91 79817 87317</span>
                </a>

                <div className="text-center text-[9px] font-mono text-[#6F6A63] uppercase tracking-wider">
                  BINGOOO ATELIER &bull; SRIKAKULAM &bull; EST. 2026
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

