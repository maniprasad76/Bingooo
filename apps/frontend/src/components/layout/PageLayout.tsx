import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SocialFab } from '../ui/SocialFab';
import { PageTransition } from './PageTransition';
import { OfflineBanner } from '../common/OfflineBanner';
import { ScrollProgressBar } from '../common/ScrollProgressBar';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';

export function PageLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden w-full max-w-full relative">
      {/* ─── Global Scroll Progress Bar ─── */}
      <ScrollProgressBar />

      {/* ─── Connectivity Detection Offline Banner ─── */}
      <OfflineBanner />

      {/* ─── Responsive Sticky Header ─── */}
      <Navbar />

      <main className="flex-1 min-h-[calc(100vh-80px)] pb-16 md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname} className="h-full">
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
      <MobileNav />
      <CartDrawer />
      <SocialFab />

      {/* ─── PWA Mobile Installation Prompt ─── */}
      <PWAInstallPrompt />
    </div>
  );
}
