import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Truck,
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
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop' },
  { label: 'CUSTOM', href: '/customize' },
  { label: 'ABOUT US', href: '/about' },
  { label: 'CONTACT US', href: '/contact' },
];

const categoryShortcuts = [
  { label: 'T-Shirts', href: '/shop?category=t-shirts' },
  { label: 'Hoodies', href: '/shop?category=hoodies' },
  { label: 'Shirts', href: '/shop?category=shirts' },
  { label: 'Bottoms', href: '/shop?category=jeans' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
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


  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'shadow-md bg-[#FAF8F5]/98 backdrop-blur-xl'
          : 'shadow-2xs bg-[#FAF8F5]'
      )}
    >
      {/* ─── Slim Announcement Bar ─── */}
      <div
        className={cn(
          'w-full bg-[#F7EEDB] border-b border-[#DDD3C5] font-heading text-[10px] sm:text-xs tracking-[0.12em] font-bold text-[#171717] uppercase flex items-center justify-between transition-all duration-300 overflow-hidden',
          isScrolled ? 'max-h-0 py-0 opacity-0 border-none' : 'max-h-12 py-1.5 px-4 opacity-100'
        )}
      >
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <Truck size={13} className="text-[#E6321C] shrink-0" />
          <span>
            <strong className="text-[#E6321C] font-extrabold">FREE</strong> SHIPPING ON ORDERS ABOVE ₹999
          </span>
        </div>
        <a
          href="tel:+917981787317"
          className="hidden sm:inline-flex items-center gap-1.5 text-[#171717] hover:text-[#E6321C] transition-colors"
          aria-label="Call Bingooo Atelier"
        >
          <Phone size={12} className="text-[#E6321C]" />
          <span>ATELIER: +91 79817 87317</span>
        </a>
      </div>

      {/* ─── Main Header Navigation ─── */}
      <nav
        className={cn(
          'w-full border-b border-[#DDD3C5] transition-all duration-300',
          isScrolled ? 'bg-[#FAF8F5]/95 backdrop-blur-md' : 'bg-[#FAF8F5]'
        )}
      >
        <div
          className={cn(
            'max-w-[1360px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300',
            isScrolled ? 'h-13 sm:h-14 lg:h-15' : 'h-14 sm:h-16 lg:h-17'
          )}
        >
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 py-1 group" aria-label="Bingooo Home">
            <Logo variant="red" size="sm" className="sm:hidden transition-transform duration-200 group-hover:scale-105" />
            <Logo variant="red" size="md" className="hidden sm:inline-flex transition-transform duration-200 group-hover:scale-105" />
          </Link>

          {/* Center: Desktop Navigation */}
          <ul className="hidden items-center gap-6 lg:gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.href ||
                (link.href.includes('?') && location.search === link.href.split('?')[1]);
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={cn(
                      'relative py-1 font-heading text-xs lg:text-sm font-bold tracking-[0.06em] uppercase transition-colors duration-200',
                      isActive ? 'text-[#E6321C]' : 'text-[#171717] hover:text-[#E6321C]'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#E6321C]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right: Utility Icons & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton href="/shop" label="Search">
              <Search size={18} className="stroke-[1.8]" />
            </IconButton>

            {/* Desktop Only: Account & Wishlist */}
            <IconButton href="/account" label="Account" className="hidden sm:flex">
              <User size={18} className="stroke-[1.8]" />
            </IconButton>

            <IconButton href="/account/wishlist" label="Wishlist" className="hidden sm:flex">
              <Heart size={18} className="stroke-[1.8]" />
            </IconButton>

            {/* Cart Drawer Trigger - Visible on tablet/desktop, hidden on mobile */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => {
                triggerHaptic('light');
                openCartDrawer();
              }}
              className="relative hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag size={19} className="stroke-[1.8]" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1.3, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E6321C] text-[9px] font-bold text-white shadow-xs"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                triggerHaptic('light');
                openMobileMenu();
              }}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </motion.button>
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
                <Link
                  to="/shop"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD3C5] text-xs text-[#6F6A63] font-sans shadow-2xs"
                >
                  <Search size={15} className="text-[#E6321C]" />
                  <span>Search tees, hoodies, fits...</span>
                </Link>

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

function IconButton({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="flex items-center justify-center">
      <Link
        to={href}
        className={cn(
          'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors',
          className
        )}
        aria-label={label}
      >
        {children}
      </Link>
    </motion.div>
  );
}
