import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';

const FABRICS = [
  {
    name: '240 GSM Combed Ring-Spun Cotton',
    silhouette: 'Signature Boxy Oversized Tees',
    badge: 'Standard Streetwear Weight',
    composition: '100% Super-Combed Cotton (24s Ring-Spun)',
    weave: 'Single Jersey Knit, High-Gauge Compacted',
    finishing: 'Enzymatic Bio-Washing + Silicon Emulsion Wash',
    features: [
      'Heavyweight drape that creates the signature street boxy cut without clinging',
      'Ultra-dense 1.25" ribbed collar with lycra core that never sags or bacon-curls',
      'Double-needle lockstitched sleeves and bottom hem for rip resistance',
      'Zero color fading after repeated cycles with reactive dyeing fixation',
    ],
  },
  {
    name: '280 GSM Double-Faced Interlock Cotton',
    silhouette: 'Architectural Boxy Heavy Drop',
    badge: 'Ultra-Heavyweight Luxury',
    composition: '100% Long-Staple Ring-Spun Cotton (20s Count)',
    weave: 'Double-Faced Interlock Knit (Smooth on both sides)',
    finishing: 'Thermal Mercerization + Carbon Peach Softening',
    features: [
      'Rigid architectural structure that holds bold geometric silhouettes',
      'Completely opaque with zero show-through in white or light tints',
      'Smooth interior and exterior surface optimal for high-density DTF graphics',
      'Tested for extreme abrasion resistance and zero surface pilling',
    ],
  },
  {
    name: '360–380 GSM Heavy French Terry Loopknit',
    silhouette: 'Winter Hoodies, Sweatshirts & Heavy Fleece',
    badge: 'Cold-Climate Atelier Fleece',
    composition: '80% Combed Cotton / 20% High-Tenacity Polyester Core',
    weave: '3-Thread Diagonal French Terry Loop Interior',
    finishing: 'Pre-Shrunk Stenter Heat-Set + Anti-Lint Brushing',
    features: [
      'Dense loopknit interior traps warm air without shedding fuzzy lint onto shirts',
      'Polyester core maintains tensile shape and prevents elbow ballooning',
      '450 GSM ultra-heavy 2x2 ribbed cuffs and waistband for snug wind sealing',
      'Double-layer self-fabric hood that stands up structured on its own',
    ],
  },
  {
    name: '210 GSM Honeycomb Waffle Weave',
    silhouette: 'Resort & Camp-Collar Open Shirts',
    badge: 'Textured Breathable Knit',
    composition: '100% Combed Cotton Knit',
    weave: '3D Waffle Thermal Honeycomb Architecture',
    finishing: 'Garment Enzyme Soft-Dyeing',
    features: [
      'Elevated waffle ridges lift fabric off skin to create passive micro-ventilation',
      'High absorption capacity with ultra-fast evaporation for hot tropical climates',
      'Subtle organic stretch and drape that moves effortlessly with the body',
      'Horn-effect button placket reinforced with woven cotton interlining',
    ],
  },
];

const METRICS = [
  {
    title: 'Pre-Shrunk Guarantee',
    value: '< 2.0%',
    desc: 'Max dimensional shrinkage after 25 home wash cycles thanks to tensionless stenter drying.',
  },
  {
    title: 'Colorfastness Rating',
    value: 'Grade 4.5 / 5',
    desc: 'Tested under ISO 105-C06 standard for washing with zero bleeding onto whites.',
  },
  {
    title: 'Pilling Resistance',
    value: 'Grade 4+',
    desc: 'Martindale abrasion tested up to 20,000 cycles with enzymatic bio-polishing.',
  },
  {
    title: 'Collar Resilience',
    value: '50+ Washes',
    desc: 'Spun-lycra reinforcement prevents stretching, rippling, or neck deformation.',
  },
];

export function FabricGuidePage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Fabric Specifications & Textile Engineering"
        description="Comprehensive technical fabric specifications for Bingooo apparel: 240 GSM combed cotton, 380 GSM French terry, yarn counts, and laboratory quality benchmarks."
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 space-y-14">
        {/* ─── Breadcrumb & Hero Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Custom Studio</span>
            <span>/</span>
            <span className="text-[#171717]">Fabric Specifications</span>
          </nav>

          <div className="space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6321C]/10 text-[#E6321C] text-xs font-mono font-bold uppercase tracking-wider">
              <Layers size={13} /> Srikakulam Atelier Textile Standards
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading uppercase leading-none">
              TEXTILE ENGINEERING & FABRIC SPECIFICATIONS
            </h1>
            <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed">
              We never use generic thin blanks. Every Bingooo garment begins with custom-milled long-staple yarns, calibrated fabric weights from 240 to 380 GSM, and bio-wash finishing formulated to endure years of wear.
            </p>
          </div>
        </div>

        {/* ─── Laboratory Quality Metrics ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((m) => (
            <div
              key={m.title}
              className="p-5 rounded-2xl bg-white border border-[#DDD3C5] shadow-2xs space-y-2"
            >
              <span className="text-[10px] font-mono uppercase font-bold text-[#6F6A63] block">
                {m.title}
              </span>
              <p className="text-2xl sm:text-3xl font-black font-heading text-[#E6321C]">
                {m.value}
              </p>
              <p className="text-xs text-[#6F6A63] leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Fabric Technical Cards ─── */}
        <div className="space-y-8">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6321C] font-mono">
              CURATED GARMENT BASES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-heading text-[#171717]">
              Proprietary Textile Lineup
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FABRICS.map((fabric) => (
              <motion.div
                key={fabric.name}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#E6321C]">
                        {fabric.silhouette}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black font-heading uppercase text-[#171717] mt-0.5">
                        {fabric.name}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F7EEDB] border border-[#DDD3C5] text-[9px] font-mono font-bold text-[#171717] shrink-0">
                      {fabric.badge}
                    </span>
                  </div>

                  {/* Specifications Grid */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5]/70 space-y-2 text-xs">
                    <div className="flex justify-between gap-2 border-b border-[#DDD3C5]/60 pb-1.5">
                      <span className="text-[#6F6A63] font-mono text-[11px]">Yarn / Fiber:</span>
                      <strong className="text-[#171717] text-right font-medium">{fabric.composition}</strong>
                    </div>
                    <div className="flex justify-between gap-2 border-b border-[#DDD3C5]/60 pb-1.5">
                      <span className="text-[#6F6A63] font-mono text-[11px]">Weave Architecture:</span>
                      <strong className="text-[#171717] text-right font-medium">{fabric.weave}</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-[#6F6A63] font-mono text-[11px]">Surface Finishing:</span>
                      <strong className="text-[#171717] text-right font-medium">{fabric.finishing}</strong>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <ul className="space-y-2 pt-1">
                    {fabric.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#171717]">
                        <CheckCircle2 size={14} className="text-[#E6321C] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── What GSM Actually Means (Customer Educational Box) ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#171717] text-white space-y-5 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E6321C]">
              FABRIC EDUCATION
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-heading uppercase text-white">
              What does GSM mean for your wardrobe?
            </h3>
            <p className="text-xs sm:text-sm text-[#DDD3C5]/70 max-w-2xl leading-relaxed">
              GSM stands for <strong>Grams per Square Meter</strong> — the standard global metric for measuring textile density and weight. Most commercial fast-fashion tees are 140–160 GSM (thin, transparent, and prone to losing shape). Bingooo strictly uses <strong>240 to 380 GSM</strong> for substantial substance, crisp boxy drape, and lifetime durability.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-4">
            <Link
              to="/size-guide"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#E6321C] transition-colors"
            >
              <span>Explore Size & Fit Measurement Tables</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/customize"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E6321C] hover:underline"
            >
              <span>Customize on 240 GSM Blanks</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
