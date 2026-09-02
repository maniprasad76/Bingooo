import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { Logo } from '../ui/Logo';

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/shop?collection=all' },
  { label: '2D Studio', href: '/customize', highlight: true },
  { label: 'Drops', href: '/shop?sort=newest' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-white/85 backdrop-blur-xl transition-all duration-300">
      <nav className="container-wide flex h-16 items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 py-1 group" aria-label="Bingooo Home">
          <Logo variant="red" size="md" className="transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Center: Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    'relative py-1 text-xs font-mono font-bold uppercase tracking-[0.18em] transition-colors duration-200',
                    isActive ? 'text-brand-red' : 'text-ink/80 hover:text-brand-red',
                    link.highlight && 'flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/30 hover:bg-brand-red hover:text-white'
                  )}
                >
                  {link.highlight && <Sparkles size={12} className="animate-pulse" />}
                  {link.label}
                  {isActive && !link.highlight && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-1 h-0.5 bg-brand-red"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: Actions & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            to="/customize"
            className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-white hover:bg-brand-red text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-glow"
          >
            <Sparkles size={13} className="text-accent-gold" />
            <span>Open Studio</span>
          </Link>

          <IconButton href="/shop" label="Search" className="hidden sm:flex">
            <Search size={18} />
          </IconButton>

          <IconButton href="/account/wishlist" label="Wishlist" className="hidden sm:flex">
            <Heart size={18} />
          </IconButton>

          <IconButton href="/account" label="Account" className="hidden sm:flex">
            <User size={18} />
          </IconButton>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => useCartStore.getState().openDrawer()}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-paper hover:bg-ink hover:text-white text-ink transition-all shadow-sm"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-mono font-bold text-white shadow-glow"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </motion.span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-ink hover:bg-ink hover:text-white transition-all md:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-white px-6 py-6 md:hidden shadow-xl"
          >
            <ul className="flex flex-col gap-4 font-mono text-sm font-bold">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="flex items-center justify-between text-ink hover:text-brand-red py-2 border-b border-border/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    {link.highlight && <Sparkles size={14} className="text-brand-red" />}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  to="/account"
                  className="block text-muted hover:text-ink text-xs font-mono uppercase tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account / Orders
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
        'flex h-10 w-10 items-center justify-center rounded-xl bg-paper hover:bg-ink hover:text-white text-ink transition-all shadow-sm',
        className
      )}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
