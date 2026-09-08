import { Link } from 'react-router-dom';
import { Shirt } from 'lucide-react';

export function ReadyToExpressBanner() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-6 sm:py-10">
      <div className="rounded-2xl sm:rounded-3xl bg-[#B91F12] text-white p-6 sm:p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Background decorative ambient glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: Icon Stamp & Headlines */}
        <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
          {/* Atelier Embroidery Stamp Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed border-white/40 flex items-center justify-center text-white shrink-0 bg-white/5">
            <Shirt className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
          </div>

          {/* Text block */}
          <div>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-white/80">
              Be You. Be Bingooo.
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white mt-0.5">
              Ready to express your style?
            </h2>
            <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
              Shop our collection or create something unique today.
            </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-start md:justify-end shrink-0">
          <Link
            to="/shop"
            className="w-full sm:w-auto text-center rounded-full bg-white text-[#171717] px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-[0.12em] shadow-lg hover:bg-[#FAF8F5] active:scale-95 transition-all"
          >
            Shop Men's Wear
          </Link>
          <Link
            to="/customize"
            className="w-full sm:w-auto text-center rounded-full bg-[#8F160C] border border-white/40 text-white px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-[0.12em] shadow-lg hover:bg-white/10 hover:border-white active:scale-95 transition-all"
          >
            Create Your Design
          </Link>
        </div>
      </div>
    </section>
  );
}
