import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { m } from 'framer-motion';
import { useWishlist, useIsInWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';

import { QuickViewModal } from './QuickViewModal';
import { InteractiveTilt } from '../ui/InteractiveTilt';
import { ProductPlaceholder } from '../ui/ProductPlaceholder';
import { resolveImageUrl } from '../../lib/utils';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  customizationEnabled?: boolean;
  category?: { name: string; slug: string } | null;
  variants?: Array<{ id: string; color?: string; colorHex?: string; size?: string; inStock?: boolean }>;
  images?: Array<{ url?: string; object_key?: string; alt_text?: string }>;
  bestseller?: boolean;
  saleTag?: string | null;
  badgeText?: string | null;
  imageUrl?: string;
  image_url?: string;
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
  images = [],
  bestseller = false,
  saleTag,
  badgeText,
  imageUrl,
  image_url,
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

  const [imgError, setImgError] = useState(false);

  const rawMainImage =
    images?.[0]?.url ||
    images?.[0]?.object_key ||
    (typeof images?.[0] === 'string' ? images[0] : null) ||
    imageUrl ||
    image_url ||
    '';
  const mainImage = resolveImageUrl(rawMainImage);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      const gsmVal =
        (title || '').toLowerCase().includes('hoodie') ||
        (category?.name || '').toLowerCase().includes('hoodie')
          ? '430 GSM'
          : '240 GSM';

      addItem(defaultVariant.id, 1, undefined, {
        title,
        image: mainImage,
        color: defaultVariant.color || '',
        size: defaultVariant.size || 'M',
        category: category?.name || 'APPAREL',
        gsm: gsmVal,
        slug,
        price: (defaultVariant as any).price || basePrice,
      });
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
      <InteractiveTilt maxTilt={6} className="h-full">
        <div className="group relative flex h-full flex-col bg-white border-2 border-[#171717] overflow-hidden shadow-[4px_4px_0px_#171717] transition-all duration-200 hover:shadow-[6px_6px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5">
          {/* Product Image Showcase */}
          <div className="relative aspect-[4/5] w-full bg-[#EDE0CC] border-b-2 border-[#171717] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <Link to={`/product/${slug}`} className="w-full h-full flex items-center justify-center">
              {mainImage && !imgError ? (
                <img
                  src={mainImage}
                  alt={title}
                  className="h-full w-full object-contain p-1 sm:p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              ) : (
                <ProductPlaceholder name={title} category={category?.name} />
              )}
            </Link>

            {/* Badges Top-Left */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
              {bestseller && (
                <span className="inline-flex items-center px-2 py-0.5 border border-[#171717] bg-amber-400 text-black text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider shadow-[1px_1px_0px_#171717]">
                  BESTSELLER
                </span>
              )}
              {badgeText ? (
                <span className="inline-flex items-center px-2 py-0.5 border border-[#171717] bg-[#171717] text-white text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider shadow-[1px_1px_0px_#171717]">
                  {badgeText}
                </span>
              ) : !bestseller && (
                <span className="inline-flex items-center px-2 py-0.5 border border-[#171717] bg-[#171717] text-white text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider shadow-[1px_1px_0px_#171717]">
                  ESSENTIAL
                </span>
              )}
              {saleTag ? (
                <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 border border-[#171717] bg-[#E6321C] text-white text-[8px] sm:text-[9px] font-mono font-bold tracking-wider shadow-[1px_1px_0px_#171717]">
                  {saleTag}
                </span>
              ) : discountPct ? (
                <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 border border-[#171717] bg-[#E6321C] text-white text-[8px] sm:text-[9px] font-mono font-bold tracking-wider shadow-[1px_1px_0px_#171717]">
                  {discountPct}% OFF
                </span>
              ) : null}
            </div>

            {/* Top-Right Quick View & Wishlist Buttons */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10">
              <m.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center border-2 border-[#171717] bg-white text-[#171717] hover:bg-[#E6321C] hover:text-white shadow-[2px_2px_0px_#171717] transition-colors"
              >
                <m.div
                  animate={inWishlist ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    size={13}
                    className={`transition-colors ${
                      inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]'
                    }`}
                  />
                </m.div>
              </m.button>

              <m.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleQuickView}
                aria-label="Quick preview"
                className="hidden sm:flex h-8 w-8 items-center justify-center border-2 border-[#171717] bg-white text-[#171717] hover:bg-[#171717] hover:text-white shadow-[2px_2px_0px_#171717] opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
              >
                <Eye size={14} />
              </m.button>
            </div>

            {/* Bottom Floating Quick Actions on Hover (Desktop only) */}
            <div className="hidden sm:flex absolute inset-x-3.5 bottom-3.5 z-10 gap-1.5 opacity-0 translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleQuickAdd}
                className="flex-1 flex items-center justify-center gap-1.5 border-2 border-[#171717] bg-[#171717] text-white py-2 text-[11px] font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#E6321C] transition-colors"
              >
                <ShoppingBag size={12} />
                Quick Bag
              </m.button>
            </div>
          </div>

          {/* Product Meta & Color Swatches */}
          <div className="p-2.5 sm:p-4 lg:p-5 flex flex-1 flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-1">
                {category && (
                  <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-[#6F6A63] truncate max-w-[70%]">
                    {category.name}
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] font-sans font-semibold text-[#6F6A63]/80 shrink-0">
                  {(title || '').toLowerCase().includes('hoodie') ||
                  (category?.name || '').toLowerCase().includes('hoodie')
                    ? '430 GSM'
                    : '240 GSM'}
                </span>
              </div>

              <Link to={`/product/${slug}`}>
                <h3 className="text-xs sm:text-sm font-bold text-[#171717] line-clamp-1 font-sans group-hover:text-[#E6321C] transition-colors">
                  {title}
                </h3>
              </Link>
              {/* Scarcity / Essential Indicator */}
              <div className="mt-1 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#B91F12] font-semibold truncate">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E6321C] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#E6321C]"></span>
                </span>
                <span className="truncate">Essential • Few Left</span>
              </div>
            </div>

            <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-between gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#171717] font-sans">₹{basePrice}</span>
                {compareAtPrice && compareAtPrice > basePrice && (
                  <span className="text-[10px] sm:text-xs text-[#6F6A63] line-through font-sans">
                    ₹{compareAtPrice}
                  </span>
                )}
              </div>

              {/* Color Swatches */}
              {uniqueColors.length > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {uniqueColors.slice(0, 3).map((c: any, i) => (
                    <m.button
                      key={i}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveHex(c.colorHex);
                      }}
                      className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full border transition-transform ${
                        activeHex === c.colorHex
                          ? 'border-brand-red scale-125 shadow-sm ring-1 ring-brand-red'
                          : 'border-border hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      title={c.color || 'Color'}
                    />
                  ))}
                  {uniqueColors.length > 3 && (
                    <span className="text-[9px] sm:text-[10px] font-mono text-muted">
                      +{uniqueColors.length - 3}
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
