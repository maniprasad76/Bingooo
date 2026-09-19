import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SmartSearchModal } from '../search/SmartSearchModal';
import { SocialFab } from '../ui/SocialFab';

import { OfflineBanner } from '../common/OfflineBanner';
import { ScrollProgressBar } from '../common/ScrollProgressBar';
import { ScrollToTop } from '../common/ScrollToTop';
import { RouteFallback } from '../common/RouteFallback';
import { initCapacitorBridge, registerNavigator, registerOverlayCloser } from '../../lib/native/capacitorBridge';
import { useCartStore } from '../../store/cart';
import { useUIStore } from '../../store/ui';

export function PageLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    initCapacitorBridge();
    registerNavigator((delta) => navigate(delta));
    registerOverlayCloser(() => {
      const uiState = useUIStore.getState();
      if (uiState.mobileMenuOpen) {
        uiState.closeMobileMenu();
        return true;
      }
      if (uiState.searchModalOpen) {
        uiState.closeSearchModal();
        return true;
      }
      if (useCartStore.getState().drawerOpen) {
        useCartStore.getState().closeDrawer();
        return true;
      }
      return false;
    });
  }, [navigate]);

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

      <main className="flex-1 min-h-[calc(100vh-80px)] pb-24 md:pb-0">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <MobileNav />
      <CartDrawer />
      <SmartSearchModal />
      <SocialFab />
    </div>
  );
}
