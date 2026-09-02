import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ArrowUpDown, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { ProductQueryParams } from '../hooks/useProducts';
import { ProductCard } from '../components/catalog/ProductCard';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Drawer } from '../components/ui/Drawer';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from query params
  const categoryParam = searchParams.get('category') || undefined;
  const collectionParam = searchParams.get('collection') || undefined;
  const searchParam = searchParams.get('q') || undefined;

  const [filters, setFilters] = useState<ProductQueryParams>({
    categorySlug: categoryParam,
    collectionSlug: collectionParam,
    search: searchParam,
    sort: 'newest',
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useProducts(filters);
  const products = data?.data || [];
  const meta = data?.meta;

  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters(newFilters);
    if (newFilters.categorySlug) {
      setSearchParams({ category: newFilters.categorySlug });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('search')?.toString() || '';
    handleFilterChange({ ...filters, search: q || undefined, page: 1 });
  };

  return (
    <div className="container-wide py-8 sm:py-12 bg-paper min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-brand-red uppercase tracking-widest">
              ATELIER CATALOG // SS-26
            </span>
          </div>
          <h1 className="text-display-lg font-black text-ink font-display">
            {filters.categorySlug
              ? `${filters.categorySlug.charAt(0).toUpperCase() + filters.categorySlug.slice(1).replace(/-/g, ' ')}`
              : filters.collectionSlug
              ? 'Curated Collections'
              : 'All Ready-to-Wear & Studio Drops'}
          </h1>
          <p className="mt-1 text-caption font-mono text-muted">
            {meta?.total ? `SHOWING ${meta.total} CURATED APPAREL SILHOUETTES` : 'Heavyweight 220 GSM combed cotton garments'}
          </p>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchChange} className="relative flex-1 sm:w-72">
            <input
              type="text"
              name="search"
              defaultValue={filters.search || ''}
              placeholder="Search silhouettes..."
              className="w-full h-11 pl-10 pr-8 rounded-xl border border-border bg-white text-xs font-mono text-ink placeholder:text-muted focus:border-brand-red focus:outline-none shadow-sm"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, search: undefined, page: 1 })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Sort selector */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 h-11 shadow-sm">
            <ArrowUpDown size={14} className="text-muted" />
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value, page: 1 })}
              className="bg-transparent text-xs font-mono font-bold text-ink focus:outline-none cursor-pointer uppercase"
            >
              <option value="newest">Newest Drops</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Alphabetical</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 rounded-xl border border-border bg-white px-4 h-11 text-xs font-mono font-bold text-ink shadow-sm"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar (3 cols) */}
        <div className="hidden md:block md:col-span-3">
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onChange={handleFilterChange} />
          </div>
        </div>

        {/* Product Grid (9 cols) */}
        <div className="md:col-span-9">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-border bg-white p-8">
              <div className="h-16 w-16 rounded-2xl bg-paper flex items-center justify-center mb-4 text-muted">
                <Search size={24} />
              </div>
              <h3 className="text-heading font-bold text-ink font-display">No matching silhouettes</h3>
              <p className="mt-1 text-caption text-muted max-w-sm font-sans">
                Try resetting your filters or jump into our 2D design studio to create your own bespoke apparel from scratch.
              </p>
              <button
                onClick={() => handleFilterChange({ sort: 'newest', page: 1 })}
                className="mt-6 rounded-xl bg-brand-red text-white px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-red-hover transition-colors shadow-glow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    slug={product.slug}
                    basePrice={product.base_price}
                    compareAtPrice={product.compare_at_price}
                    customizationEnabled={product.customization_enabled}
                    category={product.category}
                    variants={product.variants}
                    images={product.images}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3 font-mono text-xs">
                  <button
                    disabled={!meta.hasPrev}
                    onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) - 1 })}
                    className="rounded-xl border border-border bg-white px-4 py-2 font-bold text-ink hover:bg-paper disabled:opacity-40 transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-muted px-2 font-bold">
                    Page {meta.page} / {meta.totalPages}
                  </span>
                  <button
                    disabled={!meta.hasNext}
                    onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
                    className="rounded-xl border border-border bg-white px-4 py-2 font-bold text-ink hover:bg-paper disabled:opacity-40 transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Silhouettes"
        position="left"
        size="sm"
      >
        <div className="p-6">
          <FilterSidebar
            filters={filters}
            onChange={(newFilters) => {
              handleFilterChange(newFilters);
              setMobileFilterOpen(false);
            }}
          />
        </div>
      </Drawer>
    </div>
  );
}
