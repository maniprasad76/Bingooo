import { Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Image as ImageIcon,
  Palette,
  Maximize2,
  Phone,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { getWhatsAppUrl } from '../components/ui/SocialIcons';

const PRINT_ZONES = [
  {
    location: 'Front Oversized Graphic',
    dimensionsIn: '12" x 16"',
    pixels300Dpi: '3600 x 4800 px',
    bestFor: 'Bold streetwear center-chest statements, album covers, heavy graphic typography',
  },
  {
    location: 'Back Statement Graphic',
    dimensionsIn: '14" x 18"',
    pixels300Dpi: '4200 x 5400 px',
    bestFor: 'Massive shoulder-to-lower-back mural prints, anime illustrations, festival tour drops',
  },
  {
    location: 'Left Chest Emblem (Pocket Zone)',
    dimensionsIn: '4" x 4"',
    pixels300Dpi: '1200 x 1200 px',
    bestFor: 'Atelier crests, minimal brand logos, monogram typography, subtle initials',
  },
  {
    location: 'Vertical Sleeve Placement',
    dimensionsIn: '3.5" x 12"',
    pixels300Dpi: '1050 x 3600 px',
    bestFor: 'Japanese katakana script, coordinate markers, linear vertical typography',
  },
];

const DOS = [
  'Use 300 DPI high-resolution files for tack-sharp print edge definition.',
  'Export with a 100% transparent background (PNG or vector SVG).',
  'Ensure fine text and lines have a minimum stroke width of 1.5 pt (0.5 mm).',
  'Design in sRGB or Adobe RGB color profiles for maximum DTF pigment vibrancy.',
  'Convert all fonts to curves/outlines when submitting vector PDF/AI files.',
];

const DONTS = [
  'Do NOT submit low-resolution 72 DPI web screenshots or WhatsApp photos.',
  'Do NOT leave a white or solid black square background around your graphic.',
  'Avoid semi-transparent feathering below 10% opacity (creates a visible white adhesive halo).',
  'Avoid copyrighted logos, luxury trademarks, or protected brand intellectual property.',
  'Do NOT invert colors assuming the shirt will act as white ink.',
];

export function ArtworkGuidelinesPage() {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Artwork & Print File Guidelines — Bingooo"
        description="Master guidelines for preparing custom print files for Bingooo: 300 DPI resolution, transparent PNG formats, print safe zones, and vector requirements."
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 space-y-14">
        {/* ─── Breadcrumb & Hero Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#6F6A63] uppercase tracking-wider">
            <Link to="/" className="hover:text-[#E6321C] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#171717] font-bold">Custom Studio</span>
            <span>/</span>
            <span className="text-[#171717]">Artwork Guidelines</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6321C]/10 text-[#E6321C] text-xs font-mono font-bold uppercase tracking-wider">
                <FileCheck size={13} /> Print Preparation Standards
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading uppercase leading-none">
                PREPARE YOUR ARTWORK FOR FLAWLESS TEXTILE PRINTS
              </h1>
              <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed">
                Our 1440 DPI Japanese DTF printers can reproduce photorealistic details, razor-sharp typography, and rich gradients. Follow these standards to guarantee your physical print matches your screen vision perfectly.
              </p>
            </div>

            <Link
              to="/customize"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0 self-start lg:self-auto"
            >
              <Sparkles size={15} />
              <span>Open 3D Studio & Upload</span>
            </Link>
          </div>
        </div>

        {/* ─── The Golden Rules (3 Key Technical Standards) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-[#DDD3C5] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
              <Maximize2 size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase font-heading text-[#171717]">
              300 DPI Resolution
            </h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Always export your graphics at 300 DPI (Dots Per Inch) at actual print size. 72 DPI files look acceptable on phone screens but appear heavily pixelated and blurry when scaled onto a 16" shirt.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DDD3C5] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase font-heading text-[#171717]">
              Transparent Background
            </h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Submit graphics saved as PNG with an Alpha transparency channel. If your graphic has a solid white box or black rectangle around it, that background box will be physically printed onto your shirt.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DDD3C5] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
              <Palette size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase font-heading text-[#171717]">
              Color Profiles & Ink
            </h3>
            <p className="text-xs text-[#6F6A63] leading-relaxed">
              Design using sRGB or Adobe RGB. Our atelier RIP software automatically calculates white underbase density to ensure your colors pop with vivid contrast on dark charcoal and black blanks.
            </p>
          </div>
        </div>

        {/* ─── Do's and Don'ts Comparison ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={20} />
              <h3 className="text-base font-bold uppercase font-heading text-[#171717]">
                Best Practices (DO)
              </h3>
            </div>
            <ul className="space-y-3">
              {DOS.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[#171717]">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-[#E6321C]">
              <XCircle size={20} />
              <h3 className="text-base font-bold uppercase font-heading text-[#171717]">
                Common Mistakes (AVOID)
              </h3>
            </div>
            <ul className="space-y-3">
              {DONTS.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[#171717]">
                  <XCircle size={14} className="text-[#E6321C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Print Zones & Maximum Dimensions Table ─── */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6321C] font-mono">
              PLACEMENT & SCALING
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-heading text-[#171717]">
              Atelier Print Zones & Dimensions
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DDD3C5] bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7EEDB] border-b border-[#DDD3C5] font-heading font-extrabold uppercase text-[#171717]">
                  <th className="p-4 sm:p-5 w-1/4">Print Location</th>
                  <th className="p-4 sm:p-5 w-1/5">Max Dimensions</th>
                  <th className="p-4 sm:p-5 w-1/5">Pixel Size @ 300 DPI</th>
                  <th className="p-4 sm:p-5 w-1/3">Recommended Design Style</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD3C5]/60">
                {PRINT_ZONES.map((zone, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#171717] font-heading uppercase text-[11px]">
                      {zone.location}
                    </td>
                    <td className="p-4 sm:p-5 font-mono font-bold text-[#E6321C]">
                      {zone.dimensionsIn}
                    </td>
                    <td className="p-4 sm:p-5 font-mono text-[#6F6A63]">
                      {zone.pixels300Dpi}
                    </td>
                    <td className="p-4 sm:p-5 text-[#6F6A63]">
                      {zone.bestFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Need Help Preparing Your Files? CTA Box ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F7EEDB] border border-[#DDD3C5] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#E6321C]" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-heading text-[#171717]">
              Unsure if your artwork is print-ready?
            </h3>
          </div>
          <p className="text-xs text-[#6F6A63] leading-relaxed max-w-2xl">
            Don't worry! If you are uncertain about background transparency, resolution, or color format, you can send your design to our atelier design desk via WhatsApp. Our graphic technicians will inspect and vectorize your artwork free of charge.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href={getWhatsAppUrl('Hi Bingooo Atelier, could you please check if my artwork is print-ready for a custom tee?')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
            >
              <Phone size={14} />
              <span>Send Artwork for Free Verification</span>
            </a>
            <Link
              to="/customize"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171717] hover:text-[#E6321C]"
            >
              <span>Test File in 3D Customizer</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
