import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useWishlist } from '../../hooks/useWishlist';

export interface NewArrivalItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  badge?: string;
  imageUrl?: string;
  colors?: string[];
  moreColorsCount?: number;
}

const DEFAULT_NEW_ARRIVALS: NewArrivalItem[] = [
  {
    id: 'prod-1',
    title: 'Classic Oversized Tee',
    slug: 'classic-oversized-tee',
    price: 699,
    imageUrl: '/hero-banner.png',
    colors: ['#111111', '#E8DEC8', '#B0B0B0', '#FFFFFF'],
    moreColorsCount: 2,
  },
  {
    id: 'prod-2',
    title: 'Create Your Own Hoodie',
    slug: 'create-your-own-hoodie',
    price: 1299,
    imageUrl: '/custom/tshirt-step-2.png',
    colors: ['#2F3E34', '#E8DEC8', '#8C8C8C', '#DDD3C5'],
    moreColorsCount: 2,
  },
  {
    id: 'prod-3',
    title: 'Minimal B Tee',
    slug: 'minimal-b-tee',
    price: 699,
    imageUrl: '/hero-banner-5.jpg',
    colors: ['#B91F12', '#111111', '#FFFFFF'],
    moreColorsCount: 1,
  },
  {
    id: 'prod-4',
    title: 'Graphic Anime Hoodie',
    slug: 'graphic-anime-hoodie',
    price: 1299,
    badge: 'BEST SELLER',
    imageUrl: '/custom/tshirt-step-3-black.png',
    colors: ['#111111', '#FFFFFF', '#8C8C8C'],
    moreColorsCount: 2,
  },
  {
    id: 'prod-5',
    title: 'Textured Shirt',
    slug: 'textured-shirt',
    price: 699,
    imageUrl: '/hero-banner-2.jpg',
    colors: ['#E8DEC8', '#111111', '#FFFFFF'],
    moreColorsCount: 2,
  },
];

export function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const productsQuery = useProducts({ sort: 'newest', limit: 8 });
  const { wishlist, toggleWishlist } = useWishlist();

  // If backend returns products, map them; otherwise use defaults
  const apiProducts = productsQuery.data?.data;
  const items: NewArrivalItem[] =
    productsQuery.isSuccess && Array.isArray(apiProducts)
      ? apiProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.base_price || p.price || 699,
          badge: p.is_featured || p.is_bestseller ? 'BEST SELLER' : undefined,
          imageUrl:
            p.images?.[0]?.url ||
            p.images?.[0]?.object_key ||
            (typeof p.images?.[0] === 'string' ? p.images[0] : undefined),
          colors: p.variants?.map((v: any) => v.color_hex || v.colorHex || '#111').slice(0, 4) || ['#111'],
          moreColorsCount: Math.max(0, (p.variants?.length || 0) - 4),
        }))
      : DEFAULT_NEW_ARRIVALS;


  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isWishlisted = (id: string) => {
    return wishlist.some((item) => item.product_id === id);
  };

  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-10 sm:py-14">
      {/* ── Header Row: Title on Left, View All on Right ── */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-[0.08em] text-[#171717]">
          New Arrivals
        </h2>
        <Link
          to="/shop?sort=newest"
          className="text-xs sm:text-sm font-bold text-[#E6321C] hover:text-[#B91F12] tracking-wide transition-colors"
        >
          View All
        </Link>
      </div>

      {/* ── Carousel with Left & Right Floating Buttons ── */}
      <div className="relative group/carousel">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DDD3C5] shadow-md flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-card"
          aria-label="Previous products"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(60%-12px)] sm:auto-cols-[calc(33.33%-14px)] md:auto-cols-[calc(25%-14px)] lg:auto-cols-[calc(20%-16px)] gap-3.5 sm:gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => {
            const wishActive = isWishlisted(item.id);
            return (
              <div
                key={item.id}
                className="snap-start rounded-2xl bg-[#F7F2EB] p-2.5 sm:p-3.5 border border-[#DDD3C5]/50 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group/card"
              >
                {/* Product Image Area */}
                <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#EDE0CC]/40 flex items-center justify-center p-2 sm:p-3">
                  {/* Optional Best Seller Badge */}
                  {item.badge && (
                    <span className="absolute top-2 left-2 z-10 bg-[#B91F12] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(item.id, wishActive);
                    }}
                    className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#171717] shadow-sm backdrop-blur-sm transition-all"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={15}
                      className={wishActive ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]/70'}
                    />
                  </button>

                  {/* Image with fallback */}
                  <Link to={`/product/${item.slug}`} className="w-full h-full flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg group-hover/card:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#6F6A63]/50">
                        <Shirt size={40} strokeWidth={1.2} />
                      </div>
                    )}
                  </Link>
                </div>

                {/* Details */}
                <div className="mt-2.5 sm:mt-3 px-1">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171717] line-clamp-1 group-hover/card:text-[#E6321C] transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#171717]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>

                  {/* Color Swatches */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {item.colors?.map((col, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                    {item.moreColorsCount && item.moreColorsCount > 0 && (
                      <span className="text-[10px] font-medium text-[#6F6A63] ml-0.5">
                        +{item.moreColorsCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DDD3C5] shadow-md flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-card"
          aria-label="Next products"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
