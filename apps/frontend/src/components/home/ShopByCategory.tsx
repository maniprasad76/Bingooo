import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ChevronLeft, Shirt } from 'lucide-react';
import { useCategories } from '../../hooks/useProducts';
import { resolveImageUrl } from '../../lib/utils';

export interface CategoryCardData {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

const DEFAULT_CATEGORIES: CategoryCardData[] = [
  {
    id: 'cat-tshirts',
    name: 'T-SHIRTS',
    slug: 't-shirts',
    imageUrl: '/hero-banner.png',
  },
  {
    id: 'cat-hoodies',
    name: 'HOODIES',
    slug: 'hoodies',
    imageUrl: '/custom/tshirt-step-2.png',
  },
  {
    id: 'cat-oversized',
    name: 'OVERSIZED T-SHIRTS',
    slug: 'oversized-t-shirts',
    imageUrl: '/hero-banner-3.jpg',
  },
  {
    id: 'cat-shirts',
    name: 'SHIRTS',
    slug: 'shirts',
    imageUrl: '/hero-banner-2.jpg',
  },
  {
    id: 'cat-jeans',
    name: 'JEANS',
    slug: 'jeans',
    imageUrl: '',
  },
  {
    id: 'cat-accessories',
    name: 'ACCESSORIES',
    slug: 'accessories',
    imageUrl: '',
  },
];

export function ShopByCategory() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoriesQuery = useCategories();
  const apiCategories = categoriesQuery.data || [];

  // Merge API categories with default mock list to guarantee the 6 items are present
  // while allowing custom names/images uploaded via admin panel
  const categories: CategoryCardData[] =
    categoriesQuery.isSuccess
      ? apiCategories.map((c: any) => ({
          id: c.id,
          name: c.name?.toUpperCase() || 'CATEGORY',
          slug: c.slug || 'shop',
          imageUrl: c.imageUrl || c.image_url || c.image_key || '',
        }))
      : DEFAULT_CATEGORIES;


  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-10 sm:py-14">
      {/* ── Heading with Red Center Bar ── */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.08em] text-[#171717]">
          Shop By Category
        </h2>
        <div className="w-12 h-1 bg-[#E6321C]/70 rounded-full mx-auto mt-2.5" />
      </div>

      {/* ── Carousel with Floating Arrows ── */}
      <div className="relative group/carousel">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DDD3C5] shadow-md flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 disabled:opacity-0"
          aria-label="Previous categories"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 sm:gap-8 lg:gap-10 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory justify-start lg:justify-between px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="flex flex-col items-center shrink-0 group text-center snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:ring-offset-2 focus-visible:rounded-2xl"
            >
              {/* Circular Avatar / Image Container */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-[#EDE0CC]/40 border-2 border-[#DDD3C5]/60 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#E6321C]/60 group-hover:shadow-md">
                {category.imageUrl ? (
                  <img
                    src={resolveImageUrl(category.imageUrl)}
                    alt={category.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback gracefully if image fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EDE0CC] to-[#DDD3C5]/60 text-[#6F6A63]">
                    <Shirt size={34} strokeWidth={1.4} className="text-[#171717]/40 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </div>

              {/* Category Name */}
              <h3 className="mt-3.5 sm:mt-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#171717] group-hover:text-[#E6321C] transition-colors">
                {category.name}
              </h3>

              {/* Explore Link */}
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#E6321C] group-hover:underline">
                Explore Now <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DDD3C5] shadow-md flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-card"
          aria-label="Next categories"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
