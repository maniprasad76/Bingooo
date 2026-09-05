import { Award, PenTool, Heart, Calendar, Shirt, Star, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AboutPage() {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717]">
      {/* ─── 1. ABOUT US HERO ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-center text-left"
          >
            <div className="relative inline-block self-start">
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#171717] uppercase tracking-tight">
                ABOUT US
              </h1>
              <span className="absolute -bottom-2 left-0 w-16 h-[3px] bg-[#E6321C]" />
            </div>

            <h2 className="mt-6 font-heading font-bold text-xl sm:text-2xl text-[#171717] leading-snug">
              We don't just make clothes,<br className="hidden sm:inline" />
              we help you create your identity.
            </h2>

            <p className="mt-4 text-[#6F6A63] text-sm sm:text-base font-sans leading-relaxed max-w-xl">
              Bingooo is more than just a menswear brand. It's a space for self-expression, creativity
              and individuality. From everyday basics to custom creations — we bring your ideas to life
              with premium quality and style.
            </p>

            {/* 3 Circular Feature Badges */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#DDD3C5]/60">
              {/* Badge 1 */}
              <div className="flex flex-col items-start">
                <div className="h-12 w-12 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mb-3">
                  <Award size={24} className="stroke-[1.8]" />
                </div>
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  Premium Quality
                </h4>
                <p className="mt-1 text-xs text-[#6F6A63] font-sans leading-relaxed">
                  Best fabrics & prints you can trust.
                </p>
              </div>

              {/* Badge 2 */}
              <div className="flex flex-col items-start">
                <div className="h-12 w-12 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mb-3">
                  <PenTool size={22} className="stroke-[1.8]" />
                </div>
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  Made for You
                </h4>
                <p className="mt-1 text-xs text-[#6F6A63] font-sans leading-relaxed">
                  Customize it your way. Make it unique.
                </p>
              </div>

              {/* Badge 3 */}
              <div className="flex flex-col items-start">
                <div className="h-12 w-12 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mb-3">
                  <Heart size={22} className="stroke-[1.8]" />
                </div>
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
                  Made with Passion
                </h4>
                <p className="mt-1 text-xs text-[#6F6A63] font-sans leading-relaxed">
                  Crafted with care, delivered with love.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Container (Ready for Admin Upload) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex justify-center lg:justify-end"
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[14/11] overflow-hidden rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] shadow-sm flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none bg-gradient-to-tr from-[#E6D9C5] to-[#F7EEDB]">
                <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#E6321C] mb-2">
                  BINGOOO IDENTITY
                </span>
                <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] uppercase">
                  CREATE YOUR OWN
                </span>
                <p className="mt-3 text-xl sm:text-2xl font-script text-[#6F6A63] max-w-md leading-relaxed">
                  "Wear what feels like you. Expressive streetwear tailored for modern individuality."
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#DDD3C5] text-[11px] font-bold tracking-wider uppercase text-[#171717]">
                  <span>Bingooo Men's Wear</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. OUR JOURNEY SECTION ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-14 border-t border-[#DDD3C5]/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Story & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex flex-col justify-center text-left"
          >
            <div className="relative inline-block self-start mb-5">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
                OUR JOURNEY
              </h2>
              <span className="absolute -bottom-1.5 left-0 w-12 h-[2.5px] bg-[#E6321C]" />
            </div>

            <p className="text-sm text-[#6F6A63] font-sans leading-relaxed">
              Bingooo started with a simple idea — everyone deserves clothes that feel like them.
              We noticed that style is not one-size-fits-all, and personalization is the future.
            </p>

            <p className="mt-4 text-sm text-[#6F6A63] font-sans leading-relaxed">
              So we built Bingooo, a brand where you can choose, customize, and create your own
              style without limits.
            </p>

            {/* 3 Stats in a Row */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-[#DDD3C5]/60">
              <div className="flex flex-col items-start">
                <Calendar size={22} className="text-[#E6321C] mb-2" />
                <span className="font-heading font-black text-2xl sm:text-3xl text-[#171717]">
                  2024
                </span>
                <span className="mt-0.5 text-xs text-[#6F6A63] font-sans">
                  Founded
                </span>
              </div>

              <div className="flex flex-col items-start">
                <Shirt size={22} className="text-[#E6321C] mb-2" />
                <span className="font-heading font-black text-2xl sm:text-3xl text-[#171717]">
                  5000+
                </span>
                <span className="mt-0.5 text-xs text-[#6F6A63] font-sans">
                  Happy Customers
                </span>
              </div>

              <div className="flex flex-col items-start">
                <Star size={22} className="text-[#E6321C] mb-2" />
                <span className="font-heading font-black text-2xl sm:text-3xl text-[#171717]">
                  100+
                </span>
                <span className="mt-0.5 text-xs text-[#6F6A63] font-sans">
                  Unique Designs
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Workshop / Studio Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-6 flex justify-center lg:justify-end"
          >
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-[#EDE0CC] border border-[#DDD3C5] shadow-sm flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none bg-gradient-to-tr from-[#E6D9C5] to-[#F7EEDB]">
                <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-[#E6321C] uppercase">
                  BINGOOO STUDIO
                </span>
                <span className="mt-2 text-xs font-sans text-[#6F6A63] max-w-xs">
                  Design Lab • Custom Print Production • Garment Studio
                </span>
                <div className="mt-4 px-3 py-1 rounded-md bg-white/70 border border-[#DDD3C5] text-[10px] font-bold uppercase tracking-wider text-[#171717]">
                  Crafted in Srikakulam, India
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. OUR PROCESS SECTION ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 sm:py-16 border-t border-[#DDD3C5]/60">
        <div className="text-center mb-10 sm:mb-14">
          <div className="relative inline-block">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
              OUR PROCESS
            </h2>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[2.5px] bg-[#E6321C]" />
          </div>
        </div>

        {/* 4 Process Steps connected by dashed line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {[
            { step: '1. CHOOSE', desc: 'Pick your favorite product from our collection.', icon: Shirt },
            { step: '2. CUSTOMIZE', desc: 'Add your designs, text, or logos.', icon: PenTool },
            { step: '3. PREVIEW', desc: 'See your design live in our 2D studio.', icon: Eye },
            { step: '4. WE DELIVER', desc: 'We print with care and deliver to your doorstep.', icon: ShoppingBag },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-white/60 transition-colors"
              >
                <div className="h-16 w-16 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mb-4 shadow-xs">
                  <Icon size={26} className="stroke-[1.8]" />
                </div>
                <h3 className="font-heading font-bold text-base uppercase tracking-wider text-[#171717]">
                  {item.step}
                </h3>
                <p className="mt-1.5 text-xs text-[#6F6A63] font-sans max-w-[200px] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── 4. MADE FOR EVERY YOU LOOKBOOK ─── */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-16 border-t border-[#DDD3C5]/60">
        <div className="text-center mb-8 sm:mb-10">
          <div className="relative inline-block">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#171717] uppercase tracking-wider">
              MADE FOR EVERY YOU
            </h2>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[2.5px] bg-[#E6321C]" />
          </div>
        </div>

        {/* 5 Garment Cards in a Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          {[
            { id: 1, label: 'HOODIES', sub: 'Heavyweight Fleece' },
            { id: 2, label: 'PACKAGING', sub: 'Bespoke Unboxing' },
            { id: 3, label: 'CHAOS PRINT', sub: 'Streetwear Graphic' },
            { id: 4, label: 'EMBROIDERY', sub: 'Precision Stitch' },
            { id: 5, label: 'OVERSIZED', sub: 'Signature Fit' },
          ].map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-[3/4] sm:aspect-[4/5] last:col-span-2 sm:last:col-span-1 overflow-hidden rounded-xl bg-[#EDE0CC] border border-[#DDD3C5] shadow-xs flex flex-col justify-end p-4 text-left transition-all hover:shadow-md cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent z-10" />
              <div className="relative z-20 text-white">
                <span className="font-heading font-bold text-sm sm:text-base uppercase tracking-wider">
                  {item.label}
                </span>
                <p className="text-[11px] font-sans text-white/80">
                  {item.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action at bottom */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[8px] bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <span>EXPLORE THE COLLECTION</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
