import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Heart, Check, Star, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { generateItemListSchema } from '../lib/seo/schema';
import { useProducts, useCategories } from '../hooks/useProducts';
import { SITE_URL, categorySeoDescription, categorySeoTitle, categoryUrl } from '../lib/seo/catalog-seo.mjs';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { prefetchProduct } from '../lib/utils/preloader';
import { ProductPlaceholder } from '../components/ui/ProductPlaceholder';
import { resolveImageUrl } from '../lib/utils';

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  mrp?: number;
  discount?: string;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  badgeType?: 'red' | 'black' | 'light';
  stock?: string;
  colors?: string[];
  sizes: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}

const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [];


const CATEGORY_TABS = [
  { label: 'All', slug: 'all' },
  { label: 'T-Shirts', slug: 't-shirts' },
  { label: 'Oversized', slug: 'oversized' },
  { label: 'Hoodies', slug: 'hoodies' },
  { label: 'Shirts', slug: 'shirts' },
  { label: 'Bottoms', slug: 'bottoms' },
  { label: 'New Arrivals', slug: 'new-arrivals' },
];

const FILTER_CATEGORIES = [
  { label: 'T-Shirts', slug: 't-shirts' },
  { label: 'Oversized', slug: 'oversized' },
  { label: 'Hoodies', slug: 'hoodies' },
  { label: 'Shirts', slug: 'shirts' },
  { label: 'Bottoms', slug: 'bottoms' },
];

const FILTER_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const FILTER_COLORS = [
  { name: 'Black', hex: '#171717' },
  { name: 'White', hex: '#FFFFFF', isWhite: true },
  { name: 'Beige', hex: '#D9CBB8' },
  { name: 'Grey', hex: '#77736D' },
  { name: 'Red', hex: '#E6321C' },
];

export function ShopPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { data: categoriesData } = useCategories();
  const seoCategory = slug ? (categoriesData || []).find((c: any) => c.slug === slug) : undefined;
  const categoryLabel = seoCategory?.name || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');
  const [searchParams, setSearchParams] = useSearchParams();

  const { addItem } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [localWishlist, setLocalWishlist] = useState<Set<string>>(new Set());

  const isProductInWishlist = (id: string) => {
    return localWishlist.has(id) || wishlist.some((item: any) => (item.product?.id || item.productId || item.id) === id);
  };

  const handleToggleWishlist = (id: string) => {
    triggerHaptic('light');
    const currentlyIn = isProductInWishlist(id);
    setLocalWishlist((prev) => {
      const next = new Set(prev);
      if (currentlyIn) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    toggleWishlist(id, currentlyIn);
  };

  // Selected filters from URL or state
  const initialCategory = slug || searchParams.get('category') || 'all';
  const [activeTab, setActiveTab] = useState<string>(initialCategory);
  const [collectionFilter, setCollectionFilter] = useState<'ALL' | 'NEW' | 'BESTSELLERS'>('ALL');
  const [sortOption, setSortOption] = useState<string>(searchParams.get('sort') || 'Recommended');

  // Sidebar filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory !== 'all' ? [initialCategory] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState<boolean>(false);

  // Mobile Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState<boolean>(false);

  // Quick Add animation tracking
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Keep active tab in sync if the category in the URL changes (adjusted during render)
  const [syncedSlug, setSyncedSlug] = useState(slug);
  if (slug !== syncedSlug) {
    setSyncedSlug(slug);
    if (slug) {
      setActiveTab(slug);
      setSelectedCategories([slug]);
    }
  }

  // Fetch products from API (with fallback)
  const { data: apiProductsData, isLoading } = useProducts({
    categorySlug: activeTab !== 'all' ? activeTab : undefined,
    sort: sortOption.toLowerCase().includes('low') ? 'price_asc' : sortOption.toLowerCase().includes('high') ? 'price_desc' : 'newest',
    limit: 24,
  });

  const catalogProducts: ShopProduct[] = useMemo(() => {
    const rawApi = apiProductsData?.data;
    if (rawApi && rawApi.length > 0) {
      return rawApi.map((p: any, idx: number) => ({
        id: p.id || `api-${idx}`,
        name: p.title || p.name,
        slug: p.slug,
        category: (p.category?.name || 'T-SHIRT').toUpperCase(),
        categorySlug: p.category?.slug || 't-shirts',
        price: p.base_price ?? p.basePrice ?? 999,
        mrp: p.compare_at_price ?? p.compareAtPrice,
        discount: p.compare_at_price
          ? `${Math.round(((p.compare_at_price - p.base_price) / p.compare_at_price) * 100)}% OFF`
          : undefined,
        rating: p.rating || 5,
        reviewsCount: p.reviews_count || 48,
        image: resolveImageUrl(
          p.images?.[0]?.url ||
          p.images?.[0]?.object_key ||
          (typeof p.images?.[0] === 'string' ? p.images[0] : '') ||
          p.image_url ||
          p.imageUrl ||
          ''
        ),
        isBestseller: !!p.bestseller,
        badge: p.bestseller
          ? 'BESTSELLER'
          : p.badge_text || p.badgeText || (p.is_sale || p.isSale ? (p.sale_tag || p.saleTag || 'SALE') : undefined),
        badgeType: p.is_sale || p.isSale ? 'red' : p.bestseller ? 'black' : 'light',
        sizes: p.variants?.map((v: any) => v.size) || ['S', 'M', 'L'],
        colors: p.variants?.map((v: any) => v.colorHex || '#171717') || ['#171717'],
      }));
    }
    return DEFAULT_SHOP_PRODUCTS;
  }, [apiProductsData]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((product) => {
      // Category Tab filter
      if (activeTab === 'new-arrivals' && !product.isNew && product.badge !== 'NEW') {
        return false;
      }
      if (activeTab !== 'all' && activeTab !== 'new-arrivals') {
        if (product.categorySlug !== activeTab && !product.category.toLowerCase().includes(activeTab.toLowerCase())) {
          return false;
        }
      }

      // Sidebar Category checkboxes
      if (selectedCategories.length > 0) {
        const matchesCategory = selectedCategories.some(
          (cat) => product.categorySlug === cat || product.category.toLowerCase().includes(cat.toLowerCase())
        );
        if (!matchesCategory) return false;
      }

      // Quick Collection pills
      if (collectionFilter === 'NEW' && !product.isNew && product.badge !== 'NEW') {
        return false;
      }
      if (collectionFilter === 'BESTSELLERS' && !product.isBestseller && product.badge !== 'BESTSELLER') {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const matchesSize = selectedSizes.some((s) => product.sizes.includes(s));
        if (!matchesSize) return false;
      }

      // Price filter
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      if (product.price < min || product.price > max) {
        return false;
      }

      // Color filter
      if (selectedColors.length > 0 && product.colors) {
        const matchesColor = selectedColors.some((c) =>
          product.colors?.some((pc) => pc.toLowerCase() === c.toLowerCase())
        );
        if (!matchesColor) return false;
      }

      // In stock
      if (inStockOnly && product.stock === 'SOLD OUT') {
        return false;
      }

      // New arrivals
      if (newArrivalsOnly && !product.isNew && product.badge !== 'NEW') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'Price: Low to High') return a.price - b.price;
      if (sortOption === 'Price: High to Low') return b.price - a.price;
      if (sortOption === 'Best Rated') return b.rating - a.rating;
      if (sortOption === 'Newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // Recommended
    });
  }, [
    catalogProducts,
    activeTab,
    collectionFilter,
    selectedCategories,
    selectedSizes,
    minPrice,
    maxPrice,
    selectedColors,
    inStockOnly,
    newArrivalsOnly,
    sortOption,
  ]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    setInStockOnly(false);
    setNewArrivalsOnly(false);
    setCollectionFilter('ALL');
    setActiveTab('all');
    setSearchParams({}, { replace: true });
    triggerHaptic('light');
  };

  // Quick Add handler
  const handleQuickAdd = (product: ShopProduct) => {
    triggerHaptic('medium');
    const defaultSize = product.sizes[0] || 'M';
    addItem(`var-${product.id}-${defaultSize}`, 1);
    setQuickAddedId(product.id);
    setTimeout(() => {
      setQuickAddedId(null);
    }, 1500);
  };

  // Ensure body scroll is never left locked on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close mobile filter on escape and manage body overflow cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileFilterOpen(false);
        setIsMobileSortOpen(false);
      }
    };
    if (isMobileFilterOpen || isMobileSortOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileFilterOpen, isMobileSortOpen]);

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen">
      <SEO
        // Category copy comes from the shared catalog helpers so it matches the prerendered page.
        title={slug ? categorySeoTitle(seoCategory || { name: categoryLabel }) : 'Shop Oversized T-Shirts, Hoodies & Streetwear Online in India | Bingooo®'}
        description={
          slug
            ? categorySeoDescription(seoCategory || { name: categoryLabel }, filteredProducts.length)
            : 'Shop Bingooo streetwear: heavyweight oversized t-shirts, hoodies and more in premium cotton. Secure prepaid checkout, free delivery across India and 7-day easy exchange.'
        }
        keywords={slug ? `${categoryLabel.toLowerCase()}, ${categoryLabel.toLowerCase()} online india, bingooo` : 'oversized t-shirts for men, heavyweight t shirt india, streetwear brand india, bingooo'}
        canonical={slug ? categoryUrl(slug) : `${SITE_URL}/shop`}
        breadcrumbs={[
          { name: 'Home', url: `${SITE_URL}/` },
          { name: slug ? categoryLabel : 'Shop', url: slug ? categoryUrl(slug) : `${SITE_URL}/shop` },
        ]}
        schema={filteredProducts.length > 0 ? generateItemListSchema(
          filteredProducts.slice(0, 10).map((p) => ({ name: p.name, slug: p.slug, price: p.price, image: p.image })),
          slug ? `${categoryLabel} — Bingooo` : 'Bingooo Streetwear Collection',
        ) : undefined}
      />

      {/* =======================================================
           SHOP HERO
      ======================================================= */}
      <section className="pt-[clamp(45px,6vw,80px)] pb-[35px] border-b-2 border-[#171717] bg-[#F7EEDB]">
        <div className="container-bingooo flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#171717] text-white text-[9px] font-mono uppercase font-black border border-[#171717] mb-3">
              01 // CATALOG ARCHIVE
            </div>

            <h1 className="my-2 text-[clamp(44px,7vw,86px)] leading-[0.88] font-black tracking-tight uppercase text-[#171717]">
              SHOP<br />
              <span className="text-[#E6321C]">THE FIT.</span>
            </h1>

            <p className="max-w-[500px] m-0 text-[#6F6A63] text-[12px] leading-[1.7] font-medium">
              Heavyweight architectural apparel engineered with 240+ GSM combed cotton. Built to define, structured to last.
            </p>
          </div>

          <div className="font-mono text-[11px] font-black text-[#171717] px-3 py-1.5 border-2 border-[#171717] bg-white shadow-[3px_3px_0px_#171717] whitespace-nowrap mt-3 md:mt-0">
            {filteredProducts.length} ARTICLES LISTED
          </div>
        </div>
      </section>

      {/* =======================================================
           CATEGORY NAV (HORIZONTALLY SCROLLABLE ON MOBILE)
      ======================================================= */}
      <nav className="border-b-2 border-[#171717] bg-white overflow-x-auto no-scrollbar scroll-smooth">
        <div className="container-bingooo flex gap-[10px] min-w-max py-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.slug);
                if (tab.slug === 'all') {
                  setSelectedCategories([]);
                } else if (tab.slug !== 'new-arrivals') {
                  setSelectedCategories([tab.slug]);
                }
              }}
              className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.slug
                  ? 'bg-[#171717] text-white border-[#171717] shadow-[2px_2px_0px_#E6321C]'
                  : 'bg-[#F7EEDB] text-[#171717] border-[#171717] hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="container-bingooo">
        {/* =======================================================
             SHOP TOOLBAR (DESKTOP)
        ======================================================= */}
        <div className="hidden md:flex py-[22px] justify-between items-center gap-5 border-b-2 border-[#171717]/10 mb-6">
          <div className="flex items-center gap-2">
            {(['ALL', 'NEW', 'BESTSELLERS'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCollectionFilter(filter);
                }}
                className={`h-[40px] px-[18px] border-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  collectionFilter === filter
                    ? 'bg-[#E6321C] text-white border-[#171717] shadow-[3px_3px_0px_#171717]'
                    : 'border-[#171717] bg-white text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#171717] font-mono text-[10px] font-bold uppercase tracking-wider">
              SORT ORDER:
            </span>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="h-[40px] px-3 pr-8 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717] outline-none text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
              <option value="Recommended">Recommended</option>
              <option value="Newest">Newest</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Best Rated">Best Rated</option>
            </select>
          </div>
        </div>

        {/* =======================================================
             MOBILE TOOLBAR (CLEAN & TOUCH-OPTIMIZED)
        ======================================================= */}
        <div className="grid grid-cols-2 gap-2.5 my-4 md:hidden">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileFilterOpen(true);
            }}
            className="h-11 border-2 border-[#171717] bg-white text-[10px] font-black tracking-wider uppercase text-[#171717] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
          >
            <SlidersHorizontal size={13} className="text-[#E6321C]" />
            <span>FILTER {selectedCategories.length + selectedSizes.length > 0 ? `(${selectedCategories.length + selectedSizes.length})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileSortOpen(true);
            }}
            className="h-11 border-2 border-[#171717] bg-[#171717] text-white text-[10px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
          >
            <ArrowUpDown size={13} />
            <span className="truncate">SORT: {sortOption}</span>
          </button>
        </div>

        {/* =======================================================
             SHOP LAYOUT (SIDEBAR + GRID)
        ======================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6 lg:gap-8 pb-[100px]">

          {/* ── DESKTOP FILTERS SIDEBAR (Sticky Below Header) ── */}
          <aside className="hidden md:block sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto p-4 bg-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717] no-scrollbar">
            <div className="flex justify-between items-center pb-3.5 border-b-2 border-[#171717]">
              <h2 className="m-0 text-[12px] font-black uppercase tracking-wider text-[#171717]">
                FILTERS
              </h2>

              {(selectedCategories.length > 0 || selectedSizes.length > 0 || minPrice || maxPrice || selectedColors.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="border-0 bg-transparent p-0 text-[#E6321C] text-[9px] font-black uppercase cursor-pointer hover:underline tracking-wider"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="py-4 border-b-2 border-[#171717]/10">
              <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase text-[#171717] tracking-wider">
                <span>Category</span>
                <span className="font-mono text-[12px] font-black">−</span>
              </div>

              {FILTER_CATEGORIES.map((cat) => (
                <label key={cat.slug} className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[#6F6A63] cursor-pointer hover:text-[#171717]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(cat.slug) ? prev.filter((c) => c !== cat.slug) : [...prev, cat.slug]
                      );
                    }}
                    className="appearance-none w-4 h-4 border-2 border-[#171717] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>

            {/* Size Filter */}
            <div className="py-4 border-b-2 border-[#171717]/10">
              <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase text-[#171717] tracking-wider">
                <span>Size</span>
                <span className="font-mono text-[12px] font-black">−</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {FILTER_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSizes((prev) =>
                        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                      );
                    }}
                    className={`h-8 border-2 text-[10px] font-black font-mono transition-all cursor-pointer ${
                      selectedSizes.includes(size)
                        ? 'bg-[#171717] text-white border-[#171717] shadow-[2px_2px_0px_#E6321C]'
                        : 'border-[#171717] bg-white text-[#171717] hover:bg-[#F7EEDB]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="py-4 border-b-2 border-[#171717]/10">
              <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase text-[#171717] tracking-wider">
                <span>Price (₹)</span>
                <span className="font-mono text-[12px] font-black">−</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="MIN"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-[36px] border-2 border-[#171717] bg-[#F7EEDB] px-2 outline-none font-mono text-[10px] font-bold"
                />
                <input
                  type="number"
                  placeholder="MAX"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-[36px] border-2 border-[#171717] bg-[#F7EEDB] px-2 outline-none font-mono text-[10px] font-bold"
                />
              </div>
            </div>

            {/* Color Filter */}
            <div className="py-4 border-b-2 border-[#171717]/10">
              <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase text-[#171717] tracking-wider">
                <span>Color</span>
                <span className="font-mono text-[12px] font-black">−</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTER_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.hex);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => {
                        setSelectedColors((prev) =>
                          prev.includes(col.hex) ? prev.filter((c) => c !== col.hex) : [...prev, col.hex]
                        );
                      }}
                      className={`w-[26px] h-[26px] border-2 border-[#171717] transition-all cursor-pointer ${
                        isSelected ? 'shadow-[3px_3px_0px_#E6321C] scale-110' : 'shadow-[1px_1px_0px_#171717] hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: col.hex,
                      }}
                      aria-label={col.name}
                      title={col.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="py-4 border-b-0">
              <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase text-[#171717] tracking-wider">
                <span>Status</span>
                <span className="font-mono text-[12px] font-black">−</span>
              </div>

              <label className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[#6F6A63] cursor-pointer hover:text-[#171717]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="appearance-none w-4 h-4 border-2 border-[#171717] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                />
                <span>IN STOCK</span>
              </label>

              <label className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[#6F6A63] cursor-pointer hover:text-[#171717]">
                <input
                  type="checkbox"
                  checked={newArrivalsOnly}
                  onChange={(e) => setNewArrivalsOnly(e.target.checked)}
                  className="appearance-none w-4 h-4 border-2 border-[#171717] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                />
                <span>NEW ARRIVALS</span>
              </label>
            </div>
          </aside>

          {/* ── PRODUCT GRID & PAGINATION ── */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-[35px] gap-x-[18px]">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#ddd3c5]">
                <h3 className="text-[16px] font-bold uppercase mb-2">No products available</h3>
                <p className="text-[#6f6a63] text-[11px] mb-5">Products added from the Admin Panel will appear here live.</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-[#171717] text-white text-[10px] font-bold uppercase"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => {
                  const inWishlist = isProductInWishlist(product.id);
                  const isQuickAdded = quickAddedId === product.id;

                  return (
                    <article
                      key={product.id}
                      className="min-w-0 group bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-2.5 flex flex-col justify-between"
                      onMouseEnter={() => prefetchProduct(product.slug)}
                      onTouchStart={() => prefetchProduct(product.slug)}
                    >
                      <div>
                        {/* Product Image Container */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE0CC] border-2 border-[#171717]">
                          {/* Badges */}
                          {product.badge && (
                            <div className="absolute left-2 top-2 z-[3] flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-[0.08em] uppercase border border-[#171717] ${
                                  product.badgeType === 'red'
                                    ? 'bg-[#E6321C] text-white'
                                    : product.badgeType === 'light'
                                    ? 'bg-white text-[#171717]'
                                    : 'bg-[#171717] text-white'
                                }`}
                              >
                                {product.badge}
                              </span>
                            </div>
                          )}

                          {/* Wishlist Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(product.id)}
                            className={`absolute top-2 right-2 z-[4] w-8 h-8 border-2 border-[#171717] grid place-items-center transition-all cursor-pointer shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                              inWishlist
                                ? 'bg-[#171717] text-white'
                                : 'bg-[#F7EEDB] text-[#171717] hover:bg-[#E6321C] hover:text-white'
                            }`}
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart
                              size={13}
                              className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : 'text-current'}
                            />
                          </button>

                          {/* Image Link */}
                          <Link to={`/product/${product.slug}`} className="block w-full h-full">
                            {product.image && !failedImages[product.id] ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                                onError={() => {
                                  setFailedImages((prev) => ({ ...prev, [product.id]: true }));
                                }}
                              />
                            ) : (
                              <ProductPlaceholder name={product.name} category={product.category} />
                            )}
                          </Link>

                          {/* Quick Add Button */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(product)}
                            className="hidden sm:flex items-center justify-center gap-1.5 absolute left-2 right-2 bottom-2 h-[40px] border-2 border-[#171717] bg-[#171717] text-white text-[9px] font-black tracking-wider uppercase translate-y-[55px] group-hover:translate-y-0 transition-transform duration-200 cursor-pointer shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C]"
                          >
                            {isQuickAdded ? (
                              <>
                                <span>ADDED</span>
                                <Check size={12} />
                              </>
                            ) : (
                              'QUICK ADD'
                            )}
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="pt-3 pb-1">
                          <div className="mb-1 text-[#E6321C] font-mono text-[8px] font-bold tracking-[0.1em] uppercase">
                            {product.category}
                          </div>

                          <h2 className="m-0 mb-1.5 text-[12px] font-black uppercase tracking-tight line-clamp-1">
                            <Link to={`/product/${product.slug}`} className="hover:text-[#E6321C] transition-colors">
                              {product.name}
                            </Link>
                          </h2>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center gap-0.5 text-[#171717]">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={10}
                                  className={s <= product.rating ? 'fill-[#171717] text-[#171717]' : 'text-[#DDD3C5]'}
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[#6F6A63] text-[9px] font-bold">
                              ({product.reviewsCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price Row */}
                      <div className="pt-2 border-t border-[#171717]/10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-black font-mono text-[#171717]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>

                          {product.mrp && (
                            <span className="text-[#6F6A63] font-mono text-[10px] line-through">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {product.discount && (
                          <span className="px-1.5 py-0.5 bg-[#E6321C] text-white text-[8px] font-mono font-black uppercase border border-[#171717]">
                            {product.discount}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-[60px]">
                <button type="button" className="w-[40px] h-[40px] border-2 border-[#171717] bg-[#171717] text-white text-[11px] font-mono font-black shadow-[2px_2px_0px_#171717]">
                  1
                </button>
                <button type="button" className="w-[40px] h-[40px] border-2 border-[#171717] bg-white text-[11px] font-mono font-black shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB]">
                  2
                </button>
                <button type="button" className="w-[40px] h-[40px] border-2 border-[#171717] bg-white text-[11px] font-mono font-black shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB]">
                  3
                </button>
                <button type="button" className="w-[40px] h-[40px] border-2 border-[#171717] bg-white text-[11px] font-mono font-black shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C] hover:text-white">
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================================================
           MOBILE FILTER DRAWER
      ======================================================= */}
      {isMobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <aside
            className="w-[min(350px,90%)] h-full p-6 bg-[#F7EEDB] border-r-2 border-[#171717] overflow-y-auto shadow-[6px_0px_0px_#171717] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center pb-4 border-b-2 border-[#171717]">
                <h2 className="m-0 text-[18px] font-black uppercase tracking-tight text-[#171717]">
                  FILTERS.
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 border-2 border-[#171717] bg-white text-base font-black grid place-items-center shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C] hover:text-white transition-all cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Category */}
              <div className="py-4 border-b-2 border-[#171717]/10">
                <div className="text-[10px] font-black uppercase text-[#171717] mb-3 tracking-wider">Category</div>
                {FILTER_CATEGORIES.map((cat) => (
                  <label key={cat.slug} className="flex items-center gap-2.5 mb-2.5 text-[10px] font-bold text-[#6F6A63] cursor-pointer hover:text-[#171717]">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat.slug) ? prev.filter((c) => c !== cat.slug) : [...prev, cat.slug]
                        );
                      }}
                      className="w-4 h-4 border-2 border-[#171717] checked:bg-[#171717]"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>

              {/* Size */}
              <div className="py-4 border-b-2 border-[#171717]/10">
                <div className="text-[10px] font-black uppercase text-[#171717] mb-3 tracking-wider">Size</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {FILTER_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSizes((prev) =>
                          prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                        );
                      }}
                      className={`h-9 border-2 text-[10px] font-mono font-black uppercase transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-[#171717] text-white border-[#171717] shadow-[2px_2px_0px_#E6321C]'
                          : 'border-[#171717] bg-white text-[#171717]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="py-4 border-b-2 border-[#171717]/10">
                <div className="text-[10px] font-black uppercase text-[#171717] mb-3 tracking-wider">Price (₹)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="MIN"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9 border-2 border-[#171717] bg-white px-2 font-mono text-[10px] font-bold"
                  />
                  <input
                    type="number"
                    placeholder="MAX"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9 border-2 border-[#171717] bg-white px-2 font-mono text-[10px] font-bold"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="py-4 border-b-0">
                <div className="text-[10px] font-black uppercase text-[#171717] mb-3 tracking-wider">Color</div>
                <div className="flex flex-wrap gap-2.5">
                  {FILTER_COLORS.map((col) => {
                    const isSelected = selectedColors.includes(col.hex);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          setSelectedColors((prev) =>
                            prev.includes(col.hex) ? prev.filter((c) => c !== col.hex) : [...prev, col.hex]
                          );
                        }}
                        className={`w-7 h-7 border-2 border-[#171717] transition-all ${isSelected ? 'shadow-[3px_3px_0px_#E6321C] scale-110' : 'shadow-[1px_1px_0px_#171717]'}`}
                        style={{ backgroundColor: col.hex }}
                        aria-label={col.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#171717] flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 h-12 border-2 border-[#171717] bg-white text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-12 border-2 border-[#171717] bg-[#E6321C] text-white text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0px_#171717] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                APPLY ({filteredProducts.length})
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =======================================================
           MOBILE SORT SHEET
      ======================================================= */}
      {isMobileSortOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsMobileSortOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#F7EEDB] p-6 border-t-2 border-x-2 border-[#171717] shadow-[0_-4px_0px_#171717]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b-2 border-[#171717] mb-3">
              <h3 className="m-0 text-[15px] font-black uppercase text-[#171717]">SORT BY ORDER</h3>
              <button
                type="button"
                onClick={() => setIsMobileSortOpen(false)}
                className="w-7 h-7 border-2 border-[#171717] bg-white grid place-items-center text-sm font-black shadow-[2px_2px_0px_#171717]"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {[
                'Recommended',
                'Newest',
                'Price: Low to High',
                'Price: High to Low',
                'Best Rated',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSortOption(opt);
                    setIsMobileSortOpen(false);
                  }}
                  className={`py-3 px-4 text-left text-[11px] font-black uppercase border-2 border-[#171717] transition-all ${
                    sortOption === opt
                      ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                      : 'bg-white text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ShopPage;
