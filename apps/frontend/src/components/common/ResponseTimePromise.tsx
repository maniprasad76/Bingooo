import {
  Clock,
  Zap,
  Truck,
  MessageCircle,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResponseTimePromiseProps {
  /** Display style variant */
  variant?: 'section' | 'compact' | 'banner';
  className?: string;
}

export function ResponseTimePromise({
  variant = 'section',
  className = '',
}: ResponseTimePromiseProps) {

  // ─── Banner Variant ───
  if (variant === 'banner') {
    return (
      <div className={`bg-[#171717] text-white border-y border-[#DDD3C5]/20 py-2.5 px-4 ${className}`}>
        <div className="mx-auto max-w-[1360px] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#238636]" />
            <span className="font-bold tracking-wider text-[#F7EEDB] uppercase text-[11px]">
              Atelier Service Guarantee:
            </span>
            <span className="text-[#DDD3C5]">Average reply under 18 mins</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-medium text-[#EDE0CC]/90">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-[#E6321C]" />
              <strong>&lt; 24h</strong> Proofing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap size={13} className="text-[#E6321C]" />
              <strong>48h</strong> Dispatch
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <Truck size={13} className="text-[#E6321C]" />
              Air Express Delivery
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Compact Variant ───
  if (variant === 'compact') {
    return (
      <div className={`rounded-xl border border-[#DDD3C5] bg-white p-4 space-y-3 font-sans ${className}`}>
        <div className="flex items-center justify-between border-b border-[#DDD3C5]/70 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
            Atelier Standards &amp; Timeline
          </span>
          <span className="text-[10px] font-bold text-[#238636] uppercase tracking-wider">
            Verified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5]/60">
            <div className="flex items-center gap-1.5 text-[#E6321C] mb-1">
              <Clock size={13} />
              <span className="font-bold text-[#171717]">&lt; 24h Proofing</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Direct artisan approval</p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5]/60">
            <div className="flex items-center gap-1.5 text-[#E6321C] mb-1">
              <Zap size={13} />
              <span className="font-bold text-[#171717]">48h Dispatch</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Hand-inspected batch</p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5]/60">
            <div className="flex items-center gap-1.5 text-[#238636] mb-1">
              <MessageCircle size={13} />
              <span className="font-bold text-[#171717]">&lt; 2h Support</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">Live human assistance</p>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5]/60">
            <div className="flex items-center gap-1.5 text-[#E6321C] mb-1">
              <Truck size={13} />
              <span className="font-bold text-[#171717]">Air Express</span>
            </div>
            <p className="text-[10px] text-[#6F6A63]">3–5 days pan-India</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Editorial Showcase Cards (Section Variant) ───
  const stages = [
    {
      phase: 'STAGE 01',
      metricNumber: '<24',
      metricUnit: 'HOURS',
      title: 'Digital Custom Proofing',
      description:
        'Upload your artwork or text. Studio artisans verify scaling, resolution, and chest placement before production begins.',
      guarantee: 'Guaranteed 24-Hour Approval',
      icon: Clock,
    },
    {
      phase: 'STAGE 02',
      metricNumber: '<2',
      metricUnit: 'HOURS',
      title: 'Human Concierge Chat',
      description:
        'No automated bot replies. Message our dedicated styling team on WhatsApp for size advice, edits, and live updates.',
      guarantee: 'Live Mon–Sat 10am–7pm',
      icon: MessageCircle,
    },
    {
      phase: 'STAGE 03',
      metricNumber: '48',
      metricUnit: 'HOURS',
      title: 'Workshop Craft & Dispatch',
      description:
        'From high-density direct printing to precision embroidery, every 240 GSM garment is wash-tested and double-checked.',
      guarantee: 'Wash-Tested & Double-Inspected',
      icon: Zap,
    },
    {
      phase: 'STAGE 04',
      metricNumber: '3–5',
      metricUnit: 'DAYS',
      title: 'Air-Express Doorstep Delivery',
      description:
        'Shipped via top-tier express air logistics with real-time automated tracking links sent directly to your phone.',
      guarantee: 'Free Shipping Above ₹999',
      icon: Truck,
    },
  ];

  return (
    <section className={`w-full font-sans ${className}`}>
      {/* Container with warm editorial luxury surface */}
      <div className="rounded-3xl border border-[#DDD3C5] bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#F5ECE0]/60 p-6 sm:p-10 lg:p-12 shadow-[0_12px_40px_rgba(23,23,23,0.03)]">
        
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 pb-6 border-b border-[#DDD3C5]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#E6321C]" />
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-[0.22em] text-[#E6321C]">
                Atelier Standards
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase text-[#171717] tracking-tight">
              Our Response Time &amp; Quality Promise
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6F6A63] max-w-md leading-relaxed">
            We treat men's fashion as an exacting craft. Transparent timelines, rapid studio turnaround, and real artisans answering your questions.
          </p>
        </div>

        {/* ── 4 Hero Cards with Big Sculptural Metric Numbers ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stages.map((stage) => {
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.phase}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#DDD3C5] bg-white p-6 transition-all duration-300 hover:border-[#E6321C]/70 hover:shadow-[0_16px_36px_rgba(230,50,28,0.1)]"
              >
                <div>
                  {/* Stage tag & Icon */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-[#DDD3C5]/60 mb-4">
                    <span className="font-heading font-extrabold text-[10px] tracking-[0.16em] uppercase text-[#6F6A63]">
                      {stage.phase}
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-[#171717] group-hover:bg-[#E6321C] group-hover:text-white transition-colors">
                      <Icon size={14} />
                    </div>
                  </div>

                  {/* Big Sculptural Hero Number */}
                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="font-heading font-black text-4xl sm:text-[44px] text-[#171717] tracking-tight leading-none group-hover:text-[#E6321C] transition-colors">
                      {stage.metricNumber}
                    </span>
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#6F6A63]">
                      {stage.metricUnit}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-black text-base sm:text-[17px] text-[#171717] uppercase tracking-tight mt-3 mb-2 leading-snug">
                    {stage.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#6F6A63] font-sans leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                {/* Bottom Guarantee Badge */}
                <div className="mt-6 pt-3.5 border-t border-[#DDD3C5]/60 flex items-center gap-1.5 text-[11px] font-bold text-[#171717]">
                  <Check size={13} className="text-[#238636] shrink-0 stroke-[2.5]" />
                  <span className="truncate">{stage.guarantee}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
