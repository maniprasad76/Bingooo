import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

export function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased">
      <SEO
        title="Privacy Policy — BINGOOO"
        description="Learn how Bingooo protects your personal information, secures payment transactions, and safeguards custom design studio uploads."
        canonical="https://bingooo.in/privacy-policy"
      />

      {/* =======================================================
           HERO SECTION (Matching AboutPage Spacing & Layout)
      ======================================================= */}
      <section className="min-h-[600px] lg:min-h-[650px] grid grid-cols-1 lg:grid-cols-[45%_55%] bg-[#f7eedb]">
        <div className="flex flex-col justify-center py-[65px] px-6 sm:px-10 lg:py-[clamp(50px,8vw,110px)] lg:px-[clamp(25px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-3">
            BINGOOO / PRIVACY & DATA ETHICS
          </div>

          <h1 className="my-3 mb-6 text-[clamp(52px,7vw,105px)] font-extrabold leading-[0.84] tracking-[-0.075em] uppercase">
            <span className="block">YOUR DATA.</span>
            <span className="block">YOUR TRUST.</span>
            <span className="block text-[#e6321c]">OUR PROMISE.</span>
          </h1>

          <p className="max-w-[440px] m-0 mb-[30px] text-[#6f6a63] text-[13px] leading-[1.8]">
            At BINGOOO, we treat your personal data with the exact same craftsmanship, integrity, and respect that goes into our heavyweight 240 GSM garments.
          </p>

          <div>
            <a
              href="#policy-details"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              READ POLICY ↓
            </a>
          </div>
        </div>

        <div className="h-[400px] sm:h-[500px] lg:h-auto overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo privacy and trust editorial"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT (Dark Full-Width Punchline Banner)
      ======================================================= */}
      <section className="py-[clamp(75px,10vw,145px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-4">
          OUR PRIVACY STANDARD
        </div>

        <h2 className="max-w-[1000px] mx-auto m-0 text-[clamp(40px,7vw,88px)] leading-[0.9] font-extrabold tracking-[-0.07em] uppercase text-white">
          WE DON'T SELL YOUR <span className="text-[#e6321c]">DATA.</span><br />
          WE DON'T COMPROMISE YOUR <span className="text-[#e6321c]">TRUST.</span><br />
          ZERO ADS. ZERO SPAM.
        </h2>
      </section>

      {/* =======================================================
           STORY / PHILOSOPHY BLOCK
      ======================================================= */}
      <section className="py-[clamp(70px,9vw,120px)]" id="policy-details">
        <div className="container-bingooo grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-[clamp(50px,9vw,140px)] items-center">
          <div className="aspect-[4/5] overflow-hidden bg-[#ede0cc] max-w-[600px] mx-auto lg:mx-0 w-full">
            <img
              src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90"
              alt="Bingooo data ethics"
              className="w-full h-full object-cover grayscale"
            />
          </div>

          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              THE PHILOSOPHY
            </div>

            <h2 className="my-2.5 mb-6 text-[clamp(40px,5vw,70px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase">
              HONEST.<br />
              SIMPLE.<br />
              <span className="text-[#e6321c]">PROTECTED.</span>
            </h2>

            <p className="max-w-[600px] m-0 mb-[18px] text-[#6f6a63] text-[13px] leading-[1.85]">
              Modern commerce has made customer data complicated. At BINGOOO, we believe the best privacy policy is simple: we only ask for the information required to build, tailor, and deliver your clothing.
            </p>

            <p className="max-w-[600px] m-0 mb-[18px] text-[#6f6a63] text-[13px] leading-[1.85]">
              Your phone number is used for real-time dispatch alerts, not marketing cold calls. Your address is used solely by our logistics partners to deliver your package directly to your doorstep.
            </p>

            <p className="max-w-[600px] m-0 mb-[18px] text-[#6f6a63] text-[13px] leading-[1.85]">
              You have full ownership of your data at all times. You can inspect, update, or permanently delete your account records with a single request.
            </p>

            <div className="mt-[30px] text-[10px] font-bold tracking-[0.15em] uppercase font-mono text-[#171717]">
              BINGOOO / PRIVACY CHARTER / EST. 2026 / INDIA
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           NUMBERS / METRICS STRIP
      ======================================================= */}
      <section className="pb-[110px]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#ddd3c5]">
            <div className="p-[35px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                256-BIT
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                SSL Bank-Grade Encryption
              </div>
            </div>

            <div className="p-[35px_25px] border-b sm:border-b-0 lg:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                0%
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Raw Card Details Stored
              </div>
            </div>

            <div className="p-[35px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                100%
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Artwork IP Belongs To You
              </div>
            </div>

            <div className="p-[35px_25px]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em] text-[#e6321c]">
                YOU
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Full Right To Erasure
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           OUR VALUES / CORE PRINCIPLES
      ======================================================= */}
      <section className="py-[100px] bg-[#ede0cc]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[45px] gap-4">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2">
                OUR THREE PILLARS
              </div>

              <h2 className="m-0 text-[clamp(40px,5vw,68px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase">
                HOW WE<br />
                GUARD YOU.
              </h2>
            </div>

            <p className="max-w-[330px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
              Three clear commitments govern how we collect, store, and secure your personal data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#ddd3c5]">
            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  01
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Encrypted Payments
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                We use Razorpay PCI-DSS Level 1 certified gateways. BINGOOO never handles, logs, or stores your credit/debit card numbers or netbanking passwords.
              </p>
            </article>

            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  02
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Custom Studio Vault
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                Artwork and typography uploaded to our 3D Customizer Studio remain strictly confidential. Your designs are used solely to produce your custom piece.
              </p>
            </article>

            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  03
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Zero Data Brokering
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                We never monetize your identity. We do not sell, license, or rent your email or phone number to data aggregators or third-party marketing networks.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =======================================================
           CUSTOM ATELIER SPLIT BANNER
      ======================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[550px] lg:min-h-[600px]">
        <div className="min-h-[380px] lg:min-h-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1500&q=90"
            alt="Bingooo studio intellectual property"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="flex flex-col justify-center p-[45px_24px] sm:p-[clamp(45px,7vw,100px)] bg-[#171717] text-white">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#e6321c] mb-3">
            INTELLECTUAL PROPERTY & UPLOADS
          </div>

          <h2 className="my-3 mb-5 text-[clamp(40px,5vw,70px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-white">
            YOUR ARTWORK.<br />
            YOUR RIGHTS.
          </h2>

          <p className="max-w-[410px] m-0 mb-[30px] text-[#aaa7a1] text-[12px] leading-[1.8]">
            When you upload illustrations, band logos, or custom text to our 3D Studio, you retain 100% of your copyright. We do not exhibit or reproduce your graphics on public collections without your written consent.
          </p>

          <div>
            <Link
              to="/customize"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#e6321c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b91f12] hover:-translate-y-0.5 transition-all"
            >
              EXPLORE 3D STUDIO →
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           DETAILED LEGAL CLAUSES (Editorial Typography)
      ======================================================= */}
      <section className="py-[100px] sm:py-[120px]">
        <div className="container-bingooo max-w-[1000px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              LEGAL CLAUSES
            </div>
            <h2 className="my-2.5 text-[clamp(35px,5vw,65px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase">
              POLICY SPECIFICATIONS
            </h2>
            <p className="text-[11px] font-mono text-[#6f6a63] mt-3">
              Last Updated: September 2026 • Compliant with DPDPA 2023 & IT Act India
            </p>
          </div>

          <div className="divide-y divide-[#ddd3c5] border-t border-b border-[#ddd3c5]">
            {/* Clause 1 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                01. DATA WE COLLECT
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  <strong className="text-[#171717]">Identity & Contact:</strong> Full name, verified mobile number, email address, and doorstep shipping location for courier transit across India.
                </p>
                <p>
                  <strong className="text-[#171717]">Order Records:</strong> Items purchased, size selections, billing amounts, order timestamps, and invoice records for warranty and accounting.
                </p>
                <p>
                  <strong className="text-[#171717]">Studio Uploads:</strong> High-resolution artwork files, image dimensions, and text customization coordinates configured in our 3D garment creator.
                </p>
              </div>
            </article>

            {/* Clause 2 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                02. PURPOSE & USE
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  We utilize your collected records strictly for:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Processing, tailoring, packaging, and dispatching your garments from our Srikakulam atelier.</li>
                  <li>Transmitting automated shipment tracking updates via SMS and WhatsApp.</li>
                  <li>Facilitating doorstep size exchanges, reverse pickups, and refund processing.</li>
                  <li>Complying with Goods & Services Tax (GST) invoicing rules under Indian taxation laws.</li>
                </ul>
              </div>
            </article>

            {/* Clause 3 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                03. PAYMENT INTEGRITY
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  All digital payments (UPI, Credit Cards, Debit Cards, Net Banking) are conducted through certified PCI-DSS Level 1 compliant gateway partners (Razorpay).
                </p>
                <p>
                  Your banking passwords, UPI PINs, CVV codes, and credit card numbers are processed directly within encrypted provider tokens. BINGOOO servers never touch or record your payment credentials.
                </p>
              </div>
            </article>

            {/* Clause 4 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                04. COOKIES & SESSIONS
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  We use strictly essential cookies and local storage tokens to retain your active shopping bag, preserve wishlist selections, and keep you securely signed in to your account.
                </p>
                <p>
                  We do not deploy intrusive cross-site ad tracking pixels that follow you across the internet.
                </p>
              </div>
            </article>

            {/* Clause 5 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                05. RETENTION & ERASURE
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  Your profile and custom designs remain preserved in your account for easy reorders. You have the absolute right to request complete data erasure.
                </p>
                <p>
                  Upon receiving your deletion request, all account credentials and uploaded graphics are permanently scrubbed from our active databases within 7 business days, excluding statutory tax records required by Indian law.
                </p>
              </div>
            </article>

            {/* Clause 6 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                06. YOUR RIGHTS (DPDPA 2023)
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  Under the Digital Personal Data Protection Act (DPDPA 2023), you hold the right to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Request a portable summary of all personal data held by BINGOOO.</li>
                  <li>Correct any inaccurate contact numbers or shipping addresses.</li>
                  <li>Withdraw consent for marketing newsletters at any time via a single click.</li>
                  <li>File an inquiry with our designated Grievance Officer in Andhra Pradesh.</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =======================================================
           MANIFESTO BANNER (Matching AboutPage Style)
      ======================================================= */}
      <section className="py-[110px] px-5 bg-[#f7eedb] border-t border-[#ddd3c5]">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
            THE BINGOOO PRIVACY CHARTER
          </div>

          <h2 className="my-2.5 mb-[35px] text-[clamp(42px,6vw,80px)] leading-[0.9] font-extrabold tracking-[-0.07em] uppercase">
            INTEGRITY IN<br />
            <span className="text-[#e6321c]">EVERY</span><br />
            THREAD.
          </h2>

          <p className="max-w-[650px] mx-auto text-[#6f6a63] text-[13px] leading-[1.8]">
            Trust isn't an afterthought or fine print. It is the bedrock of our relationship with you. We protect your privacy with the same uncompromising standard we hold for every single stitch.
          </p>
        </div>
      </section>

      {/* =======================================================
           FINAL CTA (Red Full-Width Banner Matching AboutPage)
      ======================================================= */}
      <section className="py-[100px] px-5 bg-[#e6321c] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-2">
          NEED ASSISTANCE?
        </div>

        <h2 className="my-2 mb-[25px] text-[clamp(45px,7vw,90px)] leading-[0.85] font-extrabold tracking-[-0.07em] uppercase text-white">
          HAVE A QUESTION<br />
          ABOUT YOUR PRIVACY?
        </h2>

        <p className="max-w-[480px] mx-auto mb-[30px] text-white/90 text-[12px] leading-[1.7]">
          Our dedicated data concierge and grievance desk in Srikakulam are here to assist with any access, update or erasure requests.
        </p>

        <Link
          to="/contact"
          onClick={() => triggerHaptic('medium')}
          className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all"
        >
          TALK TO OUR PRIVACY CONCIERGE →
        </Link>
      </section>
    </main>
  );
}

export default PrivacyPolicyPage;
