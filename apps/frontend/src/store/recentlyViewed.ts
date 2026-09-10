import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  compareAtPrice?: number | null;
  rating?: number;
  reviewsCount?: number;
  customizationEnabled?: boolean;
  category?: { name: string; slug: string } | null;
  image?: string;
  variantId?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  variants?: Array<{
    id: string;
    color?: string;
    colorHex?: string;
    size?: string;
    inStock?: boolean;
  }>;
  viewedAt: number;
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  addProduct: (product: any) => void;
  removeProduct: (productIdOrSlug: string) => void;
  clearAll: () => void;
}

const MAX_RECENT_ITEMS = 30;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addProduct: (product: any) => {
        if (!product || (!product.id && !product.slug)) return;

        const id = product.id || product.slug;
        const slug = product.slug || product.id;
        const title = product.title || 'Bingooo Garment';
        const basePrice = product.base_price ?? product.basePrice ?? 699;
        const compareAtPrice = product.compare_at_price ?? product.compareAtPrice ?? null;
        const rating = product.rating || 4.8;
        const reviewsCount = product.reviews_count ?? product.reviewsCount ?? 120;
        const customizationEnabled = !!(product.customization_enabled ?? product.customizationEnabled);

        const category = product.category
          ? {
              name: product.category.name || 'Menswear',
              slug: product.category.slug || 'menswear',
            }
          : null;

        // Extract primary image
        let image: string | undefined;
        if (Array.isArray(product.images) && product.images.length > 0) {
          const first = product.images[0];
          image = typeof first === 'string' ? first : first?.url || first?.object_key;
        }

        const variants = Array.isArray(product.variants) ? product.variants : [];
        const firstVariant = variants[0];
        const variantId = firstVariant?.id;
        const color = firstVariant?.color || 'Black';
        const colorHex = firstVariant?.colorHex || '#171717';
        const size = firstVariant?.size || 'L';

        const newItem: RecentlyViewedItem = {
          id,
          slug,
          title,
          basePrice,
          compareAtPrice,
          rating,
          reviewsCount,
          customizationEnabled,
          category,
          image,
          variantId,
          color,
          colorHex,
          size,
          variants,
          viewedAt: Date.now(),
        };

        set((state) => {
          // Remove if existing (by id or slug)
          const filtered = state.items.filter(
            (item) => item.id !== id && item.slug !== slug
          );
          // Prepend as newest
          const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
          return { items: updated };
        });
      },
      removeProduct: (productIdOrSlug: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== productIdOrSlug && item.slug !== productIdOrSlug
          ),
        }));
      },
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'bingooo-recently-viewed-v1',
    }
  )
);
