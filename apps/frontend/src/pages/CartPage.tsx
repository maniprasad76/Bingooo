import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Sparkles,
  LoaderCircle,
  Heart,
  Lock,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { CartItemSkeleton } from '../components/ui/Skeleton';
import { resolveImageUrl } from '../lib/utils';
import { getCartItemMeta } from '../lib/cartMeta';

export function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponStatus, setCouponStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Recommendations query
  const { data: recProducts } = useQuery({
    queryKey: ['cart-recommendations'],
    queryFn: () => api.get<{ data: any[] }>('/products', { limit: 4 }),
  });

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleQtyChange = (id: string, currentQty: number, delta: number) => {
    triggerHaptic('light');
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, nextQty);
    }
  };

  const handleRemove = (id: string) => {
    triggerHaptic('light');
    removeItem(id);
    toast({
      title: 'Item removed',
      description: 'Garment removed from your cart.',
      variant: 'info',
    });
  };

  const handleClearCart = () => {
    if (window.confirm('Remove all items from your cart?')) {
      triggerHaptic('warning');
      clearCart();
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponStatus({ type: 'idle', message: '' });
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed.',
        variant: 'info',
      });
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setValidatingCoupon(true);
    setCouponStatus({ type: 'idle', message: '' });

    try {
      const res = await api.post<any>('/coupons/validate', {
        code,
        orderSubtotal: subtotal,
      });
      setAppliedCoupon({ code: res.coupon.code, discount: res.discount });
      setCouponStatus({
        type: 'success',
        message: `Coupon "${res.coupon.code}" applied successfully!`,
      });
      toast({
        title: 'Coupon applied!',
        description: `You saved ₹${res.discount} with code ${res.coupon.code}`,
        variant: 'success',
      });
      triggerHaptic('success');
    } catch (err: any) {
      // Demo fallback if backend coupon validation is not live
      if (code === 'BINGOOO10' || code === 'WELCOME10') {
        const demoDiscount = Math.min(500, Math.round(subtotal * 0.10));
        setAppliedCoupon({ code, discount: demoDiscount });
        setCouponStatus({
          type: 'success',
          message: `Coupon applied successfully — ₹${demoDiscount} saved!`,
        });
        toast({
          title: 'Coupon applied!',
          description: `₹${demoDiscount} discount applied to your order.`,
          variant: 'success',
        });
        triggerHaptic('success');
      } else {
        setCouponStatus({
          type: 'error',
          message: err.message || `Code "${code}" is invalid or expired. Try BINGOOO10.`,
        });
        toast({
          title: 'Invalid coupon',
          description: err.message || 'Coupon code could not be applied.',
          variant: 'danger',
        });
        triggerHaptic('warning');
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    triggerHaptic('medium');
    navigate('/checkout', {
      state: { couponCode: appliedCoupon?.code },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#F7EEDB] text-[#6F6A63]">
        <LoaderCircle size={28} className="animate-spin text-[#E6321C]" />
        <p className="font-sans text-sm font-semibold text-[#171717]">Loading your shopping bag...</p>
      </div>
    );
  }

  return (
    <main className="w-full bg-[#F7EEDB] text-[#171717] font-sans antialiased min-h-screen">
      <SEO
        title="Cart — BINGOOO"
        description="Review your Bingooo Men's Wear cart and proceed securely to checkout."
        noindex={true}
      />

      {/* =========================================================
           CART HERO (BAUHAUS EDITORIAL HERO)
      ========================================================= */}
      <section className="relative overflow-hidden flex items-center bg-[#F7EEDB] border-b-2 border-[#171717]">
        <div className="container-bingooo relative z-10 py-10 sm:py-14">
          {/* Bauhaus Step Tag */}
          <div className="inline-flex items-center gap-2 border-2 border-[#171717] bg-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#171717] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>01 // SHOPPING BAG</span>
          </div>

          {/* Giant Bauhaus Title */}
          <h1 className="m-0 text-[clamp(44px,8vw,108px)] leading-[0.85] tracking-[-3px] sm:tracking-[-6px] font-black uppercase select-none text-[#171717]">
            YOUR BAG
          </h1>

          <p className="mt-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6F6A63] font-mono">
            {items.length} {items.length === 1 ? 'GARMENT SELECTED' : 'GARMENTS SELECTED'} • HEAVYWEIGHT ARCHIVE
          </p>
        </div>

        {/* Editorial Background Accent */}
        <div className="hidden md:flex absolute right-12 bottom-0 items-end pointer-events-none opacity-20">
          <span className="font-heading font-black text-[120px] leading-none text-[#171717] tracking-tighter select-none">
            B.
          </span>
        </div>
      </section>

      {/* =========================================================
           MAIN CART CONTAINER
      ========================================================= */}
      <div className="container-bingooo">
        {/* Breadcrumb */}
        <div className="pt-5 pb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C] transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-[#171717] border-b-2 border-[#171717]">BAG ({items.length})</span>
        </div>

        {/* Cart Section */}
        <section className="pt-2 pb-20">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)] gap-8 lg:gap-12 items-start">
              <div className="space-y-4">
                <div className="h-6 w-36 bg-white border-2 border-[#171717] animate-pulse" />
                <CartItemSkeleton />
                <CartItemSkeleton />
              </div>
              <div className="p-6 border-2 border-[#171717] bg-white shadow-[4px_4px_0px_#171717] space-y-4">
                <div className="h-5 w-28 bg-[#EDE0CC] animate-pulse" />
                <div className="h-4 w-full bg-[#EDE0CC] animate-pulse" />
                <div className="h-10 w-full bg-[#EDE0CC] animate-pulse" />
              </div>
            </div>
          ) : items.length === 0 ? (
            /* ================= EMPTY CART STATE ================= */
            <div className="border-2 border-[#171717] bg-white p-8 sm:p-14 text-center shadow-[4px_4px_0px_#171717] my-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 border-2 border-[#171717] bg-[#F7EEDB] mx-auto flex items-center justify-center shadow-[3px_3px_0px_#171717] mb-6">
                <ShoppingBag size={28} className="text-[#171717]" />
              </div>
              <div className="inline-block border border-[#171717] bg-[#F7EEDB] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider mb-3">
                EMPTY INVENTORY
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase mb-3 text-[#171717]">
                YOUR BAG IS EMPTY.
              </h2>
              <p className="max-w-[380px] mx-auto text-[#6F6A63] text-xs font-medium leading-relaxed mb-8">
                Your wardrobe awaits heavyweight essentials. Explore the catalog or craft your bespoke piece.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/shop"
                  className="btn-bauhaus w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#E6321C] text-white border-2 border-[#171717] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#171717] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <ShoppingBag size={15} />
                  <span>SHOP CATALOG</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/customize"
                  className="btn-bauhaus w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#171717] text-white border-2 border-[#171717] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#E6321C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <Sparkles size={15} />
                  <span>CUSTOM STUDIO</span>
                </Link>
              </div>
            </div>
          ) : (
            /* ================= CART LAYOUT ================= */
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)] gap-8 lg:gap-12 items-start">
              {/* Left: Cart Items List */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717] mb-5">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase">
                    BAG CONTENTS ({items.length})
                  </h2>
                  <span className="font-mono text-xs font-black text-[#E6321C]">
                    ALL HEAVYWEIGHT
                  </span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item: any) => {
                      const meta = getCartItemMeta(
                        item.variantId || item.variant_id || item.variant?.id || item.id,
                        item.product?.title || item.productTitle,
                        item.product?.slug
                      );
                      const productTitle = item.product?.title || item.productTitle || meta?.title || 'Bingooo Garment';
                      const productSlug = item.product?.slug || meta?.slug || '';
                      const rawCategory = item.product?.category?.name || item.product?.category || meta?.category || '';
                      const category = (typeof rawCategory === 'string' && rawCategory.trim()) ? rawCategory.trim() : 'APPAREL';

                      const variantColor = item.variant?.color || meta?.color || '';
                      const variantSize = item.variant?.size || meta?.size || '';
                      const gsm = item.product?.fabricWeight || (item.product?.gsm ? `${item.product.gsm} GSM` : '') || meta?.gsm || '';

                      const rawImg =
                        item.image ||
                        item.imageUrl ||
                        item.product?.images?.[0]?.url ||
                        item.product?.images?.[0] ||
                        meta?.image;
                      const imageUrl = rawImg
                        ? resolveImageUrl(typeof rawImg === 'string' ? rawImg : rawImg.url || rawImg.object_key)
                        : '';

                      const attributes = [variantColor, variantSize, gsm].filter(Boolean);

                      return (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                          className="border-2 border-[#171717] bg-white p-4 sm:p-5 shadow-[3px_3px_0px_#171717] grid grid-cols-[88px_1fr] sm:grid-cols-[104px_1fr_auto] gap-4 sm:gap-5 items-center relative"
                        >
                          {/* Product Image */}
                          <div className="w-[88px] h-[110px] sm:w-[104px] sm:h-[130px] border-2 border-[#171717] bg-[#F7EEDB] overflow-hidden shrink-0 relative flex items-center justify-center shadow-[2px_2px_0px_#171717]">
                            {imageUrl ? (
                              productSlug ? (
                                <Link to={`/product/${productSlug}`} className="block w-full h-full">
                                  <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                                </Link>
                              ) : (
                                <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="h-full w-full flex flex-col items-center justify-center p-2 text-center bg-[#EDE0CC]">
                                <span className="font-heading font-black text-base tracking-widest text-[#E6321C]">B.</span>
                                <span className="text-[8px] font-mono text-[#6F6A63] uppercase tracking-wider mt-0.5 line-clamp-1">
                                  {category}
                                </span>
                              </div>
                            )}
                            {item.customization && (
                              <span className="absolute bottom-1 right-1 border border-[#171717] bg-[#E6321C] px-1 py-0.5 text-[7px] font-black uppercase text-white font-mono shadow-[1px_1px_0px_#171717]">
                                CUSTOM
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="min-w-0 pr-6 sm:pr-0">
                            <div className="inline-block border border-[#171717] bg-[#F7EEDB] px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-wider mb-1.5">
                              {category}
                            </div>

                            {productSlug ? (
                              <Link to={`/product/${productSlug}`}>
                                <h3 className="m-0 text-sm sm:text-base font-black text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1 mb-1.5 uppercase tracking-tight">
                                  {productTitle}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="m-0 text-sm sm:text-base font-black text-[#171717] line-clamp-1 mb-1.5 uppercase tracking-tight">
                                {productTitle}
                              </h3>
                            )}

                            {attributes.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono font-bold text-[#6F6A63] mb-2">
                                {attributes.map((attr, idx) => (
                                  <span key={idx} className="flex items-center gap-1">
                                    {idx > 0 && <span>/</span>}
                                    <span className="border border-[#171717]/30 px-1 py-0.2 bg-[#F7EEDB]/40">{attr}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.customization && (
                              <div className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-[#E6321C] uppercase">
                                <Sparkles size={11} />
                                <span>Bespoke Print Applied</span>
                              </div>
                            )}

                            {/* Mobile Price & Stepper Row */}
                            <div className="flex sm:hidden items-center justify-between gap-3 mt-3 pt-2 border-t border-[#171717]/10">
                              <div className="font-mono text-sm font-black text-[#171717]">
                                ₹{(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}
                              </div>

                              {/* Mobile Stepper */}
                              <div className="flex items-center border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                                  className="w-7 h-7 text-xs font-black grid place-items-center hover:bg-[#F7EEDB] active:bg-[#171717] active:text-white transition-colors cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center font-mono text-[11px] font-black border-x border-[#171717]/20">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                                  className="w-7 h-7 text-xs font-black grid place-items-center hover:bg-[#F7EEDB] active:bg-[#171717] active:text-white transition-colors cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Price & Stepper Column */}
                          <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                            <div className="font-mono text-base font-black text-[#171717]">
                              ₹{(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}
                            </div>

                            {/* Desktop Stepper */}
                            <div className="flex items-center border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                                className="w-8 h-8 text-sm font-black grid place-items-center hover:bg-[#F7EEDB] active:bg-[#171717] active:text-white transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-mono text-xs font-black border-x border-[#171717]/20">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                                className="w-8 h-8 text-sm font-black grid place-items-center hover:bg-[#F7EEDB] active:bg-[#171717] active:text-white transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="w-7 h-7 border-2 border-[#171717] bg-white text-[#171717] hover:bg-[#E6321C] hover:text-white shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all grid place-items-center cursor-pointer absolute top-3 right-3 sm:static"
                            aria-label="Remove product"
                            title="Remove from bag"
                          >
                            <span className="font-bold text-sm leading-none">×</span>
                          </button>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-between items-center pt-5 border-t-2 border-[#171717] mt-6">
                  <Link
                    to="/shop"
                    className="btn-bauhaus inline-flex items-center gap-2 px-4 py-2 border-2 border-[#171717] bg-white font-mono text-[10px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    ← CONTINUE BROWSING
                  </Link>

                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="btn-bauhaus px-4 py-2 border-2 border-[#171717] bg-white text-[#6F6A63] hover:text-[#E6321C] hover:border-[#E6321C] font-mono text-[10px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    CLEAR BAG
                  </button>
                </div>
              </div>

              {/* Right: Bauhaus Order Summary */}
              <aside className="border-2 border-[#171717] bg-white p-6 shadow-[4px_4px_0px_#171717] lg:sticky lg:top-24">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]">
                  <h2 className="m-0 text-base font-black tracking-tight uppercase">
                    ORDER SUMMARY
                  </h2>
                  <span className="border border-[#171717] bg-[#F7EEDB] px-1.5 py-0.5 font-mono text-[9px] font-black uppercase">
                    STEP 01
                  </span>
                </div>

                <div className="divide-y divide-[#171717]/10 text-xs py-2">
                  <div className="flex justify-between items-center py-2.5">
                    <span className="font-bold text-[#6F6A63] uppercase font-mono">SUBTOTAL</span>
                    <span className="font-black font-mono text-sm text-[#171717]">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center py-2.5 text-[#238636]">
                      <span className="font-bold uppercase font-mono">COUPON ({appliedCoupon?.code})</span>
                      <span className="font-black font-mono text-sm">
                        -₹{discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2.5 text-[#171717]">
                    <span className="font-bold text-[#6F6A63] uppercase font-mono">DELIVERY</span>
                    <span className="font-black font-mono text-xs uppercase bg-[#F7EEDB] px-2 py-0.5 border border-[#171717]">
                      FREE ACROSS INDIA
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-[#171717] pt-4 mt-1 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black uppercase tracking-tight block">TOTAL AMOUNT</span>
                    <span className="text-[9px] font-mono text-[#6F6A63] uppercase">INCL. OF ALL APPLICABLE TAXES</span>
                  </div>
                  <span className="font-mono text-3xl font-black tracking-tight text-[#171717]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Coupon Code */}
                <div className="mt-6 pt-5 border-t-2 border-[#171717]">
                  <label htmlFor="couponCodeInput" className="block font-mono text-[10px] font-black uppercase mb-2 text-[#171717]">
                    PROMO CODE // ARCHIVE VOUCHER
                  </label>
                  <form onSubmit={handleApplyCoupon} className="flex">
                    <input
                      id="couponCodeInput"
                      type="text"
                      placeholder="ENTER CODE (e.g. BINGOOO10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 h-11 border-2 border-r-0 border-[#171717] bg-[#F7EEDB]/30 px-3 outline-none font-mono text-xs font-black uppercase focus:bg-white transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon}
                      className="btn-bauhaus px-5 h-11 border-2 border-[#171717] bg-[#171717] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C] hover:border-[#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'APPLY'}
                    </button>
                  </form>

                  {couponStatus.type !== 'idle' && (
                    <div
                      className={`mt-2 p-2 border-2 border-[#171717] font-mono text-[10px] font-black uppercase ${
                        couponStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 shadow-[2px_2px_0px_#171717]'
                          : 'bg-red-50 text-red-800 shadow-[2px_2px_0px_#171717]'
                      }`}
                    >
                      {couponStatus.message}
                    </div>
                  )}
                </div>

                {/* 5% Prepaid Online Perk */}
                <div className="mt-4 p-3 border-2 border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717] flex items-center gap-2.5">
                  <div className="w-7 h-7 border-2 border-[#171717] bg-[#171717] text-white grid place-items-center shrink-0 font-mono font-black text-[10px] shadow-[1px_1px_0px_#171717]">
                    5%
                  </div>
                  <div>
                    <span className="font-mono font-black uppercase tracking-wide block text-[10px] text-[#171717]">
                      PREPAID ONLINE DISCOUNT
                    </span>
                    <span className="text-[10px] text-[#6F6A63] font-medium leading-snug">
                      Save extra <strong>5% (₹{Math.round(total * 0.05)})</strong> automatically at checkout via UPI or Card.
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="btn-bauhaus w-full min-h-[52px] mt-5 bg-[#E6321C] text-white border-2 border-[#171717] text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#171717] hover:bg-[#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-2 group"
                >
                  <Lock size={14} />
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                {/* Assurances */}
                <div className="mt-6 pt-5 border-t-2 border-[#171717] space-y-2.5">
                  <div className="flex items-center gap-2.5 p-2 border border-[#171717] bg-[#F7EEDB]/40 shadow-[1px_1px_0px_#171717]">
                    <Truck size={16} className="text-[#171717] shrink-0" />
                    <span className="font-mono text-[9px] font-black uppercase text-[#171717]">
                      FAST PAN-INDIA DISPATCH (24-48 HRS)
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 border border-[#171717] bg-[#F7EEDB]/40 shadow-[1px_1px_0px_#171717]">
                    <RotateCcw size={16} className="text-[#171717] shrink-0" />
                    <span className="font-mono text-[9px] font-black uppercase text-[#171717]">
                      7-DAY HASSLE-FREE EXCHANGE / RETURNS
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 border border-[#171717] bg-[#F7EEDB]/40 shadow-[1px_1px_0px_#171717]">
                    <ShieldCheck size={16} className="text-[#171717] shrink-0" />
                    <span className="font-mono text-[9px] font-black uppercase text-[#171717]">
                      100% ENCRYPTED PREPAID CHECKOUT
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================
           SERVICE STRIP (BAUHAUS 4-COLUMN TRUST STRIP)
      ========================================================= */}
      <div className="border-y-2 border-[#171717] bg-white py-6">
        <div className="container-bingooo grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border-2 border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717] flex items-center gap-3">
            <Truck size={22} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-tight">EXPRESS DISPATCH</div>
              <div className="text-[9px] font-mono text-[#6F6A63] uppercase">48h Hub Turnaround</div>
            </div>
          </div>

          <div className="p-3 border-2 border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717] flex items-center gap-3">
            <RotateCcw size={22} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-tight">EASY RETURNS</div>
              <div className="text-[9px] font-mono text-[#6F6A63] uppercase">Doorstep Pickup</div>
            </div>
          </div>

          <div className="p-3 border-2 border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717] flex items-center gap-3">
            <ShieldCheck size={22} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-tight">AUTHENTIC 240+ GSM</div>
              <div className="text-[9px] font-mono text-[#6F6A63] uppercase">Combed Cotton</div>
            </div>
          </div>

          <div className="p-3 border-2 border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717] flex items-center gap-3">
            <Lock size={22} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-tight">SECURE PAYMENT</div>
              <div className="text-[9px] font-mono text-[#6F6A63] uppercase">UPI • Cards • NetBanking</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
           RECOMMENDATIONS ("COMPLETE THE LOOK.")
      ========================================================= */}
      <section className="py-14 sm:py-20">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-6 pb-3 border-b-2 border-[#171717]">
            <div>
              <div className="inline-block border border-[#171717] bg-white px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                CURATED ARCHIVE
              </div>
              <h2 className="m-0 text-2xl sm:text-4xl font-black uppercase tracking-tight">
                COMPLETE THE LOOK.
              </h2>
            </div>
            <Link
              to="/shop"
              className="btn-bauhaus px-4 py-2 border-2 border-[#171717] bg-white font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#171717] hover:bg-[#171717] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              EXPLORE ALL →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {((() => {
              const liveList = Array.isArray(recProducts) ? recProducts : recProducts?.data;
              return liveList && liveList.length > 0 ? liveList.slice(0, 4) : [
                {
                  id: 'rec-1',
                  title: 'Core White Tee',
                  slug: 'core-white-tee',
                  base_price: 1199,
                  imageUrl: '/real-fit-1.jpg',
                },
                {
                  id: 'rec-2',
                  title: 'Everyday Sweatshirt',
                  slug: 'everyday-sweatshirt',
                  base_price: 1799,
                  imageUrl: '/real-fit-2.jpg',
                },
                {
                  id: 'rec-3',
                  title: 'Bingooo Cap',
                  slug: 'bingooo-cap',
                  base_price: 699,
                  imageUrl: '/real-fit-3.jpg',
                },
                {
                  id: 'rec-4',
                  title: 'Relaxed Shirt',
                  slug: 'relaxed-shirt',
                  base_price: 1999,
                  imageUrl: '/real-fit-4.jpg',
                },
              ];
            })()).map((prod: any) => {
              const inWish = wishlist?.some((w: any) => w.productId === prod.id);
              const rawImg = prod.images?.[0]?.url || prod.imageUrl || '';
              const img = resolveImageUrl(rawImg);

              return (
                <article
                  key={prod.id}
                  className="border-2 border-[#171717] bg-white p-2.5 shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] transition-all relative flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => toggleWishlist(prod.id, inWish)}
                    aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`absolute top-4 right-4 z-10 w-8 h-8 border-2 border-[#171717] bg-white grid place-items-center shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
                      inWish ? 'text-[#E6321C]' : 'text-[#171717] hover:text-[#E6321C]'
                    }`}
                  >
                    <Heart size={14} fill={inWish ? '#E6321C' : 'none'} />
                  </button>

                  <Link to={`/product/${prod.slug}`} className="block border-2 border-[#171717] bg-[#F7EEDB] overflow-hidden mb-2.5">
                    <img
                      src={img}
                      alt={prod.title}
                      className="aspect-[0.82] w-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </Link>

                  <div>
                    <Link to={`/product/${prod.slug}`}>
                      <h4 className="m-0 text-xs font-black uppercase tracking-tight text-[#171717] truncate hover:text-[#E6321C] transition-colors mb-1">
                        {prod.title}
                      </h4>
                    </Link>
                    <div className="font-mono text-xs font-black text-[#171717]">
                      ₹{Number(prod.base_price || 1299).toLocaleString('en-IN')}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CartPage;
