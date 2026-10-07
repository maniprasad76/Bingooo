import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api/client';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';

interface TrackingResult {
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string;
  status: 'confirmed' | 'printing' | 'dispatched' | 'out_for_delivery' | 'delivered';
  statusLabel: string;
  courier: string;
  awbNumber: string;
  destination: string;
  items: Array<{ title: string; size: string; color: string; qty: number; price: number; image: string }>;
  timeline: Array<{ stage: string; desc: string; date: string; time: string; completed: boolean }>;
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const formatTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

function toStage(status: string): TrackingResult['status'] {
  if (status === 'delivered') return 'delivered';
  if (status === 'out_for_delivery') return 'out_for_delivery';
  if (status === 'shipped') return 'dispatched';
  if (status === 'processing' || status === 'packed') return 'printing';
  return 'confirmed';
}

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialAwb = searchParams.get('awb') || searchParams.get('orderNumber') || searchParams.get('q') || '';
  const [orderQuery, setOrderQuery] = useState(initialAwb);
  const [contactQuery, setContactQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlAwb = searchParams.get('awb') || searchParams.get('orderNumber') || searchParams.get('q');
    if (urlAwb) {
      setOrderQuery(urlAwb);
      handleTrack(undefined, urlAwb);
    }
  }, [searchParams]);

  // Shows only what the order actually records: real status, real timestamps,
  // real courier/AWB once assigned. Unknown numbers get a clear "not found".
  const handleTrack = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const query = (customId || orderQuery).trim().toUpperCase();
    if (!query) {
      setError('Please enter an Order ID or AWB Tracking Number.');
      return;
    }

    setError(null);
    setIsSearching(true);
    try {
      const live = await api.get<any>(`/shipping/track/${encodeURIComponent(query)}`);
      const delivered = live.status === 'delivered';
      setResult({
        orderNumber: live.orderNumber || query,
        orderDate: formatDate(live.placedAt),
        estimatedDelivery: delivered ? `Delivered on ${formatDate(live.updatedAt)}` : 'Usually 3–7 business days after dispatch',
        status: toStage(live.status),
        statusLabel: live.statusLabel || live.status,
        courier: live.carrier || 'Assigned at dispatch',
        awbNumber: live.trackingNumber || 'Pending',
        destination: 'Your delivery address',
        items: [],
        timeline: (live.events || []).map((ev: any) => ({
          stage: ev.status,
          desc: '',
          date: formatDate(ev.timestamp),
          time: formatTime(ev.timestamp),
          completed: true,
        })),
      });
    } catch (err: any) {
      setResult(null);
      setError(
        err?.status === 404
          ? "We couldn't find an order with that number. Please check it and try again, or message us on WhatsApp."
          : 'Tracking is temporarily unavailable. Please try again in a moment.',
      );
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Track Order Status"
        description="Track your Bingooo garment shipment in real-time. Enter your order number to view dispatch status, courier AWB tracking, and estimated delivery."
        canonical="https://www.bingooo.co.in/track-order"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 space-y-10">
        {/* ─── Breadcrumb & Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-8">
          <Breadcrumbs
            items={[
              { name: 'Customer Care', url: '/contact' },
              { name: 'Track Order', url: '/track-order' },
            ]}
          />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading uppercase">
                TRACK YOUR SHIPMENT
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#6F6A63] max-w-xl">
                Real-time tracking for custom streetwear and readymade apparel dispatched directly from our Srikakulam Atelier.
              </p>
            </div>
            <a
              href={getWhatsAppUrl(`Hi Bingooo, I would like an update on my order: ${orderQuery}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] text-xs font-bold text-[#171717] transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Phone size={14} className="text-[#E6321C]" />
              <span>Need Help? WhatsApp Dispatch</span>
            </a>
          </div>
        </div>

        {/* ─── Tracking Search Box ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-5">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-7 relative">
                <label htmlFor="track-order-number" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] mb-1.5">
                  Order Number or Courier AWB #
                </label>
                <div className="relative">
                  <Package size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6A63]" />
                  <input
                    id="track-order-number"
                    type="text"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    placeholder="e.g. BGO-20261005-1234"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-sm font-bold text-[#171717] placeholder:text-[#6F6A63]/50 focus:outline-none focus:border-[#E6321C] focus:bg-white transition-all uppercase tracking-wide font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-5 relative">
                <label htmlFor="track-phone-email" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] mb-1.5">
                  Mobile Number / Email (Optional)
                </label>
                <input
                  id="track-phone-email"
                  type="text"
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  placeholder="+91 or email@domain.com"
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-sm text-[#171717] placeholder:text-[#6F6A63]/50 focus:outline-none focus:border-[#E6321C] focus:bg-white transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#E6321C]">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="m-0 text-[11px] text-[#6F6A63]">
                Your order number is in your confirmation email and under{' '}
                <Link to="/account/orders" className="font-bold text-[#171717] underline hover:text-[#E6321C]">
                  My Orders
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
              >
                {isSearching ? <Clock size={15} className="animate-spin" /> : <Search size={15} />}
                <span>{isSearching ? 'Fetching Tracking Data...' : 'Track My Order'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ─── Tracking Result Card ─── */}
        <AnimatePresence mode="wait">
          {searched && result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-8"
            >
              {/* Order Status Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#171717] text-white space-y-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#E6321C] text-[10px] font-black uppercase tracking-widest font-mono">
                        {result.statusLabel}
                      </span>
                      <span className="text-xs text-[#DDD3C5]/60 font-mono">
                        Placed on {result.orderDate}
                      </span>
                    </div>
                    <h2 className="mt-2 text-xl sm:text-2xl font-black uppercase font-heading tracking-tight">
                      Order #{result.orderNumber}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#DDD3C5]/60 block">
                      Estimated Delivery
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white font-sans mt-0.5 block">
                      {result.estimatedDelivery}
                    </span>
                  </div>
                </div>

                {/* Logistics Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#DDD3C5]/60">Courier Partner</span>
                    <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Truck size={14} className="text-[#E6321C]" />
                      <span>{result.courier}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#DDD3C5]/60">Airway Bill (AWB)</span>
                    <p className="text-xs sm:text-sm font-mono font-bold text-white">{result.awbNumber}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#DDD3C5]/60">Delivery Destination</span>
                    <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#E6321C]" />
                      <span className="truncate">{result.destination}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-heading text-[#171717]">
                  Shipment Activity Timeline
                </h3>

                <div className="space-y-6 pl-2 sm:pl-4">
                  {result.timeline.map((step, idx) => {
                    const isLast = idx === result.timeline.length - 1;
                    return (
                      <div key={step.stage} className="relative flex items-start gap-4">
                        {/* Line connecting milestones */}
                        {!isLast && (
                          <span
                            className={`absolute left-3.5 top-7 w-[2px] h-[calc(100%+8px)] ${
                              step.completed ? 'bg-[#E6321C]' : 'bg-[#DDD3C5]'
                            }`}
                          />
                        )}

                        {/* Status Icon Marker */}
                        <div
                          className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                            step.completed
                              ? 'bg-[#E6321C] text-white'
                              : 'bg-[#EDE0CC] text-[#6F6A63] border border-[#DDD3C5]'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <Clock size={14} />
                          )}
                        </div>

                        {/* Milestone Description */}
                        <div className="flex-1 min-w-0 pb-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4
                              className={`text-xs sm:text-sm font-bold uppercase tracking-wide font-heading ${
                                step.completed ? 'text-[#171717]' : 'text-[#6F6A63]'
                              }`}
                            >
                              {step.stage}
                            </h4>
                            <span className="text-[10px] font-mono text-[#6F6A63] shrink-0">
                              {step.date} • {step.time}
                            </span>
                          </div>
                          {step.desc && (
                            <p className="mt-1 text-xs text-[#6F6A63] leading-relaxed">
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this Order (public tracking returns none, so this only shows when provided) */}
              {result.items.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider font-heading text-[#171717]">
                  Garments in Package ({result.items.length})
                </h3>

                <div className="divide-y divide-[#DDD3C5]/60">
                  {result.items.map((item, i) => (
                    <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 rounded-lg object-cover bg-[#EDE0CC] border border-[#DDD3C5]"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#171717] leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#6F6A63] mt-0.5">
                            Size: <span className="font-semibold text-[#171717]">{item.size}</span> • Color:{' '}
                            <span className="font-semibold text-[#171717]">{item.color}</span> • Qty:{' '}
                            <span className="font-semibold text-[#171717]">{item.qty}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold font-mono text-[#171717]">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Frequently Asked Logistics Questions ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F7EEDB] border border-[#DDD3C5] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#E6321C]" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-heading text-[#171717]">
              Need Help With Your Delivery?
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#6F6A63]">
            <div>
              <strong className="text-[#171717] block mb-1">Standard Dispatch Window:</strong>
              Readymade apparel is dispatched within 24–48 hours. Custom printed apparel undergoes 24h curing before packaging.
            </div>
            <div>
              <strong className="text-[#171717] block mb-1">Live Courier Updates:</strong>
              Tracking numbers are activated within 6 hours of pickup by Blue Dart, Delhivery, or DTDC.
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href={getWhatsAppUrl(`Hi Bingooo Logistics, I need live tracking updates on my order${orderQuery ? ` (${orderQuery})` : ''}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>Track via WhatsApp Concierge</span>
            </a>
            <Link
              to="/shipping-policy"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E6321C] hover:underline"
            >
              <span>View Full Shipping Policy</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171717] hover:text-[#E6321C]"
            >
              <span>Contact Atelier Dispatch Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
