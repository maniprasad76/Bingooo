import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2, Plus, Minus, Tag, Sparkles, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';

export function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = cart?.freeShippingThreshold || 999;
  const progressToFree = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await api.post<any>('/coupons/validate', {
        code: couponCode.trim(),
        orderSubtotal: subtotal,
      });
      setAppliedCoupon(res);
      toast({ title: 'Coupon applied!', description: `You saved ₹${res.discountAmount}`, variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Invalid coupon', description: err.message || 'Coupon code not applicable', variant: 'danger' });
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = finalSubtotal >= freeShippingThreshold || finalSubtotal === 0 ? 0 : 99;
  const tax = Math.round(finalSubtotal * 0.05);
  const finalTotal = finalSubtotal + shippingFee + tax;

  if (isLoading) {
    return (
      <div className="container-page py-16 text-center text-muted">
        Loading shopping bag...
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container-page py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <Logo variant="red" size="lg" className="mb-6" />
        <h1 className="text-display-lg font-bold text-ink mb-2">Your Bag is Empty</h1>
        <p className="text-body text-muted mb-8 max-w-sm">
          Looks like you haven't added any items to your bag yet. Explore our latest drops.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="lg">
            Explore Collection
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-border mb-8">
        <div>
          <h1 className="text-display-lg font-bold text-ink">Shopping Bag</h1>
          <p className="text-body text-muted">{cart.itemCount} items in your bag</p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-caption font-semibold text-muted hover:text-danger transition-colors"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Item List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free shipping progress */}
          <div className="rounded-xl border border-border bg-paper p-4">
            <div className="flex justify-between text-caption font-semibold text-ink mb-1.5">
              <span>
                {subtotal >= freeShippingThreshold
                  ? '🎉 You unlocked FREE standard shipping!'
                  : `Add ₹${freeShippingThreshold - subtotal} more to get FREE standard shipping`}
              </span>
              <span>{Math.round(progressToFree)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressToFree}%` }} />
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-border bg-white divide-y divide-border overflow-hidden">
            {cart.items.map((item: any) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mock thumbnail */}
                  <div className="h-20 w-20 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0">
                    {item.customization ? (
                      <div className="flex flex-col items-center">
                        <Sparkles size={18} className="text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase">Custom</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-muted/60">{item.variant?.color || 'BGO'}</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-body font-bold text-ink">{item.product?.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-caption text-muted">
                      {item.variant?.size && <span>Size: <strong>{item.variant.size}</strong></span>}
                      {item.variant?.color && <span>Color: <strong>{item.variant.color}</strong></span>}
                      {item.customization && <span className="text-accent font-semibold">Custom Print Added</span>}
                    </div>
                    <span className="mt-2 block text-body font-bold text-ink sm:hidden">
                      ₹{item.unitPrice} each
                    </span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  {/* Counter */}
                  <div className="flex items-center rounded-lg border border-border bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="h-8 w-8 flex items-center justify-center text-ink hover:bg-paper"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-caption font-bold text-ink">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center text-ink hover:bg-paper"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-ink block">₹{item.total}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-caption text-muted hover:text-danger mt-1 flex items-center gap-1 ml-auto"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-heading font-bold text-ink">Order Summary</h3>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-paper text-caption font-medium uppercase text-ink focus:border-ink focus:outline-none"
                />
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              <Button type="submit" variant="secondary" size="md" loading={isValidatingCoupon}>
                Apply
              </Button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-success/10 text-success text-caption font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check size={14} /> Coupon {appliedCoupon.code} Applied
                </span>
                <span>-₹{appliedCoupon.discountAmount}</span>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-3 text-caption pt-2 border-t border-border">
              <div className="flex justify-between text-muted">
                <span>Bag Subtotal</span>
                <span className="text-ink font-semibold">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-muted">
                <span>Standard Shipping</span>
                <span className="text-ink font-semibold">
                  {shippingFee === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-muted">
                <span>Estimated Taxes (5% GST)</span>
                <span className="text-ink font-semibold">₹{tax}</span>
              </div>

              <div className="flex justify-between text-lg font-black text-ink pt-3 border-t border-border">
                <span>Total Amount</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
