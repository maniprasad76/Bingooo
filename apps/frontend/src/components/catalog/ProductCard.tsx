import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist, useIsInWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';

import { QuickViewModal } from './QuickViewModal';
import { InteractiveTilt } from '../ui/InteractiveTilt';
import { ProductPlaceholder } from '../ui/ProductPlaceholder';

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

  const mainImage =
    images?.[0]?.url ||
    images?.[0]?.object_key ||
    (typeof images?.[0] === 'string' ? images[0] : null) ||
    '';

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
          {/* Product Image Showcase */}
          <div className="relative aspect-[4/5] w-full bg-[#EDE0CC] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <Link to={`/product/${slug}`} className="w-full h-full flex items-center justify-center">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={title}
                  className="h-full w-full object-contain p-1 sm:p-2 transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <ProductPlaceholder name={title} category={category?.name} />
              )}
            </Link>

            {/* Badges Top-Left */}
            <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 flex flex-col gap-1 z-10">
              {bestseller && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500 text-black text-[8px] sm:text-[9px] font-sans font-extrabold uppercase tracking-wider shadow-sm">
                  BESTSELLER
                </span>
              )}
              {badgeText ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#171717] text-white text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider shadow-sm">
                  {badgeText}
                </span>
              ) : !bestseller && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#171717] text-white text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider shadow-sm">
                  ESSENTIAL
                </span>
              )}
              {customizationEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#E6321C] text-white text-[8px] sm:text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles size={10} />
                  Custom
                </span>
              )}
              {saleTag ? (
                <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded-full bg-[#E6321C] text-white text-[8px] sm:text-[10px] font-sans font-bold tracking-wider shadow-sm">
                  {saleTag}
                </span>
              ) : discountPct ? (
                <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded-full bg-[#E6321C] text-white text-[8px] sm:text-[10px] font-sans font-bold tracking-wider shadow-sm">
                  {discountPct}% OFF
                </span>
              ) : null}
            </div>

            {/* Top-Right Quick View & Wishlist Buttons */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 shadow-2xs backdrop-blur-md text-ink hover:text-brand-red"
              >
                <motion.div
                  animate={inWishlist ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    size={13}
                    className={`transition-colors ${
                      inWishlist ? 'fill-brand-red text-brand-red' : 'text-muted hover:text-brand-red'
                    }`}
                  />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleQuickView}
                aria-label="Quick preview"
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-2xs backdrop-blur-md opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-ink hover:text-brand-red"
              >
                <Eye size={14} />
              </motion.button>
            </div>

            {/* Bottom Floating Quick Actions on Hover (Desktop only) */}
            <div className="hidden sm:flex absolute inset-x-3.5 bottom-3.5 z-10 gap-1.5 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              {customizationEnabled ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1 flex">
                  <Link
                    to={`/customize/${slug}`}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#171717] text-white py-2 text-[11px] font-sans font-semibold uppercase tracking-wide shadow-md hover:bg-[#E6321C] transition-colors"
                  >
                    <Sparkles size={12} />
                    Design Studio
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleQuickAdd}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#171717] text-white py-2 text-[11px] font-sans font-semibold uppercase tracking-wide shadow-md hover:bg-[#E6321C] transition-colors"
                >
                  <ShoppingBag size={12} />
                  Quick Bag
                </motion.button>
              )}
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
                  220 GSM
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
                    <motion.button
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
