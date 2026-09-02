import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { Logo } from '../ui/Logo';

const navLinks = [
  { label: 'MEN', href: '/shop' },
  { label: 'T-SHIRTS', href: '/shop?category=t-shirts' },
  { label: 'HOODIES', href: '/shop?category=hoodies' },
  { label: 'JEANS', href: '/shop?category=jeans' },
  { label: 'CUSTOM', href: '/customize' },
  { label: 'NEW ARRIVALS', href: '/shop?sort=newest' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* ─── Top Announcement Bar ─── */}
      <div className="w-full bg-[#F7EEDB] border-b border-[#DDD3C5] py-2 px-4 text-center font-heading text-xs tracking-[0.14em] font-bold text-[#171717] uppercase flex items-center justify-center gap-2">
        <Truck size={14} className="text-[#E6321C]" />
        <span>
          <strong className="text-[#E6321C] font-extrabold">FREE</strong> SHIPPING ON ORDERS ABOVE ₹999
        </span>
      </div>

      {/* ─── Main Header Navigation ─── */}
      <nav className="w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#DDD3C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 py-1 group" aria-label="Bingooo Home">
            <Logo variant="red" size="md" className="transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Center: Desktop Navigation */}
          <ul className="hidden items-center gap-7 lg:gap-9 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href.includes('?') && location.search === link.href.split('?')[1]);
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={cn(
                      'relative py-1 font-heading text-sm font-bold tracking-[0.06em] uppercase transition-colors duration-200',
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
          <div className="flex items-center gap-2 sm:gap-4">
            <IconButton href="/shop" label="Search">
              <Search size={19} className="stroke-[1.8]" />
            </IconButton>

            <IconButton href="/account" label="Account">
              <User size={19} className="stroke-[1.8]" />
            </IconButton>

            <IconButton href="/account/wishlist" label="Wishlist">
              <Heart size={19} className="stroke-[1.8]" />
            </IconButton>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => useCartStore.getState().openDrawer()}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag size={20} className="stroke-[1.8]" />
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-[#E6321C] text-[10px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#171717] hover:text-[#E6321C] transition-colors md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
            className="border-b border-[#EAE0D4] bg-[#FAF7F2] px-6 py-6 md:hidden shadow-xl"
          >
            <ul className="flex flex-col gap-3 font-semibold text-sm">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center justify-between text-[#22201E] hover:text-[#C84825] py-2 border-b border-[#EAE0D4]/60 tracking-wider"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-3 flex gap-4">
                <Link
                  to="/customize"
                  className="flex-1 py-3 text-center bg-[#C84825] text-white rounded-md text-xs font-bold uppercase tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Custom
                </Link>
                <Link
                  to="/shop"
                  className="flex-1 py-3 text-center border border-[#C84825] text-[#C84825] rounded-md text-xs font-bold uppercase tracking-wider"
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
        'flex h-10 w-10 items-center justify-center rounded-lg text-[#22201E] hover:text-[#C84825] transition-colors',
        className
      )}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
