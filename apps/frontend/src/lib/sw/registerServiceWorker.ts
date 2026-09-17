// ─────────────────────────────────────────────────────────
// Safe Service Worker Registration Helper
// ─────────────────────────────────────────────────────────

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register after initial page load to not compete with critical rendering
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Auto-update check periodically
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                console.log('[SW] New atelier content available in background');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}
