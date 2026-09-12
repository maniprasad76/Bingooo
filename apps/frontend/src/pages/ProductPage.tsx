import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Check, CheckCircle2, Lock, Truck, RotateCcw } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { generateProductSchema } from '../lib/seo/schema';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

const DEFAULT_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=90',
  'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85',
];

const DEFAULT_RELATED = [
  {
    id: 'rel-1',
    name: 'Statement Hoodie',
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    link: '/product/heavyweight-fleece-hoodie',
  },
  {
    id: 'rel-2',
    name: 'Bold B Tee',
    price: '₹1,199',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=900&q=85',
    link: '/product/bold-signature-tee',
  },
  {
    id: 'rel-3',
    name: 'Minimal Tee',
    price: '₹1,099',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    link: '/product/minimalist-heavyweight-tee',
  },
  {
    id: 'rel-4',
    name: 'Oversized Tee',
    price: '₹1,299',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
    link: '/product/classic-oversized-tee',
  },
];

interface ReviewItem {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  title: string;
  body: string;
  date: string;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Rahul K.',
    verified: true,
    rating: 5,
    title: 'Really clean fit.',
    body: 'The fabric feels premium and the relaxed fit is exactly what I wanted. Logo is subtle and looks great.',
    date: '12 Aug 2026',
  },
  {
    id: 'rev-2',
    name: 'Arjun M.',
    verified: true,
    rating: 5,
    title: 'Better than expected.',
    body: 'Very comfortable for everyday wear. Ordered my normal size and the fit was perfect.',
    date: '04 Aug 2026',
  },
  {
    id: 'rev-3',
    name: 'Vishal R.',
    verified: true,
    rating: 4,
    title: 'Love the quality.',
    body: 'Good material and clean construction. Would definitely try another Bingooo collection.',
    date: '29 Jul 2026',
  },
];

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: remoteProduct } = useProduct(slug);
  const { addItem, isAdding } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { addProduct } = useRecentlyViewed();

  // Find local fallback product if remote is not yet loaded
  const fallbackProduct = useMemo(() => {
    if (!slug) return FALLBACK_PRODUCTS[0];
    return (
      FALLBACK_PRODUCTS.find(
        (p) => p.slug === slug || p.id === slug || p.slug.includes(slug)
      ) || FALLBACK_PRODUCTS[0]
    );
  }, [slug]);

  const product = remoteProduct || fallbackProduct;

  const { data: wishlistData } = useIsInWishlist(product?.id);
  const inWishlist = !!wishlistData?.inWishlist;

  // Track product in recently viewed
  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product, addProduct]);

  // Gallery state
  const images = useMemo<string[]>(() => {
    if (product?.images && product.images.length > 0) {
      const urls = product.images.map((img: any) =>
        typeof img === 'string' ? img : img.url || img.object_key
      );
      if (urls.length >= 4) return urls;
      return [...urls, ...DEFAULT_GALLERY_IMAGES.slice(urls.length)];
    }
    return DEFAULT_GALLERY_IMAGES;
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<{ message: string; ok: boolean } | null>(null);

  // Size modal state
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Reviews submission state
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(REVIEWS_DATA);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const price = product?.base_price ?? product?.basePrice ?? 999;
  const compareAtPrice = product?.compare_at_price ?? product?.compareAtPrice ?? Math.round(price * 1.3);
  const discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);

  const colorOptions = useMemo(() => [
    { name: 'Black', hex: '#171717' },
    { name: 'Cream', hex: '#eee6d8' },
    { name: 'Grey', hex: '#77736d' },
  ], []);

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];

  // Handle Add To Cart
  const handleAddToCart = () => {
    triggerHaptic('medium');
    const variantId = product?.variants?.[0]?.id || `var-${product?.id || 'prod'}-${selectedSize}-${selectedColor}`;
    addItem(variantId, quantity);

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

  // Handle Review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewTitle.trim() || !reviewBody.trim()) {
      toast({ title: 'Please fill in all review fields', variant: 'danger' });
      return;
    }

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: reviewName.trim(),
      verified: true,
      rating: parseInt(reviewRating, 10) || 5,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      date: 'Today',
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    setReviewName('');
    setReviewTitle('');
    setReviewBody('');
    toast({ title: 'Review submitted!', description: 'Thank you for your rating.', variant: 'success' });
  };

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased pb-[72px] sm:pb-0">
      <SEO
        title={`${product?.title || 'Classic Logo Tee'} — BINGOOO`}
        description={product?.description || "BINGOOO Men's fashion, custom designs and clothing culture."}
        canonical={`https://bingooo.in/product/${slug || 'classic-logo-tee'}`}
        schema={[generateProductSchema(product as any)]}
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
            {/* Thumbnails */}
            <div className="grid grid-cols-4 md:flex md:flex-col gap-[10px]">
              {images.slice(0, 4).map((src: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveImageIndex(i);
                  }}
                  className={`border aspect-square overflow-hidden bg-[#ede0cc] p-0 cursor-pointer transition-all ${
                    i === activeImageIndex
                      ? 'border-2 border-[#171717]'
                      : 'border-[#ddd3c5] hover:border-[#171717]'
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

            {/* Main Image */}
            <div className="relative aspect-[1/1.18] sm:aspect-[4/5] overflow-hidden bg-[#ede0cc] group">
              <div className="absolute left-[18px] top-[18px] z-10 px-[10px] py-[7px] bg-[#171717] text-white text-[9px] font-bold tracking-[0.12em] uppercase select-none">
                NEW DROP
              </div>

              <img
                src={images[activeImageIndex] || images[0]}
                alt={product?.title || 'Product Image'}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="pt-[5px]">
            {/* Meta Row: Category + Wishlist */}
            <div className="flex justify-between items-center mb-[13px]">
              <div className="text-[#6f6a63] text-[10px] font-semibold uppercase tracking-[0.14em]">
                BINGOOO / {product?.category?.name?.toUpperCase() || 'MEN / T-SHIRTS'}
              </div>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`w-[38px] h-[38px] border border-[#ddd3c5] rounded-full grid place-items-center transition-colors ${
                  inWishlist
                    ? 'bg-[#171717] text-[#e6321c] border-[#171717]'
                    : 'bg-transparent text-[#171717] hover:bg-[#171717] hover:text-white'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart size={16} className={inWishlist ? 'fill-[#e6321c] text-[#e6321c]' : 'text-current'} />
              </button>
            </div>

            {/* Title */}
            <h1 className="m-0 text-[clamp(34px,4vw,58px)] font-extrabold leading-[0.95] tracking-[-0.065em] uppercase text-[#171717]">
              {product?.title ? product.title.toUpperCase() : 'CLASSIC LOGO TEE'}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-[10px] my-5">
              <div className="flex items-center gap-0.5 text-[#171717]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-[#171717] text-[#171717]" />
                ))}
              </div>
              <a href="#reviews" className="text-[11px] underline underline-offset-[3px] text-[#171717] hover:text-[#e6321c] transition-colors">
                4.8 · {reviewsList.length} reviews
              </a>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[22px] font-bold text-[#171717]">
                ₹{price}
              </span>
              {compareAtPrice > price && (
                <>
                  <span className="text-[#6f6a63] text-[13px] line-through">
                    ₹{compareAtPrice}
                  </span>
                  <span className="px-[7px] py-1 bg-[#f4d7d2] text-[#b91f12] text-[9px] font-bold">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="m-0 mb-[25px] text-[#6f6a63] text-[10px]">
              Inclusive of all taxes.
            </p>

            {/* Scarcity / Inventory Box */}
            <div className="stock-box">
              <div className="flex justify-between items-center mb-[9px]">
                <div className="flex items-center gap-[7px] text-[10px] font-bold uppercase text-[#171717]">
                  <span className="stock-dot" />
                  LOW STOCK
                </div>
                <div className="text-[10px] font-semibold text-[#171717]">
                  4 left
                </div>
              </div>

              <div className="stock-bar">
                <div className="stock-progress w-[22%]" />
              </div>

              <p className="m-0 mt-[9px] text-[9px] text-[#6f6a63]">
                Limited availability in this selected variant.
              </p>
            </div>

            {/* Color Option */}
            <div className="my-[27px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold uppercase text-[#171717]">
                  Color
                </span>
                <span className="text-[10px] text-[#6f6a63]">
                  {selectedColor}
                </span>
              </div>

              <div className="flex gap-[9px]">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedColor(c.name);
                    }}
                    className={`color-swatch-ring ${selectedColor === c.name ? 'active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Option */}
            <div className="my-[27px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold uppercase text-[#171717]">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeModalOpen(true)}
                  className="p-0 border-0 bg-transparent text-[10px] font-bold underline underline-offset-[3px] text-[#171717] hover:text-[#e6321c] transition-colors cursor-pointer"
                >
                  SIZE CHART
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedSize(sz);
                    }}
                    className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="grid grid-cols-[115px_1fr] sm:grid-cols-[130px_1fr] gap-[10px] mt-[25px]">
              {/* Quantity */}
              <div className="h-[52px] grid grid-cols-[40px_1fr_40px] border border-[#ddd3c5] bg-transparent">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="border-0 bg-transparent text-[18px] text-[#171717] hover:text-[#e6321c] transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-full border-0 bg-transparent text-center outline-none text-[12px] font-bold text-[#171717]"
                  aria-label="Current quantity"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(4, q + 1))}
                  className="border-0 bg-transparent text-[18px] text-[#171717] hover:text-[#e6321c] transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add To Cart */}
              <button
                type="button"
                disabled={isAdding}
                onClick={handleAddToCart}
                className="btn btn-black h-[52px] w-full"
              >
                {isAddedFeedback ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span>ADDED</span>
                    <Check size={14} />
                  </span>
                ) : isAdding ? (
                  'ADDING…'
                ) : (
                  'ADD TO CART'
                )}
              </button>
            </div>

            {/* Purchase Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] mt-[10px]">
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-red h-[52px] w-full"
              >
                BUY IT NOW →
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className="btn btn-black h-[52px] w-full"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Heart size={14} className={inWishlist ? 'fill-white text-white' : 'text-current'} />
                  <span>{inWishlist ? 'SAVED' : 'SAVE'}</span>
                </span>
              </button>
            </div>

            {/* Delivery Check */}
            <div className="mt-[28px] pt-[25px] border-t border-[#ddd3c5]">
              <h3 className="m-0 mb-[11px] text-[11px] font-bold uppercase text-[#171717]">
                Check Delivery
              </h3>

              <form onSubmit={handleCheckDelivery} className="flex max-w-[420px]">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter PIN code"
                  className="flex-1 h-[46px] border border-[#ddd3c5] px-[14px] bg-white outline-none text-[11px] text-[#171717] focus:border-[#171717] transition-colors"
                />
                <button
                  type="submit"
                  className="border-0 px-[18px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
                >
                  CHECK
                </button>
              </form>

              {deliveryResult && (
                <div
                  className="mt-[10px] text-[10px] font-medium"
                  style={{ color: deliveryResult.ok ? '#238636' : '#c62828' }}
                >
                  {deliveryResult.message}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-[25px] grid gap-[11px]">
              <div className="flex items-center gap-3 text-[10px] text-[#171717]">
                <div className="w-[25px] h-[25px] border border-[#ddd3c5] grid place-items-center shrink-0">
                  <Check size={13} className="text-[#171717]" />
                </div>
                <span>Premium cotton fabric</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#171717]">
                <div className="w-[25px] h-[25px] border border-[#ddd3c5] grid place-items-center shrink-0">
                  <RotateCcw size={13} className="text-[#171717]" />
                </div>
                <span>Easy 15-day returns</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#171717]">
                <div className="w-[25px] h-[25px] border border-[#ddd3c5] grid place-items-center shrink-0">
                  <Lock size={13} className="text-[#171717]" />
                </div>
                <span>Secure payments</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#171717]">
                <div className="w-[25px] h-[25px] border border-[#ddd3c5] grid place-items-center shrink-0">
                  <Truck size={13} className="text-[#171717]" />
                </div>
                <span>Fast delivery across India</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =======================================================
           PRODUCT DETAILS
      ======================================================= */}
      <section className="py-[65px] sm:py-[80px] border-t border-[#ddd3c5]">
        <div className="container-bingooo grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-[35px] lg:gap-[100px]">
          <div>
            <div className="eyebrow text-[#171717]">
              THE DETAILS
            </div>
            <h2 className="m-0 mt-2 text-[clamp(34px,4vw,55px)] font-extrabold leading-[0.92] tracking-[-0.06em] uppercase text-[#171717]">
              DETAILS<br />
              MATTER.
            </h2>
          </div>

          <div>
            <p className="max-w-[700px] text-[12px] sm:text-[13px] leading-[1.8] text-[#6f6a63] m-0">
              Designed for everyday movement and built around effortless styling. The Classic Logo Tee combines premium cotton, a relaxed silhouette and the signature BINGOOO identity.
            </p>

            <div className="mt-[35px] grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-[#ddd3c5]">
              <div className="p-[22px] bg-[#f7eedb]">
                <h3 className="m-0 mb-[7px] text-[11px] font-bold uppercase text-[#171717]">
                  Fabric
                </h3>
                <p className="m-0 text-[10px] text-[#6f6a63] leading-[1.6]">
                  Premium 240 GSM combed cotton jersey with a soft, breathable finish.
                </p>
              </div>

              <div className="p-[22px] bg-[#f7eedb]">
                <h3 className="m-0 mb-[7px] text-[11px] font-bold uppercase text-[#171717]">
                  Fit
                </h3>
                <p className="m-0 text-[10px] text-[#6f6a63] leading-[1.6]">
                  Relaxed everyday fit with comfortable proportions and drop shoulder drape.
                </p>
              </div>

              <div className="p-[22px] bg-[#f7eedb]">
                <h3 className="m-0 mb-[7px] text-[11px] font-bold uppercase text-[#171717]">
                  Design
                </h3>
                <p className="m-0 text-[10px] text-[#6f6a63] leading-[1.6]">
                  Signature Bingooo branding with clean minimal chest and collar detailing.
                </p>
              </div>

              <div className="p-[22px] bg-[#f7eedb]">
                <h3 className="m-0 mb-[7px] text-[11px] font-bold uppercase text-[#171717]">
                  Care
                </h3>
                <p className="m-0 text-[10px] text-[#6f6a63] leading-[1.6]">
                  Machine wash cold. Wash inside out. Do not iron directly on print.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           SIZE GUIDE SECTION
      ======================================================= */}
      <section className="py-[80px] bg-[#ede0cc]">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-[30px]">
            <div>
              <div className="eyebrow text-[#171717]">
                FIT GUIDE
              </div>
              <h2 className="m-0 mt-2 text-[clamp(32px,4vw,52px)] leading-[0.95] font-extrabold tracking-[-0.06em] uppercase text-[#171717]">
                FIND YOUR<br />
                FIT.
              </h2>
            </div>

            <div className="mono text-[11px] font-semibold text-[#171717] tracking-wider">
              MEASUREMENTS / CM
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Shoulder</th>
                  <th>Length</th>
                  <th>Sleeve</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold">XS</td>
                  <td>96</td>
                  <td>42</td>
                  <td>66</td>
                  <td>20</td>
                </tr>
                <tr>
                  <td className="font-bold">S</td>
                  <td>102</td>
                  <td>44</td>
                  <td>68</td>
                  <td>21</td>
                </tr>
                <tr>
                  <td className="font-bold">M</td>
                  <td>108</td>
                  <td>46</td>
                  <td>70</td>
                  <td>22</td>
                </tr>
                <tr>
                  <td className="font-bold">L</td>
                  <td>114</td>
                  <td>48</td>
                  <td>72</td>
                  <td>23</td>
                </tr>
                <tr>
                  <td className="font-bold">XL</td>
                  <td>120</td>
                  <td>50</td>
                  <td>74</td>
                  <td>24</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =======================================================
           REVIEWS SECTION
      ======================================================= */}
      <section className="py-[65px] sm:py-[100px]" id="reviews">
        <div className="container-bingooo">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-[45px]">
            <div>
              <div className="eyebrow text-[#171717]">
                CUSTOMER REVIEWS
              </div>
              <h2 className="m-0 mt-2 text-[clamp(38px,5vw,64px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
                WHAT PEOPLE<br />
                SAY.
              </h2>
            </div>

            <div className="flex items-center gap-[15px]">
              <div className="text-[45px] font-extrabold leading-none text-[#171717]">
                4.8
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[#171717]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-[#171717] text-[#171717]" />
                  ))}
                </div>
                <small className="text-[#6f6a63] text-[10px]">
                  Based on {reviewsList.length * 42} reviews
                </small>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="max-w-[480px] mb-[50px]">
            <div className="grid grid-cols-[50px_1fr_40px] items-center gap-[10px] mb-[9px] text-[10px] text-[#171717]">
              <span className="inline-flex items-center gap-1">5 <Star size={10} className="fill-[#171717] text-[#171717]" /></span>
              <div className="rating-track">
                <div className="rating-fill w-[78%]" />
              </div>
              <span>78%</span>
            </div>

            <div className="grid grid-cols-[50px_1fr_40px] items-center gap-[10px] mb-[9px] text-[10px] text-[#171717]">
              <span className="inline-flex items-center gap-1">4 <Star size={10} className="fill-[#171717] text-[#171717]" /></span>
              <div className="rating-track">
                <div className="rating-fill w-[14%]" />
              </div>
              <span>14%</span>
            </div>

            <div className="grid grid-cols-[50px_1fr_40px] items-center gap-[10px] mb-[9px] text-[10px] text-[#171717]">
              <span className="inline-flex items-center gap-1">3 <Star size={10} className="fill-[#171717] text-[#171717]" /></span>
              <div className="rating-track">
                <div className="rating-fill w-[5%]" />
              </div>
              <span>5%</span>
            </div>

            <div className="grid grid-cols-[50px_1fr_40px] items-center gap-[10px] mb-[9px] text-[10px] text-[#171717]">
              <span className="inline-flex items-center gap-1">2 <Star size={10} className="fill-[#171717] text-[#171717]" /></span>
              <div className="rating-track">
                <div className="rating-fill w-[2%]" />
              </div>
              <span>2%</span>
            </div>

            <div className="grid grid-cols-[50px_1fr_40px] items-center gap-[10px] mb-[9px] text-[10px] text-[#171717]">
              <span className="inline-flex items-center gap-1">1 <Star size={10} className="fill-[#171717] text-[#171717]" /></span>
              <div className="rating-track">
                <div className="rating-fill w-[1%]" />
              </div>
              <span>1%</span>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviewsList.map((rev) => (
              <article key={rev.id} className="p-[25px] bg-[#faf6ee] border border-[#ddd3c5]">
                <div className="flex justify-between items-center mb-[13px]">
                  <div className="text-[11px] font-bold text-[#171717]">
                    {rev.name}
                  </div>
                  {rev.verified && (
                    <div className="text-[#238636] text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-0.5 mb-[13px] text-[#171717]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= rev.rating ? 'fill-[#171717] text-[#171717]' : 'text-[#ddd3c5]'}
                    />
                  ))}
                </div>

                <h3 className="m-0 mb-2 text-[13px] font-bold text-[#171717]">
                  {rev.title}
                </h3>

                <p className="m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                  {rev.body}
                </p>

                <div className="mt-5 text-[9px] text-[#6f6a63]">
                  {rev.date}
                </div>
              </article>
            ))}
          </div>

          {/* Write Review */}
          <div className="mt-[35px] p-[24px] sm:p-[35px] border border-[#ddd3c5] bg-[#f7eedb]">
            <h3 className="m-0 mb-[18px] text-[18px] font-bold text-[#171717]">
              Share your experience
            </h3>

            {reviewSubmitted ? (
              <div className="p-4 bg-white border border-[#ddd3c5] text-xs font-semibold text-[#171717] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0" />
                <span>Thank you! Your review has been submitted and posted.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="grid gap-3 max-w-[700px]">
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-[#ddd3c5] bg-white p-[13px] outline-none text-[11px] text-[#171717] focus:border-[#171717]"
                />

                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  className="w-full border border-[#ddd3c5] bg-white p-[13px] outline-none text-[11px] text-[#171717] focus:border-[#171717]"
                >
                  <option value="5">5 Stars — Excellent</option>
                  <option value="4">4 Stars — Great</option>
                  <option value="3">3 Stars — Average</option>
                  <option value="2">2 Stars — Below Average</option>
                  <option value="1">1 Star — Poor</option>
                </select>

                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review title"
                  className="w-full border border-[#ddd3c5] bg-white p-[13px] outline-none text-[11px] text-[#171717] focus:border-[#171717]"
                />

                <textarea
                  required
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Tell us about the product..."
                  className="w-full border border-[#ddd3c5] bg-white p-[13px] outline-none text-[11px] text-[#171717] min-h-[120px] resize-y focus:border-[#171717]"
                />

                <div>
                  <button type="submit" className="btn btn-black w-full sm:w-auto">
                    SUBMIT REVIEW →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =======================================================
           RELATED PRODUCTS
      ======================================================= */}
      <section className="py-[65px] sm:py-[100px]">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-[35px]">
            <div>
              <div className="eyebrow text-[#171717]">
                COMPLETE THE FIT
              </div>
              <h2 className="m-0 mt-2 text-[clamp(36px,4vw,58px)] font-extrabold tracking-[-0.06em] leading-[0.9] uppercase text-[#171717]">
                YOU MAY<br />
                ALSO LIKE.
              </h2>
            </div>

            <Link to="/shop" className="text-link">
              VIEW ALL →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-[18px]">
            {DEFAULT_RELATED.map((item) => (
              <article key={item.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ede0cc]">
                  <Link to={item.link} className="block h-full w-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </Link>
                </div>

                <div className="pt-[13px]">
                  <p className="m-0 mb-[5px] text-[12px] font-semibold text-[#171717]">
                    <Link to={item.link} className="hover:text-[#e6321c] transition-colors">
                      {item.name}
                    </Link>
                  </p>
                  <p className="m-0 text-[13px] font-bold text-[#171717]">
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
          <div className="w-[min(760px,100%)] max-h-[90vh] overflow-auto bg-[#f7eedb] p-6 sm:p-[30px] border border-[#ddd3c5] shadow-2xl relative">
            <div className="flex justify-between items-center mb-[25px]">
              <h2 id="sizeModalTitle" className="m-0 text-[28px] font-extrabold tracking-[-0.04em] uppercase text-[#171717]">
                Size Chart
              </h2>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="w-[35px] h-[35px] border border-[#ddd3c5] bg-transparent text-[20px] leading-none text-[#171717] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer grid place-items-center"
                aria-label="Close size chart"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Shoulder</th>
                    <th>Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold">XS</td>
                    <td>96 cm</td>
                    <td>42 cm</td>
                    <td>66 cm</td>
                  </tr>
                  <tr>
                    <td className="font-bold">S</td>
                    <td>102 cm</td>
                    <td>44 cm</td>
                    <td>68 cm</td>
                  </tr>
                  <tr>
                    <td className="font-bold">M</td>
                    <td>108 cm</td>
                    <td>46 cm</td>
                    <td>70 cm</td>
                  </tr>
                  <tr>
                    <td className="font-bold">L</td>
                    <td>114 cm</td>
                    <td>48 cm</td>
                    <td>72 cm</td>
                  </tr>
                  <tr>
                    <td className="font-bold">XL</td>
                    <td>120 cm</td>
                    <td>50 cm</td>
                    <td>74 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
           MOBILE STICKY CART (<520px)
      ======================================================= */}
      <div className="fixed sm:hidden grid grid-cols-2 gap-2 bottom-0 left-0 right-0 z-40 p-2.5 bg-[#f7eedb]/95 border-t border-[#ddd3c5] backdrop-blur-md">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn btn-black h-[46px] w-full text-[10px]"
        >
          {isAddedFeedback ? (
            <span className="inline-flex items-center gap-1">
              <span>ADDED</span>
              <Check size={12} />
            </span>
          ) : (
            'ADD TO CART'
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="btn btn-red h-[46px] w-full text-[10px]"
        >
          BUY NOW
        </button>
      </div>
    </main>
  );
}
