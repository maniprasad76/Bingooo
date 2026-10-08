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
import { useProducts } from '../hooks/useProducts';
import { ProductPlaceholder } from '../components/ui/ProductPlaceholder';

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
      image: p.images?.[0]?.url || p.images?.[0]?.object_key || '',
      category: p.category?.name || p.category || 'APPAREL',
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
    addItem(item.variantId, 1, undefined, {
      title: item.title,
      image: item.image,
      size: item.size,
      slug: item.slug,
      price: item.price,
      category: item.category || 'APPAREL',
    });
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
      if (item.variantId) {
        addItem(item.variantId, 1, undefined, {
          title: item.title,
          image: item.image,
          size: item.size,
          slug: item.slug,
          price: item.price,
          category: item.category || 'APPAREL',
        });
      }
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

  // Curated recommendations from the live catalog
  const { data: picksData } = useProducts({ limit: 4 });
  const curatedPicks: any[] = picksData?.data ?? [];

  // ═══════════════════════════════════════════════════════════
  // EMPTY WISHLIST STATE (Matches the Exact Brand Artwork)
  // ═══════════════════════════════════════════════════════════
  if (items.length === 0 && !isLoading) {
    return (
      <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-screen selection:bg-[#e6321c] selection:text-white">
        <SEO
          title="Your Wishlist is Empty — BINGOOO"
          description="Your wishlist is waiting. Explore our collection of premium heavyweight silhouettes and custom pieces."
          canonical="https://www.bingooo.co.in/wishlist"
          noindex={true}
        />

        {/* ── Editorial Empty Wishlist Canvas ── */}
        <section className="relative px-6 sm:px-12 py-10 sm:py-16 max-w-6xl mx-auto flex flex-col justify-between min-h-[80vh]">
          {/* Top Brand Corner Headers */}
          <div className="flex items-start justify-between gap-4 w-full pb-4 border-b-2 border-[#171717]">
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#171717] uppercase">
                BINGOOO<span className="text-[#e6321c]">.</span>
              </div>
              <div className="text-[10px] font-mono font-black tracking-wider text-[#6f6a63] uppercase mt-0.5">
                CLOTHING // CUSTOM // CULTURE
              </div>
            </div>
            <div className="text-right">
              <span className="border-2 border-[#171717] bg-white px-2.5 py-1 font-mono text-[9px] font-black tracking-widest uppercase shadow-[2px_2px_0px_#171717]">
                WEAR WHAT DEFINES YOU.
              </span>
            </div>
          </div>

          {/* Central Artwork & Callout */}
          <div className="my-auto py-8 sm:py-12 text-center space-y-6">
            {/* Hand-crafted bag with heart artwork */}
            <div className="relative inline-block max-w-[320px] sm:max-w-[380px] mx-auto border-2 border-[#171717] bg-white p-4 shadow-[4px_4px_0px_#171717]">
              <img
                src="/wishlist-bag-heart.png"
                alt="Your Wishlist is Empty — Bingooo"
                className="w-full h-auto object-contain mx-auto"
              />
            </div>

            {/* Headline & Description */}
            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-block border border-[#171717] bg-white px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider">
                EMPTY ARCHIVE
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase text-[#171717]">
                Your Wishlist is Empty
              </h1>
              <p className="text-xs sm:text-sm text-[#6f6a63] leading-relaxed">
                Looks like you haven&apos;t saved anything yet. Find something you love and save it to your archive.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                to="/shop"
                onClick={() => triggerHaptic('medium')}
                className="btn-bauhaus inline-flex items-center justify-center h-12 px-8 bg-[#e6321c] text-white border-2 border-[#171717] text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#171717] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                <span>EXPLORE COLLECTIONS</span>
                <span className="ml-2 font-mono">→</span>
              </Link>
            </div>

            {/* 3 Pillar Features */}
            <div className="pt-8 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border-2 border-[#171717] bg-white p-4 shadow-[2px_2px_0px_#171717] text-center space-y-2">
                <Heart className="w-5 h-5 mx-auto text-[#e6321c]" />
                <div className="text-[10px] font-mono font-black tracking-wider uppercase text-[#171717]">
                  SAVE FAVORITE STYLES
                </div>
              </div>

              <div className="border-2 border-[#171717] bg-white p-4 shadow-[2px_2px_0px_#171717] text-center space-y-2">
                <ShoppingBag className="w-5 h-5 mx-auto text-[#171717]" />
                <div className="text-[10px] font-mono font-black tracking-wider uppercase text-[#171717]">
                  INSTANT CHECKOUT READY
                </div>
              </div>

              <div className="border-2 border-[#171717] bg-white p-4 shadow-[2px_2px_0px_#171717] text-center space-y-2">
                <Star className="w-5 h-5 mx-auto text-[#171717]" />
                <div className="text-[10px] font-mono font-black tracking-wider uppercase text-[#171717]">
                  CURATE PERFECT LOOK
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Corner Stamps */}
          <div className="flex items-end justify-between pt-6 border-t-2 border-[#171717] text-xs">
            <div className="space-y-1 text-left">
              <div className="font-mono text-[9px] sm:text-[10px] font-black uppercase text-[#171717]">
                MORE THAN CLOTHES.
              </div>
              <div className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-[#6f6a63]">
                A CULTURE.
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div className="font-mono text-[9px] sm:text-[10px] font-black uppercase text-[#171717]">
                EST 2024
              </div>
              <div className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-[#6f6a63]">
                INDIA
              </div>
            </div>
          </div>
        </section>

        {/* Guest prompt if not signed in */}
        {!isAuthenticated && (
          <section className="container-bingooo pb-12">
            <div className="p-6 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-[#171717]">
                  SIGN IN TO SYNC YOUR SAVED PIECES
                </h3>
                <p className="text-xs text-[#6f6a63] mt-1 font-mono">
                  Create an account or sign in to access your saved garments across devices and receive restock alerts.
                </p>
              </div>
              <Link
                to="/login"
                className="btn-bauhaus inline-flex items-center justify-center h-10 px-5 bg-[#171717] text-white border-2 border-[#171717] font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717] hover:bg-[#e6321c] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all shrink-0"
              >
                SIGN IN / REGISTER →
              </Link>
            </div>
          </section>
        )}

        {/* Recommended Drops — real catalog only; hidden while the store has no products */}
        {curatedPicks.length > 0 && (
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
                          {prod.images?.[0]?.url ? (
                            <img
                              src={prod.images[0].url}
                              alt={prod.title}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                            />
                          ) : (
                            <ProductPlaceholder name={prod.title} />
                          )}
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
        )}
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
        canonical="https://www.bingooo.co.in/wishlist"
        noindex={true}
      />

      {/* =======================================================
           HERO SECTION (Bauhaus Editorial Hero)
      ======================================================= */}
      <section className="min-h-[460px] lg:min-h-[500px] grid grid-cols-1 lg:grid-cols-[50%_50%] bg-[#f7eedb] border-b-2 border-[#171717]">
        <div className="flex flex-col justify-center py-10 px-6 sm:px-10 lg:py-14 lg:px-14">
          <div className="inline-flex items-center gap-2 border-2 border-[#171717] bg-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#171717] mb-4 w-max">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>01 // CURATED ARCHIVE</span>
          </div>

          <h1 className="my-2 mb-4 text-[clamp(44px,6.5vw,90px)] font-black leading-[0.85] tracking-[-3px] sm:tracking-[-5px] uppercase">
            <span className="block">YOUR</span>
            <span className="block">SAVED</span>
            <span className="block text-[#e6321c]">PIECES.</span>
          </h1>

          <p className="max-w-[420px] m-0 mb-6 text-[#6f6a63] text-xs sm:text-sm font-medium leading-relaxed">
            Your personal archive of heavyweight silhouettes, limited drops, and custom pieces waiting to be tailored.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="btn-bauhaus inline-flex items-center justify-center min-h-[48px] px-6 bg-[#171717] text-white border-2 border-[#171717] font-mono text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#e6321c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              MOVE ALL TO BAG ({items.length}) →
            </button>

            <Link
              to="/shop"
              className="btn-bauhaus inline-flex items-center justify-center min-h-[48px] px-5 bg-white text-[#171717] border-2 border-[#171717] font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        {/* Editorial Artwork Shot */}
        <div className="h-[300px] sm:h-[380px] lg:h-auto overflow-hidden relative flex items-center justify-center bg-white p-6 sm:p-10 border-t-2 lg:border-t-0 lg:border-l-2 border-[#171717]">
          <img
            src="/empty-wishlist-art.png"
            alt="Bingooo curated wishlist archive"
            className="w-full h-full object-contain max-h-[420px]"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT SECTION
      ======================================================= */}
      <section className="py-12 sm:py-16 px-5 bg-[#171717] text-white text-center border-y-2 border-[#171717]">
        <div className="inline-block border border-white/40 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider mb-3">
          PERSONAL STYLE
        </div>

        <h2 className="max-w-[950px] mx-auto m-0 text-[clamp(32px,5.5vw,70px)] leading-[0.92] font-black tracking-tight uppercase text-white">
          STYLE ISN'T WHAT EVERYONE <span className="text-[#e6321c]">WEARS.</span><br />
          IT'S WHAT FEELS LIKE <span className="text-[#e6321c]">YOU.</span>
        </h2>
      </section>

      {/* =======================================================
           NUMBERS / STATS STRIP
      ======================================================= */}
      <section className="py-8 bg-[#f7eedb] border-b-2 border-[#171717]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
              <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
                {items.length}
              </div>
              <div className="mt-1 font-mono text-[9px] font-black uppercase text-[#6f6a63]">
                SAVED GARMENTS
              </div>
            </div>

            <div className="p-4 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
              <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
              <div className="mt-1 font-mono text-[9px] font-black uppercase text-[#6f6a63]">
                TOTAL ARCHIVE VALUE
              </div>
            </div>

            <div className="p-4 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
              <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
                FREE
              </div>
              <div className="mt-1 font-mono text-[9px] font-black uppercase text-[#6f6a63]">
                PAN-INDIA DELIVERY
              </div>
            </div>

            <div className="p-4 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
              <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-[#e6321c]">
                7 DAYS
              </div>
              <div className="mt-1 font-mono text-[9px] font-black uppercase text-[#6f6a63]">
                DOORSTEP EXCHANGE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           MAIN WISHLIST SECTION (Items Grid)
      ======================================================= */}
      <section className="py-14 sm:py-20" id="wishlist-grid">
        <div className="container-bingooo">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 pb-4 border-b-2 border-[#171717]">
            <div>
              <div className="inline-block border border-[#171717] bg-white px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                PERSONAL SELECTION
              </div>
              <h2 className="m-0 text-2xl sm:text-4xl font-black tracking-tight uppercase">
                SAVED ARCHIVE ({items.length})
              </h2>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="btn-bauhaus inline-flex items-center gap-2 px-4 py-2 border-2 border-[#171717] bg-[#E6321C] text-white font-mono text-[10px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#171717] hover:bg-[#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                <ShoppingBag size={13} />
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
                  className="group flex flex-col justify-between border-2 border-[#171717] bg-white p-3 sm:p-4 shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] transition-all"
                >
                  <div>
                    {/* Image Canvas with Heart Button */}
                    <div className="relative aspect-[4/5] border-2 border-[#171717] bg-[#F7EEDB] overflow-hidden shadow-[2px_2px_0px_#171717]">
                      <Link to={`/product/${item.slug}`} className="block w-full h-full">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ProductPlaceholder name={item.title} />
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="btn-bauhaus absolute top-2.5 right-2.5 w-8 h-8 border-2 border-[#171717] bg-white text-[#e6321c] flex items-center justify-center shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Heart size={14} className="fill-[#e6321c] text-[#e6321c]" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="pt-3">
                      <div className="flex items-center justify-between font-mono text-[9px] font-bold text-[#6f6a63] uppercase mb-1">
                        <span className="border border-[#171717]/20 px-1 bg-[#F7EEDB]/50">{item.color}</span>
                        <span className="border border-[#171717]/20 px-1 bg-[#F7EEDB]/50">Size {item.size}</span>
                      </div>

                      <Link to={`/product/${item.slug}`}>
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[#171717] group-hover:text-[#e6321c] transition-colors line-clamp-1 mb-1">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono text-sm sm:text-base font-black text-[#171717]">
                          ₹{item.price}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="font-mono text-xs text-[#6f6a63] line-through">
                            ₹{item.compareAtPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t-2 border-[#171717] grid grid-cols-[1fr_36px] gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="btn-bauhaus h-9 flex items-center justify-center gap-1.5 bg-[#171717] text-white border-2 border-[#171717] font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717] hover:bg-[#e6321c] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      <ShoppingBag size={12} />
                      <span>MOVE TO BAG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="btn-bauhaus h-9 flex items-center justify-center border-2 border-[#171717] bg-white text-[#6f6a63] hover:text-[#e6321c] hover:border-[#e6321c] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
           TRUST & PERKS STRIP (Bauhaus 4-Column Bar)
      ======================================================= */}
      <section className="py-10 bg-white border-t-2 border-[#171717]">
        <div className="container-bingooo">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-[#171717] bg-[#F7EEDB] p-4 shadow-[2px_2px_0px_#171717] flex flex-col items-center text-center">
              <Truck size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-black uppercase tracking-tight text-[#171717]">
                EXPRESS DISPATCH
              </div>
              <p className="text-[10px] font-mono text-[#6f6a63] uppercase mt-0.5">3-5 Days Pan-India</p>
            </div>

            <div className="border-2 border-[#171717] bg-[#F7EEDB] p-4 shadow-[2px_2px_0px_#171717] flex flex-col items-center text-center">
              <RotateCcw size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-black uppercase tracking-tight text-[#171717]">
                7-DAY EXCHANGE
              </div>
              <p className="text-[10px] font-mono text-[#6f6a63] uppercase mt-0.5">Doorstep Fit Courier</p>
            </div>

            <div className="border-2 border-[#171717] bg-[#F7EEDB] p-4 shadow-[2px_2px_0px_#171717] flex flex-col items-center text-center">
              <ShieldCheck size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-black uppercase tracking-tight text-[#171717]">
                240+ GSM COTTON
              </div>
              <p className="text-[10px] font-mono text-[#6f6a63] uppercase mt-0.5">Authentic Combed Yarn</p>
            </div>

            <div className="border-2 border-[#171717] bg-[#F7EEDB] p-4 shadow-[2px_2px_0px_#171717] flex flex-col items-center text-center">
              <Headphones size={22} className="text-[#e6321c] mb-2" />
              <div className="text-[11px] font-black uppercase tracking-tight text-[#171717]">
                DIRECT CONCIERGE
              </div>
              <p className="text-[10px] font-mono text-[#6f6a63] uppercase mt-0.5">WhatsApp Support</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default WishlistPage;
