import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

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

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'wash_care' | 'shipping'>('description');

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
      return product.images.map((img: any) => img.url || img.object_key);
    }
    return [];
  }, [product]);

  const currentPrice = product?.base_price || 799;

  const handleAddToCart = () => {
    const variant = variants.find((v: any) => v.color === activeColor && v.size === selectedSize) || variants[0];
    addItem(variant ? variant.id : (product?.id || 'temp'), 1);
    toast({
      title: `${product?.title || 'Oversized Graphic Tee'} added to cart`,
      description: `Color: ${activeColor} • Size: ${selectedSize}`,
      variant: 'success',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <Skeleton className="aspect-[4/5] rounded-2xl w-full" />
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const title = product?.title || 'Oversized Graphic Tee';
  const categoryName = product?.category?.name || 'T-Shirts';

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63] mb-6">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <Link to="/shop" className="hover:text-[#E6321C]">Shop</Link>
          <span>&gt;</span>
          <Link to={`/shop?category=${product?.category?.slug || 't-shirts'}`} className="hover:text-[#E6321C]">
            {categoryName}
          </Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium truncate max-w-[200px]">{title}</span>
        </nav>

        {/* ─── Main Product Details Grid (Exact Image 1) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Gallery with Vertical Thumbnails (7 cols) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            {/* 4 Thumbnails on the left */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible shrink-0">
              {[0, 1, 2, 3].map((idx) => {
                const img = productImages[idx];
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 w-18 sm:h-24 sm:w-20 rounded-xl overflow-hidden border-2 transition-all bg-[#EDE0CC] flex items-center justify-center shrink-0 ${
                      isActive ? 'border-[#E6321C] shadow-sm' : 'border-[#DDD3C5] hover:border-[#171717]/40'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt size={26} className="text-[#171717]/40" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Image Stage */}
            <div className="relative aspect-[4/5] flex-1 rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] overflow-hidden flex items-center justify-center order-1 sm:order-2 shadow-sm">
              {productImages[activeImageIndex] ? (
                <img
                  src={productImages[activeImageIndex]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center select-none bg-gradient-to-tr from-[#E6D9C5] to-[#F7EEDB] w-full h-full">
                  <Shirt size={80} className="text-[#171717]/40 mb-3" />
                  <span className="font-heading text-2xl font-extrabold uppercase text-[#171717]">
                    {title}
                  </span>
                  <span className="mt-1 text-xs font-sans text-[#6F6A63]">
                    Ready for Admin Photos
                  </span>
                </div>
              )}

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
              {/* NEW Pill Badge */}
              <div className="inline-block">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#E6321C] text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                  NEW
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
                      <button
                        key={color.name}
                        type="button"
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
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-[#171717] hover:text-[#E6321C] font-semibold"
                  >
                    <Ruler size={13} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2.5">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`h-11 rounded-lg font-sans text-xs font-bold transition-all border flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'border-[#E6321C] text-[#E6321C] bg-white shadow-xs'
                            : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        <span>{sz}</span>
                        {isSelected && (
                          <span className="w-4 h-[2px] bg-[#E6321C] rounded-full mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Feature Trust Badges Row (Exact Image 1) */}
              <div className="mt-6 pt-5 border-t border-[#DDD3C5]/60 grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <Shirt size={18} className="text-[#171717]/80 mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717]">
                    PREMIUM FABRIC
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">240 GSM Cotton</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={18} className="text-[#171717]/80 mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717]">
                    EASY RETURNS
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">7 Days Return</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={18} className="text-[#171717]/80 mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717]">
                    SECURE PAYMENT
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">100% Protected</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck size={18} className="text-[#171717]/80 mb-1" />
                  <span className="font-heading font-bold text-[10px] uppercase text-[#171717]">
                    FAST DELIVERY
                  </span>
                  <span className="text-[9px] text-[#6F6A63] font-sans">3-7 Days Delivery</span>
                </div>
              </div>

              {/* CTAs: ADD TO CART & BUY NOW */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm"
                >
                  <ShoppingBag size={16} />
                  <span>ADD TO CART</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-lg border border-[#E6321C] bg-white hover:bg-[#FDF0EE] text-[#E6321C] font-sans font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs"
                >
                  BUY NOW
                </button>
              </div>

              {/* Bottom Wishlist & Share row */}
              <div className="mt-4 flex items-center justify-between text-xs font-sans text-[#6F6A63] pt-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product?.id || 'temp', inWishlist)}
                  className="inline-flex items-center gap-1.5 hover:text-[#E6321C] transition-colors"
                >
                  <Heart size={14} className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : ''} />
                  <span>Add to Wishlist</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 hover:text-[#E6321C] transition-colors"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Product Tabs Section (Exact Image 1) ─── */}
        <div className="mt-14 pt-8 border-t border-[#DDD3C5]">
          {/* Tab Navigation */}
          <div className="flex items-center gap-8 border-b border-[#DDD3C5] overflow-x-auto">
            {[
              { id: 'description', label: 'DESCRIPTION' },
              { id: 'details', label: 'DETAILS' },
              { id: 'wash_care', label: 'WASH CARE' },
              { id: 'shipping', label: 'SHIPPING & RETURNS' },
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
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Description & Bullet Points */}
            <div className="lg:col-span-7 text-left space-y-4">
              <p className="text-xs sm:text-sm text-[#6F6A63] font-sans leading-relaxed">
                Make a statement with our oversized graphic tee. Crafted from premium 240 GSM cotton,
                it offers a relaxed fit with a bold print that stands out. Perfect for everyday wear,
                street style, and layering.
              </p>

              <ul className="space-y-1.5 text-xs text-[#171717] font-sans font-medium">
                <li>• 100% Cotton</li>
                <li>• 240 GSM Fabric</li>
                <li>• Oversized Fit</li>
                <li>• High Quality Print</li>
                <li>• Unisex Style</li>
              </ul>
            </div>

            {/* Right Column: Garment Detail Frame */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#171717] border border-[#DDD3C5] shadow-xs flex items-center justify-center p-6 text-center">
                <span className="font-heading font-bold text-xl uppercase tracking-wider text-white/90">
                  PRINT DETAIL CLOSEUP
                </span>
              </div>
            </div>
          </div>
        </div>

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RELATED_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all text-left"
              >
                {/* Image slot */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-lg bg-[#F7EEDB]/60 flex items-center justify-center">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-300"
                  >
                    <Shirt size={44} className="text-[#171717]/40 mb-1" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
                      {prod.title}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#171717] transition-colors shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart size={15} />
                  </button>
                </div>

                {/* Info */}
                <div className="mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${prod.slug}`}>
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                        {prod.title}
                      </h3>
                    </Link>

                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6F6A63]">
                        <Star size={12} className="fill-[#E6321C] text-[#E6321C]" />
                        <span className="text-[#171717] font-bold">{prod.rating}</span>
                        <span>({prod.reviewsCount})</span>
                      </div>
                      <span className="font-sans font-extrabold text-sm sm:text-base text-[#171717]">
                        ₹{prod.price}
                      </span>
                    </div>
                  </div>

                  {/* Outline Add to Cart Button */}
                  <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60">
                    <button
                      type="button"
                      onClick={() => {
                        addItem(prod.id, 1);
                        toast({ title: `${prod.title} added to cart`, variant: 'success' });
                      }}
                      className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-md border border-[#E6321C]/50 hover:border-[#E6321C] bg-white hover:bg-[#E6321C] text-[#E6321C] hover:text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-colors"
                    >
                      <ShoppingBag size={12} />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
