import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Star,
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

  // ═══════════════════════════════════════════════════════════
  // EMPTY WISHLIST STATE (Matches the Exact Brand Artwork)
  // ═══════════════════════════════════════════════════════════
  if (items.length === 0 && !isLoading) {
    return (
      <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen selection:bg-[#e6321c] selection:text-white">
        <SEO
          title="Your Wishlist is Empty — BINGOOO"
          description="Your wishlist is waiting. Explore our collection of premium heavyweight silhouettes and custom pieces."
          canonical="https://bingooo.in/wishlist"
          noindex={true}
        />

        {/* ── Editorial Empty Wishlist Canvas ── */}
        <section className="relative px-6 sm:px-12 py-10 sm:py-16 max-w-6xl mx-auto flex flex-col justify-between min-h-[82vh]">
          {/* Top Brand Corner Headers */}
          <div className="flex items-start justify-between gap-4 w-full">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-[#171717] uppercase">
                BINGOOO<span className="text-[#e6321c]">.</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#6f6a63] uppercase mt-1">
                CLOTHING · CUSTOM · CULTURE
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#171717] uppercase">
                WEAR WHAT DEFINES YOU.
              </div>
            </div>
          </div>

          {/* Central Artwork & Callout */}
          <div className="my-auto py-8 sm:py-12 text-center space-y-6">
            {/* Hand-crafted bag with heart artwork */}
            <div className="relative inline-block max-w-[360px] sm:max-w-[440px] mx-auto transition-transform hover:scale-[1.02] duration-300">
              <img
                src="/wishlist-bag-heart.png"
                alt="Your Wishlist is Empty — Bingooo"
                className="w-full h-auto object-contain mx-auto"
              />
            </div>

            {/* Headline & Description */}
            <div className="space-y-3 max-w-lg mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717]">
                Your Wishlist is Empty
              </h1>
              <p className="text-sm sm:text-base text-[#6f6a63] leading-relaxed">
                Looks like you haven&apos;t saved anything yet. Find something you love and add it to your wishlist.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                to="/shop"
                onClick={() => triggerHaptic('medium')}
                className="inline-flex items-center justify-center h-12 px-8 rounded-[4px] bg-[#e6321c] hover:bg-[#b91f12] text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-md hover:shadow-lg"
              >
                <span>EXPLORE COLLECTIONS</span>
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* 3 Pillar Features */}
            <div className="pt-10 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 items-center">
              <div className="text-center space-y-2">
                <Heart className="w-5 h-5 mx-auto text-[#171717] stroke-[1.6]" />
                <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#171717]">
                  SAVE YOUR<br className="hidden sm:block" /> FAVORITE STYLES
                </div>
              </div>

              <div className="text-center space-y-2 sm:border-x sm:border-[#ddd3c5] sm:px-4">
                <ShoppingBag className="w-5 h-5 mx-auto text-[#171717] stroke-[1.6]" />
                <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#171717]">
                  COME BACK<br className="hidden sm:block" /> ANYTIME
                </div>
              </div>

              <div className="text-center space-y-2">
                <Star className="w-5 h-5 mx-auto text-[#171717] stroke-[1.6]" />
                <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#171717]">
                  BUILD YOUR<br className="hidden sm:block" /> PERFECT LOOK
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Corner Stamps */}
          <div className="flex items-end justify-between pt-8 border-t border-[#ddd3c5]/60 text-xs">
            <div className="space-y-1 text-left">
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#171717]">
                MORE THAN CLOTHES.
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#6f6a63]">
                A CULTURE.
              </div>
              <div className="w-6 h-[1.5px] bg-[#171717] mt-1" />
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#171717]">
                EST 2024
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#6f6a63]">
                INDIA
              </div>
              <div className="w-6 h-[1.5px] bg-[#171717] ml-auto mt-1" />
            </div>
          </div>
        </section>

        {/* Guest prompt if not signed in */}
        {!isAuthenticated && (
          <section className="container-bingooo pb-12">
            <div className="p-6 bg-[#ede0cc] border border-[#ddd3c5] rounded-[4px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                className="inline-flex items-center justify-center h-10 px-5 bg-[#171717] text-white text-[9px] font-extrabold uppercase tracking-wider hover:bg-[#e6321c] transition-colors shrink-0 rounded-[4px]"
              >
                SIGN IN / REGISTER →
              </Link>
            </div>
          </section>
        )}

        {/* Recommended Drops */}
        <section className="py-16 bg-[#ede0cc] border-t border-[#ddd3c5]">
          <div className="container-bingooo">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-3">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-1.5">
                  CURATED FOR YOU
                </div>
                <h2 className="m-0 text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-[-0.06em] uppercase text-[#171717]">
                  RECOMMENDED DROPS
                </h2>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#171717] hover:text-[#e6321c] transition-colors"
              >
                <span>VIEW FULL COLLECTION</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {curatedPicks.map((prod) => (
                <article
                  key={prod.id}
                  className="group flex flex-col justify-between bg-[#f7eedb] border border-[#ddd3c5] p-3 text-left transition-colors hover:border-[#171717] rounded-[4px]"
                >
                  <div>
                    <div className="aspect-[4/5] bg-[#ede0cc] overflow-hidden relative rounded-[2px]">
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
                      className="w-full h-8 flex items-center justify-center border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-[9px] font-extrabold uppercase tracking-wider transition-colors rounded-[2px]"
                    >
                      VIEW GARMENT →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // POPULATED WISHLIST STATE (When User Has Saved Items)
  // ═══════════════════════════════════════════════════════════
  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen selection:bg-[#e6321c] selection:text-white">
      <SEO
        title="My Wishlist — BINGOOO"
        description="View and manage your saved heavyweight streetwear styles, move items to cart, and track favorite menswear drops at Bingooo."
        canonical="https://bingooo.in/wishlist"
        noindex={true}
      />

      {/* =======================================================
           HERO SECTION (Replaced Old Unsplash Image with Custom Artwork)
      ======================================================= */}
      <section className="min-h-[500px] lg:min-h-[540px] grid grid-cols-1 lg:grid-cols-[45%_55%] bg-[#f7eedb] border-b border-[#ddd3c5]">
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
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="inline-flex items-center justify-center min-h-[46px] px-6 rounded-[4px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#e6321c] transition-colors cursor-pointer"
            >
              MOVE ALL TO BAG ({items.length}) →
            </button>

            <Link
              to="/shop"
              className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717] hover:text-[#e6321c] border-b border-[#171717] hover:border-[#e6321c] pb-1 ml-2 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        {/* Replaced old Unsplash model photo with customized artwork */}
        <div className="h-[340px] sm:h-[420px] lg:h-auto overflow-hidden relative flex items-center justify-center bg-[#ede0cc]/40 p-6 sm:p-10 border-t lg:border-t-0 lg:border-l border-[#ddd3c5]">
          <img
            src="/empty-wishlist-art.png"
            alt="Bingooo curated wishlist archive"
            className="w-full h-full object-contain max-h-[460px] drop-shadow-xs"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT SECTION
      ======================================================= */}
      <section className="py-[clamp(60px,8vw,100px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-3">
          PERSONAL STYLE
        </div>

        <h2 className="max-w-[950px] mx-auto m-0 text-[clamp(36px,6vw,76px)] leading-[0.92] font-extrabold tracking-[-0.07em] uppercase text-white">
          STYLE ISN'T WHAT EVERYONE <span className="text-[#e6321c]">WEARS.</span><br />
          IT'S WHAT FEELS LIKE <span className="text-[#e6321c]">YOU.</span>
        </h2>
      </section>

      {/* =======================================================
           NUMBERS / STATS STRIP
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
           MAIN WISHLIST SECTION (Items Grid)
      ======================================================= */}
      <section className="py-[clamp(60px,8vw,100px)]" id="wishlist-grid">
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
                  className="group flex flex-col justify-between bg-[#ede0cc]/40 border border-[#ddd3c5] p-3 sm:p-4 text-left transition-colors hover:border-[#171717] rounded-[4px]"
                >
                  <div>
                    {/* Image Canvas with Heart Button */}
                    <div className="relative aspect-[4/5] bg-[#ede0cc] overflow-hidden rounded-[2px]">
                      <Link to={`/product/${item.slug}`} className="block w-full h-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-[#e6321c] flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Heart size={15} className="fill-[#e6321c] text-[#e6321c]" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="pt-3">
                      <div className="flex items-center justify-between text-[10px] text-[#6f6a63] font-mono uppercase mb-1">
                        <span>{item.color}</span>
                        <span>Size {item.size}</span>
                      </div>

                      <Link to={`/product/${item.slug}`}>
                        <h3 className="text-xs sm:text-sm font-extrabold uppercase text-[#171717] group-hover:text-[#e6321c] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-[#171717]">
                          ₹{item.price}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-[#6f6a63] line-through">
                            ₹{item.compareAtPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#ddd3c5] grid grid-cols-[1fr_36px] gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="h-9 flex items-center justify-center gap-1.5 bg-[#171717] text-white text-[9px] font-extrabold uppercase tracking-wider hover:bg-[#e6321c] transition-colors cursor-pointer rounded-[2px]"
                    >
                      <ShoppingBag size={12} />
                      <span>MOVE TO BAG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="h-9 flex items-center justify-center border border-[#ddd3c5] bg-white text-[#6f6a63] hover:text-[#e6321c] hover:border-[#e6321c] transition-colors cursor-pointer rounded-[2px]"
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
                className="group flex flex-col justify-between bg-[#f7eedb] border border-[#ddd3c5] p-3 text-left transition-colors hover:border-[#171717] rounded-[4px]"
              >
                <div>
                  <div className="aspect-[4/5] bg-[#ede0cc] overflow-hidden relative rounded-[2px]">
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
                    className="w-full h-8 flex items-center justify-center border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-[9px] font-extrabold uppercase tracking-wider transition-colors rounded-[2px]"
                  >
                    VIEW GARMENT →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
           TRUST & PERKS STRIP
      ======================================================= */}
      <section className="py-12 bg-[#f7eedb] border-t border-[#ddd3c5]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Truck size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#171717]">
                EXPRESS DISPATCH
              </div>
              <p className="text-[10px] text-[#6f6a63] mt-0.5">3-5 Day delivery across India</p>
            </div>

            <div className="flex flex-col items-center">
              <RotateCcw size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#171717]">
                7-DAY DOORSTEP EXCHANGE
              </div>
              <p className="text-[10px] text-[#6f6a63] mt-0.5">Complimentary reverse courier</p>
            </div>

            <div className="flex flex-col items-center">
              <ShieldCheck size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#171717]">
                AUTHENTIC QUALITY
              </div>
              <p className="text-[10px] text-[#6f6a63] mt-0.5">240 GSM combed cotton</p>
            </div>

            <div className="flex flex-col items-center">
              <Headphones size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#171717]">
                DIRECT SUPPORT
              </div>
              <p className="text-[10px] text-[#6f6a63] mt-0.5">WhatsApp & email concierge</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default WishlistPage;
