import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';
import { Skeleton } from '../components/ui/Skeleton';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { ProductCard } from '../components/catalog/ProductCard';
import { useCategories, useProductFilters, useProducts, type ProductQueryParams } from '../hooks/useProducts';

function formatTitle(value?: string) {
  return value ? value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Shop all';
}

export function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const categoryFromUrl = slug ?? searchParams.get('category') ?? undefined;
  const collectionFromUrl = searchParams.get('collection') ?? undefined;
  const queryFromUrl = searchParams.get('q') ?? undefined;
  const [filters, setFilters] = useState<ProductQueryParams>({
    categorySlug: categoryFromUrl,
    collectionSlug: collectionFromUrl,
    search: queryFromUrl,
    sort: searchParams.get('sort') ?? 'newest',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      categorySlug: categoryFromUrl,
      collectionSlug: collectionFromUrl,
      search: queryFromUrl,
      page: 1,
    }));
  }, [categoryFromUrl, collectionFromUrl, queryFromUrl]);

  const productsQuery = useProducts(filters);
  const filtersQuery = useProductFilters(filters.categorySlug);
  const categoriesQuery = useCategories();
  const products = productsQuery.data?.data ?? [];
  const pageMeta = productsQuery.data?.meta;
  const categories = useMemo(() => [
    { name: 'All products', slug: undefined },
    ...(categoriesQuery.data ?? []).map((category) => ({ name: category.name, slug: category.slug })),
  ], [categoriesQuery.data]);

  const syncUrl = (next: ProductQueryParams) => {
    const params = new URLSearchParams();
    if (next.categorySlug) params.set('category', next.categorySlug);
    if (next.collectionSlug) params.set('collection', next.collectionSlug);
    if (next.search) params.set('q', next.search);
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort);
    setSearchParams(params, { replace: true });
  };

  const handleFilterChange = (next: ProductQueryParams) => {
    const updated = { ...next, page: next.page ?? 1 };
    setFilters(updated);
    syncUrl(updated);
  };

  const pageTitle = filters.search ? `Results for “${filters.search}”` : formatTitle(filters.categorySlug);
  const resultCopy = pageMeta ? `${pageMeta.total} product${pageMeta.total === 1 ? '' : 's'}` : 'Catalog';
  const sidebar = <FilterSidebar
    filters={filters}
    onChange={handleFilterChange}
    categories={categories}
    availableSizes={filtersQuery.data?.sizes}
    availableColors={(filtersQuery.data?.colors ?? []).map((name: string) => ({ name, hex: '#171717' }))}
    priceRange={filtersQuery.data?.priceRange}
  />;

  return <div className="min-h-screen bg-[#FAF8F5] text-[#171717]">
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[#DDD3C5] pb-6 sm:flex-row sm:items-end">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F6A63]">
            <Link to="/" className="hover:text-[#E6321C]">Home</Link><span>/</span><span className="font-medium text-[#171717]">Shop</span>
          </nav>
          <h1 className="mt-3 text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{pageTitle}</h1>
          <p className="mt-2 text-sm text-[#6F6A63]">{resultCopy} curated for your wardrobe.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileFilterOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DDD3C5] bg-white px-3 text-xs font-bold text-[#171717] lg:hidden"><SlidersHorizontal size={15} /> Filters</button>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6F6A63]">Sort
            <span className="relative">
              <select value={filters.sort ?? 'newest'} onChange={(event) => handleFilterChange({ ...filters, sort: event.target.value, page: 1 })} className="h-10 appearance-none rounded-lg border border-[#DDD3C5] bg-white py-0 pl-3 pr-9 text-xs font-bold normal-case text-[#171717] outline-none focus:border-[#E6321C]">
                <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="title_asc">Name: A to Z</option>
              </select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6A63]" />
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block"><div className="sticky top-28">{sidebar}</div></aside>
        <section className="lg:col-span-9">
          {productsQuery.isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />)}</div> : null}
          {productsQuery.isError ? <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center"><h2 className="text-xl font-bold text-ink">We couldn’t load the catalog</h2><p className="mt-2 text-sm text-muted">Check that the Bingooo API is running, then try again.</p><button onClick={() => productsQuery.refetch()} className="mt-5 rounded-lg bg-brand-red px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Try again</button></div> : null}
          {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? <div className="rounded-2xl border border-[#DDD3C5] bg-white p-10 text-center"><h2 className="text-xl font-bold text-ink">Nothing matches these filters</h2><p className="mt-2 text-sm text-muted">Clear a filter or explore the full Bingooo collection.</p><button onClick={() => handleFilterChange({ sort: 'newest', page: 1, limit: 12 })} className="mt-5 rounded-lg border border-[#E6321C] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#E6321C]">Clear filters</button></div> : null}
          {!productsQuery.isLoading && products.length > 0 ? <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product: any) => <ProductCard key={product.id} id={product.id} title={product.title} slug={product.slug} basePrice={product.base_price} compareAtPrice={product.compare_at_price} customizationEnabled={product.customization_enabled} category={product.category} variants={product.variants} images={product.images} />)}</div>{pageMeta && pageMeta.totalPages > 1 ? <nav aria-label="Product pages" className="mt-10 flex items-center justify-center gap-3"><button disabled={!pageMeta.hasPrev} onClick={() => handleFilterChange({ ...filters, page: filters.page! - 1 })} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DDD3C5] bg-white px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /> Previous</button><span className="text-xs font-semibold text-muted">Page {pageMeta.page} of {pageMeta.totalPages}</span><button disabled={!pageMeta.hasNext} onClick={() => handleFilterChange({ ...filters, page: filters.page! + 1 })} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DDD3C5] bg-white px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={15} /></button></nav> : null}</> : null}
        </section>
      </div>
    </div>
    <Drawer isOpen={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} title="Filter products" position="left" size="sm"><div className="p-5">{sidebar}</div></Drawer>
  </div>;
}
