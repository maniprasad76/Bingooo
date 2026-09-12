import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';

const RETURN_STEPS = [
  {
    step: '01',
    title: 'Lodge Request in 7 Days',
    desc: 'Go to Account > Orders and tap "Exchange Size", or drop a quick note to our WhatsApp concierge desk.',
  },
  {
    step: '02',
    title: 'Doorstep Courier Pickup',
    desc: 'Our logistics courier arrives at your location within 24 to 48 hours to collect the packed item with tags intact.',
  },
  {
    step: '03',
    title: 'Rapid Replacement',
    desc: 'Your fresh size is dispatched from our Srikakulam atelier immediately, or your refund is initiated within 24 hours.',
  },
];

export function ReturnsRefundsPage() {
  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased">
      <SEO
        title="Returns & Refunds Policy — BINGOOO"
        description="Learn about Bingooo's hassle-free 7-day doorstep size exchange policy, reverse courier pickups, and rapid refund timelines across India."
        canonical="https://bingooo.in/returns-refunds"
      />

      {/* =======================================================
           HERO SECTION (Matching AboutPage & HomePage Layout)
      ======================================================= */}
      <section className="min-h-[600px] lg:min-h-[650px] grid grid-cols-1 lg:grid-cols-[45%_55%] bg-[#f7eedb]">
        <div className="flex flex-col justify-center py-[65px] px-6 sm:px-10 lg:py-[clamp(50px,8vw,110px)] lg:px-[clamp(25px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-3 font-mono">
            BINGOOO / RETURNS & EXCHANGES
          </div>

          <h1 className="my-3 mb-6 text-[clamp(52px,7vw,105px)] font-extrabold leading-[0.84] tracking-[-0.075em] uppercase">
            <span className="block">PERFECT FIT.</span>
            <span className="block">DOORSTEP PICKUP.</span>
            <span className="block text-[#e6321c]">ZERO HASSLE.</span>
          </h1>

          <p className="max-w-[440px] m-0 mb-[30px] text-[#6f6a63] text-[13px] leading-[1.8]">
            We stand unreservedly behind our heavyweight menswear. If the size or fit isn't right, our doorstep reverse courier network takes care of everything.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#exchange-process"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              HOW EXCHANGES WORK ↓
            </a>

            <Link
              to="/account/orders"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] border border-[#171717] text-[#171717] text-[10px] font-bold uppercase tracking-wider hover:bg-[#171717] hover:text-white hover:-translate-y-0.5 transition-all"
            >
              MANAGE MY ORDERS →
            </Link>
          </div>
        </div>

        <div className="h-[400px] sm:h-[500px] lg:h-auto overflow-hidden bg-[#252525]">
          <img
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo returns and exchanges"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT BANNER (Dark Full-Width Punchline)
      ======================================================= */}
      <section className="py-[clamp(75px,10vw,145px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-4 font-mono">
          OUR FIT GUARANTEE
        </div>

        <h2 className="max-w-[1000px] mx-auto m-0 text-[clamp(40px,7vw,88px)] leading-[0.9] font-extrabold tracking-[-0.07em] uppercase text-white">
          CLOTHES MUST FEEL <span className="text-[#e6321c]">RIGHT.</span><br />
          NOT TOO TIGHT. NOT TOO LOOSE.<br />
          <span className="text-[#e6321c]">7 DAYS. AT YOUR DOORSTEP.</span>
        </h2>
      </section>

      {/* =======================================================
           THREE-STEP REVERSE PROCESS (Beige Canvas Grid)
      ======================================================= */}
      <section className="py-[100px] bg-[#ede0cc]" id="exchange-process">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[45px] gap-4">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2 font-mono">
                THE PROCESS
              </div>

              <h2 className="m-0 text-[clamp(40px,5vw,68px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase">
                THREE SIMPLE<br />
                STEPS.
              </h2>
            </div>

            <p className="max-w-[330px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
              We arrange reverse courier transit straight from your address across India. No post office queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#ddd3c5]">
            {RETURN_STEPS.map((step) => (
              <article key={step.step} className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
                <div>
                  <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                    STEP {step.step}
                  </div>
                  <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase text-[#171717]">
                    {step.title}
                  </h3>
                </div>
                <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
           METRICS STRIP (Numbers Matching AboutPage)
      ======================================================= */}
      <section className="py-[70px] sm:py-[100px]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#ddd3c5]">
            <div className="p-[35px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                7 DAYS
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Doorstep Size Exchange Window
              </div>
            </div>

            <div className="p-[35px_25px] border-b sm:border-b-0 lg:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                24-48H
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Reverse Courier Pickup Arrival
              </div>
            </div>

            <div className="p-[35px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em] text-[#e6321c]">
                100%
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Flawless Defect Guarantee
              </div>
            </div>

            <div className="p-[35px_25px]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                24H
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Rapid UPI & Source Refund Payout
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           CUSTOM APPAREL CLAUSE SPLIT BANNER
      ======================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[550px] lg:min-h-[600px]">
        <div className="min-h-[380px] lg:min-h-full overflow-hidden bg-[#252525]">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=90"
            alt="Bingooo custom apparel guarantee"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="flex flex-col justify-center p-[45px_24px] sm:p-[clamp(45px,7vw,100px)] bg-[#171717] text-white">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#e6321c] mb-3 font-mono">
            ON-DEMAND CUSTOM PIECES
          </div>

          <h2 className="my-3 mb-5 text-[clamp(40px,5vw,70px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-white">
            CUSTOMIZED TO FIT.<br />
            GUARANTEED IN PRINT.
          </h2>

          <p className="max-w-[410px] m-0 mb-[30px] text-[#aaa7a1] text-[12px] leading-[1.8]">
            Because customized garments are tailored and heat-cured specifically for you, they cannot be exchanged for a subjective change of mind. However, if any custom piece arrives flawed, misprinted, or defective, we reprint it free or refund you 100% immediately.
          </p>

          <div>
            <Link
              to="/artwork-guidelines"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#e6321c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b91f12] hover:-translate-y-0.5 transition-all"
            >
              ARTWORK GUIDELINES →
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           DETAILED POLICY CLAUSES (Editorial Typography)
      ======================================================= */}
      <section className="py-[100px] sm:py-[120px]">
        <div className="container-bingooo max-w-[1000px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5 font-mono">
              POLICY CLAUSES
            </div>
            <h2 className="my-2.5 text-[clamp(35px,5vw,65px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase">
              EXCHANGE & REFUND TERMS
            </h2>
            <p className="text-[11px] font-mono text-[#6f6a63] mt-3">
              Last Updated: September 2026 • Governed under Consumer Protection Act (India)
            </p>
          </div>

          <div className="divide-y divide-[#ddd3c5] border-t border-b border-[#ddd3c5]">
            {/* Clause 1 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                01. ELIGIBILITY CRITERIA
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  To be eligible for an exchange or return:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Garments must be unworn, unwashed, unaltered, and free from perfume, deodorant stains, or smoke.</li>
                  <li>Original brand neck tags, wash care tags, and poly packaging must be preserved and returned intact.</li>
                  <li>The exchange request must be initiated within <strong className="text-[#171717]">7 calendar days</strong> of confirmed courier delivery.</li>
                </ul>
              </div>
            </article>

            {/* Clause 2 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                02. DOORSTEP COURIER PICKUP
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  We coordinate with Blue Dart, Delhivery, and DTDC to execute reverse doorstep pickups across 19,000+ Indian pincodes.
                </p>
                <p>
                  A courier executive will attempt pickup up to 2 times. Please keep the garment securely wrapped in its original packaging along with the exchange slip.
                </p>
              </div>
            </article>

            {/* Clause 3 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                03. REFUND MODES & TIMELINES
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  <strong className="text-[#171717]">Prepaid Orders (Cards, Net Banking, UPI):</strong> Refunds are credited directly back to the originating bank account or card via Razorpay within 3 to 5 business days.
                </p>
                <p>
                  <strong className="text-[#171717]">Cash on Delivery (COD) Orders:</strong> Once reverse pickup verification occurs, a secure automated payout link is sent via WhatsApp and SMS to deposit the full amount into your verified UPI VPA within 24 hours.
                </p>
              </div>
            </article>

            {/* Clause 4 */}
            <article className="py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
              <div className="font-mono text-[11px] font-bold uppercase text-[#171717] tracking-wider">
                04. DEFECTIVE & DAMAGED PIECES
              </div>
              <div className="space-y-3 text-[13px] leading-[1.8] text-[#6f6a63]">
                <p>
                  If an order arrives with incorrect sizing, damaged stitching, or printing defects, notify our atelier desk within 48 hours of delivery.
                </p>
                <p>
                  We arrange priority collection and send an immediate replacement or issue a 100% full refund with zero deductions.
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
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-2 font-mono">
          DOORSTEP CONCIERGE DESK
        </div>

        <h2 className="my-2 mb-[25px] text-[clamp(45px,7vw,90px)] leading-[0.85] font-extrabold tracking-[-0.07em] uppercase text-white">
          NEED AN EXCHANGE<br />
          OR RAPID REFUND?
        </h2>

        <p className="max-w-[480px] mx-auto mb-[30px] text-white/90 text-[12px] leading-[1.7]">
          Message our tailors directly on WhatsApp. We schedule your doorstep reverse pickup and confirm your replacement in real time.
        </p>

        <a
          href={getWhatsAppUrl('Hi Bingooo, I would like to arrange an exchange or return for my order.')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('medium')}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-[25px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all"
        >
          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          <span>SCHEDULE VIA WHATSAPP →</span>
        </a>
      </section>
    </main>
  );
}

export default ReturnsRefundsPage;
