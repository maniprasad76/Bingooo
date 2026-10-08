import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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

          <motion.p
            {...fadeUp(0.35)}
            className="mt-7 mb-0 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E6321C]"
          >
            {isPaid ? 'Order confirmed' : 'Awaiting payment'}
          </motion.p>

          <motion.h1
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
          </motion.h1>

          <motion.p
            {...fadeUp(0.55)}
            className="mx-auto mb-0 mt-5 max-w-[540px] text-[15px] leading-relaxed text-[#6F6A63] sm:text-base"
          >
            {isPaid
              ? 'Your payment was received and your order is confirmed. We’re getting your pieces ready.'
              : 'We haven’t received the payment for this order yet. If money has left your account, it will be confirmed here automatically within a few minutes.'}
          </motion.p>

          <motion.div {...fadeUp(0.65)} className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="group inline-flex items-center gap-2.5 rounded-full border border-[#DDD3C5] bg-white px-4 py-2 shadow-[0_1px_2px_rgba(23,23,23,0.04)] transition-colors hover:border-[#171717]"
              aria-label={`Copy order number ${order.order_number}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63]">Order</span>
              <span className="font-mono text-sm font-semibold tracking-wide text-[#171717]">{order.order_number}</span>
              {copied ? (
                <Check size={14} className="text-[#E6321C]" />
              ) : (
                <Copy size={14} className="text-[#6F6A63] transition-colors group-hover:text-[#171717]" />
              )}
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE0CC] px-3.5 py-2 font-mono text-[11px] text-[#6F6A63]">
              <Clock size={12} />
              {placedDate} · {placedTime}
            </span>
          </motion.div>

          {isPaid && maskedPhone && (whatsappStatus === 'sent' || whatsappStatus === 'sending') && (
            <motion.div
              {...fadeUp(0.75)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#DDD3C5] bg-white/70 px-3.5 py-1.5 text-[12px] text-[#171717] backdrop-blur-sm"
              aria-live="polite"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              {whatsappStatus === 'sent' ? (
                <span>
                  Confirmation sent to your WhatsApp <span className="font-mono text-[#6F6A63]">{maskedPhone}</span>
                </span>
              ) : (
                <span className="text-[#6F6A63]">Sending your confirmation on WhatsApp…</span>
              )}
            </motion.div>
          )}

          <motion.div {...fadeUp(0.8)} className="mt-8 flex w-full flex-col items-stretch justify-center gap-2.5 sm:w-auto sm:flex-row print:hidden">
            <Link
              to={trackHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6321C] px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white no-underline shadow-[0_10px_30px_-12px_rgba(230,50,28,0.7)] transition-colors hover:bg-[#C42814]"
            >
              <Truck size={15} />
              Track order
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#171717] px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#171717] no-underline transition-colors hover:bg-[#171717] hover:text-white"
            >
              Continue shopping
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </section>

        {/* ── Details ──────────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-1 items-start gap-5 sm:mt-16 lg:grid-cols-12 lg:gap-6">
          {/* Receipt */}
          <motion.section
            {...fadeUp(0.9)}
            className="relative rounded-3xl border border-[#DDD3C5] bg-white lg:col-span-7"
            aria-labelledby="order-summary-heading"
          >
            <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
              <h2 id="order-summary-heading" className="m-0 text-base font-extrabold tracking-tight sm:text-lg">
                Your order
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#6F6A63]">
                {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            <ul className="m-0 list-none divide-y divide-[#EDE0CC] px-5 sm:px-7">
              {items.map((item) => {
                const title = item.product_title || item.title_snapshot || 'Item';
                const variant = item.variant_snapshot_json || {};
                const meta = [variant.size && `Size ${variant.size}`, variant.color].filter(Boolean).join(' · ');
                const lineTotal = item.total ?? Number(item.unit_price || 0) * Number(item.quantity || 1);
                return (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="h-[84px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-[#EDE0CC] bg-[#F7EEDB]">
                      {item.image_url ? (
                        <img src={item.image_url} alt={title} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <ProductPlaceholder name={title} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-[14px] font-bold leading-snug sm:text-[15px]">{title}</p>
                      {meta && <p className="m-0 mt-0.5 text-[12px] text-[#6F6A63]">{meta}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[11px] text-[#6F6A63]">Qty {item.quantity || 1}</span>
                        {item.customization && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E6321C]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E6321C]">
                            <Sparkles size={10} />
                            Custom design
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[14px] font-semibold">{formatINR(lineTotal)}</span>
                  </li>
                );
              })}
            </ul>

            {/* Ticket-style perforation */}
            <div className="relative my-1 h-6" aria-hidden>
              <span className="absolute -left-3 top-0 h-6 w-6 rounded-full border border-[#DDD3C5] bg-[#F7EEDB] [clip-path:inset(0_0_0_50%)]" />
              <span className="absolute -right-3 top-0 h-6 w-6 rounded-full border border-[#DDD3C5] bg-[#F7EEDB] [clip-path:inset(0_50%_0_0)]" />
              <span className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-[#EDE0CC]" />
            </div>

            <dl className="m-0 space-y-2.5 px-5 pb-6 pt-2 text-[13px] sm:px-7">
              <SummaryRow label="Subtotal" value={formatINR(order.subtotal ?? order.total)} />
              {discount > 0 && <SummaryRow label="Discount" value={`−${formatINR(discount)}`} accent />}
              <SummaryRow label="Delivery" value="Free" accent />
              <SummaryRow label="Taxes" value="Included" />
              <div className="flex items-end justify-between border-t border-[#EDE0CC] pt-4">
                <dt className="text-[13px] font-bold">
                  {isPaid ? 'Total paid' : 'Total'}
                  <span className="mt-0.5 block text-[11px] font-normal text-[#6F6A63]">
                    {isPaid ? 'Paid online · Razorpay' : 'Payment pending'}
                  </span>
                </dt>
                <dd className="m-0 font-mono text-[26px] font-semibold tracking-tight text-[#171717] sm:text-[30px]">
                  {formatINR(order.total)}
                </dd>
              </div>
            </dl>
          </motion.section>

          <div className="space-y-5 lg:col-span-5">
            {/* What happens next */}
            <motion.section {...fadeUp(1)} className="rounded-3xl border border-[#DDD3C5] bg-white p-5 sm:p-7" aria-labelledby="next-heading">
              <h2 id="next-heading" className="m-0 text-base font-extrabold tracking-tight sm:text-lg">
                What happens next
              </h2>
              <ProgressTimeline status={String(order.status || '')} paid={isPaid} placedTime={placedTime} />
            </motion.section>

            {/* Delivery address */}
            {(address.line1 || address.city) && (
              <motion.section {...fadeUp(1.1)} className="rounded-3xl border border-[#DDD3C5] bg-white p-5 sm:p-7" aria-labelledby="address-heading">
                <h2 id="address-heading" className="m-0 flex items-center gap-2 text-base font-extrabold tracking-tight sm:text-lg">
                  <MapPin size={17} className="text-[#E6321C]" />
                  Delivering to
                </h2>
                <div className="mt-3 text-[13px] leading-relaxed text-[#6F6A63]">
                  {address.name && <p className="m-0 text-[14px] font-bold text-[#171717]">{address.name}</p>}
                  <p className="m-0">
                    {[address.line1, address.line2].filter(Boolean).join(', ')}
                    <br />
                    {[address.city, address.state].filter(Boolean).join(', ')}
                    {address.postalCode ? ` ${address.postalCode}` : ''}
                  </p>
                  {address.phone && <p className="m-0 mt-1 font-mono text-[12px]">{address.phone}</p>}
                </div>
              </motion.section>
            )}

            {/* Help */}
            <motion.section {...fadeUp(1.2)} className="rounded-3xl bg-[#171717] p-5 text-white sm:p-7 print:hidden">
              <h2 className="m-0 text-base font-extrabold tracking-tight text-white sm:text-lg">Need to change something?</h2>
              <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-white/65">
                Size swap, address fix or a question — message us on WhatsApp with your order number and we’ll sort it out.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={getWhatsAppUrl(`Hi Bingooo, I have a question about my order ${order.order_number}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[#171717] no-underline transition-colors hover:bg-[#EDE0CC]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Chat with us
                </a>
                <Link
                  to="/account/orders"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white no-underline transition-colors hover:bg-white/10"
                >
                  <ShoppingBag size={14} />
                  My orders
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                >
                  <Printer size={14} />
                  Receipt
                </button>
              </div>
            </motion.section>
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
          <motion.span
            aria-hidden
            className="absolute h-24 w-24 rounded-full border-2 border-[#E6321C] print:hidden"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
          />
          {CONFETTI.map((piece, i) => (
            <motion.span
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
      <motion.div
        className="relative grid h-24 w-24 place-items-center rounded-full bg-[#E6321C] text-white shadow-[0_18px_50px_-14px_rgba(230,50,28,0.75)]"
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 17 }}
      >
        <motion.span
          className="grid place-items-center"
          initial={reduceMotion ? false : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.18 }}
        >
          <Check size={44} strokeWidth={3} />
        </motion.span>
      </motion.div>
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
      <div className="mx-auto max-w-[520px] rounded-2xl border border-[#DDD3C5] bg-white p-7 sm:p-9 text-center shadow-xs">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full border border-[#DDD3C5] bg-[#EDE0CC]">
          {paymentFailed ? <AlertCircle size={22} className="text-[#E6321C]" /> : <PackageCheck size={22} />}
        </div>
        <h1 className="m-0 text-xl sm:text-2xl font-extrabold uppercase tracking-tight">
          {paymentFailed ? 'Payment not completed' : 'We couldn’t load your order'}
        </h1>
        <p className="mx-auto mt-3 mb-0 max-w-[400px] text-[13px] leading-relaxed text-[#6F6A63]">
          {paymentFailed
            ? 'Your payment didn’t go through, so no order was placed and you haven’t been charged. Your bag is still saved — you can try again.'
            : `${orderNumber ? `Order #${orderNumber} is safe. ` : ''}Sign in to see your full order details and status under My Orders.`}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-stretch justify-center gap-2.5">
          <Link
            to={paymentFailed ? '/cart' : '/account/orders'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6321C] px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-white no-underline hover:bg-[#B91F12] transition-colors"
          >
            {paymentFailed ? 'Return to bag' : 'View my orders'}
            <ArrowRight size={14} />
          </Link>
          <a
            href={getWhatsAppUrl(helpMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#171717] px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-[#171717] no-underline hover:bg-[#171717] hover:text-white transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Get help
          </a>
        </div>
      </div>
    </div>
  );
}
