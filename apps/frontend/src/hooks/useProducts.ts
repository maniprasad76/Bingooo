import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api/client';


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

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    // Only real catalog data: an empty store shows as empty and an API failure
    // surfaces as an error (React Query retries it) — never placeholder
    // products that could be added to the cart but don't exist server-side.
    queryFn: async () => {
      const res = await api.get<any>('/products', params);
      const items: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      return {
        data: items,
        meta: res?.meta || {
          total: items.length,
          page: params.page || 1,
          limit: params.limit || 12,
          totalPages: Math.ceil(items.length / (params.limit || 12)),
        },
      };
    },
  });
}

export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const res = await api.get<any>(`/products/${slug}`);
        return res && (res.id || res.slug) ? res : null;
      } catch (err: any) {
        // A missing product renders the page's "not found" state; other failures are real errors.
        if (err?.status === 404) return null;
        throw err;
      }
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
      return api.get<any>('/products/filters', { categorySlug });
    },
  });
}
