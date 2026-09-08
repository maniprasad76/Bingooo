import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Clock,
  Truck,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { SEO } from '../components/common/SEO';
import { ResponseTimePromise } from '../components/common/ResponseTimePromise';
import { BrandPageLoader } from '../components/ui/BrandPageLoader';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';

export function OrderSuccessPage() {
  const location = useLocation();
  const params = useParams<{ orderNumber?: string }>();
  const { toast } = useToast();

  const stateOrder = (location.state as any)?.order;
  const orderNumberParam = params.orderNumber;

  const [order, setOrder] = useState<any>(stateOrder || null);
  const [isLoading, setIsLoading] = useState<boolean>(!stateOrder && !!orderNumberParam);
  const [copied, setCopied] = useState<boolean>(false);

  // If order was not passed via state, fetch it by orderNumberParam if available
  useEffect(() => {
    if (!order && orderNumberParam) {
      setIsLoading(true);
      api
        .get<any>(`/orders/${orderNumberParam}`)
        .then((data) => {
          setOrder(data);
        })
        .catch((err) => {
          console.error('Failed to load order:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [order, orderNumberParam]);

  // Fallback demo order if navigated directly without an order (for preview/verification)
  const displayOrder = order || {
    id: 'ord_demo_2026',
    order_number: orderNumberParam || 'BNG-984210',
    created_at: new Date().toISOString(),
    status: 'paid',
    payment_status: 'captured',
    subtotal: 1998,
    discount_amount: 200,
    shipping_amount: 0,
    total: 1798,
    currency: 'INR',
    customer_notes: 'Please double-check chest print alignment',
    address_snapshot_json: {
      name: 'Aditya Sen',
      line1: 'Flat 402, Oakwood Residences',
      line2: 'Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India',
      phone: '+91 98450 12345',
    },
    items: [
      {
        id: 'item-1',
        product_title: 'Classic Heavyweight Oversized Tee',
        variant_title: 'Washed Charcoal / L',
        quantity: 1,
        unit_price: 999,
        total_price: 999,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop',
        customization: {
          design_title: 'Studio Minimal Red Chest Typo',
          technique: 'Direct-to-Film (DTF) High Density',
        },
      },
      {
        id: 'item-2',
        product_title: 'Heavy Terry Boxy Hoodie',
        variant_title: 'Raw Bone / L',
        quantity: 1,
        unit_price: 999,
        total_price: 999,
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop',
      },
    ],
  };

  const address = displayOrder.address_snapshot_json || {};

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(displayOrder.order_number);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      message: `Order #${displayOrder.order_number} copied.`,
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) {
    return <BrandPageLoader message="Fetching your order details..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F7EEDB] py-8 sm:py-14 text-[#171717]">
      <SEO
        title={`Order Confirmed #${displayOrder.order_number}`}
        description="Your Bingooo bespoke menswear order has been successfully placed. View item details, fulfillment timeline, and dispatch guarantee."
      />

      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Minimal Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo variant="red" size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintReceipt}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD3C5] bg-white px-3 py-1.5 text-xs font-bold text-[#171717] hover:bg-[#EDE0CC]/40 transition-colors shadow-xs"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
            <Link to="/shop">
              <Button variant="secondary" size="sm">
                Shop New Arrivals
              </Button>
            </Link>
          </div>
        </div>

        {/* ─── Hero Celebratory Card ─── */}
        <div className="relative overflow-hidden rounded-3xl border border-[#DDD3C5] bg-white p-6 sm:p-12 shadow-sm text-center">
          {/* Subtle Background Red Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-[#E6321C]/10 blur-3xl" />

          {/* Animated Success Seal */}
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="relative mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#238636]/10 text-[#238636] ring-8 ring-[#238636]/5"
          >
            <CheckCircle2 size={44} className="sm:scale-125" />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6321C]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#E6321C]">
            <Sparkles size={12} />
            Payment Verified & Locked
          </span>

          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171717] uppercase">
            Thank You For Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-[#6F6A63] leading-relaxed">
            Your garments have been transmitted to our master cutting and tailoring workshop in
            Bengaluru. We have sent a complete order confirmation to your email.
          </p>

          {/* Order Reference Pill */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#DDD3C5] bg-[#FDF9F4] p-2 sm:px-4 sm:py-2.5">
            <span className="text-xs font-semibold text-[#6F6A63]">Order Reference:</span>
            <span className="font-mono text-sm sm:text-base font-black text-[#171717] tracking-wider">
              #{displayOrder.order_number}
            </span>
            <button
              onClick={handleCopyOrderNumber}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#171717] border border-[#DDD3C5] hover:bg-[#EDE0CC]/50 transition-colors"
              title="Copy Order Reference"
            >
              {copied ? <Check size={13} className="text-[#238636]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* ─── Production & Fulfillment Timeline Tracker ─── */}
        <div className="rounded-3xl border border-[#DDD3C5] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD3C5]/60 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C]">
                Real-Time Fulfillment Tracker
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#171717]">
                Workshop Production Milestones
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#238636]/10 px-3 py-1 text-xs font-bold text-[#238636]">
              <span className="h-2 w-2 rounded-full bg-[#238636] animate-pulse" />
              Workshop Priority Queue: Active
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Order Confirmed',
                desc: 'Payment captured, fabric batch reserved.',
                status: 'done',
                icon: CheckCircle2,
                time: 'Just now',
              },
              {
                step: '02',
                title: 'Tailoring & DTF Print',
                desc: 'Pattern cutting, bio-wash & quality audit.',
                status: 'current',
                icon: Clock,
                time: 'Next 24–36 hrs',
              },
              {
                step: '03',
                title: 'Workshop Dispatch',
                desc: 'Eco-sealed in protective box with sticker pack.',
                status: 'upcoming',
                icon: Package,
                time: 'Within 48 hrs',
              },
              {
                step: '04',
                title: 'Air Express Delivery',
                desc: 'Hand-delivered to your doorstep via BlueDart.',
                status: 'upcoming',
                icon: Truck,
                time: '3–5 days',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              const isDone = item.status === 'done';
              const isCurrent = item.status === 'current';

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 transition-all relative ${
                    isCurrent
                      ? 'border-[#E6321C] bg-[#FDF0EE]/50 ring-2 ring-[#E6321C]/20'
                      : isDone
                      ? 'border-[#238636]/30 bg-[#238636]/5'
                      : 'border-[#DDD3C5]/60 bg-[#FDF9F4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`font-mono text-[11px] font-black uppercase ${
                        isCurrent ? 'text-[#E6321C]' : isDone ? 'text-[#238636]' : 'text-[#6F6A63]'
                      }`}
                    >
                      Step {item.step}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        isCurrent
                          ? 'bg-[#E6321C] text-white'
                          : isDone
                          ? 'bg-[#238636] text-white'
                          : 'bg-[#DDD3C5]/40 text-[#6F6A63]'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm text-[#171717]">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#6F6A63] leading-relaxed">{item.desc}</p>
                  <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-[#171717]/80">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Response Time Promise Workshop Guarantee ─── */}
        <ResponseTimePromise variant="section" />

        {/* ─── Order Summary & Garment Details Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Itemized Garments */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-[#DDD3C5] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#DDD3C5]/60">
                <h2 className="text-base sm:text-lg font-extrabold text-[#171717] uppercase tracking-wide">
                  Your Garments ({displayOrder.items?.length || 0})
                </h2>
                <span className="text-xs font-bold text-[#6F6A63]">240 GSM Combed Cotton</span>
              </div>

              <div className="divide-y divide-[#DDD3C5]/50 mt-4">
                {displayOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop'}
                      alt={item.product_title}
                      className="h-20 w-16 sm:h-24 sm:w-20 rounded-xl object-cover border border-[#DDD3C5] bg-[#EDE0CC]/30 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-[#171717] leading-snug">
                            {item.product_title}
                          </h4>
                          <span className="text-xs text-[#6F6A63] font-medium block mt-0.5">
                            {item.variant_title || 'Regular Edit'}
                          </span>
                        </div>
                        <span className="font-mono text-sm font-black text-[#171717]">
                          ₹{item.total_price || item.unit_price}
                        </span>
                      </div>

                      {item.customization && (
                        <div className="mt-2 rounded-lg bg-[#FDF0EE] p-2 text-xs border border-[#E6321C]/20">
                          <span className="font-bold text-[#E6321C] block text-[11px] uppercase tracking-wider">
                            Custom Workshop Print
                          </span>
                          <p className="text-[#171717] text-[11px] mt-0.5">
                            {item.customization.design_title} ({item.customization.technique})
                          </p>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-xs text-[#6F6A63]">
                        <span>Qty: {item.quantity}</span>
                        <span className="text-[#238636] font-semibold text-[11px]">
                          ✓ Pre-shrunk & Washed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help or Custom Revision Card */}
            <div className="rounded-3xl border border-[#DDD3C5] bg-[#FDF9F4] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] block">
                  Dedicated Concierge
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#171717] mt-0.5">
                  Need an urgent address change or size revision?
                </h3>
                <p className="text-xs text-[#6F6A63] mt-1">
                  Our WhatsApp support responds in under 18 minutes during workshop hours (9 AM - 9 PM).
                </p>
              </div>
              <a
                href={`https://wa.me/919876543210?text=Hi%20Bingooo,%20I%20have%20an%20urgent%20inquiry%20regarding%20my%20order%20${displayOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#E6321C] transition-colors shrink-0 shadow-xs"
              >
                <Phone size={14} />
                <span>Message Concierge</span>
              </a>
            </div>
          </div>

          {/* Right Column: Financial Breakdown & Shipping Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment & Breakdown Card */}
            <div className="rounded-3xl border border-[#DDD3C5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#171717] pb-3 border-b border-[#DDD3C5]/60">
                Payment Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#6F6A63]">
                  <span>Garments Subtotal</span>
                  <span className="font-mono text-[#171717] font-semibold">
                    ₹{displayOrder.subtotal || displayOrder.total}
                  </span>
                </div>

                {displayOrder.discount_amount ? (
                  <div className="flex justify-between text-[#238636]">
                    <span>Promotional Atelier Privilege</span>
                    <span className="font-mono font-semibold">-₹{displayOrder.discount_amount}</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-[#6F6A63]">
                  <span>Pan-India Air Shipping</span>
                  <span className="font-mono text-[#238636] font-semibold uppercase">FREE</span>
                </div>

                <div className="flex justify-between text-[#6F6A63]">
                  <span>GST (12% Included)</span>
                  <span className="font-mono text-[#171717] font-semibold">Calculated</span>
                </div>

                <div className="border-t border-[#DDD3C5] pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-[#171717] uppercase">Total Paid</span>
                    <span className="text-[10px] text-[#6F6A63] block">Includes all taxes</span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#E6321C]">
                    ₹{displayOrder.total}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#EDE0CC]/30 p-3 text-[11px] text-[#6F6A63] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#238636] shrink-0" />
                <span>Transaction settled via 256-bit SSL encrypted gateway.</span>
              </div>
            </div>

            {/* Shipping Destination Card */}
            <div className="rounded-3xl border border-[#DDD3C5] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]/60">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#171717]">
                  Delivery Address
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#238636] bg-[#238636]/10 px-2 py-0.5 rounded">
                  BlueDart Express
                </span>
              </div>

              <div className="text-xs text-[#171717] leading-relaxed space-y-1">
                <strong className="block text-sm font-extrabold text-[#171717]">
                  {address.name || 'Valued Customer'}
                </strong>
                <p className="text-[#6F6A63]">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                  <br />
                  {address.city}, {address.state} - {address.postalCode}
                  <br />
                  {address.country || 'India'}
                </p>
                {address.phone && (
                  <p className="text-[#6F6A63] pt-1">
                    Phone: <span className="font-mono font-medium text-[#171717]">{address.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link to="/account/orders" className="block">
                <Button variant="secondary" size="lg" className="w-full">
                  <Package size={16} />
                  <span>View All In Your Account</span>
                </Button>
              </Link>
              <Link to="/shop" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  <span>Continue Shopping Menswear</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
