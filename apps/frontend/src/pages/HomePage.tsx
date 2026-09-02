import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
  Shirt,
  PenTool,
  Eye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useToast } from '../components/ui/Toast';

// ── Product Interface (Data supplied from admin / API) ──
interface LandingProduct {
  id: string;
  slug: string;
  title: string;
  rating: number;
  reviewsCount: number;
  price: number;
  image?: string;
  colors: Array<{ name: string; hex: string }>;
}

const FEATURED_PRODUCTS: LandingProduct[] = [
  {
    id: 'prod-1',
    slug: 'oversized-graphic-tee',
    title: 'Oversized Graphic Tee',
    rating: 4.8,
    reviewsCount: 124,
    price: 799,
    colors: [
      { name: 'Black', hex: '#171717' },
      { name: 'Cream', hex: '#EDE0CC' },
    ],
  },
  {
    id: 'prod-2',
    slug: 'chaos-printed-tee',
    title: 'Chaos Printed Tee',
    rating: 4.7,
    reviewsCount: 96,
    price: 799,
    colors: [
      { name: 'Khaki', hex: '#B29A78' },
      { name: 'Olive', hex: '#354837' },
      { name: 'Black', hex: '#171717' },
    ],
  },
  {
    id: 'prod-3',
    slug: 'essential-hoodie',
    title: 'Essential Hoodie',
    rating: 4.9,
    reviewsCount: 156,
    price: 1199,
    colors: [
      { name: 'Charcoal', hex: '#222222' },
      { name: 'Black', hex: '#101010' },
    ],
  },
  {
    id: 'prod-4',
    slug: 'baggy-fit-jeans',
    title: 'Baggy Fit Jeans',
    rating: 4.6,
    reviewsCount: 87,
    price: 1299,
    colors: [
      { name: 'Denim Blue', hex: '#597692' },
      { name: 'Grey', hex: '#7B818A' },
      { name: 'Black', hex: '#171717' },
    ],
  },
];

const CATEGORIES = [
  {
    id: 't-shirts',
    name: 'T-SHIRTS',
    tagline: 'Everyday essentials & statement graphics',
    href: '/shop?category=t-shirts',
    bgClass: 'from-[#1C1A18] to-[#121110]',
  },
  {
    id: 'hoodies',
    name: 'HOODIES',
    tagline: 'Heavyweight comfort',
    href: '/shop?category=hoodies',
    bgClass: 'from-[#D9D1C5] to-[#C2B7A6]',
    lightText: false,
  },
  {
    id: 'jeans',
    name: 'JEANS',
    tagline: 'Modern fits for every mood',
    href: '/shop?category=jeans',
    bgClass: 'from-[#3A4856] to-[#252E38]',
  },
  {
    id: 'custom',
    name: 'CUSTOM',
    tagline: 'Make it yours. Your design, your story.',
    href: '/customize',
    bgClass: 'from-[#E8DFD0] to-[#D4C8B4]',
    lightText: false,
  },
];

const UGC_ITEMS = [
  { id: 1, tag: '@bingooo.sklm' },
  { id: 2, tag: '@bingooo.sklm' },
  { id: 3, tag: '@bingooo.sklm' },
  { id: 4, tag: '@bingooo.sklm' },
  { id: 5, tag: '@bingooo.sklm' },
  { id: 6, tag: '@bingooo.sklm' },
];

export function HomePage() {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({
    'prod-1': '#171717',
    'prod-2': '#B29A78',
    'prod-3': '#222222',
    'prod-4': '#597692',
  });

  const { openDrawer, setItemCount, itemCount } = useCartStore();
  const { toast } = useToast();

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = !prev[id];
      toast(next ? 'Added to wishlist' : 'Removed from wishlist', 'info');
      return { ...prev, [id]: next };
    });
  };

  const handleQuickAdd = (product: LandingProduct) => {
    setItemCount(itemCount + 1);
    toast({
      title: `${product.title} added to cart`,
      description: `Color: ${
        product.colors.find((c) => c.hex === selectedColors[product.id])?.name || 'Default'
      } • Size: L`,
      variant: 'success',
    });
    openDrawer();
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717]">
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative overflow-hidden bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[5.6rem] tracking-tight text-[#171717] uppercase leading-[0.92]">
                WEAR <br />
                YOUR WAY<span className="text-[#E6321C]">.</span>
              </h1>

              <p className="mt-5 text-[#6F6A63] text-2xl sm:text-3xl max-w-md font-script leading-relaxed">
                Modern menswear. Custom designs. <br className="hidden sm:inline" />
                Made for your style.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-[8px] bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs sm:text-sm tracking-[0.08em] uppercase transition-all duration-200 shadow-sm hover:-translate-y-0.5"
                >
                  SHOP COLLECTION
                </Link>
                <Link
                  to="/customize"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-[8px] border border-[#E6321C]/50 hover:border-[#E6321C] bg-transparent hover:bg-white/50 text-[#E6321C] font-sans font-bold text-xs sm:text-sm tracking-[0.08em] uppercase transition-all duration-200"
                >
                  CREATE YOUR DESIGN
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Slot (Ready for Admin Upload) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none aspect-[4/3] sm:aspect-[14/10] overflow-hidden rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] shadow-sm flex items-center justify-center">
                {/* Visual Artwork & Model Presentation Frame */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-tr from-[#E6D9C5] to-[#F7EEDB]">
                  <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#E6321C] mb-2">
                    BINGOOO MENS WEAR
                  </span>
                  <span className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171717] uppercase">
                    SS/26 EDITORIAL
                  </span>
                  <span className="mt-2 text-sm font-script text-[#6F6A63] max-w-xs">
                    Heavyweight Combed Cotton • Bespoke Graffiti Prints
                  </span>
                  <div className="mt-4 px-3 py-1 rounded-full bg-white/70 border border-[#DDD3C5] text-[10px] font-bold tracking-wider uppercase text-[#171717]">
                    Customizable in 2D Studio
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. SHOP YOUR STYLE (Category Cards) ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div className="relative">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
              SHOP YOUR STYLE
            </h2>
            <span className="absolute -bottom-1 left-0 w-12 h-[2.5px] bg-[#E6321C]" />
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group"
          >
            <span>VIEW ALL</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.href}
              className={`group relative overflow-hidden rounded-2xl border border-[#DDD3C5] bg-gradient-to-b ${cat.bgClass} p-6 sm:p-7 min-h-[220px] flex flex-col justify-end shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
              aria-label={cat.name}
            >
              {/* Product Silhouette Sketch Container */}
              <div className="absolute top-4 right-4 h-16 w-16 opacity-30 group-hover:opacity-50 transition-opacity">
                <Shirt size={60} className="text-white" />
              </div>

              {/* Text Overlay matching design */}
              <div className="relative z-10 text-white">
                <h3 className="font-heading font-bold text-xl sm:text-2xl uppercase tracking-wider">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-white/90 font-serif italic leading-snug line-clamp-2">
                  {cat.tagline}
                </p>
                <div className="mt-3 inline-flex items-center text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 3. CUSTOMIZATION PROCESS BANNER ("DON'T JUST WEAR IT. MAKE IT YOURS.") ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-4 sm:py-6">
        <div className="rounded-2xl border border-[#DDD3C5] bg-[#F7EEDB] p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy & CTA */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#171717] uppercase tracking-tight leading-tight">
                DON'T JUST WEAR IT. <br />
                <span className="text-[#E6321C]">MAKE IT YOURS.</span>
              </h2>

              <p className="mt-3 text-base sm:text-lg text-[#6F6A63] font-script leading-relaxed max-w-sm">
                From idea to your wardrobe. Design custom pieces that are 100% you.
              </p>

              <Link
                to="/customize"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <span>START CUSTOMIZING</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right 4-Step Horizontal Flow */}
            <div className="lg:col-span-7 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 pt-4 lg:pt-0">
              {/* Step 1: Choose */}
              <div className="flex-1 min-w-[110px] flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[#E6321C]">
                  <Shirt size={26} className="stroke-[1.6]" />
                </div>
                <h4 className="mt-2 font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  CHOOSE
                </h4>
                <p className="mt-0.5 text-xs text-[#6F6A63] font-cursive">Pick your product</p>
              </div>

              <div className="hidden sm:flex text-[#DDD3C5] shrink-0">
                <ArrowRight size={16} />
              </div>

              {/* Step 2: Customize */}
              <div className="flex-1 min-w-[110px] flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[#E6321C]">
                  <PenTool size={26} className="stroke-[1.6]" />
                </div>
                <h4 className="mt-2 font-heading font-bold text-sm uppercase tracking-wider text-[#E6321C]">
                  CUSTOMIZE
                </h4>
                <p className="mt-0.5 text-xs text-[#E6321C] font-cursive">
                  <span>Add your design,</span> text or artwork
                </p>
              </div>

              <div className="hidden sm:flex text-[#DDD3C5] shrink-0">
                <ArrowRight size={16} />
              </div>

              {/* Step 3: Preview */}
              <div className="flex-1 min-w-[110px] flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[#E6321C]">
                  <Eye size={26} className="stroke-[1.6]" />
                </div>
                <h4 className="mt-2 font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  PREVIEW
                </h4>
                <p className="mt-0.5 text-xs text-[#6F6A63] font-cursive">See it come to life</p>
              </div>

              <div className="hidden sm:flex text-[#DDD3C5] shrink-0">
                <ArrowRight size={16} />
              </div>

              {/* Step 4: Order */}
              <div className="flex-1 min-w-[110px] flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[#E6321C]">
                  <ShoppingBag size={26} className="stroke-[1.6]" />
                </div>
                <h4 className="mt-2 font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  ORDER
                </h4>
                <p className="mt-0.5 text-xs text-[#6F6A63] font-cursive">Delivered to your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. THE BINGOOO EDIT (Featured Products Grid) ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div className="relative">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
              THE BINGOOO EDIT
            </h2>
            <span className="absolute -bottom-1 left-0 w-12 h-[2.5px] bg-[#E6321C]" />
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Products Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_PRODUCTS.map((prod) => {
            const isFav = !!wishlist[prod.id];
            const activeColor = selectedColors[prod.id] || prod.colors[0].hex;

            return (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image Slot (Ready for Admin Images) & Wishlist Button */}
                <div className="relative aspect-[4/3] sm:aspect-[14/10] overflow-hidden rounded-lg bg-[#F7EEDB]/60 flex items-center justify-center">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-300"
                  >
                    <Shirt size={40} className="text-[#171717]/40 mb-1" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#6F6A63]">
                      {prod.title}
                    </span>
                  </Link>

                  {/* NEW Badge on Top Left */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#E6321C] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                      NEW
                    </span>
                  </div>

                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={(e) => toggleWishlist(e, prod.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#171717] transition-colors shadow-xs"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      size={16}
                      className={isFav ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]'}
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className="mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${prod.slug}`}>
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                        {prod.title}
                      </h3>
                    </Link>

                    <div className="mt-1 flex items-center justify-between">
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6F6A63]">
                        <Star size={12} className="fill-[#E6321C] text-[#E6321C]" />
                        <span className="text-[#171717] font-bold">{prod.rating}</span>
                        <span>({prod.reviewsCount})</span>
                      </div>

                      {/* Price */}
                      <span className="font-sans font-bold text-xs sm:text-sm text-[#171717]">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Swatches & Quick Add Button */}
                  <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-between gap-2">
                    {/* Color Dots */}
                    <div className="flex items-center gap-1.5">
                      {prod.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() =>
                            setSelectedColors((prev) => ({ ...prev, [prod.id]: c.hex }))
                          }
                          className={`h-4 w-4 rounded-full border transition-all ${
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

                    {/* Quick Add Button */}
                    <button
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
      </section>

      {/* ─── 5. BRAND VALUE PROPOSITION ("STYLE ISN'T ONE-SIZE-FITS-ALL.") ─── */}
      <section className="w-full bg-[#EDE0CC] border-y border-[#DDD3C5] py-10 sm:py-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Model Photo & Statement */}
            <div className="lg:col-span-5 flex items-center gap-5">
              <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[#DDD3C5] shadow-sm flex items-center justify-center">
                <Shirt size={32} className="text-[#171717]/50" />
              </div>

              <div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight text-[#171717] leading-tight">
                  STYLE ISN'T <br className="hidden sm:inline" />
                  ONE-SIZE-FITS-ALL.
                </h3>
                <p className="mt-1 text-xs text-[#6F6A63] font-serif italic leading-relaxed">
                  Bingooo brings together modern menswear and custom expression, giving you the
                  freedom to wear something that actually feels like you.
                </p>
              </div>
            </div>

            {/* Right 4 Pillars */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 lg:pt-0">
              <div className="flex flex-col items-start">
                <Shirt size={22} className="text-[#E6321C] stroke-[1.6]" />
                <h4 className="mt-2 font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                  BUILT FOR MEN
                </h4>
                <p className="mt-1 text-[11px] text-[#6F6A63] leading-tight font-sans">
                  Fits and styles designed around modern men's wardrobes.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <ShieldCheck size={22} className="text-[#E6321C] stroke-[1.6]" />
                <h4 className="mt-2 font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                  QUALITY FIRST
                </h4>
                <p className="mt-1 text-[11px] text-[#6F6A63] leading-tight font-sans">
                  Premium fabrics, comfortable and made to last.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <PenTool size={22} className="text-[#E6321C] stroke-[1.6]" />
                <h4 className="mt-2 font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                  CUSTOM YOUR WAY
                </h4>
                <p className="mt-1 text-[11px] text-[#6F6A63] leading-tight font-sans">
                  Turn your ideas into wearable designs in just a few clicks.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <Sparkles size={22} className="text-[#E6321C] stroke-[1.6]" />
                <h4 className="mt-2 font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
                  MADE TO STAND OUT
                </h4>
                <p className="mt-1 text-[11px] text-[#6F6A63] leading-tight font-sans">
                  Original graphics and contemporary styles that set you apart.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. #BINGOOO COMMUNITY UGC LOOKBOOK ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between pb-6">
          <div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
              #BINGOOO
            </h2>
            <p className="mt-0.5 text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#6F6A63]">
              SHOW US HOW YOU WEAR YOURS
            </p>
          </div>

          <a
            href="https://instagram.com/bingooo.sklm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group font-sans"
          >
            <span>FOLLOW @BINGOOO.SKLM</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 6 Images Grid (Admin-Ready Slots) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {UGC_ITEMS.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-lg bg-[#EDE0CC] border border-[#DDD3C5] shadow-xs flex items-center justify-center p-2 text-center"
            >
              <span className="text-[10px] font-mono font-bold text-[#6F6A63] group-hover:text-[#E6321C] transition-colors">
                {item.tag}
              </span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
