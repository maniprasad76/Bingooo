import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
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
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DDD3C5] px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg md:hidden"
        >
          {/* Mini info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-10 h-10 object-cover rounded-[2px] bg-[#EDE0CC] shrink-0 border border-[#DDD3C5]/60"
              />
            ) : (
              <div className="w-10 h-10 rounded-[2px] bg-[#EDE0CC] shrink-0 border border-[#DDD3C5]/60 flex items-center justify-center font-mono text-[9px] font-bold text-[#6F6A63]">
                BGO
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#171717] truncate uppercase tracking-tight">
                {title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-extrabold text-[#E6321C]">
                  {typeof price === 'number' ? `₹${price}` : price}
                </span>
                {selectedSize && (
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-[2px] bg-[#F7EEDB] text-[#171717] border border-[#DDD3C5]">
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
                className="w-10 h-10 rounded-[8px] border border-[#DDD3C5] bg-white text-[#25D366] grid place-items-center active:scale-95 transition-all shadow-2xs hover:border-[#25D366] hover:bg-[#25D366]/10 cursor-pointer"
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
              className="w-10 h-10 rounded-[8px] border border-[#DDD3C5] bg-white grid place-items-center active:scale-95 transition-all shadow-2xs hover:border-[#171717] cursor-pointer"
              aria-label="Toggle wishlist"
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart
                size={17}
                className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]'}
              />
            </button>

            <Button
              variant="primary"
              size="lg"
              loading={isAdding}
              onClick={() => {
                triggerHaptic('medium');
                onAddToCart();
              }}
              className="px-5 text-xs font-extrabold tracking-wider whitespace-nowrap h-11 rounded-[8px] shadow-[0_4px_16px_rgba(230,50,28,0.35)]"
            >
              <ShoppingBag size={15} className="mr-1.5" />
              <span>ADD TO BAG</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
