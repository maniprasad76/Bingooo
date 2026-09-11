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
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

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
  const freeThreshold = cart?.freeShippingThreshold || 999;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : (cart?.shippingFee || 79);
  const total = Math.max(0, subtotal - discount + shippingFee);

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
           CART HERO (MINIMALIST EDITORIAL HERO)
      ========================================================= */}
      <section className="relative min-h-[320px] sm:min-h-[410px] overflow-hidden flex items-center bg-gradient-to-r from-[#F7EEDB] via-[#F7EEDB]/85 to-[#F7EEDB]/20 border-b border-[#DDD3C5]/70">
        <div className="container-bingooo relative z-10 py-12 sm:py-[70px]">
          {/* Top small editorial tag */}
          <div className="w-[85px] text-[9px] leading-[1.9] font-extrabold tracking-[3px] uppercase text-[#171717] mb-6">
            STYLE<br />
            TRAVELS<br />
            WITH YOU.
            <div className="w-8 h-[1px] bg-[#171717] mt-2.5" />
          </div>

          {/* Giant Title */}
          <h1 className="m-0 text-[clamp(64px,10vw,150px)] leading-[0.78] tracking-[-4px] sm:tracking-[-7px] font-extrabold uppercase select-none text-[#171717]">
            YOUR CART
          </h1>

          {/* Subtitle callout */}
          <div className="hidden sm:block absolute right-8 sm:right-16 bottom-10 w-[100px] text-[8px] leading-[1.8] tracking-[3px] font-extrabold uppercase text-[#171717]">
            READY<br />
            FOR WHAT'S<br />
            NEXT?
            <div className="w-[30px] h-[1px] bg-[#171717] mt-2" />
          </div>
        </div>

        {/* Editorial Campaign Model Shot */}
        <div className="absolute right-[5%] sm:right-[20%] bottom-0 w-[180px] sm:w-[280px] h-[300px] sm:h-[390px] z-[2] flex items-end justify-center pointer-events-none opacity-85 sm:opacity-95">
          <img
            src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=700&q=85"
            alt="Bingooo Men's Wear editorial"
            className="w-full h-full object-cover object-top grayscale contrast-105"
          />
        </div>
      </section>

      {/* =========================================================
           MAIN CART CONTAINER
      ========================================================= */}
      <div className="container-bingooo">
        {/* Breadcrumb */}
        <div className="pt-6 pb-3 flex items-center gap-2 text-[10px] text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
          <span>›</span>
          <span className="text-[#171717] font-bold">Cart</span>
        </div>

        {/* Cart Section */}
        <section className="pt-4 pb-20">
          {items.length === 0 ? (
            /* ================= EMPTY CART STATE ================= */
            <div className="text-center py-24 px-5">
              <h2 className="text-[44px] sm:text-[48px] font-extrabold tracking-[-2px] uppercase mb-3">
                YOUR CART IS EMPTY.
              </h2>
              <p className="max-w-[420px] mx-auto text-[#6F6A63] text-[12px] leading-relaxed mb-6">
                Nothing here yet. Find something that feels like you.
              </p>
              <Link
                to="/shop"
                className="inline-flex h-12 items-center px-8 bg-[#171717] text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#E6321C] transition-colors"
              >
                SHOP THE COLLECTION →
              </Link>
            </div>
          ) : (
            /* ================= CART LAYOUT ================= */
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)] gap-10 lg:gap-14 items-start">
              {/* Left: Cart Items List */}
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.8px] uppercase mb-5">
                  CART ITEMS ({items.length})
                </h2>

                <div className="divide-y divide-[#DDD3C5]">
                  <AnimatePresence initial={false}>
                    {items.map((item: any) => {
                      const productTitle = item.product?.title || item.productTitle || 'Bingooo Garment';
                      const productSlug = item.product?.slug || '';
                      const category = item.product?.category || 'T-SHIRTS';
                      const variantColor = item.variant?.color || 'Black';
                      const variantSize = item.variant?.size || 'L';
                      const gsm = item.product?.fabricWeight || '240 GSM';
                      const imageUrl = item.product?.images?.[0]?.url || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=85';

                      return (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }}
                          className="py-4 sm:py-5 grid grid-cols-[88px_1fr_auto] sm:grid-cols-[112px_1fr_auto_auto_auto] gap-4 sm:gap-5 items-center relative"
                        >
                          {/* Product Image */}
                          <div className="w-[88px] h-[110px] sm:w-[112px] sm:h-[138px] bg-[#E5DDD0] overflow-hidden shrink-0 relative">
                            {productSlug ? (
                              <Link to={`/product/${productSlug}`} className="block w-full h-full">
                                <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                              </Link>
                            ) : (
                              <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                            )}
                            {item.customization && (
                              <span className="absolute bottom-1 right-1 rounded-none bg-[#E6321C] px-1 py-0.5 text-[7px] font-extrabold uppercase text-white font-mono">
                                CUSTOM
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="min-w-0 pr-2">
                            <div className="text-[8px] text-[#6F6A63] font-extrabold tracking-[1.4px] uppercase mb-1.5">
                              {category}
                            </div>

                            {productSlug ? (
                              <Link to={`/product/${productSlug}`}>
                                <h3 className="m-0 text-[14px] font-extrabold text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1 mb-1.5">
                                  {productTitle}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="m-0 text-[14px] font-extrabold text-[#171717] line-clamp-1 mb-1.5">
                                {productTitle}
                              </h3>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#6F6A63]">
                              <span>{variantColor}</span>
                              <span>/</span>
                              <span>{variantSize}</span>
                              <span>/</span>
                              <span>{gsm}</span>
                            </div>

                            {item.customization && (
                              <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-[#B91F12]">
                                <Sparkles size={11} />
                                <span>Custom print attached</span>
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="col-start-2 sm:col-start-auto font-mono text-[14px] sm:text-[15px] font-extrabold text-[#171717] whitespace-nowrap">
                            ₹{(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}
                          </div>

                          {/* Quantity Stepper */}
                          <div className="col-start-2 sm:col-start-auto flex items-center border border-[#DDD3C5] bg-transparent w-max">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                              className="w-[31px] h-[34px] border-0 bg-transparent text-[15px] grid place-items-center hover:bg-[#F4EEE4] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-7 text-center font-mono text-[11px] font-extrabold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                              className="w-[31px] h-[34px] border-0 bg-transparent text-[15px] grid place-items-center hover:bg-[#F4EEE4] transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="w-[25px] h-[25px] border-0 bg-transparent text-[18px] text-[#171717] hover:text-[#E6321C] transition-colors grid place-items-center cursor-pointer sm:relative absolute top-3 right-0"
                            aria-label="Remove product"
                          >
                            ×
                          </button>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-between items-center pt-5 border-t border-[#DDD3C5] mt-2">
                  <Link
                    to="/shop"
                    className="border-0 bg-transparent text-[9px] font-extrabold tracking-[1px] uppercase underline underline-offset-[5px] text-[#171717] hover:text-[#E6321C] transition-colors"
                  >
                    ← Continue Shopping
                  </Link>

                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="border-0 bg-transparent text-[9px] font-extrabold tracking-[1px] uppercase underline underline-offset-[5px] text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Right: Minimalist Order Summary */}
              <aside className="border border-[#DDD3C5] bg-white/30 backdrop-blur-xs p-6 lg:sticky lg:top-5">
                <h2 className="m-0 text-[18px] font-extrabold tracking-[-0.5px] uppercase pb-4 border-b border-[#DDD3C5]">
                  ORDER SUMMARY
                </h2>

                <div className="divide-y divide-[#DDD3C5]/60 text-[12px]">
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#4F4A44]">Subtotal</span>
                    <span className="font-bold font-mono">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#4F4A44]">Shipping</span>
                    <span className={`font-bold font-mono ${shippingFee === 0 ? 'text-[#238636]' : ''}`}>
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center py-2.5 text-[#238636]">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-bold font-mono">
                        -₹{discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-[#DDD3C5] mt-2 pt-4 flex justify-between items-baseline">
                  <span className="text-[17px] font-extrabold uppercase">Total</span>
                  <span className="font-mono text-[27px] font-extrabold tracking-[-1px] text-[#171717]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-[#6F6A63] text-[9px] mt-0.5">
                  Inclusive of all applicable taxes
                </div>

                {/* Coupon Code */}
                <div className="mt-6">
                  <label htmlFor="couponCodeInput" className="block text-[10px] font-bold uppercase mb-2">
                    HAVE A COUPON CODE?
                  </label>
                  <form onSubmit={handleApplyCoupon} className="grid grid-cols-[1fr_78px]">
                    <input
                      id="couponCodeInput"
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-[43px] border border-[#DDD3C5] border-r-0 bg-white px-3 outline-none text-[11px] font-mono uppercase focus:border-[#E6321C]"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon}
                      className="border-0 bg-[#171717] text-white text-[9px] font-extrabold tracking-[0.5px] uppercase hover:bg-[#E6321C] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'APPLY'}
                    </button>
                  </form>

                  {couponStatus.type !== 'idle' && (
                    <div
                      className={`mt-2 text-[9px] font-bold ${
                        couponStatus.type === 'success' ? 'text-[#238636]' : 'text-[#C62828]'
                      }`}
                    >
                      {couponStatus.message}
                    </div>
                  )}
                </div>

                {/* Proceed to Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full h-[53px] border-0 mt-5 bg-[#E6321C] text-white text-[11px] font-extrabold tracking-[0.5px] uppercase hover:bg-[#B91F12] active:translate-y-[1px] transition-all cursor-pointer shadow-xs"
                >
                  PROCEED TO CHECKOUT →
                </button>

                {/* Assurances */}
                <div className="mt-6 grid gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                      <Truck size={22} strokeWidth={1.5} className="text-[#171717]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase mb-0.5">
                        FREE DELIVERY
                      </div>
                      <div className="text-[9px] text-[#6F6A63]">
                        On orders above ₹999
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                      <RotateCcw size={22} strokeWidth={1.5} className="text-[#171717]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase mb-0.5">
                        EASY RETURNS
                      </div>
                      <div className="text-[9px] text-[#6F6A63]">
                        Simple return process
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                      <ShieldCheck size={22} strokeWidth={1.5} className="text-[#171717]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase mb-0.5">
                        SECURE PAYMENTS
                      </div>
                      <div className="text-[9px] text-[#6F6A63]">
                        100% safe & encrypted
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================
           SERVICE STRIP (4-COLUMN MINIMALIST TRUST STRIP)
      ========================================================= */}
      <div className="border-t border-b border-[#DDD3C5] py-7 my-0">
        <div className="container-bingooo grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-7">
          <div className="flex items-center gap-3">
            <Truck size={26} strokeWidth={1.5} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[9px] font-extrabold uppercase mb-0.5">Fast Delivery</div>
              <div className="text-[9px] text-[#6F6A63]">Quick & safe delivery</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={26} strokeWidth={1.5} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[9px] font-extrabold uppercase mb-0.5">Easy Returns</div>
              <div className="text-[9px] text-[#6F6A63]">Simple return process</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={26} strokeWidth={1.5} className="text-[#171717] shrink-0" />
            <div>
              <div className="text-[9px] font-extrabold uppercase mb-0.5">Quality Assured</div>
              <div className="text-[9px] text-[#6F6A63]">Built to be worn</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[26px] h-[26px] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[26px] h-[26px]">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <div>
              <div className="text-[9px] font-extrabold uppercase mb-0.5">Secure Payment</div>
              <div className="text-[9px] text-[#6F6A63]">100% secure checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
           RECOMMENDATIONS ("COMPLETE THE LOOK.")
      ========================================================= */}
      <section className="py-16 sm:pb-24">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-[9px] tracking-[2.2px] font-extrabold uppercase mb-2">
                YOU MAY ALSO LIKE
              </div>
              <h2 className="m-0 text-[clamp(34px,5vw,56px)] leading-[0.85] tracking-[-2px] sm:tracking-[-2.5px] font-extrabold uppercase">
                COMPLETE<br />THE LOOK.
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[9px] font-extrabold uppercase tracking-wide underline underline-offset-[5px] text-[#171717] hover:text-[#E6321C] transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4.5">
            {(recProducts?.data && recProducts.data.length > 0 ? recProducts.data.slice(0, 4) : [
              {
                id: 'rec-1',
                title: 'Core White Tee',
                slug: 'core-white-tee',
                base_price: 1199,
                imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=85',
              },
              {
                id: 'rec-2',
                title: 'Everyday Sweatshirt',
                slug: 'everyday-sweatshirt',
                base_price: 1799,
                imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=85',
              },
              {
                id: 'rec-3',
                title: 'Bingooo Cap',
                slug: 'bingooo-cap',
                base_price: 699,
                imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=600&q=85',
              },
              {
                id: 'rec-4',
                title: 'Relaxed Shirt',
                slug: 'relaxed-shirt',
                base_price: 1999,
                imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=85',
              },
            ]).map((prod: any) => {
              const inWish = wishlist?.some((w: any) => w.productId === prod.id);
              const img = prod.images?.[0]?.url || prod.imageUrl;

              return (
                <article key={prod.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(prod.id, inWish)}
                    aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`absolute top-3 right-3 z-10 w-[31px] h-[31px] rounded-full bg-white/90 grid place-items-center transition-colors cursor-pointer ${
                      inWish ? 'text-[#E6321C]' : 'text-[#171717] hover:text-[#E6321C]'
                    }`}
                  >
                    <Heart size={14} fill={inWish ? '#E6321C' : 'none'} />
                  </button>

                  <Link to={`/product/${prod.slug}`} className="block">
                    <img
                      src={img}
                      alt={prod.title}
                      className="aspect-[0.82] w-full bg-[#E2D9CB] object-cover group-hover:opacity-90 transition-opacity duration-200"
                      loading="lazy"
                    />
                  </Link>

                  <div className="pt-2.5">
                    <Link to={`/product/${prod.slug}`}>
                      <h4 className="m-0 text-[11px] font-extrabold text-[#171717] truncate hover:text-[#E6321C] transition-colors mb-1">
                        {prod.title}
                      </h4>
                    </Link>
                    <div className="font-mono text-[11px] font-extrabold text-[#171717]">
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
