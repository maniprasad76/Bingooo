import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Truck, RotateCcw, XCircle, Shield, FileText, Ruler, ArrowRight } from 'lucide-react';
import { SizeGuidePage } from './SizeGuidePage';
import { ShippingPolicyPage } from './ShippingPolicyPage';
import { ReturnsRefundsPage } from './ReturnsRefundsPage';
import { PrivacyPolicyPage } from './PrivacyPolicyPage';
import { TermsPage } from './TermsPage';
import { CancellationPolicyPage } from './CancellationPolicyPage';

const POLICY_CARDS = [
  {
    title: 'Shipping & Delivery Policy',
    desc: '24–48h atelier dispatch schedules, express courier transit times, and all-India coverage details.',
    to: '/shipping-policy',
    icon: Truck,
  },
  {
    title: 'Returns & Doorstep Exchanges',
    desc: '7-day hassle-free doorstep size exchanges, condition criteria, and refund timelines.',
    to: '/returns-refunds',
    icon: RotateCcw,
  },
  {
    title: 'Cancellation Policy',
    desc: 'Pre-dispatch order cancellation windows and custom on-demand print guidelines.',
    to: '/cancellation-policy',
    icon: XCircle,
  },
  {
    title: 'Privacy Policy',
    desc: 'How we protect your personal information, Razorpay payment encryption, and data rights.',
    to: '/privacy-policy',
    icon: Shield,
  },
  {
    title: 'Terms of Service',
    desc: 'Store terms, custom artwork upload representations, pricing policies, and jurisdiction.',
    to: '/terms',
    icon: FileText,
  },
  {
    title: 'Size & Fit Guide',
    desc: 'Precision chest, length, and sleeve measurements for our 240+ GSM heavyweight fits.',
    to: '/policies/size-guide',
    icon: Ruler,
  },
];

export function PoliciesPage() {
  const shouldReduceMotion = useReducedMotion();
  const { slug } = useParams<{ slug: string }>();

  // If specific sub-policy slug is requested, render that page directly
  if (slug === 'size-guide') {
    return <SizeGuidePage />;
  }
  if (slug === 'shipping' || slug === 'shipping-policy') {
    return <ShippingPolicyPage />;
  }
  if (slug === 'returns' || slug === 'returns-refunds' || slug === 'return-policy') {
    return <ReturnsRefundsPage />;
  }
  if (slug === 'privacy' || slug === 'privacy-policy') {
    return <PrivacyPolicyPage />;
  }
  if (slug === 'terms' || slug === 'terms-and-conditions') {
    return <TermsPage />;
  }
  if (slug === 'cancellation' || slug === 'cancellation-policy') {
    return <CancellationPolicyPage />;
  }

  // Otherwise, render the Central Policy Directory
  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Breadcrumb & Header ─── */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Policies & Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Store Policies & Legal Hub
          </h1>

          <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed">
            Transparent, customer-first standards governing your orders, custom 3D printing, doorstep exchanges, and privacy.
          </p>
        </div>

        {/* ─── Policies Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POLICY_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.to}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 350, damping: 25 }}
                whileHover={shouldReduceMotion ? undefined : { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)' }}
                className="rounded-2xl"
              >
                <Link
                  to={card.to}
                  className="p-6 rounded-2xl bg-white hover:bg-[#EDE0CC]/60 border border-[#DDD3C5] hover:border-[#E6321C]/50 transition-colors flex flex-col justify-between group shadow-2xs h-full"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] text-[#171717] flex items-center justify-center group-hover:bg-[#E6321C] group-hover:text-white group-hover:border-[#E6321C] transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-[#171717] font-heading group-hover:text-[#E6321C] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#6F6A63] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#DDD3C5]/60 flex items-center justify-between text-xs font-bold font-heading text-[#171717] group-hover:text-[#E6321C]">
                    <span>Read Full Policy</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Need Quick Help? ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold font-heading text-[#171717]">Have questions regarding a specific order?</h3>
            <p className="text-xs text-[#6F6A63]">Our customer concierge is available 6 days a week to assist you.</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/faq"
                className="inline-block px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#171717] border border-[#DDD3C5] text-xs font-bold font-heading transition-colors"
              >
                Browse FAQ
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/contact"
                className="inline-block px-4 py-2.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-bold font-heading transition-colors shadow-xs"
              >
                Contact Desk
              </Link>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
