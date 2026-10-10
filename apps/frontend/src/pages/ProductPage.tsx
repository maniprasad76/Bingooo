import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Check, Lock, Truck, RotateCcw, ShoppingBag, Zap, Sparkles } from 'lucide-react';
import { SizeAdvisorModal } from '../components/catalog/SizeAdvisorModal';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { generateProductSchema } from '../lib/seo/schema';
import { SITE_URL, categoryUrl, productImages, productSeoDescription, productSeoTitle, productUrl } from '../lib/seo/catalog-seo.mjs';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { trackViewItem } from '../lib/analytics';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';
import { StickyMobileActionBar } from '../components/product/StickyMobileActionBar';
import { ProductPlaceholder } from '../components/ui/ProductPlaceholder';
import { WhatsAppIcon } from '../components/ui/SocialIcons';
import { resolveImageUrl } from '../lib/utils';
import { ProductReviews } from '../components/product/ProductReviews';
import { ProductDeliveryTimeline } from '../components/product/ProductDeliveryTimeline';

const DEFAULT_RELATED: any[] = [];

interface SizeChartRow {
  size: string;
  chest: [number, number]; // [in, cm]
  length: [number, number]; // length for tees, height for hoodie
  shoulder?: [number, number];
  sleeve?: [number, number];
}

const PRODUCT_SIZE_SPECS: Record<'oversized' | 'acidwash' | 'hoodie', {
  title: string;
  subtitle: string;
  fabric: string;
  isHoodie?: boolean;
  rows: SizeChartRow[];
}> = {
  oversized: {
    title: 'Drop-Shoulder / Oversized T-Shirt',
    subtitle: 'Signature Drop-Shoulder Silhouette',
    fabric: '240 GSM Loopknit French Terry Cotton 100% Biowash',
    rows: [
      { size: 'S', chest: [42, 106.7], length: [27.5, 69.9], shoulder: [20, 50.8], sleeve: [8.5, 21.6] },
      { size: 'M', chest: [44, 111.8], length: [28, 71.1], shoulder: [21, 53.3], sleeve: [9.0, 22.9] },
      { size: 'L', chest: [46, 116.8], length: [28.5, 72.4], shoulder: [22, 55.9], sleeve: [9.5, 24.1] },
      { size: 'XL', chest: [48, 121.9], length: [29, 73.7], shoulder: [23, 58.4], sleeve: [10.0, 25.4] },
      { size: 'XXL', chest: [50, 127.0], length: [29.5, 74.9], shoulder: [24, 61.0], sleeve: [10.5, 26.7] },
    ],
  },
  acidwash: {
    title: 'Acid Wash Drop-Shoulder T-Shirt',
    subtitle: 'Vintage Mineral Wash Silhouette',
    fabric: '240 GSM Loopknit French Terry Cotton 100% Biowash',
    rows: [
      { size: 'S', chest: [42, 106.7], length: [27.5, 69.9], shoulder: [20, 50.8], sleeve: [8.5, 21.6] },
      { size: 'M', chest: [44, 111.8], length: [28, 71.1], shoulder: [21, 53.3], sleeve: [9.0, 22.9] },
      { size: 'L', chest: [46, 116.8], length: [28.5, 72.4], shoulder: [22, 55.9], sleeve: [9.5, 24.1] },
      { size: 'XL', chest: [48, 121.9], length: [29, 73.7], shoulder: [23, 58.4], sleeve: [10.0, 25.4] },
      { size: 'XXL', chest: [50, 127.0], length: [29.5, 74.9], shoulder: [24, 61.0], sleeve: [10.5, 26.7] },
    ],
  },
  hoodie: {
    title: 'Drop Shoulder Hoodie (430gsm)',
    subtitle: 'Heavyweight Loopknit Fleece Silhouette',
    fabric: '430 GSM Heavyweight Loopknit Fleece',
    isHoodie: true,
    rows: [
      { size: 'S', chest: [42, 106.7], length: [25, 63.5] },
      { size: 'M', chest: [44, 111.8], length: [26, 66.0] },
      { size: 'L', chest: [46, 116.8], length: [27, 68.6] },
      { size: 'XL', chest: [48, 121.9], length: [28, 71.1] },
      { size: 'XXL', chest: [50, 127.0], length: [29, 73.7] },
    ],
  },
};

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: remoteProduct, isLoading: isProductLoading } = useProduct(slug);
  const { addItem, isAdding } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addProduct } = useRecentlyViewed();

  const product = remoteProduct || null;


  const { data: wishlistData } = useIsInWishlist(product?.id);
  const inWishlist = !!wishlistData?.inWishlist;

  // Track product in recently viewed and GA4 view_item
  useEffect(() => {
    if (product) {
      addProduct(product);
      trackViewItem({
        id: product.id,
        name: product.title,
        price: Number(product.price),
        category: (product as any)?.category?.name || (product as any)?.category,
      });
    }
  }, [product, addProduct]);

  // Gallery state — dynamically display all images provided by backend
  const images = useMemo<string[]>(() => {
    if (product?.images && product.images.length > 0) {
      const urls = product.images
        .map((img: any) => resolveImageUrl(typeof img === 'string' ? img : img.url || img.object_key))
        .filter(Boolean);
      if (urls.length > 0) return urls;
    }
    const single = product?.image_url || product?.imageUrl || product?.primary_image || product?.primaryImage || (product as any)?.image;
    if (single) {
      const resolved = resolveImageUrl(typeof single === 'string' ? single : single.url || single.object_key);
      if (resolved) return [resolved];
    }
    return [];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dynamic colors derived from product.variants or product attributes
  const colorOptions = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      const map = new Map<string, string>();
      product.variants.forEach((v: any) => {
        if (v.color) {
          map.set(v.color, v.colorHex || v.color_hex || '#171717');
        }
      });
      if (map.size > 0) {
        return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
      }
    }
    // Infer color from product direct properties
    const prodColor = (product as any)?.color || (product as any)?.color_name;
    if (prodColor) {
      const hex = (product as any)?.color_hex || (product as any)?.colorHex || '#171717';
      return [{ name: prodColor, hex }];
    }
    // Check if title mentions a known color
    const title = (product?.title || '').toLowerCase();
    const colorKeywordMap: Record<string, string> = {
      brown: '#6B4423',
      black: '#171717',
      white: '#F5F5F5',
      cream: '#F7EEDB',
      vintage: '#EDE0CC',
      olive: '#556B2F',
      green: '#2E5A36',
      sage: '#9CAF88',
      beige: '#D4C4A8',
      navy: '#1B2A4A',
      blue: '#2B4C7E',
      maroon: '#6B1D2F',
      terracotta: '#C86446',
      charcoal: '#2D2D2D',
      grey: '#777777',
      gray: '#777777',
      rust: '#A04218',
    };
    for (const [key, hex] of Object.entries(colorKeywordMap)) {
      if (title.includes(key)) {
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        return [{ name: capitalized, hex }];
      }
    }
    return [];
  }, [product]);

  const [selectedColor, setSelectedColor] = useState('');

  // Dynamic sizes derived from product.variants for selected color
  const sizeOptions = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      const matching = product.variants.filter(
        (v: any) => !selectedColor || v.color?.toLowerCase() === selectedColor.toLowerCase()
      );
      const variantsToUse = matching.length > 0 ? matching : product.variants;
      const sizes = [...new Set(variantsToUse.map((v: any) => v.size).filter(Boolean))] as string[];
      if (sizes.length > 0) {
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
        return sizes.sort((a, b) => {
          const ia = order.indexOf(a);
          const ib = order.indexOf(b);
          if (ia !== -1 && ib !== -1) return ia - ib;
          return a.localeCompare(b);
        });
      }
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }, [product, selectedColor]);

  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Garment category detection for authoritative size specs
  const productCategoryKey = useMemo<'oversized' | 'acidwash' | 'hoodie'>(() => {
    const title = (product?.title || '').toLowerCase();
    const desc = (product?.description || '').toLowerCase();
    const cat = (product?.category?.name || product?.category || '').toLowerCase();
    if (title.includes('hoodie') || cat.includes('hoodie') || desc.includes('hoodie')) {
      return 'hoodie';
    }
    if (title.includes('acid') || desc.includes('acid')) {
      return 'acidwash';
    }
    return 'oversized';
  }, [product]);

  // Size chart modal & on-page fit guide state
  const [sizeModalCategory, setSizeModalCategory] = useState<'oversized' | 'acidwash' | 'hoodie'>('oversized');
  const [fitGuideCategory, setFitGuideCategory] = useState<'oversized' | 'acidwash' | 'hoodie'>('oversized');
  const [sizeUnit, setSizeUnit] = useState<'in' | 'cm'>('in');

  // Follow the product's garment type when navigating between products
  const [syncedCategoryKey, setSyncedCategoryKey] = useState<typeof productCategoryKey | null>(null);
  if (productCategoryKey !== syncedCategoryKey) {
    setSyncedCategoryKey(productCategoryKey);
    setSizeModalCategory(productCategoryKey);
    setFitGuideCategory(productCategoryKey);
  }

  // Adjust selection during render if options changed
  if (colorOptions.length > 0 && !colorOptions.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase())) {
    setSelectedColor(colorOptions[0].name);
  } else if (colorOptions.length === 0 && selectedColor) {
    setSelectedColor('');
  }
  if (sizeOptions.length > 0 && !sizeOptions.includes(selectedSize)) {
    setSelectedSize(sizeOptions[0]);
  }

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<{ message: string; ok: boolean } | null>(null);

  // Size modal & fit advisor state
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  // Find authoritative matching variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return (
      product.variants.find(
        (v: any) =>
          (!selectedColor || v.color?.toLowerCase() === selectedColor?.toLowerCase()) &&
          v.size?.toLowerCase() === selectedSize?.toLowerCase()
      ) ||
      product.variants.find(
        (v: any) => v.size?.toLowerCase() === selectedSize?.toLowerCase()
      ) ||
      product.variants[0]
    );
  }, [product, selectedColor, selectedSize]);

  const price = selectedVariant?.price ?? product?.base_price ?? product?.basePrice ?? 999;
  const compareAtPrice = product?.compare_at_price ?? product?.compareAtPrice ?? Math.round(price * 1.3);
  const discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  const currentStock = selectedVariant?.stockQuantity ?? selectedVariant?.stock_quantity ?? 15;
  const isOutOfStock = currentStock <= 0;

  // Handle Add To Cart
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast({ title: 'Selected size is currently out of stock', variant: 'danger' });
      return;
    }
    triggerHaptic('medium');
    const variantId = selectedVariant?.id || product?.variants?.[0]?.id || `var-${product?.id || 'prod'}-${selectedSize}-${selectedColor || 'std'}`;
    
    // Authoritative primary image
    const mainImage = images[0] || resolveImageUrl(product?.images?.[0]?.url || product?.images?.[0]) || '';
    const categoryName = product?.category?.name || product?.category || (productCategoryKey === 'hoodie' ? 'HOODIES' : productCategoryKey === 'acidwash' ? 'ACID WASH' : 'T-SHIRTS');
    const fabricDesc = product?.gsm ? `${product.gsm} GSM` : product?.fabric || (productCategoryKey === 'hoodie' ? '430 GSM' : '240 GSM');

    addItem(variantId, quantity, undefined, {
      title: product?.title || 'Bingooo Garment',
      image: mainImage,
      color: selectedColor || selectedVariant?.color || '',
      size: selectedSize,
      category: categoryName,
      gsm: fabricDesc,
      slug: product?.slug || slug || '',
      price: price,
    });

    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 1600);
  };

  // Handle Buy It Now
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  // Handle Wishlist toggle
  const handleToggleWishlist = () => {
    triggerHaptic('light');
    if (product?.id) {
      toggleWishlist(product.id, inWishlist);
    }
  };

  // Handle WhatsApp Share
  const handleWhatsAppShare = () => {
    triggerHaptic('light');
    const title = product?.title || 'Bingooo Menswear';
    const pageUrl = window.location.href;
    const shareText = encodeURIComponent(
      `Check out this ${title} (₹${price}) on Bingooo:\n${pageUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank', 'noopener,noreferrer');
  };

  // Handle Pincode validation
  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      setDeliveryResult({
        message: 'Enter a valid 6-digit PIN code.',
        ok: false,
      });
      return;
    }
    setDeliveryResult({
      message: 'Delivery available. Estimated delivery: 3–5 business days.',
      ok: true,
    });
  };



  if (isProductLoading && !remoteProduct) {
    return <ProductDetailSkeleton />;
  }

  if (!isProductLoading && !product) {
    return (
      <main className="min-h-[70vh] bg-[#f7eedb] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#171717] mb-2">Product Not Found</h2>
        <p className="text-sm text-[#6f6a63] mb-6">This item may have been removed or is currently unavailable.</p>
        <Link
          to="/shop"
          className="h-[46px] px-6 rounded-[8px] text-xs font-bold tracking-wider uppercase inline-flex items-center justify-center bg-[#171717] text-white hover:bg-black transition-colors"
        >
          Return to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased pb-[72px] sm:pb-0">
      <SEO
        // Same title, description and schema the build-time prerender emits (catalog-seo.mjs).
        title={productSeoTitle(product as any)}
        description={productSeoDescription(product as any)}
        keywords={[product?.title, product?.category?.name, ...(Array.isArray(product?.tags) ? product.tags : []), 'bingooo'].filter(Boolean).join(', ')}
        canonical={productUrl((product as any).slug || slug || '')}
        ogType="product"
        ogImage={productImages(product as any)[0]}
        productPrice={price}
        schema={[generateProductSchema(product as any)]}
        breadcrumbs={[
          { name: 'Home', url: `${SITE_URL}/` },
          ...(product?.category?.slug ? [{ name: product.category.name, url: categoryUrl(product.category.slug) }] : [{ name: 'Shop', url: `${SITE_URL}/shop` }]),
          { name: product?.title || 'Product', url: productUrl((product as any).slug || slug || '') },
        ]}
      />

      {/* =======================================================
           BREADCRUMB
      ======================================================= */}
      <div className="container-bingooo">
        <div className="py-[15px] sm:py-[22px] text-[10px] text-[#6f6a63] font-medium">
          <Link to="/" className="hover:text-[#171717] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop?category=men" className="hover:text-[#171717] transition-colors">Men</Link>
          <span className="mx-2">/</span>
          <Link to="/category/t-shirts" className="hover:text-[#171717] transition-colors">
            {product?.category?.name || 'T-Shirts'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#171717] font-semibold">{product?.title || 'Classic Logo Tee'}</span>
        </div>
      </div>

      {/* =======================================================
           PRODUCT MAIN SECTION
      ======================================================= */}
      <section className="pt-[15px] pb-[80px] sm:pb-[100px]">
        <div className="container-bingooo grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] gap-[clamp(40px,6vw,100px)] items-start">
          
          {/* ── GALLERY ── */}
          <div className="sticky top-5 flex flex-col-reverse md:grid md:grid-cols-[88px_minmax(0,1fr)] gap-[15px]">
            {/* Thumbnails — Displays up to 5 product gallery angles */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 md:flex md:flex-col gap-[10px]">
                {images.slice(0, 5).map((src: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveImageIndex(i);
                    }}
                    className={`border-2 aspect-square overflow-hidden bg-[#EDE0CC] p-0 cursor-pointer transition-all ${
                      i === activeImageIndex
                        ? 'border-[#171717] shadow-[2px_2px_0px_#E6321C]'
                        : 'border-[#171717] opacity-70 hover:opacity-100 shadow-[1px_1px_0px_#171717]'
                    }`}
                    aria-label={`View thumbnail ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${product?.title || 'Product'} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Dynamic Badges */}
            <div className="relative aspect-[1/1.18] sm:aspect-[4/5] overflow-hidden bg-[#EDE0CC] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] group">
              <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 select-none">
                {Boolean(product?.bestseller) && (
                  <span className="px-2.5 py-1 bg-[#171717] text-white text-[9px] font-mono font-bold tracking-[0.14em] uppercase border border-[#171717] shadow-[2px_2px_0px_#171717]">
                    BESTSELLER
                  </span>
                )}
                {(Boolean(product?.is_sale) || compareAtPrice > price) && (
                  <span className="px-2.5 py-1 bg-[#E6321C] text-white text-[9px] font-mono font-bold tracking-[0.14em] uppercase border border-[#171717] shadow-[2px_2px_0px_#171717]">
                    {product?.sale_tag || (discountPercent > 0 ? `SALE • ${discountPercent}% OFF` : 'ON SALE')}
                  </span>
                )}
                {product?.badge_text && !product?.bestseller && (
                  <span className="px-2.5 py-1 bg-[#171717] text-white text-[9px] font-mono font-bold tracking-[0.14em] uppercase border border-[#171717] shadow-[2px_2px_0px_#171717]">
                    {product.badge_text}
                  </span>
                )}
              </div>

              {images[activeImageIndex] || images[0] ? (
                <img
                  fetchPriority="high"
                  decoding="async"
                  src={images[activeImageIndex] || images[0]}
                  alt={product?.title || 'Product Image'}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <ProductPlaceholder name={product?.title} category={product?.category?.name} />
              )}
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="pt-[5px]">
            {/* Meta Row: Category + Actions (WhatsApp Share & Wishlist) */}
            <div className="flex justify-between items-center mb-[14px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#171717] text-white font-mono text-[9px] font-bold uppercase tracking-wider border border-[#171717]">
                01 // {product?.category?.name?.toUpperCase() || 'APPAREL'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-9 h-9 border-2 border-[#171717] bg-white text-[#25D366] shadow-[2px_2px_0px_#171717] hover:bg-[#25D366] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none grid place-items-center transition-all cursor-pointer"
                  aria-label="Share via WhatsApp"
                  title="Share via WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`w-9 h-9 border-2 border-[#171717] grid place-items-center transition-all shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer ${
                    inWishlist
                      ? 'bg-[#171717] text-[#E6321C]'
                      : 'bg-white text-[#171717] hover:bg-[#E6321C] hover:text-white'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  title={inWishlist ? 'Saved to wishlist' : 'Save to wishlist'}
                >
                  <Heart size={16} className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : 'text-current'} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="m-0 text-[clamp(32px,4vw,56px)] font-black leading-[0.92] tracking-tight uppercase text-[#171717]">
              {product?.title ? product.title.toUpperCase() : 'CLASSIC LOGO TEE'}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-[10px] my-4">
              <div className="flex items-center gap-0.5 text-[#171717]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="fill-[#171717] text-[#171717]" />
                ))}
              </div>
              <a href="#reviews" className="font-mono text-[10px] font-bold underline underline-offset-4 text-[#171717] hover:text-[#E6321C] transition-colors">
                VERIFIED ATELIER REVIEWS
              </a>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[26px] font-black font-mono text-[#171717]">
                ₹{price}
              </span>
              {compareAtPrice > price && (
                <>
                  <span className="text-[#6F6A63] font-mono text-[14px] line-through">
                    ₹{compareAtPrice}
                  </span>
                  <span className="px-2 py-0.5 bg-[#E6321C] text-white text-[9px] font-mono font-black uppercase border border-[#171717]">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="m-0 mb-5 font-mono text-[#6F6A63] text-[10px] uppercase">
              INCLUSIVE OF ALL TAXES & COMPLIMENTARY SHIPPING
            </p>

            {/* Scarcity / Inventory Box */}
            <div className="border-2 border-[#171717] bg-white p-3.5 shadow-[3px_3px_0px_#171717] mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#171717]">
                  <span
                    className={`w-2.5 h-2.5 border border-[#171717] ${
                      isOutOfStock
                        ? 'bg-[#C62828]'
                        : currentStock <= 5
                        ? 'bg-[#E6321C]'
                        : 'bg-[#238636]'
                    }`}
                  />
                  {isOutOfStock
                    ? 'OUT OF STOCK'
                    : currentStock <= 5
                    ? 'LOW STOCK ALERT'
                    : 'IN STOCK & READY TO SHIP'}
                </div>
                <div className="font-mono text-[10px] font-black text-[#171717]">
                  {isOutOfStock ? '0 UNITS' : `${currentStock} UNITS LEFT`}
                </div>
              </div>

              <div className="w-full h-2 bg-[#F7EEDB] border border-[#171717]">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, Math.max(12, (currentStock / 30) * 100))}%`,
                    backgroundColor: isOutOfStock
                      ? '#C62828'
                      : currentStock <= 5
                      ? '#E6321C'
                      : '#171717',
                  }}
                />
              </div>

              <p className="m-0 mt-2 text-[9px] font-mono text-[#6F6A63]">
                {isOutOfStock ? (
                  <span className="text-[#C62828] font-black">
                    Variant ({selectedColor ? `${selectedColor} / ` : ''}{selectedSize}) is sold out.
                  </span>
                ) : currentStock <= 5 ? (
                  <span className="text-[#E6321C] font-black">
                    Only {currentStock} left in stock for size {selectedSize} — dispatch within 24h.
                  </span>
                ) : (
                  'Ready to dispatch within 24 hours from Bingooo atelier.'
                )}
              </p>
            </div>

            {/* Color Option */}
            {colorOptions.length > 0 && (
              <div className="my-6">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
                    02 // COLOR: {selectedColor}
                  </span>
                </div>

                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedColor(c.name);
                      }}
                      className={`w-7 h-7 border-2 border-[#171717] transition-all cursor-pointer ${
                        selectedColor === c.name ? 'shadow-[3px_3px_0px_#E6321C] scale-110' : 'shadow-[1px_1px_0px_#171717]'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Option */}
            <div className="my-6">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#171717]">
                  03 // SELECT SIZE
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsAdvisorOpen(true);
                    }}
                    className="p-0 border-0 bg-transparent text-[10px] font-black font-mono text-[#E6321C] hover:underline transition-colors cursor-pointer flex items-center gap-1"
                    title="Interactive fit advisor for 240 GSM tees based on height and weight"
                  >
                    <Sparkles size={11} />
                    FIND YOUR FIT →
                  </button>
                  <span className="text-[#171717]/30 text-[10px]">|</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeModalOpen(true)}
                    className="p-0 border-0 bg-transparent text-[10px] font-black font-mono underline underline-offset-4 text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
                  >
                    SIZE CHART →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizeOptions.map((sz) => {
                  const szStock = (product?.variants || []).find(
                    (v: any) =>
                      v.size?.toLowerCase() === sz.toLowerCase() &&
                      (!selectedColor || v.color?.toLowerCase() === selectedColor.toLowerCase())
                  )?.stockQuantity ?? 10;
                  const isSzSoldOut = szStock <= 0;

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedSize(sz);
                      }}
                      className={`h-11 border-2 border-[#171717] font-black font-mono text-[11px] uppercase transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                          : 'bg-white text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB]'
                      } ${isSzSoldOut ? 'opacity-40 line-through' : ''}`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="grid grid-cols-[115px_1fr] sm:grid-cols-[130px_1fr] gap-2.5 mt-6">
              {/* Quantity */}
              <div className="h-[52px] grid grid-cols-[40px_1fr_40px] border-2 border-[#171717] bg-white shadow-[3px_3px_0px_#171717]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="border-0 bg-transparent text-base font-black text-[#171717] hover:bg-[#E6321C] hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-full border-0 bg-transparent text-center outline-none text-[13px] font-black font-mono text-[#171717]"
                  aria-label="Current quantity"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(4, q + 1))}
                  className="border-0 bg-transparent text-base font-black text-[#171717] hover:bg-[#E6321C] hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add To Cart */}
              <button
                type="button"
                disabled={isAdding || isOutOfStock}
                onClick={handleAddToCart}
                className={`h-[52px] w-full text-xs font-black uppercase tracking-wider border-2 border-[#171717] shadow-[4px_4px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-zinc-400 text-white cursor-not-allowed border-zinc-500 shadow-none'
                    : isAddedFeedback
                    ? 'bg-[#238636] text-white border-[#171717]'
                    : 'bg-[#171717] text-white hover:bg-[#E6321C]'
                }`}
              >
                {isOutOfStock ? (
                  <span>SOLD OUT</span>
                ) : isAddedFeedback ? (
                  <span className="inline-flex items-center gap-2">
                    <Check size={16} strokeWidth={3} />
                    <span>ADDED TO BAG</span>
                  </span>
                ) : isAdding ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    <span>ADDING…</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag size={15} />
                    <span>ADD TO CART</span>
                  </span>
                )}
              </button>
            </div>

            {/* Purchase & Social Actions */}
            <div className="flex items-center gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={handleBuyNow}
                className="h-[52px] flex-1 text-xs font-black uppercase tracking-wider border-2 border-[#171717] bg-[#E6321C] text-white shadow-[4px_4px_0px_#171717] hover:bg-[#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Zap size={14} className="fill-white" />
                <span>BUY IT NOW</span>
                <span>→</span>
              </button>

              {/* Wishlist Icon Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                title={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
                aria-label={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
                className={`w-[52px] h-[52px] shrink-0 border-2 border-[#171717] shadow-[3px_3px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none grid place-items-center transition-all cursor-pointer ${
                  inWishlist
                    ? 'bg-[#171717] text-[#E6321C]'
                    : 'bg-white text-[#171717] hover:bg-[#E6321C] hover:text-white'
                }`}
              >
                <Heart
                  size={18}
                  className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : 'text-current'}
                />
              </button>

              {/* WhatsApp Share Icon Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                title="Share via WhatsApp"
                aria-label="Share via WhatsApp"
                className="w-[52px] h-[52px] shrink-0 border-2 border-[#171717] bg-white text-[#25D366] hover:bg-[#25D366] hover:text-white shadow-[3px_3px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none grid place-items-center transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Timeline */}
            <ProductDeliveryTimeline />

            {/* Delivery Check */}
            <div className="mt-[28px] pt-[25px] border-t-2 border-[#171717]/10">
              <h3 className="m-0 mb-2.5 text-[11px] font-black uppercase tracking-wider text-[#171717]">
                04 // CHECK DELIVERY TIME
              </h3>

              <form onSubmit={handleCheckDelivery} className="flex max-w-[420px]">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="ENTER 6-DIGIT PIN"
                  className="flex-1 h-[46px] border-2 border-[#171717] px-3.5 bg-white outline-none font-mono text-[11px] font-bold text-[#171717] shadow-[2px_2px_0px_#171717]"
                />
                <button
                  type="submit"
                  className="border-2 border-[#171717] border-l-0 px-5 bg-[#171717] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#E6321C] transition-colors cursor-pointer shadow-[2px_2px_0px_#171717] active:shadow-none"
                >
                  CHECK
                </button>
              </form>

              {deliveryResult && (
                <div
                  className="mt-2 text-[10px] font-mono font-bold"
                  style={{ color: deliveryResult.ok ? '#238636' : '#C62828' }}
                >
                  {deliveryResult.message}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-6 grid gap-2.5">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#171717]">
                <div className="w-7 h-7 border-2 border-[#171717] bg-white grid place-items-center shrink-0 shadow-[2px_2px_0px_#171717]">
                  <Check size={13} strokeWidth={3} className="text-[#171717]" />
                </div>
                <span>240+ GSM HEAVYWEIGHT COMBED COTTON</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#171717]">
                <div className="w-7 h-7 border-2 border-[#171717] bg-white grid place-items-center shrink-0 shadow-[2px_2px_0px_#171717]">
                  <RotateCcw size={13} strokeWidth={3} className="text-[#171717]" />
                </div>
                <span>7-DAY HASSLE-FREE DOORSTEP EXCHANGE</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#171717]">
                <div className="w-7 h-7 border-2 border-[#171717] bg-white grid place-items-center shrink-0 shadow-[2px_2px_0px_#171717]">
                  <Lock size={13} strokeWidth={3} className="text-[#171717]" />
                </div>
                <span>256-BIT ENCRYPTED RAZORPAY / UPI CHECKOUT</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#171717]">
                <div className="w-7 h-7 border-2 border-[#171717] bg-white grid place-items-center shrink-0 shadow-[2px_2px_0px_#171717]">
                  <Truck size={13} strokeWidth={3} className="text-[#171717]" />
                </div>
                <span>FREE PAN-INDIA SHIPPING ON PREPAID ORDERS</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =======================================================
           PRODUCT DETAILS
      ======================================================= */}
      <section className="py-[65px] sm:py-[80px] border-t-2 border-[#171717] bg-[#F7EEDB]">
        <div className="container-bingooo grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-[35px] lg:gap-[80px]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#171717] text-white text-[9px] font-mono uppercase font-black border border-[#171717] mb-3">
              SPECIFICATIONS
            </div>
            <h2 className="m-0 text-[clamp(34px,4vw,55px)] font-black leading-[0.92] tracking-tight uppercase text-[#171717]">
              DETAILS<br />
              <span className="text-[#E6321C]">MATTER.</span>
            </h2>
          </div>

          <div>
            <p className="max-w-[700px] text-[12px] sm:text-[13px] leading-[1.8] text-[#6F6A63] font-medium m-0">
              {product?.description ||
                (productCategoryKey === 'hoodie'
                  ? 'Engineered from ultra-heavyweight 430 GSM loopknit fleece with double-lined hood, kangaroo pocket, and modern boxy streetwear drop shoulders.'
                  : 'Crafted from heavyweight 240 GSM loopknit French terry cotton 100% biowash. Engineered with structured drop shoulders, reinforced collar, and a modern boxy drape built to endure.')}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
                <h3 className="m-0 mb-1.5 text-[11px] font-black uppercase text-[#171717]">
                  FABRIC
                </h3>
                <p className="m-0 font-mono text-[10px] text-[#6F6A63] leading-[1.6]">
                  {product?.fabric ||
                    (productCategoryKey === 'hoodie'
                      ? '430 GSM Heavyweight Loopknit Fleece'
                      : '240 GSM Loopknit French Terry Cotton 100% Biowash')}
                </p>
              </div>

              <div className="p-5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
                <h3 className="m-0 mb-1.5 text-[11px] font-black uppercase text-[#171717]">
                  FIT
                </h3>
                <p className="m-0 font-mono text-[10px] text-[#6F6A63] leading-[1.6]">
                  {product?.fit ||
                    (productCategoryKey === 'hoodie'
                      ? 'Drop Shoulder Heavyweight boxy winter hoodie drape with relaxed proportions.'
                      : 'Drop-Shoulder Oversized boxy streetwear fit with relaxed proportions.')}
                </p>
              </div>

              <div className="p-5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
                <h3 className="m-0 mb-1.5 text-[11px] font-black uppercase text-[#171717]">
                  DESIGN
                </h3>
                <p className="m-0 font-mono text-[10px] text-[#6F6A63] leading-[1.6]">
                  {product?.design_details ||
                    product?.designDetails ||
                    'Signature Bingooo branding with clean minimal chest and collar detailing.'}
                </p>
              </div>

              <div className="p-5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
                <h3 className="m-0 mb-1.5 text-[11px] font-black uppercase text-[#171717]">
                  CARE
                </h3>
                <p className="m-0 font-mono text-[10px] text-[#6F6A63] leading-[1.6]">
                  {product?.care_instructions ||
                    product?.careInstructions ||
                    'Machine wash cold. Wash inside out. Do not iron directly on print.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           SIZE GUIDE SECTION
      ======================================================= */}
      <section className="py-[75px] bg-[#EDE0CC] border-t-2 border-[#171717]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#171717] text-white text-[9px] font-mono uppercase font-black border border-[#171717] mb-2">
                05 // SILHOUETTE DIMENSIONS
              </div>
              <h2 className="m-0 text-[clamp(32px,4vw,52px)] leading-[0.95] font-black tracking-tight uppercase text-[#171717]">
                FIND YOUR<br />
                <span className="text-[#E6321C]">FIT.</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Garment Selector Tabs */}
              <div className="inline-flex border-2 border-[#171717] bg-white p-1 shadow-[2px_2px_0px_#171717]">
                {(['oversized', 'acidwash', 'hoodie'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setFitGuideCategory(tabKey);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      fitGuideCategory === tabKey
                        ? 'bg-[#171717] text-white'
                        : 'text-[#6F6A63] hover:text-[#171717]'
                    }`}
                  >
                    {tabKey === 'oversized'
                      ? 'Drop-Shoulder (240 GSM)'
                      : tabKey === 'acidwash'
                      ? 'Acid Wash (240 GSM)'
                      : 'Hoodie (430gsm)'}
                  </button>
                ))}
              </div>

              {/* Unit Toggle */}
              <div className="inline-flex border-2 border-[#171717] bg-white p-1 shadow-[2px_2px_0px_#171717]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSizeUnit('in');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    sizeUnit === 'in' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                >
                  IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSizeUnit('cm');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    sizeUnit === 'cm' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between text-[11px] text-[#6F6A63]">
            <span className="font-black text-[#171717] uppercase">
              {PRODUCT_SIZE_SPECS[fitGuideCategory].title} — <span className="font-normal">{PRODUCT_SIZE_SPECS[fitGuideCategory].fabric}</span>
            </span>
            <span className="font-mono text-[10px] tracking-wider uppercase font-bold">
              MEASUREMENTS / {sizeUnit === 'in' ? 'INCHES' : 'CENTIMETERS'}
            </span>
          </div>

          <div className="overflow-x-auto bg-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717]">
            <table className="size-table w-full">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  {PRODUCT_SIZE_SPECS[fitGuideCategory].isHoodie ? (
                    <th>Height</th>
                  ) : (
                    <>
                      <th>Length</th>
                      <th>Shoulder</th>
                      <th>Sleeve Length</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {PRODUCT_SIZE_SPECS[fitGuideCategory].rows.map((row) => (
                  <tr key={row.size}>
                    <td className="font-mono font-black text-[#171717]">{row.size}</td>
                    <td className="font-mono">{sizeUnit === 'in' ? row.chest[0] : row.chest[1]}</td>
                    {PRODUCT_SIZE_SPECS[fitGuideCategory].isHoodie ? (
                      <td className="font-mono">{sizeUnit === 'in' ? row.length[0] : row.length[1]}</td>
                    ) : (
                      <>
                        <td className="font-mono">{sizeUnit === 'in' ? row.length[0] : row.length[1]}</td>
                        <td className="font-mono">{sizeUnit === 'in' ? row.shoulder?.[0] : row.shoulder?.[1]}</td>
                        <td className="font-mono">{sizeUnit === 'in' ? row.sleeve?.[0] : row.sleeve?.[1]}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =======================================================
           REVIEWS SECTION (Real Verified Reviews Only)
      ======================================================= */}
      <ProductReviews
        productId={product?.id || ''}
        productTitle={product?.title || ''}
        productThumbnail={images[0]}
      />

      {/* =======================================================
           RELATED PRODUCTS
      ======================================================= */}
      <section className="py-[65px] sm:py-[100px] border-t-2 border-[#171717] bg-[#F7EEDB]">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-[35px]">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#171717] text-white text-[9px] font-mono uppercase font-black border border-[#171717] mb-2">
                COMPLETE THE FIT
              </div>
              <h2 className="m-0 text-[clamp(36px,4vw,58px)] font-black tracking-tight leading-[0.9] uppercase text-[#171717]">
                YOU MAY<br />
                <span className="text-[#E6321C]">ALSO LIKE.</span>
              </h2>
            </div>

            <Link to="/shop" className="text-link">
              VIEW ALL →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {DEFAULT_RELATED.map((item) => (
              <article key={item.id} className="group flex flex-col bg-white border-2 border-[#171717] p-2.5 shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE0CC] border-2 border-[#171717]">
                  <Link to={item.link} className="block h-full w-full">
                    {item.image ? (
                      <img loading="lazy" decoding="async"
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-[#EDE0CC]" />
                    )}
                  </Link>
                </div>

                <div className="pt-3">
                  <p className="m-0 mb-1 text-[12px] font-black uppercase text-[#171717] line-clamp-1">
                    <Link to={item.link} className="hover:text-[#E6321C] transition-colors">
                      {item.name}
                    </Link>
                  </p>
                  <p className="m-0 font-mono text-[13px] font-black text-[#171717]">
                    {item.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
           SIZE CHART MODAL
      ======================================================= */}
      {isSizeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sizeModalTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSizeModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-[min(760px,100%)] max-h-[90vh] overflow-auto bg-[#F7EEDB] p-6 sm:p-8 border-2 border-[#171717] shadow-[8px_8px_0px_#171717] relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-[#171717]">
              <div>
                <h2 id="sizeModalTitle" className="m-0 text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#171717]">
                  SIZE CHART.
                </h2>
                <p className="m-0 mt-1 font-mono text-[11px] font-bold text-[#6F6A63] uppercase">
                  {PRODUCT_SIZE_SPECS[sizeModalCategory].title} • {PRODUCT_SIZE_SPECS[sizeModalCategory].fabric}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="w-9 h-9 border-2 border-[#171717] bg-white text-lg font-black text-[#171717] hover:bg-[#E6321C] hover:text-white transition-colors cursor-pointer grid place-items-center shadow-[2px_2px_0px_#171717]"
                aria-label="Close size chart"
              >
                ×
              </button>
            </div>

            {/* Category selection & unit toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-[#171717]/10">
              <div className="inline-flex border-2 border-[#171717] bg-white p-1 shadow-[2px_2px_0px_#171717]">
                {(['oversized', 'acidwash', 'hoodie'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSizeModalCategory(tabKey);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      sizeModalCategory === tabKey
                        ? 'bg-[#171717] text-white'
                        : 'text-[#6F6A63] hover:text-[#171717]'
                    }`}
                  >
                    {tabKey === 'oversized'
                      ? 'Drop-Shoulder (240 GSM)'
                      : tabKey === 'acidwash'
                      ? 'Acid Wash (240 GSM)'
                      : 'Hoodie (430gsm)'}
                  </button>
                ))}
              </div>

              <div className="inline-flex border-2 border-[#171717] bg-white p-1 shadow-[2px_2px_0px_#171717]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSizeUnit('in');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    sizeUnit === 'in' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                >
                  IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSizeUnit('cm');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    sizeUnit === 'cm' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border-2 border-[#171717] bg-white shadow-[3px_3px_0px_#171717]">
              <table className="size-table w-full">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    {PRODUCT_SIZE_SPECS[sizeModalCategory].isHoodie ? (
                      <th>Height</th>
                    ) : (
                      <>
                        <th>Length</th>
                        <th>Shoulder</th>
                        <th>Sleeve Length</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCT_SIZE_SPECS[sizeModalCategory].rows.map((row) => (
                    <tr key={row.size}>
                      <td className="font-mono font-black text-[#171717]">{row.size}</td>
                      <td className="font-mono">{sizeUnit === 'in' ? `${row.chest[0]}"` : `${row.chest[1]} cm`}</td>
                      {PRODUCT_SIZE_SPECS[sizeModalCategory].isHoodie ? (
                        <td className="font-mono">{sizeUnit === 'in' ? `${row.length[0]}"` : `${row.length[1]} cm`}</td>
                      ) : (
                        <>
                          <td className="font-mono">{sizeUnit === 'in' ? `${row.length[0]}"` : `${row.length[1]} cm`}</td>
                          <td className="font-mono">{sizeUnit === 'in' ? `${row.shoulder?.[0]}"` : `${row.shoulder?.[1]} cm`}</td>
                          <td className="font-mono">{sizeUnit === 'in' ? `${row.sleeve?.[0]}"` : `${row.sleeve?.[1]} cm`}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#171717]/10 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#6F6A63]">
              <span>Tolerance: ±0.5" artisan construction</span>
              <span className="font-black text-[#171717]">7-Day Doorstep Size Exchange</span>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
           ATELIER FIT ADVISOR MODAL
      ======================================================= */}
      <SizeAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        onSelectSize={(sz) => setSelectedSize(sz)}
        initialSize={selectedSize}
        garmentType={fitGuideCategory}
      />

      {/* =======================================================
           MOBILE IMMERSIVE STICKY ACTION BAR (<768px)
      ======================================================= */}
      {product && (
        <StickyMobileActionBar
          product={product}
          selectedSize={selectedSize}
          inWishlist={inWishlist}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          onShareWhatsApp={handleWhatsAppShare}
          isAdding={isAdding}
        />
      )}
    </main>
  );
}
