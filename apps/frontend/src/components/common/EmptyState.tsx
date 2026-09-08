import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Heart, Shirt, Package, Sparkles, ArrowRight, Compass } from 'lucide-react';

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

const SUGGESTIONS = [
  {
    id: 's-1',
    title: 'Oversized Heavyweight Tee',
    category: 'T-Shirts',
    price: 999,
    tag: '240 GSM',
    slug: 'oversized-heavyweight-tee',
  },
  {
    id: 's-2',
    title: 'Streetwear Boxy Hoodie',
    category: 'Hoodies',
    price: 1899,
    tag: '320 GSM Fleece',
    slug: 'streetwear-boxy-hoodie',
  },
  {
    id: 's-3',
    title: 'Acid Wash Denim Pant',
    category: 'Jeans',
    price: 1799,
    tag: 'Custom Cut',
    slug: 'acid-wash-denim-pant',
  },
];

export function EmptyState({
  icon = 'shirt',
  title = 'ATELIER RACK IS EMPTY',
  subtitle = 'NO ITEMS TO DISPLAY',
  description = 'Our tailors in Srikakulam are busy crafting fresh 240 GSM drops. Explore our signature collection or design your own bespoke garment.',
  actionText = 'EXPLORE THE COLLECTION',
  actionTo = '/shop',
  secondaryActionText = 'CUSTOM DESIGN LAB',
  secondaryActionTo = '/customize',
  showSuggestions = true,
  className = '',
}: EmptyStateProps) {
  const IconComponent = ICONS[icon] || Shirt;

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center ${className}`}>
      {/* Animated Atelier Badge Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#E6D9C5] to-[#F7EEDB] border border-[#DDD3C5] shadow-sm flex items-center justify-center mb-6"
      >
        <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-[#E6321C] text-white shadow-xs">
          <Sparkles size={14} />
        </div>
        <IconComponent size={44} className="text-[#171717]/60" />
      </motion.div>

      {/* Subtitle tag */}
      {subtitle && (
        <span className="inline-block px-3 py-1 rounded-full bg-[#EDE0CC] text-[#171717] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">
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
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <span>{actionText}</span>
            <ArrowRight size={14} />
          </Link>
        )}

        {secondaryActionText && secondaryActionTo && (
          <Link
            to={secondaryActionTo}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#171717] text-[#171717] font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <Sparkles size={14} className="text-[#E6321C]" />
            <span>{secondaryActionText}</span>
          </Link>
        )}
      </div>

      {/* Quick Suggestions Shelf */}
      {showSuggestions && (
        <div className="mt-14 pt-10 border-t border-[#DDD3C5]/60 text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#E6321C] font-bold">
                RECOMMENDED DROPS
              </span>
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#171717] uppercase tracking-wide">
                Popular In Atelier Today
              </h3>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-[#E6321C] hover:text-[#B91F12] inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUGGESTIONS.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="group p-4 rounded-xl bg-white border border-[#DDD3C5] hover:border-[#E6321C] transition-all shadow-xs hover:shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wide">
                    {item.category} • {item.tag}
                  </span>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#171717] group-hover:text-[#E6321C] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="font-heading font-extrabold text-xs text-[#171717]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5] flex items-center justify-center text-[#171717] group-hover:bg-[#E6321C] group-hover:text-white transition-colors shrink-0">
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
