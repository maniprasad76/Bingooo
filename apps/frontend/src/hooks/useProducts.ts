import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import {
  FALLBACK_PRODUCTS,
  FALLBACK_FILTERS,
} from '../data/fallbackProducts';


export interface ProductQueryParams {
  categorySlug?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string;
  colors?: string;
  search?: string;
  customizable?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  't-shirts': ['oversized-tees', 't-shirts', 't-shirt', 'tees', 'tshirts', 'oversized-t-shirts'],
  'oversized-tees': ['oversized-tees', 't-shirts', 't-shirt', 'tees', 'tshirts', 'oversized-t-shirts'],
  'oversized-t-shirts': ['oversized-tees', 't-shirts', 't-shirt', 'tees', 'tshirts', 'oversized-t-shirts'],
  'hoodies': ['hoodies', 'fleece', 'sweatshirts', 'hoodie'],
  'jeans': ['cargos', 'jeans', 'denim', 'pants', 'trousers'],
  'cargos': ['cargos', 'jeans', 'denim', 'pants', 'trousers'],
  'pants': ['cargos', 'jeans', 'denim', 'pants', 'trousers'],
  'shirts': ['shirts', 'casual-shirts', 'textured-shirt', 'camp-collar', 'oxford'],
  'graphic-drops': ['graphic-drops', 'graphics', 'anime'],
};

function filterFallbackProducts(params: ProductQueryParams) {
  let list = [...FALLBACK_PRODUCTS];

  if (params.categorySlug) {
    const rawSlug = params.categorySlug.toLowerCase();
    const allowed = CATEGORY_ALIASES[rawSlug] || [rawSlug];
    list = list.filter(
      (p) =>
        allowed.includes(p.category?.slug?.toLowerCase() || '') ||
        p.tags?.some((t) => allowed.includes(t.toLowerCase())) ||
        p.category?.slug?.toLowerCase() === rawSlug ||
        p.tags?.includes(rawSlug)
    );
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.category?.slug?.toLowerCase().includes(q) ||
        (p.fit_silhouette && p.fit_silhouette.toLowerCase().includes(q)) ||
        (p.fabric_gsm && `${p.fabric_gsm}`.includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }


  if (params.customizable !== undefined) {
    list = list.filter((p) => p.customizationEnabled === params.customizable);
  }

  if (params.minPrice !== undefined) {
    list = list.filter((p) => p.basePrice >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    list = list.filter((p) => p.basePrice <= params.maxPrice!);
  }

  if (params.sort === 'price-asc') {
    list.sort((a, b) => a.basePrice - b.basePrice);
  } else if (params.sort === 'price-desc') {
    list.sort((a, b) => b.basePrice - a.basePrice);
  } else if (params.sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  const start = (page - 1) * limit;
  const paged = list.slice(start, start + limit);

  return {
    data: paged,
    meta: {
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit) || 1,
    },
  };
}

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const res = await api.get<any>('/products', params);
        if (res && Array.isArray(res.data)) {
          return res;
        }
      } catch (err) {
        console.warn('[Products] API fetch failed, serving atelier fallback catalog:', err);
        return filterFallbackProducts(params);
      }
      return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1 } };
    },
  });
}

export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const res = await api.get<any>(`/products/${slug}`);
        if (res && (res.id || res.slug)) {
          return res;
        }
      } catch (err: any) {
        // Product was deleted or not found on server
        return null;
      }
      return null;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.get<any[]>('/categories');
        if (Array.isArray(res)) return res;
      } catch (err) {
        console.warn('[Categories] API fetch failed:', err);
      }
      return [];
    },
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        const res = await api.get<any[]>('/collections');
        if (Array.isArray(res)) return res;
      } catch {}
    },
  });
}


export function useProductFilters(categorySlug?: string) {
  return useQuery({
    queryKey: ['product-filters', categorySlug],
    queryFn: async () => {
      try {
        const res = await api.get<any>('/products/filters', { categorySlug });
        if (res) return res;
      } catch {}
      return FALLBACK_FILTERS;
    },
  });
}
