import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Compass,
  Search,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Phone,
  Home,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { SEO } from '../components/common/SEO';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';

const SUGGESTED_DROPS = [
  {
    id: '404-s1',
    title: 'Oversized Heavyweight Tee',
    price: 999,
    category: 'T-Shirts',
    tag: '240 GSM',
    slug: 'oversized-heavyweight-tee',
  },
  {
    id: '404-s2',
    title: 'Streetwear Boxy Hoodie',
    price: 1899,
    category: 'Hoodies',
    tag: '320 GSM Fleece',
    slug: 'streetwear-boxy-hoodie',
  },
  {
    id: '404-s3',
    title: 'Acid Wash Raw Hem Pant',
    price: 1799,
    category: 'Pants',
    tag: 'Atelier Fit',
    slug: 'acid-wash-raw-hem-pant',
  },
];

export function NotFoundPage() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="w-full min-h-[85vh] bg-[#FAF8F5] text-[#171717] py-12 sm:py-20 px-4">
      <SEO
        title="Page Not Found (404)"
        description="The garment or page you are looking for has been moved or does not exist. Explore our 240 GSM heavyweight collection or return to the Bingooo atelier."
        noindex={true}
      />

      <div className="max-w-4xl mx-auto text-center">
        {/* Atelier Logo */}
        <div className="flex justify-center mb-6">
          <Logo variant="red" size="md" withLink />
        </div>

        {/* 404 Headline Badge */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDE0CC] border border-[#DDD3C5] text-[11px] font-mono font-bold uppercase tracking-widest text-[#171717] mb-4"
        >
          <Compass size={13} className="text-[#E6321C]" />
          <span>ERROR 404 &bull; ATELIER ROUTE NOT FOUND</span>
        </motion.div>

        {/* Giant Atelier 404 Typography */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative select-none my-2"
        >
          <span className="font-heading font-black text-7xl sm:text-9xl tracking-tighter text-[#171717]/10 block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#171717]">
              LOST OFF THE <span className="text-[#E6321C]">CUTTING FLOOR</span>
            </h1>
          </div>
        </motion.div>

        {/* Descriptive Copy */}
        <p className="mt-4 text-xs sm:text-sm text-[#6F6A63] font-sans max-w-lg mx-auto leading-relaxed">
          The piece or page you are searching for is not on our current atelier racks. It may have been archived, restyled, or misplaced during our latest drop cycle.
        </p>

        {/* Interactive Search Bar on 404 Page */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-8 max-w-md mx-auto relative flex items-center shadow-xs"
        >
          <Search size={16} className="absolute left-4 text-[#6F6A63] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drops, tees, hoodies, or fits…"
            className="w-full h-12 pl-11 pr-24 rounded-xl border border-[#DDD3C5] bg-white text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 h-9 px-4 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors active:scale-95"
          >
            Find
          </button>
        </form>

        {/* Quick Direct Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-lg mx-auto">
          <Link
            to="/shop"
            className="flex-1 min-w-[160px] min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag size={14} />
            <span>EXPLORE SHOP</span>
          </Link>

          <Link
            to="/customize"
            className="flex-1 min-w-[160px] min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#171717] bg-[#171717] hover:bg-[#E6321C] hover:border-[#E6321C] text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <Sparkles size={14} />
            <span>CUSTOM STUDIO</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#171717] text-[#171717] font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <Home size={14} />
            <span>HOME</span>
          </Link>
        </div>

        {/* Clickable Atelier Phone & WhatsApp Concierge Help Box */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-[#DDD3C5] max-w-md mx-auto shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <p className="text-xs font-heading font-bold uppercase text-[#171717]">
              Need Immediate Atelier Help?
            </p>
            <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
              Call or message our tailors directly in Srikakulam.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:+917981787317"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5] hover:border-[#E6321C] text-[#171717] hover:text-[#E6321C] text-xs font-bold transition-colors"
              aria-label="Call Atelier Phone"
            >
              <Phone size={13} className="text-[#E6321C]" />
              <span>Call</span>
            </a>
            <a
              href={getWhatsAppUrl('Hi Bingooo, I reached a 404 page and need help locating a product.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold transition-colors hover:bg-[#1EBE5D]"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>Chat</span>
            </a>
          </div>
        </div>

        {/* Popular Atelier Drops Shelf */}
        <div className="mt-14 pt-10 border-t border-[#DDD3C5]/70 text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#E6321C] font-bold">
                POPULAR ON THE RACKS
              </span>
              <h2 className="font-heading font-bold text-base sm:text-lg text-[#171717] uppercase tracking-wide">
                Trending Right Now
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-[#E6321C] hover:text-[#B91F12] inline-flex items-center gap-1"
            >
              <span>View Catalog</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUGGESTED_DROPS.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="group p-4 rounded-xl bg-white border border-[#DDD3C5] hover:border-[#E6321C] transition-all shadow-xs hover:shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#6F6A63] tracking-wide">
                    {item.category} &bull; {item.tag}
                  </span>
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-[#171717] group-hover:text-[#E6321C] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="font-heading font-extrabold text-xs text-[#171717]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#DDD3C5] flex items-center justify-center text-[#171717] group-hover:bg-[#E6321C] group-hover:text-white transition-colors shrink-0">
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
