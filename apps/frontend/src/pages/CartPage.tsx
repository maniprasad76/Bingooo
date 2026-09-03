import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  RotateCcw,
  Truck,
  Award,
  ArrowLeft,
  ArrowRight,
  Shirt,
  Sparkles,
  LoaderCircle,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';
import { useQuery } from '@tanstack/react-query';

export function CartPage() {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Recommendations query
  const { data: recProducts } = useQuery({
    queryKey: ['cart-recommendations'],
    queryFn: () => api.get<{ data: any[] }>('/products', { limit: 4 }),
  });

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeThreshold = cart?.freeShippingThreshold || 999;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : (cart?.shippingFee || 99);
  const total = Math.max(0, subtotal - discount + shippingFee);

  const awayAmount = Math.max(0, freeThreshold - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleQtyChange = (id: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, nextQty);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await api.post<any>('/coupons/validate', {
        code: couponCode.trim(),
        orderSubtotal: subtotal,
      });
      setAppliedCoupon({ code: res.coupon.code, discount: res.discount });
      toast({
        title: 'Coupon applied!',
        description: `You saved ₹${res.discount} with code ${res.coupon.code}`,
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Invalid coupon',
        description: err.message || 'Coupon could not be applied.',
        variant: 'danger',
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: { couponCode: appliedCoupon?.code },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#FAF8F5] text-muted">
        <LoaderCircle size={28} className="animate-spin text-[#E6321C]" />
        <p className="font-sans text-sm font-semibold text-[#171717]">Loading your shopping bag...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63] mb-4">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">Cart</span>
        </nav>

        {/* ─── Header & Free Shipping Bar ─── */}
        <div className="mb-6">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] uppercase tracking-tight">
            YOUR CART <span className="font-bold text-2xl text-[#6F6A63]">({items.length})</span>
          </h1>

          {/* Progress Container */}
          {items.length > 0 && (
            <div className="mt-4 max-w-xl">
              <div className="flex items-center justify-between text-xs font-sans font-bold text-[#171717] mb-1.5">
                <span>
                  {awayAmount > 0 ? (
                    <>You're <span className="text-[#E6321C]">₹{awayAmount}</span> away from <strong className="text-[#E6321C]">FREE</strong> shipping!</>
                  ) : (
                    <span className="text-[#238636]">🎉 You've unlocked FREE Shipping!</span>
                  )}
                </span>
                <span className="text-[#6F6A63]">₹{subtotal} / ₹{freeThreshold}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EDE0CC] overflow-hidden">
                <div
                  className="h-full bg-[#E6321C] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* ─── Empty Cart State ─── */
          <div className="py-20 text-center rounded-2xl border border-dashed border-[#DDD3C5] bg-[#FDF9F4] p-8 max-w-2xl mx-auto my-8 shadow-sm">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-[#EDE0CC] flex items-center justify-center text-[#171717]">
              <ShoppingBag size={30} className="text-[#E6321C]" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight text-[#171717]">
              Your shopping bag is empty
            </h2>
            <p className="mt-2 text-sm text-[#6F6A63] max-w-md mx-auto leading-relaxed">
              Looks like you haven't added anything to your cart yet. Explore our curated catalog or launch the design studio to create a custom piece.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E6321C] text-white font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#B91F12] transition-colors shadow-sm"
              >
                <ShoppingBag size={15} />
                <span>Explore Catalog</span>
              </Link>
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#171717] bg-[#171717] text-white font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#E6321C] hover:border-[#E6321C] transition-colors shadow-sm"
              >
                <Sparkles size={15} />
                <span>Custom Design Studio</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ─── Two-Column Layout (Items Table + Order Summary) ─── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Cart Items (8 cols) */}
            <div className="lg:col-span-8">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 text-xs font-heading font-bold uppercase tracking-wider text-[#6F6A63] pb-3 border-b border-[#DDD3C5]">
                <div className="col-span-6">PRODUCT</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>

              {/* Items Rows */}
              <div className="divide-y divide-[#DDD3C5]/70">
                {items.map((item: any) => {
                  const productTitle = item.product?.title || 'Bingooo Garment';
                  const productSlug = item.product?.slug || '';
                  const variantColor = item.variant?.color || 'Black';
                  const variantColorHex = item.variant?.colorHex || '#171717';
                  const variantSize = item.variant?.size || 'Standard';
                  const imageUrl = item.product?.images?.[0]?.url;

                  return (
                    <div key={item.id} className="py-5 sm:py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Product Details (6 cols) */}
                      <div className="sm:col-span-6 flex gap-4 items-center text-left">
                        {/* Square Image Slot */}
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-[#EDE0CC] border border-[#DDD3C5] overflow-hidden shrink-0 flex items-center justify-center relative">
                          {imageUrl ? (
                            <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                          ) : (
                            <Shirt size={32} className="text-[#171717]/40" />
                          )}
                          {item.customization && (
                            <span className="absolute bottom-1 right-1 rounded bg-[#E6321C] px-1 py-0.5 text-[8px] font-bold uppercase text-white font-mono">
                              CUSTOM
                            </span>
                          )}
                        </div>

                        <div>
                          {productSlug ? (
                            <Link to={`/product/${productSlug}`}>
                              <h3 className="font-heading font-bold text-sm sm:text-base text-[#171717] hover:text-[#E6321C] transition-colors line-clamp-1">
                                {productTitle}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="font-heading font-bold text-sm sm:text-base text-[#171717] line-clamp-1">
                              {productTitle}
                            </h3>
                          )}

                          <div className="mt-1 text-xs text-[#6F6A63] font-sans space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span>Color: {variantColor}</span>
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: variantColorHex }}
                              />
                            </div>
                            <div>Size: {variantSize}</div>
                          </div>

                          {item.customization && (
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-[#FDF0EE] px-2 py-0.5 text-[10px] font-bold text-[#B91F12] border border-[#E6321C]/20">
                              <Sparkles size={11} />
                              <span>Custom Print Attached</span>
                            </div>
                          )}

                          {/* Action Links */}
                          <div className="mt-3 flex items-center gap-4 text-xs font-sans text-[#6F6A63]">
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.id);
                                toast({ title: 'Item removed from bag', variant: 'default' });
                              }}
                              className="inline-flex items-center gap-1 hover:text-[#E6321C] transition-colors"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Unit Price (2 cols) */}
                      <div className="sm:col-span-2 text-left sm:text-center text-xs sm:text-sm font-sans font-bold text-[#171717]">
                        <span className="sm:hidden text-[#6F6A63] font-normal mr-2">Price:</span>
                        ₹{item.unitPrice}
                      </div>

                      {/* Quantity Picker (2 cols) */}
                      <div className="sm:col-span-2 flex items-center sm:justify-center">
                        <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                            className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-xs font-sans font-bold text-[#171717]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                            className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Line Total (2 cols) */}
                      <div className="sm:col-span-2 text-left sm:text-right font-heading font-black text-sm sm:text-base text-[#E6321C]">
                        <span className="sm:hidden text-[#6F6A63] font-normal text-xs mr-2">Total:</span>
                        ₹{item.total}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Button */}
              <div className="pt-6 border-t border-[#DDD3C5]">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#E6321C] text-[#E6321C] hover:bg-[#FDF0EE] font-sans font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>CONTINUE SHOPPING</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4">
              <div className="rounded-xl border border-[#DDD3C5] bg-white p-6 shadow-sm text-left space-y-5">
                <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-[#171717] pb-3 border-b border-[#DDD3C5]">
                  ORDER SUMMARY
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between text-[#6F6A63]">
                    <span>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</span>
                    <span className="font-bold text-[#171717]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#238636] font-semibold">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#238636] font-semibold">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>
                </div>

                {/* Total Row */}
                <div className="pt-4 border-t border-[#DDD3C5] flex items-baseline justify-between">
                  <div>
                    <span className="font-heading font-black text-lg text-[#171717] block">Total</span>
                    <span className="text-[10px] text-[#6F6A63] font-sans">(Incl. of all taxes)</span>
                  </div>
                  <span className="font-heading font-black text-2xl text-[#E6321C]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Free Shipping Success Callout */}
                {shippingFee === 0 && subtotal > 0 && (
                  <div className="rounded-lg bg-success-light border border-success/30 p-3 text-xs text-success flex items-start gap-2.5">
                    <Truck size={18} className="text-success shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Yay! You got FREE shipping.</div>
                      <div className="text-[11px] text-success/80">Express delivery is covered on your order.</div>
                    </div>
                  </div>
                )}

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-lg border border-[#DDD3C5] bg-white px-3 py-2 text-xs font-sans text-[#171717] uppercase placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="px-4 py-2 rounded-lg border border-[#E6321C] text-[#E6321C] hover:bg-[#FDF0EE] font-sans font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Checking...' : 'APPLY'}
                  </button>
                </form>

                {/* Action Buttons: PROCEED TO CHECKOUT */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <ShoppingBag size={15} />
                    <span>PROCEED TO CHECKOUT</span>
                  </button>
                </div>

                {/* Security & Guarantee Trust Signals */}
                <div className="pt-4 border-t border-[#DDD3C5]/60 space-y-3 text-left">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                        100% Secure Checkout
                      </div>
                      <div className="text-[11px] text-[#6F6A63] font-sans">
                        Razorpay encrypted and verified transactions.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <RotateCcw size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                        Easy Returns
                      </div>
                      <div className="text-[11px] text-[#6F6A63] font-sans">
                        7 days return on non-customised apparel
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Truck size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                        Fast Delivery
                      </div>
                      <div className="text-[11px] text-[#6F6A63] font-sans">
                        3-7 business days pan-India shipping
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Award size={18} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-heading font-bold text-xs uppercase text-[#171717]">
                        Quality Assured
                      </div>
                      <div className="text-[11px] text-[#6F6A63] font-sans">
                        Premium 220+ GSM combed ring-spun cotton
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── "YOU MAY ALSO LIKE" Section ─── */}
        {recProducts?.data && recProducts.data.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#DDD3C5]">
            <div className="flex items-center justify-between pb-6">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#171717] uppercase tracking-wider">
                YOU MAY ALSO LIKE
              </h2>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#E6321C] transition-colors group"
              >
                <span>VIEW ALL</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recProducts.data.slice(0, 4).map((p: any) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="group rounded-xl border border-[#DDD3C5] bg-white p-3 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/5] rounded-lg bg-[#EDE0CC] overflow-hidden flex items-center justify-center">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Shirt size={40} className="text-[#171717]/30" />
                    )}
                  </div>
                  <h4 className="mt-3 text-xs font-bold text-[#171717] truncate font-heading group-hover:text-[#E6321C]">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-xs font-bold text-[#E6321C] font-mono">
                    ₹{p.base_price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
