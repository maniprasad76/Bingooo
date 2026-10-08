import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackBeginCheckout } from '../lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  MapPin, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag,
  CheckCircle2,
  Zap,
  Check,
  BadgePercent,
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
import { resolveImageUrl } from '../lib/utils';
import { getCartItemMeta } from '../lib/cartMeta';

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
type PaymentMethodType = 'upi' | 'cards';
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
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (cart?.total && !checkoutTracked.current) {
      checkoutTracked.current = true;
      trackBeginCheckout(cart.total, cart.itemCount || 1);
    }
  }, [cart?.total, cart?.itemCount]);

  // Load live payment configuration from backend
  const { data: paymentConfig } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () =>
      api.get<{
        prepaid_discount_percentage: number;
      }>('/payments/config'),
    staleTime: 30000,
  });

  const prepaidDiscountPct = Number(paymentConfig?.prepaid_discount_percentage) || 5;

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
      name: user?.fullName || '',
      phone: user?.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
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
  const isPrepaid = true;
  const prepaidDiscount = Math.round(subtotal * (prepaidDiscountPct / 100));
  const total = Math.max(0, subtotal - prepaidDiscount);

  const hasCustomItems = cart?.items?.some((i: any) => Boolean(i.customization || i.customizationId));

  const onSubmit = async (addressData: AddressFormData) => {
    if (isProcessing) return;
    if (!cart?.id || !cart.items || cart.items.length === 0) {
      toast({ title: 'Cart is empty', variant: 'danger' });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend (100% prepaid)
      const order = await api.post<any>('/orders', {
        cartId: cart.id,
        couponCode: couponCode || undefined,
        paymentMethod: 'prepaid',
        shippingAddress: addressData,
      });

      // 2. Handle Razorpay Payment Flow
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

      const razorpayKey = String(rzpOrder.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();
      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is not configured. Please set VITE_RAZORPAY_KEY_ID in your environment.');
      }
      const razorpayOrderId = rzpOrder.order_id || rzpOrder.razorpayOrderId;
      const orderDescription = `Order #${order.order_number}`;

        // Configure direct UPI instrument routing
        const upiAppMapping: Record<string, string> = {
          phonepe: 'phonepe',
          gpay: 'google_pay',
          paytm: 'paytm',
        };

        const rzpConfig: any = {
          key: razorpayKey,
          amount: rzpOrder.amount, // order total in paise
          currency: rzpOrder.currency || 'INR',
          name: 'Bingooo Luxury Streetwear',
          description: orderDescription,
          order_id: razorpayOrderId,
            prefill: {
            name: addressData.name,
            contact: addressData.phone,
            email: user?.email || undefined,
            method: paymentMethod === 'upi' ? 'upi' : undefined,
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
                title: 'Payment Confirmed!',
                description: `Order #${order.order_number} successfully placed.`,
                variant: 'success',
              });
              navigate(`/order-success/${encodeURIComponent(order.order_number)}`, {
                replace: true,
                state: { order, paid: true },
              });
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
    <div className="min-h-screen bg-[#F7EEDB] text-[#171717] font-sans antialiased py-8 lg:py-12">
      <SEO
        title="Secure Checkout"
        description="Complete your Bingooo purchase securely with 256-bit encryption. PhonePe, Google Pay, Paytm, Cards, and NetBanking supported."
        noindex={true}
      />
      <h1 className="sr-only">Secure Checkout</h1>
      <div className="container-bingooo">
        <div className="mb-4 sm:mb-6 flex items-center justify-between border-b-2 border-[#171717] pb-4">
          <Logo variant="red" size="md" />
          <div className="flex items-center gap-2 border-2 border-[#171717] bg-white px-2.5 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#171717]">
            <Lock size={12} className="text-[#E6321C]" />
            <span>256-BIT ENCRYPTED</span>
          </div>
        </div>

        {/* Responsive Checkout Stepper: Desktop / Tablet */}
        <nav aria-label="Checkout Progress" className="hidden sm:flex items-center justify-center gap-4 py-3 mb-6 border-b-2 border-[#171717]">
          <div className="flex items-center gap-2 font-mono text-xs font-black text-[#171717]">
            <span className="flex h-6 w-6 items-center justify-center border-2 border-[#171717] bg-white shadow-[1px_1px_0px_#171717]">
              <Check size={12} strokeWidth={3} className="text-[#238636]" />
            </span>
            <span>1. BAG</span>
          </div>
          <span className="h-[2px] w-8 bg-[#171717]" />
          <div className="flex items-center gap-2 font-mono text-xs font-black text-[#E6321C]">
            <span className="flex h-6 w-6 items-center justify-center border-2 border-[#171717] bg-[#E6321C] text-white shadow-[2px_2px_0px_#171717]">2</span>
            <span>2. SHIPPING &amp; PAYMENT</span>
          </div>
          <span className="h-[2px] w-8 bg-[#171717]" />
          <div className="flex items-center gap-2 font-mono text-xs font-black text-[#6F6A63]">
            <span className="flex h-6 w-6 items-center justify-center border-2 border-[#171717] bg-[#EDE0CC] text-[#6F6A63]">3</span>
            <span>3. CONFIRMATION</span>
          </div>
        </nav>

        {/* Responsive Checkout Stepper: Compact Mobile (<640px) */}
        <div className="sm:hidden mb-4 py-2 px-3 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center border border-[#171717] bg-[#E6321C] text-white text-[10px] font-black">2</span>
            <span className="text-[11px] font-black text-[#171717] uppercase tracking-wider font-mono">Step 2: Shipping &amp; Payment</span>
          </div>
          <span className="text-[10px] font-mono font-black text-[#6F6A63]">NEXT: CONFIRM</span>
        </div>

        {/* Mobile Collapsible Order Summary Accordion (lg:hidden) */}
        <div className="lg:hidden mb-6 border-2 border-[#171717] bg-white shadow-[3px_3px_0px_#171717] overflow-hidden">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="w-full px-4 py-3 flex items-center justify-between bg-[#F7EEDB] text-left border-b-2 border-[#171717] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={15} className="text-[#E6321C]" />
              <span className="text-xs font-black text-[#171717] uppercase tracking-wide font-mono">
                {isMobileSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}
              </span>
              {isMobileSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            <span className="font-mono text-sm font-black text-[#171717]">₹{total}</span>
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
                  <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-[#171717]/10">
                    {cart.items.map((item: any) => {
                      const meta = getCartItemMeta(
                        item.variantId || item.variant_id || item.variant?.id || item.id,
                        item.product?.title || item.productTitle,
                        item.product?.slug,
                      );
                      const title = item.product?.title || item.productTitle || meta?.title || 'Garment';
                      const size = item.variant?.size || meta?.size || '';
                      const rawImg =
                        item.customization?.previewKey ||
                        item.customization?.preview_key ||
                        item.customization?.preview_url ||
                        item.image ||
                        item.imageUrl ||
                        item.image_url ||
                        item.product?.primaryImage ||
                        item.product?.primary_image ||
                        item.product?.image ||
                        item.product?.imageUrl ||
                        item.product?.image_url ||
                        item.product?.images?.[0]?.url ||
                        item.product?.images?.[0]?.object_key ||
                        item.product?.images?.[0] ||
                        item.variant?.image ||
                        item.variant?.imageUrl ||
                        item.variant?.image_url ||
                        item.variant?.product?.primaryImage ||
                        item.variant?.product?.primary_image ||
                        item.variant?.product?.imageUrl ||
                        item.variant?.product?.image_url ||
                        item.variant?.product?.images?.[0]?.url ||
                        item.variant?.product?.images?.[0]?.object_key ||
                        item.variant?.product?.images?.[0] ||
                        meta?.image;
                      const imageUrl = rawImg
                        ? resolveImageUrl(
                            typeof rawImg === 'string'
                              ? rawImg
                              : rawImg.url || rawImg.object_key || rawImg.src || '',
                          )
                        : '';
                      const itemPrice =
                        item.total ??
                        (item.unitPrice
                          ? item.unitPrice * item.quantity
                          : item.price
                          ? item.price * item.quantity
                          : item.total_price ??
                            (item.unit_price
                              ? item.unit_price * item.quantity
                              : meta?.price
                              ? meta.price * item.quantity
                              : 0));

                      return (
                        <div key={item.id} className="pt-2.5 first:pt-0 flex gap-3 text-left">
                          <div className="h-12 w-12 border-2 border-[#171717] bg-[#F7EEDB] flex items-center justify-center shrink-0 overflow-hidden relative shadow-[1px_1px_0px_#171717]">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                  const fallback = (e.target as HTMLElement).nextElementSibling;
                                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span
                              className="font-heading font-black text-[10px] text-[#6F6A63] flex items-center justify-center"
                              style={{ display: imageUrl ? 'none' : 'flex' }}
                            >
                              BGO
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-black uppercase text-[#171717] truncate">{title}</h4>
                            <span className="text-[10px] font-mono text-[#6F6A63] block">
                              Size: {size || 'M'} • Qty: {item.quantity}
                            </span>
                            <div className="text-xs font-mono font-black text-[#171717] mt-0.5">
                              ₹{Number(itemPrice || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 border-t-2 border-[#171717] pt-3 text-xs">
                    <div className="flex justify-between font-mono text-[#6F6A63]">
                      <span>SUBTOTAL</span>
                      <span className="font-black text-[#171717]">₹{subtotal}</span>
                    </div>
                    {isPrepaid && prepaidDiscount > 0 && (
                      <div className="flex justify-between font-mono text-emerald-800 font-bold bg-emerald-50 p-1 border border-emerald-300">
                        <span className="flex items-center gap-1">
                          <BadgePercent size={12} />
                          PREPAID DISCOUNT ({prepaidDiscountPct}%)
                        </span>
                        <span>−₹{prepaidDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-mono text-[#6F6A63]">
                      <span>TAXES</span>
                      <span className="font-bold text-[#171717]">INCLUSIVE</span>
                    </div>
                    <div className="border-t-2 border-[#171717] pt-2 flex justify-between font-mono font-black text-[#171717]">
                      <span>TOTAL PAYABLE</span>
                      <span className="text-base text-[#E6321C]">₹{total}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-12">
          {/* Left Column: Shipping & Payment (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Saved Addresses Picker */}
            {addresses.length > 0 && (
              <div className="border-2 border-[#171717] bg-white p-6 shadow-[3px_3px_0px_#171717]">
                <h3 className="font-mono text-xs font-black uppercase text-[#171717] flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-[#E6321C]" /> SELECT SAVED ADDRESS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 border-2 cursor-pointer transition-all text-left text-xs ${
                        selectedAddressId === addr.id
                          ? 'border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717] font-black'
                          : 'border-[#171717]/30 hover:border-[#171717] text-[#6F6A63]'
                      }`}
                    >
                      <div className="font-black text-[#171717] uppercase">{addr.name}</div>
                      <div className="truncate">{addr.line1}</div>
                      <div className="font-mono text-[11px]">
                        {addr.city}, {addr.postal_code}
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedAddressId('custom')}
                    className={`p-3 border-2 border-dashed cursor-pointer flex items-center justify-center font-mono text-xs font-black uppercase transition-all ${
                      selectedAddressId === 'custom'
                        ? 'border-[#171717] bg-[#F7EEDB] text-[#E6321C] shadow-[2px_2px_0px_#171717]'
                        : 'border-[#171717]/40 hover:border-[#171717] text-[#6F6A63]'
                    }`}
                  >
                    + Enter New Address
                  </div>
                </div>
              </div>
            )}

            {/* Address Details Form */}
            <div className="border-2 border-[#171717] bg-white p-6 shadow-[3px_3px_0px_#171717]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717] mb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-[#171717]">
                  1. SHIPPING ADDRESS
                </h2>
                <span className="border border-[#171717] bg-[#F7EEDB] px-1.5 py-0.5 font-mono text-[9px] font-black uppercase">
                  DELIVERY
                </span>
              </div>
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
            <div className="border-2 border-[#171717] bg-white p-6 shadow-[3px_3px_0px_#171717] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]">
                <h2 className="text-base font-black uppercase tracking-tight text-[#171717]">
                  2. CHOOSE PAYMENT METHOD
                </h2>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase text-[#238636]">
                  <ShieldCheck size={14} />
                  <span>100% SECURE</span>
                </div>
              </div>

              {hasCustomItems && (
                <div className="border-2 border-[#171717] bg-[#F7EEDB] p-3.5 flex items-start gap-3 shadow-[2px_2px_0px_#171717]">
                  <Sparkles size={16} className="text-[#E6321C] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-mono font-black uppercase text-[#171717]">Bespoke Custom Print Item in Cart</p>
                    <p className="text-[#6F6A63] text-[11px] mt-0.5">
                      Because custom garments are printed exclusively for you, all bespoke custom studio pieces are fulfilled via secure prepaid checkout.
                    </p>
                  </div>
                </div>
              )}

              {/* OPTION 1: UPI APPS (PhonePe, Google Pay, Paytm, UPI) */}
              <div
                className={`border-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#171717] bg-[#F7EEDB]/30 shadow-[3px_3px_0px_#171717]'
                    : 'border-[#171717]/40 bg-white hover:border-[#171717]'
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
                      className="accent-[#E6321C] mt-1"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black uppercase tracking-tight text-[#171717]">Instant UPI Payment</span>
                        <span className="border border-[#171717] bg-[#E6321C] px-1.5 py-0.2 font-mono text-[9px] font-black uppercase text-white shadow-[1px_1px_0px_#171717]">
                          RECOMMENDED
                        </span>
                        <span className="border border-[#171717] bg-emerald-600 px-1.5 py-0.2 font-mono text-[9px] font-black uppercase text-white flex items-center gap-0.5">
                          <BadgePercent size={9} /> SAVE {prepaidDiscountPct}%
                        </span>
                      </div>
                      <p className="text-xs text-[#6F6A63] mt-1">
                        Direct payment via your preferred UPI app. Instant refund & zero convenience fee.
                      </p>
                      {prepaidDiscount > 0 && paymentMethod === 'upi' && (
                        <p className="text-xs font-mono font-black text-emerald-700 mt-1">
                          You save ₹{prepaidDiscount} with prepaid payment!
                        </p>
                      )}
                    </div>
                  </div>
                  <Zap size={18} className="text-[#E6321C] shrink-0" />
                </div>

                {/* Branded UPI Apps Grid */}
                <div className="mt-4 pt-3 border-t-2 border-[#171717]">
                  <span className="font-mono text-[10px] font-black uppercase text-[#171717] block mb-2.5">
                    SELECT PAYMENT APP:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('phonepe');
                      }}
                      className={`btn-bauhaus relative flex flex-col items-center justify-center p-3 border-2 transition-all text-center cursor-pointer ${
                        paymentMethod === 'upi' && selectedUpiApp === 'phonepe'
                          ? 'border-[#171717] bg-white shadow-[3px_3px_0px_#171717]'
                          : 'border-[#171717]/40 bg-white hover:border-[#171717] hover:bg-[#F7EEDB]'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'phonepe' && (
                        <CheckCircle2 size={13} className="absolute top-1.5 right-1.5 text-[#5F259F]" />
                      )}
                      <PhonePeIcon className="w-7 h-7" />
                      <span className="text-xs font-black uppercase tracking-tight text-[#171717] mt-1">PhonePe</span>
                      <span className="text-[9px] font-mono text-[#6F6A63]">Direct</span>
                    </button>

                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('gpay');
                      }}
                      className={`btn-bauhaus relative flex flex-col items-center justify-center p-3 border-2 transition-all text-center cursor-pointer ${
                        paymentMethod === 'upi' && selectedUpiApp === 'gpay'
                          ? 'border-[#171717] bg-white shadow-[3px_3px_0px_#171717]'
                          : 'border-[#171717]/40 bg-white hover:border-[#171717] hover:bg-[#F7EEDB]'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'gpay' && (
                        <CheckCircle2 size={13} className="absolute top-1.5 right-1.5 text-[#4285F4]" />
                      )}
                      <GooglePayIcon className="w-7 h-7" />
                      <span className="text-xs font-black uppercase tracking-tight text-[#171717] mt-1">Google Pay</span>
                      <span className="text-[9px] font-mono text-[#6F6A63]">GPay UPI</span>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('paytm');
                      }}
                      className={`btn-bauhaus relative flex flex-col items-center justify-center p-3 border-2 transition-all text-center cursor-pointer ${
                        paymentMethod === 'upi' && selectedUpiApp === 'paytm'
                          ? 'border-[#171717] bg-white shadow-[3px_3px_0px_#171717]'
                          : 'border-[#171717]/40 bg-white hover:border-[#171717] hover:bg-[#F7EEDB]'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'paytm' && (
                        <CheckCircle2 size={13} className="absolute top-1.5 right-1.5 text-[#002970]" />
                      )}
                      <PaytmIcon className="w-7 h-7" />
                      <span className="text-xs font-black uppercase tracking-tight text-[#171717] mt-1">Paytm</span>
                      <span className="text-[9px] font-mono text-[#6F6A63]">UPI / Wallet</span>
                    </button>

                    {/* Any UPI / QR */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('upi');
                        setSelectedUpiApp('any');
                      }}
                      className={`btn-bauhaus relative flex flex-col items-center justify-center p-3 border-2 transition-all text-center cursor-pointer ${
                        paymentMethod === 'upi' && selectedUpiApp === 'any'
                          ? 'border-[#171717] bg-white shadow-[3px_3px_0px_#171717]'
                          : 'border-[#171717]/40 bg-white hover:border-[#171717] hover:bg-[#F7EEDB]'
                      }`}
                    >
                      {paymentMethod === 'upi' && selectedUpiApp === 'any' && (
                        <CheckCircle2 size={13} className="absolute top-1.5 right-1.5 text-[#171717]" />
                      )}
                      <UpiIcon className="w-7 h-7" />
                      <span className="text-xs font-black uppercase tracking-tight text-[#171717] mt-1">Any UPI</span>
                      <span className="text-[9px] font-mono text-[#6F6A63]">Scan / ID</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OPTION 2: CARDS / NETBANKING */}
              <div
                className={`border-2 transition-all cursor-pointer ${
                  paymentMethod === 'cards'
                    ? 'border-[#171717] bg-[#F7EEDB]/30 shadow-[3px_3px_0px_#171717]'
                    : 'border-[#171717]/40 bg-white hover:border-[#171717]'
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
                      className="accent-[#E6321C] mt-1"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black uppercase tracking-tight text-[#171717]">Cards & NetBanking</span>
                        <span className="border border-[#171717] bg-emerald-600 px-1.5 py-0.2 font-mono text-[9px] font-black uppercase text-white flex items-center gap-0.5">
                          <BadgePercent size={9} /> SAVE {prepaidDiscountPct}%
                        </span>
                      </div>
                      <p className="text-xs text-[#6F6A63] mt-1">
                        Visa, Mastercard, RuPay, Maestro & all major Indian banks.
                      </p>
                      {prepaidDiscount > 0 && paymentMethod === 'cards' && (
                        <p className="text-xs font-mono font-black text-emerald-700 mt-1">
                          You save ₹{prepaidDiscount} with prepaid payment!
                        </p>
                      )}
                    </div>
                  </div>
                  <CreditCard size={18} className="text-[#6F6A63] shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 border-2 border-[#171717] bg-white p-6 shadow-[4px_4px_0px_#171717] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]">
                <h2 className="text-base font-black uppercase tracking-tight text-[#171717]">ORDER SUMMARY</h2>
                <span className="border border-[#171717] bg-[#F7EEDB] px-1.5 py-0.5 font-mono text-[9px] font-black uppercase">
                  PAYMENT
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 divide-y divide-[#171717]/10">
                {cart.items.map((item: any) => {
                  const meta = getCartItemMeta(
                    item.variantId || item.variant_id || item.variant?.id || item.id,
                    item.product?.title || item.productTitle,
                    item.product?.slug,
                  );
                  const title = item.product?.title || item.productTitle || meta?.title || 'Garment';
                  const size = item.variant?.size || meta?.size || '';
                  const rawImg =
                    item.customization?.previewKey ||
                    item.customization?.preview_key ||
                    item.customization?.preview_url ||
                    item.image ||
                    item.imageUrl ||
                    item.image_url ||
                    item.product?.primaryImage ||
                    item.product?.primary_image ||
                    item.product?.image ||
                    item.product?.imageUrl ||
                    item.product?.image_url ||
                    item.product?.images?.[0]?.url ||
                    item.product?.images?.[0]?.object_key ||
                    item.product?.images?.[0] ||
                    item.variant?.image ||
                    item.variant?.imageUrl ||
                    item.variant?.image_url ||
                    item.variant?.product?.primaryImage ||
                    item.variant?.product?.primary_image ||
                    item.variant?.product?.imageUrl ||
                    item.variant?.product?.image_url ||
                    item.variant?.product?.images?.[0]?.url ||
                    item.variant?.product?.images?.[0]?.object_key ||
                    item.variant?.product?.images?.[0] ||
                    meta?.image;
                  const imageUrl = rawImg
                    ? resolveImageUrl(
                        typeof rawImg === 'string'
                          ? rawImg
                          : rawImg.url || rawImg.object_key || rawImg.src || '',
                      )
                    : '';
                  const itemPrice =
                    item.total ??
                    (item.unitPrice
                      ? item.unitPrice * item.quantity
                      : item.price
                      ? item.price * item.quantity
                      : item.total_price ??
                        (item.unit_price
                          ? item.unit_price * item.quantity
                          : meta?.price
                          ? meta.price * item.quantity
                          : 0));

                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 text-left">
                      <div className="h-14 w-14 border-2 border-[#171717] bg-[#F7EEDB] flex items-center justify-center shrink-0 overflow-hidden relative shadow-[1px_1px_0px_#171717]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const fallback = (e.target as HTMLElement).nextElementSibling;
                              if (fallback) (fallback as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span
                          className="font-heading font-black text-xs text-[#6F6A63] flex items-center justify-center"
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          BGO
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black uppercase tracking-tight text-[#171717] truncate">{title}</h4>
                        <span className="text-[10px] font-mono text-[#6F6A63] block">
                          Size: {size || 'M'} • Qty: {item.quantity}
                        </span>
                        {item.customization && (
                          <span className="inline-flex items-center gap-1 mt-0.5 border border-[#171717] bg-[#E6321C] text-white px-1 py-0.2 text-[8px] font-mono font-black uppercase">
                            <Sparkles size={8} />
                            <span>CUSTOM</span>
                          </span>
                        )}
                        <div className="text-xs font-mono font-black text-[#171717] mt-0.5">
                          ₹{Number(itemPrice || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-2 border-t-2 border-[#171717] pt-4 font-mono text-xs">
                <div className="flex justify-between text-[#6F6A63]">
                  <span>SUBTOTAL</span>
                  <span className="font-black text-[#171717]">₹{subtotal}</span>
                </div>

                {/* Prepaid Discount Line */}
                {isPrepaid && prepaidDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-1 border border-emerald-300">
                    <span className="flex items-center gap-1">
                      <BadgePercent size={13} />
                      PREPAID DISCOUNT ({prepaidDiscountPct}%)
                    </span>
                    <span>−₹{prepaidDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6F6A63]">
                  <span>DELIVERY</span>
                  <span className="font-bold text-[#171717]">FREE</span>
                </div>

                <div className="border-t-2 border-[#171717] pt-3 flex justify-between items-baseline font-mono font-black text-[#171717]">
                  <span className="text-sm">TOTAL AMOUNT</span>
                  <span className="text-2xl text-[#E6321C]">₹{total}</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-bauhaus w-full min-h-[52px] bg-[#E6321C] text-white border-2 border-[#171717] text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_#171717] hover:bg-[#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing
                  ? 'SECURING ORDER...'
                  : paymentMethod === 'upi'
                  ? `PAY ₹${total} VIA ${
                      selectedUpiApp === 'phonepe'
                        ? 'PHONEPE'
                        : selectedUpiApp === 'gpay'
                        ? 'GOOGLE PAY'
                        : selectedUpiApp === 'paytm'
                        ? 'PAYTM'
                        : 'UPI'
                    }`
                  : `PAY ₹${total} VIA CARDS / NETBANKING`}
              </button>

              <div className="flex items-center justify-center gap-2 font-mono text-[9px] font-black uppercase text-[#6F6A63]">
                <ShieldCheck size={14} className="text-[#238636]" />
                <span>30-DAY EASY RETURNS • 100% COMBED COTTON</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

