// ─────────────────────────────────────────────────────────
// Preloader Utility for Routes, React Queries, and Media Assets
// Enables instant 0ms perceived navigation and rapid asset delivery
// ─────────────────────────────────────────────────────────

import { QueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

let globalQueryClient: QueryClient | null = null;

export function setPreloaderQueryClient(client: QueryClient) {
  globalQueryClient = client;
}

/** Preload image asset into browser memory cache */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't block if failed
  });
}

/** Preload multiple images */
export function preloadImages(urls: string[]): void {
  urls.filter(Boolean).forEach((url) => {
    preloadImage(url);
  });
}

/** Prefetch product details into React Query cache on hover or focus */
export function prefetchProduct(slug: string): void {
  if (!globalQueryClient || !slug) return;

  globalQueryClient.prefetchQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const res = await api.get<any>(`/products/${slug}`);
        if (res?.imageUrl) {
          preloadImage(res.imageUrl);
        }
        if (Array.isArray(res?.images)) {
          res.images.forEach((img: any) => preloadImage(img.url));
        }
        return res;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });
}

/** Prefetch category listing into React Query cache */
export function prefetchCategory(categorySlug: string): void {
  if (!globalQueryClient || !categorySlug) return;

  globalQueryClient.prefetchQuery({
    queryKey: ['products', { categorySlug }],
    queryFn: () => api.get<any>('/products', { categorySlug }),
    staleTime: 60 * 1000,
  });
}

/** Route prefetching dictionary for dynamic chunk warm-up */
const routeChunkMap: Record<string, () => Promise<any>> = {
  '/shop': () => import('../../pages/ShopPage'),
  '/customizer': () => import('../../pages/CustomizerPage'),
  '/cart': () => import('../../pages/CartPage'),
  '/checkout': () => import('../../pages/CheckoutPage'),
  '/account': () => import('../../pages/AccountPage'),
  '/track-order': () => import('../../pages/TrackOrderPage'),
};

/** Preload JS chunk bundle for a target route on link hover */
export function preloadRouteChunk(path: string): void {
  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
  const loader = routeChunkMap[cleanPath];
  if (loader) {
    loader().catch(() => { /* ignore preload failure */ });
  }
}
