import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useWishlist, useIsInWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';

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

  const inWishlist = !!wishlistData?.inWishlist;
  const discountPct = compareAtPrice && compareAtPrice > basePrice
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)
    : null;

  const defaultVariant = variants[0];
  const colors = [...new Set(variants.map((v) => v.colorHex).filter(Boolean))] as string[];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant) {
      addItem(defaultVariant.id, 1);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id, inWishlist);
  };

  return (
    <div className="group relative flex flex-col rounded-lg bg-white border border-border overflow-hidden transition-all duration-300 hover:shadow-card hover:border-ink/20">
      {/* Visual canvas / Product mock container */}
      <Link to={`/product/${slug}`} className="relative aspect-[4/5] w-full bg-paper flex items-center justify-center overflow-hidden">
        {/* Placeholder garment render */}
        <div className="flex flex-col items-center justify-center p-6 text-center transition-transform duration-500 group-hover:scale-105">
          <div className="h-32 w-28 rounded-md bg-ink/10 border border-ink/10 flex items-center justify-center shadow-inner relative">
            <span className="text-2xl font-bold text-ink/40 tracking-wider">BGO</span>
            {customizationEnabled && (
              <div className="absolute inset-x-2 top-6 bottom-6 border border-dashed border-accent/60 rounded flex items-center justify-center">
                <Sparkles size={16} className="text-accent animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {customizationEnabled && (
            <Badge variant="accent" size="sm" className="shadow-sm">
              <Sparkles size={11} className="mr-1" />
              Customizable
            </Badge>
          )}
          {discountPct && (
            <Badge variant="danger" size="sm" className="shadow-sm">
              {discountPct}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:scale-110 active:scale-95"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              inWishlist ? 'fill-danger text-danger' : 'text-muted hover:text-ink'
            }`}
          />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          {customizationEnabled ? (
            <Link
              to={`/customize/${slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded bg-ink text-white py-2 text-xs font-semibold shadow-md hover:bg-accent transition-colors"
            >
              <Sparkles size={13} />
              Customise
            </Link>
          ) : defaultVariant ? (
            <button
              onClick={handleQuickAdd}
              className="flex-1 flex items-center justify-center gap-1.5 rounded bg-ink text-white py-2 text-xs font-semibold shadow-md hover:bg-accent transition-colors"
            >
              <ShoppingBag size={13} />
              Quick Add
            </button>
          ) : null}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-1 flex-col justify-between">
        <div>
          {category && (
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
              {category.name}
            </p>
          )}
          <Link to={`/product/${slug}`}>
            <h3 className="text-body font-semibold text-ink line-clamp-1 group-hover:text-accent transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-price text-ink">₹{basePrice}</span>
            {compareAtPrice && compareAtPrice > basePrice && (
              <span className="text-caption text-muted line-through">
                ₹{compareAtPrice}
              </span>
            )}
          </div>

          {/* Color preview dots */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1">
              {colors.slice(0, 4).map((hex, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: hex }}
                  title="Available color"
                />
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-muted">+{colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
