import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  Ruler,
  RotateCcw,
  ShieldCheck,
  Truck,
  ArrowRight,
  Shirt,
  Sparkles,
  X,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';
import { SEO } from '../components/common/SEO';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { generateProductSchema } from '../lib/seo/schema';
import { EmptyState } from '../components/common/EmptyState';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';
import { ResponseTimePromise } from '../components/common/ResponseTimePromise';
import { RealReviews } from '../components/catalog/RealReviews';

const RELATED_PRODUCTS = [
  {
    id: 'rel-1',
    slug: 'chaos-printed-tee',
    title: 'Chaos Printed Tee',
    price: 799,
    rating: 4.7,
    reviewsCount: 98,
    image: '',
  },
  {
    id: 'rel-2',
    slug: 'essential-hoodie',
    title: 'Essential Hoodie',
    price: 1199,
    rating: 4.9,
    reviewsCount: 156,
    image: '',
  },
  {
    id: 'rel-3',
    slug: 'baggy-fit-jeans',
    title: 'Baggy Fit Jeans',
    price: 1299,
    rating: 4.6,
    reviewsCount: 87,
    image: '',
  },
  {
    id: 'rel-4',
    slug: 'custom-design-tee',
    title: 'Custom Design Tee',
    price: 699,
    rating: 4.8,
    reviewsCount: 64,
    image: '',
  },
];

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem, isAdding } = useCart();
  const { toggleWishlist } = useWishlist();
  const { data: wishlistData } = useIsInWishlist(product?.id);
  const { toast } = useToast();

  const inWishlist = !!wishlistData?.inWishlist;
  const { addProduct, getRecentExcluding } = useRecentlyViewed();

  // Track product view in persistent history
  useEffect(() => {
    if (product && (product.id || product.slug)) {
      addProduct(product);
    }
  }, [product, addProduct]);

  const recentGarments = useMemo(() => {
    return getRecentExcluding(slug || product?.id, 4);
  }, [getRecentExcluding, slug, product?.id]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'wash_care' | 'shipping' | 'reviews'>('description');

  const queryClient = useQueryClient();
  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => api.get<any>(`/reviews/product/${product?.id}`),
    enabled: !!product?.id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related-products'],
    queryFn: () => api.get<any>('/products', { limit: 4 }),
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  const submitReviewMutation = useMutation({
    mutationFn: (data: any) => api.post('/reviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      toast({ title: 'Review Submitted!', description: 'Thank you for your rating.', variant: 'success' });
      setIsReviewModalOpen(false);
      setReviewForm({ rating: 5, title: '', body: '' });
    },
    onError: (err: any) => {
      toast({ title: 'Submission failed', description: err.message, variant: 'danger' });
    },
  });

  const variants = product?.variants || [];

  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    variants.forEach((v: any) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, { name: v.color, hex: v.colorHex || '#171717' });
      }
    });
    if (map.size === 0) {
      map.set('Black', { name: 'Black', hex: '#171717' });
      map.set('Cream', { name: 'Cream', hex: '#F7EEDB' });
      map.set('Dark Green', { name: 'Dark Green', hex: '#2A402D' });
      map.set('Navy', { name: 'Navy', hex: '#252E38' });
      map.set('Grey', { name: 'Grey', hex: '#7B818A' });
    }
    return Array.from(map.values());
  }, [variants]);

  const activeColor = selectedColor || availableColors[0]?.name;

  // Extract images uploaded through admin panel or fallbacks
  const productImages = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.map((img: any) =>
        typeof img === 'string' ? img : img.url || img.object_key
      );
    }
    return ['/hero-banner.png'];
  }, [product]);

  const currentPrice = product?.base_price ?? product?.basePrice ?? 699;

  const handleAddToCart = () => {
    const variant =
      variants.find(
        (v: any) =>
          (!v.color || v.color.toLowerCase() === activeColor.toLowerCase()) &&
          (!v.size || v.size.toUpperCase() === selectedSize.toUpperCase())
      ) || variants[0];

    if (!variant?.id) {
      toast({
        title: 'Please select a valid variant',
        description: 'No inventory item found for this color and size.',
        variant: 'danger',
      });
      return;
    }

    addItem(variant.id, 1);
    toast({
      title: `${product?.title || 'Garment'} added to cart`,
      description: `Color: ${activeColor} • Size: ${selectedSize}`,
      variant: 'success',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} | Bingooo Men's Wear`,
      text: `Check out ${title} at Bingooo:`,
      url: window.location.href,
    };
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Product link copied!',
        description: 'Product link copied to clipboard.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Share product',
        description: window.location.href,
      });
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] py-16 px-4">
        <SEO title="Garment Not Found" noindex={true} />
        <EmptyState
          icon="shirt"
          title="GARMENT NOT FOUND IN ATELIER"
          subtitle="DISCONTINUED OR MOVED"
          description="This specific garment is currently not available in our Srikakulam inventory. Discover our active 240 GSM drops or craft your own in the design studio."
          actionText="EXPLORE ALL GARMENTS"
          actionTo="/shop"
          secondaryActionText="CUSTOM DESIGN STUDIO"
          secondaryActionTo="/customize"
          showSuggestions={true}
        />
      </div>
    );
  }

  const isUnpublished = Boolean((product as any)?.status && (product as any).status !== 'active');
  const title = product?.title || 'Oversized Graphic Tee';
  const categoryName = product?.category?.name || 'T-Shirts';
  const categorySlug = product?.category?.slug || 't-shirts';
  const seoTitle = `${title} — ${categoryName}`;
  const productSchema = generateProductSchema(product as any);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <SEO
        title={isUnpublished ? `[Draft] ${seoTitle}` : seoTitle}
        description={product?.description ? product.description.slice(0, 160) : `Buy ${title} online at Bingooo. Premium heavyweight 240 GSM combed cotton menswear tailored for effortless streetwear expression.`}
        ogImage={productImages[0] || '/og-image.png'}
        ogType="product"
        canonical={`https://bingooo.in/product/${product.slug}`}
        noindex={isUnpublished}
        schema={isUnpublished ? undefined : productSchema}
      />
      {isUnpublished && (
        <aside aria-label="Unpublished preview notice" className="w-full bg-[#FFF3CD] border-b border-[#FFEEBA] text-[#856404] px-4 py-2 text-xs font-mono text-center">
          ⚠️ <strong>UNPUBLISHED DRAFT PREVIEW</strong> — This garment is currently in draft status and hidden from public search, sitemaps, and shopping feeds.
        </aside>
      )}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-6 pb-28 md:pb-12">
        {/* ─── Breadcrumbs with Schema ─── */}
        <Breadcrumbs
          items={[
            { name: 'Shop', url: '/shop' },
            { name: categoryName, url: `/category/${categorySlug}` },
            { name: title, url: `/product/${product.slug}` },
          ]}
          className="mb-6"
        />

        {/* ─── Main Product Details Grid (Exact Image 1) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Gallery with Vertical Thumbnails (7 cols) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 max-w-full">
            {/* 4 Thumbnails on the left */}
            <div className="flex sm:flex-col gap-2.5 sm:gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible shrink-0 no-scrollbar w-full sm:w-auto max-w-full py-1">
              {[0, 1, 2, 3].map((idx) => {
                const img = productImages[idx];
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1} of ${title}`}
                    className={`relative h-16 w-16 sm:h-24 sm:w-20 rounded-xl overflow-hidden border-2 transition-all bg-[#EDE0CC] flex items-center justify-center shrink-0 ${
                      isActive ? 'border-[#E6321C] shadow-sm' : 'border-[#DDD3C5] hover:border-[#171717]/40'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt size={22} className="text-[#171717]/40" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Image Stage */}
            <div className="relative aspect-[4/5] flex-1 rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] overflow-hidden flex items-center justify-center order-1 sm:order-2 shadow-sm">
              <AnimatePresence mode="wait">
                {productImages[activeImageIndex] ? (
                  <motion.img
                    key={activeImageIndex}
                    src={productImages[activeImageIndex]}
                    alt={title}
                    initial={{ opacity: 0, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-8 text-center select-none bg-gradient-to-tr from-[#E6D9C5] to-[#F7EEDB] w-full h-full"
                  >
                    <Shirt size={80} className="text-[#171717]/40 mb-3" />
                    <span className="font-heading text-2xl font-extrabold uppercase text-[#171717]">
                      {title}
                    </span>
                    <span className="mt-1 text-xs font-sans text-[#6F6A63]">
                      240 GSM Heavyweight • Srikakulam Atelier
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* Prev / Next Circular Arrows */}
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? 3 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev === 3 ? 0 : prev + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>

              {/* Zoom Expand Button in Bottom Right */}
              <button
                type="button"
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-xs flex items-center justify-center transition-colors"
                aria-label="Zoom image"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Right: Product Purchase Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between text-left space-y-5">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#E6321C] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                  NEW
                </span>
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#171717] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                  ESSENTIAL
                </span>
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#FAF0EE] text-[#B91F12] border border-[#F5C7C1] text-[10px] font-sans font-bold uppercase tracking-wider">
                  LIMITED ATELIER DROP
                </span>
              </div>

              {/* Product Title */}
              <h1 className="mt-2 font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] tracking-tight uppercase leading-tight">
                {title}
              </h1>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#6F6A63]">
                <Star size={14} className="fill-[#E6321C] text-[#E6321C]" />
                <span className="text-[#171717] font-bold">4.8</span>
                <span>(124 reviews)</span>
              </div>

              {/* Price & Taxes */}
              <div className="mt-3">
                <span className="font-heading font-black text-2xl sm:text-3xl text-[#171717]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                <p className="text-xs text-[#6F6A63] font-sans mt-0.5">
                  Inclusive of all taxes
                </p>
                {/* Compact Stock & Urgency Indicator */}
                <div className="mt-3.5 p-3 rounded-xl bg-[#F7EEDB]/40 border border-[#DDD3C5]/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E6321C] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E6321C]"></span>
                      </span>
                      <span className="font-sans font-bold text-[#171717] text-xs">
                        Only 3 pieces left in batch
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#E6321C] flex items-center gap-1">
                      <Flame size={12} className="fill-[#E6321C]" />
                      <span>Selling Fast</span>
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-[#DDD3C5]/50 h-1 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-[#E6321C] h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* Short Excerpt */}
              <p className="mt-4 text-xs sm:text-sm text-[#6F6A63] font-sans leading-relaxed">
                {product?.description ||
                  'Premium 240 GSM cotton fabric with a bold graphic print. Oversized fit for everyday comfort and style.'}
              </p>

              {/* Color Selector */}
              <div className="mt-6 pt-5 border-t border-[#DDD3C5]/60">
                <div className="flex items-center justify-between text-xs font-sans font-bold text-[#171717] mb-2.5">
                  <span>COLOR: <span className="font-normal text-[#6F6A63]">{activeColor}</span></span>
                </div>
                <div className="flex items-center gap-2.5">
                  {availableColors.map((color) => {
                    const isSelected = activeColor === color.name;
                    return (
                      <motion.button
                        key={color.name}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color.name)}
                        className={`h-6 w-6 rounded-full border transition-all ${
                          isSelected
                            ? 'border-[#E6321C] scale-110 ring-2 ring-[#E6321C]'
                            : 'border-black/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={color.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-5 pt-4 border-t border-[#DDD3C5]/60">
                <div className="flex items-center justify-between text-xs font-sans font-bold text-[#171717] mb-2.5">
                  <span>SIZE:</span>
                  <Link
                    to="/size-guide"
                    className="inline-flex items-center gap-1 text-[11px] text-[#171717] hover:text-[#E6321C] font-semibold transition-colors"
                  >
                    <Ruler size={13} />
                    <span>Size Guide</span>
                  </Link>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <motion.button
                        key={sz}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(sz)}
                        className={`h-11 rounded-lg font-sans text-xs font-bold transition-all border flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'border-[#E6321C] text-[#E6321C] bg-white shadow-xs'
                            : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        <span>{sz}</span>
                        {isSelected && (
                          <motion.span
                            layoutId="activeSizeIndicator"
                            className="w-4 h-[2px] bg-[#E6321C] rounded-full mt-0.5"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Feature Trust Badges Row (Semantic Internal Links) */}
              <div className="mt-6 pt-5 border-t border-[#DDD3C5]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-center">
                <Link to="/fabric-guide" className="flex flex-col items-center group hover:text-[#E6321C] transition-colors">
                  <Shirt size={18} className="text-[#171717]/80 group-hover:text-[#E6321C] mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717] group-hover:text-[#E6321C]">
                    PREMIUM FABRIC
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">240 GSM Cotton &rarr;</span>
                </Link>
                <Link to="/returns-refunds" className="flex flex-col items-center group hover:text-[#E6321C] transition-colors">
                  <RotateCcw size={18} className="text-[#171717]/80 group-hover:text-[#E6321C] mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717] group-hover:text-[#E6321C]">
                    EASY RETURNS
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">7 Days Return &rarr;</span>
                </Link>
                <Link to="/policies" className="flex flex-col items-center group hover:text-[#E6321C] transition-colors">
                  <ShieldCheck size={18} className="text-[#171717]/80 group-hover:text-[#E6321C] mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717] group-hover:text-[#E6321C]">
                    SECURE PAYMENT
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">100% Protected &rarr;</span>
                </Link>
                <Link to="/shipping-policy" className="flex flex-col items-center group hover:text-[#E6321C] transition-colors">
                  <Truck size={18} className="text-[#171717]/80 group-hover:text-[#E6321C] mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717] group-hover:text-[#E6321C]">
                    FAST DELIVERY
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">3-7 Days Delivery &rarr;</span>
                </Link>
              </div>

              {/* CTAs: ADD TO CART & BUY NOW */}
              <div className="mt-6 space-y-3">
                {product?.customization_enabled && (
                  <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to={`/customize/${product.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg border-2 border-[#171717] bg-[#171717] hover:bg-[#E6321C] hover:border-[#E6321C] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm"
                    >
                      <Sparkles size={16} />
                      <span>CUSTOMIZE IN ATELIER STUDIO</span>
                    </Link>
                  </motion.div>
                )}

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
                >
                  <ShoppingBag size={16} />
                  <span>ADD TO CART</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-lg border border-[#E6321C] bg-white hover:bg-[#FDF0EE] text-[#E6321C] font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs"
                >
                  BUY NOW
                </motion.button>
              </div>

              {/* Atelier Response Time Promise */}
              <div className="mt-4">
                <ResponseTimePromise variant="compact" />
              </div>

              {/* Bottom Wishlist, Share & WhatsApp row */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-y-2 text-xs font-sans text-[#6F6A63] pt-2 border-t border-[#DDD3C5]/40">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleWishlist(product?.id || 'temp', inWishlist)}
                  className="inline-flex items-center gap-1.5 hover:text-[#E6321C] transition-colors focus-visible:outline-none"
                >
                  <Heart size={14} className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : ''} />
                  <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 hover:text-[#E6321C] transition-colors focus-visible:outline-none"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>

                <a
                  href={getWhatsAppUrl(`Hi Bingooo, I would like to inquire about "${title}" (${window.location.href}). Is size ${selectedSize} in stock?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#171717] hover:text-[#25D366] transition-colors focus-visible:outline-none"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* ─── Product Tabs Section (Exact Image 1) ─── */}
        <div className="mt-14 pt-8 border-t border-[#DDD3C5]">
          {/* Tab Navigation */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-[#DDD3C5] overflow-x-auto no-scrollbar max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'description', label: 'DESCRIPTION' },
              { id: 'details', label: 'DETAILS' },
              { id: 'wash_care', label: 'WASH CARE' },
              { id: 'shipping', label: 'SHIPPING & RETURNS' },
              { id: 'reviews', label: `REVIEWS (${reviewsData?.total || 0})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs font-heading font-bold uppercase tracking-wider transition-colors relative shrink-0 ${
                    isActive ? 'text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E6321C]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Box */}
          {activeTab === 'reviews' ? (
            <div className="pt-6 text-left">
              <RealReviews
                productTitle={title}
                title={`Verified Reviews for ${title}`}
                subtitle="REAL FIT & FABRIC FEEDBACK FROM VERIFIED BUYERS"
              />
            </div>
          ) : activeTab === 'details' ? (
            <div className="pt-6 text-left space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#DDD3C5] bg-white">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wider block">Fabric Density</span>
                  <span className="font-heading font-bold text-sm text-[#171717] mt-0.5 block">240–280 GSM French Terry / Combed Cotton</span>
                </div>
                <div className="p-4 rounded-xl border border-[#DDD3C5] bg-white">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wider block">Collar & Ribbing</span>
                  <span className="font-heading font-bold text-sm text-[#171717] mt-0.5 block">1.25" Heavy-Duty Lycra Ribbed Neckline</span>
                </div>
                <div className="p-4 rounded-xl border border-[#DDD3C5] bg-white">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wider block">Pre-Shrunk Treatment</span>
                  <span className="font-heading font-bold text-sm text-[#171717] mt-0.5 block">Bio-Enzyme Washed & Silicon Softened</span>
                </div>
                <div className="p-4 rounded-xl border border-[#DDD3C5] bg-white">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wider block">Stitching</span>
                  <span className="font-heading font-bold text-sm text-[#171717] mt-0.5 block">Double-Needle Reinforced Hem & Shoulder</span>
                </div>
                <div className="p-4 rounded-xl border border-[#DDD3C5] bg-white">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wider block">Cut & Silhouette</span>
                  <span className="font-heading font-bold text-sm text-[#171717] mt-0.5 block">Dropped Shoulder Boxy Streetwear Silhouette</span>
                </div>
                <div className="p-4 rounded-xl border border-[#DDD3C5] bg-white">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wider block">Atelier Origin</span>
                  <span className="font-heading font-bold text-sm text-[#171717] mt-0.5 block">Made in Srikakulam, Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'wash_care' ? (
            <div className="pt-6 text-left space-y-4">
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 space-y-3">
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  Garment Wash & Longevity Guidelines
                </h4>
                <ul className="space-y-2 text-xs text-[#6F6A63] font-sans leading-relaxed">
                  <li>• <strong>Machine Wash Cold:</strong> Turn garment inside-out before washing in cold water (max 30°C) on a gentle cycle.</li>
                  <li>• <strong>No Direct Ironing:</strong> Never place a hot iron directly onto the DTF pigment or puff print. Iron inside-out at low temperatures.</li>
                  <li>• <strong>Line Dry in Shade:</strong> Avoid direct scorching sun exposure or tumble dryers to preserve the fabric softness and print elasticity.</li>
                  <li>• <strong>Mild Detergent:</strong> Avoid harsh bleaching agents or fabric softeners containing chlorine.</li>
                </ul>
              </div>
            </div>
          ) : activeTab === 'shipping' ? (
            <div className="pt-6 text-left space-y-4">
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 space-y-3">
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  Dispatch, Delivery & Doorstep Exchanges
                </h4>
                <ul className="space-y-2 text-xs text-[#6F6A63] font-sans leading-relaxed">
                  <li>• <strong>Atelier Dispatch:</strong> Standard catalog garments dispatch within 24–48 hours directly from our Srikakulam facility.</li>
                  <li>• <strong>Express Transit:</strong> Delivery takes 3–5 business days across metros and tier-1/2 Indian cities via Bluedart and Delhivery.</li>
                  <li>• <strong>Free Shipping:</strong> All orders above ₹999 qualify for 100% free delivery across India.</li>
                  <li>• <strong>7-Day Doorstep Exchange:</strong> If the size isn't right, initiate an exchange from your account for a hassle-free doorstep pickup.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Description & Bullet Points */}
              <div className="lg:col-span-7 text-left space-y-4">
                <p className="text-xs sm:text-sm text-[#6F6A63] font-sans leading-relaxed">
                  {product?.description ||
                    'Make a statement with our oversized graphic tee. Crafted from premium 240 GSM cotton, it offers a relaxed fit with a bold print that stands out. Perfect for everyday wear, street style, and layering.'}
                </p>

                <ul className="space-y-1.5 text-xs text-[#171717] font-sans font-medium">
                  <li>• 100% Combed Compact Cotton</li>
                  <li>• Heavyweight 240 GSM Fabric</li>
                  <li>• Relaxed Oversized Fit</li>
                  <li>• High Density DTG Print</li>
                  <li>• Unisex Streetwear Silhouette</li>
                </ul>
              </div>

              {/* Right Column: Garment Detail Frame */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#171717] border border-[#DDD3C5] shadow-xs flex flex-col items-center justify-center p-6 text-center select-none">
                  <span className="text-[10px] font-mono text-[#E6321C] uppercase tracking-[0.2em]">
                    BINGOOO ATELIER SPEC
                  </span>
                  <span className="font-heading font-bold text-xl uppercase tracking-wider text-white/95 mt-1">
                    240 GSM HEAVYWEIGHT
                  </span>
                  <span className="text-xs text-white/60 font-sans mt-1">
                    Bio-Washed • Silicon Softened • Zero Pilling
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* ─── Review Modal ─── */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-heading font-bold text-base text-[#171717]">Write a Product Review</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-[#6F6A63] hover:text-[#171717]"><X size={18} /></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitReviewMutation.mutate({
                    productId: product?.id,
                    rating: reviewForm.rating,
                    title: reviewForm.title,
                    body: reviewForm.body,
                  });
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-2xl text-amber-500 hover:scale-110 transition-transform"
                      >
                        {star <= reviewForm.rating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exceptional fabric weight & fit"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Your Feedback</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the fabric quality, sizing, drape, and overall feel..."
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans"
                  />
                </div>
                {submitReviewMutation.isError && (
                  <div className="p-2.5 rounded-xl bg-[#FDF0EE] text-[#B91F12] border border-[#E6321C]/30 text-xs font-sans flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-[#E6321C]" />
                    <span>{(submitReviewMutation.error as any)?.message || 'Failed to submit review. Please ensure you are logged in.'}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 rounded-xl border border-[#DDD3C5] text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={submitReviewMutation.isPending} className="px-4 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase">
                    {submitReviewMutation.isPending ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── "YOU MAY ALSO LIKE" Section (Exact Image 1) ─── */}
        <div className="mt-16 pt-10 border-t border-[#DDD3C5]">
          <div className="flex items-center justify-between pb-6">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#171717] uppercase tracking-wider">
              YOU MAY ALSO LIKE
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {(relatedData?.data?.length ? relatedData.data : RELATED_PRODUCTS).map((prod: any) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-2.5 sm:p-3.5 shadow-sm hover:shadow-md transition-all text-left"
              >
                {/* Image slot */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg bg-[#F7EEDB]/60 flex items-center justify-center">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 text-center group-hover:scale-105 transition-transform duration-300"
                  >
                    <Shirt size={36} className="text-[#171717]/40 mb-1 sm:w-11 sm:h-11" />
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#6F6A63] line-clamp-1">
                      {prod.title}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#171717] transition-colors shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart size={13} className="sm:w-[15px] sm:h-[15px]" />
                  </button>
                </div>

                {/* Info */}
                <div className="mt-2.5 sm:mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${prod.slug}`}>
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                        {prod.title}
                      </h3>
                    </Link>

                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold text-[#6F6A63]">
                        <Star size={11} className="fill-[#E6321C] text-[#E6321C]" />
                        <span className="text-[#171717] font-bold">{prod.rating}</span>
                        <span>({prod.reviewsCount})</span>
                      </div>
                      <span className="font-sans font-extrabold text-xs sm:text-base text-[#171717]">
                        ₹{prod.price}
                      </span>
                    </div>
                  </div>

                  {/* Outline Add to Cart Button */}
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#DDD3C5]/60">
                    <button
                      type="button"
                      onClick={() => {
                        addItem(prod.id, 1);
                        toast({ title: `${prod.title} added to cart`, variant: 'success' });
                      }}
                      className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-md border border-[#E6321C]/50 hover:border-[#E6321C] bg-white hover:bg-[#E6321C] text-[#E6321C] hover:text-white text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider transition-colors"
                    >
                      <ShoppingBag size={11} />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Recently Viewed Section ─── */}
        {recentGarments.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#DDD3C5]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#E6321C] font-bold">
                  YOUR BROWSING TRAIL
                </span>
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#171717] uppercase tracking-tight">
                  RECENTLY VIEWED
                </h2>
              </div>
              <Link
                to="/recently-viewed"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E6321C] hover:text-[#B91F12] transition-colors"
              >
                <span>VIEW ALL ({recentGarments.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {recentGarments.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl bg-white border border-[#DDD3C5] p-3 shadow-xs hover:shadow-md transition-all text-left"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="relative aspect-[4/5] rounded-xl bg-[#EDE0CC] overflow-hidden flex items-center justify-center"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Shirt size={32} className="text-[#171717]/40" />
                    )}
                  </Link>

                  <div className="mt-2.5 flex flex-col flex-1 justify-between">
                    <div>
                      <Link to={`/product/${item.slug}`}>
                        <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-sans font-extrabold text-xs sm:text-sm text-[#171717]">
                          ₹{item.basePrice.toLocaleString('en-IN')}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.basePrice && (
                          <span className="text-[11px] text-[#6F6A63] line-through font-sans">
                            ₹{item.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#DDD3C5]/60">
                      <Link
                        to={`/product/${item.slug}`}
                        className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-md border border-[#DDD3C5] hover:border-[#171717] bg-white text-[#171717] text-[10px] font-sans font-bold uppercase tracking-wider transition-colors"
                      >
                        VIEW PIECE
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Sticky Purchase Bar (floats directly above MobileNav) ─── */}
      <div className="fixed bottom-15 left-0 right-0 z-30 md:hidden bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#DDD3C5] px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-10 w-9 rounded-lg bg-[#EDE0CC] overflow-hidden shrink-0 border border-[#DDD3C5] flex items-center justify-center">
            {productImages[0] ? (
              <img src={productImages[0]} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Shirt size={18} className="text-[#171717]/50" />
            )}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-[#171717] truncate leading-tight">{title}</p>
            <p className="text-xs font-extrabold text-[#E6321C] leading-tight">₹{currentPrice}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="h-10 px-3.5 rounded-xl bg-[#171717] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <ShoppingBag size={14} />
            <span>ADD</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="h-10 px-4 rounded-xl bg-[#E6321C] text-white text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-transform shadow-xs"
          >
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
}
