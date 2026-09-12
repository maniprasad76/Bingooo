import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';
import {
  Truck,
  Clock,
  ShieldCheck,
  PackageCheck,
  MapPin,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Mail,
  PhoneCall,
  ExternalLink,
  Sparkles,
  Search,
} from 'lucide-react';

const SHIPPING_TIERS = [
  {
    region: 'Andhra Pradesh & Telangana',
    coverage: 'Visakhapatnam, Vijayawada, Srikakulam, Guntur, Hyderabad, Tirupati, Warangal',
    dispatch: 'Within 24 Hours',
    transit: '1 to 3 Business Days',
    badge: 'PRIORITY CORRIDOR',
  },
  {
    region: 'Tier 1 Metro Cities',
    coverage: 'Bengaluru, Chennai, Mumbai, Delhi NCR, Kolkata, Pune, Ahmedabad',
    dispatch: 'Within 24 Hours',
    transit: '2 to 4 Business Days',
    badge: 'EXPRESS AIR',
  },
  {
    region: 'Rest of India',
    coverage: 'All state capitals, tier-2 cities, and 19,000+ postal pin codes',
    dispatch: 'Within 24 to 48 Hours',
    transit: '4 to 6 Business Days',
    badge: 'PAN-INDIA SURFACE/AIR',
  },
];

const LOGISTICS_STEPS = [
  {
    step: '01',
    label: 'ATELIER',
    title: 'Cut, Print & QC Inspection',
    desc: 'Heavyweight cotton fabric is calibrated, DTF heat-cured, and passed through a 4-point seam and collar inspection.',
    highlight: 'Tamper-evident vacuum poly packaging',
  },
  {
    step: '02',
    label: 'DISPATCH',
    title: 'AWB Handover & Tracking',
    desc: 'Parcel is scanned by Blue Dart, Delhivery, or DTDC. Live Airway Bill tracking links are sent via WhatsApp and SMS.',
    highlight: 'Real-time transit milestone alerts',
  },
  {
    step: '03',
    label: 'DOORSTEP',
    title: 'Express Doorstep Arrival',
    desc: 'Verified courier executive delivers directly to your door with contactless OTP or Cash on Delivery options.',
    highlight: 'Up to 3 delivery attempts guaranteed',
  },
];

const FAQS = [
  {
    question: 'How much does shipping cost across India?',
    answer:
      'All domestic orders with a cart value of ₹999 or more receive 100% complimentary express shipping. For orders below ₹999, a nominal flat freight charge of ₹79 is applied at checkout to cover express air logistics.',
  },
  {
    question: 'How do I track my active shipment in real time?',
    answer:
      'The moment your parcel is scanned out of our Srikakulam logistics facility, an automated WhatsApp message and SMS are dispatched containing your unique Airway Bill (AWB) number and direct tracking URL. You can also track your parcel anytime at bingooo.in/track-order using your Order ID or phone number.',
  },
  {
    question: 'Do custom on-demand DTF garments take longer to dispatch?',
    answer:
      'Yes. Off-the-rack catalog pieces dispatch within 24 hours. Because bespoke custom garments require rasterization, multi-pass film printing, thermal curing, and strict wash-fastness testing, custom pieces dispatch within 24 to 48 business hours.',
  },
  {
    question: 'Is Cash on Delivery (COD) available in my area?',
    answer:
      'Cash on Delivery is supported across 19,000+ Indian postal codes. Please keep the exact invoice amount ready in cash or UPI at the time of delivery. A standard nominal COD processing fee of ₹49 applies for courier cash-handling.',
  },
  {
    question: 'What should I do if the courier parcel arrives damaged or opened?',
    answer:
      'All Bingooo garments leave our facility in heavy tamper-evident sealed flyers. If the outer flyer is torn, re-taped, or clearly opened, please refuse delivery from the courier executive and message our WhatsApp desk (+91 93902 44747) or email support@bingooo.in immediately. We dispatch a priority replacement right away.',
  },
  {
    question: 'What happens if I miss the courier delivery attempt?',
    answer:
      'Our logistics partners (Blue Dart, Delhivery, DTDC) will attempt delivery up to 3 consecutive times. You will receive an SMS prior to each attempt. If you are unavailable, you can coordinate a rescheduled delivery slot directly via the courier tracking portal or our concierge desk.',
  },
];

export function ShippingPolicyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    status: 'idle' | 'serviceable' | 'invalid';
    message?: string;
    timeline?: string;
  }>({ status: 'idle' });

  const toggleFaq = (index: number) => {
    triggerHaptic('light');
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    const cleaned = pincodeInput.trim();

    if (!/^\d{6}$/.test(cleaned)) {
      setPincodeResult({
        status: 'invalid',
        message: 'Please enter a valid 6-digit Indian postal PIN code.',
      });
      return;
    }

    // Quick regional heuristic based on initial 2 digits
    const prefix = parseInt(cleaned.slice(0, 2), 10);
    if (prefix >= 50 && prefix <= 53) {
      // AP & Telangana
      setPincodeResult({
        status: 'serviceable',
        timeline: '1 to 3 Business Days (Express Priority Corridor)',
        message: 'Eligible for same-day/next-day dispatch from Srikakulam flagship atelier.',
      });
    } else if ([56, 60, 40, 11, 70, 41, 38].includes(prefix)) {
      // Tier 1 Metro
      setPincodeResult({
        status: 'serviceable',
        timeline: '2 to 4 Business Days (Express Air Cargo)',
        message: 'Direct air courier connectivity via Blue Dart / Delhivery.',
      });
    } else {
      // Rest of India
      setPincodeResult({
        status: 'serviceable',
        timeline: '3 to 5 Business Days (Pan-India Doorstep Logistics)',
        message: 'Full Cash on Delivery and prepaid coverage across all verified zones.',
      });
    }
  };

  return (
    <main className="bg-[#F7EEDB] text-[#171717] font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      <SEO
        title="Shipping & Delivery Policy — BINGOOO Atelier"
        description="Review Bingooo's pan-India delivery timelines, courier tracking details, dispatch schedules, and free shipping on orders above ₹999."
        canonical="https://bingooo.in/shipping-policy"
      />

      {/* =======================================================
           TOP BREADCRUMB & DISPATCH LIVE STATUS
      ======================================================= */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/60 px-4 sm:px-8 py-3 text-[11px]">
        <div className="container-bingooo flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/" className="hover:text-[#171717] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#6F6A63]">POLICIES</span>
            <span>/</span>
            <span className="text-[#171717] font-bold">SHIPPING & DELIVERY</span>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#171717] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
            <span>DAILY ATELIER DISPATCH ACTIVE • BLUEDART & DELHIVERY COURIERS</span>
          </div>
        </div>
      </div>

      {/* =======================================================
           HERO SECTION: EDITORIAL SPLIT
      ======================================================= */}
      <section className="min-h-[600px] lg:min-h-[660px] grid grid-cols-1 lg:grid-cols-[48%_52%] border-b border-[#DDD3C5]">
        {/* Left Editorial Copy */}
        <div className="flex flex-col justify-center py-12 px-6 sm:px-10 lg:py-[clamp(50px,7vw,100px)] lg:px-[clamp(30px,5vw,80px)] bg-[#F7EEDB]">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[#EDE0CC] border border-[#DDD3C5] text-[#E6321C] text-[10px] font-mono font-bold tracking-[0.2em] uppercase rounded-[2px] mb-4">
            <Sparkles className="w-3 h-3 text-[#E6321C]" />
            <span>ATELIER LOGISTICS • PAN-INDIA DISPATCH</span>
          </div>

          <h1 className="my-2 mb-6 text-[clamp(44px,6.2vw,92px)] font-extrabold leading-[0.86] tracking-[-0.07em] uppercase text-[#171717]">
            <span className="block">DOORSTEP DISPATCH.</span>
            <span className="block">VERIFIED COURIERS.</span>
            <span className="block text-[#E6321C]">ZERO FRICTION.</span>
          </h1>

          <p className="max-w-[480px] m-0 mb-8 text-[#6F6A63] text-[13px] leading-[1.8]">
            From our flagship Srikakulam atelier to doorsteps across 19,000+ Indian postal pin codes. Fast, tamper-proof courier transit powered by Blue Dart, Delhivery, and DTDC — with complimentary express air shipping on all orders above ₹999.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              to="/track-order"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black inline-flex items-center gap-2"
            >
              <span>TRACK ACTIVE SHIPMENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo Logistics, I would like to check the shipping status of my order.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="btn btn-outline inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>LOGISTICS WHATSAPP</span>
            </a>
          </div>

          {/* Quick SLA Badges */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#DDD3C5]">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">DISPATCH</span>
              <span className="text-[12px] font-bold text-[#6F6A63]">24–48 Hours</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">FREE SHIPPING</span>
              <span className="text-[12px] font-bold text-[#238636]">Orders ₹999+</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">COVERAGE</span>
              <span className="text-[12px] font-bold text-[#171717]">19,000+ Pincodes</span>
            </div>
          </div>
        </div>

        {/* Right Imagery Banner */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-full overflow-hidden bg-[#171717]">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo atelier parcel dispatch and express logistics"
            className="w-full h-full object-cover grayscale contrast-125 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/85 via-transparent to-black/20" />

          {/* Overlay Atelier Stamp */}
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#171717]/90 backdrop-blur-md border border-white/10 text-white rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                SRIKAKULAM HUB • DAILY FLIGHT DISPATCH
              </div>
              <div className="text-sm font-bold uppercase tracking-tight">
                Verified Sealed Courier Handover Guarantee
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#DDD3C5]/80 uppercase tracking-widest self-end sm:self-center">
              100% TRANSIT INSURED
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           KEY METRICS STRIP
      ======================================================= */}
      <section className="bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD3C5]">
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">ATELIER DISPATCH</span>
                <Clock className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  24–48H
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Precision QC & Courier Handover Window
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">FREE DELIVERY</span>
                <Truck className="w-4 h-4 text-[#238636]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#238636]">
                  ₹999+
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Complimentary Express Shipping on Orders
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">PINCODE NETWORK</span>
                <MapPin className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  19,000+
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Postal Pin Codes With Doorstep Reach
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">SECURITY SEAL</span>
                <ShieldCheck className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#E6321C]">
                  100%
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Tamper-Evident Sealed Packaging
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           INTERACTIVE PIN CODE SERVICEABILITY CHECKER
      ======================================================= */}
      <section className="py-14 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[850px] mx-auto">
          <div className="p-8 sm:p-10 bg-white border border-[#DDD3C5] rounded-[2px] shadow-xs text-left">
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
              LIVE SPEED ESTIMATOR
            </div>
            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-2">
              Estimate Delivery Time to Your City
            </h3>
            <p className="text-xs text-[#6F6A63] mb-6">
              Enter your 6-digit postal PIN code to check our verified transit schedules and express courier corridors.
            </p>

            <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code (e.g. 500001, 532001)"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-[2px] border border-[#DDD3C5] bg-[#F7EEDB]/40 font-mono text-sm text-[#171717] focus:outline-none focus:border-[#E6321C] tracking-wider"
                />
                <Search className="w-4 h-4 text-[#6F6A63] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="btn btn-black text-xs h-12 px-7 rounded-[2px] shrink-0"
              >
                CHECK TIMELINE
              </button>
            </form>

            {pincodeResult.status === 'serviceable' && (
              <div className="mt-4 p-4 rounded-[2px] bg-[#EDE0CC]/60 border border-[#DDD3C5] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#238636] shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-xs font-bold text-[#171717] uppercase">
                    ESTIMATED TRANSIT: {pincodeResult.timeline}
                  </div>
                  <div className="text-xs text-[#6F6A63] mt-0.5">
                    {pincodeResult.message}
                  </div>
                </div>
              </div>
            )}

            {pincodeResult.status === 'invalid' && (
              <div className="mt-4 p-4 rounded-[2px] bg-[#FDF0EE] border border-[#E6321C]/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#E6321C] shrink-0 mt-0.5" />
                <div className="text-xs text-[#E6321C] font-mono">
                  {pincodeResult.message}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =======================================================
           TRANSIT ESTIMATES ARCHITECTURAL TABLE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              REGIONAL SCHEDULES
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              DOMESTIC DELIVERY SCHEDULES
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-4">
              Timelines are calculated from the moment our express courier collects your parcel from the Srikakulam workshop.
            </p>
          </div>

          <div className="border border-[#DDD3C5] bg-white rounded-[2px] overflow-hidden shadow-xs">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DDD3C5] bg-[#EDE0CC]/50 text-[10px] uppercase font-mono font-bold text-[#171717]">
                    <th className="py-4 px-6">Delivery Region</th>
                    <th className="py-4 px-6">Major Hubs & Cities</th>
                    <th className="py-4 px-6">Atelier Handover</th>
                    <th className="py-4 px-6">Transit Duration</th>
                    <th className="py-4 px-6">Route Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD3C5]/60 font-sans">
                  {SHIPPING_TIERS.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-[#F7EEDB]/40 transition-colors">
                      <td className="py-5 px-6 font-extrabold text-[#171717] whitespace-nowrap uppercase">
                        {tier.region}
                      </td>
                      <td className="py-5 px-6 text-[#6F6A63] max-w-sm text-xs leading-relaxed">
                        {tier.coverage}
                      </td>
                      <td className="py-5 px-6 font-mono text-xs text-[#171717] whitespace-nowrap">
                        {tier.dispatch}
                      </td>
                      <td className="py-5 px-6 font-mono font-bold text-[#E6321C] text-xs whitespace-nowrap">
                        {tier.transit}
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-[#171717] text-white">
                          {tier.badge}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           THREE-STEP REVERSE LOGISTICS TIMELINE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
                FULFILLMENT WORKFLOW
              </div>
              <h2 className="m-0 text-[clamp(36px,5vw,64px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase text-[#171717]">
                FROM SRIKAKULAM<br />
                TO YOUR DOORSTEP.
              </h2>
            </div>
            <p className="max-w-[360px] m-0 text-[#6F6A63] text-[12px] leading-[1.8]">
              Every garment is heat-cured, folded, and sealed in tamper-evident packaging before handover to verified national air logistics partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#DDD3C5]">
            {LOGISTICS_STEPS.map((step) => (
              <article key={step.step} className="p-8 sm:p-10 bg-[#F7EEDB] flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[#E6321C] font-mono text-sm font-bold tracking-wider">
                      STEP {step.step}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#EDE0CC] border border-[#DDD3C5] text-[#171717]">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="mb-3 text-[22px] font-extrabold tracking-[-0.03em] uppercase text-[#171717]">
                    {step.title}
                  </h3>
                  <p className="text-[#6F6A63] text-[12px] leading-[1.8]">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#DDD3C5]/60 flex items-center gap-2 font-mono text-[10px] font-bold text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#238636] shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/track-order"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black inline-flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>TRACK LIVE PARCEL STATUS</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           INTERACTIVE FAQ ACCORDION
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              COMMON SHIPPING QUESTIONS
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-3">
              Clear answers regarding freight fees, cash on delivery, and air freight protocols.
            </p>
          </div>

          <div className="border-t border-[#DDD3C5] divide-y divide-[#DDD3C5]">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="transition-colors hover:bg-[#EDE0CC]/40">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-5 px-4 text-left flex items-center justify-between gap-4 font-extrabold uppercase tracking-tight text-sm sm:text-base text-[#171717] focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#E6321C]">0{idx + 1}.</span>
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#171717] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#E6321C]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-6 pt-1 text-[13px] leading-[1.8] text-[#6F6A63] border-l-2 border-[#E6321C] ml-4 mb-2 bg-[#EDE0CC]/50 p-4 rounded-[2px]">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-[#EDE0CC] border border-[#DDD3C5] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#E6321C] shrink-0" />
              <div>
                <div className="font-extrabold uppercase text-xs text-[#171717]">
                  Have a specific delivery inquiry?
                </div>
                <div className="text-[#6F6A63] text-[11px]">
                  Our logistics coordinators respond in under 15 minutes on WhatsApp.
                </div>
              </div>
            </div>
            <a
              href={getWhatsAppUrl('Hi Bingooo Logistics, I have a delivery inquiry for my location.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-black text-xs h-10 px-5"
            >
              CHAT ON WHATSAPP →
            </a>
          </div>
        </div>
      </section>

      {/* =======================================================
           SELF-SERVICE ACTION CENTER & CONCIERGE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Action 1: Self-Service Order Hub */}
            <div className="p-8 sm:p-10 bg-white border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#E6321C] tracking-[0.2em] mb-2">
                  SELF-SERVICE HUB
                </div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Live Courier Tracking
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Input your Order ID or Airway Bill (AWB) to view live location coordinates, dispatch milestones, and expected arrival date.
                </p>

                <div className="space-y-3 font-mono text-[11px] text-[#171717] mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Real-time GPS tracking via Blue Dart & Delhivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Automated delivery executive arrival notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Contactless OTP authorization on delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/track-order"
                  onClick={() => triggerHaptic('light')}
                  className="btn btn-black inline-flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>TRACK PARCEL NOW</span>
                </Link>
                <Link
                  to="/account/orders"
                  onClick={() => triggerHaptic('light')}
                  className="btn btn-outline inline-flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>MY ORDERS</span>
                </Link>
              </div>
            </div>

            {/* Action 2: Direct Logistics Concierge */}
            <div className="p-8 sm:p-10 bg-[#F7EEDB] border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#171717] tracking-[0.2em] mb-2">
                  ATELIER LOGISTICS
                </div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Logistics Coordination Desk
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Need to reschedule an arrival slot or update delivery coordinates? Speak directly with our dispatch supervisors.
                </p>

                <div className="space-y-4 text-[12px] mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">WhatsApp Dispatch Desk (Fastest)</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">+91 93902 44747 • Live Courier Interception</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">Logistics Hotline</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]"><a href="tel:+917981787317" className="underline">+91 79817 87317</a> • 9:00 AM – 9:00 PM IST</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">Official Logistics Inquiries</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">support@bingooo.in • 24-Hour Response</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href={getWhatsAppUrl('Hi Bingooo Logistics, I need urgent assistance with parcel delivery.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('medium')}
                  className="btn btn-black inline-flex items-center gap-2 w-full sm:w-auto"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>START WHATSAPP CHAT</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           STATUTORY COMPLIANCE & LEGAL NOTICE
      ======================================================= */}
      <section className="py-12 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[900px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3 text-[#6F6A63] text-[11px] font-mono uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>STATUTORY COMPLIANCE • CONSUMER PROTECTION ACT (INDIA)</span>
          </div>
          <p className="text-[#6F6A63] text-[11px] leading-[1.7] max-w-[760px] mx-auto">
            Governed under the Consumer Protection (E-Commerce) Rules, 2020. Bingooo Menswear Atelier ensures all consignments are dispatched with genuine Airway Bills, carrier insurance, and tamper-evident packaging. For freight escalations, reach our Grievance Officer at <a href="mailto:grievance@bingooo.in" className="underline font-bold text-[#171717]">grievance@bingooo.in</a>.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/returns-refunds" className="hover:text-[#171717] underline">RETURNS & EXCHANGES</Link>
            <span>•</span>
            <Link to="/cancellation-policy" className="hover:text-[#171717] underline">CANCELLATION POLICY</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#171717] underline">TERMS OF SERVICE</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#171717] underline">PRIVACY POLICY</Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           BOTTOM CALLOUT BANNER (Atelier Red)
      ======================================================= */}
      <section className="py-20 lg:py-24 px-5 bg-[#E6321C] text-white text-center">
        <div className="container-bingooo max-w-[800px] mx-auto">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3 font-mono">
            ALL-INDIA DOORSTEP COURIER NETWORK
          </div>

          <h2 className="my-2 mb-6 text-[clamp(38px,6vw,84px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase text-white">
            READY TO TRACK<br />
            YOUR SHIPMENT?
          </h2>

          <p className="max-w-[480px] mx-auto mb-8 text-white/90 text-[13px] leading-[1.8]">
            Enter your Order ID or mobile number on our live tracking engine to view real-time courier milestones.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/track-order"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-[#171717] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>TRACK YOUR ORDER →</span>
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo Logistics, I need an update on my delivery.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-white text-[#171717] text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#F7EEDB] hover:-translate-y-0.5 transition-all shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>WHATSAPP LOGISTICS</span>
              <ExternalLink className="w-3 h-3 text-[#6F6A63]" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ShippingPolicyPage;
