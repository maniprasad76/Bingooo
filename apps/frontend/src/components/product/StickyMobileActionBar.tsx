import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { WhatsAppIcon } from '../ui/SocialIcons';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

interface StickyMobileActionBarProps {
  product: {
    id: string;
    title?: string;
    name?: string;
    basePrice?: number;
    price?: number | string;
    imageUrl?: string;
    images?: Array<{ url: string }>;
  };
  selectedSize?: string;
  inWishlist?: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onShareWhatsApp?: () => void;
  isAdding?: boolean;
}

export function StickyMobileActionBar({
  product,
  selectedSize,
  inWishlist,
  onAddToCart,
  onToggleWishlist,
  onShareWhatsApp,
  isAdding,
}: StickyMobileActionBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const title = product.title || product.name || 'Bingooo Garment';
  const price = product.basePrice || product.price || 999;
  const image = product.imageUrl || product.images?.[0]?.url || '';

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#F7EEDB] border-t-2 border-[#171717] px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_0px_#171717] md:hidden"
        >
          {/* Mini info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {image ? (
              <img
                src={image}
                alt={title}
                loading="lazy"
                className="w-10 h-10 object-cover bg-[#EDE0CC] shrink-0 border-2 border-[#171717] shadow-[2px_2px_0px_#171717]"
              />
            ) : (
              <div className="w-10 h-10 bg-[#EDE0CC] shrink-0 border-2 border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono text-[9px] font-black text-[#171717]">
                B.
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-[#171717] truncate uppercase tracking-tight">
                {title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-mono font-black text-[#E6321C]">
                  {typeof price === 'number' ? `₹${price}` : price}
                </span>
                {selectedSize && (
                  <span className="font-mono text-[9px] font-black uppercase px-1.5 py-0.2 bg-white text-[#171717] border border-[#171717]">
                    {selectedSize}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onShareWhatsApp && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onShareWhatsApp();
                }}
                className="w-10 h-10 border-2 border-[#171717] bg-white text-[#25D366] grid place-items-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all shadow-[2px_2px_0px_#171717] hover:bg-[#25D366] hover:text-white cursor-pointer"
                aria-label="Share via WhatsApp"
                title="Share via WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onToggleWishlist();
              }}
              className="w-10 h-10 border-2 border-[#171717] bg-white grid place-items-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C] hover:text-white cursor-pointer"
              aria-label="Toggle wishlist"
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart
                size={16}
                className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]'}
              />
            </button>

            <button
              type="button"
              disabled={isAdding}
              onClick={() => {
                triggerHaptic('medium');
                onAddToCart();
              }}
              className="px-4 h-10 text-[10px] font-black uppercase tracking-wider whitespace-nowrap bg-[#E6321C] text-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag size={13} strokeWidth={2.5} />
              <span>ADD TO BAG</span>
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
