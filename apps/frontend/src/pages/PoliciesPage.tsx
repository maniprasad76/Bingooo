import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Truck, RotateCcw, XCircle, Shield, FileText, Ruler, ArrowRight } from 'lucide-react';
import { SEO } from '../components/common/SEO';

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
    to: '/size-guide',
    icon: Ruler,
  },
];

export function PoliciesPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Store Policies & Legal Standards"
        description="Explore Bingooo customer policies: pan-India delivery, 7-day exchanges, cancellations, data privacy, and size guides."
      />
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
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                className="rounded-[2px]"
              >
                <Link
                  to={card.to}
                  className="p-6 rounded-[2px] bg-white hover:bg-[#F7EEDB] border-2 border-[#171717] transition-all flex flex-col justify-between group shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] h-full"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#F7EEDB] border-2 border-[#171717] text-[#171717] flex items-center justify-center group-hover:bg-[#E6321C] group-hover:text-white group-hover:border-[#E6321C] transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-black text-[#171717] font-heading group-hover:text-[#E6321C] transition-colors uppercase tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#6F6A63] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t-2 border-[#171717] flex items-center justify-between text-xs font-black font-heading text-[#171717] group-hover:text-[#E6321C] uppercase tracking-wider">
                    <span>Read Full Policy</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Need Quick Help? ─── */}
        <div className="p-6 sm:p-8 rounded-[2px] bg-[#F7EEDB] border-2 border-[#171717] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_#171717]">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-black font-heading text-[#171717] uppercase tracking-tight">Have questions regarding a specific order?</h3>
            <p className="text-xs text-[#6F6A63]">Our customer concierge is available 6 days a week to assist you.</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/faq"
                className="inline-block px-4 py-2.5 rounded-[2px] bg-white hover:bg-[#F7EEDB] text-[#171717] border-2 border-[#171717] text-xs font-black font-heading uppercase tracking-wider transition-all shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                Browse FAQ
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/contact"
                className="inline-block px-4 py-2.5 rounded-[2px] bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-black font-heading uppercase tracking-wider transition-all border-2 border-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
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
