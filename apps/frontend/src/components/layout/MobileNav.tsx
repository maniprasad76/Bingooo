import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Sparkles, ShoppingBag, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { useUIStore } from '../../store/ui';

export function MobileNav() {
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);

  const getActiveTab = () => {
    if (mobileMenuOpen) return 'menu';
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/shop') || path.startsWith('/category') || path.startsWith('/product')) return 'shop';
    if (path.startsWith('/customize')) return 'custom';
    if (path.startsWith('/cart') || path.startsWith('/checkout')) return 'bag';
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
      icon: Sparkles,
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
      id: 'menu',
      label: 'Menu',
      onClick: toggleMobileMenu,
      icon: Menu,
    },
  ];

  // In the Atelier Customizer, hide global mobile nav to yield space to MobileCustomizerBar
  if (location.pathname.startsWith('/customize')) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#DDD3C5] shadow-[0_-4px_20px_rgba(23,23,23,0.06)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile Navigation"
    >
      <div className="flex h-15 w-full items-center justify-around px-1">
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
              {/* Active top indicator pill */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-top-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute top-0 h-[2.5px] w-7 bg-[#E6321C] rounded-full"
                />
              )}

              {/* Icon Container with optional cart badge */}
              <div className="relative flex items-center justify-center pt-1 pb-0.5">
                <Icon
                  size={20}
                  className={cn(
                    'transition-transform duration-200',
                    isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]',
                    item.isHighlight && !isActive && 'text-[#E6321C]'
                  )}
                />

                {/* Cart Badge */}
                {item.id === 'bag' && typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#E6321C] text-[9px] font-extrabold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}

                {/* Custom Studio highlight pulse */}
                {item.isHighlight && !isActive && (
                  <span className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-[#E6321C]" />
                )}
              </div>

              {/* Label */}
              <span className={cn(
                'text-[10px] font-heading uppercase tracking-wider mt-0.5 leading-none',
                isActive ? 'font-bold text-[#E6321C]' : 'font-medium text-[#6F6A63]'
              )}>
                {item.label}
              </span>
            </motion.div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex-1 h-full flex items-center justify-center focus:outline-none"
                aria-label={item.label}
                aria-expanded={item.id === 'menu' ? mobileMenuOpen : undefined}
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

