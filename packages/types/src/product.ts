// ─────────────────────────────────────────────────────────
// @bingooo/types — Product, Variant, Category, Collection
// ─────────────────────────────────────────────────────────

/** Product publish status */
export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageKey: string | null;
  isActive: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerKey: string | null;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  objectKey: string;
  altText: string | null;
  sortOrder: number;
  /** Resolved public URL (computed, not stored) */
  url?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  stockQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string | null;
  title: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice: number | null;
  customizationEnabled: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  /** Populated in detail views */
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
  collections?: Collection[];
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  customizationEnabled: boolean;
  /** First image for card display */
  primaryImage: ProductImage | null;
  /** Available color hex values */
  colorSwatches: string[];
}

export interface ProductFilters {
  categorySlug?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  search?: string;
  status?: ProductStatus;
  customizable?: boolean;
}

export interface CreateProductInput {
  title: string;
  slug: string;
  description?: string;
  categoryId?: string;
  basePrice: number;
  compareAtPrice?: number;
  customizationEnabled?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  status?: ProductStatus;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateVariantInput {
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price: number;
  stockQuantity: number;
}
