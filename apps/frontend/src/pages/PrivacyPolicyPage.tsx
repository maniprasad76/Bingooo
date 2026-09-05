import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Bell } from 'lucide-react';

export function PrivacyPolicyPage() {
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
            <span className="text-[#171717]">Privacy Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-[#6F6A63] font-mono">
            Last Updated: January 2026 • Bingooo Men&apos;s Wear (Srikakulam, Andhra Pradesh, India)
          </p>
        </div>

        {/* ─── Key Highlights Ribbon ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-4 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E6321C]/10 text-[#E6321C] flex items-center justify-center">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Zero Stored Card Data</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              All transactions are processed via Razorpay PCI-DSS certified encrypted gateways. We never see or store your card or bank credentials.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-4 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#238636]/10 text-[#238636] flex items-center justify-center">
              <Eye className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">Custom Design Privacy</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Your uploaded images and artwork in our 3D Customizer remain strictly confidential and are used only to print your garments.
            </p>
          </motion.div>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)' }}
            className="p-4 rounded-xl bg-white border border-[#DDD3C5] space-y-2 transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-[#171717]/10 text-[#171717] flex items-center justify-center">
              <Shield className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#171717] font-heading">No Data Brokering</h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              We never sell or rent your personal contact information to third-party marketing firms or advertising networks.
            </p>
          </motion.div>
        </div>

        {/* ─── Legal Document Body ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-8 text-sm leading-relaxed text-[#171717]">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E6321C]" aria-hidden="true" />
              1. Overview and Commitment
            </h2>
            <p className="text-[#6F6A63]">
              Bingooo Men&apos;s Wear (&quot;Bingooo&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website located at bingooo.in and affiliated online services. This Privacy Policy details how we collect, handle, protect, and utilize your personal information when you browse our storefront, configure apparel in our 3D Customizer Studio, and complete orders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#E6321C]" aria-hidden="true" />
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6F6A63]">
              <li>
                <strong className="text-[#171717]">Account & Contact Data:</strong> When registering an account or placing an order, we collect your full name, email address, phone number, and physical shipping address in India.
              </li>
              <li>
                <strong className="text-[#171717]">Custom Artwork & Assets:</strong> When utilizing our 3D design studio, we store uploaded PNG, JPEG, SVG files and design positioning data to manufacture your customized garments.
              </li>
              <li>
                <strong className="text-[#171717]">Transaction Information:</strong> Order numbers, selected payment mode (UPI, Card, Netbanking, COD), order totals, and Razorpay transaction reference identifiers.
              </li>
              <li>
                <strong className="text-[#171717]">Device and Usage Logs:</strong> IP address, browser type, referral URLs, and session data utilized to ensure website speed, cart stability, and fraud prevention.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#E6321C]" aria-hidden="true" />
              3. Payment Security & Third-Party Processing
            </h2>
            <p className="text-[#6F6A63]">
              All electronic payments on Bingooo are secured and facilitated through Razorpay Software Private Limited. We do not process, capture, or store credit card numbers, CVVs, or bank netbanking passwords on our servers. Razorpay complies with the international Payment Card Industry Data Security Standard (PCI-DSS Level 1).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              4. How We Use Your Data
            </h2>
            <p className="text-[#6F6A63]">We use the collected information solely for genuine business operations:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#6F6A63]">
              <li>Fulfilling, packaging, and dispatching your garments via verified courier partners (Delhivery, BlueDart, Xpressbees).</li>
              <li>Sending automated WhatsApp and SMS order confirmations, dispatch alerts, and live tracking links.</li>
              <li>Processing 7-day doorstep size exchanges and refunds.</li>
              <li>Providing responsive customer support and resolving custom design queries.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              5. Cookies and Local Storage
            </h2>
            <p className="text-[#6F6A63]">
              We utilize cookies and browser local storage to maintain your shopping cart, preserve your saved wishlist, remember design studio drafts, and keep your user account securely signed in. You can disable cookies in your browser settings, though doing so may limit interactive cart and customizer features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
              6. Your Rights and Contact Information
            </h2>
            <p className="text-[#6F6A63]">
              Under Indian Information Technology laws and Digital Personal Data Protection principles, you have the right to request access to, correction of, or deletion of your personal account data at any time.
            </p>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-1 text-xs">
              <p className="font-bold text-[#171717]">Bingooo Atelier Grievance Officer</p>
              <p className="text-[#6F6A63]">Srikakulam, Andhra Pradesh, India - 532001</p>
              <p className="text-[#6F6A63]">Email: support@bingooo.in • WhatsApp: +91 79817 87317</p>
            </div>
          </section>

        </div>

        {/* ─── Related Links ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DDD3C5] text-xs font-bold font-heading">
          <Link to="/terms" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Terms of Service &rarr;
          </Link>
          <Link to="/shipping-policy" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Shipping Policy &rarr;
          </Link>
          <Link to="/returns-refunds" className="text-[#171717] hover:text-[#E6321C] transition-colors">
            Returns and Exchange Policy &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
