import {
  PenTool,
  ShieldCheck,
  Banknote,
  RotateCcw,
} from 'lucide-react';

export function WhyBingooo() {
  const features = [
    {
      title: 'Premium Fabrics',
      subtitle: 'Feels good. Looks better.',
      // Clean cloth spool / fabric icon
      icon: (
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-[#171717]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18" />
          <path d="M7 6h10" />
          <path d="M5 12h14" />
          <path d="M7 18h10" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      title: 'Custom Designs',
      subtitle: 'Make it yours. Wear your story.',
      icon: <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-[#171717]" strokeWidth={1.6} />,
    },
    {
      title: 'Secure Payments',
      subtitle: '100% safe & trusted.',
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#171717]" strokeWidth={1.6} />,
    },
    {
      title: 'COD & Partial COD',
      subtitle: "Pay the way you're comfortable.",
      icon: <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-[#171717]" strokeWidth={1.6} />,
    },
    {
      title: 'Easy Returns',
      subtitle: 'Hassle-free returns within 7 days.',
      icon: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-[#171717]" strokeWidth={1.6} />,
    },
  ];

  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-8 sm:py-10">
      <div className="bg-[#F5EFE6] border border-[#DDD3C5]/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm">
        {/* ── Heading ── */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="inline-flex items-center gap-2 text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.14em] text-[#171717]">
            Why Bingooo? <span className="w-6 h-[2px] bg-[#E6321C]" />
          </h2>
        </div>

        {/* ── 5 Simple & Clean Columns ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 divide-y sm:divide-y-0 lg:divide-x divide-[#DDD3C5]/60">
          {features.map((feat, idx) => (
            <div
              key={feat.title}
              className={`flex items-center gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-0.5 ${
                idx > 0 ? 'pt-4 sm:pt-0 lg:pl-6' : ''
              }`}
            >
              {/* Circular Icon Ring */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#171717]/20 flex items-center justify-center shrink-0 bg-white/60 shadow-xs hover:border-[#E6321C] hover:bg-white transition-all">
                {feat.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#171717] tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6F6A63] mt-0.5 leading-snug font-medium">
                  {feat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
