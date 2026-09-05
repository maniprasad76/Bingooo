import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PenTool,
  Shirt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/catalog/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useCategories, useProducts } from '../hooks/useProducts';
import { CustomDesignSection } from '../components/home/CustomDesignSection';

export interface HeroSlideItem {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  targetUrl: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  badge?: string;
  eyebrow?: string;
  priority: number;
  isActive: boolean;
}

const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'ban-1',
    title: 'Wear What Feels Like You.',
    subtitle: 'Streetwear silhouettes. Heavyweight 240 GSM combed cotton. Engineered for personal expression.',
    ctaText: "Shop Men's Wear",
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner.png',
    mobileImageUrl: '/hero-banner.png',
    badge: 'DROP 01 • OVERSIZED FIT',
    eyebrow: "Bingooo Men’s Wear",
    priority: 1,
    isActive: true,
  },
  {
    id: 'ban-2',
    title: 'Everyday Luxury. Built to Last.',
    subtitle: 'Minimalist cuts crafted from premium combed cotton. Tailored for effortless confidence.',
    ctaText: 'Explore Drop 02',
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner-2.jpg',
    mobileImageUrl: '/hero-banner-2.jpg',
    badge: 'STUDIO DROP • DROP 02',
    eyebrow: 'Architectural Edit',
    priority: 2,
    isActive: true,
  },
  {
    id: 'ban-3',
    title: 'Tailored Statement Menswear.',
    subtitle: 'Signature back prints, relaxed drape, and confident proportions that redefine streetwear.',
    ctaText: 'Shop The Look',
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner-3.jpg',
    mobileImageUrl: '/hero-banner-3.jpg',
    badge: 'CAMPAIGN 2026 • SIGNATURE FIT',
    eyebrow: 'Signature Drop',
    priority: 3,
    isActive: true,
  },
  {
    id: 'ban-4',
    title: 'Natural Earth Tones & Minimalism.',
    subtitle: 'Warm cream streetwear essentials featuring precision high-density Bingooo chest embroidery.',
    ctaText: 'Discover Essentials',
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner-4.jpg',
    mobileImageUrl: '/hero-banner-4.jpg',
    badge: 'LIMITED EDITION • NATURAL PALETTE',
    eyebrow: 'Earth Collection',
    priority: 4,
    isActive: true,
  },
  {
    id: 'ban-5',
    title: 'Heavyweight Crimson Collection.',
    subtitle: 'Ultra-warm drop-shoulder hoodies with iconic distressed B artwork and brushed fleece lining.',
    ctaText: 'Create Your Design',
    targetUrl: '/customize',
    desktopImageUrl: '/hero-banner-5.jpg',
    mobileImageUrl: '/hero-banner-5.jpg',
    badge: 'CUSTOM STUDIO • HOODIES & TEES',
    eyebrow: 'Crimson Studio',
    priority: 5,
    isActive: true,
  },
];

const categoryStyles = [
  'from-[#171717] to-[#302A26] text-white',
  'from-[#EDE0CC] to-[#D8C7AF] text-[#171717]',
  'from-[#38434B] to-[#1F252B] text-white',
  'from-[#FDF0EE] to-[#EDE0CC] text-[#171717]',
];

// Spring physics for slide transitions
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 240, damping: 28, mass: 0.8 },
      opacity: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
      scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: 'spring', stiffness: 240, damping: 28, mass: 0.8 },
      opacity: { duration: 0.35, ease: [0.4, 0, 1, 1] },
      scale: { duration: 0.5 },
    },
  }),
};

const getImagePositionClass = (slide: HeroSlideItem, index: number) => {
  if (slide.id === 'ban-1' || index === 0 || slide.desktopImageUrl?.includes('hero-banner.png')) {
    // Model in image 1 is on the right side of the canvas (~82% horizontally).
    // Targeting 82% 18% centers the model perfectly in the middle of mobile screens!
    return 'object-[82%_18%] sm:object-[78%_center] lg:object-[80%_center]';
  }
  if (slide.id === 'ban-2' || index === 1 || slide.desktopImageUrl?.includes('hero-banner-2')) {
    return 'object-[52%_20%] sm:object-center';
  }
  if (slide.id === 'ban-3' || index === 2 || slide.desktopImageUrl?.includes('hero-banner-3')) {
    return 'object-[56%_16%] sm:object-center';
  }
  if (slide.id === 'ban-4' || index === 3 || slide.desktopImageUrl?.includes('hero-banner-4')) {
    return 'object-[52%_15%] sm:object-center';
  }
  if (slide.id === 'ban-5' || index === 4 || slide.desktopImageUrl?.includes('hero-banner-5')) {
    return 'object-[54%_20%] sm:object-center';
  }
  return 'object-[center_18%] sm:object-center';
};

export function HomePage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>(() => {
    try {
      const saved = localStorage.getItem('bingooo_hero_banners_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((s: HeroSlideItem) => s.isActive !== false);
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_HERO_SLIDES;
  });

  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  // Sync banners from backend API
  useEffect(() => {
    fetch('/api/v1/banners')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter((item: HeroSlideItem) => item.isActive !== false);
          if (activeOnly.length > 0) {
            setSlides(activeOnly);
            localStorage.setItem('bingooo_hero_banners_v3', JSON.stringify(activeOnly));
          }
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  const totalSlides = slides.length || 1;
  const currentSlide = ((page % totalSlides) + totalSlides) % totalSlides;
  const activeSlide = slides[currentSlide] || DEFAULT_HERO_SLIDES[0];

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  // Auto swipe left one by one every 4.5 seconds
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 4500);
    return () => clearInterval(interval);
  }, [paginate, isPaused, totalSlides]);

  const featuredQuery = useProducts({ limit: 4, sort: 'newest' });
  const categoriesQuery = useCategories();
  const featured = featuredQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="overflow-hidden bg-[#FAF8F5] text-[#171717]">
      {/* ── Ultra-Smooth Full-Screen Hero Section with Seamless Auto-Scroll ── */}
      <section
        className="relative w-full h-[85vh] sm:h-[90vh] lg:h-[calc(100vh-80px)] min-h-[580px] max-h-[920px] overflow-hidden border-b border-[#DDD3C5] bg-[#F0E7DF]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Hero Carousel Showcase"
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -8000 || offset.x < -60) {
                paginate(1);
              } else if (swipe > 8000 || offset.x > 60) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing select-none"
          >
            {/* Tailored Ken Burns Ambient Drift & Mobile Centering */}
            <motion.img
              src={activeSlide.desktopImageUrl}
              alt={activeSlide.title || 'Bingooo Hero'}
              className={`absolute inset-0 h-full w-full object-cover ${getImagePositionClass(activeSlide, currentSlide)}`}
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 6, ease: [0.25, 0.1, 0.25, 1] }}
              loading="eager"
              decoding="sync"
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Slide Indicator Dots (Visible on mobile and desktop) ── */}
        {totalSlides > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-2 pointer-events-auto">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > currentSlide ? 1 : -1])}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === currentSlide
                    ? 'w-6 h-2 bg-[#E6321C]'
                    : 'w-2 h-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── ONLY Custom Button Floating Cleanly Over Image ── */}
        <div className="absolute bottom-16 sm:bottom-10 left-0 right-0 z-20 mx-auto max-w-[1360px] px-4 sm:px-8 flex justify-center sm:justify-start pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="pointer-events-auto"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/customize"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#171717]/90 hover:bg-[#E6321C] text-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.14em] shadow-2xl backdrop-blur-md border border-white/25 transition-all duration-200 group"
              >
                <PenTool size={15} className="text-[#E6321C] group-hover:text-white transition-colors" />
                <span>Custom Design</span>
                <ArrowRight size={14} className="opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Category Section ── */}
      <section className="mx-auto max-w-[1360px] px-3.5 py-10 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow="Explore the edit"
          title="Shop your style"
          action={
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#B91F12]"
            >
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {categoriesQuery.isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-44 sm:h-60 rounded-xl sm:rounded-2xl" />
              ))
            : categories.slice(0, 4).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.09, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={`/category/${category.slug}`}
                    className={`group relative flex min-h-[160px] sm:min-h-60 h-full flex-col justify-end overflow-hidden rounded-xl sm:rounded-2xl border border-[#DDD3C5] bg-gradient-to-br p-4 sm:p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated ${
                      categoryStyles[index % categoryStyles.length]
                    }`}
                  >
                    <Shirt
                      className="absolute right-3 top-3 sm:right-5 sm:top-5 opacity-20 sm:opacity-25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 w-10 h-10 sm:w-16 sm:h-16"
                      strokeWidth={1.2}
                    />
                    <div className="relative flex h-full flex-col justify-end">
                      <p className="text-[9px] sm:text-xs font-bold uppercase tracking-[.15em] opacity-65">
                        Bingooo collection
                      </p>
                      <h2 className="mt-1 sm:mt-2 text-base sm:text-2xl font-extrabold uppercase line-clamp-1">
                        {category.name}
                      </h2>
                      <span className="mt-2 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                        Shop now <ArrowRight size={13} className="sm:w-[15px] sm:h-[15px]" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="border-y border-[#DDD3C5] bg-white">
        <div className="mx-auto max-w-[1360px] px-3.5 py-10 sm:px-8 sm:py-20">
          <SectionHeading
            eyebrow="The Bingooo edit"
            title="New arrivals"
            action={
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#B91F12]"
              >
                View catalog <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {featuredQuery.isLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="aspect-[4/5] rounded-xl sm:rounded-2xl" />
                ))
              : featured.map((product: any, index: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard
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
                  </motion.div>
                ))}
          </div>
          {!featuredQuery.isLoading && featured.length === 0 ? (
            <p className="mt-8 rounded-xl border border-[#DDD3C5] bg-[#FDF9F4] p-6 text-center text-sm text-[#6F6A63]">
              Products created in the admin catalog will appear here automatically.
            </p>
          ) : null}
        </div>
      </section>

      <CustomDesignSection />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4">
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[.15em] text-[#E6321C]">
          {eyebrow}
        </p>
        <h2 className="mt-1 sm:mt-2 text-2xl sm:text-4xl font-extrabold uppercase">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
