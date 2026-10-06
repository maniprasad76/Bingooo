// ─────────────────────────────────────────────────────────
// Safe Service Worker Registration Helper & Stale-Chunk Recovery
// ─────────────────────────────────────────────────────────

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Self-healing recovery for stale chunk / module script load failure
  window.addEventListener('error', (e) => {
    const msg = e.message || '';
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module')
    ) {
      const reloadKey = 'bingooo_chunk_reload_global';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((k) => caches.delete(k));
          });
        }
        window.location.reload();
      }
    }
  });

  if (!('serviceWorker' in navigator)) {
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
