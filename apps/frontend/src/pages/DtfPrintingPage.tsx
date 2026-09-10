import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Palette,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

const STEPS = [
  {
    num: '01',
    title: 'High-Res Digital Pigment Printing',
    desc: 'Artwork is converted with professional RIP software and printed onto specialized matte PET release film at 1440 DPI using water-based Japanese textile inks.',
    badge: '1440 DPI CMYK+W',
  },
  {
    num: '02',
    title: 'Hot-Melt Adhesive Powdering',
    desc: 'Uniform polyurethane thermo-adhesive powder is electrostatically distributed across wet ink zones, ensuring maximum mechanical bonding without stiffening the shirt.',
    badge: 'Polyurethane Blend',
  },
  {
    num: '03',
    title: 'Infrared Thermal Curing',
    desc: 'The film moves through a controlled 160°C radiant heat conveyor tunnel, polymerizing ink and fusing adhesive into a flexible, stretchable graphic membrane.',
    badge: '160°C Precision Heat',
  },
  {
    num: '04',
    title: 'Pneumatic Pressure Heat Transfer',
    desc: 'Under 5 bars of pneumatic pressure at 155°C, the cured membrane is fused deeply into the fibers of our 240+ GSM combed cotton blank.',
    badge: '5 Bar Pneumatic Press',
  },
  {
    num: '05',
    title: 'Cold Peel & Matte Seal Press',
    desc: 'After cooling down to lock print elasticity, film is peeled and a secondary finishing pass is pressed with parchment for an ultra-soft, breathable, luxury texture.',
    badge: 'Buttery Hand-Feel',
  },
];

const COMPARISON = [
  {
    feature: 'Color Limits & Gradients',
    dtf: 'Unlimited colors & ultra-fine photorealistic gradients',
    screen: 'Limited to 4–6 flat spot colors; expensive per screen',
    dtg: 'Full color, but weak vibrancy on dark heavyweight fabrics',
    vinyl: 'Solid colors only; cannot reproduce gradients or photos',
  },
  {
    feature: 'Print Durability (Wash Test)',
    dtf: '50+ washes with zero cracking, peeling, or fading',
    screen: '40+ washes; prone to cracking over time if cured unevenly',
    dtg: '20–30 washes; noticeable color fading after 15 washes',
    vinyl: '15–20 washes; edges inevitably peel and curl',
  },
  {
    feature: 'Fabric Compatibility',
    dtf: '100% Cotton, Poly-Blends, Heavyweight Fleece, Denim',
    screen: 'Cotton and blends (requires ink reformulation for synthetics)',
    dtg: 'Strictly 100% cotton (fails on synthetics & dense loopknit)',
    vinyl: 'Limited to flat smooth fabrics; feels like thick plastic',
  },
  {
    feature: 'Minimum Order Quantity',
    dtf: '1 piece (Order just 1 custom tee or 1,000+ units)',
    screen: 'High MOQs (typically 50–100 pieces minimum)',
    dtg: '1 piece, but high consumable and machine overhead',
    vinyl: '1 piece, but weeded by hand with high labor cost',
  },
  {
    feature: 'Hand-Feel & Breathability',
    dtf: 'Ultra-thin, soft, stretchable membrane that moves with garment',
    screen: 'Heavy plastic rubber hand-feel (plastisol)',
    dtg: 'Very soft, but ink absorbs deeply into dark fabric',
    vinyl: 'Heavy, rubbery shield that blocks airflow and traps sweat',
  },
];

export function DtfPrintingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Industrial DTF Printing Services"
        description="Discover Bingooo's advanced Direct-To-Film (DTF) apparel printing process. 1440 DPI Japanese pigment inks, 50+ wash durability, and buttery soft hand-feel on 240 GSM cotton."
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 space-y-14">
        {/* ─── Breadcrumb & Hero Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-10">
          <Breadcrumbs
            items={[
              { name: 'Custom Studio', url: '/customize' },
              { name: 'DTF Printing', url: '/dtf-printing' },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6321C]/10 text-[#E6321C] text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles size={13} /> Industrial Direct-to-Film (DTF)
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading uppercase leading-none">
                TEXTILE PRINTING RE-ENGINEERED FOR STREETWEAR
              </h1>
              <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed max-w-2xl">
                At our Srikakulam Atelier, we use precision multi-head Japanese DTF printers paired with water-based pigment inks and stretchable hot-melt adhesives. The result is razor-sharp detail, deep blacks, and a buttery soft finish that lasts 50+ washes.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/customize"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Sparkles size={15} />
                  <span>Launch 3D Design Studio</span>
                </Link>
                <Link
                  to="/artwork-guidelines"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] text-[#171717] text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
                >
                  <span>Read Artwork Guidelines</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-4 w-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mx-auto">
                  <Palette size={28} />
                </div>
                <div>
                  <span className="text-2xl font-black font-heading text-[#171717]">1440 DPI</span>
                  <p className="text-xs text-[#6F6A63] mt-1 font-mono uppercase">Photographic Color Fidelity</p>
                </div>
                <div className="pt-3 border-t border-[#DDD3C5]/60 grid grid-cols-2 gap-2 text-left text-xs">
                  <div>
                    <span className="text-[#6F6A63] text-[10px] block uppercase font-mono">Wash Durability</span>
                    <strong className="text-[#171717]">50+ Cycles</strong>
                  </div>
                  <div>
                    <span className="text-[#6F6A63] text-[10px] block uppercase font-mono">Minimum Order</span>
                    <strong className="text-[#E6321C]">No Minimum (1 pc)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 5-Step Process Section ─── */}
        <div className="space-y-8">
          <div className="text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6321C] font-mono">
              THE ATELIER WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-heading text-[#171717]">
              How Your Custom Apparel is Produced
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6A63] max-w-xl">
              From vector graphic conversion to pressurized pneumatic fusing, here is the exact science behind every print.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                className="p-6 rounded-2xl bg-white border border-[#DDD3C5] shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-[#E6321C]">{step.num}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F7EEDB] border border-[#DDD3C5] text-[10px] font-mono font-bold text-[#171717]">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-heading uppercase text-[#171717] leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#6F6A63] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA Box in the 6th slot */}
            <div className="p-6 rounded-2xl bg-[#171717] text-white flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#DDD3C5]/60">Start Creating</span>
                <h3 className="text-lg font-black font-heading uppercase text-white">
                  Ready to print your artwork?
                </h3>
                <p className="text-xs text-[#DDD3C5]/70 leading-relaxed">
                  Upload your vector or high-res PNG in our interactive 3D studio, preview live on oversized blanks, and order in minutes.
                </p>
              </div>
              <Link
                to="/customize"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors"
              >
                <span>Open 3D Studio</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Technology Comparison Table ─── */}
        <div className="space-y-6">
          <div className="text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6321C] font-mono">
              UNCOMPROMISING QUALITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-heading text-[#171717]">
              DTF Printing vs. Traditional Methods
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DDD3C5] bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7EEDB] border-b border-[#DDD3C5] font-heading font-extrabold uppercase text-[#171717]">
                  <th className="p-4 sm:p-5 w-1/5">Specification</th>
                  <th className="p-4 sm:p-5 w-1/4 text-[#E6321C] bg-[#FDF0EE]/80">Bingooo DTF</th>
                  <th className="p-4 sm:p-5 w-1/5">Screen Printing</th>
                  <th className="p-4 sm:p-5 w-1/5">Direct-to-Garment</th>
                  <th className="p-4 sm:p-5 w-1/5">Vinyl Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD3C5]/60">
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#171717] font-heading uppercase text-[11px]">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 font-semibold text-[#171717] bg-[#FDF0EE]/30">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 size={14} className="text-[#E6321C] shrink-0 mt-0.5" />
                        <span>{row.dtf}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-[#6F6A63]">{row.screen}</td>
                    <td className="p-4 sm:p-5 text-[#6F6A63]">{row.dtg}</td>
                    <td className="p-4 sm:p-5 text-[#6F6A63]">{row.vinyl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Garment Care Guide ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F7EEDB] border border-[#DDD3C5] space-y-4">
          <h3 className="text-base font-bold uppercase font-heading text-[#171717] flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#E6321C]" />
            <span>How to Care for Your DTF Printed Apparel</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#6F6A63]">
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD3C5] space-y-1">
              <strong className="text-[#171717] block font-heading uppercase text-[11px]">Wash Inside Out</strong>
              <span>Always turn garment inside out before washing in cold or lukewarm water (max 30°C).</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD3C5] space-y-1">
              <strong className="text-[#171717] block font-heading uppercase text-[11px]">Do Not Iron Print</strong>
              <span>Never iron directly over the graphic. Iron on reverse or place a cloth over the design.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#DDD3C5] space-y-1">
              <strong className="text-[#171717] block font-heading uppercase text-[11px]">Dry in Shade</strong>
              <span>Air dry in shade or low tumble dry. Avoid high-heat commercial dryers and chemical bleach.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
