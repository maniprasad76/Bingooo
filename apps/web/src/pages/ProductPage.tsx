import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Check,
  ShieldCheck,
  Truck,
  RotateCw,
  Star,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { GarmentMockup } from '../components/garment/GarmentMockup';
import type { GarmentType, GarmentView } from '../components/garment/GarmentMockup';
import { InteractiveTilt } from '../components/ui/InteractiveTilt';
import { useToast } from '../components/ui/Toast';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { addItem, isAdding } = useCart();
  const { toggleWishlist } = useWishlist();
  const { data: wishlistData } = useIsInWishlist(product?.id);
  const { toast } = useToast();

  const inWishlist = !!wishlistData?.inWishlist;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<GarmentView>('front');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping'>('details');

  const variants = product?.variants || [];

  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    variants.forEach((v: any) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, { name: v.color, hex: v.colorHex || '#121318' });
      }
    });
    if (map.size === 0) {
      map.set('Obsidian Black', { name: 'Obsidian Black', hex: '#121318' });
      map.set('Snow White', { name: 'Snow White', hex: '#FFFFFF' });
    }
    return Array.from(map.values());
  }, [variants]);

  const activeColor = selectedColor || availableColors[0]?.name;
  const activeColorHex = availableColors.find((c) => c.name === activeColor)?.hex || '#121318';

  const availableSizesForColor = useMemo(() => {
    const matched = variants.filter((v: any) => !activeColor || v.color === activeColor);
    if (matched.length > 0) {
      return matched.map((v: any) => ({
        size: v.size,
        variantId: v.id,
        inStock: v.inStock,
        price: v.price,
      }));
    }
    return ['S', 'M', 'L', 'XL', 'XXL'].map((sz) => ({
      size: sz,
      variantId: `temp_${sz}`,
      inStock: true,
      price: product?.base_price || 1499,
    }));
  }, [variants, activeColor, product]);

  const activeSize = selectedSize || availableSizesForColor[0]?.size || 'L';

  const activeVariant = useMemo(() => {
    return (
      variants.find((v: any) => v.color === activeColor && v.size === activeSize) ||
      variants[0]
    );
  }, [variants, activeColor, activeSize]);

  if (isLoading) {
    return (
      <div className="container-page py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <Skeleton className="aspect-[4/5] rounded-3xl w-full" />
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
        <h2 className="text-display-lg text-ink font-bold font-display">Product Not Found</h2>
        <p className="mt-2 text-body text-muted font-sans">
          The requested silhouette might have been archived.
        </p>
        <Link to="/shop" className="mt-6 inline-block">
          <Button variant="primary" className="bg-brand-red font-mono font-bold">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const garmentType: GarmentType =
    product.slug?.includes('hoodie')
      ? 'hoodie'
      : product.slug?.includes('jacket')
      ? 'jacket'
      : product.slug?.includes('tote')
      ? 'tote'
      : 'tshirt';

  const currentPrice = activeVariant ? activeVariant.price : product.base_price;
  const comparePrice = product.compare_at_price;
  const discountPct =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (activeVariant) {
      addItem(activeVariant.id, quantity);
      toast({
        title: 'Added to Bag',
        description: `${product.title} (${activeSize}) added`,
        variant: 'success',
      });
    }
  };

  const handleCustomise = () => {
    navigate(`/customize/${product.slug}`);
  };

  return (
    <div className="container-wide py-8 sm:py-12 bg-paper">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-caption font-mono text-muted mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-brand-red">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-red">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-red">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink font-bold truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Gallery / Interactive Garment Canvas - 7 cols */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <InteractiveTilt maxTilt={8} className="w-full">
            <div className="relative aspect-[4/5] w-full rounded-3xl bg-gradient-to-b from-white to-paper border border-border flex items-center justify-center overflow-hidden shadow-card p-8">
              {/* Garment Mockup Silhouette */}
              <div className="w-full max-w-md aspect-[4/5] flex items-center justify-center">
                <GarmentMockup
                  type={garmentType}
                  view={currentView}
                  colorHex={activeColorHex}
                  className="w-full h-full max-h-[460px]"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    {product.customization_enabled ? (
                      <div className="border border-dashed border-brand-red/80 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                        <Sparkles size={13} className="text-brand-red animate-pulse" />
                        <span className="text-[9px] font-mono font-bold text-ink uppercase tracking-widest">
                          2D STUDIO ZONE
                        </span>
                      </div>
                    ) : (
                      <img src="/logo-white.png" alt="Bingooo emblem" className="h-4 object-contain opacity-90 drop-shadow" />
                    )}
                  </div>
                </GarmentMockup>
              </div>

              {/* Badges Top-Left */}
              <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                {product.customization_enabled && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow">
                    <Sparkles size={12} />
                    Customizable in Studio
                  </span>
                )}
                {discountPct && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ink text-white text-xs font-mono font-bold tracking-wider">
                    {discountPct}% SAVINGS
                  </span>
                )}
              </div>

              {/* View Flip Button Top-Right */}
              <button
                onClick={() => setCurrentView(currentView === 'front' ? 'back' : 'front')}
                className="absolute top-5 right-5 z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 shadow-sm border border-border text-xs font-mono font-bold text-ink hover:bg-ink hover:text-white transition-all backdrop-blur-sm"
              >
                <RotateCw size={13} />
                <span>FLIP TO {currentView === 'front' ? 'BACK' : 'FRONT'}</span>
              </button>

              {/* Wishlist Button Bottom-Right */}
              <button
                onClick={() => toggleWishlist(product.id, inWishlist)}
                className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md transition-transform hover:scale-110 active:scale-95 text-ink hover:text-brand-red"
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={20}
                  className={inWishlist ? 'fill-brand-red text-brand-red' : 'text-muted hover:text-brand-red'}
                />
              </button>
            </div>
          </InteractiveTilt>

          <div className="mt-4 flex items-center gap-6 text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-brand-red" /> 220 GSM HEAVYWEIGHT
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={16} className="text-brand-red" /> EXPRESS AIR SHIPPING
            </span>
            <span className="flex items-center gap-1.5">
              <Layers size={16} className="text-brand-red" /> BIO-POLISHED COTTON
            </span>
          </div>
        </div>

        {/* Purchase details - 5 cols */}
        <div className="lg:col-span-5 bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {product.category && (
                <span className="text-[11px] font-mono font-bold text-brand-red uppercase tracking-widest">
                  {product.category.name}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-xs font-mono text-ink">
                <Star size={14} className="fill-accent-gold text-accent-gold" />
                <span className="font-bold">4.9</span>
                <span className="text-muted">(48 verified drops)</span>
              </div>
            </div>

            <h1 className="text-display-lg font-black text-ink font-display leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-ink font-mono">₹{currentPrice}</span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-lg text-muted line-through font-mono">₹{comparePrice}</span>
              )}
            </div>
          </div>

          {/* Colorway Selection */}
          {availableColors.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-ink uppercase tracking-wider">Colorway</span>
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
                      className={`relative h-10 w-10 rounded-full border-2 transition-transform ${
                        isSelected
                          ? 'border-brand-red scale-110 shadow-glow ring-2 ring-brand-red/40'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <Check
                          size={14}
                          className={`mx-auto ${
                            color.name === 'White' || color.name === 'Sandstone' || color.name === 'Oatmeal'
                              ? 'text-ink'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {availableSizesForColor.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-ink uppercase tracking-wider">Select Size</span>
                <span className="text-muted text-[11px]">Relaxed Fit</span>
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
                      className={`h-11 rounded-xl font-mono text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-ink text-white shadow-md'
                          : s.inStock
                          ? 'bg-paper text-ink border border-border hover:border-ink'
                          : 'bg-paper/40 text-muted line-through cursor-not-allowed'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex gap-3">
              {/* Quantity Picker */}
              <div className="flex h-12 items-center rounded-xl border border-border bg-paper px-3 font-mono font-bold">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-muted hover:text-ink px-2 text-base"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs text-ink">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-muted hover:text-ink px-2 text-base"
                >
                  +
                </button>
              </div>

              {/* Add to Bag */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isAdding}
                onClick={handleAddToCart}
                className="bg-brand-red hover:bg-brand-red-hover text-white shadow-glow font-mono font-bold text-sm tracking-wider"
              >
                <ShoppingBag size={18} />
                ADD TO BAG — ₹{currentPrice * quantity}
              </Button>
            </div>

            {/* Customizer Studio Launch */}
            {product.customization_enabled && (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleCustomise}
                className="border-ink text-ink hover:bg-ink hover:text-white font-mono font-bold text-sm tracking-wider py-4"
              >
                <Sparkles size={18} className="text-brand-red" />
                CUSTOMISE IN 2D STUDIO
                <ArrowRight size={16} />
              </Button>
            )}
          </div>

          {/* Tabs / Specifications */}
          <div className="border-t border-border pt-4">
            <div className="flex border-b border-border text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-brand-red text-brand-red' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                Specs
              </button>
              <button
                onClick={() => setActiveTab('fabric')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'fabric' ? 'border-brand-red text-brand-red' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                Fabric
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'shipping' ? 'border-brand-red text-brand-red' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                Dispatch
              </button>
            </div>

            <div className="py-3 text-caption text-muted font-sans leading-relaxed">
              {activeTab === 'details' && (
                <p>
                  {product.description ||
                    'Engineered with heavyweight organic combed cotton, featuring drop-shoulder proportions, precision flatlock seams, and high-density Japanese pigment inks.'}
                </p>
              )}
              {activeTab === 'fabric' && (
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                  <li>220 GSM single jersey 100% ring-spun combed cotton</li>
                  <li>Bio-polished silicone wash for butter-soft handfeel</li>
                  <li>Pre-shrunk fabric to prevent post-wash deformation</li>
                  <li>Heavy-duty 1x1 ribbed neck collar with twin-needle stitch</li>
                </ul>
              )}
              {activeTab === 'shipping' && (
                <p className="font-mono text-[11px]">
                  Dispatched in 24-48 hours. Express Air delivery in 3-5 business days across India. Cash on Delivery (COD) available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
