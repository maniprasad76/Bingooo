import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { Logo } from '../ui/Logo';

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collection/all' },
  { label: 'Customise', href: '/customize' },
  { label: 'New', href: '/shop?sort=newest' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <nav className="container-page flex h-14 items-center justify-between gap-4 sm:h-16">
        {/* Left: logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 py-1" aria-label="Bingooo Home">
          <Logo variant="red" size="md" />
        </Link>

        {/* Center: desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  'text-caption font-medium uppercase tracking-widest transition-colors duration-hover',
                  location.pathname.startsWith(link.href)
                    ? 'text-ink'
                    : 'text-muted hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <IconButton href="/search" label="Search" className="hidden sm:flex">
            <Search size={20} />
          </IconButton>
          <IconButton href="/account/wishlist" label="Wishlist" className="hidden sm:flex">
            <Heart size={20} />
          </IconButton>
          <IconButton href="/account" label="Account" className="hidden sm:flex">
            <User size={20} />
          </IconButton>
          <button
            onClick={() => useCartStore.getState().openDrawer()}
            className="relative flex items-center justify-center rounded-full p-2 text-ink transition-colors duration-hover hover:bg-ink/5"
            aria-label="Open Cart Bag"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink shadow-sm animate-pulse">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Mobile: search */}
          <IconButton href="/search" label="Search" className="sm:hidden">
            <Search size={20} />
          </IconButton>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-full p-2 text-ink hover:bg-ink/5 md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-white px-4 py-6 md:hidden animate-slide-down">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block text-body font-medium text-ink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-border pt-4 mt-2">
              <Link
                to="/account"
                className="block text-body text-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Account
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/** Small icon button used in the navbar */
function IconButton({
  href,
  label,
  badge,
  className,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'relative flex items-center justify-center rounded-full p-2 text-ink transition-colors duration-hover hover:bg-ink/5',
        className,
      )}
      aria-label={label}
    >
      {children}
      {badge !== undefined && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}
