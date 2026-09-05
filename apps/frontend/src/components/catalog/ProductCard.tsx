import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist, useIsInWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';

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
  images?: Array<{ url?: string; object_key?: string; alt_text?: string }>;
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
    (slug.includes('graphic')
      ? '/custom/tshirt-step-3-black.png'
      : slug.includes('classic')
      ? '/custom/tshirt-step-1.png'
      : slug.includes('hoodie')
      ? '/custom/tshirt-step-2.png'
      : '/custom/tshirt-step-1.png');

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
              <img
                src={mainImage}
                alt={title}
                className="h-full w-full object-contain p-1 sm:p-2 transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </Link>

            {/* Badges Top-Left */}
            <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 flex flex-col gap-1 z-10">
              {customizationEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#E6321C] text-white text-[8px] sm:text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles size={10} />
                  Custom
                </span>
              )}
              {discountPct && (
                <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded-full bg-[#171717] text-white text-[8px] sm:text-[10px] font-sans font-bold tracking-wider shadow-sm">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Top-Right Quick View & Wishlist Buttons */}
            <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 flex flex-col gap-1.5 sm:gap-2 z-10">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md text-ink hover:text-brand-red"
              >
                <motion.div
                  animate={inWishlist ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    size={14}
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
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-ink hover:text-brand-red"
              >
                <Eye size={16} />
              </motion.button>
            </div>

            {/* Bottom Floating Quick Actions on Hover (Desktop only) */}
            <div className="hidden sm:flex absolute inset-x-4 bottom-4 z-10 gap-2 opacity-0 translate-y-3 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
              {customizationEnabled ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1 flex">
                  <Link
                    to={`/customize/${slug}`}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#171717] text-white py-2.5 text-xs font-sans font-bold uppercase tracking-wider shadow-lg hover:bg-[#E6321C] transition-colors"
                  >
                    <Sparkles size={13} />
                    Design Studio
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleQuickAdd}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#171717] text-white py-2.5 text-xs font-sans font-bold uppercase tracking-wider shadow-lg hover:bg-[#E6321C] transition-colors"
                >
                  <ShoppingBag size={13} />
                  Quick Bag
                </motion.button>
              )}
            </div>
          </div>

          {/* Product Meta & Color Swatches */}
          <div className="p-3 sm:p-4 lg:p-5 flex flex-1 flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-1">
                {category && (
                  <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-[#6F6A63] truncate max-w-[70%]">
                    {category.name}
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] font-sans font-semibold text-[#6F6A63]/80">
                  220 GSM
                </span>
              </div>

              <Link to={`/product/${slug}`}>
                <h3 className="text-xs sm:text-sm font-bold text-[#171717] line-clamp-1 font-sans group-hover:text-[#E6321C] transition-colors">
                  {title}
                </h3>
              </Link>
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
