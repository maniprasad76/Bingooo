import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

export function TermsPage() {
  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased">
      <SEO
        title="Terms of Service — BINGOOO"
        description="Review the terms and conditions governing apparel purchases, custom printing atelier guidelines, and website usage at Bingooo."
        canonical="https://bingooo.in/terms"
        ogImage="/terms-hero.jpg"
      />

      {/* =======================================================
           HERO SECTION (Matching AboutPage & HomePage Layout)
      ======================================================= */}
      <section className="min-h-[600px] lg:min-h-[650px] grid grid-cols-1 lg:grid-cols-[45%_55%] bg-[#f7eedb]">
        <div className="flex flex-col justify-center py-[65px] px-6 sm:px-10 lg:py-[clamp(50px,8vw,110px)] lg:px-[clamp(25px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-3">
            BINGOOO / TERMS OF SERVICE
          </div>

          <h1 className="my-3 mb-6 text-[clamp(52px,7vw,105px)] font-extrabold leading-[0.84] tracking-[-0.075em] uppercase">
            <span className="block">HONEST TERMS.</span>
            <span className="block">MUTUAL RESPECT.</span>
            <span className="block text-[#e6321c]">ATELIER CODE.</span>
          </h1>

          <p className="max-w-[440px] m-0 mb-[30px] text-[#6f6a63] text-[13px] leading-[1.8]">
            Clear, transparent standards governing your custom garments, doorstep deliveries, intellectual property, and your relationship with Bingooo.
          </p>

          <div>
            <a
              href="#terms-clauses"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              READ TERMS ↓
            </a>
          </div>
        </div>

        <div className="h-[400px] sm:h-[500px] lg:h-auto overflow-hidden bg-[#ede0cc]">
          <img
            src="/terms-hero.jpg"
            alt="Bingooo Terms & Conditions"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT BANNER (Dark Full-Width Punchline)
      ======================================================= */}
      <section className="py-[clamp(75px,10vw,145px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-4">
          OUR CODE OF CONDUCT
        </div>

        <h2 className="max-w-[1000px] mx-auto m-0 text-[clamp(40px,7vw,88px)] leading-[0.9] font-extrabold tracking-[-0.07em] uppercase text-white">
          CRAFTED WITH <span className="text-[#e6321c]">INTEGRITY.</span><br />
          TAILORED WITH <span className="text-[#e6321c]">PASSION.</span><br />
          GOVERNED BY TRUST.
        </h2>
      </section>

      {/* =======================================================
           CORE PILLARS (Three Highlights on Beige Canvas)
      ======================================================= */}
      <section className="py-[100px] bg-[#ede0cc]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[45px] gap-4">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2">
                CORE PRINCIPLES
              </div>

              <h2 className="m-0 text-[clamp(40px,5vw,68px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase">
                THE THREE<br />
                STANDARDS.
              </h2>
            </div>

            <p className="max-w-[330px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
              Three foundational rules protecting your purchases, your custom creations, and our textile atelier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#ddd3c5]">
            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  01
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Authentic 240+ GSM
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                Every item is manufactured with certified 240+ GSM heavyweight combed cotton, custom double-stitched collars, and archival DTF print finishes.
              </p>
            </article>

            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  02
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Artwork Ownership
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                You retain 100% intellectual property rights to all custom graphics uploaded in our studio. We print on-demand solely for your private order.
              </p>
            </article>

            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  03
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Indian Jurisdiction
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                All transactions, GST invoicing, doorstep return pickups, and payment settlements are governed under the laws of the Republic of India and Srikakulam.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =======================================================
           CUSTOM STUDIO CLAUSE SPLIT BANNER
      ======================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[550px] lg:min-h-[600px]">
        <div className="min-h-[380px] lg:min-h-full overflow-hidden">
          <img
            src="/custom-studio.jpg"
            alt="Bingooo Custom Studio workshop"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="flex flex-col justify-center p-[45px_24px] sm:p-[clamp(45px,7vw,100px)] bg-[#171717] text-white">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#e6321c] mb-3">
            ON-DEMAND CUSTOM PRINTING
          </div>

          <h2 className="my-3 mb-5 text-[clamp(40px,5vw,70px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-white">
            YOUR DESIGNS.<br />
            OUR CANVAS.
          </h2>

          <p className="max-w-[410px] m-0 mb-[30px] text-[#aaa7a1] text-[12px] leading-[1.8]">
            When you create custom garments in our atelier studio, you represent that you hold the legal copyright or license to the design. We strictly prohibit hateful, infringing, or defamatory imagery.
          </p>

          <div>
            <Link
              to="/customize"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#e6321c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b91f12] hover:-translate-y-0.5 transition-all"
            >
              CUSTOM STUDIO GUIDELINES →
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           DETAILED TERMS CLAUSES (Editorial Typography)
      ======================================================= */}
      <section className="py-[100px] sm:py-[120px]" id="terms-clauses">
        <div className="container-bingooo max-w-[1000px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              LEGAL SPECIFICATIONS
            </div>
            <h2 className="my-2.5 text-[clamp(35px,5vw,65px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase">
              TERMS OF SERVICE
            </h2>
            <p className="text-[11px] font-mono text-[#6f6a63] mt-3">
              Effective Date: September 2026 • Governing Law: Andhra Pradesh, India
            </p>
          </div>

          <div className="divide-y divide-[#ddd3c5] border-t border-b border-[#ddd3c5]">
            {/* Clause 1 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                01. ACCEPTANCE & SCOPE
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  By accessing, browsing, registering on, or purchasing from <strong className="text-[#171717]">Bingooo Men&apos;s Wear</strong> (bingooo.in), you agree to be bound by these Terms of Service, along with our Privacy Policy, Shipping Policy, and Cancellation Guidelines.
                </p>
                <p>
                  If you do not agree with any provision stated herein, please refrain from transacting on this platform. We reserve the right to revise terms periodically in alignment with statutory updates.
                </p>
              </div>
            </article>

            {/* Clause 2 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                02. ACCOUNT INTEGRITY
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  You are solely responsible for maintaining the confidentiality of your account credentials, password, and session access on your devices.
                </p>
                <p>
                  Bingooo cannot be held liable for unauthorized orders or actions occurring through accounts where user-side credentials were compromised or shared.
                </p>
              </div>
            </article>

            {/* Clause 3 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                03. PRICING & GST COMPLIANCE
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  All prices displayed on the storefront are quoted in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST).
                </p>
                <p>
                  For Cash on Delivery (COD) orders, a nominal ₹79 partial advance commitment may be required to confirm courier dispatch and prevent fraudulent or prank addresses.
                </p>
              </div>
            </article>

            {/* Clause 4 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                04. CUSTOM ATELIER PRINTING
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  Our 3D Customizer Lab produces bespoke garments tailored to your specifications. Due to the permanent nature of textile printing, custom pieces cannot be cancelled once heat-press curing begins.
                </p>
                <p>
                  Customers must ensure artwork resolution is high (minimum 300 DPI recommended). Slight visual color variations between digital monitor displays and physical fabric ink absorption fall within acceptable craft tolerances.
                </p>
              </div>
            </article>

            {/* Clause 5 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                05. SHIPPING & FULFILLMENT
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  Standard catalog garments are dispatched within 24 to 48 hours from our Srikakulam atelier. Custom pieces require an additional 1 to 2 business days for curation and curing.
                </p>
                <p>
                  Deliveries are managed through licensed express courier partners (Blue Dart, Delhivery, DTDC). Estimated transit times range from 3 to 6 business days depending on delivery pincodes across India.
                </p>
              </div>
            </article>

            {/* Clause 6 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                06. 7-DAY DOORSTEP EXCHANGES
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  We offer hassle-free 7-day doorstep size exchanges for all standard catalog garments. Returned apparel must be unworn, unwashed, and retained with original tags and protective packaging.
                </p>
                <p>
                  Defective or damaged items reported within 48 hours of delivery receive an immediate complimentary replacement without charge.
                </p>
              </div>
            </article>

            {/* Clause 7 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                07. JURISDICTION & GOVERNING LAW
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  These Terms are interpreted under the laws of the Republic of India. Any legal dispute, arbitration, or statutory claim shall fall under the exclusive jurisdiction of the competent courts in Srikakulam, Andhra Pradesh.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =======================================================
           FINAL CTA (Red Full-Width Banner Matching AboutPage)
      ======================================================= */}
      <section className="py-[100px] px-5 bg-[#e6321c] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-2">
          NEED LEGAL OR ATELIER CLARIFICATION?
        </div>

        <h2 className="my-2 mb-[25px] text-[clamp(45px,7vw,90px)] leading-[0.85] font-extrabold tracking-[-0.07em] uppercase text-white">
          HAVE A QUESTION<br />
          ABOUT OUR TERMS?
        </h2>

        <p className="max-w-[480px] mx-auto mb-[30px] text-white/90 text-[12px] leading-[1.7]">
          Our customer care and grievance officers in Srikakulam are here to address your order inquiries, custom artwork representations, and store guidelines.
        </p>

        <Link
          to="/contact"
          onClick={() => triggerHaptic('medium')}
          className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all"
        >
          CONTACT STORE CONCIERGE →
        </Link>
      </section>
    </main>
  );
}

export default TermsPage;
