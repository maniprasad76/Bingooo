import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { Logo } from '../ui/Logo';

const navLinks = [
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop' },
  { label: 'CUSTOM', href: '/customize' },
  { label: 'ABOUT US', href: '/about' },
  { label: 'CONTACT US', href: '/contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 shadow-2xs">
      {/* ─── Slim Announcement Bar ─── */}
      <div className="w-full bg-[#F7EEDB] border-b border-[#DDD3C5] py-1.5 px-3 text-center font-heading text-[10px] sm:text-xs tracking-[0.12em] font-bold text-[#171717] uppercase flex items-center justify-center gap-1.5">
        <Truck size={13} className="text-[#E6321C] shrink-0" />
        <span>
          <strong className="text-[#E6321C] font-extrabold">FREE</strong> SHIPPING ON ORDERS ABOVE ₹999
        </span>
      </div>

      {/* ─── Main Header Navigation (Compact & Adaptable) ─── */}
      <nav className="w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#DDD3C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-14 sm:h-16 lg:h-17 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand Logo (Responsive Sizing) */}
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

          {/* Right: Utility Icons & Cart (Clean & Non-Crowded on Mobile) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <IconButton href="/shop" label="Search">
              <Search size={18} className="stroke-[1.8]" />
            </IconButton>

            {/* Desktop Only: Account & Wishlist (Handled by floating dock on mobile) */}
            <IconButton href="/account" label="Account" className="hidden sm:flex">
              <User size={18} className="stroke-[1.8]" />
            </IconButton>

            <IconButton href="/account/wishlist" label="Wishlist" className="hidden sm:flex">
              <Heart size={18} className="stroke-[1.8]" />
            </IconButton>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => useCartStore.getState().openDrawer()}
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag size={19} className="stroke-[1.8]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E6321C] text-[9px] font-bold text-white shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-[#DDD3C5] bg-[#FAF8F5] px-5 py-5 md:hidden shadow-xl"
          >
            <ul className="flex flex-col gap-2.5 font-heading text-xs font-bold uppercase tracking-wider">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center justify-between text-[#171717] hover:text-[#E6321C] py-2 border-b border-[#DDD3C5]/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-3 flex gap-3">
                <Link
                  to="/customize"
                  className="flex-1 py-2.5 text-center bg-[#E6321C] hover:bg-[#B91F12] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Custom
                </Link>
                <Link
                  to="/shop"
                  className="flex-1 py-2.5 text-center border border-[#171717] hover:border-[#E6321C] text-[#171717] hover:text-[#E6321C] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop Drops
                </Link>
              </li>
            </ul>
          </motion.div>
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
  );
}
