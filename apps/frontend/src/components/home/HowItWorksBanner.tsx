import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Eye,
  ShoppingBag,
  Package,
  ArrowRight,
} from 'lucide-react';

export function HowItWorksBanner() {
  const steps = [
    {
      num: '1',
      title: '1. UPLOAD',
      desc: 'Upload your image or artwork.',
      icon: <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-[#171717]" strokeWidth={1.5} />,
    },
    {
      num: '2',
      title: '2. CUSTOMIZE',
      desc: 'Adjust size, placement, colors and more.',
      // Custom SVG T-shirt with magic customization pen/ruler style
      icon: (
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 text-[#171717]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          <path d="M12 11v5" />
          <path d="M10 13h4" />
        </svg>
      ),
    },
    {
      num: '3',
      title: '3. PREVIEW',
      desc: 'See your design come to life on premium wear.',
      icon: <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-[#171717]" strokeWidth={1.5} />,
    },
    {
      num: '4',
      title: '4. ORDER',
      desc: 'Place your order securely.',
      icon: <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-[#171717]" strokeWidth={1.5} />,
    },
    {
      num: '5',
      title: '5. WEAR IT',
      desc: 'Get it delivered and wear your story.',
      icon: <Package className="w-7 h-7 sm:w-8 sm:h-8 text-[#171717]" strokeWidth={1.5} />,
    },
  ];

  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-4 sm:py-6">
      <Link
        to="/customize"
        className="block bg-[#F5EFE6] border border-[#DDD3C5]/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        {/* Title */}
        <h2 className="text-center font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-[0.18em] text-[#171717] mb-8 sm:mb-10">
          Create. Customize. Wear.
        </h2>

        {/* 5 Steps Grid with Connecting Arrows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 items-start relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="flex flex-col items-center text-center relative group-hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Icon Container */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-2.5 flex items-center justify-center">
                {step.icon}
              </div>

              {/* Step Title */}
              <h3 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-[#171717]">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="mt-1 text-[11px] sm:text-xs text-[#6F6A63] leading-relaxed max-w-[170px]">
                {step.desc}
              </p>

              {/* Connecting Arrow for Desktop (between steps) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-5 -right-3 sm:-right-4 text-[#171717]/35 pointer-events-none">
                  <ArrowRight size={18} strokeWidth={1.6} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Link>
    </section>
  );
}
