import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';
import {
  RefreshCw,
  Truck,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const RETURN_STEPS = [
  {
    step: '01',
    label: 'REQUEST',
    title: 'Lodge in 60 Seconds',
    desc: 'Navigate to Account > Orders and select "Exchange Size", or drop your Order ID to our WhatsApp concierge desk.',
    highlight: 'No paper forms or printing required',
  },
  {
    step: '02',
    label: 'PICKUP',
    title: 'Doorstep Courier Arrival',
    desc: 'Our logistics courier (Blue Dart / Delhivery / DTDC) arrives at your door within 24–48 hours to collect the packed piece.',
    highlight: 'Sealed tamper-proof bag provided at doorstep',
  },
  {
    step: '03',
    label: 'FULFILLMENT',
    title: 'Fresh Dispatch or 24H Refund',
    desc: 'Your replacement size dispatches immediately from our Srikakulam atelier, or your full refund is credited via UPI/source.',
    highlight: 'Zero restocking or hidden deductions',
  },
];

const FAQS = [
  {
    question: 'How do Cash on Delivery (COD) refunds work?',
    answer:
      'For COD orders, we do not require your bank account numbers or IFSC codes over chat. Once reverse pickup is verified, you receive a secure automated Razorpay UPI Payout link via SMS and WhatsApp. Simply input your UPI ID (Google Pay, PhonePe, Paytm, or BHIM) and the full funds transfer directly into your bank account within seconds.',
  },
  {
    question: 'How long does a size exchange take from pickup to delivery?',
    answer:
      'Once your reverse pickup is handed over to the courier executive, our system automatically initiates dispatch of your replacement size from our Srikakulam atelier. Most exchanges are completed door-to-door within 3 to 6 business days depending on your pincode.',
  },
  {
    question: 'Can I exchange for a completely different style or colorway?',
    answer:
      'Yes. If the size you need is out of stock, or if you prefer an alternate colorway or product of equal value, our atelier concierge desk can process a direct swap. Alternatively, we can issue an instant Bingooo Atelier store credit with lifetime validity.',
  },
  {
    question: 'What exact condition must the garment be in to pass inspection?',
    answer:
      'Garments must be unworn, unwashed, unaltered, and free from perfume, body spray, deodorant residue, or smoke stains. The original Bingooo brand tags, care labels, and poly packaging must be returned intact. Trying on the garment for fit is of course completely welcomed.',
  },
  {
    question: 'What is the refund timeline for Prepaid orders (Card / UPI / Net Banking)?',
    answer:
      'Prepaid refunds are initiated via Razorpay immediately upon return inspection. UPI payments typically reflect within 2 to 24 hours. Credit card, debit card, and net banking transactions reflect within 3 to 5 business days, subject to your issuing bank’s settlement cycle.',
  },
  {
    question: 'What if my package arrives damaged, flawed, or misprinted?',
    answer:
      'We stand behind every seam. If an item arrives damaged, defective, with flawed stitching, or with any print error, take 1 or 2 quick photos and message our concierge within 48 hours of delivery. We bypass regular inspection, ship an immediate fresh replacement via air priority, or issue a 100% instant refund with zero fees.',
  },
  {
    question: 'What if the courier misses the reverse pickup slot?',
    answer:
      'Courier executives make up to 2 attempts. If a pickup fails due to address access or unexpected courier delay, our logistics team automatically re-triggers a priority slot or routes an alternate partner within 24 hours. You can also nudge us on WhatsApp for an immediate manual dispatch push.',
  },
];

export function ReturnsRefundsPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    triggerHaptic('light');
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main className="bg-[#F7EEDB] text-[#171717] font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      <SEO
        title="Returns & Refunds Policy — BINGOOO Atelier"
        description="Learn about Bingooo's hassle-free 7-day doorstep size exchange policy, reverse courier pickups across 19,000+ Indian pincodes, and rapid 24h refund timelines."
        canonical="https://bingooo.in/returns-refunds"
      />

      {/* =======================================================
           TOP BREADCRUMB & LOGISTICS LIVE STATUS
      ======================================================= */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/60 px-4 sm:px-8 py-3 text-[11px]">
        <div className="container-bingooo flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/" className="hover:text-[#171717] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#6F6A63]">POLICIES</span>
            <span>/</span>
            <span className="text-[#171717] font-bold">RETURNS & EXCHANGES</span>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#171717] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
            <span>REVERSE LOGISTICS ACTIVE ACROSS 19,000+ PINCODES</span>
          </div>
        </div>
      </div>

      {/* =======================================================
           HERO SECTION: EDITORIAL SPLIT
      ======================================================= */}
      <section className="min-h-[620px] lg:min-h-[680px] grid grid-cols-1 lg:grid-cols-[48%_52%] border-b border-[#DDD3C5]">
        {/* Left Editorial Copy */}
        <div className="flex flex-col justify-center py-12 px-6 sm:px-10 lg:py-[clamp(50px,7vw,100px)] lg:px-[clamp(30px,5vw,80px)] bg-[#F7EEDB]">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[#EDE0CC] border border-[#DDD3C5] text-[#E6321C] text-[10px] font-mono font-bold tracking-[0.2em] uppercase rounded-[2px] mb-4">
            <Sparkles className="w-3 h-3 text-[#E6321C]" />
            <span>ATELIER PROMISE • 7-DAY DOORSTEP EXCHANGE</span>
          </div>

          <h1 className="my-2 mb-6 text-[clamp(44px,6.2vw,92px)] font-extrabold leading-[0.86] tracking-[-0.07em] uppercase text-[#171717]">
            <span className="block">PERFECT FIT.</span>
            <span className="block">DOORSTEP PICKUP.</span>
            <span className="block text-[#E6321C]">ZERO FRICTION.</span>
          </h1>

          <p className="max-w-[480px] m-0 mb-8 text-[#6F6A63] text-[13px] leading-[1.8]">
            Every Bingooo garment is cut with heavyweight structure and architectural precision. If the size or fit isn't right, our reverse logistics network picks up straight from your doorstep — no post office runs, no printing slips, and no friction.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              to="/account/orders"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black inline-flex items-center gap-2"
            >
              <span>INITIATE SIZE EXCHANGE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo, I would like to arrange an exchange or return for my order.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="btn btn-outline inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>WHATSAPP ATELIER</span>
            </a>
          </div>

          {/* Quick SLA Badges */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#DDD3C5]">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">WINDOW</span>
              <span className="text-[12px] font-bold text-[#6F6A63]">7 Calendar Days</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">PICKUP</span>
              <span className="text-[12px] font-bold text-[#6F6A63]">Doorstep Handover</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">REFUND</span>
              <span className="text-[12px] font-bold text-[#171717]">Direct UPI / Source</span>
            </div>
          </div>
        </div>

        {/* Right Imagery Banner */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-full overflow-hidden bg-[#171717]">
          <img
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo atelier garment craftsmanship and doorstep returns"
            className="w-full h-full object-cover grayscale contrast-125 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-transparent to-black/20" />
          
          {/* Overlay Atelier Stamp */}
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#171717]/90 backdrop-blur-md border border-white/10 text-white rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                SRIKAKULAM WORKSHOP • VERIFIED PROCESS
              </div>
              <div className="text-sm font-bold uppercase tracking-tight">
                100% Defect & Sizing Protection Guaranteed
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#DDD3C5]/80 uppercase tracking-widest self-end sm:self-center">
              ISO-STANDARD QUALITY
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           KEY METRICS / SLA STRIP
      ======================================================= */}
      <section className="bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD3C5]">
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">EXCHANGE PERIOD</span>
                <Clock className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(36px,4vw,56px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  7 DAYS
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Complimentary Doorstep Size Exchange
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">REVERSE COURIER</span>
                <Truck className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <div className="text-[clamp(36px,4vw,56px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  24–48H
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Doorstep Courier Pickup Window
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">GARMENT DEFECTS</span>
                <ShieldCheck className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(36px,4vw,56px)] font-extrabold tracking-[-0.06em] leading-none text-[#E6321C]">
                  100%
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Flawless Garment & Print Guarantee
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">REFUND DISPATCH</span>
                <CreditCard className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <div className="text-[clamp(36px,4vw,56px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  24H
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  UPI / Source Account Payout Post-Scan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           THREE-STEP REVERSE LOGISTICS TIMELINE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#EDE0CC] border-b border-[#DDD3C5]" id="exchange-process">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
                THE LOGISTICS WORKFLOW
              </div>
              <h2 className="m-0 text-[clamp(36px,5vw,64px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase text-[#171717]">
                THREE STEPS.<br />
                ZERO PAPERWORK.
              </h2>
            </div>
            <p className="max-w-[360px] m-0 text-[#6F6A63] text-[12px] leading-[1.8]">
              We coordinate end-to-end courier transit directly from your residence or office. No post office visits, no label printing, and no hidden freight charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#DDD3C5]">
            {RETURN_STEPS.map((step) => (
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
              to="/account/orders"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black inline-flex items-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>START YOUR EXCHANGE REQUEST NOW</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           CATEGORY BREAKDOWN: STANDARD VS ON-DEMAND CUSTOM
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              PRODUCT COVERAGE CRITERIA
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              WHAT IS ELIGIBLE FOR RETURN?
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-4">
              To maintain the highest standards of hygiene and artisanal precision, here is our straightforward breakdown between off-the-rack and bespoke pieces.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card 1: Standard Atelier Garments */}
            <div className="p-8 sm:p-10 bg-white border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F7EEDB] border border-[#DDD3C5] font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-6">
                  <RefreshCw className="w-3.5 h-3.5 text-[#171717]" />
                  <span>OFF-THE-RACK COLLECTION</span>
                </div>

                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Standard Heavyweight Menswear
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Includes all standard catalog pieces: Heavyweight Crewneck Tees, Oversized Hoodies, Vintage Acid Washed Garments, Boxy Polos, and Sweatpants.
                </p>

                <ul className="space-y-3 font-mono text-[11px] text-[#171717]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>7-Day Window:</strong> Initiate within 7 days of confirmed delivery.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Doorstep Pickup:</strong> Free reverse pickup across 19,000+ Indian pincodes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Flexible Modes:</strong> Exchange size, swap for another piece, or receive 100% refund.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Condition:</strong> Unworn, unwashed, with original atelier tags and polybag intact.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#DDD3C5]">
                <Link
                  to="/account/orders"
                  className="text-link text-[11px] text-[#171717] hover:text-[#E6321C]"
                >
                  VIEW YOUR ELIGIBLE ORDERS →
                </Link>
              </div>
            </div>

            {/* Card 2: On-Demand Custom DTF Pieces */}
            <div className="p-8 sm:p-10 bg-[#171717] text-white border border-[#171717] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 border border-white/20 font-mono text-[10px] font-bold uppercase tracking-wider text-[#E6321C] mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#E6321C]" />
                  <span>ON-DEMAND CUSTOM WORK</span>
                </div>

                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-white mb-3">
                  Bespoke DTF Printed Apparel
                </h3>
                <p className="text-[#AAA7A1] text-[13px] leading-[1.8] mb-6">
                  Items tailored and heat-cured specifically to your artwork upload. Because these items are manufactured on demand, they cannot be returned for subjective change of mind.
                </p>

                <ul className="space-y-3 font-mono text-[11px] text-white/90">
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#E6321C] shrink-0 mt-0.5" />
                    <span><strong>100% Defect Protection:</strong> Misprinted, misaligned, or peeled prints are fully covered.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#E6321C] shrink-0 mt-0.5" />
                    <span><strong>Free Instant Reprint:</strong> Flawed pieces are remade and shipped via express priority air.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#E6321C] shrink-0 mt-0.5" />
                    <span><strong>Zero-Friction Refund:</strong> If a reprint does not satisfy, receive a full 100% refund.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" />
                    <span><strong>Sizing Note:</strong> Please consult our precise sizing chart before custom printing.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15">
                <Link
                  to="/artwork-guidelines"
                  className="text-link text-[11px] text-white hover:text-[#E6321C]"
                >
                  REVIEW ARTWORK SPECIFICATIONS →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           INTERACTIVE FAQ ACCORDION
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              COMMON QUESTIONS & ANSWERS
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-3">
              Clear answers on logistics timelines, payment deposits, and sizing swaps.
            </p>
          </div>

          <div className="border-t border-[#DDD3C5] divide-y divide-[#DDD3C5]">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="transition-colors hover:bg-[#F7EEDB]/50">
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
                    <div className="px-4 pb-6 pt-1 text-[13px] leading-[1.8] text-[#6F6A63] border-l-2 border-[#E6321C] ml-4 mb-2 bg-[#F7EEDB] p-4 rounded-[2px]">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-[#F7EEDB] border border-[#DDD3C5] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#E6321C] shrink-0" />
              <div>
                <div className="font-extrabold uppercase text-xs text-[#171717]">
                  Have a question not answered here?
                </div>
                <div className="text-[#6F6A63] text-[11px]">
                  Our Srikakulam atelier team responds in under 15 minutes on WhatsApp.
                </div>
              </div>
            </div>
            <a
              href={getWhatsAppUrl('Hi Bingooo, I have a specific question regarding returns/exchanges.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-xs h-10 px-5"
            >
              CHAT WITH CONCIERGE →
            </a>
          </div>
        </div>
      </section>

      {/* =======================================================
           SELF-SERVICE ACTION CENTER & CONCIERGE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Action 1: Self-Service Order Hub */}
            <div className="p-8 sm:p-10 bg-white border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#E6321C] tracking-[0.2em] mb-2">
                  SELF-SERVICE HUB
                </div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Manage or Exchange Orders
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Log in with your registered phone number or email to view past orders, request doorstep pickup, or download your invoices.
                </p>

                <div className="space-y-3 font-mono text-[11px] text-[#171717] mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Real-time tracking of reverse courier executive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>1-click size swap selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Direct Razorpay UPI payout status updates</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/account/orders"
                  onClick={() => triggerHaptic('light')}
                  className="btn btn-black inline-flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>GO TO MY ORDERS</span>
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => triggerHaptic('light')}
                  className="btn btn-outline inline-flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>TRACK PARCEL</span>
                </Link>
              </div>
            </div>

            {/* Action 2: Atelier Concierge Desk */}
            <div className="p-8 sm:p-10 bg-[#EDE0CC] border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#171717] tracking-[0.2em] mb-2">
                  ATELIER ASSISTANCE
                </div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Direct Tailor Support Desk
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Need personalized advice on sizing before exchanging? Speak directly with our production coordinators and tailors.
                </p>

                <div className="space-y-4 text-[12px] mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">WhatsApp Concierge (Fastest)</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">+91 79817 87317 • 9:00 AM – 9:00 PM IST</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">Official Email Inquiries</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">bingooo.sklm@gmail.com • 24-hour response</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#E6321C]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">Atelier Dispatch Workshop</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">Srikakulam, Andhra Pradesh 532001, India</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href={getWhatsAppUrl('Hi Bingooo Atelier, I need help with an exchange/return request.')}
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
            Governed by the Consumer Protection (E-Commerce) Rules, 2020. Bingooo Menswear Atelier ensures all returns, exchanges, and refunds are processed within statutory timelines without unjustified demur. For grievances, contact our designated Grievance Officer at <a href="mailto:bingooo.sklm@gmail.com" className="underline font-bold text-[#171717]">bingooo.sklm@gmail.com</a>.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/terms" className="hover:text-[#171717] underline">TERMS OF SERVICE</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#171717] underline">PRIVACY POLICY</Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-[#171717] underline">SHIPPING POLICY</Link>
            <span>•</span>
            <Link to="/artwork-guidelines" className="hover:text-[#171717] underline">ARTWORK GUIDELINES</Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           BOTTOM CALLOUT BANNER (Atelier Red)
      ======================================================= */}
      <section className="py-20 lg:py-24 px-5 bg-[#E6321C] text-white text-center">
        <div className="container-bingooo max-w-[800px] mx-auto">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3 font-mono">
            DOORSTEP REVERSE LOGISTICS
          </div>

          <h2 className="my-2 mb-6 text-[clamp(38px,6vw,84px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase text-white">
            NEED A SIZE SWAP<br />
            OR RAPID REFUND?
          </h2>

          <p className="max-w-[480px] mx-auto mb-8 text-white/90 text-[13px] leading-[1.8]">
            We will book your reverse courier within minutes. Experience zero-friction service from India's heavyweight custom apparel atelier.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/account/orders"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-[#171717] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all shadow-md"
            >
              <PackageCheck className="w-4 h-4" />
              <span>MANAGE MY ORDERS →</span>
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo Atelier, I need urgent assistance with an order exchange/refund.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-white text-[#171717] text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#F7EEDB] hover:-translate-y-0.5 transition-all shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>WHATSAPP CONCIERGE</span>
              <ExternalLink className="w-3 h-3 text-[#6F6A63]" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ReturnsRefundsPage;
