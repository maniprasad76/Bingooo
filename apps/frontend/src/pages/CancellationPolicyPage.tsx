import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';
import {
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  PackageX,
  Truck,
  HelpCircle,
  FileText,
  Mail,
  PhoneCall,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const CANCELLATION_STEPS = [
  {
    step: '01',
    label: 'ACCESS',
    title: 'Locate Your Order',
    desc: 'Go to Account > Orders or message our WhatsApp desk with your 6-digit Order ID.',
    highlight: 'No login password required for guest orders',
  },
  {
    step: '02',
    label: 'ONE-CLICK',
    title: 'Tap "Cancel Order"',
    desc: 'Select your cancellation reason (wrong size, address update, or changed mind) in under 15 seconds.',
    highlight: 'Instant confirmation via SMS & WhatsApp',
  },
  {
    step: '03',
    label: 'REVERSAL',
    title: '100% Source Refund',
    desc: 'Razorpay initiates an automated 100% refund back to your original payment mode with zero deductions.',
    highlight: '₹0 cancellation or processing fee',
  },
];

const FAQS = [
  {
    question: 'Can I modify my shipping address or sizing instead of canceling?',
    answer:
      'Yes. If your parcel has not yet been collected by the courier, our concierge desk can update your delivery address, phone number, or garment size directly. Simply ping us on WhatsApp with your Order ID and the updated details before dispatch.',
  },
  {
    question: 'How quickly will I receive my refund after canceling?',
    answer:
      'Prepaid refunds (UPI, Debit/Credit Card, Net Banking) are triggered through Razorpay within 2 hours of cancellation. UPI transfers typically reflect in your bank account within 2 to 24 hours. Card transactions reflect within 2 to 4 business days depending on your bank.',
  },
  {
    question: 'What if my order has already been dispatched with a courier tracking AWB?',
    answer:
      'Once a parcel is handed over to Blue Dart, Delhivery, or DTDC and an Airway Bill (AWB) is assigned, the shipment is in active transit and cannot be intercepted digitally. You can simply decline delivery when the courier executive arrives at your doorstep ("Refused at Doorstep"). Once the return scan registers, your 100% refund is initiated.',
  },
  {
    question: 'Why is there a strict 2-hour window for on-demand custom DTF orders?',
    answer:
      'Unlike off-the-rack garments, custom pieces require dedicated high-resolution DTF film rasterization, heat press calibration, and individualized fabric curing. Production begins promptly 2 hours after order confirmation. Cancellations requested within 2 hours are granted a 100% full refund.',
  },
  {
    question: 'Can I cancel a single item from a multi-item order?',
    answer:
      'Yes. If you ordered multiple garments and only want to cancel one piece, contact our WhatsApp atelier desk. We will adjust your shipment, cancel the specific item, and reverse the prorated amount immediately.',
  },
  {
    question: 'What happens if I used a discount coupon or store credit on the canceled order?',
    answer:
      'Any promo voucher used is automatically reinstated to your account for future use. If you paid using Bingooo Atelier Store Credit, the full credit balance is restored to your profile instantly.',
  },
];

export function CancellationPolicyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    triggerHaptic('light');
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main className="bg-[#F7EEDB] text-[#171717] font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      <SEO
        title="Cancellation Policy — BINGOOO Atelier"
        description="Understand Bingooo's zero-penalty pre-dispatch order cancellation window, custom on-demand print guidelines, and 100% instant refund timelines."
        canonical="https://bingooo.in/cancellation-policy"
      />

      {/* =======================================================
           TOP BREADCRUMB & REAL-TIME DISPATCH STATUS
      ======================================================= */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/60 px-4 sm:px-8 py-3 text-[11px]">
        <div className="container-bingooo flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/" className="hover:text-[#171717] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#6F6A63]">POLICIES</span>
            <span>/</span>
            <span className="text-[#171717] font-bold">CANCELLATION POLICY</span>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#171717] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
            <span>AUTOMATED 100% INSTANT REFUNDS ACTIVE (PRE-DISPATCH)</span>
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
            <span>ATELIER CANCELLATION CODE • ZERO PENALTY</span>
          </div>

          <h1 className="my-2 mb-6 text-[clamp(44px,6.2vw,92px)] font-extrabold leading-[0.86] tracking-[-0.07em] uppercase text-[#171717]">
            <span className="block">PRE-DISPATCH.</span>
            <span className="block">100% REFUND.</span>
            <span className="block text-[#E6321C]">ZERO FRICTION.</span>
          </h1>

          <p className="max-w-[480px] m-0 mb-8 text-[#6F6A63] text-[13px] leading-[1.8]">
            Need to change sizing, update delivery coordinates, or cancel an order? We offer transparent, penalty-free cancellations on all standard catalog garments right up to the moment our courier scans the parcel. 100% of your funds are reversed with zero deductions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              to="/account/orders"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black inline-flex items-center gap-2"
            >
              <span>CANCEL AN ORDER NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo Atelier, I would like to cancel/modify my recent order.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="btn btn-outline inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>WHATSAPP CONCIERGE</span>
            </a>
          </div>

          {/* Quick SLA Specs */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#DDD3C5]">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">WINDOW</span>
              <span className="text-[12px] font-bold text-[#6F6A63]">Pre-Dispatch</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">DEDUCTION</span>
              <span className="text-[12px] font-bold text-[#238636]">₹0 Zero Penalty</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">PAYOUT</span>
              <span className="text-[12px] font-bold text-[#171717]">Instant 2H Trigger</span>
            </div>
          </div>
        </div>

        {/* Right Imagery Banner */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-full overflow-hidden bg-[#171717]">
          <img
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo atelier production inspection and pre-dispatch logistics"
            className="w-full h-full object-cover grayscale contrast-125 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/85 via-transparent to-black/20" />

          {/* Overlay Atelier Stamp */}
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#171717]/90 backdrop-blur-md border border-white/10 text-white rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                SRIKAKULAM WORKSHOP • TRANSPARENT COMMERCE
              </div>
              <div className="text-sm font-bold uppercase tracking-tight">
                100% Pre-Dispatch Money-Back Guarantee
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#DDD3C5]/80 uppercase tracking-widest self-end sm:self-center">
              CONSUMER RIGHTS COMPLIANT
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
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">CATALOG ORDERS</span>
                <Clock className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  ANYTIME
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Prior to AWB Generation & Courier Pickup
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">CUSTOM PRINTS</span>
                <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  2 HOURS
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Cut-off Before Film Printing & Heat Press
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">CANCELLATION FEE</span>
                <ShieldCheck className="w-4 h-4 text-[#238636]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#238636]">
                  ₹0 ZERO
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  100% Full Refund With No Hidden Deductions
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">REFUND DISPATCH</span>
                <RotateCcw className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  2 HOURS
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Automated Razorpay Reversal Initiation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           THREE-STEP CANCELLATION TIMELINE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
                THE PROCESS
              </div>
              <h2 className="m-0 text-[clamp(36px,5vw,64px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase text-[#171717]">
                THREE STEPS.<br />
                ZERO HASSLE.
              </h2>
            </div>
            <p className="max-w-[360px] m-0 text-[#6F6A63] text-[12px] leading-[1.8]">
              No calling call centers, no waiting on hold. Cancel directly from your customer portal or send a one-line WhatsApp message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#DDD3C5]">
            {CANCELLATION_STEPS.map((step) => (
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
              <PackageX className="w-4 h-4" />
              <span>VIEW RECENT ORDERS TO CANCEL</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           CATEGORY COMPARISON: READY-TO-WEAR VS CUSTOM DTF
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              ORDER SPECIFICATION RULES
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              CANCELLATION RULES BY PRODUCT TYPE
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-4">
              Clear rules distinguishing standard ready-to-wear pieces from on-demand customized DTF prints.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card 1: Standard Menswear */}
            <div className="p-8 sm:p-10 bg-white border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F7EEDB] border border-[#DDD3C5] font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-6">
                  <RotateCcw className="w-3.5 h-3.5 text-[#171717]" />
                  <span>STANDARD ATELIER COLLECTION</span>
                </div>

                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Ready-to-Wear Menswear
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Applies to standard catalog garments: Heavyweight Tees, Vintage Washed Hoodies, Boxy Polos, and Archival Pieces.
                </p>

                <ul className="space-y-3 font-mono text-[11px] text-[#171717]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Pre-Dispatch Freedom:</strong> Cancel anytime prior to courier pickup.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>100% Full Refund:</strong> Full payment returned to UPI, card, or source account.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Zero Restocking Fee:</strong> We never charge cancellation or transaction penalties.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Post-Dispatch Fallback:</strong> If already shipped, decline delivery at doorstep.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#DDD3C5]">
                <Link
                  to="/account/orders"
                  className="text-link text-[11px] text-[#171717] hover:text-[#E6321C]"
                >
                  GO TO MY ORDERS TO CANCEL →
                </Link>
              </div>
            </div>

            {/* Card 2: Custom DTF Pieces */}
            <div className="p-8 sm:p-10 bg-[#171717] text-white border border-[#171717] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 border border-white/20 font-mono text-[10px] font-bold uppercase tracking-wider text-[#E6321C] mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-[#E6321C]" />
                  <span>ON-DEMAND CUSTOM PRODUCTION</span>
                </div>

                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-white mb-3">
                  Bespoke DTF Printed Apparel
                </h3>
                <p className="text-[#AAA7A1] text-[13px] leading-[1.8] mb-6">
                  Custom apparel printed with your uploaded artwork. Because material is permanently cured, a strict cut-off applies.
                </p>

                <ul className="space-y-3 font-mono text-[11px] text-white/90">
                  <li className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" />
                    <span><strong>2-Hour Cancellation Grace Period:</strong> Full refund if cancelled within 2 hours.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#E6321C] shrink-0 mt-0.5" />
                    <span><strong>Post-2-Hour Lock:</strong> After 2 hours, DTF printing and thermal curing commence.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>100% Quality Warranty:</strong> Still covered by free reprint or refund if defective.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#238636] shrink-0 mt-0.5" />
                    <span><strong>Artwork Adjustments:</strong> Typo or artwork mistakes can be swapped within 2 hours.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15">
                <Link
                  to="/artwork-guidelines"
                  className="text-link text-[11px] text-white hover:text-[#E6321C]"
                >
                  REVIEW PRINT PRODUCTION GUIDELINES →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           IN-TRANSIT / POST-DISPATCH EXPLANATION BANNER
      ======================================================= */}
      <section className="py-16 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[950px] mx-auto">
          <div className="p-8 sm:p-10 bg-[#F7EEDB] border border-[#DDD3C5] rounded-[2px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[2px] bg-[#171717] text-white flex items-center justify-center shrink-0 mt-1">
                <Truck className="w-6 h-6 text-[#E6321C]" />
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                  POST-DISPATCH PROTOCOL
                </div>
                <h3 className="text-xl font-extrabold uppercase text-[#171717]">
                  What if my parcel is already in-transit?
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-2 max-w-xl">
                  Once collected by Blue Dart or Delhivery, shipments cannot be halted digitally. You can simply state <strong>&quot;Delivery Refused&quot;</strong> when the courier calls or reaches your door. The courier will initiate a reverse return to our Srikakulam atelier, and your 100% refund will be credited immediately.
                </p>
              </div>
            </div>
            <Link
              to="/returns-refunds"
              className="btn btn-outline shrink-0 text-xs"
            >
              RETURNS POLICY →
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
              COMMON CANCELLATION QUESTIONS
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-3">
              Clear answers regarding payment reversals, custom print windows, and partial cancellations.
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
                  Need immediate cancellation assistance?
                </div>
                <div className="text-[#6F6A63] text-[11px]">
                  Our WhatsApp desk intercepts and cancels orders in real-time.
                </div>
              </div>
            </div>
            <a
              href={getWhatsAppUrl('Hi Bingooo, I urgently need to cancel/modify an order before dispatch.')}
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
                  Cancel via Customer Portal
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Log in to your Bingooo account to cancel pre-dispatch orders with 1-click, check refund reversal status, or modify shipping addresses.
                </p>

                <div className="space-y-3 font-mono text-[11px] text-[#171717] mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Instant digital cancellation button on active orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>Live Razorpay refund reference number tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#238636]" />
                    <span>100% full invoice amount credited with zero deductions</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/account/orders"
                  onClick={() => triggerHaptic('light')}
                  className="btn btn-black inline-flex items-center gap-2"
                >
                  <PackageX className="w-4 h-4" />
                  <span>GO TO MY ORDERS</span>
                </Link>
                <Link
                  to="/shipping-policy"
                  onClick={() => triggerHaptic('light')}
                  className="btn btn-outline inline-flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>SHIPPING POLICY</span>
                </Link>
              </div>
            </div>

            {/* Action 2: Direct Concierge Desk */}
            <div className="p-8 sm:p-10 bg-[#F7EEDB] border border-[#DDD3C5] rounded-[2px] flex flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#171717] tracking-[0.2em] mb-2">
                  ATELIER ASSISTANCE
                </div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717] mb-3">
                  Production Support Desk
                </h3>
                <p className="text-[#6F6A63] text-[13px] leading-[1.8] mb-6">
                  Made a mistake on your size or shipping address? Message or call our atelier production desk directly.
                </p>

                <div className="space-y-4 text-[12px] mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">WhatsApp Support (Fastest)</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">+91 93902 44747 • Instant Interception</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">Telephone Concierge</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]"><a href="tel:+917981787317" className="underline">+91 79817 87317</a> • 9:00 AM – 9:00 PM IST</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#171717] uppercase">Official Email Desk</div>
                      <div className="text-[#6F6A63] font-mono text-[11px]">support@bingooo.in • Priority Ticket</div>
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
                  href={getWhatsAppUrl('Hi Bingooo Atelier, I need urgent assistance canceling/modifying an order.')}
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
            Governed under the Consumer Protection (E-Commerce) Rules, 2020. Bingooo Menswear Atelier ensures all pre-dispatch order cancellations are processed without unjustified delay or arbitrary penalty. For legal escalations, reach our Grievance Officer at <a href="mailto:grievance@bingooo.in" className="underline font-bold text-[#171717]">grievance@bingooo.in</a>.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/returns-refunds" className="hover:text-[#171717] underline">RETURNS & REFUNDS</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#171717] underline">TERMS OF SERVICE</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#171717] underline">PRIVACY POLICY</Link>
            <span>•</span>
            <Link to="/shipping-policy" className="hover:text-[#171717] underline">SHIPPING POLICY</Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           BOTTOM CALLOUT BANNER (Atelier Charcoal)
      ======================================================= */}
      <section className="py-20 lg:py-24 px-5 bg-[#171717] text-white text-center">
        <div className="container-bingooo max-w-[800px] mx-auto">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3 font-mono">
            HASSLE-FREE ORDER MANAGEMENT
          </div>

          <h2 className="my-2 mb-6 text-[clamp(38px,6vw,84px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase text-white">
            NEED TO MAKE AN<br />
            IMMEDIATE CHANGE?
          </h2>

          <p className="max-w-[480px] mx-auto mb-8 text-[#AAA7A1] text-[13px] leading-[1.8]">
            We handle modifications and cancellations swiftly. Experience zero-friction service from India&apos;s heavyweight custom apparel atelier.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/account/orders"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-[#E6321C] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#B91F12] hover:-translate-y-0.5 transition-all shadow-md"
            >
              <PackageX className="w-4 h-4" />
              <span>MANAGE MY ORDERS →</span>
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo Atelier, I need urgent assistance canceling/modifying an order.')}
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

export default CancellationPolicyPage;
