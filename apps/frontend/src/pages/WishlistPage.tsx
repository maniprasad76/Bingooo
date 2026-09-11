import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '../store/auth';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export function WishlistPage() {
  const { wishlist, toggleWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const items = useMemo(() => {
    return (wishlist || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.base_price,
      compareAtPrice: p.compare_at_price,
      color: p.variants?.[0]?.color || 'Black',
      colorHex: p.variants?.[0]?.colorHex || '#171717',
      size: p.variants?.[0]?.size || 'L',
      variantId: p.variants?.[0]?.id,
      image: p.images?.[0]?.url || p.images?.[0]?.object_key || '/hero-banner-2.jpg',
    }));
  }, [wishlist]);

  const totalValue = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  }, [items]);

  const handleAddToCart = (item: any) => {
    triggerHaptic('medium');
    if (!item.variantId) {
      navigate(`/product/${item.slug}`);
      return;
    }
    addItem(item.variantId, 1);
    toast({
      title: `${item.title} added to bag`,
      description: `Size ${item.size} • ₹${item.price}`,
      variant: 'success',
    });
  };

  const handleMoveAllToCart = () => {
    if (items.length === 0) {
      toast({ title: 'Your wishlist is empty', variant: 'info' });
      return;
    }
    triggerHaptic('success');
    items.forEach((item) => {
      if (item.variantId) addItem(item.variantId, 1);
    });
    toast({
      title: 'All items moved to shopping bag',
      description: `${items.length} saved pieces ready for checkout.`,
      variant: 'success',
    });
    navigate('/cart');
  };

  const handleRemove = (id: string) => {
    triggerHaptic('light');
    toggleWishlist(id, true);
  };

  // Curated recommendations from fallback products
  const curatedPicks = useMemo(() => {
    return FALLBACK_PRODUCTS.slice(0, 4);
  }, []);

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen">
      <SEO
        title="My Wishlist — BINGOOO"
        description="View and manage your saved heavyweight streetwear styles, move items to cart, and track favorite menswear drops at Bingooo."
        canonical="https://bingooo.in/wishlist"
        noindex={true}
      />

      {/* =======================================================
           HERO SECTION (Matching AboutPage Spacing & Layout)
      ======================================================= */}
      <section className="min-h-[520px] lg:min-h-[580px] grid grid-cols-1 lg:grid-cols-[45%_55%] bg-[#f7eedb] border-b border-[#ddd3c5]">
        <div className="flex flex-col justify-center py-[50px] px-6 sm:px-10 lg:py-[clamp(40px,6vw,90px)] lg:px-[clamp(25px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-3">
            BINGOOO / CURATED BY YOU
          </div>

          <h1 className="my-2.5 mb-5 text-[clamp(45px,6.5vw,95px)] font-extrabold leading-[0.85] tracking-[-0.075em] uppercase">
            <span className="block">YOUR</span>
            <span className="block">SAVED</span>
            <span className="block text-[#e6321c]">PIECES.</span>
          </h1>

          <p className="max-w-[420px] m-0 mb-[28px] text-[#6f6a63] text-[13px] leading-[1.8]">
            Your personal archive of heavyweight silhouettes, limited drops, and custom pieces waiting to be tailored.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {items.length > 0 ? (
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[4px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#e6321c] transition-colors cursor-pointer"
              >
                MOVE ALL TO BAG ({items.length}) →
              </button>
            ) : (
              <Link
                to="/shop"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[4px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#e6321c] transition-colors"
              >
                EXPLORE NEW DROPS →
              </Link>
            )}

            <Link
              to="/shop"
              className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717] hover:text-[#e6321c] border-b border-[#171717] hover:border-[#e6321c] pb-1 ml-2 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        <div className="h-[340px] sm:h-[420px] lg:h-auto overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo curated wishlist archive"
            className="w-full h-full object-cover grayscale contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7eedb] via-transparent to-transparent lg:hidden" />
        </div>
      </section>

      {/* =======================================================
           STATEMENT (Matching AboutPage Dark Punchline)
      ======================================================= */}
      <section className="py-[clamp(60px,8vw,110px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-3">
          PERSONAL STYLE
        </div>

        <h2 className="max-w-[950px] mx-auto m-0 text-[clamp(36px,6vw,76px)] leading-[0.92] font-extrabold tracking-[-0.07em] uppercase text-white">
          STYLE ISN'T WHAT EVERYONE <span className="text-[#e6321c]">WEARS.</span><br />
          IT'S WHAT FEELS LIKE <span className="text-[#e6321c]">YOU.</span>
        </h2>
      </section>

      {/* =======================================================
           NUMBERS / STATS STRIP (Matching AboutPage)
      ======================================================= */}
      <section className="py-8 bg-[#f7eedb]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#ddd3c5]">
            <div className="p-[25px_20px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em]">
                {items.length}
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Saved Garments
              </div>
            </div>

            <div className="p-[25px_20px] border-b sm:border-b-0 md:border-r border-[#ddd3c5]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em]">
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Total Wishlist Value
              </div>
            </div>

            <div className="p-[25px_20px] border-r border-[#ddd3c5]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em]">
                FREE
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Delivery Above ₹999
              </div>
            </div>

            <div className="p-[25px_20px]">
              <div className="text-[clamp(32px,3.5vw,52px)] font-extrabold tracking-[-0.06em] text-[#e6321c]">
                7 DAYS
              </div>
              <div className="mt-[5px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Doorstep Fit Exchange
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           MAIN WISHLIST SECTION
      ======================================================= */}
      <section className="py-[clamp(60px,8vw,110px)]" id="wishlist-grid">
        <div className="container-bingooo">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 pb-4 border-b border-[#ddd3c5]">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-1.5">
                SAVED PIECES
              </div>
              <h2 className="m-0 text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-0.06em] uppercase">
                YOUR SELECTION ({items.length})
              </h2>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#171717] hover:text-[#e6321c] transition-colors cursor-pointer"
              >
                <ShoppingBag size={14} className="text-[#e6321c]" />
                <span>MOVE ALL TO CART →</span>
              </button>
            )}
          </div>

          {/* Unauthenticated Note if Guest */}
          {!isAuthenticated && items.length === 0 && (
            <div className="mb-10 p-6 bg-[#ede0cc] border border-[#ddd3c5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-[#171717]">
                  SIGN IN TO SYNC YOUR SAVED PIECES
                </h3>
                <p className="text-xs text-[#6f6a63] mt-1">
                  Create an account or sign in to access your saved garments across devices and receive restock alerts.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-10 px-5 bg-[#171717] text-white text-[9px] font-extrabold uppercase tracking-wider hover:bg-[#e6321c] transition-colors shrink-0"
              >
                SIGN IN / REGISTER →
              </Link>
            </div>
          )}

          {/* Wishlist Items Grid */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-mono uppercase text-[#6f6a63]">Loading your saved pieces…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 px-6 text-center bg-[#ede0cc]/60 border border-[#ddd3c5] rounded-[2px] max-w-[700px] mx-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white flex items-center justify-center text-[#e6321c] shadow-xs">
                <Heart size={26} className="stroke-[1.6]" />
              </div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2">
                EMPTY ARCHIVE
              </div>
              <h3 className="text-[clamp(24px,3.5vw,36px)] font-extrabold uppercase tracking-[-0.05em] text-[#171717] mb-3">
                YOUR WISHLIST IS WAITING
              </h3>
              <p className="max-w-[420px] mx-auto text-xs text-[#6f6a63] leading-relaxed mb-6">
                Tap the heart icon on any oversized tee, fleece hoodie, or custom design to track price drops and build your signature fit.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center h-11 px-6 bg-[#171717] text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#e6321c] transition-colors"
                >
                  DISCOVER NEW ARRIVALS →
                </Link>
                <Link
                  to="/customize"
                  className="inline-flex items-center justify-center h-11 px-6 bg-white border border-[#ddd3c5] text-[#171717] text-[10px] font-extrabold uppercase tracking-wider hover:border-[#171717] transition-colors"
                >
                  DESIGN CUSTOM APPAREL
                </Link>
              </div>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group flex flex-col justify-between bg-[#ede0cc]/40 border border-[#ddd3c5] p-3 sm:p-4 text-left transition-colors hover:border-[#171717]"
                  >
                    <div>
                      {/* Image Canvas with Heart Button */}
                      <div className="relative aspect-[4/5] bg-[#ede0cc] overflow-hidden">
                        <Link to={`/product/${item.slug}`} className="block w-full h-full">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                          />
                        </Link>

                        {/* Remove / Heart Action */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white text-[#e6321c] flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          aria-label="Remove from wishlist"
                          title="Remove from saved pieces"
                        >
                          <Heart size={16} className="fill-[#e6321c]" />
                        </button>
                      </div>

                      {/* Meta Information */}
                      <div className="pt-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <Link to={`/product/${item.slug}`}>
                            <h3 className="text-[12px] sm:text-[13px] font-bold text-[#171717] group-hover:text-[#e6321c] transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                          </Link>
                          <span className="text-[13px] sm:text-[14px] font-extrabold text-[#171717] shrink-0">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[10px] text-[#6f6a63]">
                          <span>Size: <strong className="text-[#171717]">{item.size}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span>{item.color}</span>
                            <span
                              className="w-2 h-2 rounded-full border border-black/20"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-[#ddd3c5] grid grid-cols-[1fr_36px] gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="h-9 flex items-center justify-center gap-1.5 bg-[#171717] text-white text-[9px] font-extrabold uppercase tracking-wider hover:bg-[#e6321c] transition-colors cursor-pointer"
                      >
                        <ShoppingBag size={12} />
                        <span>MOVE TO BAG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="h-9 flex items-center justify-center border border-[#ddd3c5] bg-white text-[#6f6a63] hover:text-[#e6321c] hover:border-[#e6321c] transition-colors cursor-pointer"
                        aria-label="Delete item"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* =======================================================
           RECOMMENDED PICKS (Curated Drop Carousel)
      ======================================================= */}
      <section className="py-[80px] bg-[#ede0cc] border-t border-[#ddd3c5]">
        <div className="container-bingooo">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-3">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-1.5">
                CURATED FOR YOU
              </div>
              <h2 className="m-0 text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-0.06em] uppercase text-[#171717]">
                RECOMMENDED DROPS
              </h2>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#171717] hover:text-[#e6321c] transition-colors"
            >
              <span>VIEW FULL ARCHIVE</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {curatedPicks.map((prod) => (
              <article
                key={prod.id}
                className="group flex flex-col justify-between bg-[#f7eedb] border border-[#ddd3c5] p-3 text-left transition-colors hover:border-[#171717]"
              >
                <div>
                  <div className="aspect-[4/5] bg-[#ede0cc] overflow-hidden relative">
                    <Link to={`/product/${prod.slug}`} className="block w-full h-full">
                      <img
                        src={prod.images?.[0]?.url || '/hero-banner-2.jpg'}
                        alt={prod.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    </Link>
                  </div>

                  <div className="pt-3">
                    <div className="flex items-baseline justify-between gap-1">
                      <Link to={`/product/${prod.slug}`}>
                        <h4 className="text-[12px] font-bold text-[#171717] group-hover:text-[#e6321c] transition-colors line-clamp-1">
                          {prod.title}
                        </h4>
                      </Link>
                      <span className="text-[13px] font-extrabold text-[#171717]">
                        ₹{(prod as any).base_price || prod.basePrice}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6f6a63] mt-1 font-mono uppercase">
                      {prod.category?.name || 'Heavyweight'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#ddd3c5]">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full h-8 flex items-center justify-center border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-[9px] font-extrabold uppercase tracking-wider transition-colors"
                  >
                    EXPLORE PIECE →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
           TRUST STRIP (Matching AboutPage / FAQ)
      ======================================================= */}
      <section className="border-t border-b border-[#ddd3c5] py-7 bg-[#f7eedb]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Fast Shipping</div>
                <div className="text-[9px] text-[#6f6a63]">Dispatched in 24–48 hours</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RotateCcw size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Easy Returns</div>
                <div className="text-[9px] text-[#6f6a63]">7-day doorstep exchange</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Quality First</div>
                <div className="text-[9px] text-[#6f6a63]">240 GSM combed cotton</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Headphones size={24} className="text-[#171717] shrink-0 stroke-[1.5]" />
              <div>
                <div className="text-[9px] font-extrabold uppercase text-[#171717]">Support Desk</div>
                <div className="text-[9px] text-[#6f6a63]">Mon–Sat, 10AM–7PM IST</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           FINAL CTA (Matching AboutPage Red Banner)
      ======================================================= */}
      <section className="py-[85px] px-5 bg-[#e6321c] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-2">
          READY TO WEAR?
        </div>

        <h2 className="my-2 mb-[20px] text-[clamp(38px,6vw,76px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase text-white">
          COMPLETE YOUR<br />
          SIGNATURE FIT.
        </h2>

        <p className="max-w-[420px] mx-auto mb-[28px] text-white/90 text-[12px] leading-[1.7]">
          Move your saved pieces to your bag or discover limited drops before they sell out.
        </p>

        <Link
          to="/cart"
          onClick={() => triggerHaptic('medium')}
          className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[4px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors"
        >
          VIEW SHOPPING BAG →
        </Link>
      </section>
    </main>
  );
}

export default WishlistPage;
