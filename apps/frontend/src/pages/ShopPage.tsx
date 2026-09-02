import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Heart, ShoppingBag, Star, Shirt, ChevronDown } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { ProductQueryParams } from '../hooks/useProducts';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { Drawer } from '../components/ui/Drawer';
import { useCartStore } from '../store/cart';
import { useToast } from '../components/ui/Toast';

// ── Default 8 Catalog Products directly from Image 2 ──
const DEFAULT_SHOP_PRODUCTS = [
  {
    id: 'prod-1',
    slug: 'oversized-graphic-tee',
    title: 'Oversized Graphic Tee',
    rating: 4.8,
    reviewsCount: 124,
    price: 799,
    isNew: true,
    colors: [
      { name: 'Black', hex: '#171717' },
      { name: 'Cream', hex: '#EDE0CC' },
      { name: 'Sage', hex: '#7A8B7B' },
    ],
  },
  {
    id: 'prod-2',
    slug: 'chaos-printed-tee',
    title: 'Chaos Printed Tee',
    rating: 4.7,
    reviewsCount: 98,
    price: 799,
    isNew: true,
    colors: [
      { name: 'Khaki', hex: '#B29A78' },
      { name: 'Black', hex: '#171717' },
      { name: 'Olive', hex: '#354837' },
    ],
  },
  {
    id: 'prod-3',
    slug: 'essential-hoodie',
    title: 'Essential Hoodie',
    rating: 4.9,
    reviewsCount: 156,
    price: 1199,
    isNew: false,
    colors: [
      { name: 'Black', hex: '#171717' },
      { name: 'Charcoal', hex: '#2B2825' },
    ],
  },
  {
    id: 'prod-4',
    slug: 'baggy-fit-jeans',
    title: 'Baggy Fit Jeans',
    rating: 4.6,
    reviewsCount: 87,
    price: 1299,
    isNew: false,
    colors: [
      { name: 'Denim Blue', hex: '#597692' },
      { name: 'Black', hex: '#171717' },
      { name: 'Grey', hex: '#B2B5BA' },
    ],
  },
  {
    id: 'prod-5',
    slug: 'minimalist-heavy-hoodie',
    title: 'Minimalist Heavy Hoodie',
    rating: 4.8,
    reviewsCount: 64,
    price: 1199,
    isNew: false,
    colors: [
      { name: 'Grey Melange', hex: '#B8BAC0' },
      { name: 'Black', hex: '#171717' },
    ],
  },
  {
    id: 'prod-6',
    slug: 'signature-b-pocket-tee',
    title: 'Signature B Pocket Tee',
    rating: 4.9,
    reviewsCount: 112,
    price: 799,
    isNew: false,
    colors: [
      { name: 'Cream', hex: '#EDE0CC' },
      { name: 'White', hex: '#FFFFFF' },
    ],
  },
  {
    id: 'prod-7',
    slug: 'tokyo-drift-graphic-tee',
    title: 'Tokyo Drift Graphic Tee',
    rating: 4.7,
    reviewsCount: 89,
    price: 849,
    isNew: true,
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#171717' },
    ],
  },
  {
    id: 'prod-8',
    slug: 'camp-collar-resort-shirt',
    title: 'Camp Collar Resort Shirt',
    rating: 4.8,
    reviewsCount: 73,
    price: 999,
    isNew: false,
    colors: [
      { name: 'Black', hex: '#171717' },
      { name: 'Olive', hex: '#354837' },
    ],
  },
];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({
    'prod-1': '#171717',
    'prod-2': '#B29A78',
    'prod-3': '#171717',
    'prod-4': '#597692',
    'prod-5': '#B8BAC0',
    'prod-6': '#EDE0CC',
    'prod-7': '#FFFFFF',
    'prod-8': '#171717',
  });

  const { openDrawer, setItemCount, itemCount } = useCartStore();
  const { toast } = useToast();

  const categoryParam = searchParams.get('category') || undefined;
  const collectionParam = searchParams.get('collection') || undefined;
  const searchParam = searchParams.get('q') || undefined;

  const [filters, setFilters] = useState<ProductQueryParams>({
    categorySlug: categoryParam,
    collectionSlug: collectionParam,
    search: searchParam,
    sort: 'featured',
    page: 1,
    limit: 12,
  });

  const { data } = useProducts(filters);
  const apiProducts = data?.data || [];

  // Combine database products with default products from Image 2
  const displayProducts =
    apiProducts.length > 0
      ? apiProducts.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          rating: 4.8,
          reviewsCount: 120,
          price: p.base_price,
          isNew: true,
          image: p.images?.[0]?.url || p.images?.[0]?.object_key,
          colors: p.variants?.filter((v: any) => v.colorHex).map((v: any) => ({
            name: v.color || 'Color',
            hex: v.colorHex,
          })) || [{ name: 'Black', hex: '#171717' }],
        }))
      : DEFAULT_SHOP_PRODUCTS.filter((p) => {
          if (!filters.categorySlug) return true;
          if (filters.categorySlug === 't-shirts') return p.slug.includes('tee');
          if (filters.categorySlug === 'hoodies') return p.slug.includes('hoodie');
          if (filters.categorySlug === 'jeans') return p.slug.includes('jeans');
          if (filters.categorySlug === 'shirts') return p.slug.includes('shirt');
          return true;
        });

  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters(newFilters);
    if (newFilters.categorySlug) {
      setSearchParams({ category: newFilters.categorySlug });
    } else {
      setSearchParams({});
    }
  };

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = !prev[id];
      toast(next ? 'Added to wishlist' : 'Removed from wishlist', 'info');
      return { ...prev, [id]: next };
    });
  };

  const handleQuickAdd = (product: any) => {
    setItemCount(itemCount + 1);
    toast({
      title: `${product.title} added to cart`,
      description: `Color: ${
        product.colors?.find((c: any) => c.hex === selectedColors[product.id])?.name || 'Default'
      } • Size: L`,
      variant: 'success',
    });
    openDrawer();
  };

  const pageTitle = filters.categorySlug
    ? filters.categorySlug.toUpperCase().replace(/-/g, ' ')
    : 'SHOP ALL';

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {/* ─── Page Title, Breadcrumbs & Sort By (Exact Image 2) ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-[#DDD3C5]">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#171717] tracking-tight uppercase">
              {pageTitle}
            </h1>
            <nav className="mt-1 flex items-center gap-1.5 text-xs font-sans text-[#6F6A63]">
              <Link to="/" className="hover:text-[#E6321C]">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-[#171717] font-medium">Shop</span>
            </nav>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-[#DDD3C5] bg-white px-3.5 py-2 text-xs font-sans font-bold text-[#171717] shadow-xs"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-bold text-[#6F6A63] uppercase tracking-wider">
                SORT BY:
              </span>
              <div className="relative">
                <select
                  value={filters.sort || 'featured'}
                  onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value, page: 1 })}
                  className="appearance-none rounded-lg border border-[#DDD3C5] bg-white pl-3 pr-8 py-1.5 text-xs font-sans font-semibold text-[#171717] focus:outline-none focus:border-[#E6321C] cursor-pointer shadow-xs"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6F6A63] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Two-Column Layout (Sidebar + 4-Column Grid) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8">
          {/* Left Desktop Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FilterSidebar filters={filters} onChange={handleFilterChange} />
            </div>
          </div>

          {/* Right Product Grid (9 cols) -> 4 columns on large desktop! */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayProducts.map((prod: any) => {
                const isFav = !!wishlist[prod.id];
                const activeColor = selectedColors[prod.id] || prod.colors?.[0]?.hex || '#171717';

                return (
                  <div
                    key={prod.id}
                    className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Image Area with NEW Badge & Wishlist Button */}
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg bg-[#F7EEDB]/60 flex items-center justify-center">
                      <Link
                        to={`/product/${prod.slug}`}
                        className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-300"
                      >
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <>
                            <Shirt size={44} className="text-[#171717]/40 mb-1" />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
                              {prod.title}
                            </span>
                          </>
                        )}
                      </Link>

                      {/* NEW Badge on Top Left */}
                      {prod.isNew && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-0.5 rounded-[4px] bg-[#E6321C] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Wishlist Button on Top Right */}
                      <button
                        onClick={(e) => toggleWishlist(e, prod.id)}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#171717] transition-colors shadow-xs"
                        aria-label="Toggle Wishlist"
                      >
                        <Heart
                          size={15}
                          className={isFav ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]'}
                        />
                      </button>
                    </div>

                    {/* Product Meta Info */}
                    <div className="mt-3 flex flex-col flex-1 justify-between">
                      <div>
                        <Link to={`/product/${prod.slug}`}>
                          <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                            {prod.title}
                          </h3>
                        </Link>

                        <div className="mt-1 flex items-baseline justify-between">
                          {/* Price */}
                          <span className="font-sans font-extrabold text-sm sm:text-base text-[#171717]">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#6F6A63]">
                          <Star size={12} className="fill-[#E6321C] text-[#E6321C]" />
                          <span className="text-[#171717] font-bold">{prod.rating}</span>
                          <span>({prod.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Swatches & QUICK ADD Button */}
                      <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-between gap-1.5">
                        {/* Color Dots */}
                        <div className="flex items-center gap-1">
                          {prod.colors?.map((c: any) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() =>
                                setSelectedColors((prev) => ({ ...prev, [prod.id]: c.hex }))
                              }
                              className={`h-3.5 w-3.5 rounded-full border transition-all ${
                                activeColor === c.hex
                                  ? 'border-[#E6321C] scale-110 ring-1 ring-[#E6321C]'
                                  : 'border-black/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                              aria-label={c.name}
                            />
                          ))}
                        </div>

                        {/* QUICK ADD Button matching Image 2 */}
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(prod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#E6321C]/50 hover:border-[#E6321C] bg-white hover:bg-[#E6321C] text-[#E6321C] hover:text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-colors shrink-0"
                        >
                          <ShoppingBag size={11} />
                          <span>QUICK ADD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="FILTERS"
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
