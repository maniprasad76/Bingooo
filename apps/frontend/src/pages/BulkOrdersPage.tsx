import { useState } from 'react';
import {
  Users,
  Phone,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getWhatsAppUrl } from '../components/ui/SocialIcons';

const TIERS = [
  {
    tier: 'Tier 1',
    qty: '25 – 49 Units',
    discount: '15% OFF',
    desc: 'Perfect for student clubs, department fests, and small creative teams.',
    features: ['Free digital mockup review', 'Mix & match garment sizes', 'Standard 3-5 day dispatch', 'All-India courier shipping'],
  },
  {
    tier: 'Tier 2',
    qty: '50 – 99 Units',
    discount: '25% OFF',
    popular: true,
    desc: 'Ideal for tech startups, annual college festivals, and sports events.',
    features: ['Free digital 3D rendering', 'Free custom printed inner neck-tags', 'Priority queue in printing line', 'GST invoice for input tax credit'],
  },
  {
    tier: 'Tier 3',
    qty: '100 – 299 Units',
    discount: '35% OFF',
    desc: 'Suited for corporate conferences, campus-wide merchandise, and brand drops.',
    features: ['Free physical pre-production sample', 'Custom brand polybag packaging', 'Individual barcode labelling', 'Expedited air cargo delivery'],
  },
  {
    tier: 'Enterprise',
    qty: '300+ Units',
    discount: '45% OFF',
    desc: 'Custom manufacturing for streetwear labels, enterprise fleets, and retail distribution.',
    features: ['Custom Pantone color dye runs', 'Woven satin branding labels', 'Dedicated B2B atelier manager', 'Split-shipment to multi-city offices'],
  },
];

export function BulkOrdersPage() {
  const [garmentType, setGarmentType] = useState<'tee' | 'hoodie' | 'shirt'>('tee');
  const [quantity, setQuantity] = useState<number>(75);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    org: '',
    phone: '',
    email: '',
    requirements: '',
  });

  const getBasePrice = () => {
    if (garmentType === 'tee') return 699;
    if (garmentType === 'hoodie') return 1299;
    return 899;
  };

  const getDiscountPercent = (q: number) => {
    if (q >= 300) return 45;
    if (q >= 100) return 35;
    if (q >= 50) return 25;
    if (q >= 25) return 15;
    return 0;
  };

  const basePrice = getBasePrice();
  const discountPct = getDiscountPercent(quantity);
  const discountedPricePerPiece = Math.round(basePrice * (1 - discountPct / 100));
  const estimatedTotal = discountedPricePerPiece * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen py-10 sm:py-16 font-sans">
      <SEO
        title="Bulk Apparel Orders & Wholesale Custom Merch"
        description="Wholesale and bulk custom manufacturing for corporate teams, college festivals, and streetwear brands. Up to 45% volume discount, free mockups, and GST invoicing."
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 space-y-14">
        {/* ─── Breadcrumb & Hero Header ─── */}
        <div className="space-y-4 text-left border-b border-[#DDD3C5] pb-10">
          <Breadcrumbs
            items={[
              { name: 'Custom Studio', url: '/customize' },
              { name: 'Bulk Orders', url: '/bulk-orders' },
            ]}
          />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6321C]/10 text-[#E6321C] text-xs font-mono font-bold uppercase tracking-wider">
                <Users size={13} /> Wholesale & Team Manufacturing
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#171717] font-heading uppercase leading-none">
                CUSTOM APPAREL FOR TEAMS, BRANDS & FESTIVALS
              </h1>
              <p className="text-sm sm:text-base text-[#6F6A63] leading-relaxed">
                Whether you need 25 oversized tees for a college fest or 500 heavyweight hoodies for a corporate launch, our Srikakulam Atelier handles printing, embroidery, custom neck-tags, and pan-India dispatch.
              </p>
            </div>

            <a
              href={getWhatsAppUrl('Hi Bingooo, I would like to request a bulk order quotation for custom apparel.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors shrink-0 self-start lg:self-auto"
            >
              <Phone size={14} />
              <span>Direct WhatsApp B2B Desk</span>
            </a>
          </div>
        </div>

        {/* ─── Interactive Volume Price Estimator ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDD3C5]/60 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#E6321C] tracking-widest">
                INSTANT WHOLESALE ESTIMATOR
              </span>
              <h2 className="text-xl font-black uppercase font-heading text-[#171717]">
                Estimate Your Bulk Savings
              </h2>
            </div>
            <span className="text-xs text-[#6F6A63] font-mono">
              *All prices include 240+ GSM blank + custom DTF printing
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Garment Selector */}
              <div>
                <label className="block text-xs font-bold uppercase font-heading text-[#171717] mb-2">
                  Select Garment Base:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setGarmentType('tee')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      garmentType === 'tee'
                        ? 'bg-[#E6321C] text-white border-[#E6321C] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#171717] border-[#DDD3C5] hover:bg-[#EDE0CC]'
                    }`}
                  >
                    240 GSM Tee
                  </button>
                  <button
                    type="button"
                    onClick={() => setGarmentType('hoodie')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      garmentType === 'hoodie'
                        ? 'bg-[#E6321C] text-white border-[#E6321C] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#171717] border-[#DDD3C5] hover:bg-[#EDE0CC]'
                    }`}
                  >
                    380 GSM Hoodie
                  </button>
                  <button
                    type="button"
                    onClick={() => setGarmentType('shirt')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      garmentType === 'shirt'
                        ? 'bg-[#E6321C] text-white border-[#E6321C] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#171717] border-[#DDD3C5] hover:bg-[#EDE0CC]'
                    }`}
                  >
                    Textured Shirt
                  </button>
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="bulk-qty-slider" className="text-xs font-bold uppercase font-heading text-[#171717]">
                    Order Quantity:
                  </label>
                  <span className="text-lg font-black font-mono text-[#E6321C]">{quantity} Units</span>
                </div>
                <input
                  id="bulk-qty-slider"
                  type="range"
                  min="25"
                  max="500"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE0CC] rounded-lg appearance-none cursor-pointer accent-[#E6321C]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6F6A63]">
                  <span>25 pcs (Min)</span>
                  <span>100 pcs</span>
                  <span>250 pcs</span>
                  <span>500+ pcs</span>
                </div>
              </div>
            </div>

            {/* Calculated Quote Output Box */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F7EEDB] border border-[#DDD3C5] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#6F6A63]">Tier Discount Applied</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E6321C] text-white text-[10px] font-black font-mono">
                  {discountPct}% OFF
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6F6A63] block">Price Per Unit</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-heading text-[#171717]">₹{discountedPricePerPiece}</span>
                  <span className="text-sm font-semibold line-through text-[#6F6A63]">₹{basePrice}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DDD3C5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63]">Estimated Total</span>
                  <p className="text-lg font-black font-heading text-[#E6321C]">₹{estimatedTotal.toLocaleString('en-IN')}</p>
                </div>
                <a
                  href={getWhatsAppUrl(`Hi Bingooo, I want a quote for ${quantity} units of ${garmentType.toUpperCase()} at approx ₹${discountedPricePerPiece}/pc.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#171717] hover:bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Lock This Rate
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Wholesale Tier Cards ─── */}
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6321C] font-mono">
              VOLUME PRICING STRUCTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-heading text-[#171717]">
              Transparent Pricing Tiers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 shadow-2xs ${
                  tier.popular
                    ? 'bg-white border-[#E6321C] ring-2 ring-[#E6321C]/20'
                    : 'bg-white border-[#DDD3C5]'
                }`}
              >
                <div className="space-y-3">
                  {tier.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E6321C] text-white text-[9px] font-black uppercase tracking-widest font-mono inline-block">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <span className="text-xs font-mono font-bold text-[#6F6A63] uppercase">{tier.tier}</span>
                    <h3 className="text-lg font-black font-heading uppercase text-[#171717] mt-0.5">
                      {tier.qty}
                    </h3>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F7EEDB] text-[#E6321C] font-black text-xl font-mono text-center">
                    {tier.discount}
                  </div>

                  <p className="text-xs text-[#6F6A63] leading-relaxed">
                    {tier.desc}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-[#DDD3C5]/60">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-[#171717]">
                        <CheckCircle2 size={13} className="text-[#E6321C] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Quote Request Form Section ─── */}
        <div className="p-6 sm:p-10 rounded-2xl bg-white border border-[#DDD3C5] shadow-xs space-y-6">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6321C] font-mono">
              GET A FORMAL QUOTATION
            </span>
            <h2 className="text-2xl font-black uppercase font-heading text-[#171717]">
              Submit Your Bulk Requirements
            </h2>
            <p className="text-xs text-[#6F6A63]">
              Our B2B merchandising team will get back to you with free digital mockups and pricing within 2 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-xl bg-[#FDF0EE] border border-[#E6321C]/30 text-center space-y-3">
              <CheckCircle2 size={32} className="text-[#E6321C] mx-auto" />
              <h3 className="text-lg font-bold font-heading uppercase text-[#171717]">
                Quotation Request Received!
              </h3>
              <p className="text-xs text-[#6F6A63] max-w-md mx-auto">
                Thank you, {formData.name || 'there'}. Our atelier production coordinator will reach out to {formData.phone || formData.email} shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#6F6A63] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#E6321C] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#6F6A63] mb-1">
                    Organization / College / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    placeholder="e.g. IIT Madras Fest / TechCorp"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#E6321C] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#6F6A63] mb-1">
                    WhatsApp Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#E6321C] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#6F6A63] mb-1">
                    Business Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@organization.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#E6321C] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#6F6A63] mb-1">
                  Tell us about your requirements (Quantities, colors, deadline, print locations)
                </label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Need 80 black oversized tees with front pocket logo and large back artwork for our annual hackathon by October 15..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD3C5] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#E6321C] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                <Send size={14} />
                <span>Submit Bulk Request</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
