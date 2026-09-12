import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Lock, 
  MapPin, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Zap,
  Check,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/auth';
import { SEO } from '../components/common/SEO';
import { PhonePeIcon, GooglePayIcon, PaytmIcon, UpiIcon } from '../components/checkout/PaymentAppIcons';

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
type PaymentMethodType = 'upi' | 'partial_cod' | 'cod' | 'cards';
type UpiAppType = 'phonepe' | 'gpay' | 'paytm' | 'any';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppType>('phonepe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const couponCode = (location.state as any)?.couponCode;

  // Load live payment & COD configuration from backend
  const { data: paymentConfig } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () =>
      api.get<{
        cod_enabled: boolean;
        partial_cod_enabled: boolean;
        partial_cod_advance_amount: number;
        max_cod_limit: number;
      }>('/payments/config'),
    staleTime: 30000,
  });

  const isCodEnabled = paymentConfig?.cod_enabled !== false;
  const isPartialCodEnabled = paymentConfig?.partial_cod_enabled !== false;
  const partialCodAdvance = Number(paymentConfig?.partial_cod_advance_amount) || 79;
  const maxCodLimit = Number(paymentConfig?.max_cod_limit) || 5000;

  // Load saved customer addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<any[]>('/users/addresses'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.fullName || 'Aditi Sharma',
      phone: user?.phone || '9876543210',
      line1: '124, Indiranagar 100ft Road',
      line2: 'Flat 4B, Silicon Heights',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'IN',
    },
  });

  // Load default address if available
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setValue('name', defaultAddr.name);
      setValue('phone', defaultAddr.phone);
      setValue('line1', defaultAddr.line1);
      setValue('line2', defaultAddr.line2 || '');
      setValue('city', defaultAddr.city);
      setValue('state', defaultAddr.state);
      setValue('postalCode', defaultAddr.postal_code || defaultAddr.postalCode);
    }
  }, [addresses, setValue]);

  // Adjust selection if COD option is turned off by admin
  useEffect(() => {
    if (paymentMethod === 'cod' && !isCodEnabled) {
      setPaymentMethod(isPartialCodEnabled ? 'partial_cod' : 'upi');
    }
    if (paymentMethod === 'partial_cod' && !isPartialCodEnabled) {
      setPaymentMethod('upi');
    }
  }, [isCodEnabled, isPartialCodEnabled, paymentMethod]);

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setValue('name', addr.name);
    setValue('phone', addr.phone);
    setValue('line1', addr.line1);
    setValue('line2', addr.line2 || '');
    setValue('city', addr.city);
    setValue('state', addr.state);
    setValue('postalCode', addr.postal_code || addr.postalCode);
  };

  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee + tax;

  const hasCustomItems = cart?.items?.some((i: any) => Boolean(i.customization || i.customizationId));
  const effectivePartialAdvance = Math.min(partialCodAdvance, total);
  const partialCodRemaining = Math.max(0, total - effectivePartialAdvance);

  const onSubmit = async (addressData: AddressFormData) => {
    if (!cart?.id || !cart.items || cart.items.length === 0) {
      toast({ title: 'Cart is empty', variant: 'danger' });
      return;
    }

    if (paymentMethod === 'cod' && !isCodEnabled) {
      toast({
        title: 'Cash on Delivery Unavailable',
        description: 'COD is currently disabled by store. Please use Partial COD (₹79) or UPI.',
        variant: 'danger',
      });
      return;
    }

    if (paymentMethod === 'cod' && total > maxCodLimit) {
      toast({
        title: 'COD Limit Exceeded',
        description: `Cash on Delivery is limited to orders up to ₹${maxCodLimit}. Please use UPI or Partial COD.`,
        variant: 'danger',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Map frontend selection to backend paymentMethod: 'prepaid' | 'partial_cod' | 'cod'
      let backendPaymentMethod: 'prepaid' | 'partial_cod' | 'cod' = 'prepaid';
      if (paymentMethod === 'partial_cod') {
        backendPaymentMethod = 'partial_cod';
      } else if (paymentMethod === 'cod') {
        backendPaymentMethod = 'cod';
      } else {
        backendPaymentMethod = 'prepaid';
      }

      // 1. Create order on backend
      const order = await api.post<any>('/orders', {
        cartId: cart.id,
        couponCode: couponCode || undefined,
        paymentMethod: backendPaymentMethod,
        shippingAddress: addressData,
      });

      // 2. Handle Payment Flow (Prepaid UPI / Cards OR Partial COD advance)
      if (backendPaymentMethod === 'prepaid' || backendPaymentMethod === 'partial_cod') {
        const rzpOrder = await api.post<any>('/payments/razorpay/order', {
          orderId: order.id,
        });

        // Ensure Razorpay script is loaded
        if (!(window as any).Razorpay) {
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
          }
        }

        const razorpayKey =
          rzpOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TYDFxO8bZagWG6';
        const razorpayOrderId = rzpOrder.order_id || rzpOrder.razorpayOrderId;

        const isPartialPayment = backendPaymentMethod === 'partial_cod';
        const orderDescription = isPartialPayment
          ? `Partial COD Token (₹${effectivePartialAdvance}) • Order #${order.order_number}`
          : `Order #${order.order_number}`;

        // Configure direct UPI instrument routing
        const upiAppMapping: Record<string, string> = {
          phonepe: 'phonepe',
          gpay: 'google_pay',
          paytm: 'paytm',
        };

        const rzpConfig: any = {
          key: razorpayKey,
          amount: rzpOrder.amount, // backend sets 7900 for partial_cod or total in paise
          currency: rzpOrder.currency || 'INR',
          name: 'Bingooo Luxury Streetwear',
          description: orderDescription,
          order_id: razorpayOrderId,
          prefill: {
            name: addressData.name,
            contact: addressData.phone,
            email: user?.email || 'customer@bingooo.in',
            method: paymentMethod === 'upi' || isPartialPayment ? 'upi' : undefined,
          },
          theme: { color: '#E6321C' },
          handler: async (response: any) => {
            try {
              setIsProcessing(true);
              await api.post('/payments/razorpay/verify', {
                orderId: order.id,
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              toast({
                title: isPartialPayment ? 'Advance Paid & COD Confirmed!' : 'Payment Confirmed!',
                description: `Order #${order.order_number} successfully placed.`,
                variant: 'success',
              });
              navigate('/payment/success', { state: { order } });
            } catch (verifyErr: any) {
              toast({
                title: 'Payment verification failed',
                description: verifyErr.message || 'Signature check failed. Contact support if debited.',
                variant: 'danger',
              });
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast({
                title: 'Payment Cancelled',
                description: 'Payment session closed. You can retry anytime.',
                variant: 'default',
              });
              setIsProcessing(false);
            },
          },
        };

        // If specific UPI app selected, optimize Razorpay display
        if (paymentMethod === 'upi' && selectedUpiApp !== 'any') {
          const targetApp = upiAppMapping[selectedUpiApp];
          if (targetApp) {
            rzpConfig.config = {
              display: {
                blocks: {
                  preferred_upi: {
                    name: `Pay with ${
                      selectedUpiApp === 'phonepe'
                        ? 'PhonePe'
                        : selectedUpiApp === 'gpay'
                        ? 'Google Pay'
                        : 'Paytm'
                    }`,
                    instruments: [
                      {
                        method: 'upi',
                        flows: ['intent', 'qr', 'collect'],
                        apps: [targetApp],
                      },
                    ],
                  },
                },
                sequence: ['block.preferred_upi'],
                preferences: {
                  show_default_blocks: true,
                },
              },
            };
          }
        }

        const rzp = new (window as any).Razorpay(rzpConfig);

        rzp.on('payment.failed', (failResponse: any) => {
          const desc =
            failResponse?.error?.description ||
            failResponse?.error?.reason ||
            'Payment could not be completed. Please try again.';
          toast({
            title: 'Payment Failed',
            description: desc,
            variant: 'danger',
          });
          setIsProcessing(false);
        });

        rzp.open();
        return;
      }

      // 3. Full COD (No online payment required)
      clearCart();
      toast({
        title: 'COD Order Confirmed!',
        description: `Order #${order.order_number} will be delivered with Cash on Delivery.`,
        variant: 'success',
      });
      navigate('/payment/success', { state: { order } });
    } catch (err: any) {
      toast({
        title: 'Order failed',
        description: err.message || 'Unable to place order. Please try again.',
        variant: 'danger',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <Logo variant="red" size="lg" className="mb-4" />
        <h1 className="sr-only">Secure Checkout</h1>
        <h2 className="text-display-sm font-bold text-ink">Your bag is empty</h2>
        <p className="mt-2 text-body text-muted">Add some heavyweight essentials before checking out.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/shop')}>
          Browse Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper/30 py-8 lg:py-12">
      <SEO
        title="Secure Checkout"
        description="Complete your Bingooo purchase securely with 256-bit encryption. PhonePe, Google Pay, Paytm, Cards, and COD supported."
        noindex={true}
      />
      <h1 className="sr-only">Secure Checkout</h1>
      <div className="container-page">
        <div className="mb-4 sm:mb-6 flex items-center justify-between border-b border-border pb-4">
          <Logo variant="red" size="md" />
          <div className="flex items-center gap-2 text-caption text-muted">
            <Lock size={14} className="text-accent" />
            <span className="text-xs">256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Responsive Checkout Stepper: Desktop / Tablet */}
        <nav aria-label="Checkout Progress" className="hidden sm:flex items-center justify-center gap-4 py-3 mb-6 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#238636]/15 text-[#238636]">
              <Check size={12} strokeWidth={2.5} />
            </span>
            <span>1. BAG</span>
          </div>
          <span className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold shadow-xs">2</span>
            <span>2. SHIPPING &amp; PAYMENT</span>
          </div>
          <span className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2 text-xs font-semibold text-muted/60">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border/60 text-muted text-[10px] font-bold">3</span>
            <span>3. CONFIRMATION</span>
          </div>
        </nav>

        {/* Responsive Checkout Stepper: Compact Mobile (<640px) */}
        <div className="sm:hidden mb-4 py-2 px-3 rounded-lg bg-white border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold shadow-xs">2</span>
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider">Step 2 of 3: Shipping &amp; Payment</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-muted">NEXT: CONFIRM</span>
        </div>

        {/* Mobile Collapsible Order Summary Accordion (lg:hidden) */}
        <div className="lg:hidden mb-6 rounded-xl border border-border bg-white shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-paper/60 text-left border-b border-border/60"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-accent" />
              <span className="text-xs font-bold text-ink uppercase tracking-wide">
                {isMobileSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}
              </span>
              {isMobileSummaryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
            <span className="text-sm font-extrabold text-accent">₹{total}</span>
          </button>

          <AnimatePresence>
            {isMobileSummaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-border/60">
                    {cart.items.map((item: any) => (
                      <div key={item.id} className="pt-2.5 first:pt-0 flex gap-3 text-left">
                        <div className="h-12 w-12 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {item.customization?.previewKey ? (
                            <img
                              src={item.customization.previewKey}
                              alt="Custom artwork"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-heading font-black text-[10px] text-muted">BGO</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-ink truncate">{item.product?.title || 'Garment'}</h4>
                          <span className="text-[10px] text-muted block">
                            Size: {item.variant?.size} • Qty: {item.quantity}
                          </span>
                          <div className="text-xs font-bold text-ink mt-0.5">
                            ₹{item.total_price || item.unit_price * item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 border-t border-border pt-3 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span className="font-medium text-ink">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Shipping Fee</span>
                      <span className="font-medium text-ink">
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>GST / Taxes (5%)</span>
                      <span className="font-medium text-ink">₹{tax}</span>
                    </div>
                    {paymentMethod === 'partial_cod' && (
                      <div className="border-t border-dashed border-border pt-1.5 text-xs text-accent font-bold flex justify-between">
                        <span>Pay Advance Now</span>
                        <span>₹{effectivePartialAdvance}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between font-black text-ink">
                      <span>Total Payable</span>
                      <span className="text-accent">₹{total}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-12">
          {/* Left Column: Shipping & Payment (7 cols) */}
          <div className="space-y-8 lg:col-span-7">
            {/* Saved Addresses Picker */}
            {addresses.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-body font-bold text-ink flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-accent" /> Select Saved Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors text-left text-xs ${
                        selectedAddressId === addr.id
                          ? 'border-accent bg-accent/5 font-semibold text-ink'
                          : 'border-border hover:border-ink/40 text-muted'
                      }`}
                    >
                      <div className="font-bold text-ink">{addr.name}</div>
                      <div className="truncate">{addr.line1}</div>
                      <div>
                        {addr.city}, {addr.postal_code}
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedAddressId('custom')}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-center text-xs font-bold transition-colors ${
                      selectedAddressId === 'custom'
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-dashed border-border hover:border-ink/40 text-muted'
                    }`}
                  >
                    + Enter New Address
                  </div>
                </div>
              </div>
            )}

            {/* Address Details Form */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-heading font-bold text-ink mb-4">1. Shipping Address</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  placeholder="e.g. Aditi Sharma"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Mobile Phone"
                  placeholder="10-digit number"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address / Flat No."
                    placeholder="House number, apartment, street"
                    error={errors.line1?.message}
                    {...register('line1')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Apartment, suite, landmark (Optional)"
                    placeholder="Landmark or area"
                    error={errors.line2?.message}
                    {...register('line2')}
                  />
                </div>
                <Input label="City" placeholder="City" error={errors.city?.message} {...register('city')} />
                <Input label="State" placeholder="State" error={errors.state?.message} {...register('state')} />
                <Input
                  label="PIN Code"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  error={errors.postalCode?.message}
                  {...register('postalCode')}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-heading font-bold text-ink">2. Choose Payment Method</h2>
                <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                  <ShieldCheck size={15} />
                  <span>100% Safe & Secure</span>
                </div>
              </div>

              {hasCustomItems && (
                <div className="rounded-lg bg-accent/10 border border-accent/20 p-3.5 flex items-start gap-3 text-left">
                  <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-ink">Bespoke Custom Print Item in Cart</p>
                    <p className="text-muted mt-0.5">
                      Because custom garments are printed exclusively for you, Cash on Delivery requires a small token
                      advance to confirm dispatch.
                    </p>
                  </div>
                </div>
              )}

              {/* OPTION 1: UPI APPS (PhonePe, Google Pay, Paytm, UPI) */}
              <div
                className={`rounded-xl border transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs'
                    : 'border-border bg-white hover:border-ink/20'
                } p-4`}
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-accent mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body font-bold text-ink">Instant UPI Payment</span>
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Direct payment via your favorite UPI app. Instant refund & zero convenience fee.
                      </p>
                    </div>
                  </div>
                  <Zap size={20} className="text-accent shrink-0" />
                </div>

                {/* Branded UPI Apps Grid */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <span className="text-[11px] font-bold text-ink/70 uppercase tracking-wider block mb-2.5">
                    Select Your Payment App:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('phonepe');
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center ${
                        paymentMethod === 'upi' && selectedUpiApp === 'phonepe'
                          ? 'border-[#5F259F] bg-[#5F259F]/5 ring-2 ring-[#5F259F]/30 shadow-xs'
                          : 'border-border bg-paper/50 hover:border-[#5F259F]/40'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'phonepe' && (
                        <CheckCircle2 size={14} className="absolute top-1.5 right-1.5 text-[#5F259F]" />
                      )}
                      <PhonePeIcon className="w-8 h-8" />
                      <span className="text-xs font-bold text-ink mt-1.5">PhonePe</span>
                      <span className="text-[9px] text-muted font-medium">Direct App</span>
                    </button>

                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('gpay');
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center ${
                        paymentMethod === 'upi' && selectedUpiApp === 'gpay'
                          ? 'border-[#4285F4] bg-[#4285F4]/5 ring-2 ring-[#4285F4]/30 shadow-xs'
                          : 'border-border bg-paper/50 hover:border-[#4285F4]/40'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'gpay' && (
                        <CheckCircle2 size={14} className="absolute top-1.5 right-1.5 text-[#4285F4]" />
                      )}
                      <GooglePayIcon className="w-8 h-8" />
                      <span className="text-xs font-bold text-ink mt-1.5">Google Pay</span>
                      <span className="text-[9px] text-muted font-medium">GPay UPI</span>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('paytm');
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center ${
                        paymentMethod === 'upi' && selectedUpiApp === 'paytm'
                          ? 'border-[#00BAF2] bg-[#00BAF2]/5 ring-2 ring-[#00BAF2]/30 shadow-xs'
                          : 'border-border bg-paper/50 hover:border-[#00BAF2]/40'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'paytm' && (
                        <CheckCircle2 size={14} className="absolute top-1.5 right-1.5 text-[#002970]" />
                      )}
                      <PaytmIcon className="w-8 h-8" />
                      <span className="text-xs font-bold text-ink mt-1.5">Paytm</span>
                      <span className="text-[9px] text-muted font-medium">UPI / Wallet</span>
                    </button>

                    {/* Any UPI / QR */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('any');
                      }}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center ${
                        paymentMethod === 'upi' && selectedUpiApp === 'any'
                          ? 'border-ink bg-ink/5 ring-2 ring-ink/20 shadow-xs'
                          : 'border-border bg-paper/50 hover:border-ink/40'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'any' && (
                        <CheckCircle2 size={14} className="absolute top-1.5 right-1.5 text-ink" />
                      )}
                      <UpiIcon className="w-8 h-8" />
                      <span className="text-xs font-bold text-ink mt-1.5">Any UPI</span>
                      <span className="text-[9px] text-muted font-medium">Scan QR / ID</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OPTION 2: PARTIAL COD (Pay ₹79 Advance + Balance on Delivery) */}
              <div
                className={`rounded-xl border transition-all ${
                  !isPartialCodEnabled
                    ? 'opacity-50 border-border bg-paper/40 cursor-not-allowed'
                    : paymentMethod === 'partial_cod'
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs'
                    : 'border-border bg-white hover:border-ink/20 cursor-pointer'
                } p-4`}
                onClick={() => {
                  if (isPartialCodEnabled) setPaymentMethod('partial_cod');
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="partial_cod"
                      disabled={!isPartialCodEnabled}
                      checked={paymentMethod === 'partial_cod'}
                      onChange={() => setPaymentMethod('partial_cod')}
                      className="accent-accent mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body font-bold text-ink">Partial COD (Pay ₹{effectivePartialAdvance} Advance)</span>
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                          Smart COD
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Pay a ₹{effectivePartialAdvance} verification token now via UPI; pay the remaining balance{' '}
                        <strong>₹{partialCodRemaining}</strong> in cash or UPI to the courier agent upon doorstep delivery.
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 size={13} />
                        <span>Guarantees immediate priority dispatch & reduces return delivery fraud.</span>
                      </div>
                    </div>
                  </div>
                  <Banknote size={20} className="text-emerald-600 shrink-0" />
                </div>

                {!isPartialCodEnabled && (
                  <div className="mt-2 text-xs text-danger font-medium flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>Partial COD is currently disabled in store settings.</span>
                  </div>
                )}
              </div>

              {/* OPTION 3: FULL CASH ON DELIVERY (Controlled by Admin Toggle) */}
              <div
                className={`rounded-xl border transition-all ${
                  !isCodEnabled || total > maxCodLimit
                    ? 'opacity-60 border-border bg-paper/40 cursor-not-allowed'
                    : paymentMethod === 'cod'
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs'
                    : 'border-border bg-white hover:border-ink/20 cursor-pointer'
                } p-4`}
                onClick={() => {
                  if (isCodEnabled && total <= maxCodLimit) setPaymentMethod('cod');
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      disabled={!isCodEnabled || total > maxCodLimit}
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-accent mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body font-bold text-ink">Cash on Delivery (Full COD)</span>
                        {!isCodEnabled && (
                          <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] font-bold uppercase text-muted tracking-wider">
                            Turned Off by Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {isCodEnabled
                          ? total > maxCodLimit
                            ? `Full COD is not available for orders above ₹${maxCodLimit}.`
                            : `Pay full amount of ₹${total} in cash when your parcel arrives.`
                          : 'Full COD is temporarily disabled by admin. Please use Partial COD (₹79) or UPI.'}
                      </p>
                    </div>
                  </div>
                  <Banknote size={20} className="text-muted shrink-0" />
                </div>
              </div>

              {/* OPTION 4: CARDS / NETBANKING */}
              <div
                className={`rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'cards'
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs'
                    : 'border-border bg-white hover:border-ink/20'
                } p-4`}
                onClick={() => setPaymentMethod('cards')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cards"
                      checked={paymentMethod === 'cards'}
                      onChange={() => setPaymentMethod('cards')}
                      className="accent-accent mt-1"
                    />
                    <div>
                      <span className="text-body font-bold text-ink block">Debit / Credit Cards & NetBanking</span>
                      <p className="text-xs text-muted mt-0.5">
                        Visa, Mastercard, RuPay, Maestro, Corporate Cards & all major Indian banks.
                      </p>
                    </div>
                  </div>
                  <CreditCard size={20} className="text-muted shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-xl border border-border bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-heading font-bold text-ink pb-3 border-b border-border">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 divide-y divide-border/60">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3 text-left">
                    <div className="h-16 w-16 rounded-lg bg-paper border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {item.customization?.previewKey ? (
                        <img
                          src={item.customization.previewKey}
                          alt="Custom artwork"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-heading font-black text-xs text-muted">BGO</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-caption font-bold text-ink truncate">{item.product?.title || 'Garment'}</h4>
                      <span className="text-[11px] text-muted block">
                        Size: {item.variant?.size} • Qty: {item.quantity}
                      </span>
                      {item.customization && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-accent uppercase">
                          <Sparkles size={10} />
                          <span>Custom Artwork</span>
                        </span>
                      )}
                      <div className="text-caption font-bold text-ink mt-1">
                        ₹{item.total_price || item.unit_price * item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-2 border-t border-border pt-4 text-body">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-ink">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST / Taxes (5%)</span>
                  <span className="font-medium text-ink">₹{tax}</span>
                </div>

                {/* Partial COD Advance / Balance Breakdown */}
                {paymentMethod === 'partial_cod' && (
                  <div className="border-t border-dashed border-emerald-500/40 bg-emerald-50/50 p-3 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Advance Online Token (Due Now)</span>
                      <span>₹{effectivePartialAdvance}</span>
                    </div>
                    <div className="flex justify-between text-muted font-medium">
                      <span>Balance on Delivery (COD)</span>
                      <span className="text-ink font-semibold">₹{partialCodRemaining}</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between text-heading font-black text-ink">
                  <span>Total Order Value</span>
                  <span className="text-accent">₹{total}</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={isProcessing}>
                {isProcessing ? (
                  'Securing Order...'
                ) : paymentMethod === 'partial_cod' ? (
                  `Pay ₹${effectivePartialAdvance} Advance & Confirm COD`
                ) : paymentMethod === 'upi' ? (
                  `Pay ₹${total} via ${
                    selectedUpiApp === 'phonepe'
                      ? 'PhonePe'
                      : selectedUpiApp === 'gpay'
                      ? 'Google Pay'
                      : selectedUpiApp === 'paytm'
                      ? 'Paytm'
                      : 'UPI'
                  }`
                ) : paymentMethod === 'cod' ? (
                  `Place Cash on Delivery (₹${total})`
                ) : (
                  `Pay ₹${total} via Cards / NetBanking`
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-caption text-muted">
                <ShieldCheck size={16} className="text-success" />
                <span>30-Day Easy Returns • 100% Genuine 240 GSM Fabric</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

