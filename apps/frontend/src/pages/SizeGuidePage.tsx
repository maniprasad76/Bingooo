import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ruler,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Sparkles,
  Shirt,
  Scissors,
  Layers,
  ShoppingBag,
  Calculator,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';

type Unit = 'in' | 'cm';

interface SizeRow {
  size: string;
  chest: [number, number]; // [in, cm]
  length: [number, number];
  shoulder: [number, number];
  sleeve: [number, number];
  fitNote: string;
}

const SIZE_TABLES: Record<string, { title: string; subtitle: string; desc: string; gsm: string; rows: SizeRow[] }> = {
  oversized: {
    title: 'Oversized Streetwear T-Shirt',
    subtitle: 'Signature Drop-Shoulder Silhouette',
    desc: 'Intentionally boxy architectural streetwear cut with dropped shoulder seams and relaxed chest drape.',
    gsm: '240 GSM Combed Cotton',
    rows: [
      { size: 'S', chest: [42, 107], length: [28, 71], shoulder: [20, 51], sleeve: [8.5, 21.5], fitNote: 'Fits chest 34–36" with relaxed drape' },
      { size: 'M', chest: [44, 112], length: [29, 74], shoulder: [21, 53], sleeve: [9.0, 23.0], fitNote: 'Fits chest 37–39" with signature boxy drop' },
      { size: 'L', chest: [46, 117], length: [30, 76], shoulder: [22, 56], sleeve: [9.5, 24.0], fitNote: 'Fits chest 40–42" with structured oversize' },
      { size: 'XL', chest: [48, 122], length: [31, 79], shoulder: [23, 58], sleeve: [10.0, 25.5], fitNote: 'Fits chest 43–45" with exaggerated drape' },
      { size: 'XXL', chest: [50, 127], length: [32, 81], shoulder: [24, 61], sleeve: [10.5, 26.5], fitNote: 'Fits chest 46–48" with roomy streetwear aesthetic' },
    ],
  },
  hoodie: {
    title: 'Heavyweight Fleece Hoodie',
    subtitle: 'Structured French Terry Pullover',
    desc: 'Structured double-lined hood with kangaroo pouch, snug rib-knit cuffs, and generous body insulation.',
    gsm: '320 GSM French Terry Fleece',
    rows: [
      { size: 'S', chest: [42, 107], length: [27, 69], shoulder: [19, 48], sleeve: [24.5, 62.0], fitNote: 'Fits chest 34–36" comfortably layered' },
      { size: 'M', chest: [44, 112], length: [28, 71], shoulder: [20, 51], sleeve: [25.0, 63.5], fitNote: 'Fits chest 37–39" with tailored torso room' },
      { size: 'L', chest: [46, 117], length: [29, 74], shoulder: [21, 53], sleeve: [25.5, 65.0], fitNote: 'Fits chest 40–42" with relaxed winter drape' },
      { size: 'XL', chest: [48, 122], length: [30, 76], shoulder: [22, 56], sleeve: [26.0, 66.0], fitNote: 'Fits chest 43–45" with heavyweight drape' },
      { size: 'XXL', chest: [50, 127], length: [31, 79], shoulder: [23, 58], sleeve: [26.5, 67.0], fitNote: 'Fits chest 46–48" with maximum comfort' },
    ],
  },
  regular: {
    title: 'Classic Crewneck T-Shirt',
    subtitle: 'Tailored Everyday Silhouette',
    desc: 'Classic tailored silhouette, true to size, sitting naturally at the waist and hugging shoulders cleanly.',
    gsm: '220 GSM Single Jersey',
    rows: [
      { size: 'S', chest: [38, 97], length: [27, 69], shoulder: [17.5, 44.5], sleeve: [8.0, 20.3], fitNote: 'Fits chest 34–36" true to standard sizing' },
      { size: 'M', chest: [40, 102], length: [28, 71], shoulder: [18.5, 47.0], sleeve: [8.5, 21.5], fitNote: 'Fits chest 37–39" with regular contour' },
      { size: 'L', chest: [42, 107], length: [29, 74], shoulder: [19.5, 49.5], sleeve: [9.0, 22.8], fitNote: 'Fits chest 40–42" with classic taper' },
      { size: 'XL', chest: [44, 112], length: [30, 76], shoulder: [20.5, 52.0], sleeve: [9.5, 24.1], fitNote: 'Fits chest 43–45" with athletic drape' },
      { size: 'XXL', chest: [46, 117], length: [31, 79], shoulder: [21.5, 54.5], sleeve: [10.0, 25.4], fitNote: 'Fits chest 46–48" with relaxed fit' },
    ],
  },
};

const FAQS = [
  {
    question: 'Should I size down for an oversized t-shirt?',
    answer:
      'Our Oversized Streetwear T-Shirts are specifically engineered with a dropped shoulder and broader chest width to achieve a stylish, relaxed drape. If you want the authentic streetwear look seen in our lookbooks, order your regular size. If you prefer a closer, traditional fit, we recommend selecting one size down.',
  },
  {
    question: 'Do Bingooo heavyweight garments shrink after washing?',
    answer:
      'Zero noticeable shrinkage. All Bingooo cotton fabrics undergo an industrial pre-shrinking and heat-curing wash cycle prior to final tailoring. When washed in cold water and air-dried as recommended on our wash care labels, residual shrinkage is kept well within ±1%.',
  },
  {
    question: 'What if the size I receive does not fit perfectly?',
    answer:
      'We provide a complimentary 7-Day Doorstep Size Exchange across 19,000+ Indian postal codes. Simply tap "Exchange Size" in your Account > Orders dashboard or message our WhatsApp concierge, and a courier will arrive at your door to swap it for your preferred size with zero reverse fees.',
  },
  {
    question: 'How should I choose sizing for custom on-demand DTF prints?',
    answer:
      'Because bespoke custom garments cannot be returned for subjective change of mind, please lay your best-fitting t-shirt flat on a table, measure pit-to-pit (chest width) in inches, and match it against our chest specification chart before finalizing your customizer order.',
  },
  {
    question: 'What is the tolerance variation in handmade tailoring?',
    answer:
      'Due to manual textile cutting and high-density 240+ GSM knit properties, an industry-standard tolerance of ±0.5 inches (±1.2 cm) is normal across chest, length, and shoulder specifications.',
  },
];

export function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<'oversized' | 'hoodie' | 'regular'>('oversized');
  const [unit, setUnit] = useState<Unit>('in');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    triggerHaptic('light');
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Interactive Size Calculator State
  const [calcHeight, setCalcHeight] = useState('5ft 9in');
  const [calcWeight, setCalcWeight] = useState('72');
  const [calcPreference, setCalcPreference] = useState<'oversized' | 'regular'>('oversized');
  const [calculatedSize, setCalculatedSize] = useState<string>('L');

  const currentTable = SIZE_TABLES[activeTab];
  const unitIndex = unit === 'in' ? 0 : 1;

  const calculateRecommendedSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic('light');
    const w = parseFloat(calcWeight) || 70;

    let rec = 'M';
    if (w < 60) rec = 'S';
    else if (w < 72) rec = 'M';
    else if (w < 84) rec = 'L';
    else if (w < 96) rec = 'XL';
    else rec = 'XXL';

    if (calcPreference === 'regular' && rec !== 'S' && w % 10 < 4) {
      // lean towards snugger
    }
    setCalculatedSize(rec);
  };

  return (
    <main className="bg-[#F7EEDB] text-[#171717] font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      <SEO
        title="Size & Fit Measurement Guide — BINGOOO Atelier"
        description="Find your perfect fit. Precision measurements in inches and centimeters for Bingooo 240 GSM oversized tees, boxy streetwear silhouettes, and fleece hoodies."
        canonical="https://bingooo.in/size-guide"
      />

      {/* =======================================================
           TOP BREADCRUMB & SIZING STATUS
      ======================================================= */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/60 px-4 sm:px-8 py-3 text-[11px]">
        <div className="container-bingooo flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/" className="hover:text-[#171717] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#6F6A63]">SPECIFICATIONS</span>
            <span>/</span>
            <span className="text-[#171717] font-bold">SIZE & FIT GUIDE</span>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#171717] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
            <span>PRECISION SIZING • 7-DAY COMPLIMENTARY SIZE EXCHANGE</span>
          </div>
        </div>
      </div>

      {/* =======================================================
           HERO SECTION: EDITORIAL SPLIT
      ======================================================= */}
      <section className="min-h-[600px] lg:min-h-[660px] grid grid-cols-1 lg:grid-cols-[48%_52%] border-b border-[#DDD3C5]">
        {/* Left Editorial Copy */}
        <div className="flex flex-col justify-center py-12 px-6 sm:px-10 lg:py-[clamp(50px,7vw,100px)] lg:px-[clamp(30px,5vw,80px)] bg-[#F7EEDB]">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[#EDE0CC] border border-[#DDD3C5] text-[#E6321C] text-[10px] font-mono font-bold tracking-[0.2em] uppercase rounded-[2px] mb-4">
            <Sparkles className="w-3 h-3 text-[#E6321C]" />
            <span>PATTERN DRAFTING & FIT ENGINEERING</span>
          </div>

          <h1 className="my-2 mb-6 text-[clamp(44px,6.2vw,92px)] font-extrabold leading-[0.86] tracking-[-0.07em] uppercase text-[#171717]">
            <span className="block">HEAVYWEIGHT FIT.</span>
            <span className="block">PRECISE DRAPE.</span>
            <span className="block text-[#E6321C]">ZERO GUESSWORK.</span>
          </h1>

          <p className="max-w-[480px] m-0 mb-8 text-[#6F6A63] text-[13px] leading-[1.8]">
            Our garments are engineered with high-density 240+ GSM combed cotton, drop-shoulder geometry, and structured collar ribs. Find your exact architectural fit across our oversized tees, boxy silhouettes, and French terry fleece hoodies.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <a
              href="#size-calculator"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black inline-flex items-center gap-2"
            >
              <span>FIND MY SIZE CALCULATOR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href={getWhatsAppUrl('Hi Bingooo, I would like personal sizing advice for my height and weight.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic('light')}
              className="btn btn-outline inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>WHATSAPP SIZING DESK</span>
            </a>
          </div>

          {/* Quick SLA Badges */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#DDD3C5]">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">FABRIC WEIGHT</span>
              <span className="text-[12px] font-bold text-[#6F6A63]">240+ GSM Cotton</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#171717]">SHRINKAGE</span>
              <span className="text-[12px] font-bold text-[#238636]">0% Pre-Shrunk</span>
            </div>
            <div className="flex flex-col border-l border-[#DDD3C5] pl-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">EXCHANGE</span>
              <span className="text-[12px] font-bold text-[#171717]">7-Day Doorstep Swap</span>
            </div>
          </div>
        </div>

        {/* Right Imagery Banner */}
        <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-full overflow-hidden bg-[#171717]">
          <img
            src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo atelier pattern drafting and garment fit measurement"
            className="w-full h-full object-cover grayscale contrast-125 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/85 via-transparent to-black/20" />

          {/* Overlay Atelier Stamp */}
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#171717]/90 backdrop-blur-md border border-white/10 text-white rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                SRIKAKULAM WORKSHOP • PATTERN MASTERY
              </div>
              <div className="text-sm font-bold uppercase tracking-tight">
                Calibrated Drop-Shoulder Streetwear Specifications
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#DDD3C5]/80 uppercase tracking-widest self-end sm:self-center">
              TRUE-TO-DRAPE METRICS
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           KEY METRICS STRIP
      ======================================================= */}
      <section className="bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD3C5]">
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">KNIT DENSITY</span>
                <Layers className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  240+ GSM
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Heavy Combed Cotton For Structured Drop
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">TOLERANCE SPEC</span>
                <Scissors className="w-4 h-4 text-[#171717]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#171717]">
                  &plusmn;0.5 IN
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Handmade Master Tailor Cutting Tolerance
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">SHRINKAGE LOCK</span>
                <Shirt className="w-4 h-4 text-[#238636]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#238636]">
                  0%
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Pre-Washed & Thermally Stabilized Yarn
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">EXCHANGE SAFETY</span>
                <Ruler className="w-4 h-4 text-[#E6321C]" />
              </div>
              <div>
                <div className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-[-0.06em] leading-none text-[#E6321C]">
                  7 DAYS
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F6A63]">
                  Complimentary Reverse Doorstep Size Swap
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           INTERACTIVE SIZING CALCULATOR ENGINE
      ======================================================= */}
      <section className="py-16 bg-[#EDE0CC] border-b border-[#DDD3C5]" id="size-calculator">
        <div className="container-bingooo max-w-[900px] mx-auto">
          <div className="p-8 sm:p-10 bg-white border border-[#DDD3C5] rounded-[2px] shadow-xs text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD3C5] pb-4 mb-6">
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                  INTERACTIVE FIT ADVISOR
                </div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#171717]">
                  Calculate Your Sizing Profile
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E6321C] bg-[#EDE0CC] px-3 py-1 rounded-[2px]">
                <Calculator className="w-4 h-4" />
                <span>ALGORITHMIC TAILOR</span>
              </div>
            </div>

            <form onSubmit={calculateRecommendedSize} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                  Height (Feet / Inches)
                </label>
                <select
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#DDD3C5] bg-[#F7EEDB]/40 font-mono text-xs text-[#171717] focus:outline-none focus:border-[#E6321C]"
                >
                  <option value="5ft 4in">5ft 4in (162 cm)</option>
                  <option value="5ft 6in">5ft 6in (167 cm)</option>
                  <option value="5ft 8in">5ft 8in (173 cm)</option>
                  <option value="5ft 9in">5ft 9in (175 cm)</option>
                  <option value="5ft 11in">5ft 11in (180 cm)</option>
                  <option value="6ft 1in">6ft 1in (185 cm)</option>
                  <option value="6ft 3in">6ft 3in (190 cm)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                  Body Weight (kg)
                </label>
                <input
                  type="number"
                  min={45}
                  max={130}
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#DDD3C5] bg-[#F7EEDB]/40 font-mono text-xs text-[#171717] focus:outline-none focus:border-[#E6321C]"
                  placeholder="e.g. 72"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                  Preferred Silhouette
                </label>
                <select
                  value={calcPreference}
                  onChange={(e: any) => setCalcPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#DDD3C5] bg-[#F7EEDB]/40 font-mono text-xs text-[#171717] focus:outline-none focus:border-[#E6321C]"
                >
                  <option value="oversized">Boxy Oversized (Streetwear Drape)</option>
                  <option value="regular">Regular Classic (True to size)</option>
                </select>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-[2px] bg-[#EDE0CC] border border-[#DDD3C5]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[2px] bg-[#171717] text-[#F7EEDB] font-mono text-2xl font-black flex items-center justify-center shrink-0">
                  {calculatedSize}
                </div>
                <div>
                  <div className="font-extrabold uppercase text-sm text-[#171717]">
                    Recommended Size: {calculatedSize}
                  </div>
                  <div className="text-xs text-[#6F6A63] mt-0.5">
                    For {calcHeight} and {calcWeight}kg body frame with {calcPreference === 'oversized' ? 'streetwear drop-shoulder' : 'regular fit'} styling.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => calculateRecommendedSize()}
                className="btn btn-black text-xs h-10 px-5 rounded-[2px] shrink-0"
              >
                RECALCULATE →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           MEASUREMENT MATRIX SECTION (INCHES / CM TOGGLE)
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
                DIMENSIONAL MATRIX
              </div>
              <h2 className="m-0 text-[clamp(36px,5vw,64px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase text-[#171717]">
                GARMENT SPECIFICATIONS
              </h2>
            </div>

            {/* Unit Toggle: Inches vs Centimeters */}
            <div className="inline-flex items-center p-1 rounded-[2px] bg-[#EDE0CC] border border-[#DDD3C5]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setUnit('in');
                }}
                className={`px-4 py-1.5 rounded-[2px] text-xs font-mono font-bold uppercase transition-all ${
                  unit === 'in' ? 'bg-[#171717] text-white shadow-xs' : 'text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                INCHES (IN)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setUnit('cm');
                }}
                className={`px-4 py-1.5 rounded-[2px] text-xs font-mono font-bold uppercase transition-all ${
                  unit === 'cm' ? 'bg-[#171717] text-white shadow-xs' : 'text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                CENTIMETERS (CM)
              </button>
            </div>
          </div>

          {/* Garment Silhouette Tab Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'oversized', label: 'Oversized Streetwear Tees (240 GSM)' },
              { id: 'hoodie', label: 'Fleece Hoodies (320 GSM)' },
              { id: 'regular', label: 'Classic Crewnecks (220 GSM)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as 'oversized' | 'hoodie' | 'regular');
                }}
                className={`px-5 py-3 rounded-[2px] text-xs font-mono font-bold uppercase transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#171717] text-white'
                    : 'bg-white text-[#6F6A63] hover:text-[#171717] border border-[#DDD3C5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Matrix Table */}
          <div className="border border-[#DDD3C5] bg-white rounded-[2px] overflow-hidden shadow-xs">
            <div className="p-6 border-b border-[#DDD3C5] bg-[#EDE0CC]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold uppercase text-lg text-[#171717]">
                  {currentTable.title}
                </h3>
                <p className="text-xs text-[#6F6A63] mt-0.5">
                  {currentTable.desc}
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase px-3 py-1 bg-[#171717] text-white rounded-[2px] self-start sm:self-auto">
                {currentTable.gsm}
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#DDD3C5] bg-[#EDE0CC]/20 text-[10px] uppercase font-mono font-bold text-[#171717]">
                    <th className="py-4 px-6">Size Tag</th>
                    <th className="py-4 px-6">Chest Width ({unit})</th>
                    <th className="py-4 px-6">Garment Length ({unit})</th>
                    <th className="py-4 px-6">Shoulder Span ({unit})</th>
                    <th className="py-4 px-6">Sleeve Drop ({unit})</th>
                    <th className="py-4 px-6">Recommended Frame</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD3C5]/60 font-mono">
                  {currentTable.rows.map((row) => (
                    <tr key={row.size} className="hover:bg-[#F7EEDB]/40 transition-colors">
                      <td className="py-5 px-6 font-extrabold text-[#171717] text-base">
                        {row.size}
                      </td>
                      <td className="py-5 px-6 font-bold text-[#171717]">
                        {row.chest[unitIndex]} {unit}
                      </td>
                      <td className="py-5 px-6 text-[#171717]">
                        {row.length[unitIndex]} {unit}
                      </td>
                      <td className="py-5 px-6 text-[#171717]">
                        {row.shoulder[unitIndex]} {unit}
                      </td>
                      <td className="py-5 px-6 text-[#E6321C] font-bold">
                        {row.sleeve[unitIndex]} {unit}
                      </td>
                      <td className="py-5 px-6 font-sans text-xs text-[#6F6A63]">
                        {row.fitNote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#F7EEDB]/60 border-t border-[#DDD3C5] text-xs font-mono text-[#6F6A63] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#E6321C] shrink-0" />
              <span>
                Note: All specs are garment dimensions laid flat on cutting table. Normal tailoring tolerance is &plusmn;0.5 {unit}.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           HOW TO MEASURE ARCHITECTURAL GUIDE
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#EDE0CC] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              ANATOMICAL MEASUREMENT
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              HOW TO MEASURE FOR THE PERFECT FIT
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-4">
              Take 2 minutes to measure your favorite t-shirt laid flat to ensure your Bingooo delivery fits with runway perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] shadow-xs space-y-2 text-left">
              <div className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">01. CHEST WIDTH</div>
              <h4 className="font-extrabold uppercase text-sm text-[#171717]">Pit-to-Pit Circumference</h4>
              <p className="text-xs text-[#6F6A63] leading-relaxed">
                Measure straight across the chest from armpit to armpit seam, then double the measurement for total circumference.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] shadow-xs space-y-2 text-left">
              <div className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">02. GARMENT LENGTH</div>
              <h4 className="font-extrabold uppercase text-sm text-[#171717]">High Shoulder to Hem</h4>
              <p className="text-xs text-[#6F6A63] leading-relaxed">
                Measure straight down from the highest point of the neck rib seam to the bottom hem of the shirt.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] shadow-xs space-y-2 text-left">
              <div className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">03. SHOULDER SPAN</div>
              <h4 className="font-extrabold uppercase text-sm text-[#171717]">Drop-Shoulder Span</h4>
              <p className="text-xs text-[#6F6A63] leading-relaxed">
                Measure across the back from the tip of one shoulder seam to the opposite seam across shoulder blades.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] shadow-xs space-y-2 text-left">
              <div className="font-mono text-[10px] font-bold uppercase text-[#E6321C]">04. STREETWEAR TIP</div>
              <h4 className="font-extrabold uppercase text-sm text-[#171717]">Drape vs Fitted</h4>
              <p className="text-xs text-[#6F6A63] leading-relaxed">
                Our 240 GSM line features natural drop shoulders. Order true-to-size for streetwear drape, or 1 size down for standard snugness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           INTERACTIVE SIZING FAQ ACCORDION
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F6A63] mb-2 font-mono">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              COMMON FIT & MEASUREMENT QUESTIONS
            </h2>
            <p className="text-[#6F6A63] text-[13px] leading-[1.8] mt-3">
              Helpful advice on cotton shrinkage, custom print sizing, and doorstep exchange protection.
            </p>
          </div>

          <div className="border-t border-[#DDD3C5] divide-y divide-[#DDD3C5]">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="transition-colors hover:bg-[#EDE0CC]/40">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-5 px-4 text-left flex items-center justify-between gap-4 font-extrabold uppercase tracking-tight text-sm sm:text-base text-[#171717] focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#E6321C]">0{idx + 1}.</span>
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#171717] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#E6321C]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-6 pt-1 text-[13px] leading-[1.8] text-[#6F6A63] border-l-2 border-[#E6321C] ml-4 mb-2 bg-[#EDE0CC]/50 p-4 rounded-[2px]">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-[#EDE0CC] border border-[#DDD3C5] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#E6321C] shrink-0" />
              <div>
                <div className="font-extrabold uppercase text-xs text-[#171717]">
                  Still unsure which size to order?
                </div>
                <div className="text-[#6F6A63] text-[11px]">
                  Send your height and weight to our Srikakulam master tailors on WhatsApp for an immediate recommendation.
                </div>
              </div>
            </div>
            <a
              href={getWhatsAppUrl('Hi Bingooo, can you help me pick the right size for an oversized tee?')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-black text-xs h-10 px-5"
            >
              CHAT WITH MASTER TAILOR →
            </a>
          </div>
        </div>
      </section>

      {/* =======================================================
           BOTTOM CALLOUT BANNER (Atelier Red)
      ======================================================= */}
      <section className="py-20 lg:py-24 px-5 bg-[#E6321C] text-white text-center">
        <div className="container-bingooo max-w-[800px] mx-auto">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3 font-mono">
            CONFIDENT IN YOUR MEASUREMENTS?
          </div>

          <h2 className="my-2 mb-6 text-[clamp(38px,6vw,84px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase text-white">
            EXPLORE HEAVYWEIGHT<br />
            STREETWEAR PIECES.
          </h2>

          <p className="max-w-[480px] mx-auto mb-8 text-white/90 text-[13px] leading-[1.8]">
            Backed by our 7-day hassle-free doorstep size exchange. Order your true size with complete confidence.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/shop"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-[#171717] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOP THE COLLECTION →</span>
            </Link>

            <Link
              to="/customize"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-[2px] bg-white text-[#171717] text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#F7EEDB] hover:-translate-y-0.5 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#E6321C]" />
              <span>CUSTOMIZE WITH YOUR ARTWORK</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SizeGuidePage;
