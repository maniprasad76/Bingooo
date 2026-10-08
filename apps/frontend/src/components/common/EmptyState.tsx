import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Heart, Shirt, Package, Sparkles, ArrowRight, Compass } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

export interface EmptyStateProps {
  icon?: 'bag' | 'search' | 'heart' | 'shirt' | 'package' | 'compass';
  title?: string;
  subtitle?: string;
  description?: string;
  actionText?: string;
  actionTo?: string;
  secondaryActionText?: string;
  secondaryActionTo?: string;
  showSuggestions?: boolean;
  className?: string;
}

const ICONS = {
  bag: ShoppingBag,
  search: Search,
  heart: Heart,
  shirt: Shirt,
  package: Package,
  compass: Compass,
};


export function EmptyState({
  icon = 'shirt',
  title = 'ATELIER RACK IS EMPTY',
  subtitle = 'NO ITEMS TO DISPLAY',
  description = 'Our tailors in Srikakulam are busy crafting fresh 240 GSM drops. Explore our signature ready-to-wear streetwear collection.',
  actionText = 'EXPLORE THE COLLECTION',
  actionTo = '/shop',
  secondaryActionText,
  secondaryActionTo,
  showSuggestions = true,
  className = '',
}: EmptyStateProps) {
  const IconComponent = ICONS[icon] || Shirt;
  // Real catalog only; the shelf is hidden while the store has no products.
  const { data: picksData } = useProducts({ limit: 3 });
  const suggestions = (picksData?.data ?? []).slice(0, 3).map((p: any) => ({
    id: String(p.id),
    title: p.title || p.name,
    category: p.category?.name || 'Bingooo',
    tag: p.fabric || (p.gsm ? `${p.gsm} GSM` : 'Heavyweight'),
    price: Number(p.base_price ?? p.basePrice ?? 0),
    slug: p.slug || p.id,
  }));

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center ${className}`}>
      {/* Animated Atelier Badge Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] bg-[#EDE0CC] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] flex items-center justify-center mb-6"
      >
        <div className="absolute -top-2 -right-2 p-1 rounded-[2px] border-2 border-[#171717] bg-[#E6321C] text-white shadow-[2px_2px_0px_#171717]">
          <Sparkles size={13} />
        </div>
        <IconComponent size={44} className="text-[#171717]" />
      </motion.div>

      {/* Subtitle tag */}
      {subtitle && (
        <span className="inline-block px-3 py-1 rounded-[2px] border border-[#171717] bg-white text-[#171717] font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 shadow-[1px_1px_0px_#171717]">
          {subtitle}
        </span>
      )}

      {/* Title */}
      <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#171717] uppercase tracking-tight max-w-lg mx-auto">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm text-[#6F6A63] font-sans max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        {actionText && actionTo && (
          <Link
            to={actionTo}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-[2px] border-2 border-[#171717] bg-[#E6321C] hover:bg-[#171717] text-white font-black text-xs uppercase tracking-wider transition-all shadow-[3px_3px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <span>{actionText}</span>
            <ArrowRight size={14} />
          </Link>
        )}

        {secondaryActionText && secondaryActionTo && (
          <Link
            to={secondaryActionTo}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-[2px] border-2 border-[#171717] bg-white hover:bg-[#F7EEDB] text-[#171717] font-black text-xs uppercase tracking-wider transition-all shadow-[3px_3px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <Sparkles size={14} className="text-[#E6321C]" />
            <span>{secondaryActionText}</span>
          </Link>
        )}
      </div>

      {/* Quick Suggestions Shelf */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-14 pt-10 border-t-2 border-[#171717] text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#E6321C] font-black">
                RECOMMENDED DROPS
              </span>
              <h3 className="font-heading font-black text-base sm:text-lg text-[#171717] uppercase tracking-wide">
                Popular In Atelier Today
              </h3>
            </div>
            <Link
              to="/shop"
              className="text-xs font-black text-[#E6321C] hover:text-[#171717] inline-flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="group p-4 rounded-[2px] bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#171717] transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-[#6F6A63] tracking-wide">
                    {item.category} • {item.tag}
                  </span>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-[#171717] group-hover:text-[#E6321C] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="font-mono font-black text-xs text-[#171717]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-[2px] bg-[#EDE0CC] border-2 border-[#171717] flex items-center justify-center text-[#171717] group-hover:bg-[#E6321C] group-hover:text-white transition-colors shrink-0 shadow-[1px_1px_0px_#171717]">
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
