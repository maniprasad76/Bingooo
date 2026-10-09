import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { m, useReducedMotion } from 'framer-motion';
import {
  Check,
  Copy,
  Package,
  PackageCheck,
  Truck,
  Home,
  ArrowRight,
  MapPin,
  AlertCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Printer,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { BrandPageLoader } from '../components/ui/BrandPageLoader';
import { ProductPlaceholder } from '../components/ui/ProductPlaceholder';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { trackPurchase } from '../lib/analytics';

const PAID_STATUSES = ['captured', 'paid'];
// The WhatsApp confirmation is sent a moment after payment; re-check briefly so
// the page can say it has arrived.
const REFRESH_DELAYS_MS = [2500, 6000];

const formatINR = (value: unknown) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function OrderSuccessPage() {
  const location = useLocation();
  const params = useParams<{ orderNumber?: string }>();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();

  const navState = (location.state as any) || {};
  const stateOrder = navState.order;
  const orderNumber: string | undefined = params.orderNumber || stateOrder?.order_number;
  const isPaymentFailure = location.pathname.startsWith('/payment/failure');
  // Checkout only navigates here after the server verified the payment.
  const verifiedAtCheckout = Boolean(navState.paid) || location.pathname.startsWith('/payment/success');

  const [order, setOrder] = useState<any>(stateOrder || null);
  const [hasFreshOrder, setHasFreshOrder] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(!stateOrder && !!orderNumber && !isPaymentFailure);
  const [copied, setCopied] = useState(false);
  const refreshCount = useRef(0);
  const purchaseTracked = useRef(false);

  // Load the latest copy of the order (the checkout snapshot predates payment).
  useEffect(() => {
    if (!orderNumber || isPaymentFailure) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () =>
      api
        .get<any>(`/orders/${encodeURIComponent(orderNumber)}`)
        .then((data) => {
          if (cancelled) return;
          setOrder(data);
          setHasFreshOrder(true);
          const paid = PAID_STATUSES.includes(String(data?.payment_status));

          if (paid && !purchaseTracked.current) {
            purchaseTracked.current = true;
            trackPurchase({
              orderNumber: String(data.order_number || data.id || orderNumber),
              amount: Number(data.total_amount || data.total || 0),
              items: data.items,
            });
          }

          if (paid && data?.whatsapp_confirmation?.status === 'sending' && refreshCount.current < REFRESH_DELAYS_MS.length) {
            timer = setTimeout(load, REFRESH_DELAYS_MS[refreshCount.current++]);
          }
        })
        .catch((err) => console.error('Failed to load order:', err))
        .finally(() => !cancelled && setIsLoading(false));
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderNumber, isPaymentFailure]);

  if (isLoading) {
    return <BrandPageLoader message="Loading your order..." fullScreen />;
  }

  // Never show placeholder order details: without a real order, say so plainly.
  if (!order || isPaymentFailure) {
    return <OrderUnavailable paymentFailed={isPaymentFailure} orderNumber={orderNumber} />;
  }

  const isPaid = PAID_STATUSES.includes(String(order.payment_status)) || (!hasFreshOrder && verifiedAtCheckout);
  const address = order.address_snapshot_json || order.shipping_address || {};
  const firstName = String(address.name || '').trim().split(/\s+/)[0];
  const phoneDigits = String(address.phone || '').replace(/\D/g, '');
  const maskedPhone = phoneDigits.length >= 4 ? `•••• ${phoneDigits.slice(-4)}` : '';
  const whatsappStatus: string | undefined = order.whatsapp_confirmation?.status;
  const items: any[] = order.items || [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const discount = Number(order.discount || 0) + Number(order.prepaid_discount || 0);
  const placedAt = order.created_at ? new Date(order.created_at) : new Date();
  const placedDate = placedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const placedTime = placedAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const trackHref = `/track-order?orderNumber=${encodeURIComponent(order.order_number)}`;

  const handleCopy = async () => {
    triggerHaptic('light');
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      toast({ title: 'Order number copied', variant: 'success' });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({ title: 'Could not copy', description: order.order_number, variant: 'info' });
    }
  };

  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7EEDB] font-sans text-[#171717] antialiased">
      <SEO
        title={isPaid ? `Order confirmed · ${order.order_number}` : `Order ${order.order_number}`}
        description="Thank you for shopping with Bingooo."
        noindex
      />

      {/* Soft glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#EDE0CC,transparent)] print:hidden"
      />

      <div className="relative mx-auto max-w-[1120px] px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="flex flex-col items-center text-center">
          {isPaid ? <ConfirmedBadge reduceMotion={Boolean(reduceMotion)} /> : <PendingBadge />}

          <m.p
            {...fadeUp(0.35)}
            className="mt-7 mb-0 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E6321C]"
          >
            {isPaid ? 'Order confirmed' : 'Awaiting payment'}
          </m.p>

          <m.h1
            {...fadeUp(0.45)}
            className="m-0 mt-3 text-[clamp(36px,7vw,68px)] font-extrabold leading-[0.95] tracking-[-0.045em]"
          >
            {isPaid ? (
              <>
                Thank you{firstName ? ',' : ''}
                {firstName && (
                  <>
                    <br className="sm:hidden" /> <span className="text-[#E6321C]">{firstName}.</span>
                  </>
                )}
                {!firstName && '.'}
              </>
            ) : (
              'Almost there.'
            )}
          </m.h1>

          <m.p
            {...fadeUp(0.55)}
            className="mx-auto mb-0 mt-5 max-w-[540px] text-xs sm:text-sm font-medium leading-relaxed text-[#6F6A63]"
          >
            {isPaid
              ? 'Your payment was received and your order is confirmed. We’re getting your pieces ready for dispatch.'
              : 'We haven’t received the payment for this order yet. If money has left your account, it will be confirmed here automatically within a few minutes.'}
          </m.p>

          <m.div {...fadeUp(0.65)} className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-bauhaus group inline-flex items-center gap-2.5 border-2 border-[#171717] bg-white px-4 py-2 shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              aria-label={`Copy order number ${order.order_number}`}
            >
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#6F6A63]">ORDER</span>
              <span className="font-mono text-xs font-black tracking-wider text-[#171717]">{order.order_number}</span>
              {copied ? (
                <Check size={14} className="text-[#E6321C]" />
              ) : (
                <Copy size={14} className="text-[#6F6A63] transition-colors group-hover:text-[#171717]" />
              )}
            </button>
            <span className="inline-flex items-center gap-1.5 border-2 border-[#171717] bg-[#EDE0CC] px-3.5 py-2 font-mono text-[11px] font-bold text-[#171717] shadow-[2px_2px_0px_#171717]">
              <Clock size={12} />
              {placedDate} · {placedTime}
            </span>
          </m.div>

          {isPaid && maskedPhone && (whatsappStatus === 'sent' || whatsappStatus === 'sending') && (
            <m.div
              {...fadeUp(0.75)}
              className="mt-4 inline-flex items-center gap-2 border-2 border-[#171717] bg-white px-3.5 py-1.5 font-mono text-[11px] font-black uppercase text-[#171717] shadow-[2px_2px_0px_#171717]"
              aria-live="polite"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              {whatsappStatus === 'sent' ? (
                <span>
                  CONFIRMATION SENT TO WHATSAPP <span className="font-mono text-[#E6321C]">{maskedPhone}</span>
                </span>
              ) : (
                <span className="text-[#6F6A63]">SENDING CONFIRMATION ON WHATSAPP…</span>
              )}
            </m.div>
          )}

          <m.div {...fadeUp(0.8)} className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row print:hidden">
            <Link
              to={trackHref}
              className="btn-bauhaus inline-flex items-center justify-center gap-2 bg-[#E6321C] text-white border-2 border-[#171717] px-6 py-3.5 font-mono text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all no-underline"
            >
              <Truck size={15} />
              <span>TRACK ORDER</span>
            </Link>
            <Link
              to="/shop"
              className="btn-bauhaus inline-flex items-center justify-center gap-2 bg-white text-[#171717] border-2 border-[#171717] px-6 py-3.5 font-mono text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_#171717] hover:bg-[#F7EEDB] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all no-underline"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight size={15} />
            </Link>
          </m.div>
        </section>

        {/* ── Details ──────────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-1 items-start gap-6 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* Receipt */}
          <m.section
            {...fadeUp(0.9)}
            className="relative border-2 border-[#171717] bg-white shadow-[4px_4px_0px_#171717] lg:col-span-7"
            aria-labelledby="order-summary-heading"
          >
            <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 border-b-2 border-[#171717] sm:px-7 sm:pt-6">
              <h2 id="order-summary-heading" className="m-0 text-base font-black uppercase tracking-tight sm:text-lg">
                YOUR ORDER
              </h2>
              <span className="border border-[#171717] bg-[#F7EEDB] px-2 py-0.5 font-mono text-[10px] font-black uppercase">
                {itemCount} {itemCount === 1 ? 'PIECE' : 'PIECES'}
              </span>
            </div>

            <ul className="m-0 list-none divide-y divide-[#171717]/10 px-5 sm:px-7">
              {items.map((item) => {
                const title = item.product_title || item.title_snapshot || 'Item';
                const variant = item.variant_snapshot_json || {};
                const meta = [variant.size && `Size ${variant.size}`, variant.color].filter(Boolean).join(' · ');
                const lineTotal = item.total ?? Number(item.unit_price || 0) * Number(item.quantity || 1);
                return (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="h-[84px] w-[68px] shrink-0 overflow-hidden border-2 border-[#171717] bg-[#F7EEDB] shadow-[2px_2px_0px_#171717]">
                      {item.image_url ? (
                        <img src={item.image_url} alt={title} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <ProductPlaceholder name={title} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[14px] font-black uppercase leading-snug sm:text-[15px]">{title}</p>
                      {meta && <p className="m-0 mt-0.5 font-mono text-[11px] text-[#6F6A63]">{meta}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-[#6F6A63] border border-[#171717]/20 px-1">Qty {item.quantity || 1}</span>
                        {item.customization && (
                          <span className="inline-flex items-center gap-1 border border-[#171717] bg-[#E6321C] text-white px-1.5 py-0.2 font-mono text-[9px] font-black uppercase shadow-[1px_1px_0px_#171717]">
                            <Sparkles size={9} />
                            CUSTOM
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[14px] font-black">{formatINR(lineTotal)}</span>
                  </li>
                );
              })}
            </ul>

            <dl className="m-0 space-y-2 px-5 pb-6 pt-4 border-t-2 border-[#171717] font-mono text-xs sm:px-7">
              <SummaryRow label="SUBTOTAL" value={formatINR(order.subtotal ?? order.total)} />
              {discount > 0 && <SummaryRow label="DISCOUNT" value={`−${formatINR(discount)}`} accent />}
              <SummaryRow label="DELIVERY" value="FREE" accent />
              <SummaryRow label="TAXES" value="INCLUSIVE" />
              <div className="flex items-end justify-between border-t-2 border-[#171717] pt-4 mt-2">
                <dt className="text-xs font-black uppercase">
                  {isPaid ? 'TOTAL PAID' : 'TOTAL AMOUNT'}
                  <span className="mt-0.5 block font-mono text-[10px] font-normal text-[#6F6A63]">
                    {isPaid ? 'PAID ONLINE // 100% SECURE' : 'PAYMENT PENDING'}
                  </span>
                </dt>
                <dd className="m-0 font-mono text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                  {formatINR(order.total)}
                </dd>
              </div>
            </dl>
          </m.section>

          <div className="space-y-6 lg:col-span-5">
            {/* What happens next */}
            <m.section {...fadeUp(1)} className="border-2 border-[#171717] bg-white p-5 sm:p-7 shadow-[4px_4px_0px_#171717]" aria-labelledby="next-heading">
              <h2 id="next-heading" className="m-0 text-base font-black uppercase tracking-tight pb-3 border-b-2 border-[#171717]">
                WHAT HAPPENS NEXT
              </h2>
              <ProgressTimeline status={String(order.status || '')} paid={isPaid} placedTime={placedTime} />
            </m.section>

            {/* Delivery address */}
            {(address.line1 || address.city) && (
              <m.section {...fadeUp(1.1)} className="border-2 border-[#171717] bg-white p-5 sm:p-7 shadow-[4px_4px_0px_#171717]" aria-labelledby="address-heading">
                <h2 id="address-heading" className="m-0 flex items-center gap-2 text-base font-black uppercase tracking-tight pb-3 border-b-2 border-[#171717]">
                  <MapPin size={16} className="text-[#E6321C]" />
                  DELIVERING TO
                </h2>
                <div className="mt-3 text-xs leading-relaxed text-[#6F6A63]">
                  {address.name && <p className="m-0 text-sm font-black uppercase text-[#171717]">{address.name}</p>}
                  <p className="m-0 mt-1">
                    {[address.line1, address.line2].filter(Boolean).join(', ')}
                    <br />
                    {[address.city, address.state].filter(Boolean).join(', ')}
                    {address.postalCode ? ` ${address.postalCode}` : ''}
                  </p>
                  {address.phone && <p className="m-0 mt-1.5 font-mono text-xs font-bold text-[#171717]">{address.phone}</p>}
                </div>
              </m.section>
            )}

            {/* Help */}
            <m.section {...fadeUp(1.2)} className="border-2 border-[#171717] bg-[#171717] p-5 text-white sm:p-7 shadow-[4px_4px_0px_#E6321C] print:hidden">
              <h2 className="m-0 text-base font-black uppercase tracking-tight text-white pb-3 border-b border-white/20">
                NEED ASSISTANCE?
              </h2>
              <p className="m-0 mt-2 text-xs leading-relaxed text-white/70">
                Size swap, address fix or delivery query — connect with us directly on WhatsApp with your order number.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={getWhatsAppUrl(`Hi Bingooo, I have a question about my order ${order.order_number}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="btn-bauhaus inline-flex items-center gap-2 border-2 border-white bg-white px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-[#171717] shadow-[2px_2px_0px_#E6321C] hover:bg-[#F7EEDB] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all no-underline"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
                  <span>WHATSAPP CONCIERGE</span>
                </a>
                <Link
                  to="/account/orders"
                  className="btn-bauhaus inline-flex items-center gap-2 border-2 border-white/40 bg-transparent px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-white hover:border-white active:translate-x-[1px] active:translate-y-[1px] transition-all no-underline"
                >
                  <ShoppingBag size={13} />
                  <span>ALL ORDERS</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-bauhaus inline-flex items-center gap-2 border-2 border-white/40 bg-transparent px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-white hover:border-white active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>RECEIPT</span>
                </button>
              </div>
            </m.section>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#6F6A63]">{label}</dt>
      <dd className={`m-0 font-mono ${accent ? 'font-semibold text-[#E6321C]' : 'text-[#171717]'}`}>{value}</dd>
    </div>
  );
}

const CONFETTI = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2 + (i % 2 ? 0.18 : 0);
  const distance = 74 + (i % 4) * 22;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.8,
    color: ['#E6321C', '#171717', '#C9B79C', '#E6321C'][i % 4],
    round: i % 3 === 0,
    size: 5 + (i % 3) * 2,
    rotate: (i * 67) % 360,
  };
});

function ConfirmedBadge({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative grid place-items-center">
      {!reduceMotion && (
        <>
          <m.span
            aria-hidden
            className="absolute h-24 w-24 rounded-full border-2 border-[#E6321C] print:hidden"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
          />
          {CONFETTI.map((piece, i) => (
            <m.span
              key={i}
              aria-hidden
              className={`absolute print:hidden ${piece.round ? 'rounded-full' : 'rounded-[1px]'}`}
              style={{ width: piece.size, height: piece.round ? piece.size : piece.size * 1.8, backgroundColor: piece.color }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
              animate={{ x: piece.x, y: piece.y, opacity: [0, 1, 1, 0], scale: 1, rotate: piece.rotate }}
              transition={{ duration: 1.3, delay: 0.3 + (i % 5) * 0.03, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </>
      )}
      <m.div
        className="relative grid h-24 w-24 place-items-center rounded-full bg-[#E6321C] text-white shadow-[0_18px_50px_-14px_rgba(230,50,28,0.75)]"
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 17 }}
      >
        <m.span
          className="grid place-items-center"
          initial={reduceMotion ? false : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.18 }}
        >
          <Check size={44} strokeWidth={3} />
        </m.span>
      </m.div>
    </div>
  );
}

function PendingBadge() {
  return (
    <div className="grid h-24 w-24 place-items-center rounded-full border border-[#DDD3C5] bg-white text-[#171717]">
      <Clock size={38} strokeWidth={2.2} />
    </div>
  );
}

const STEPS = [
  { key: 'confirmed', title: 'Order confirmed', body: 'Payment received. Your order is in our queue.', Icon: Check },
  { key: 'packed', title: 'Packed with care', body: 'Every piece is checked and packed by hand.', Icon: Package },
  { key: 'shipped', title: 'On its way', body: 'You’ll get your tracking number the moment it ships.', Icon: Truck },
  { key: 'delivered', title: 'Delivered', body: 'Free delivery to your door, anywhere in India.', Icon: Home },
];

function progressIndex(status: string, paid: boolean): number {
  const s = status.toLowerCase();
  if (s === 'delivered') return 3;
  if (s === 'shipped' || s === 'out_for_delivery' || s === 'in_transit') return 2;
  if (s === 'packed' || s === 'ready_to_ship') return 1;
  return paid ? 0 : -1;
}

function ProgressTimeline({ status, paid, placedTime }: { status: string; paid: boolean; placedTime: string }) {
  const done = progressIndex(status, paid);
  return (
    <ol className="m-0 mt-5 list-none p-0">
      {STEPS.map((step, i) => {
        const isDone = i <= done;
        const isNext = i === done + 1;
        const Icon = isDone ? Check : step.Icon;
        return (
          <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 h-[calc(100%-32px)] w-[2px] rounded-full ${i < done ? 'bg-[#E6321C]' : 'bg-[#EDE0CC]'}`}
              />
            )}
            <span
              className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                isDone
                  ? 'bg-[#E6321C] text-white'
                  : isNext
                    ? 'border-2 border-[#171717] bg-white text-[#171717]'
                    : 'border border-[#DDD3C5] bg-[#F7EEDB] text-[#6F6A63]'
              }`}
            >
              <Icon size={15} strokeWidth={isDone ? 3 : 2} />
            </span>
            <div className="min-w-0 pt-1">
              <p className={`m-0 flex flex-wrap items-center gap-2 text-[14px] font-bold ${isDone || isNext ? 'text-[#171717]' : 'text-[#6F6A63]'}`}>
                {step.title}
                {i === 0 && isDone && <span className="font-mono text-[10px] font-normal text-[#6F6A63]">{placedTime}</span>}
                {isNext && (
                  <span className="rounded-full bg-[#171717] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Up next</span>
                )}
              </p>
              <p className="m-0 mt-0.5 text-[12.5px] leading-relaxed text-[#6F6A63]">{step.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderUnavailable({ paymentFailed, orderNumber }: { paymentFailed: boolean; orderNumber?: string }) {
  const helpMessage = paymentFailed
    ? 'Hi Bingooo, my payment did not go through. Can you help me complete my order?'
    : `Hi Bingooo, I need help finding my order${orderNumber ? ` #${orderNumber}` : ''}.`;

  return (
    <div className="min-h-[70vh] bg-[#F7EEDB] px-4 py-16 sm:py-24 font-sans text-[#171717]">
      <SEO title={paymentFailed ? 'Payment Not Completed' : 'Order Details'} noindex />
      <div className="mx-auto max-w-[520px] border-2 border-[#171717] bg-white p-7 sm:p-9 text-center shadow-[4px_4px_0px_#171717]">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center border-2 border-[#171717] bg-[#EDE0CC] shadow-[2px_2px_0px_#171717]">
          {paymentFailed ? <AlertCircle size={22} className="text-[#E6321C]" /> : <PackageCheck size={22} />}
        </div>
        <h1 className="m-0 text-xl sm:text-2xl font-black uppercase tracking-tight">
          {paymentFailed ? 'PAYMENT NOT COMPLETED' : 'ORDER DETAILS PENDING'}
        </h1>
        <p className="mx-auto mt-3 mb-0 max-w-[400px] text-xs leading-relaxed text-[#6F6A63]">
          {paymentFailed
            ? 'Your transaction did not complete, so no charges were placed. Your bag remains preserved so you can easily retry.'
            : `${orderNumber ? `Order #${orderNumber} is registered. ` : ''}Sign in to review full status and dispatch telemetry under My Orders.`}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <Link
            to={paymentFailed ? '/cart' : '/account/orders'}
            className="btn-bauhaus inline-flex items-center justify-center gap-2 border-2 border-[#171717] bg-[#E6321C] px-5 py-3 font-mono text-[11px] font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_#171717] hover:bg-[#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all no-underline"
          >
            {paymentFailed ? 'RETURN TO BAG' : 'VIEW MY ORDERS'}
            <ArrowRight size={14} />
          </Link>
          <a
            href={getWhatsAppUrl(helpMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-bauhaus inline-flex items-center justify-center gap-2 border-2 border-[#171717] bg-white px-5 py-3 font-mono text-[11px] font-black uppercase tracking-wider text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all no-underline"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>GET HELP</span>
          </a>
        </div>
      </div>
    </div>
  );
}
