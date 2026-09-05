import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Scale } from 'lucide-react';

export function TermsPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Breadcrumbs & Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Legal</span>
            <span>/</span>
            <span className="text-[#171717]">Terms of Service</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Terms of Service
          </h1>

          <p className="text-xs sm:text-sm text-[#6F6A63] font-mono">
            Effective Date: January 2026 • Governing Law: Andhra Pradesh, India
          </p>
        </div>

        {/* ─── Key Summary Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-4 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E6321C]/10 text-[#E6321C] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Authentic Products</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Every garment sold on Bingooo is manufactured with certified 240+ GSM cotton fabrics and genuine DTF prints.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-4 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#171717]/10 text-[#171717] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Artwork Ownership</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              By uploading artwork for custom printing, you represent that you hold the legal copyright or license to print the design.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-4 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#238636]/10 text-[#238636] flex items-center justify-center">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Indian Jurisdiction</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              All transactions, agreements, and disputes are governed under the laws of the Republic of India and Srikakulam jurisdiction.
            </p>
          </motion.div>
        </div>

        {/* ─── Terms Document ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-8 text-sm leading-relaxed text-[#171717]">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              1. Acceptance of Terms
            </h2>
            <p className="text-[#6F6A63]">
              By accessing, browsing, or purchasing from Bingooo Men&apos;s Wear (bingooo.in), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, our Privacy Policy, Shipping Policy, and Return Policy. If you do not agree to these terms, please refrain from using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              2. User Accounts & Security
            </h2>
            <p className="text-[#6F6A63]">
              When creating an account, you must provide accurate, current, and complete details. You are responsible for safeguarding your password and account credentials. Bingooo will not be liable for any losses arising from unauthorized account access where credentials were compromised on the user&apos;s device.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              3. 3D Customizer Studio & Uploaded Content
            </h2>
            <p className="text-[#6F6A63]">
              Bingooo allows users to upload custom logos, illustrations, graphics, and text to manufacture customized apparel. By uploading any file:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#6F6A63]">
              <li>You warrant that you own or hold valid intellectual property licenses for all logos, trademarks, or visual artwork submitted.</li>
              <li>You agree not to submit hate speech, unlawful imagery, defamatory content, or artwork violating third-party trademarks.</li>
              <li>You grant Bingooo a limited, non-exclusive license to process and print the uploaded file onto your ordered garments.</li>
              <li>Bingooo reserves the right to reject and cancel any custom order that infringes intellectual property rights or violates applicable laws.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              4. Pricing, Billing, and Order Acceptance
            </h2>
            <p className="text-[#6F6A63]">
              All prices listed on the website are in Indian Rupees (INR) and inclusive of applicable Goods and Services Tax (GST). While we endeavor to maintain accurate pricing, typographical errors may occur. In the event of a manifest pricing error, Bingooo reserves the right to cancel the order and provide a full refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              5. Shipping, Exchanges, and Refunds
            </h2>
            <p className="text-[#6F6A63]">
              Garments are dispatched in accordance with our dedicated <Link to="/shipping-policy" className="text-[#E6321C] underline font-medium">Shipping Policy</Link>. Standard catalog apparel can be exchanged within 7 days under our <Link to="/returns-refunds" className="text-[#E6321C] underline font-medium">Returns and Exchange Policy</Link>. Custom printed apparel is manufactured on-demand and can only be reprinted if defective upon delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              6. Limitation of Liability and Governing Law
            </h2>
            <p className="text-[#6F6A63]">
              Bingooo shall not be liable for indirect, incidental, or consequential damages resulting from the use or inability to use our website or products. Any legal claims or disputes shall be subject to the exclusive jurisdiction of the competent courts in Srikakulam, Andhra Pradesh, India.
            </p>
          </section>

        </div>

        {/* ─── Footer Navigation ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDD3C5] text-xs font-bold font-heading">
          <Link to="/privacy-policy" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            &larr; Privacy Policy
          </Link>
          <Link to="/contact" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Contact Support &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
