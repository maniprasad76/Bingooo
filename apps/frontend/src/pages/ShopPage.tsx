import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Heart, Check, Star } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { triggerHaptic } from '../lib/native/capacitorBridge';

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

const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-1',
    name: 'Classic Logo Tee',
    slug: 'classic-logo-tee',
    category: 'T-SHIRT',
    categorySlug: 't-shirts',
    price: 999,
    mrp: 1299,
    discount: '23% OFF',
    rating: 5,
    reviewsCount: 126,
    badge: 'NEW',
    badgeType: 'red',
    isNew: true,
    colors: ['#171717', '#FFFFFF', '#D9CBB8'],
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-2',
    name: 'Essential Tee',
    slug: 'essential-tee',
    category: 'T-SHIRT',
    categorySlug: 't-shirts',
    price: 899,
    rating: 5,
    reviewsCount: 94,
    badge: 'BESTSELLER',
    badgeType: 'black',
    isBestseller: true,
    colors: ['#171717', '#77736D', '#FFFFFF'],
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-3',
    name: 'Signature Hoodie',
    slug: 'heavyweight-fleece-hoodie',
    category: 'HOODIE',
    categorySlug: 'hoodies',
    price: 1499,
    mrp: 1799,
    discount: '17% OFF',
    rating: 5,
    reviewsCount: 81,
    badge: 'LIMITED',
    badgeType: 'light',
    stock: 'ONLY 5 LEFT',
    sizes: ['M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-4',
    name: 'Bold B Tee',
    slug: 'bold-b-tee',
    category: 'T-SHIRT',
    categorySlug: 't-shirts',
    price: 1199,
    rating: 4,
    reviewsCount: 57,
    colors: ['#171717', '#E6321C'],
    sizes: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-5',
    name: 'Everyday Oversized Tee',
    slug: 'everyday-oversized-tee',
    category: 'OVERSIZED',
    categorySlug: 'oversized',
    price: 1039,
    mrp: 1299,
    discount: '20% OFF',
    rating: 5,
    reviewsCount: 73,
    badge: '-20%',
    badgeType: 'red',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-6',
    name: 'Relaxed Utility Shirt',
    slug: 'relaxed-utility-shirt',
    category: 'SHIRT',
    categorySlug: 'shirts',
    price: 1399,
    rating: 5,
    reviewsCount: 42,
    badge: 'NEW',
    badgeType: 'black',
    isNew: true,
    colors: ['#D9CBB8', '#171717'],
    sizes: ['M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-7',
    name: 'Daily Fit Tee',
    slug: 'daily-fit-tee',
    category: 'T-SHIRT',
    categorySlug: 't-shirts',
    price: 949,
    rating: 4,
    reviewsCount: 38,
    sizes: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-8',
    name: 'Heavyweight Tee',
    slug: 'heavyweight-tee',
    category: 'PREMIUM',
    categorySlug: 't-shirts',
    price: 1199,
    mrp: 1499,
    discount: '20% OFF',
    rating: 5,
    reviewsCount: 61,
    badge: 'SALE',
    badgeType: 'red',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'prod-9',
    name: 'Classic Oversized',
    slug: 'classic-oversized',
    category: 'OVERSIZED',
    categorySlug: 'oversized',
    price: 1099,
    rating: 5,
    reviewsCount: 105,
    badge: 'BESTSELLER',
    badgeType: 'black',
    isBestseller: true,
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1506629905607-d9a4b8c2b1c0?auto=format&fit=crop&w=900&q=85',
  },
];

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

  // Keep active tab in sync if URL changes
  useEffect(() => {
    if (slug) {
      setActiveTab(slug);
      setSelectedCategories([slug]);
    }
  }, [slug]);

  // Fetch products from API (with fallback)
  const { data: apiProductsData } = useProducts({
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
        image: p.images?.[0]?.url || p.images?.[0] || DEFAULT_SHOP_PRODUCTS[idx % DEFAULT_SHOP_PRODUCTS.length].image,
        badge: idx === 0 ? 'NEW' : idx === 1 ? 'BESTSELLER' : undefined,
        badgeType: idx === 0 ? 'red' : 'black',
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

  // Close mobile filter on escape
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
        title="Shop — BINGOOO"
        description="Everyday essentials, statement pieces and custom clothing made for people who want to wear what defines them."
        canonical="https://bingooo.in/shop"
      />

      {/* =======================================================
           SHOP HERO
      ======================================================= */}
      <section className="pt-[clamp(50px,7vw,90px)] pb-[45px] border-b border-[#ddd3c5]">
        <div className="container-bingooo flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              BINGOOO / SHOP
            </div>

            <h1 className="my-2.5 sm:mb-[15px] text-[clamp(48px,7vw,90px)] leading-[0.85] font-extrabold tracking-[-0.075em] uppercase">
              SHOP<br />
              THE FIT.
            </h1>

            <p className="max-w-[500px] m-0 text-[#6f6a63] text-[12px] leading-[1.7]">
              Everyday essentials, statement pieces and custom clothing made for people who want to wear what defines them.
            </p>
          </div>

          <div className="font-mono text-[10px] text-[#6f6a63] whitespace-nowrap mt-4 md:mt-0">
            {filteredProducts.length} PRODUCTS
          </div>
        </div>
      </section>

      {/* =======================================================
           CATEGORY NAV
      ======================================================= */}
      <nav className="border-b border-[#ddd3c5] overflow-x-auto">
        <div className="container-bingooo flex gap-[30px] min-w-max">
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
              className={`py-[18px] border-b-2 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                activeTab === tab.slug
                  ? 'border-[#e6321c] text-[#e6321c]'
                  : 'border-transparent text-[#171717] hover:text-[#e6321c]'
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
        <div className="hidden md:flex py-[25px] justify-between items-center gap-5">
          <div className="flex items-center gap-2.5">
            {(['ALL', 'NEW', 'BESTSELLERS'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCollectionFilter(filter);
                }}
                className={`h-[42px] px-[17px] border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  collectionFilter === filter
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'border-[#ddd3c5] bg-transparent text-[#171717] hover:border-[#171717]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#6f6a63] text-[9px] font-semibold uppercase">
              Sort by
            </span>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="h-[42px] px-3 pr-8 border border-[#ddd3c5] bg-transparent outline-none text-[10px] font-semibold cursor-pointer"
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
             MOBILE TOOLBAR
        ======================================================= */}
        <div className="grid grid-cols-2 gap-2 my-5 md:hidden">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileFilterOpen(true);
            }}
            className="h-[43px] border border-[#ddd3c5] bg-transparent text-[9px] font-bold uppercase text-[#171717]"
          >
            FILTER {selectedCategories.length + selectedSizes.length > 0 && `(${selectedCategories.length + selectedSizes.length})`}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileSortOpen(true);
            }}
            className="h-[43px] border border-[#171717] bg-[#171717] text-white text-[9px] font-bold uppercase"
          >
            SORT: {sortOption}
          </button>
        </div>

        {/* =======================================================
             SHOP LAYOUT (SIDEBAR + GRID)
        ======================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-[235px_minmax(0,1fr)] gap-[35px] pb-[100px]">

          {/* ── DESKTOP FILTERS SIDEBAR ── */}
          <aside className="hidden md:block sticky top-5 self-start">
            <div className="flex justify-between items-center pb-[17px] border-b border-[#ddd3c5]">
              <h2 className="m-0 text-[12px] font-bold uppercase">
                Filters
              </h2>

              {(selectedCategories.length > 0 || selectedSizes.length > 0 || minPrice || maxPrice || selectedColors.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="border-0 bg-transparent p-0 text-[#e6321c] text-[9px] font-bold uppercase cursor-pointer hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="py-5 border-b border-[#ddd3c5]">
              <div className="flex justify-between items-center mb-[15px] text-[10px] font-bold uppercase">
                <span>Category</span>
                <span className="text-[13px]">−</span>
              </div>

              {FILTER_CATEGORIES.map((cat) => (
                <label key={cat.slug} className="flex items-center gap-[9px] mb-[11px] text-[10px] text-[#6f6a63] cursor-pointer hover:text-[#171717]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(cat.slug) ? prev.filter((c) => c !== cat.slug) : [...prev, cat.slug]
                      );
                    }}
                    className="appearance-none w-[15px] h-[15px] border border-[#ddd3c5] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-[1.5px] checked:after:border-b-[1.5px] checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                  />
                  {cat.label}
                </label>
              ))}
            </div>

            {/* Size Filter */}
            <div className="py-5 border-b border-[#ddd3c5]">
              <div className="flex justify-between items-center mb-[15px] text-[10px] font-bold uppercase">
                <span>Size</span>
                <span className="text-[13px]">−</span>
              </div>

              {FILTER_SIZES.map((size) => (
                <label key={size} className="flex items-center gap-[9px] mb-[11px] text-[10px] text-[#6f6a63] cursor-pointer hover:text-[#171717]">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => {
                      setSelectedSizes((prev) =>
                        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                      );
                    }}
                    className="appearance-none w-[15px] h-[15px] border border-[#ddd3c5] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-[1.5px] checked:after:border-b-[1.5px] checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                  />
                  {size}
                </label>
              ))}
            </div>

            {/* Price Filter */}
            <div className="py-5 border-b border-[#ddd3c5]">
              <div className="flex justify-between items-center mb-[15px] text-[10px] font-bold uppercase">
                <span>Price</span>
                <span className="text-[13px]">−</span>
              </div>

              <div className="grid grid-cols-2 gap-[7px]">
                <input
                  type="number"
                  placeholder="₹ MIN"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full h-[38px] border border-[#ddd3c5] bg-white px-2.5 outline-none text-[10px]"
                />
                <input
                  type="number"
                  placeholder="₹ MAX"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-[38px] border border-[#ddd3c5] bg-white px-2.5 outline-none text-[10px]"
                />
              </div>
            </div>

            {/* Color Filter */}
            <div className="py-5 border-b border-[#ddd3c5]">
              <div className="flex justify-between items-center mb-[15px] text-[10px] font-bold uppercase">
                <span>Color</span>
                <span className="text-[13px]">−</span>
              </div>

              <div className="flex flex-wrap gap-[9px]">
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
                      className={`w-[27px] h-[27px] rounded-full border-2 border-transparent transition-all cursor-pointer ${
                        isSelected ? 'shadow-[0_0_0_2px_#f7eedb,0_0_0_3px_#171717]' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: col.hex,
                        border: col.isWhite ? '1px solid #ccc' : 'none',
                      }}
                      aria-label={col.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="py-5 border-b-0">
              <div className="flex justify-between items-center mb-[15px] text-[10px] font-bold uppercase">
                <span>Availability</span>
                <span className="text-[13px]">−</span>
              </div>

              <label className="flex items-center gap-[9px] mb-[11px] text-[10px] text-[#6f6a63] cursor-pointer hover:text-[#171717]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="appearance-none w-[15px] h-[15px] border border-[#ddd3c5] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-[1.5px] checked:after:border-b-[1.5px] checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                />
                In stock
              </label>

              <label className="flex items-center gap-[9px] mb-[11px] text-[10px] text-[#6f6a63] cursor-pointer hover:text-[#171717]">
                <input
                  type="checkbox"
                  checked={newArrivalsOnly}
                  onChange={(e) => setNewArrivalsOnly(e.target.checked)}
                  className="appearance-none w-[15px] h-[15px] border border-[#ddd3c5] bg-white checked:bg-[#171717] checked:border-[#171717] relative checked:after:content-[''] checked:after:w-[4px] checked:after:h-[8px] checked:after:border-r-[1.5px] checked:after:border-b-[1.5px] checked:after:border-white checked:after:rotate-45 checked:after:block checked:after:mx-auto checked:after:mt-[1px]"
                />
                New arrivals
              </label>
            </div>
          </aside>

          {/* ── PRODUCT GRID & PAGINATION ── */}
          <div>
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#ddd3c5]">
                <h3 className="text-[16px] font-bold uppercase mb-2">No matching products</h3>
                <p className="text-[#6f6a63] text-[11px] mb-5">Try resetting your filters to explore our complete collection.</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-[#171717] text-white text-[10px] font-bold uppercase"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-[35px] gap-x-[18px]">
                {filteredProducts.map((product) => {
                  const inWishlist = isProductInWishlist(product.id);
                  const isQuickAdded = quickAddedId === product.id;

                  return (
                    <article key={product.id} className="min-w-0 group">
                      {/* Product Image Container */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#ede0cc]">
                        {/* Badges */}
                        {product.badge && (
                          <div className="absolute left-3 top-3 z-[3] flex flex-col gap-[5px]">
                            <span
                              className={`px-2 py-1.5 text-[8px] font-bold tracking-[0.08em] uppercase ${
                                product.badgeType === 'red'
                                  ? 'bg-[#e6321c] text-white'
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
                          className={`absolute top-3 right-3 z-[4] w-[34px] h-[34px] border border-[#ddd3c5] rounded-full grid place-items-center text-[18px] transition-all cursor-pointer ${
                            inWishlist
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-white/90 text-[#171717] hover:bg-[#171717] hover:text-white'
                          }`}
                          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={14}
                            className={inWishlist ? 'fill-[#e6321c] text-[#e6321c]' : 'text-current'}
                          />
                        </button>

                        {/* Image Link */}
                        <Link to={`/product/${product.slug}`} className="block w-full h-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                          />
                        </Link>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(product)}
                          className="hidden sm:flex items-center justify-center gap-1.5 absolute left-3 right-3 bottom-3 h-[45px] border-0 bg-[#171717]/95 text-white text-[9px] font-bold tracking-[0.06em] uppercase translate-y-[65px] group-hover:translate-y-0 transition-transform duration-200 cursor-pointer"
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
                      <div className="pt-[13px]">
                        <div className="mb-[5px] text-[#6f6a63] text-[8px] font-semibold tracking-[0.1em] uppercase">
                          {product.category}
                        </div>

                        <h2 className="m-0 mb-1.5 text-[12px] font-bold">
                          <Link to={`/product/${product.slug}`} className="hover:text-[#e6321c] transition-colors">
                            {product.name}
                          </Link>
                        </h2>

                        {/* Rating */}
                        <div className="flex items-center gap-[7px] mb-[7px]">
                          <div className="flex items-center gap-0.5 text-[#171717]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={s <= product.rating ? 'fill-[#171717] text-[#171717]' : 'text-[#ddd3c5]'}
                              />
                            ))}
                          </div>
                          <span className="text-[#6f6a63] text-[9px]">
                            {product.reviewsCount}
                          </span>
                        </div>

                        {/* Price Row */}
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>

                          {product.mrp && (
                            <span className="text-[#6f6a63] text-[10px] line-through">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                          )}

                          {product.discount && (
                            <span className="text-[#b91f12] text-[9px] font-bold">
                              {product.discount}
                            </span>
                          )}
                        </div>

                        {/* Stock Warning */}
                        {product.stock && (
                          <div className="flex items-center gap-1.5 mt-2 text-[#b7791f] text-[8px] font-bold tracking-[0.05em] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#b7791f]" />
                            {product.stock}
                          </div>
                        )}

                        {/* Color Swatches */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex gap-[5px] mt-2.5">
                            {product.colors.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full border border-[#c8c0b5]"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center items-center gap-[7px] mt-[65px]">
                <button type="button" className="w-[38px] h-[38px] border border-[#171717] bg-[#171717] text-white text-[10px] font-bold">
                  1
                </button>
                <button type="button" className="w-[38px] h-[38px] border border-[#ddd3c5] bg-transparent text-[10px] font-bold hover:border-[#171717]">
                  2
                </button>
                <button type="button" className="w-[38px] h-[38px] border border-[#ddd3c5] bg-transparent text-[10px] font-bold hover:border-[#171717]">
                  3
                </button>
                <button type="button" className="w-[38px] h-[38px] border border-[#ddd3c5] bg-transparent text-[10px] font-bold hover:border-[#171717]">
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
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <aside
            className="w-[min(350px,90%)] h-full p-6 bg-[#f7eedb] overflow-y-auto shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center pb-5 border-b border-[#ddd3c5]">
                <h2 className="m-0 text-[17px] font-extrabold uppercase">
                  FILTERS
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-[34px] h-[34px] border border-[#ddd3c5] bg-transparent text-[18px] grid place-items-center"
                >
                  ×
                </button>
              </div>

              {/* Category */}
              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-bold uppercase mb-3">Category</div>
                {FILTER_CATEGORIES.map((cat) => (
                  <label key={cat.slug} className="flex items-center gap-2.5 mb-2.5 text-[10px] text-[#6f6a63]">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat.slug) ? prev.filter((c) => c !== cat.slug) : [...prev, cat.slug]
                        );
                      }}
                      className="w-4 h-4"
                    />
                    {cat.label}
                  </label>
                ))}
              </div>

              {/* Size */}
              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-bold uppercase mb-3">Size</div>
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
                      className={`h-9 border text-[10px] font-bold uppercase ${
                        selectedSizes.includes(size)
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'border-[#ddd3c5] bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="py-5 border-b border-[#ddd3c5]">
                <div className="text-[10px] font-bold uppercase mb-3">Price</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="₹ MIN"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9 border border-[#ddd3c5] bg-white px-2 text-[10px]"
                  />
                  <input
                    type="number"
                    placeholder="₹ MAX"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9 border border-[#ddd3c5] bg-white px-2 text-[10px]"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="py-5 border-b-0">
                <div className="text-[10px] font-bold uppercase mb-3">Color</div>
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
                        className={`w-7 h-7 rounded-full border ${isSelected ? 'ring-2 ring-offset-2 ring-[#171717]' : ''}`}
                        style={{ backgroundColor: col.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ddd3c5] flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 h-11 border border-[#ddd3c5] bg-white text-[10px] font-bold uppercase"
              >
                RESET
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-11 bg-[#171717] text-white text-[10px] font-bold uppercase"
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
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsMobileSortOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#f7eedb] p-6 rounded-t-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-[#ddd3c5] mb-3">
              <h3 className="m-0 text-[14px] font-extrabold uppercase">SORT BY</h3>
              <button
                type="button"
                onClick={() => setIsMobileSortOpen(false)}
                className="text-[18px] font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-1">
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
                  className={`py-3 px-3 text-left text-[11px] font-bold uppercase rounded-md transition-colors ${
                    sortOption === opt ? 'bg-[#171717] text-white' : 'hover:bg-[#ede0cc]'
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
