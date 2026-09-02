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
    queryFn: () => api.get<any>('/products', params),
  });
}

export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get<any>(`/products/${slug}`),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<any[]>('/categories'),
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => api.get<any[]>('/collections'),
  });
}

export function useProductFilters(categorySlug?: string) {
  return useQuery({
    queryKey: ['product-filters', categorySlug],
    queryFn: () => api.get<any>('/products/filters', { categorySlug }),
  });
}
