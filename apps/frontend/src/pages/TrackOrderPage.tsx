import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getWhatsAppUrl } from '../components/ui/SocialIcons';

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

const DEMO_TRACKING_DATA: Record<string, TrackingResult> = {
  'BG-2026-9182': {
    orderNumber: 'BG-2026-9182',
    orderDate: 'Sep 06, 2026',
    estimatedDelivery: 'Sep 10, 2026 by 7:00 PM',
    status: 'dispatched',
    statusLabel: 'In Transit — On Schedule',
    courier: 'Blue Dart Air Express',
    awbNumber: 'BLUEDART-883920194',
    destination: 'Visakhapatnam, Andhra Pradesh',
    items: [
      {
        title: 'Classic Heavyweight Oversized Tee',
        size: 'L',
        color: 'Charcoal Black',
        qty: 1,
        price: 699,
        image: '/hero-banner.png',
      },
      {
        title: 'Custom Atelier Graphic Tee',
        size: 'L',
        color: 'Vintage Cream',
        qty: 1,
        price: 899,
        image: '/custom/tshirt-step-1.png',
      },
    ],
    timeline: [
      {
        stage: 'Order Placed & Confirmed',
        desc: 'Payment verified via Razorpay. Order queued at Srikakulam Atelier.',
        date: 'Sep 06, 2026',
        time: '11:24 AM',
        completed: true,
      },
      {
        stage: 'Crafted & Quality Checked',
        desc: 'Custom DTF curing completed. 100% fabric wash-fastness inspected.',
        date: 'Sep 07, 2026',
        time: '03:40 PM',
        completed: true,
      },
      {
        stage: 'Handed to Blue Dart Courier',
        desc: 'Dispatched from Srikakulam Central Hub. Air manifest generated.',
        date: 'Sep 08, 2026',
        time: '06:15 PM',
        completed: true,
      },
      {
        stage: 'Out for Delivery',
        desc: 'Shipment arrived at destination facility. Assigned to courier executive.',
        date: 'Sep 10, 2026',
        time: 'Expected 09:00 AM',
        completed: false,
      },
      {
        stage: 'Delivered',
        desc: 'Package handed to recipient with signature confirmation.',
        date: 'Sep 10, 2026',
        time: 'By 07:00 PM',
        completed: false,
      },
    ],
  },
  'BG-2026-4431': {
    orderNumber: 'BG-2026-4431',
    orderDate: 'Sep 08, 2026',
    estimatedDelivery: 'Sep 12, 2026 by 5:00 PM',
    status: 'printing',
    statusLabel: 'Atelier Production — Curing DTF Print',
    courier: 'Delhivery Surface Express',
    awbNumber: 'DELHIVERY-774910248',
    destination: 'Hyderabad, Telangana',
    items: [
      {
        title: 'Cyber Tokyo Anime Graphic Hoodie',
        size: 'XL',
        color: 'Onyx Black',
        qty: 1,
        price: 1299,
        image: '/custom/tshirt-step-3-black.png',
      },
    ],
    timeline: [
      {
        stage: 'Order Placed & Confirmed',
        desc: 'Order verified and sent to garment cutting line.',
        date: 'Sep 08, 2026',
        time: '02:10 PM',
        completed: true,
      },
      {
        stage: 'DTF Printing & Curing',
        desc: 'Applying 1440 DPI Japanese pigment ink onto 360 GSM French terry.',
        date: 'Sep 09, 2026',
        time: '10:00 AM',
        completed: true,
      },
      {
        stage: 'Dispatched from Atelier',
        desc: 'Packaging in eco-friendly water-sealed box with Bingooo sticker pack.',
        date: 'Sep 09, 2026',
        time: 'Expected 06:00 PM',
        completed: false,
      },
      {
        stage: 'Out for Delivery',
        desc: 'Courier delivery agent will attempt door drop.',
        date: 'Sep 12, 2026',
        time: 'By 02:00 PM',
        completed: false,
      },
      {
        stage: 'Delivered',
        desc: 'Package successfully received.',
        date: 'Sep 12, 2026',
        time: 'By 05:00 PM',
        completed: false,
      },
    ],
  },
};

export function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState('BG-2026-9182');
  const [contactQuery, setContactQuery] = useState('');
  const [searched, setSearched] = useState(true);
  const [result, setResult] = useState<TrackingResult | null>(DEMO_TRACKING_DATA['BG-2026-9182']);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const query = (customId || orderQuery).trim().toUpperCase();
    if (!query) {
      setError('Please enter an Order ID or AWB Tracking Number.');
      return;
    }

    setError(null);
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      setSearched(true);
      if (DEMO_TRACKING_DATA[query]) {
        setResult(DEMO_TRACKING_DATA[query]);
      } else {
        // Generate dynamic mock for any valid-looking order ID
        const cleanId = query.startsWith('BG-') ? query : `BG-${query}`;
        setResult({
          orderNumber: cleanId,
          orderDate: 'Sep 07, 2026',
          estimatedDelivery: 'Within 3-4 Business Days',
          status: 'dispatched',
          statusLabel: 'Dispatched from Atelier — In Transit',
          courier: 'Blue Dart Air Express',
          awbNumber: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
          destination: 'Customer Delivery Address',
          items: [
            {
              title: 'Bingooo Atelier Heavyweight Apparel',
              size: 'Standard',
              color: 'Custom Blend',
              qty: 1,
              price: 899,
              image: '/hero-banner.png',
            },
          ],
          timeline: [
            {
              stage: 'Order Confirmed',
              desc: 'Payment received. Order acknowledged by Bingooo atelier.',
              date: 'Sep 07, 2026',
              time: '01:15 PM',
              completed: true,
            },
            {
              stage: 'Manufactured & Packed',
              desc: 'Custom print inspected and double-boxed for transit.',
              date: 'Sep 08, 2026',
              time: '04:45 PM',
              completed: true,
            },
            {
              stage: 'Courier Handover',
              desc: 'Package picked up by air courier hub.',
              date: 'Sep 09, 2026',
              time: '11:00 AM',
              completed: true,
            },
            {
              stage: 'Out for Delivery',
              desc: 'Arriving at local delivery branch.',
              date: 'Upcoming',
              time: 'Pending dispatch',
              completed: false,
            },
            {
              stage: 'Delivered',
              desc: 'Delivered to your doorstep.',
              date: 'Upcoming',
              time: 'Pending arrival',
              completed: false,
            },
          ],
        });
      }
    }, 400);
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Track Order Status"
        description="Track your Bingooo garment shipment in real-time. Enter your order number to view dispatch status, courier AWB tracking, and estimated delivery."
        canonical="https://bingooo.in/track-order"
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
                    placeholder="e.g. BG-2026-9182"
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
              <div className="flex items-center gap-2 text-xs text-[#6F6A63]">
                <span className="font-mono text-[11px]">Quick samples:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrderQuery('BG-2026-9182');
                    handleTrack(undefined, 'BG-2026-9182');
                  }}
                  className="font-mono text-[11px] font-bold text-[#E6321C] underline hover:text-[#B91F12]"
                >
                  BG-2026-9182
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrderQuery('BG-2026-4431');
                    handleTrack(undefined, 'BG-2026-4431');
                  }}
                  className="font-mono text-[11px] font-bold text-[#E6321C] underline hover:text-[#B91F12]"
                >
                  BG-2026-4431
                </button>
              </div>

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
                          <p className="mt-1 text-xs text-[#6F6A63] leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this Order */}
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
