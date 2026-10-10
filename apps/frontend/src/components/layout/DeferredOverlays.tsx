import { Suspense, useEffect, useState } from 'react';
import { lazyPage } from '../../app/lazyPage';
import { useCartStore } from '../../store/cart';
import { useUIStore } from '../../store/ui';

// Overlays that start closed. Their code downloads once the page is idle (or as
// soon as one is opened), so it stays out of the first page load.
const CartDrawer = lazyPage(() => import('../cart/CartDrawer'), 'CartDrawer');
const SmartSearchModal = lazyPage(() => import('../search/SmartSearchModal'), 'SmartSearchModal');
const CommunityInvitePopup = lazyPage(() => import('../common/CommunityInvitePopup'), 'CommunityInvitePopup');

function useIdle(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 1500);
    return () => clearTimeout(id);
  }, []);
  return idle;
}

export function DeferredOverlays() {
  const idle = useIdle();
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const searchOpen = useUIStore((s) => s.searchModalOpen);
  const showCart = idle || drawerOpen;
  const showSearch = idle || searchOpen;

  // Until the search modal is mounted (it then handles this itself), Cmd/Ctrl + K opens it.
  useEffect(() => {
    if (showSearch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useUIStore.getState().openSearchModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSearch]);

  // One boundary each, so an overlay that is still loading never hides one already open.
  return (
    <>
      <Suspense fallback={null}>{showCart && <CartDrawer />}</Suspense>
      <Suspense fallback={null}>{showSearch && <SmartSearchModal />}</Suspense>
      <Suspense fallback={null}><CommunityInvitePopup /></Suspense>
    </>
  );
}
