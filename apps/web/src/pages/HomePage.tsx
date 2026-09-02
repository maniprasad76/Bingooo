import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useProducts, useCollections } from '../hooks/useProducts';
import { ProductCard } from '../components/catalog/ProductCard';
import { Logo } from '../components/ui/Logo';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function HomePage() {
  const { data: collections = [] } = useCollections();
  const { data: productsData } = useProducts({ limit: 3 });
  const products = productsData?.data || [];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="container-page relative z-10 flex min-h-[75vh] flex-col items-center justify-center py-20 text-center sm:min-h-[85vh]">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="mb-4"
          >
            <Logo variant="red" size="xl" className="filter drop-shadow-[0_4px_24px_rgba(254,38,10,0.4)]" />
          </motion.div>

          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
          >
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/90">
              India's Premier Custom Fashion
            </span>
          </motion.div>

          <motion.h1
            className="text-display-xl text-balance max-w-4xl font-extrabold"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
          >
            Wear Your Mind.
            <br />
            <span className="text-accent">Design Your Statement.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-body text-white/80 leading-relaxed text-balance"
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
          >
            Ultra-heavyweight 220 GSM combed cotton meets an interactive 2D design studio. Shop exclusive ready-to-wear drops or print your original artwork.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            <Link to="/shop">
              <Button variant="secondary" size="lg" className="bg-white text-ink hover:bg-white/90 shadow-lg">
                <ShoppingBag size={18} />
                Explore Catalog
              </Button>
            </Link>
            <Link to="/customize">
              <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-white shadow-lg">
                <Sparkles size={18} />
                Launch Design Studio
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/95 to-ink" />
      </section>

      {/* Value Badges */}
      <section className="border-b border-border bg-paper py-6">
        <div className="container-page grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Truck size={22} className="text-accent" />
            <div className="text-left">
              <h4 className="text-caption font-bold text-ink">Free Express Shipping</h4>
              <p className="text-xs text-muted">On all orders above ₹999 across India</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ShieldCheck size={22} className="text-accent" />
            <div className="text-left">
              <h4 className="text-caption font-bold text-ink">220 GSM Pure Cotton</h4>
              <p className="text-xs text-muted">Bio-washed, pre-shrunk premium canvas</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <RotateCcw size={22} className="text-accent" />
            <div className="text-left">
              <h4 className="text-caption font-bold text-ink">Easy 7-Day Returns</h4>
              <p className="text-xs text-muted">Hassle-free exchange policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Drops */}
      {products.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-caption font-bold text-accent uppercase tracking-widest">
                New Arrivals
              </span>
              <h2 className="text-display-lg font-bold text-ink mt-1">Trending Drops</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-caption font-bold text-ink hover:text-accent transition-colors"
            >
              View Full Collection <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Featured Collections */}
      <section className="bg-paper py-16 sm:py-24 border-y border-border">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="text-caption font-bold text-accent uppercase tracking-widest">
              Curated Style
            </span>
            <h2 className="text-display-lg font-bold text-ink mt-1">Explore Collections</h2>
            <p className="mt-2 text-body text-muted">Tailored silhouettes and vibrant colorways</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col: any) => (
              <Link
                to={`/shop?collection=${col.slug}`}
                key={col.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-ink text-white p-6 flex flex-col justify-end shadow-md transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-heading font-bold text-white group-hover:text-accent transition-colors">
                    {col.name}
                  </h3>
                  <p className="mt-1 text-caption text-white/70 line-clamp-2">{col.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-accent">
                    Explore Drop <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customise CTA Studio Banner */}
      <section className="bg-accent text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="container-page flex flex-col items-center text-center relative z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-6 shadow-inner">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-display-lg font-black max-w-2xl">
            Customise Your Apparel in Seconds
          </h2>
          <p className="mt-4 max-w-xl text-body text-white/90 leading-relaxed text-balance">
            Pick a garment, upload your high-resolution artwork or add custom typography, preview in real-time, and get it delivered in 3-5 days.
          </p>
          <Link to="/customize" className="mt-8">
            <Button variant="secondary" size="lg" className="bg-white text-ink hover:bg-white/90 font-bold px-8 shadow-xl">
              Open Custom Design Studio
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
