import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Sparkles, ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cart';
import { useUIStore } from '../../store/ui';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

export function MobileNav() {
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (
      path.startsWith('/shop') ||
      path.startsWith('/category') ||
      path.startsWith('/product') ||
      path.startsWith('/collection')
    ) {
      return 'shop';
    }
    if (path.startsWith('/customize')) return 'custom';
    if (path.startsWith('/cart') || path.startsWith('/checkout')) return 'bag';
    if (
      path.startsWith('/account') ||
      path.startsWith('/login') ||
      path.startsWith('/signup') ||
      path.startsWith('/wishlist')
    ) {
      return 'profile';
    }
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
      label: 'Shop Catalog',
      href: '/shop',
      icon: LayoutGrid,
    },
    {
      id: 'custom',
      label: 'Custom Studio',
      href: '/customize',
      icon: Sparkles,
      isHighlight: true,
    },
    {
      id: 'bag',
      label: 'Shopping Bag',
      onClick: openDrawer,
      icon: ShoppingBag,
      badge: itemCount,
    },
    {
      id: 'profile',
      label: 'Account',
      href: '/account',
      icon: User,
    },
  ];

  // In the Atelier Customizer or when mobile menu drawer is open, hide global mobile nav
  if (location.pathname.startsWith('/customize') || mobileMenuOpen) {
    return null;
  }

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-28px)] max-w-[364px] md:hidden select-none pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      aria-label="Mobile Navigation"
    >
      <div className="pointer-events-auto h-14 w-full bg-[#171717]/92 backdrop-blur-xl border border-white/15 rounded-full px-2 py-1.5 flex items-center justify-between shadow-[0_16px_36px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)] ring-1 ring-white/5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          const buttonContent = (
            <motion.div
              whileTap={{ scale: 0.86 }}
              className={cn(
                'relative flex h-11 w-full items-center justify-center rounded-full transition-colors duration-200',
                isActive ? 'text-white' : 'text-[#9E988F] hover:text-white'
              )}
            >
              {/* Smooth active sliding capsule pill */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white/12 border border-white/15 shadow-inner"
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  className={cn(
                    'transition-all duration-200',
                    isActive
                      ? 'scale-110 stroke-[2.2]'
                      : 'stroke-[1.8]',
                    item.isHighlight && !isActive && 'text-[#E6321C] stroke-[2]'
                  )}
                />

                {/* Cart Badge with smooth pop animation */}
                {item.id === 'bag' && (
                  <AnimatePresence>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-[#E6321C] text-[10px] font-black text-white font-mono shadow-[0_2px_8px_rgba(230,50,28,0.6)]"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}

                {/* Custom Studio highlight dot when inactive */}
                {item.isHighlight && !isActive && (
                  <span className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-[#E6321C] shadow-[0_0_6px_#E6321C]" />
                )}
              </div>

              {/* Active Signal Red Micro-Dot */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-red-dot"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E6321C] shadow-[0_0_6px_#E6321C]"
                />
              )}
            </motion.div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  item.onClick!();
                }}
                className="relative flex-1 h-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#171717] rounded-full"
                aria-label={item.label}
                title={item.label}
              >
                {buttonContent}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href!}
              onClick={() => triggerHaptic('selection')}
              className="relative flex-1 h-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:ring-offset-1 focus-visible:ring-offset-[#171717] rounded-full"
              aria-label={item.label}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {buttonContent}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


