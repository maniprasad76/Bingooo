import { useState } from 'react';
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

  // Sync state when URL params change
  useState(() => {
    if (categoryParam !== filters.categorySlug || collectionParam !== filters.collectionSlug) {
      setFilters((prev) => ({
        ...prev,
        categorySlug: categoryParam,
        collectionSlug: collectionParam,
        search: searchParam,
      }));
    }
  });

  const { data, isLoading } = useProducts(filters);
  const products = data?.data || [];
  const meta = data?.meta;

  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters(newFilters);
    // Sync to URL if category changed
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
    <div className="container-page py-8 sm:py-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div>
          <h1 className="text-display-lg text-ink font-bold">
            {filters.categorySlug
              ? `${filters.categorySlug.charAt(0).toUpperCase() + filters.categorySlug.slice(1).replace(/-/g, ' ')}`
              : filters.collectionSlug
              ? 'Collection Drops'
              : 'All Apparel'}
          </h1>
          <p className="mt-1 text-body text-muted">
            {meta?.total ? `Showing ${meta.total} curated items` : 'Discover our latest premium apparel'}
          </p>
        </div>

        {/* Search Bar & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchChange} className="relative flex-1 sm:w-64">
            <input
              type="text"
              name="search"
              defaultValue={filters.search || ''}
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-8 rounded-md border border-border bg-white text-caption text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, search: undefined, page: 1 })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 h-10">
            <ArrowUpDown size={14} className="text-muted" />
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value, page: 1 })}
              className="bg-transparent text-caption font-medium text-ink focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Alphabetical</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 rounded-md border border-border bg-white px-4 h-10 text-caption font-medium text-ink"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onChange={handleFilterChange} />
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-border bg-paper/50">
              <div className="h-16 w-16 rounded-full bg-paper flex items-center justify-center mb-4 text-muted">
                <Search size={24} />
              </div>
              <h3 className="text-heading text-ink font-semibold">No products found</h3>
              <p className="mt-1 text-body text-muted max-w-sm">
                Try adjusting your search filters or browse other categories.
              </p>
              <button
                onClick={() => handleFilterChange({ sort: 'newest', page: 1 })}
                className="mt-6 rounded-md bg-ink text-white px-5 py-2 text-caption font-semibold hover:bg-accent transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={!meta.hasPrev}
                    onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) - 1 })}
                    className="rounded border border-border bg-white px-3 py-1.5 text-caption font-medium text-ink disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-caption text-muted px-2">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    disabled={!meta.hasNext}
                    onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
                    className="rounded border border-border bg-white px-3 py-1.5 text-caption font-medium text-ink disabled:opacity-40"
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
        title="Filter Products"
        position="left"
        size="sm"
      >
        <div className="p-5">
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
