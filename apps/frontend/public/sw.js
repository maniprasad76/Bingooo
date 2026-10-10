// ─────────────────────────────────────────────────────────
// Bingooo Atelier Progressive Web App Service Worker
// Cache-First for static assets, Network-First for API data
// ─────────────────────────────────────────────────────────

// v4: AVIF - the format nearly every visitor actually gets - and .ico were missing from
// the static-asset matcher, so photos bypassed the cache entirely. Bump re-fills the cache.
const CACHE_NAME = 'bingooo-cache-v4';

// Only public, user-independent catalog endpoints may be cached. Anything
// tied to a session (profile, cart, orders, addresses, ...) must never be
// written to Cache Storage, where the next user on the device could read it.
const PUBLIC_API_PREFIXES = [
  '/api/v1/products',
  '/api/v1/categories',
  '/api/v1/collections',
  '/api/v1/banners',
  '/api/v1/reviews/product/',
  '/api/v1/payments/config',
  '/api/v1/customizations/studio',
];

function isPublicApiRequest(request, url) {
  if (request.headers.has('Authorization')) return false;
  if (url.pathname.startsWith('/api/v1/products/admin')) return false;
  return PUBLIC_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
];

// Install: pre-cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some optional shell assets fail
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Ignore non-http(s) requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 1a. Private API requests: always network, never cached
  if (url.pathname.startsWith('/api/v1/') && !isPublicApiRequest(request, url)) {
    return;
  }

  // 1b. Public catalog API GET requests: Network-first, fallback to cache
  if (url.pathname.startsWith('/api/v1/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback from cache
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: 'You are currently offline. Showing cached snapshot if available.',
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // 2. Static assets (CSS, JS, WebP, SVG, Fonts, Woff2): Cache-first, fallback to network
  if (
    url.pathname.match(/\.(js|css|avif|webp|png|jpg|jpeg|svg|ico|woff2|ttf)$/) ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Navigation requests (HTML document): Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }
});
