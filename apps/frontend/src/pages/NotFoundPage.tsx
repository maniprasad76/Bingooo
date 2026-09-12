import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Phone } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { WhatsAppIcon, getWhatsAppUrl } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';

const FEATURED_SUGGESTIONS = [
  {
    id: 'sug-1',
    name: 'Classic Logo Tee',
    price: '₹999',
    spec: '240 GSM Oversized',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    link: '/product/classic-oversized-tee',
  },
  {
    id: 'sug-2',
    name: 'Minimal Tee',
    price: '₹1,099',
    spec: 'Heavyweight Cotton',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    link: '/product/minimalist-heavyweight-tee',
  },
  {
    id: 'sug-3',
    name: 'Statement Hoodie',
    price: '₹1,499',
    spec: '400 GSM Winter Fleece',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    link: '/product/heavyweight-fleece-hoodie',
  },
  {
    id: 'sug-4',
    name: 'Bold B Signature Tee',
    price: '₹1,199',
    spec: 'Boxy Streetwear Fit',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=900&q=85',
    link: '/product/bold-signature-tee',
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
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased">
      <SEO
        title="Page Not Found (404) — BINGOOO"
        description="The garment or page you are looking for has been moved or does not exist. Explore our 240 GSM heavyweight collection or return to the Bingooo atelier."
        noindex={true}
      />

      {/* =======================================================
           HERO SECTION (Inspired by HomePage & AboutPage Hero)
      ======================================================= */}
      <section className="min-h-[560px] lg:min-h-[640px] grid grid-cols-1 lg:grid-cols-[48%_52%] bg-[#f7eedb] border-b border-[#ddd3c5]">
        <div className="flex flex-col justify-center py-[65px] px-6 sm:px-10 lg:py-[clamp(50px,7vw,100px)] lg:px-[clamp(30px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#171717] font-mono mb-3">
            BINGOOO / ERROR 404
          </div>

          <h1 className="my-2 mb-5 text-[clamp(46px,6vw,92px)] font-extrabold leading-[0.86] tracking-[-0.07em] uppercase">
            <span className="block text-[#171717]/30 text-2xl sm:text-3xl font-mono tracking-widest mb-1">
              [ 404 ROUTE ]
            </span>
            <span className="block">LOST OFF THE</span>
            <span className="block">CUTTING FLOOR.</span>
            <span className="block text-[#e6321c]">A YOU AWAITS.</span>
          </h1>

          <p className="max-w-[460px] m-0 mb-6 text-[#6f6a63] text-[13px] leading-[1.8]">
            The garment or page you're looking for is no longer on our current atelier racks. It may have been archived or restyled in our newest drop cycle.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="max-w-[420px] mb-8 flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tees, hoodies, or fits..."
                className="w-full h-12 px-4 bg-white border border-[#ddd3c5] border-r-0 text-xs text-[#171717] placeholder:text-[#999] outline-none focus:border-[#171717] transition-colors rounded-none"
              />
              <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f6a63] pointer-events-none" />
            </div>
            <button
              type="submit"
              className="h-12 px-5 bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#e6321c] transition-colors cursor-pointer"
            >
              FIND →
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all"
            >
              SHOP CATALOG →
            </Link>

            <Link
              to="/customize"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[7px] bg-[#e6321c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b91f12] hover:-translate-y-0.5 transition-all"
            >
              CUSTOM STUDIO →
            </Link>

            <Link
              to="/"
              onClick={() => triggerHaptic('light')}
              className="text-[10px] font-bold uppercase tracking-wider text-[#171717] border-b border-black pb-1 hover:text-[#e6321c] hover:border-[#e6321c] transition-colors"
            >
              RETURN HOME
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="h-[350px] sm:h-[450px] lg:h-auto overflow-hidden bg-[#ede0cc]">
          <img
            src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=85"
            alt="Bingooo 404 editorial"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT BANNER (Matching AboutPage Punchline)
      ======================================================= */}
      <section className="py-[clamp(55px,8vw,110px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] font-mono mb-3">
          NAVIGATE THE DROP
        </div>

        <h2 className="max-w-[900px] mx-auto m-0 text-[clamp(32px,5.5vw,70px)] leading-[0.92] font-extrabold tracking-[-0.065em] uppercase text-white">
          NOT EVERY PATH IS STRAIGHT.<br />
          FIND YOUR NEXT <span className="text-[#e6321c]">SIGNATURE FIT.</span>
        </h2>
      </section>

      {/* =======================================================
           POPULAR DROPS SHELF
      ======================================================= */}
      <section className="py-[clamp(50px,7vw,90px)]">
        <div className="container-bingooo">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#e6321c]">
                CURATED PICKS
              </div>
              <h2 className="m-0 mt-1 text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
                TRENDING AT THE ATELIER
              </h2>
            </div>
            <Link
              to="/shop"
              onClick={() => triggerHaptic('light')}
              className="text-[10px] font-bold uppercase border-b border-black pb-1 hover:text-[#e6321c] hover:border-[#e6321c] transition-colors"
            >
              VIEW ALL GARMENTS →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {FEATURED_SUGGESTIONS.map((item) => (
              <article key={item.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ede0cc]">
                  <Link to={item.link} className="block h-full w-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                    />
                  </Link>
                </div>

                <div className="pt-3">
                  <span className="text-[9px] font-mono font-bold uppercase text-[#6f6a63]">
                    {item.spec}
                  </span>
                  <p className="m-0 text-xs sm:text-sm font-semibold text-[#171717]">
                    <Link to={item.link} className="hover:text-[#e6321c] transition-colors">
                      {item.name}
                    </Link>
                  </p>
                  <p className="m-0 mt-1 text-xs sm:text-sm font-bold text-[#171717]">
                    {item.price}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Concierge Help Strip */}
          <div className="mt-14 p-5 sm:p-7 border border-[#ddd3c5] bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#e6321c] mb-1">
                NEED ASSISTANCE?
              </div>
              <h3 className="text-sm sm:text-base font-bold uppercase text-[#171717] m-0">
                Talk to our atelier tailors in Srikakulam
              </h3>
              <p className="text-xs text-[#6f6a63] mt-0.5">
                We're here to help you track down missing garments, orders, or custom ideas.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={getWhatsAppUrl('Hi Bingooo, I reached the 404 page and need help finding a product.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1EBE5D] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp Concierge</span>
              </a>

              <a
                href="tel:+917981787317"
                onClick={() => triggerHaptic('light')}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#ddd3c5] bg-[#faf8f5] text-[#171717] text-xs font-bold uppercase tracking-wider hover:border-[#e6321c] hover:text-[#e6321c] transition-colors"
              >
                <Phone size={13} className="text-[#e6321c]" />
                <span>+91 79817 87317</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
