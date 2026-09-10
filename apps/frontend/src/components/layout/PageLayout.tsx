import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SocialFab } from '../ui/SocialFab';
import { OfflineBanner } from '../common/OfflineBanner';
import { ScrollProgressBar } from '../common/ScrollProgressBar';
import { ScrollToTop } from '../common/ScrollToTop';
import { RouteFallback } from '../common/RouteFallback';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';
import { initCapacitorBridge, registerNavigator, registerOverlayCloser, isNativeApp } from '../../lib/native/capacitorBridge';
import { useCartStore } from '../../store/cart';

export function PageLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    initCapacitorBridge();
    registerNavigator((delta) => navigate(delta));
    registerOverlayCloser(() => {
      if (useCartStore.getState().drawerOpen) {
        useCartStore.getState().closeDrawer();
        return true;
      }
      return false;
    });
  }, [navigate]);

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden w-full max-w-full relative">
      {/* ─── Global Scroll Restoration to Top ─── */}
      <ScrollToTop />

      {/* ─── Global Scroll Progress Bar ─── */}
      <ScrollProgressBar />

      {/* ─── Connectivity Detection Offline Banner ─── */}
      <OfflineBanner />

      {/* ─── Responsive Sticky Header ─── */}
      <Navbar />

      <main className="flex-1 min-h-[calc(100vh-80px)] pb-16 md:pb-0">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <MobileNav />
      <CartDrawer />
      <SocialFab />

      {/* ─── PWA Mobile Installation Prompt (Web only) ─── */}
      {!isNativeApp() && <PWAInstallPrompt />}
    </div>
  );
}
