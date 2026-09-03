import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  ShieldCheck,
  PenTool,
  Truck,
  Shirt,
  Eye,
  ArrowRight,
  Award,
  Lock,
  RotateCcw,
  Headphones,
  Check,
} from 'lucide-react';

const swatches = [
  { id: 'black', color: '#171717', label: 'Obsidian Black' },
  { id: 'charcoal', color: '#3E3E3E', label: 'Washed Charcoal' },
  { id: 'cream', color: '#FAF6EE', label: 'Off-White Cream' },
  { id: 'sand', color: '#C8B99D', label: 'Vintage Sand' },
];

export function CustomDesignSection() {
  const [selectedColor, setSelectedColor] = useState('sand');

  return (
    <section className="relative w-full bg-[#F7EEDB] border-t border-[#DDD3C5] py-16 sm:py-24 px-4 sm:px-8 font-sans overflow-hidden">
      {/* Decorative Red Splash on the Left Edge */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 sm:w-16 h-72 bg-[#E6321C]/15 blur-2xl pointer-events-none rounded-r-full" />

      <div className="max-w-[1360px] mx-auto">
        {/* ─── Main Grid: Left Story & Right Process Cards ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ─── Left Column: Custom Design Studio Pitch ─── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Eyebrow with red bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E6321C] font-mono">
                CUSTOM DESIGN STUDIO
              </span>
              <div className="h-[2px] w-12 bg-[#E6321C]" />
            </div>

            {/* Main Headline */}
            <h2 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-[#171717] uppercase leading-[0.96] tracking-tight">
              CREATE.<br />
              <span className="text-[#E6321C]">CUSTOMIZE.</span><br />
              WEAR.
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#6F6A63] font-sans leading-relaxed max-w-md">
              Start with a Bingooo base garment, choose a colour, then make it your own. Your saved design moves right into checkout.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/customize"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-[#B91F12] hover:bg-[#E6321C] px-7 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-[#B91F12]/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles size={16} />
                <span>START DESIGNING</span>
              </Link>

              <Link
                to="/customize"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-[#DDD3C5] bg-white/70 hover:bg-white px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#171717] transition-all duration-200 hover:border-[#E6321C] hover:-translate-y-0.5"
              >
                <div className="h-6 w-6 rounded-full border border-[#B91F12] flex items-center justify-center text-[#B91F12]">
                  <Play size={10} className="fill-[#B91F12] translate-x-0.5" />
                </div>
                <span>HOW IT WORKS</span>
              </Link>
            </div>

            {/* 3 Quality Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#DDD3C5]/70 text-left">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={20} className="text-[#171717] shrink-0 mt-0.5" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">Premium Quality</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans mt-0.5">Materials</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <PenTool size={20} className="text-[#171717] shrink-0 mt-0.5" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">High Quality</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans mt-0.5">Printing</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck size={20} className="text-[#171717] shrink-0 mt-0.5" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">Fast Delivery</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans mt-0.5">3-7 Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: 3 Sequential Step Cards ─── */}
          <div className="lg:col-span-7">
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-4">
              
              {/* ─── STEP 01: CHOOSE ─── */}
              <div className="relative bg-[#FDF9F4] border border-[#DDD3C5] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-7 rounded-full bg-[#B91F12] text-white font-bold text-xs flex items-center justify-center font-mono">
                      01
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white border border-[#DDD3C5] flex items-center justify-center text-[#171717] shadow-2xs">
                      <Shirt size={16} strokeWidth={1.7} />
                    </div>
                  </div>

                  {/* Title & Copy */}
                  <h3 className="font-heading font-extrabold text-base uppercase text-[#171717] tracking-wider mt-4">
                    CHOOSE
                  </h3>
                  <p className="text-xs text-[#6F6A63] font-sans mt-1">
                    Select a garment and colour.
                  </p>
                </div>

                {/* Garment Image */}
                <div className="my-5 flex items-center justify-center">
                  <img
                    src="/custom/tshirt-step-1.png"
                    alt="Choose garment"
                    className="h-40 sm:h-44 w-auto object-contain drop-shadow-sm select-none"
                  />
                </div>

                {/* Interactive Color Swatches */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {swatches.map((s) => {
                    const isActive = selectedColor === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedColor(s.id)}
                        aria-label={s.label}
                        className={`relative h-6 w-6 rounded-full border transition-transform ${
                          isActive
                            ? 'scale-110 border-[#171717] ring-2 ring-[#B91F12] ring-offset-1 ring-offset-[#FDF9F4]'
                            : 'border-black/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: s.color }}
                      >
                        {isActive && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check size={12} className={s.id === 'cream' ? 'text-black' : 'text-white'} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Connector Arrow to Card 02 (Desktop only) */}
                <div className="hidden sm:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white border border-[#DDD3C5] items-center justify-center text-[#B91F12] shadow-xs">
                  <ArrowRight size={13} strokeWidth={2.2} />
                </div>
              </div>

              {/* ─── STEP 02: MAKE IT YOURS ─── */}
              <div className="relative bg-[#FDF9F4] border border-[#DDD3C5] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-7 rounded-full bg-[#B91F12] text-white font-bold text-xs flex items-center justify-center font-mono">
                      02
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white border border-[#DDD3C5] flex items-center justify-center text-[#171717] shadow-2xs">
                      <PenTool size={16} strokeWidth={1.7} />
                    </div>
                  </div>

                  {/* Title & Copy */}
                  <h3 className="font-heading font-extrabold text-base uppercase text-[#171717] tracking-wider mt-4">
                    MAKE IT YOURS
                  </h3>
                  <p className="text-xs text-[#6F6A63] font-sans mt-1">
                    Add artwork, text, and placement.
                  </p>
                </div>

                {/* Garment Image with Dashed Canvas Area */}
                <div className="my-5 flex items-center justify-center">
                  <img
                    src="/custom/tshirt-step-2.png"
                    alt="Make it yours artwork"
                    className="h-40 sm:h-44 w-auto object-contain drop-shadow-sm select-none"
                  />
                </div>

                {/* Empty spacer to balance card height with Step 1 & 3 */}
                <div className="h-6 flex items-center justify-center">
                  <span className="text-[11px] font-mono text-[#6F6A63]/80 uppercase tracking-wider">
                    DTG High-Def Print
                  </span>
                </div>

                {/* Connector Arrow to Card 03 (Desktop only) */}
                <div className="hidden sm:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white border border-[#DDD3C5] items-center justify-center text-[#B91F12] shadow-xs">
                  <ArrowRight size={13} strokeWidth={2.2} />
                </div>
              </div>

              {/* ─── STEP 03: PREVIEW ─── */}
              <div className="relative bg-[#FDF9F4] border border-[#DDD3C5] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-7 rounded-full bg-[#B91F12] text-white font-bold text-xs flex items-center justify-center font-mono">
                      03
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white border border-[#DDD3C5] flex items-center justify-center text-[#171717] shadow-2xs">
                      <Eye size={16} strokeWidth={1.7} />
                    </div>
                  </div>

                  {/* Title & Copy */}
                  <h3 className="font-heading font-extrabold text-base uppercase text-[#171717] tracking-wider mt-4">
                    PREVIEW
                  </h3>
                  <p className="text-xs text-[#6F6A63] font-sans mt-1">
                    Review it before it enters your bag.
                  </p>
                </div>

                {/* Garment Image */}
                <div className="my-5 flex items-center justify-center">
                  <img
                    src="/custom/tshirt-step-3-black.png"
                    alt="Preview customized garment"
                    className="h-40 sm:h-44 w-auto object-contain drop-shadow-sm select-none"
                  />
                </div>

                {/* Bottom Pill: Looks perfect! ❤️ */}
                <div className="flex items-center justify-center pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDD3C5] shadow-xs text-xs font-semibold text-[#171717]">
                    <span>Looks perfect!</span>
                    <span className="text-[#E6321C]">❤️</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── Bottom 4-Item Guarantee Bar ─── */}
            <div className="mt-5 bg-[#FDF9F4] border border-[#DDD3C5] rounded-2xl py-4 px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left shadow-xs">
              <div className="flex items-center gap-3">
                <Award size={22} className="text-[#171717] shrink-0" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">100% Satisfaction</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans">Guaranteed</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Lock size={20} className="text-[#171717] shrink-0" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">Secure Payments</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans">100% Safe</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RotateCcw size={20} className="text-[#171717] shrink-0" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">Easy Returns</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans">Hassle-free</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Headphones size={20} className="text-[#171717] shrink-0" strokeWidth={1.7} />
                <div>
                  <div className="text-xs font-bold text-[#171717] leading-tight">24/7 Support</div>
                  <div className="text-[11px] text-[#6F6A63] font-sans">We're here</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
