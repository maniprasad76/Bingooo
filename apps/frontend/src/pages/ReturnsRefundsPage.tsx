import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const RETURN_STEPS = [
  {
    step: '01',
    title: 'Submit Request within 7 Days',
    desc: 'Log in, go to Account > Orders, select the item, and tap "Exchange Size" or "Return". Alternatively, message our WhatsApp support desk.',
  },
  {
    step: '02',
    title: 'Doorstep Courier Pickup',
    desc: 'Our logistics partner will arrive at your address within 24 to 48 hours to collect the securely packaged garment with tags attached.',
  },
  {
    step: '03',
    title: 'Quality Check & Replacement',
    desc: 'Once inspected at our atelier, your exchange size is dispatched immediately, or your refund is initiated within 24 hours.',
  },
];

export function ReturnsRefundsPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Breadcrumb & Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Policies</span>
            <span>/</span>
            <span className="text-[#171717]">Returns & Refunds</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Returns, Exchanges & Refunds
          </h1>

          <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed max-w-xl">
            We stand behind our heavyweight menswear. Enjoy our 7-day doorstep size exchange policy across India.
          </p>
        </div>

        {/* ─── Highlights ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E6321C]/10 text-[#E6321C] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">7-Day Doorstep Exchange</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              If the fit isn&apos;t perfect, exchange for your preferred size. We arrange the doorstep reverse pickup.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#238636]/10 text-[#238636] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">100% Defect Guarantee</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Any custom or catalog garment with printing flaws or stitching defects is replaced free of charge immediately.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#171717]/10 text-[#171717] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Rapid Refunds</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Approved refunds are triggered within 24 hours back to your original payment method or bank UPI.
            </p>
          </motion.div>
        </div>

        {/* ─── 3-Step Exchange Process ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              How Doorstep Size Exchanges Work
            </h2>
            <p className="text-xs text-[#6F6A63]">
              Simple, smooth, and hassle-free reverse pickup straight from your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RETURN_STEPS.map((step) => (
              <div key={step.step} className="p-5 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-2">
                <span className="text-xs font-mono font-black text-[#E6321C] block">
                  STEP {step.step}
                </span>
                <h3 className="text-sm font-bold text-[#171717] font-heading">
                  {step.title}
                </h3>
                <p className="text-xs text-[#6F6A63] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Policy Specifics ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-8 text-sm leading-relaxed text-[#171717]">
          
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              1. Return Eligibility Conditions
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[#6F6A63]">
              <li>Items must be unworn, unwashed, unaltered, and free of stains, deodorant marks, or fragrance.</li>
              <li>All original brand tags, wash care labels, and plastic packaging must remain attached and intact.</li>
              <li>Return or exchange requests must be lodged within 7 days of verified delivery.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              2. Custom On-Demand Apparel Policy
            </h3>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
                <AlertCircle className="w-4 h-4 text-[#E6321C]" aria-hidden="true" />
                <span>Custom Printed Items (3D Customizer Studio)</span>
              </div>
              <p className="text-xs text-[#6F6A63] leading-relaxed">
                Garments manufactured on-demand with user-uploaded images, personalized text, or custom graphics are created solely for that customer. As such, customized pieces cannot be returned for a change of mind or personal preference. If your custom item arrives damaged, flawed in print, or misprinted, we provide a 100% free reprint replacement or full refund.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              3. Refund Processing Timelines & Modes
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[#6F6A63]">
              <li><strong className="text-[#171717]">Prepaid Orders (Cards/UPI/Netbanking):</strong> Refunds are credited back to the original source account via Razorpay within 3 to 5 business days.</li>
              <li><strong className="text-[#171717]">Cash on Delivery (COD) Orders:</strong> Upon parcel pickup and inspection, our finance desk sends a secure payout link via SMS/WhatsApp to deposit funds into your verified UPI ID or bank account within 24 hours.</li>
            </ul>
          </section>

        </div>

        {/* ─── Footer Action ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDD3C5] text-xs font-bold font-heading">
          <Link to="/shipping-policy" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            &larr; Shipping Policy
          </Link>
          <Link to="/account/orders" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Initiate Return / Exchange &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
