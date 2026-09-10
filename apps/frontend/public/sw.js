// ─────────────────────────────────────────────────────────
// Bingooo Atelier Progressive Web App Service Worker (v1.0)
// ─────────────────────────────────────────────────────────

const CACHE_NAME = 'bingooo-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/custom/tshirt-step-1.png',
  '/custom/tshirt-step-2.png',
  '/custom/tshirt-step-3-black.png',
  '/custom/tshirt-step-1-beige.png',
];

// 1. Install: Pre-cache core shell & garment assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate: Clean stale caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Context-aware caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or browser extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Always fetch favicons, logos, and manifests straight from network (never serve stale)
  if (
    url.pathname.includes('favicon') ||
    url.pathname.includes('logo') ||
    url.pathname.includes('icon') ||
    url.pathname.includes('manifest')
  ) {
    return;
  }

  // A. Google Fonts: Cache-First
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, resClone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // B. Static Images & Garment Mockups: Cache-First
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, resClone));
          }
          return networkRes;
        }).catch(() => caches.match('/favicon.svg'));
      })
    );
    return;
  }

  // C. Catalog API: Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/v1/products') || url.pathname.startsWith('/api/v1/categories')) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, resClone));
          }
          return networkRes;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // D. App Shell / Navigation: Network-First falling back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // E. Bundled JS / CSS: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((networkRes) => {
        if (networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, resClone));
        }
        return networkRes;
      }).catch(() => null);

      return cached || fetchPromise;
    })
  );
});
