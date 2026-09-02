import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Heart, Check, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { addItem, isAdding } = useCart();
  const { toggleWishlist } = useWishlist();
  const { data: wishlistData } = useIsInWishlist(product?.id);

  const inWishlist = !!wishlistData?.inWishlist;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping'>('details');

  // Extract available colors and sizes
  const variants = product?.variants || [];

  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    variants.forEach((v: any) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, { name: v.color, hex: v.colorHex || '#111111' });
      }
    });
    return Array.from(map.values());
  }, [variants]);

  // Set initial selected color & size once product loads
  const activeColor = selectedColor || availableColors[0]?.name;

  const availableSizesForColor = useMemo(() => {
    return variants
      .filter((v: any) => !activeColor || v.color === activeColor)
      .map((v: any) => ({
        size: v.size,
        variantId: v.id,
        inStock: v.inStock,
        price: v.price,
      }));
  }, [variants, activeColor]);

  const activeSize = selectedSize || availableSizesForColor[0]?.size;

  const activeVariant = useMemo(() => {
    return variants.find(
      (v: any) => v.color === activeColor && v.size === activeSize,
    ) || variants[0];
  }, [variants, activeColor, activeSize]);

  if (isLoading) {
    return (
      <div className="container-page py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <Skeleton className="aspect-[4/5] rounded-xl w-full" />
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

  if (isError || !product) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="text-display-lg text-ink font-bold">Product Not Found</h2>
        <p className="mt-2 text-body text-muted">The product you are looking for might have been moved or removed.</p>
        <Link to="/shop" className="mt-6 inline-block">
          <Button variant="primary">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const currentPrice = activeVariant ? activeVariant.price : product.base_price;
  const comparePrice = product.compare_at_price;
  const discountPct = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : null;

  const isStockAvailable = activeVariant?.inStock ?? true;

  const handleAddToCart = () => {
    if (activeVariant) {
      addItem(activeVariant.id, quantity);
    }
  };

  const handleCustomise = () => {
    navigate(`/customize/${product.slug}`);
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption text-muted mb-8">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Gallery / Interactive preview - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-2xl bg-paper border border-border flex items-center justify-center overflow-hidden shadow-inner">
            {/* Garment render based on active color */}
            <div className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300">
              <div
                className="h-72 w-60 rounded-xl border flex flex-col items-center justify-center shadow-lg relative transition-colors duration-300"
                style={{
                  backgroundColor: availableColors.find((c) => c.name === activeColor)?.hex || '#111111',
                  borderColor: activeColor === 'White' ? '#E8E3DC' : 'transparent',
                }}
              >
                <span className={`text-4xl font-black tracking-widest ${activeColor === 'White' || activeColor === 'Oatmeal' || activeColor === 'Sandstone' ? 'text-ink/30' : 'text-white/30'}`}>
                  BGO
                </span>
                {product.customization_enabled && (
                  <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-dashed border-accent/80 rounded-lg flex flex-col items-center justify-center p-2 bg-accent/5 backdrop-blur-[1px]">
                    <Sparkles size={24} className="text-accent mb-1 animate-pulse" />
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider text-center">
                      Custom Print Zone
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.customization_enabled && (
                <Badge variant="accent" size="md">
                  <Sparkles size={13} className="mr-1.5" />
                  Customizable Design
                </Badge>
              )}
              {discountPct && (
                <Badge variant="danger" size="md">
                  {discountPct}% SAVINGS
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id, inWishlist)}
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 active:scale-95"
              aria-label="Toggle wishlist"
            >
              <Heart
                size={20}
                className={inWishlist ? 'fill-danger text-danger' : 'text-muted hover:text-ink'}
              />
            </button>
          </div>
        </div>

        {/* Purchase details - 5 cols */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Title */}
            <div>
              {product.category && (
                <p className="text-caption font-bold text-accent uppercase tracking-widest mb-1.5">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-display-lg font-bold text-ink text-balance">{product.title}</h1>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between py-2 border-y border-border">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-ink">₹{currentPrice}</span>
                {comparePrice && comparePrice > currentPrice && (
                  <span className="text-lg text-muted line-through">₹{comparePrice}</span>
                )}
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-1.5 text-caption">
                <div className="flex text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-semibold text-ink">4.9</span>
                <span className="text-muted">(24 reviews)</span>
              </div>
            </div>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-caption">
                  <span className="font-bold text-ink uppercase tracking-wider">Color</span>
                  <span className="text-muted">{activeColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  {availableColors.map((color) => {
                    const isSelected = activeColor === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        className={`group relative h-10 w-10 rounded-full border-2 p-0.5 transition-all ${
                          isSelected ? 'border-ink scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="flex h-full w-full items-center justify-center rounded-full border border-border/80 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              className={color.name === 'White' || color.name === 'Sandstone' || color.name === 'Oatmeal' ? 'text-ink' : 'text-white'}
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizesForColor.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-caption">
                  <span className="font-bold text-ink uppercase tracking-wider">Size</span>
                  <button className="text-accent text-xs font-semibold underline hover:text-accent-dark">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {availableSizesForColor.map((s: any) => {
                    const isSelected = activeSize === s.size;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        disabled={!s.inStock}
                        onClick={() => setSelectedSize(s.size)}
                        className={`flex h-12 flex-col items-center justify-center rounded-lg border text-caption font-bold transition-all ${
                          isSelected
                            ? 'border-ink bg-ink text-white shadow-md'
                            : s.inStock
                            ? 'border-border bg-white text-ink hover:border-ink/60'
                            : 'border-border/40 bg-paper text-muted/50 cursor-not-allowed line-through'
                        }`}
                      >
                        <span>{s.size}</span>
                        {!s.inStock && <span className="text-[9px] font-normal">Sold out</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions: Add to Cart & Customise */}
            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                {/* Quantity picker */}
                <div className="flex h-12 items-center rounded-lg border border-border bg-white px-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-muted hover:text-ink px-1 text-base font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-body font-bold text-ink">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-muted hover:text-ink px-1 text-base font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isAdding}
                  disabled={!isStockAvailable}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={18} />
                  {isStockAvailable ? 'Add to Bag' : 'Out of Stock'}
                </Button>
              </div>

              {/* Customizer Direct Button */}
              {product.customization_enabled && (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleCustomise}
                  className="bg-accent text-white hover:bg-accent-dark"
                >
                  <Sparkles size={18} />
                  Design Your Own on this Garment
                </Button>
              )}
            </div>

            {/* Value props */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border text-center">
              <div className="flex flex-col items-center p-2 rounded-lg bg-paper/60">
                <Truck size={18} className="text-ink mb-1" />
                <span className="text-[11px] font-semibold text-ink">Free Express Shipping</span>
                <span className="text-[10px] text-muted">Orders over ₹999</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-paper/60">
                <ShieldCheck size={18} className="text-ink mb-1" />
                <span className="text-[11px] font-semibold text-ink">100% Premium Cotton</span>
                <span className="text-[10px] text-muted">220 GSM combed</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-paper/60">
                <RotateCcw size={18} className="text-ink mb-1" />
                <span className="text-[11px] font-semibold text-ink">Easy 7-Day Returns</span>
                <span className="text-[10px] text-muted">Hassle-free policy</span>
              </div>
            </div>
          </div>

          {/* Details Accordion / Tabs */}
          <div className="border-t border-border pt-4">
            <div className="flex border-b border-border text-caption font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2.5 px-4 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('fabric')}
                className={`py-2.5 px-4 border-b-2 transition-colors ${
                  activeTab === 'fabric' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                Fabric & Fit
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-2.5 px-4 border-b-2 transition-colors ${
                  activeTab === 'shipping' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                Shipping & COD
              </button>
            </div>

            <div className="py-4 text-body text-muted leading-relaxed">
              {activeTab === 'details' && (
                <p>{product.description || 'Crafted with premium materials and precision tailoring for maximum everyday comfort and long-lasting style.'}</p>
              )}
              {activeTab === 'fabric' && (
                <ul className="list-disc pl-5 space-y-1 text-caption">
                  <li>220 GSM single jersey 100% ring-spun combed cotton</li>
                  <li>Bio-washed and silicone softened for a super soft hand feel</li>
                  <li>Pre-shrunk fabric to prevent post-wash shrinkage</li>
                  <li>Ribbed lycra collar that retains its shape over washes</li>
                </ul>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-2 text-caption">
                  <p>Dispatched within 24-48 business hours. Delivery in 3-5 business days across India.</p>
                  <p>Cash on Delivery (COD) available with a 30% advance deposit for custom-printed items.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
