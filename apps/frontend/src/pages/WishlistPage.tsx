import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Star,
  ArrowRight,
  Shirt,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';

const DEFAULT_WISHLIST_ITEMS = [
  {
    id: 'wish-1',
    slug: 'chaos-printed-tee',
    title: 'Chaos Printed Tee',
    price: 799,
    rating: 4.7,
    reviewsCount: 98,
    color: 'Off White',
    colorHex: '#F7EEDB',
    size: 'L',
    image: '',
  },
  {
    id: 'wish-2',
    slug: 'logo-hoodie',
    title: 'Logo Hoodie',
    price: 1199,
    rating: 4.8,
    reviewsCount: 112,
    color: 'Black',
    colorHex: '#171717',
    size: 'M',
    image: '',
  },
  {
    id: 'wish-3',
    slug: 'baggy-fit-jeans',
    title: 'Baggy Fit Jeans',
    price: 1299,
    rating: 4.6,
    reviewsCount: 87,
    color: 'Blue',
    colorHex: '#597692',
    size: '32',
    image: '',
  },
  {
    id: 'wish-4',
    slug: 'custom-design-tee',
    title: 'Custom Design Tee',
    price: 699,
    rating: 4.8,
    reviewsCount: 64,
    color: 'Beige',
    colorHex: '#D4C4A8',
    size: 'M',
    image: '',
  },
];

const RELATED_PRODUCTS = [
  {
    id: 'rel-1',
    slug: 'minimal-logo-tee',
    title: 'Minimal Logo Tee',
    price: 599,
    rating: 4.6,
    reviewsCount: 56,
  },
  {
    id: 'rel-2',
    slug: 'essential-hoodie',
    title: 'Essential Hoodie',
    price: 1199,
    rating: 4.8,
    reviewsCount: 112,
  },
  {
    id: 'rel-3',
    slug: 'freedom-graphic-tee',
    title: 'Freedom Graphic Tee',
    price: 799,
    rating: 4.7,
    reviewsCount: 78,
  },
  {
    id: 'rel-4',
    slug: 'relaxed-fit-jeans',
    title: 'Relaxed Fit Jeans',
    price: 1399,
    rating: 4.6,
    reviewsCount: 43,
  },
  {
    id: 'rel-5',
    slug: 'logo-hoodie-sage',
    title: 'Logo Hoodie',
    price: 1199,
    rating: 4.8,
    reviewsCount: 96,
  },
  {
    id: 'rel-6',
    slug: 'basic-oversized-tee',
    title: 'Basic Oversized Tee',
    price: 549,
    rating: 4.5,
    reviewsCount: 36,
  },
];

export function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>(
    wishlist && wishlist.length > 0
      ? wishlist.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: p.base_price,
          rating: 4.8,
          reviewsCount: 100,
          color: p.variants?.[0]?.color || 'Black',
          colorHex: p.variants?.[0]?.colorHex || '#171717',
          size: p.variants?.[0]?.size || 'L',
          image: p.images?.[0]?.url,
        }))
      : DEFAULT_WISHLIST_ITEMS
  );

  const handleAddToCart = (item: any) => {
    addItem(item.id, 1);
    toast({
      title: `${item.title} added to cart`,
      description: `Color: ${item.color} • Size: ${item.size}`,
      variant: 'success',
    });
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addItem(item.id, 1);
    });
    toast({
      title: 'All items added to cart!',
      description: `${items.length} items moved to your shopping bag.`,
      variant: 'success',
    });
    navigate('/cart');
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    toggleWishlist(id, true);
    toast({ title: 'Item removed from wishlist', variant: 'info' });
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">Wishlist</span>
        </nav>

        {/* ─── Header: MY WISHLIST (4) & MOVE ALL TO CART (Exact Image 1) ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDD3C5]">
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] uppercase tracking-tight">
              MY WISHLIST <span className="text-2xl text-[#6F6A63]">({items.length})</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6F6A63] font-sans">
              Your favorite styles, saved for you.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMoveAllToCart}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DDD3C5] bg-white hover:border-[#E6321C] text-[#171717] hover:text-[#E6321C] text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <ShoppingBag size={14} className="text-[#E6321C]" />
            <span>MOVE ALL TO CART</span>
          </button>
        </div>

        {/* ─── 4 Wishlist Cards Grid (Exact Image 1) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-3 sm:p-4 shadow-sm hover:shadow-md transition-all text-left"
            >
              {/* Image Container with Red Heart Button */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-lg bg-[#F7EEDB]/60 border border-[#DDD3C5]/60 overflow-hidden flex items-center justify-center">
                <Link
                  to={`/product/${item.slug}`}
                  className="w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-300"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Shirt size={44} className="text-[#171717]/40 mb-1" />
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
                    {item.title}
                  </span>
                </Link>

                {/* Filled Red Heart in White Circle Top-Right */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white shadow-xs text-[#E6321C] hover:scale-110 transition-transform"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={16} className="fill-[#E6321C] text-[#E6321C]" />
                </button>
              </div>

              {/* Product Meta */}
              <div className="mt-3 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <span className="font-sans font-extrabold text-sm text-[#171717] shrink-0">
                      ₹{item.price}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#6F6A63]">
                    <Star size={12} className="fill-[#E6321C] text-[#E6321C]" />
                    <span className="text-[#171717] font-bold">{item.rating}</span>
                    <span>({item.reviewsCount})</span>
                  </div>

                  {/* Color & Size */}
                  <div className="mt-2 text-[11px] text-[#6F6A63] font-sans space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span>Color: {item.color}</span>
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: item.colorHex }}
                      />
                    </div>
                    <div>Size: {item.size}</div>
                  </div>
                </div>

                {/* Actions: ADD TO CART (solid red) & REMOVE (outline) */}
                <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <ShoppingBag size={13} />
                    <span>ADD TO CART</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#DDD3C5] hover:border-[#171717] bg-white text-[#6F6A63] hover:text-[#171717] font-sans font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>REMOVE</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Middle Callout Banner (Exact Image 1) ─── */}
        <div className="rounded-2xl border border-[#DDD3C5] bg-[#F7EEDB] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-[#E6321C] shrink-0 shadow-xs">
              <Heart size={26} className="stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg uppercase tracking-wider text-[#171717]">
                Looks like you love great style!
              </h3>
              <p className="mt-0.5 text-xs text-[#6F6A63] font-sans">
                Add more favorites and build your perfect collection.
              </p>
            </div>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ─── "YOU MAY ALSO LIKE" Section (6 columns - Exact Image 1) ─── */}
        <div className="pt-6 border-t border-[#DDD3C5]">
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <span className="text-[#E6321C]">✨</span>
              <h2 className="font-heading font-bold text-xl uppercase tracking-wider text-[#171717]">
                YOU MAY ALSO LIKE
              </h2>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {RELATED_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-xl bg-white border border-[#DDD3C5] p-3 shadow-xs hover:shadow-md transition-all text-left"
              >
                <div className="relative aspect-[3/4] rounded-lg bg-[#F7EEDB]/60 flex items-center justify-center overflow-hidden">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full h-full flex flex-col items-center justify-center p-2 text-center group-hover:scale-105 transition-transform duration-300"
                  >
                    <Shirt size={34} className="text-[#171717]/40 mb-1" />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#6F6A63] line-clamp-1">
                      {prod.title}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 hover:bg-white text-[#171717] shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart size={12} />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-col flex-1 justify-between">
                  <div>
                    <Link to={`/product/${prod.slug}`}>
                      <h4 className="font-sans font-bold text-xs text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                        {prod.title}
                      </h4>
                    </Link>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-sans font-bold text-xs text-[#171717]">
                        ₹{prod.price}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#DDD3C5]/60">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod)}
                      className="w-full inline-flex items-center justify-center gap-1 py-1 rounded-md border border-[#E6321C]/50 hover:border-[#E6321C] bg-white hover:bg-[#E6321C] text-[#E6321C] hover:text-white text-[9px] font-sans font-bold uppercase tracking-wider transition-colors"
                    >
                      <ShoppingBag size={10} />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bottom Trust Strip (Exact Image 1) ─── */}
        <div className="pt-8 border-t border-[#DDD3C5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Truck size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Free Shipping</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">On orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Secure Payment</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">100% safe & secure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Easy Returns</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">7 days easy return</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Headphones size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Need Help?</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">We're here to help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

