/**
 * Local cart item metadata store.
 * Ensures the cart drawer and cart page display the exact product image,
 * title, color, size, and category even when backend payloads are sparse
 * or transitioning between sessions.
 */

export interface CartItemMeta {
  title?: string;
  image?: string;
  color?: string;
  size?: string;
  category?: string;
  gsm?: string;
  slug?: string;
  price?: number;
}

const STORAGE_KEY = 'bingooo_cart_items_meta';

export function saveCartItemMeta(key: string, meta: CartItemMeta): void {
  if (!key) return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || '{}';
    const store = JSON.parse(raw);
    store[key] = { ...(store[key] || {}), ...meta };
    if (meta.title) {
      store[meta.title.toLowerCase().trim()] = { ...(store[meta.title.toLowerCase().trim()] || {}), ...meta };
    }
    if (meta.slug) {
      store[meta.slug.toLowerCase().trim()] = { ...(store[meta.slug.toLowerCase().trim()] || {}), ...meta };
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    // SessionStorage may be restricted in private browsing
  }
}

export function getCartItemMeta(key?: string, fallbackTitle?: string, fallbackSlug?: string): CartItemMeta | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    if (key && store[key]) return store[key];
    if (fallbackSlug && store[fallbackSlug.toLowerCase().trim()]) return store[fallbackSlug.toLowerCase().trim()];
    if (fallbackTitle && store[fallbackTitle.toLowerCase().trim()]) return store[fallbackTitle.toLowerCase().trim()];
    return null;
  } catch (e) {
    return null;
  }
}
