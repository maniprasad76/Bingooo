import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Ruler, ArrowRight } from 'lucide-react';

type Unit = 'in' | 'cm';

interface SizeRow {
  size: string;
  chest: [number, number]; // [in, cm]
  length: [number, number];
  shoulder: [number, number];
  sleeve: [number, number];
}

const SIZE_TABLES: Record<string, { title: string; desc: string; rows: SizeRow[] }> = {
  oversized: {
    title: 'Oversized Streetwear T-Shirt (240 GSM)',
    desc: 'Intentionally boxy streetwear cut with dropped shoulder seams and relaxed chest drape.',
    rows: [
      { size: 'S', chest: [42, 107], length: [28, 71], shoulder: [20, 51], sleeve: [8.5, 21.5] },
      { size: 'M', chest: [44, 112], length: [29, 74], shoulder: [21, 53], sleeve: [9.0, 23.0] },
      { size: 'L', chest: [46, 117], length: [30, 76], shoulder: [22, 56], sleeve: [9.5, 24.0] },
      { size: 'XL', chest: [48, 122], length: [31, 79], shoulder: [23, 58], sleeve: [10.0, 25.5] },
      { size: 'XXL', chest: [50, 127], length: [32, 81], shoulder: [24, 61], sleeve: [10.5, 26.5] },
    ],
  },
  hoodie: {
    title: 'Heavyweight Fleece Hoodie (280–320 GSM)',
    desc: 'Structured double-lined hood with kangaroo pouch and snug rib-knit cuffs.',
    rows: [
      { size: 'S', chest: [42, 107], length: [27, 69], shoulder: [19, 48], sleeve: [24.5, 62] },
      { size: 'M', chest: [44, 112], length: [28, 71], shoulder: [20, 51], sleeve: [25.0, 63.5] },
      { size: 'L', chest: [46, 117], length: [29, 74], shoulder: [21, 53], sleeve: [25.5, 65] },
      { size: 'XL', chest: [48, 122], length: [30, 76], shoulder: [22, 56], sleeve: [26.0, 66] },
      { size: 'XXL', chest: [50, 127], length: [31, 79], shoulder: [23, 58], sleeve: [26.5, 67] },
    ],
  },
  regular: {
    title: 'Regular Fit Crewneck T-Shirt (220 GSM)',
    desc: 'Classic tailored silhouette, true to size, sitting naturally at the waist.',
    rows: [
      { size: 'S', chest: [38, 97], length: [27, 69], shoulder: [17.5, 44.5], sleeve: [8.0, 20.3] },
      { size: 'M', chest: [40, 102], length: [28, 71], shoulder: [18.5, 47.0], sleeve: [8.5, 21.5] },
      { size: 'L', chest: [42, 107], length: [29, 74], shoulder: [19.5, 49.5], sleeve: [9.0, 22.8] },
      { size: 'XL', chest: [44, 112], length: [30, 76], shoulder: [20.5, 52.0], sleeve: [9.5, 24.1] },
      { size: 'XXL', chest: [46, 117], length: [31, 79], shoulder: [21.5, 54.5], sleeve: [10.0, 25.4] },
    ],
  },
};

export function SizeGuidePage() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'oversized' | 'hoodie' | 'regular'>('oversized');
  const [unit, setUnit] = useState<Unit>('in');

  const currentTable = SIZE_TABLES[activeTab];
  const unitIndex = unit === 'in' ? 0 : 1;

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 space-y-12">
        
        {/* ─── Breadcrumbs & Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Guide</span>
            <span>/</span>
            <span className="text-[#171717]">Size & Fit Guide</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading">
                Size & Fit Guide
              </h1>
              <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed pt-1">
                Precision measurements for our 240+ GSM heavyweight streetwear garments.
              </p>
            </div>

            {/* Unit Toggle: Inches / Centimeters */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#DDD3C5] shadow-xs self-start sm:self-auto">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setUnit('in')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  unit === 'in' ? 'bg-[#171717] text-white shadow-xs' : 'text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                Inches (in)
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setUnit('cm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  unit === 'cm' ? 'bg-[#171717] text-white shadow-xs' : 'text-[#6F6A63] hover:text-[#171717]'
                }`}
              >
                Centimeters (cm)
              </motion.button>
            </div>
          </div>
        </div>

        {/* ─── Garment Type Switcher ─── */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'oversized', label: 'Oversized T-Shirts' },
            { id: 'hoodie', label: 'Hoodies & Sweatshirts' },
            { id: 'regular', label: 'Regular Crewnecks' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTab(tab.id as 'oversized' | 'hoodie' | 'regular')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-heading transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#E6321C] text-white shadow-xs'
                  : 'bg-white hover:bg-[#EDE0CC] text-[#6F6A63] hover:text-[#171717] border border-[#DDD3C5]'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* ─── Size Measurement Matrix Table ─── */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDD3C5] space-y-6 shadow-xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
                {currentTable.title}
              </h2>
              <p className="text-xs text-[#6F6A63] pt-1">
                {currentTable.desc}
              </p>

              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#DDD3C5] text-[11px] font-mono font-bold uppercase text-[#6F6A63]">
                      <th className="pb-3 pr-4">Size</th>
                      <th className="pb-3 px-4">Chest / Bust ({unit})</th>
                      <th className="pb-3 px-4">Garment Length ({unit})</th>
                      <th className="pb-3 px-4">Shoulder Span ({unit})</th>
                      <th className="pb-3 pl-4">Sleeve Length ({unit})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDD3C5]/60 font-mono">
                    {currentTable.rows.map((row) => (
                      <tr key={row.size} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-4 pr-4 font-bold text-[#171717] text-base">{row.size}</td>
                        <td className="py-4 px-4 text-[#171717]">{row.chest[unitIndex]}</td>
                        <td className="py-4 px-4 text-[#171717]">{row.length[unitIndex]}</td>
                        <td className="py-4 px-4 text-[#171717]">{row.shoulder[unitIndex]}</td>
                        <td className="py-4 pl-4 text-[#E6321C] font-bold">{row.sleeve[unitIndex]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] text-xs text-[#6F6A63] flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#E6321C] shrink-0" aria-hidden="true" />
            <span>
              Note: All measurements are garment dimensions laid flat. Allow a normal tolerance of &plusmn;0.5 {unit} due to manual textile stitching.
            </span>
          </div>
        </div>

        {/* ─── How to Measure Yourself Guide ─── */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#DDD3C5] space-y-6">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-[#171717]">
            How to Measure For the Perfect Fit
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-1.5 transition-shadow hover:shadow-xs"
            >
              <span className="font-bold text-[#171717] font-heading block">1. Chest Circumference</span>
              <p className="text-[#6F6A63] text-xs leading-relaxed">
                Wrap a tape measure around the fullest part of your chest, keeping the tape horizontal under your arms.
              </p>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-1.5 transition-shadow hover:shadow-xs"
            >
              <span className="font-bold text-[#171717] font-heading block">2. Garment Length</span>
              <p className="text-[#6F6A63] text-xs leading-relaxed">
                Measure from the highest point of the shoulder seam straight down to the bottom hem of the garment.
              </p>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-1.5 transition-shadow hover:shadow-xs"
            >
              <span className="font-bold text-[#171717] font-heading block">3. Shoulder Width</span>
              <p className="text-[#6F6A63] text-xs leading-relaxed">
                Measure across the back from the tip of one shoulder bone straight to the other.
              </p>
            </motion.div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD3C5] space-y-1.5 transition-shadow hover:shadow-xs"
            >
              <span className="font-bold text-[#171717] font-heading block">4. Streetwear Fit Tip</span>
              <p className="text-[#6F6A63] text-xs leading-relaxed">
                For our Oversized line, choose your usual size for a true relaxed drop-shoulder streetwear drape. If you prefer a snug fitted look, select one size down.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ─── Ready to Shop CTA ─── */}
        <div className="p-8 rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-[#171717]">
              Confident in your measurements?
            </h3>
            <p className="text-xs text-[#6F6A63]">
              Backed by our 7-day hassle-free doorstep size exchange.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-bold text-xs font-heading tracking-wide uppercase shadow-xs transition-colors shrink-0"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
