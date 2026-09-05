import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

const SHIPPING_TIERS = [
  {
    region: 'Tier 1 Metro Cities',
    cities: 'Hyderabad, Bengaluru, Chennai, Mumbai, Delhi NCR, Kolkata, Pune',
    transit: '2 to 4 Business Days',
    dispatch: 'Within 24 Hours',
  },
  {
    region: 'Andhra Pradesh & Telangana',
    cities: 'Visakhapatnam, Vijayawada, Srikakulam, Guntur, Tirupati, Warangal',
    transit: '1 to 3 Business Days',
    dispatch: 'Same-day / Next-day',
  },
  {
    region: 'Rest of India',
    cities: 'All other state capitals, tier-2 and tier-3 towns with courier pin-code coverage',
    transit: '4 to 6 Business Days',
    dispatch: 'Within 24 to 48 Hours',
  },
];

export function ShippingPolicyPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Policies</span>
            <span>/</span>
            <span className="text-[#171717]">Shipping & Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Shipping & Delivery Policy
          </h1>

          <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed max-w-xl">
            Everything you need to know about our atelier production, dispatch schedules, transit times, and all-India courier partners.
          </p>
        </div>

        {/* ─── Highlights ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E6321C]/10 text-[#E6321C] flex items-center justify-center">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">24–48h Dispatch</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Standard pieces dispatch within 24 to 48 business hours from our Srikakulam flagship facility.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#238636]/10 text-[#238636] flex items-center justify-center">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Free Shipping on ₹999+</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              All domestic orders above ₹999 receive complimentary express delivery. Orders below ₹999 carry a flat ₹79 charge.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#171717]/10 text-[#171717] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Verified Couriers</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Shipped via trusted logistics networks (Blue Dart, Delhivery, Xpressbees, DTDC) with real-time tracking.
            </p>
          </motion.div>
        </div>

        {/* ─── Transit Estimates Table ─── */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD3C5] space-y-6">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#171717]">
              Domestic Delivery Timelines
            </h2>
            <p className="text-xs text-[#6F6A63]">
              Actual transit times begin once your parcel is collected by the courier partner.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#DDD3C5] text-[11px] uppercase font-mono font-bold text-[#6F6A63]">
                  <th className="pb-3 pr-4">Delivery Region</th>
                  <th className="pb-3 px-4">Covered Cities</th>
                  <th className="pb-3 px-4">Atelier Dispatch</th>
                  <th className="pb-3 pl-4">Estimated Transit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD3C5]/60">
                {SHIPPING_TIERS.map((tier, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-4 pr-4 font-bold text-[#171717] whitespace-nowrap">{tier.region}</td>
                    <td className="py-4 px-4 text-[#6F6A63] max-w-xs">{tier.cities}</td>
                    <td className="py-4 px-4 font-mono text-[#171717] whitespace-nowrap">{tier.dispatch}</td>
                    <td className="py-4 pl-4 font-mono font-bold text-[#E6321C] whitespace-nowrap">{tier.transit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Detailed Policy Guidelines ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-8 text-sm leading-relaxed text-[#171717]">
          
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              1. Custom Studio Orders Processing
            </h3>
            <p className="text-[#6F6A63]">
              Custom apparel ordered through the 3D Customizer Studio requires specialized production (artwork pre-flight review, DTF film printing, heat curing, and quality control inspection). Custom design items generally require an additional 24 to 48 hours of manufacturing time prior to dispatch.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              2. Live Tracking and Communication
            </h3>
            <p className="text-[#6F6A63]">
              As soon as your parcel is scanned at our dispatch hub, you will receive an automated WhatsApp and SMS containing your Airway Bill (AWB) number and a direct live tracking link. You can also monitor real-time shipping milestones in your <Link to="/account/orders" className="text-[#E6321C] underline font-medium">Order History</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              3. Cash on Delivery (COD) Protocols
            </h3>
            <p className="text-[#6F6A63]">
              Cash on Delivery is available across 19,000+ Indian postal codes. Please keep the exact invoice amount ready in cash or UPI at the time of delivery. Couriers will attempt delivery up to 3 times before returning the parcel to the origin facility.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#171717]">
              4. Packaging Inspection upon Arrival
            </h3>
            <p className="text-[#6F6A63]">
              All Bingooo garments are shipped in tamper-evident sealed packaging. If the outer courier flyer appears damaged, torn, or previously opened, please refuse to accept the parcel from the delivery agent and notify our support desk immediately at support@bingooo.in or via WhatsApp at +91 79817 87317.
            </p>
          </section>

        </div>

        {/* ─── Footer Action ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDD3C5] text-xs font-bold font-heading">
          <Link to="/returns-refunds" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Returns & Exchanges &rarr;
          </Link>
          <Link to="/account/orders" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Track Active Order &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
