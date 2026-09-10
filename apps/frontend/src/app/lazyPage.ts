import { lazy, type ComponentType } from 'react';

const RELOAD_KEY_PREFIX = 'bingooo_chunk_reload_';

/**
 * Lazy-load a page component that is exported as a *named* export.
 * Includes automatic retry and Vite stale-chunk auto-recovery so dynamic imports never crash the page.
 */
export function lazyPage<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  name: keyof T & string,
) {
  return lazy(async () => {
    try {
      const mod = await loader();
      // On success, clear any previous retry key
      try {
        sessionStorage.removeItem(`${RELOAD_KEY_PREFIX}${name}`);
      } catch {
        // ignore storage errors
      }
      return { default: mod[name] as unknown as ComponentType };
    } catch (firstError) {
      // 1. Try immediate retry after 300ms
      try {
        await new Promise((r) => setTimeout(r, 300));
        const mod = await loader();
        return { default: mod[name] as unknown as ComponentType };
      } catch (retryError) {
        // 2. Check if this is a dynamic import / chunk load error
        const isChunkError =
          retryError instanceof Error &&
          (retryError.message.includes('dynamically imported module') ||
            retryError.message.includes('Failed to fetch') ||
            retryError.message.includes('Loading chunk'));

        const storageKey = `${RELOAD_KEY_PREFIX}${name}`;
        let hasAutoReloaded = false;
        try {
          hasAutoReloaded = Boolean(sessionStorage.getItem(storageKey));
        } catch {
          // ignore
        }

        if (isChunkError && !hasAutoReloaded) {
          try {
            sessionStorage.setItem(storageKey, Date.now().toString());
          } catch {
            // ignore
          }
          // Clear Vite/browser cache mismatch by doing a single hard reload
          window.location.reload();
          // Return a pending promise so React doesn't throw while reloading
          return new Promise<never>(() => {});
        }

        // Rethrow for ErrorBoundary to catch gracefully
        throw retryError;
      }
    }
  });
}