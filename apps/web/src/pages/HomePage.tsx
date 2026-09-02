import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCw,
  Palette,
  Layers,
  Zap,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useProducts, useCollections } from '../hooks/useProducts';
import { ProductCard } from '../components/catalog/ProductCard';
import { GarmentMockup } from '../components/garment/GarmentMockup';
import type { GarmentType, GarmentView } from '../components/garment/GarmentMockup';
import { InteractiveTilt } from '../components/ui/InteractiveTilt';

const HERO_COLORS = [
  { name: 'Obsidian Black', hex: '#121318' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Vintage Sand', hex: '#D4C4A8' },
  { name: 'Forest Pine', hex: '#1C3326' },
  { name: 'Crimson Red', hex: '#FE260A' },
];

export function HomePage() {
  const { data: collections = [] } = useCollections();
  const { data: productsData } = useProducts({ limit: 6 });
  const products = productsData?.data || [];

  // Hero interactive state
  const [heroGarment, setHeroGarment] = useState<GarmentType>('tshirt');
  const [heroColor, setHeroColor] = useState(HERO_COLORS[0]);
  const [heroView, setHeroView] = useState<GarmentView>('front');
  const [heroLogoVariant, setHeroLogoVariant] = useState<'red' | 'white' | 'icon'>('red');

  return (
    <div className="overflow-hidden bg-paper">
      {/* ─── 1. ULTRA-PREMIUM EDITORIAL HERO ─── */}
      <section className="relative min-h-[90vh] bg-ink text-white noise-overlay flex items-center justify-center pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Dynamic Glowing Ambient Light Orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-red/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent-gold/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

        <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold High-Fashion Manifesto */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6"
            >
              <span className="h-2 w-2 rounded-full bg-brand-red animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-bold text-white/90">
                SS/2026 ARCHIVE DROP — LIVE
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-display-xl sm:text-display-2xl font-black font-display tracking-tight text-white leading-[1.02]"
            >
              WEAR YOUR <br />
              <span className="text-gradient-red">ORIGINAL MIND.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-body text-white/70 leading-relaxed font-sans"
            >
              Ultra-heavyweight 220 GSM combed organic cotton engineered for Tokyo street cuts and Milan luxury silhouettes. Shop exclusive designer drops or build your vision in our live 2D print studio.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <Link to="/customize" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-hover text-white shadow-glow px-8 py-4 text-button font-mono font-bold tracking-wider"
                >
                  <Sparkles size={18} />
                  LAUNCH 2D STUDIO
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/shop" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white hover:text-ink px-8 py-4 text-button font-mono font-bold tracking-wider backdrop-blur-sm"
                >
                  <ShoppingBag size={18} />
                  EXPLORE DROPS
                </Button>
              </Link>
            </motion.div>

            {/* Live Stats Ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 w-full max-w-md font-mono"
            >
              <div>
                <span className="block text-2xl font-extrabold text-white">220+</span>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">GSM Cotton</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-brand-red">1200</span>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">DPI Ultra Print</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-white">3-5d</span>
                <span className="text-[11px] text-white/50 uppercase tracking-wider">Express Dispatch</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Real-Time 3D Garment Studio Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <InteractiveTilt maxTilt={10} className="w-full max-w-lg">
              <div className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Top Controls: Garment Type Switcher */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                  <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                    {(['tshirt', 'hoodie', 'jacket', 'tote'] as GarmentType[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setHeroGarment(g)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                          heroGarment === g
                            ? 'bg-brand-red text-white shadow-sm'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setHeroView(heroView === 'front' ? 'back' : 'front')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-[10px] font-mono font-bold text-white hover:bg-white/20 transition-all border border-white/10"
                  >
                    <RotateCw size={12} />
                    <span>{heroView.toUpperCase()}</span>
                  </button>
                </div>

                {/* 3D Garment Canvas Showcase */}
                <div className="relative aspect-[4/5] w-full flex items-center justify-center my-4">
                  <GarmentMockup
                    type={heroGarment}
                    view={heroView}
                    colorHex={heroColor.hex}
                    showPrintBoundary={true}
                    className="w-full h-full max-h-[360px]"
                  >
                    {/* Live interactive graphic layer inside print zone */}
                    <div className="flex flex-col items-center justify-center p-2 text-center select-none cursor-pointer transition-transform hover:scale-105">
                      {heroLogoVariant === 'red' && (
                        <img src="/logo.png" alt="Bingooo logo" className="h-9 object-contain drop-shadow-lg" />
                      )}
                      {heroLogoVariant === 'white' && (
                        <img src="/logo-white.png" alt="Bingooo white logo" className="h-9 object-contain drop-shadow-lg" />
                      )}
                      {heroLogoVariant === 'icon' && (
                        <img src="/icon-192.png" alt="Bingooo emblem" className="h-12 w-12 object-contain drop-shadow-lg" />
                      )}
                      <span className="mt-2 text-[9px] font-mono font-bold tracking-widest text-brand-red bg-white/95 px-2 py-0.5 rounded shadow-md uppercase">
                        CUSTOM PRINTS // 2026
                      </span>
                    </div>
                  </GarmentMockup>
                </div>

                {/* Bottom Interactive Toolstrip */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  {/* Swatch Switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/70 uppercase">
                      Colorway: <strong className="text-white">{heroColor.name}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      {HERO_COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setHeroColor(c)}
                          className={`h-6 w-6 rounded-full border-2 transition-all ${
                            heroColor.hex === c.hex
                              ? 'border-brand-red scale-125 shadow-glow'
                              : 'border-white/30 hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Logo / Decal Switcher */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-white/70 uppercase">
                      Decal:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHeroLogoVariant('red')}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                          heroLogoVariant === 'red' ? 'bg-brand-red text-white' : 'bg-white/10 text-white/70'
                        }`}
                      >
                        Red Logo
                      </button>
                      <button
                        onClick={() => setHeroLogoVariant('white')}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                          heroLogoVariant === 'white' ? 'bg-white text-ink' : 'bg-white/10 text-white/70'
                        }`}
                      >
                        White Logo
                      </button>
                      <button
                        onClick={() => setHeroLogoVariant('icon')}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                          heroLogoVariant === 'icon' ? 'bg-accent-gold text-ink' : 'bg-white/10 text-white/70'
                        }`}
                      >
                        Emblem B
                      </button>
                    </div>
                  </div>

                  {/* Quick Direct Link to Studio */}
                  <Link
                    to="/customize"
                    className="mt-2 block w-full py-2.5 rounded-xl bg-white/10 hover:bg-brand-red text-center text-xs font-mono font-bold uppercase tracking-widest text-white transition-all border border-white/10"
                  >
                    Open This Exact Silhouette in Studio →
                  </Link>
                </div>
              </div>
            </InteractiveTilt>
          </div>
        </div>
      </section>

      {/* ─── 2. INFINITE LUXURY MARQUEE TICKER ─── */}
      <div className="bg-brand-red text-white py-3 overflow-hidden border-y border-brand-red-hover select-none shadow-md">
        <div className="flex whitespace-nowrap animate-marquee font-mono text-xs sm:text-sm font-bold tracking-[0.25em] uppercase">
          <span className="mx-6 flex items-center gap-3">
            <Zap size={14} className="fill-white" /> 220 GSM HEAVYWEIGHT COMBED COTTON
          </span>
          <span className="mx-6 flex items-center gap-3">
            <Sparkles size={14} /> 1200 DPI JAPANESE DTG PRINTING
          </span>
          <span className="mx-6 flex items-center gap-3">
            <ShieldCheck size={14} /> BIO-WASHED ZERO SHRINK SILHOUETTES
          </span>
          <span className="mx-6 flex items-center gap-3">
            <Truck size={14} /> EXPRESS DISPATCH ACROSS INDIA
          </span>
          <span className="mx-6 flex items-center gap-3">
            <Zap size={14} className="fill-white" /> 220 GSM HEAVYWEIGHT COMBED COTTON
          </span>
          <span className="mx-6 flex items-center gap-3">
            <Sparkles size={14} /> 1200 DPI JAPANESE DTG PRINTING
          </span>
          <span className="mx-6 flex items-center gap-3">
            <ShieldCheck size={14} /> BIO-WASHED ZERO SHRINK SILHOUETTES
          </span>
          <span className="mx-6 flex items-center gap-3">
            <Truck size={14} /> EXPRESS DISPATCH ACROSS INDIA
          </span>
        </div>
      </div>

      {/* ─── 3. VALUE PROPOSITION & CRAFTSMANSHIP GRID ─── */}
      <section className="border-b border-border bg-white py-12">
        <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-paper/50 border border-border/60">
            <div className="h-12 w-12 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-body font-bold text-ink font-display">Free Express Shipping</h4>
              <p className="text-caption text-muted mt-1 font-sans">
                Complimentary 2-4 day air shipping across India on all orders over ₹999.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-paper/50 border border-border/60">
            <div className="h-12 w-12 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-body font-bold text-ink font-display">220 GSM Organic Cotton</h4>
              <p className="text-caption text-muted mt-1 font-sans">
                Custom double-knit weave, pre-shrunk, bio-polished for butter-soft handfeel.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-paper/50 border border-border/60">
            <div className="h-12 w-12 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h4 className="text-body font-bold text-ink font-display">100-Wash Print Guarantee</h4>
              <p className="text-caption text-muted mt-1 font-sans">
                Nanopigment ink bonding ensures zero cracking, fading, or peeling over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. TRENDING DROPS (Product Showcase) ─── */}
      {products.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                <span className="text-[11px] font-mono font-bold text-brand-red uppercase tracking-widest">
                  CURATED SILHOUETTES
                </span>
              </div>
              <h2 className="text-display-lg font-black text-ink font-display">
                Trending Drops & Archives
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-caption font-mono font-bold text-ink hover:text-brand-red transition-colors group"
            >
              EXPLORE FULL CATALOG
              <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                slug={p.slug}
                basePrice={p.base_price}
                compareAtPrice={p.compare_at_price}
                customizationEnabled={p.customization_enabled}
                category={p.category}
                variants={p.variants}
                images={p.images}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── 5. INTERACTIVE 2D/3D DESIGN LAB TEASER ─── */}
      <section className="bg-ink text-white py-20 relative overflow-hidden noise-overlay">
        <div className="container-page relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-[11px] font-mono font-bold uppercase tracking-widest border border-brand-red/30">
              <Sparkles size={12} />
              PRINT TECHNOLOGY
            </span>
            <h2 className="text-display-lg font-black text-white mt-3 font-display">
              Engineered For Creators
            </h2>
            <p className="mt-3 text-body text-white/70 font-sans">
              Choose from 4 industrial-grade textile print finishes, from high-density embroidery to distressed vintage washes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'High-Def DTG',
                tag: '1200 DPI',
                desc: 'Photorealistic color gamut with zero handfeel stiffness. Breathable and vibrant.',
                icon: Palette,
              },
              {
                title: '3D Puff Foam',
                tag: 'RAISED 2MM',
                desc: 'Tactile, raised dimensional lettering that pops off the garment with bold shadows.',
                icon: Layers,
              },
              {
                title: 'Dense Embroidery',
                tag: '15,000 STITCHES',
                desc: 'Japanese Madeira threads for luxury archival crests and metallic accents.',
                icon: Award,
              },
              {
                title: 'Cracked Vintage',
                tag: 'ACID WASH',
                desc: 'Authentic 90s vintage patina with micro-fracture aesthetics and soft drape.',
                icon: Sparkles,
              },
            ].map((tech, i) => {
              const Icon = tech.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:border-brand-red/60 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                      {tech.tag}
                    </span>
                  </div>
                  <h3 className="text-heading font-bold text-white font-display">
                    {tech.title}
                  </h3>
                  <p className="mt-2 text-caption text-white/60 font-sans leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link to="/customize">
              <Button variant="primary" size="lg" className="bg-brand-red hover:bg-brand-red-hover text-white shadow-glow px-8 py-4 font-mono font-bold">
                <Sparkles size={18} />
                START CREATING YOUR APPAREL
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. CURATED COLLECTIONS EDITORIAL ─── */}
      <section className="bg-paper py-16 sm:py-24 border-b border-border">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono font-bold text-brand-red uppercase tracking-widest">
              CURATED SILHOUETTES
            </span>
            <h2 className="text-display-lg font-black text-ink mt-1 font-display">
              Explore Collections
            </h2>
            <p className="mt-2 text-body text-muted font-sans">
              Tailored heavyweight silhouettes, drop shoulders, and relaxed fits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col: any) => (
              <Link
                to={`/shop?collection=${col.slug}`}
                key={col.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ink text-white p-6 flex flex-col justify-end shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1.5"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="relative z-10">
                  <span className="text-[10px] font-mono font-bold text-accent-gold tracking-widest uppercase">
                    COLLECTION
                  </span>
                  <h3 className="text-heading font-bold text-white font-display group-hover:text-brand-red transition-colors">
                    {col.name}
                  </h3>
                  <p className="mt-1 text-caption text-white/70 line-clamp-2 font-sans">
                    {col.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-caption font-mono font-bold text-brand-red group-hover:translate-x-1 transition-transform">
                    EXPLORE DROP <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. FINAL HIGH-IMPACT STUDIO CTA BANNER ─── */}
      <section className="relative py-20 bg-gradient-to-br from-ink via-steel to-carbon text-white overflow-hidden noise-overlay">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-red/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="container-page relative z-10 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center mb-6 text-brand-red shadow-glow">
            <Sparkles size={32} />
          </div>
          <h2 className="text-display-lg sm:text-display-xl font-black max-w-3xl font-display text-white">
            Transform Your Ideas Into Luxury Streetwear
          </h2>
          <p className="mt-4 max-w-xl text-body text-white/80 leading-relaxed font-sans">
            Pick a garment, upload your artwork or use our official Bingooo decals, customize scale and positioning in 2D/3D, and receive your handcrafted piece at your door in 3-5 days.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/customize">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-red hover:bg-brand-red-hover text-white shadow-glow px-8 py-4 font-mono font-bold tracking-wider"
              >
                <Sparkles size={18} />
                OPEN 2D DESIGN STUDIO
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-ink px-8 py-4 font-mono font-bold tracking-wider"
              >
                BROWSE READY-TO-WEAR
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
