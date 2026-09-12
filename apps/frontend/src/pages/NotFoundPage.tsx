import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Phone,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Package,
  Ruler,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';

const FEATURED_SUGGESTIONS = [
  {
    id: 'sug-1',
    name: 'Classic Boxy Oversized Tee',
    price: '₹999',
    spec: '240 GSM Combed Cotton',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    link: '/shop',
    badge: 'BESTSELLER',
  },
  {
    id: 'sug-2',
    name: 'Heavyweight Fleece Hoodie',
    price: '₹1,499',
    spec: '320 GSM French Terry',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    link: '/shop',
    badge: 'WINTER DROP',
  },
  {
    id: 'sug-3',
    name: 'Vintage Acid Wash Tee',
    price: '₹1,199',
    spec: '260 GSM Structured Cut',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    link: '/shop',
    badge: 'ARCHIVE',
  },
  {
    id: 'sug-4',
    name: 'Bespoke Custom Print Tee',
    price: '₹1,299',
    spec: '3D Studio Heat-Cured DTF',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=900&q=85',
    link: '/customize',
    badge: 'CUSTOMIZER',
  },
];

export function NotFoundPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <main className="bg-[#F7EEDB] text-[#171717] font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      <SEO
        title="Page Not Found (404) — BINGOOO Atelier"
        description="The garment or page you are looking for has been archived or does not exist. Explore our 240 GSM heavyweight collection or return to the Bingooo atelier."
        noindex={true}
      />

      {/* =======================================================
           TOP BREADCRUMB & ROUTE ARCHIVE STATUS
      ======================================================= */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/60 px-4 sm:px-8 py-3 text-[11px]">
        <div className="container-bingooo flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/" className="hover:text-[#171717] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#6F6A63]">ATELIER NAVIGATION</span>
            <span>/</span>
            <span className="text-[#E6321C] font-bold">[ 404 ROUTE ARCHIVED ]</span>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#171717] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#E6321C] animate-pulse" />
            <span>ROUTE ARCHIVED • ATELIER DISCOVERY ENGINE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* =======================================================
           EDITORIAL SPLIT HERO SECTION
      ======================================================= */}
      <section className="min-h-[580px] lg:min-h-[640px] grid grid-cols-1 lg:grid-cols-[48%_52%] border-b border-[#DDD3C5]">
        {/* Left Editorial Copy */}
        <div className="flex flex-col justify-center py-12 px-6 sm:px-10 lg:py-[clamp(50px,7vw,100px)] lg:px-[clamp(30px,5vw,80px)] bg-[#F7EEDB]">
          <div className="inline-flex items-center gap-2 self-start px-2.5 py-1 bg-[#EDE0CC] border border-[#DDD3C5] text-[#E6321C] text-[10px] font-mono font-bold tracking-[0.2em] uppercase rounded-[2px] mb-4">
            <Compass className="w-3 h-3 text-[#E6321C]" />
            <span>ERROR CODE 404 • UNMAPPED ATELIER ROUTE</span>
          </div>

          <h1 className="my-2 mb-5 text-[clamp(44px,6.2vw,92px)] font-extrabold leading-[0.86] tracking-[-0.07em] uppercase text-[#171717]">
            <span className="block text-[#171717]/30 text-xl sm:text-2xl font-mono tracking-widest mb-1">
              [ 404 NOT FOUND ]
            </span>
            <span className="block">OFF THE CUTTING</span>
            <span className="block">ROOM FLOOR.</span>
            <span className="block text-[#E6321C]">A FRESH FIT AWAITS.</span>
          </h1>

          <p className="max-w-[480px] m-0 mb-6 text-[#6F6A63] text-[13px] leading-[1.8]">
            The garment link, design file, or page you were seeking has been moved or retired from our current drop cycle. Discover our ready-to-wear catalog or create a custom piece in our studio.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-[440px] mb-8 flex shadow-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tees, hoodies, acid wash..."
                className="w-full h-12 px-4 bg-white border border-[#DDD3C5] border-r-0 text-xs font-mono text-[#171717] placeholder:text-[#999] outline-none focus:border-[#171717] rounded-none"
              />
              <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F6A63] pointer-events-none" />
            </div>
            <button
              type="submit"
              className="btn btn-black text-xs h-12 px-6 rounded-none shrink-0"
            >
              SEARCH →
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              onClick={() => triggerHaptic('light')}
              className="btn btn-black text-xs inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>SHOP COLLECTION</span>
            </Link>

            <Link
              to="/customize"
              onClick={() => triggerHaptic('light')}
              className="btn btn-red text-xs inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CUSTOM 3D STUDIO</span>
            </Link>

            <Link
              to="/"
              onClick={() => triggerHaptic('light')}
              className="btn btn-outline text-xs"
            >
              RETURN HOME
            </Link>
          </div>
        </div>

        {/* Right Imagery Banner */}
        <div className="relative min-h-[360px] sm:min-h-[460px] lg:min-h-full overflow-hidden bg-[#171717]">
          <img
            src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo atelier streetwear archive"
            className="w-full h-full object-cover grayscale contrast-125 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/85 via-transparent to-black/20" />

          {/* Overlay Atelier Stamp */}
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#171717]/90 backdrop-blur-md border border-white/10 text-white rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                SRIKAKULAM WORKSHOP • CURATED SELECTION
              </div>
              <div className="text-sm font-bold uppercase tracking-tight">
                Explore Heavyweight Streetwear Essentials
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#DDD3C5]/80 uppercase tracking-widest self-end sm:self-center">
              100% COMBED COTTON
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           DARK PUNCHLINE BANNER
      ======================================================= */}
      <section className="py-16 lg:py-20 px-5 bg-[#171717] text-white text-center border-b border-[#DDD3C5]">
        <div className="container-bingooo max-w-[850px] mx-auto">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#AAAAAA] font-mono mb-3">
            EXPLORE THE ATELIER
          </div>

          <h2 className="m-0 text-[clamp(32px,5.5vw,68px)] leading-[0.92] font-extrabold tracking-[-0.065em] uppercase text-white">
            NOT EVERY PATH IS STRAIGHT.<br />
            FIND YOUR NEXT <span className="text-[#E6321C]">SIGNATURE FIT.</span>
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-3 mt-8 font-mono text-[11px] uppercase tracking-wider text-[#DDD3C5]">
            <Link to="/shop" className="hover:text-white underline">SHOP ALL TEES</Link>
            <span>•</span>
            <Link to="/customize" className="hover:text-white underline">3D CUSTOMIZER</Link>
            <span>•</span>
            <Link to="/size-guide" className="hover:text-white underline">SIZE & FIT GUIDE</Link>
            <span>•</span>
            <Link to="/track-order" className="hover:text-white underline">TRACK ORDER</Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           POPULAR ATELIER PICKS SHELF
      ======================================================= */}
      <section className="py-20 lg:py-28 bg-[#F7EEDB] border-b border-[#DDD3C5]">
        <div className="container-bingooo">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10 pb-4 border-b border-[#DDD3C5]">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                CURATED PICKS
              </div>
              <h2 className="m-0 text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
                TRENDING AT THE ATELIER
              </h2>
            </div>
            <Link
              to="/shop"
              onClick={() => triggerHaptic('light')}
              className="text-link text-[11px] text-[#171717] hover:text-[#E6321C]"
            >
              VIEW FULL CATALOG →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURED_SUGGESTIONS.map((item) => (
              <article key={item.id} className="group flex flex-col bg-white border border-[#DDD3C5] rounded-[2px] overflow-hidden shadow-xs hover:border-[#171717] transition-all">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE0CC]">
                  <Link to={item.link} className="block h-full w-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                    />
                  </Link>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-[2px] bg-[#171717] text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                    {item.badge}
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6F6A63] block mb-1">
                      {item.spec}
                    </span>
                    <h3 className="m-0 text-xs sm:text-sm font-extrabold uppercase tracking-tight text-[#171717]">
                      <Link to={item.link} className="hover:text-[#E6321C] transition-colors">
                        {item.name}
                      </Link>
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#171717]">
                      {item.price}
                    </span>
                    <Link
                      to={item.link}
                      className="font-mono text-[10px] font-bold uppercase text-[#E6321C] hover:underline"
                    >
                      VIEW →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Direct Concierge Strip */}
          <div className="mt-14 p-6 sm:p-8 border border-[#DDD3C5] bg-[#EDE0CC] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                NEED ASSISTANCE?
              </div>
              <h3 className="text-base sm:text-lg font-extrabold uppercase text-[#171717] m-0">
                Talk to our atelier coordinators in Srikakulam
              </h3>
              <p className="text-xs text-[#6F6A63] mt-1">
                We will help you locate archived designs, check order statuses, or draft custom apparel ideas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={getWhatsAppUrl('Hi Bingooo, I reached the 404 page and need help locating a product or order.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="btn btn-black text-xs h-10 px-5 inline-flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>WHATSAPP CONCIERGE</span>
              </a>

              <a
                href="tel:+917981787317"
                onClick={() => triggerHaptic('light')}
                className="btn btn-outline text-xs h-10 px-5 inline-flex items-center gap-2"
              >
                <Phone size={13} className="text-[#E6321C]" />
                <span>+91 79817 87317</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           QUICK DIRECTORY SHORTCUTS
      ======================================================= */}
      <section className="py-14 bg-[#F7EEDB]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/size-guide"
              className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] hover:border-[#171717] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-[#E6321C]" />
                <div>
                  <div className="font-extrabold uppercase text-xs text-[#171717]">Size & Fit Guide</div>
                  <div className="text-[10px] text-[#6F6A63]">Precision garment measurements</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6F6A63]" />
            </Link>

            <Link
              to="/shipping-policy"
              className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] hover:border-[#171717] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-[#171717]" />
                <div>
                  <div className="font-extrabold uppercase text-xs text-[#171717]">Shipping & Delivery</div>
                  <div className="text-[10px] text-[#6F6A63]">Pan-India courier schedules</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6F6A63]" />
            </Link>

            <Link
              to="/returns-refunds"
              className="p-6 bg-white border border-[#DDD3C5] rounded-[2px] hover:border-[#171717] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#238636]" />
                <div>
                  <div className="font-extrabold uppercase text-xs text-[#171717]">Returns & Refunds</div>
                  <div className="text-[10px] text-[#6F6A63]">7-day doorstep size exchange</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6F6A63]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
