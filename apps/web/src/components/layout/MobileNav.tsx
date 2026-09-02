import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Paintbrush, Heart, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'Customise', href: '/customize', icon: Paintbrush },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Account', href: '/account', icon: User },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-sm md:hidden">
      <ul className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                to={tab.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors duration-hover',
                  isActive ? 'text-accent' : 'text-muted',
                )}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Safe area padding for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
