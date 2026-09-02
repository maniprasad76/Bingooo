import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { useWishlist, useIsInWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { GarmentMockup } from '../garment/GarmentMockup';
import type { GarmentType } from '../garment/GarmentMockup';
import { QuickViewModal } from './QuickViewModal';
import { InteractiveTilt } from '../ui/InteractiveTilt';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  customizationEnabled?: boolean;
  category?: { name: string; slug: string } | null;
  variants?: Array<{ id: string; color?: string; colorHex?: string; size?: string; inStock?: boolean }>;
  images?: Array<{ object_key: string; alt_text?: string }>;
}

export function ProductCard({
  id,
  title,
  slug,
  basePrice,
  compareAtPrice,
  customizationEnabled,
  category,
  variants = [],
}: ProductCardProps) {
  const { toggleWishlist } = useWishlist();
  const { data: wishlistData } = useIsInWishlist(id);
  const { addItem } = useCart();

  const [activeHex, setActiveHex] = useState<string>(
    variants.find((v) => v.colorHex)?.colorHex || '#121318'
  );
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const inWishlist = !!wishlistData?.inWishlist;
  const discountPct =
    compareAtPrice && compareAtPrice > basePrice
      ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)
      : null;

  const defaultVariant = variants[0];
  const uniqueColors = Array.from(
    new Map(variants.filter((v) => v.colorHex).map((v) => [v.colorHex, v])).values()
  );

  const garmentType: GarmentType =
    slug?.includes('hoodie')
      ? 'hoodie'
      : slug?.includes('jacket')
      ? 'jacket'
      : slug?.includes('tote')
      ? 'tote'
      : 'tshirt';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      addItem(defaultVariant.id, 1);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id, inWishlist);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <InteractiveTilt maxTilt={8} className="h-full">
        <div className="group relative flex h-full flex-col rounded-2xl bg-white border border-border/80 overflow-hidden shadow-card transition-all duration-500 hover:shadow-card-hover hover:border-ink/25">
          {/* Garment Visual Showcase */}
          <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-paper via-paper/80 to-paper/40 flex items-center justify-center p-6 overflow-hidden">
            <Link to={`/product/${slug}`} className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-[240px] transform transition-transform duration-700 ease-out group-hover:scale-105">
                <GarmentMockup
                  type={garmentType}
                  view="front"
                  colorHex={activeHex}
                  className="w-full h-full"
                >
                  {/* Subtle chest logo preview */}
                  <div className="flex flex-col items-center justify-center opacity-85">
                    {customizationEnabled ? (
                      <div className="border border-dashed border-brand-red/60 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <Sparkles size={10} className="text-brand-red animate-pulse" />
                        <span className="text-[8px] font-mono font-bold text-ink uppercase tracking-wider">
                          2D STUDIO
                        </span>
                      </div>
                    ) : (
                      <img src="/logo-white.png" alt="Bingooo logo mark" className="h-3 object-contain drop-shadow" />
                    )}
                  </div>
                </GarmentMockup>
              </div>
            </Link>

            {/* Badges Top-Left */}
            <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
              {customizationEnabled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-red text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles size={11} />
                  Custom Studio
                </span>
              )}
              {discountPct && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ink text-white text-[10px] font-mono font-bold tracking-wider shadow-sm">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Top-Right Quick View & Wishlist Buttons */}
            <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 z-10">
              <button
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95 text-ink hover:text-brand-red"
              >
                <Heart
                  size={16}
                  className={`transition-colors ${
                    inWishlist ? 'fill-brand-red text-brand-red' : 'text-muted hover:text-brand-red'
                  }`}
                />
              </button>

              <button
                onClick={handleQuickView}
                aria-label="Quick preview"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 hover:scale-110 active:scale-95 text-ink hover:text-brand-red"
              >
                <Eye size={16} />
              </button>
            </div>

            {/* Bottom Floating Quick Actions on Hover */}
            <div className="absolute inset-x-4 bottom-4 z-10 flex gap-2 opacity-0 translate-y-3 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              {customizationEnabled ? (
                <Link
                  to={`/customize/${slug}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-ink text-white py-2.5 text-xs font-mono font-bold uppercase tracking-wider shadow-lg hover:bg-brand-red transition-colors"
                >
                  <Sparkles size={13} />
                  Design Studio
                </Link>
              ) : (
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-ink text-white py-2.5 text-xs font-mono font-bold uppercase tracking-wider shadow-lg hover:bg-brand-red transition-colors"
                >
                  <ShoppingBag size={13} />
                  Quick Bag
                </button>
              )}
            </div>
          </div>

          {/* Product Meta & Color Swatches */}
          <div className="p-5 flex flex-1 flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                {category && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
                    {category.name}
                  </span>
                )}
                <span className="text-[10px] font-mono text-muted/80">
                  220 GSM
                </span>
              </div>

              <Link to={`/product/${slug}`}>
                <h3 className="text-body font-bold text-ink line-clamp-1 font-display group-hover:text-brand-red transition-colors">
                  {title}
                </h3>
              </Link>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-price font-bold text-ink font-mono">₹{basePrice}</span>
                {compareAtPrice && compareAtPrice > basePrice && (
                  <span className="text-caption text-muted line-through font-mono">
                    ₹{compareAtPrice}
                  </span>
                )}
              </div>

              {/* Color Swatches (Hover changes garment color instantly) */}
              {uniqueColors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {uniqueColors.slice(0, 4).map((c: any, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveHex(c.colorHex);
                      }}
                      className={`h-3.5 w-3.5 rounded-full border transition-transform ${
                        activeHex === c.colorHex
                          ? 'border-brand-red scale-125 shadow-sm ring-1 ring-brand-red'
                          : 'border-border hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      title={c.color || 'Color'}
                    />
                  ))}
                  {uniqueColors.length > 4 && (
                    <span className="text-[10px] font-mono text-muted">
                      +{uniqueColors.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </InteractiveTilt>

      {/* Quick View Modal */}
      <QuickViewModal
        product={{
          id,
          title,
          slug,
          basePrice,
          compareAtPrice,
          customizationEnabled,
          category,
          variants,
        }}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
