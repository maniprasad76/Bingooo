import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, RotateCcw, AlertTriangle } from 'lucide-react';

export function CancellationPolicyPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Breadcrumbs & Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Policies</span>
            <span>/</span>
            <span className="text-[#171717]">Cancellation Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Cancellation Policy
          </h1>

          <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed max-w-xl">
            Clear, transparent guidelines for canceling catalog and custom on-demand orders before dispatch.
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
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Pre-Dispatch Window</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Standard catalog orders can be cancelled anytime prior to warehouse handover and courier dispatch.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#171717]/10 text-[#171717] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Custom Studio Orders</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Custom prints can be cancelled within 2 hours of placement before film processing and heat application commence.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-5 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-[#238636]/10 text-[#238636] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">100% Instant Refund</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Upon successful cancellation, 100% of the invoice amount is refunded back to your original source account.
            </p>
          </motion.div>
        </div>

        {/* ─── Policy Document ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-8 text-sm leading-relaxed text-[#171717]">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-[#171717]">
              1. How to Cancel Your Order
            </h2>
            <p className="text-[#6F6A63]">
              To cancel an order, log in to your Bingooo account, navigate to <Link to="/account/orders" className="text-[#E6321C] underline font-medium">My Orders</Link>, select the respective order, and tap &quot;Cancel Order&quot;. If you checked out as a guest, you can message our WhatsApp Concierge at +91 79817 87317 or email support@bingooo.in with your order number.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-[#171717]">
              2. Cancellations After Courier Dispatch
            </h2>
            <p className="text-[#6F6A63]">
              Once an order has been physically collected by Delhivery, BlueDart, or other partner logistics and an Airway Bill (AWB) is generated, the order cannot be cancelled in-transit. You may instead decline delivery when the courier arrives at your doorstep, or request an exchange within 7 days of receiving the package under our <Link to="/returns-refunds" className="text-[#E6321C] underline font-medium">Returns Policy</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-[#171717]">
              3. Refund Mode and Processing
            </h2>
            <p className="text-[#6F6A63]">
              For all prepaid orders (UPI, Cards, Netbanking) cancelled before dispatch, the refund is initiated automatically within 2 hours. Funds typically reflect in your bank account or UPI wallet within 2 to 4 business days, depending on your issuing bank.
            </p>
          </section>

        </div>

        {/* ─── Footer Action ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDD3C5] text-xs font-bold font-heading">
          <Link to="/shipping-policy" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Shipping Policy &rarr;
          </Link>
          <Link to="/account/orders" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Manage My Orders &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
