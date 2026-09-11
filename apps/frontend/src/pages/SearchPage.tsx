import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Truck, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/catalog/ProductCard';
import { triggerHaptic } from '../lib/native/capacitorBridge';

const TRENDING_TAGS = [
  'Oversized Tees',
  'Heavyweight Fleece',
  'Puff Print',
  'Custom Studio',
  'Drop 01',
  'French Terry',
  'Acid Wash',
  'Cargo Pants',
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Garments' },
  { id: 't-shirts', label: 'T-Shirts' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'cargos', label: 'Pants & Cargos' },
  { id: 'custom', label: 'Customizable' },
] as const;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sync state when URL param changes
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // Query products with search filter
  const { data, isLoading } = useProducts({
    search: searchQuery.trim(),
    limit: 40,
  });

  const products = data?.products || [];

  // Filter by category tab if selected
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    if (selectedCategory === 'custom') {
      return products.filter((p: any) => p.customization_enabled || p.customizationEnabled);
    }
    return products.filter((p: any) => {
      const slug = p.category?.slug?.toLowerCase() || '';
      const tags = (p.tags || []).map((t: string) => t.toLowerCase());
      return slug.includes(selectedCategory) || tags.some((t: string) => t.includes(selectedCategory));
    });
  }, [products, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setSearchParams(searchQuery.trim() ? { q: searchQuery.trim() } : {});
  };

  const handleTagClick = (tag: string) => {
    triggerHaptic('selection');
    setSearchQuery(tag);
    setSearchParams({ q: tag });
  };

  const clearSearch = () => {
    triggerHaptic('light');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen">
      <SEO
        title={searchQuery ? `Search: "${searchQuery}" — BINGOOO` : 'Search Archive — BINGOOO'}
        description="Search across Bingooo Men's Wear: heavyweight 240 GSM tees, oversized streetwear hoodies, custom blanks, and limited edition drops."
        canonical="https://bingooo.in/search"
      />

      {/* =======================================================
           HERO SECTION (Matching AboutPage Spacing & Layout)
      ======================================================= */}
      <section className="min-h-[500px] lg:min-h-[560px] grid grid-cols-1 lg:grid-cols-[50%_50%] bg-[#f7eedb] border-b border-[#ddd3c5]">
        <div className="flex flex-col justify-center py-[50px] px-6 sm:px-10 lg:py-[clamp(45px,6vw,90px)] lg:px-[clamp(25px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-3">
            BINGOOO / SEARCH ARCHIVE
          </div>

          <h1 className="my-2 mb-4 text-[clamp(46px,6.5vw,95px)] font-extrabold leading-[0.85] tracking-[-0.075em] uppercase">
            <span className="block">FIND YOUR</span>
            <span className="block text-[#e6321c]">FIT.</span>
          </h1>

          <p className="max-w-[440px] m-0 mb-[25px] text-[#6f6a63] text-[13px] leading-[1.8]">
            Search across our entire archive of heavyweight 240 GSM tees, structural fleece hoodies, relaxed trousers, and custom blanks.
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-[480px] w-full mb-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles, fabric, drops, or custom blanks…"
                className="w-full h-[52px] sm:h-[56px] pl-12 pr-12 bg-white border border-[#ddd3c5] text-[12px] sm:text-[13px] text-[#171717] placeholder:text-[#8c867e] focus:border-[#171717] outline-none rounded-[2px] transition-colors"
                autoFocus={!initialQuery}
              />
              <SearchIcon
                size={18}
                className="absolute left-4 text-[#171717] pointer-events-none stroke-[1.8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 text-[#6f6a63] hover:text-[#171717] transition-colors p-1"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Trending Searches Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#6f6a63] mr-1 font-mono">
              POPULAR:
            </span>
            {TRENDING_TAGS.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 border transition-colors cursor-pointer ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white/60 hover:bg-white text-[#171717] border-[#ddd3c5]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[320px] sm:h-[400px] lg:h-auto overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo search catalog"
            className="w-full h-full object-cover grayscale contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7eedb] via-transparent to-transparent lg:hidden" />
        </div>
      </section>

      {/* =======================================================
           STATEMENT (Matching AboutPage Dark Punchline)
      ======================================================= */}
      <section className="py-[clamp(60px,8vw,110px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-3">
          CATALOG EXPLORATION
        </div>

        <h2 className="max-w-[950px] mx-auto m-0 text-[clamp(36px,6vw,76px)] leading-[0.92] font-extrabold tracking-[-0.07em] uppercase text-white">
          SEARCH THE <span className="text-[#e6321c]">ARCHIVE.</span><br />
          FIND WHAT <span className="text-[#e6321c]">DEFINES</span> YOU.
        </h2>
      </section>

      {/* =======================================================
           NUMBERS / METRICS STRIP
      ======================================================= */}
      <section className="py-8 bg-[#f7eedb]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#ddd3c5]">
            <div className="p-[25px_20px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em]">
                {filteredProducts.length}
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                {searchQuery ? 'Matches Found' : 'Archive Pieces'}
              </div>
            </div>

            <div className="p-[25px_20px] border-b sm:border-b-0 md:border-r border-[#ddd3c5]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em]">
                240 GSM
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Super-Combed Cotton
              </div>
            </div>

            <div className="p-[25px_20px] border-r border-[#ddd3c5]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em]">
                3-5 DAYS
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Express Transit India
              </div>
            </div>

            <div className="p-[25px_20px]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em] text-[#e6321c]">
                FREE
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Shipping Above ₹999
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           SEARCH RESULTS SECTION
      ======================================================= */}
      <section className="py-[clamp(60px,8vw,110px)]" id="search-results">
        <div className="container-bingooo">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 pb-4 border-b border-[#ddd3c5]">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-1.5">
                {searchQuery ? `SEARCH: "${searchQuery}"` : 'CATALOG ARCHIVE'}
              </div>
              <h2 className="m-0 text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-0.06em] uppercase">
                {searchQuery
                  ? `FOUND ${filteredProducts.length} ${filteredProducts.length === 1 ? 'GARMENT' : 'GARMENTS'}`
                  : 'FEATURED PIECES'}
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedCategory(tab.id);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-white hover:bg-[#ede0cc] text-[#171717] border-[#ddd3c5]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Grid / Loading / Empty */}
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-mono uppercase text-[#6f6a63]">Searching archive…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 px-6 text-center bg-[#ede0cc]/60 border border-[#ddd3c5] rounded-[2px] max-w-[700px] mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white flex items-center justify-center text-[#171717] shadow-xs">
                <SearchIcon size={24} className="stroke-[1.8]" />
              </div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2">
                ZERO RESULTS
              </div>
              <h3 className="text-[clamp(24px,3.5vw,36px)] font-extrabold uppercase tracking-[-0.05em] text-[#171717] mb-3">
                NO PIECES MATCH "{searchQuery}"
              </h3>
              <p className="max-w-[420px] mx-auto text-xs text-[#6f6a63] leading-relaxed mb-6">
                Try searching for generic terms like "tee", "hoodie", "oversized", or design your own bespoke piece in our 3D Studio.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center justify-center h-11 px-6 bg-[#171717] text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#e6321c] transition-colors cursor-pointer"
                >
                  CLEAR SEARCH FILTER
                </button>
                <Link
                  to="/customize"
                  className="inline-flex items-center justify-center h-11 px-6 bg-white border border-[#ddd3c5] text-[#171717] text-[10px] font-extrabold uppercase tracking-wider hover:border-[#171717] transition-colors"
                >
                  CUSTOM DESIGN STUDIO →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod: any) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  title={prod.title}
                  slug={prod.slug}
                  basePrice={prod.base_price || prod.basePrice || 999}
                  compareAtPrice={prod.compare_at_price || prod.compareAtPrice}
                  customizationEnabled={prod.customization_enabled || prod.customizationEnabled}
                  category={prod.category}
                  variants={prod.variants}
                  images={prod.images}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =======================================================
           CUSTOM ATELIER SPLIT BANNER (Matching AboutPage)
      ======================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[520px] lg:min-h-[580px]">
        <div className="min-h-[360px] lg:min-h-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1500&q=90"
            alt="Bingooo custom atelier"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="flex flex-col justify-center p-[45px_24px] sm:p-[clamp(45px,7vw,100px)] bg-[#171717] text-white">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#e6321c] mb-3">
            BESPOKE CLOTHING
          </div>

          <h2 className="my-3 mb-5 text-[clamp(40px,5vw,70px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-white">
            CAN'T FIND IT?<br />
            BUILD IT.
          </h2>

          <p className="max-w-[410px] m-0 mb-[30px] text-[#aaa7a1] text-[12px] leading-[1.8]">
            Pick an oversized blank garment, upload your typography or artwork in high resolution, and inspect a realistic 3D preview before ordering.
          </p>

          <div>
            <Link
              to="/customize"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#e6321c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b91f12] hover:-translate-y-0.5 transition-all"
            >
              START 3D CUSTOMIZER →
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           TRUST STRIP (Matching AboutPage / FAQ)
      ======================================================= */}
      <section className="border-t border-b border-[#ddd3c5] py-7 bg-[#f7eedb]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Fast Shipping</div>
                <div className="text-[9px] text-[#6f6a63]">Free delivery above ₹999</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RotateCcw size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Easy Returns</div>
                <div className="text-[9px] text-[#6f6a63]">7-day doorstep exchange</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Quality Assured</div>
                <div className="text-[9px] text-[#6f6a63]">240 GSM combed cotton</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Custom Studio</div>
                <div className="text-[9px] text-[#6f6a63]">Printed on demand</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           FINAL CTA BANNER
      ======================================================= */}
      <section className="py-[85px] px-5 bg-[#e6321c] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-2">
          EXPLORE THE ARCHIVE
        </div>

        <h2 className="my-2 mb-[20px] text-[clamp(38px,6vw,76px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase text-white">
          DISCOVER ALL<br />
          COLLECTIONS.
        </h2>

        <p className="max-w-[420px] mx-auto mb-[28px] text-white/90 text-[12px] leading-[1.7]">
          Browse all seasonal drops, oversized graphic tees, and heavyweight winter essentials.
        </p>

        <Link
          to="/shop"
          onClick={() => triggerHaptic('medium')}
          className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[4px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors"
        >
          EXPLORE CATALOG →
        </Link>
      </section>
    </main>
  );
}

export default SearchPage;
