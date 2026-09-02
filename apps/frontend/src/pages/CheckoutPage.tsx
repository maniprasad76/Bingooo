import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, CreditCard, Banknote, Lock, CheckCircle2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  line1: z.string().min(5, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(6, 'Valid 6-digit PIN code required'),
  country: z.string().default('IN'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod' | 'partial_cod'>('prepaid');
  const [isProcessing, setIsProcessing] = useState(false);
  const couponCode = (location.state as any)?.couponCode;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: 'Aditi Sharma',
      phone: '9876543210',
      line1: '124, Indiranagar 100ft Road',
      line2: 'Flat 4B, Silicon Heights',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'IN',
    },
  });

  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee + tax;

  const hasCustomItems = cart?.items?.some((i: any) => !!i.customization);

  const onSubmit = async (addressData: AddressFormData) => {
    if (!cart?.id || !cart.items || cart.items.length === 0) {
      toast({ title: 'Cart is empty', variant: 'danger' });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const order = await api.post<any>('/orders', {
        cartId: cart.id,
        couponCode: couponCode || undefined,
        paymentMethod: hasCustomItems && paymentMethod === 'cod' ? 'partial_cod' : paymentMethod,
        shippingAddress: addressData,
      });

      // 2. Handle Payment Flow
      if (paymentMethod === 'prepaid' || (paymentMethod === 'cod' && hasCustomItems)) {
        // Initialize Razorpay Order
        const rzpOrder = await api.post<any>('/payments/razorpay/order', {
          orderId: order.id,
        });

        // Simulate Razorpay payment verification
        await api.post<any>('/payments/razorpay/verify', {
          orderId: order.id,
          razorpayOrderId: rzpOrder.razorpayOrderId,
          razorpayPaymentId: `pay_${Date.now()}_mock`,
          razorpaySignature: 'mock_valid_signature',
        });
      }

      // 3. Clear cart state
      clearCart();

      toast({ title: 'Order Placed!', description: `Order ${order.order_number} confirmed`, variant: 'success' });
      navigate('/payment/success', { state: { order } });
    } catch (err: any) {
      toast({ title: 'Order failed', description: err.message || 'Unable to place order', variant: 'danger' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <Logo variant="red" size="lg" className="mb-4" />
        <h2 className="text-heading font-bold text-ink">No items to checkout</h2>
        <p className="mt-2 text-body text-muted">Your shopping bag is currently empty.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/shop')}>
          Return to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="pb-6 border-b border-border mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo variant="red" size="md" withLink />
          <div className="h-7 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-display-sm font-bold text-ink">Checkout</h1>
            <p className="text-caption text-muted">Secure 256-bit encrypted checkout</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-caption text-success font-semibold bg-success/5 px-3 py-1.5 rounded-full border border-success/20">
          <ShieldCheck size={18} />
          SSL Secured Checkout
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Address & Payment Method (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Shipping Address */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-heading font-bold text-ink border-b border-border pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white text-xs">
                1
              </span>
              <h3>Delivery Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Mobile Phone"
                placeholder="10-digit number"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <Input
              label="Street Address / Flat No."
              placeholder="e.g. 100ft Road, Indiranagar"
              error={errors.line1?.message}
              {...register('line1')}
            />

            <Input
              label="Apartment, suite, unit (optional)"
              placeholder="e.g. Flat 4B"
              error={errors.line2?.message}
              {...register('line2')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="Bengaluru"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="State"
                placeholder="Karnataka"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="PIN Code"
                placeholder="560038"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-heading font-bold text-ink border-b border-border pb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white text-xs">
                2
              </span>
              <h3>Payment Method</h3>
            </div>

            <div className="space-y-3">
              {/* Prepaid via Razorpay */}
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'prepaid'
                    ? 'border-ink bg-paper shadow-sm'
                    : 'border-border bg-white hover:border-ink/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'prepaid'}
                  onChange={() => setPaymentMethod('prepaid')}
                  className="mt-1 h-4 w-4 accent-ink"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body font-bold text-ink flex items-center gap-2">
                      <CreditCard size={18} className="text-accent" />
                      Razorpay Secure (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                      Instant & Fast
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-muted">
                    Pay securely using Google Pay, PhonePe, Paytm, Credit/Debit Cards, or NetBanking.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery (COD) */}
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-ink bg-paper shadow-sm'
                    : 'border-border bg-white hover:border-ink/40'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 h-4 w-4 accent-ink"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body font-bold text-ink flex items-center gap-2">
                      <Banknote size={18} className="text-accent" />
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-muted">
                    {hasCustomItems
                      ? 'Custom print apparel requires a 30% advance deposit via UPI/Card to prevent uncollected prints.'
                      : 'Pay in cash when your parcel is delivered to your doorstep.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="text-heading font-bold text-ink pb-3 border-b border-border">
              Order Summary ({cart.itemCount} items)
            </h3>

            {/* Items mini list */}
            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-border">
              {cart.items.map((item: any) => (
                <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-caption">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-ink line-clamp-1">{item.product?.title}</span>
                    <span className="text-muted block text-xs">
                      Qty {item.quantity} • {item.variant?.size || 'Free'} • {item.variant?.color || 'Black'}
                    </span>
                  </div>
                  <span className="font-bold text-ink">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Pricing details */}
            <div className="space-y-2.5 text-caption pt-3 border-t border-border">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink font-semibold">
                  {shippingFee === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated Taxes (GST)</span>
                <span className="text-ink font-semibold">₹{tax}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-ink pt-3 border-t border-border">
                <span>Total Payable</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isProcessing}
              className="mt-4"
            >
              <Lock size={16} />
              Place Order • ₹{total}
            </Button>

            <p className="text-[11px] text-muted text-center flex items-center justify-center gap-1">
              <CheckCircle2 size={13} className="text-success" />
              100% Purchase Protection & Guaranteed Delivery
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
