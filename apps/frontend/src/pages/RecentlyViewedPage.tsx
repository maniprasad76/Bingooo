import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Star,
  Shirt,
  Sparkles,
  Clock,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  X,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Truck,
  Heart,
} from 'lucide-react';
import { useRecentlyViewed, type RecentlyViewedItem } from '../hooks/useRecentlyViewed';
import { useCart } from '../hooks/useCart';
import { useWishlist, useIsInWishlist } from '../hooks/useWishlist';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { EmptyState } from '../components/common/EmptyState';
import { InteractiveTilt } from '../components/ui/InteractiveTilt';

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'rating';

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

interface RecentlyViewedCardProps {
  item: RecentlyViewedItem;
  onRemove: (idOrSlug: string) => void;
  onAddToCart: (item: RecentlyViewedItem) => void;
  viewMode: 'grid' | 'list';
}

function RecentlyViewedCard({
  item,
  onRemove,
  onAddToCart,
  viewMode,
}: RecentlyViewedCardProps) {
  const { toggleWishlist } = useWishlist();
  const { data: wishlistData } = useIsInWishlist(item.id);
  const inWishlist = !!wishlistData?.inWishlist;

  const discountPct =
    item.compareAtPrice && item.compareAtPrice > item.basePrice
      ? Math.round(((item.compareAtPrice - item.basePrice) / item.compareAtPrice) * 100)
      : null;

  const mainImage =
    item.image ||
    (item.slug.includes('graphic')
      ? '/custom/tshirt-step-3-black.png'
      : item.slug.includes('classic')
      ? '/custom/tshirt-step-1.png'
      : item.slug.includes('hoodie')
      ? '/custom/tshirt-step-2.png'
      : '/custom/tshirt-step-1.png');

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs hover:shadow-md transition-all text-left"
      >
        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
          {/* Thumbnail */}
          <Link
            to={`/product/${item.slug}`}
            className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-[#EDE0CC] border border-[#DDD3C5] overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
          >
            {mainImage ? (
              <img src={mainImage} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <Shirt size={32} className="text-[#171717]/40" />
            )}
          </Link>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E6321C]">
                {item.category?.name || 'Menswear'}
              </span>
              <span className="text-[#DDD3C5]">•</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-sans text-[#6F6A63]">
                <Clock size={11} />
                {formatRelativeTime(item.viewedAt)}
              </span>
              {item.customizationEnabled && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#171717] text-white text-[9px] font-bold uppercase">
                  <Sparkles size={9} /> Custom
                </span>
              )}
            </div>

            <Link to={`/product/${item.slug}`}>
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#171717] hover:text-[#E6321C] transition-colors truncate">
                {item.title}
              </h3>
            </Link>

            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#171717]">
                  ₹{item.basePrice.toLocaleString('en-IN')}
                </span>
                {item.compareAtPrice && item.compareAtPrice > item.basePrice && (
                  <span className="text-xs text-[#6F6A63] line-through font-sans">
                    ₹{item.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPct && (
                  <span className="text-[10px] font-bold text-[#E6321C] bg-[#FAF0EE] px-1.5 py-0.2 rounded">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-[#6F6A63]">
                <Star size={12} className="fill-[#E6321C] text-[#E6321C]" />
                <span className="font-bold text-[#171717]">{item.rating || 4.8}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#DDD3C5]/60 shrink-0">
          <button
            type="button"
            onClick={() => toggleWishlist(item.id, inWishlist)}
            className="p-2.5 rounded-xl border border-[#DDD3C5] hover:border-[#E6321C] text-[#171717] hover:text-[#E6321C] transition-colors"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : ''} />
          </button>

          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>ADD TO BAG</span>
          </button>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-2.5 rounded-xl border border-[#DDD3C5] hover:border-[#171717] text-[#6F6A63] hover:text-[#E6321C] transition-colors"
            title="Remove from history"
            aria-label={`Remove ${item.title} from recently viewed`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <InteractiveTilt maxTilt={6} className="h-full">
        <div className="group relative flex h-full flex-col justify-between rounded-2xl bg-white border border-[#DDD3C5] p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 text-left">
          {/* Top Image Box */}
          <div className="relative aspect-[4/5] rounded-xl bg-[#EDE0CC] overflow-hidden flex items-center justify-center">
            <Link
              to={`/product/${item.slug}`}
              className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Shirt size={48} className="text-[#171717]/40 mb-2" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
                    {item.title}
                  </span>
                </div>
              )}
            </Link>

            {/* Badges Top-Left */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#171717] text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-xs">
                ESSENTIAL
              </span>
              {item.customizationEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E6321C] text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  <Sparkles size={10} /> Custom
                </span>
              )}
              {discountPct && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FAF0EE] text-[#B91F12] border border-[#F5C7C1] text-[9px] font-mono font-bold tracking-wider shadow-xs">
                  {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Top-Right Action Controls (Remove from history + Wishlist) */}
            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => onRemove(item.id)}
                className="h-7 w-7 rounded-full bg-white/90 hover:bg-white text-[#6F6A63] hover:text-[#E6321C] shadow-xs flex items-center justify-center transition-colors"
                title="Remove from history"
                aria-label={`Remove ${item.title} from history`}
              >
                <X size={14} />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleWishlist(item.id, inWishlist)}
                className="h-7 w-7 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-xs flex items-center justify-center transition-colors"
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={14} className={inWishlist ? 'fill-[#E6321C] text-[#E6321C]' : ''} />
              </motion.button>
            </div>

            {/* Bottom Time Stamp Pill */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#171717]/75 backdrop-blur-xs text-white text-[9px] font-sans font-medium">
                <Clock size={10} />
                {formatRelativeTime(item.viewedAt)}
              </span>
            </div>
          </div>

          {/* Product Meta */}
          <div className="mt-3 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] mb-1">
                <span>{item.category?.name || 'Heavyweight Drop'}</span>
                <div className="flex items-center gap-0.5 text-[#171717]">
                  <Star size={11} className="fill-[#E6321C] text-[#E6321C]" />
                  <span>{item.rating || 4.8}</span>
                </div>
              </div>

              <Link to={`/product/${item.slug}`}>
                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1 leading-snug">
                  {item.title}
                </h3>
              </Link>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-sm sm:text-base text-[#171717]">
                  ₹{item.basePrice.toLocaleString('en-IN')}
                </span>
                {item.compareAtPrice && item.compareAtPrice > item.basePrice && (
                  <span className="text-xs text-[#6F6A63] line-through font-sans">
                    ₹{item.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60 flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAddToCart(item)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                <ShoppingBag size={13} />
                <span>ADD TO BAG</span>
              </motion.button>

              {item.customizationEnabled && (
                <Link
                  to={`/customize/${item.slug}`}
                  className="p-2.5 rounded-xl border border-[#DDD3C5] hover:border-[#171717] text-[#171717] transition-colors"
                  title="Customize in Atelier Studio"
                  aria-label="Customize"
                >
                  <Sparkles size={14} className="text-[#E6321C]" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </InteractiveTilt>
    </motion.div>
  );
}

export function RecentlyViewedPage() {
  const { items, count, removeProduct, clearAll } = useRecentlyViewed();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Extract unique categories from viewed items
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category?.name) set.add(it.category.name);
    });
    return Array.from(set);
  }, [items]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (it) => it.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => b.viewedAt - a.viewedAt);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [items, selectedCategory, sortBy]);

  const handleAddToCart = (item: RecentlyViewedItem) => {
    const variantId = item.variantId || item.variants?.[0]?.id;
    if (!variantId) {
      navigate(`/product/${item.slug}`);
      return;
    }

    addItem(variantId, 1);
    toast({
      title: `${item.title} added to bag`,
      description: item.color && item.size ? `Color: ${item.color} • Size: ${item.size}` : undefined,
      variant: 'success',
    });
  };

  const handleClearConfirm = () => {
    clearAll();
    setIsClearModalOpen(false);
    toast({
      title: 'Browsing history cleared',
      description: 'Your recently viewed products list has been reset.',
      variant: 'info',
    });
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <SEO
        title="Recently Viewed Products — Bingooo Atelier"
        description="Pick up where you left off. Revisit recently viewed 240 GSM heavyweights, streetwear tees, hoodies, and bespoke garments crafted at Bingooo."
      />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C] transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">Recently Viewed</span>
        </nav>

        {/* ─── Page Header with Atelier Styling ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDD3C5]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EDE0CC] text-[#171717] font-mono text-[10px] font-bold uppercase tracking-widest">
                YOUR BROWSING HISTORY
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] uppercase tracking-tight flex items-baseline gap-2">
              <span>RECENTLY VIEWED</span>
              <span className="text-2xl text-[#6F6A63] font-bold">({count})</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6F6A63] font-sans max-w-2xl">
              Garments and atelier pieces you explored across Bingooo. Pick up right where you left off or send them to your bag.
            </p>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] hover:text-[#E6321C] text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs text-[#6F6A63]"
              >
                <Trash2 size={13} />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── Filters, Sorting & View Controls Bar ─── */}
        {count > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD3C5]/60">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-white border border-[#DDD3C5] text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                All ({count})
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                const catCount = items.filter((it) => it.category?.name === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'bg-white border border-[#DDD3C5] text-[#6F6A63] hover:text-[#171717]'
                    }`}
                  >
                    {cat} ({catCount})
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown and Grid/List view toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#6F6A63]">
                <ArrowUpDown size={14} className="text-[#171717]" />
                <label htmlFor="sort-by" className="sr-only">Sort by</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-[#DDD3C5] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#E6321C] cursor-pointer"
                >
                  <option value="recent">Most Recently Viewed</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center rounded-xl bg-white border border-[#DDD3C5] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
                  }`}
                  aria-label="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Main Content Grid or Empty State ─── */}
        {count === 0 ? (
          <div className="py-12 bg-white rounded-3xl border border-[#DDD3C5] shadow-xs">
            <EmptyState
              icon="compass"
              title="NO RECENTLY VIEWED GARMENTS"
              subtitle="ZERO BROWSING FOOTPRINTS"
              description="You haven't explored any pieces yet. Browse our signature 240 GSM drops, heavyweight hoodies, or launch the 3D Customizer to craft bespoke apparel."
              actionText="DISCOVER THE SHOP"
              actionTo="/shop"
              secondaryActionText="CUSTOM DESIGN STUDIO"
              secondaryActionTo="/customize"
              showSuggestions={true}
            />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-[#DDD3C5] text-center p-8 space-y-3">
            <Filter size={32} className="mx-auto text-[#6F6A63]" />
            <h3 className="font-heading font-bold text-lg text-[#171717] uppercase">
              No garments found for "{selectedCategory}"
            </h3>
            <p className="text-xs text-[#6F6A63] font-sans max-w-sm mx-auto">
              You haven't viewed any garments in this category recently.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-bold uppercase tracking-wider"
            >
              Show All Categories
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6'
                : 'space-y-3'
            }
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <RecentlyViewedCard
                  key={item.id}
                  item={item}
                  onRemove={removeProduct}
                  onAddToCart={handleAddToCart}
                  viewMode={viewMode}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Atelier Trust Badges Strip ─── */}
        <div className="mt-16 pt-10 border-t border-[#DDD3C5] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-4 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs flex flex-col items-center">
            <Shirt size={22} className="text-[#E6321C] mb-2" />
            <span className="font-heading font-bold text-xs uppercase text-[#171717]">
              240 GSM COMBED COTTON
            </span>
            <span className="text-[10px] text-[#6F6A63] font-sans mt-0.5">Heavyweight Luxury Drape</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs flex flex-col items-center">
            <RotateCcw size={22} className="text-[#E6321C] mb-2" />
            <span className="font-heading font-bold text-xs uppercase text-[#171717]">
              7-DAY EASY RETURNS
            </span>
            <span className="text-[10px] text-[#6F6A63] font-sans mt-0.5">Doorstep Pickup Exchanges</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs flex flex-col items-center">
            <ShieldCheck size={22} className="text-[#E6321C] mb-2" />
            <span className="font-heading font-bold text-xs uppercase text-[#171717]">
              100% PROTECTED CHECKOUT
            </span>
            <span className="text-[10px] text-[#6F6A63] font-sans mt-0.5">Razorpay Encrypted Security</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs flex flex-col items-center">
            <Truck size={22} className="text-[#E6321C] mb-2" />
            <span className="font-heading font-bold text-xs uppercase text-[#171717]">
              EXPRESS 3–7 DAY DISPATCH
            </span>
            <span className="text-[10px] text-[#6F6A63] font-sans mt-0.5">Direct from Srikakulam</span>
          </div>
        </div>
      </div>

      {/* ─── Clear All History Confirmation Modal ─── */}
      <AnimatePresence>
        {isClearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-[#DDD3C5] text-left space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FAF0EE] text-[#E6321C] flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#171717]">
                    Clear Browsing History?
                  </h3>
                  <p className="text-xs text-[#6F6A63] font-sans">
                    This will remove all {count} garments from your recently viewed list.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDD3C5]/60">
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#EDE0CC]/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearConfirm}
                  className="px-4 py-2 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecentlyViewedPage;
