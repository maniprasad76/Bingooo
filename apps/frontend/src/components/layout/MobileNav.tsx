import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, PenTool, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';

export function MobileNav() {
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/shop') || path.startsWith('/category') || path.startsWith('/product')) return 'shop';
    if (path.startsWith('/customize')) return 'custom';
    if (path.startsWith('/cart') || path.startsWith('/checkout')) return 'bag';
    if (path.startsWith('/account') || path.startsWith('/login') || path.startsWith('/signup')) return 'account';
    return '';
  };

  const activeTab = getActiveTab();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      id: 'shop',
      label: 'Shop',
      href: '/shop',
      icon: LayoutGrid,
    },
    {
      id: 'custom',
      label: 'Custom',
      href: '/customize',
      icon: PenTool,
      isHighlight: true,
    },
    {
      id: 'bag',
      label: 'Bag',
      onClick: openDrawer,
      icon: ShoppingBag,
      badge: itemCount,
    },
    {
      id: 'account',
      label: 'Account',
      href: '/account',
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 w-full bg-[#EDE0CC] border-t border-[#DDD3C5] shadow-[0_-4px_20px_rgba(23,23,23,0.06)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile Navigation"
    >
      <div className="flex h-14 w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          const content = (
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full py-1 transition-colors duration-150 select-none',
                isActive ? 'text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'
              )}
            >
              {/* Active top indicator bar */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-top-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute top-0 h-[2.5px] w-8 bg-[#E6321C] rounded-full"
                />
              )}

              {/* Icon Container with optional custom badge or cart count */}
              <div className="relative flex items-center justify-center py-2">
                <Icon
                  size={22}
                  className={cn(
                    'transition-all duration-200',
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]',
                    item.isHighlight && !isActive && 'text-[#B91F12]'
                  )}
                />

                {/* Cart Badge */}
                {item.id === 'bag' && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute top-0.5 -right-2 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E6321C] text-[9px] font-extrabold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}

                {/* Custom dot indicator */}
                {item.isHighlight && (
                  <span className="absolute top-1 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#E6321C]" />
                )}
              </div>
            </motion.div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex-1 h-full flex items-center justify-center focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href!}
              className="flex-1 h-full flex items-center justify-center focus:outline-none"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
