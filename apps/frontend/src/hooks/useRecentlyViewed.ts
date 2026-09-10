import { useCallback } from 'react';
import { useRecentlyViewedStore, type RecentlyViewedItem } from '../store/recentlyViewed';

export function useRecentlyViewed() {
  const items = useRecentlyViewedStore((s) => s.items);
  const addProduct = useRecentlyViewedStore((s) => s.addProduct);
  const removeProduct = useRecentlyViewedStore((s) => s.removeProduct);
  const clearAll = useRecentlyViewedStore((s) => s.clearAll);

  const getRecentExcluding = useCallback(
    (excludeSlugOrId?: string, limit = 6): RecentlyViewedItem[] => {
      if (!excludeSlugOrId) return items.slice(0, limit);
      return items
        .filter((item) => item.slug !== excludeSlugOrId && item.id !== excludeSlugOrId)
        .slice(0, limit);
    },
    [items]
  );

  return {
    items,
    count: items.length,
    addProduct,
    removeProduct,
    clearAll,
    getRecentExcluding,
  };
}

export type { RecentlyViewedItem };
