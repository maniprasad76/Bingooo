// Types for catalog-seo.mjs (plain ESM so the prerender script can import it).
type AnyRecord = Record<string, any>;

export declare const SITE_URL: string;
export declare const BRAND_NAME: string;
export declare const BRAND_SUFFIX: string;
export declare const DEFAULT_OG_IMAGE: string;
export declare const POLICY: { freeShipping: boolean; handlingDays: [number, number]; transitDays: [number, number]; returnDays: number };

export declare function absoluteUrl(pathOrUrl?: string | null): string;
export declare function productUrl(slug: string): string;
export declare function categoryUrl(slug: string): string;
export declare function stripHtml(value: unknown): string;
export declare function truncate(text: unknown, max: number): string;
export declare function formatSeoTitle(rawTitle?: string | null, fallback?: string): string;
export declare function productPricing(product: AnyRecord): { price: number; highPrice: number; compareAtPrice: number | null; inStock: boolean };
export declare function productImages(product: AnyRecord): string[];
export declare function productSeoTitle(product: AnyRecord): string;
export declare function productSeoDescription(product: AnyRecord): string;
export declare function productSchema(product: AnyRecord): AnyRecord;
export declare function breadcrumbSchema(items: Array<{ name: string; url: string }>): AnyRecord;
export declare function categorySeoTitle(category: AnyRecord): string;
export declare function categorySeoDescription(category: AnyRecord, productCount?: number): string;
export declare function categorySchema(category: AnyRecord, products?: AnyRecord[]): AnyRecord;
