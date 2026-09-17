import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Truck, Package, Sparkles, ShieldCheck, CheckCircle2, Mail, ArrowRight, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { generateOrganizationSchema, generateWebSiteSchema, generateLocalBusinessSchema } from '../lib/seo/schema';
import { BINGOOO_INSTAGRAM_URL, getWhatsAppUrl, WhatsAppIcon, InstagramIcon } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { api } from '../lib/api/client';
import { prefetchProduct } from '../lib/utils/preloader';

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  swatches: string[];
  link: string;
}

const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: 'prod-1',
    name: 'Classic Logo Tee',
    price: '₹999',
    image: '',
    swatches: ['#171717', '#ffffff', '#d9cbb8'],
    link: '/product/classic-oversized-tee',
  },
  {
    id: 'prod-2',
    name: 'Minimal Tee',
    price: '₹1,099',
    image: '',
    swatches: ['#171717', '#d9cbb8', '#ffffff'],
    link: '/product/minimalist-heavyweight-tee',
  },
  {
    id: 'prod-3',
    name: 'Statement Hoodie',
    price: '₹1,499',
    image: '',
    swatches: ['#171717', '#8d8984', '#d9cbb8'],
    link: '/product/heavyweight-fleece-hoodie',
  },
  {
    id: 'prod-4',
    name: 'Bold B Tee',
    price: '₹1,199',
    image: '',
    swatches: ['#171717', '#ffffff', '#8d8984'],
    link: '/product/bold-signature-tee',
  },
];

interface CommunityFit {
  id: string;
  src: string;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  objectPos?: string;
}

const COMMUNITY_FITS: CommunityFit[] = [
  {
    id: 'fit-campaign',
    src: '/real-fit-3.jpg',
    alt: 'Bingooo — Wear What Defines You campaign look',
    badge: 'CAMPAIGN',
    title: 'Wear What Defines You',
    subtitle: 'Storefront Atelier',
    objectPos: 'object-[35%_center]',
  },
  {
    id: 'fit-white-tee',
    src: '/real-fit-2.jpg',
    alt: 'Bingooo — Classic Heavyweight Oversized Tee in Off-White',
    badge: 'OVERSIZED TEE',
    title: 'Off-White Heavyweight',
    subtitle: '240 GSM Cotton',
    objectPos: 'object-center',
  },
  {
    id: 'fit-olive-hoodie',
    src: '/real-fit-1.jpg',
    alt: 'Bingooo — Heavyweight Fleece Hoodie in Forest Olive',
    badge: 'HOODIE DROP',
    title: 'Fleece Hoodie',
    subtitle: '380 GSM Fleece',
    objectPos: 'object-center',
  },
  {
    id: 'fit-kraft-bag',
    src: '/real-fit-4.jpg',
    alt: 'Bingooo — Real You. Real Fit. Signature Kraft Tote & Packaging',
    badge: 'REAL YOU. REAL FIT.',
    title: 'Signature Kraft',
    subtitle: 'Real You. Real Fit.',
    objectPos: 'object-center',
  },
  {
    id: 'fit-street-walk',
    src: '/real-fit-5.jpg',
    alt: 'Bingooo — Street style everyday culture with Bingooo bag',
    badge: 'STREET STYLE',
    title: 'Everyday Culture',
    subtitle: 'Streetwear Fits',
    objectPos: 'object-center',
  },
  {
    id: 'fit-couple-walk',
    src: '/real-fit-6.jpg',
    alt: 'Bingooo — Real You. Real Fit. couple streetwear lookbook with shopping bags',
    badge: 'COMMUNITY',
    title: 'Real You. Real Fit.',
    subtitle: 'Better Outfits. Brighter Days.',
    objectPos: 'object-center',
  },
];

export function HomePage() {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedFitIndex, setSelectedFitIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedFitIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFitIndex(null);
      if (e.key === 'ArrowLeft') {
        setSelectedFitIndex((prev) => (prev !== null ? (prev === 0 ? COMMUNITY_FITS.length - 1 : prev - 1) : null));
      }
      if (e.key === 'ArrowRight') {
        setSelectedFitIndex((prev) => (prev !== null ? (prev === COMMUNITY_FITS.length - 1 ? 0 : prev + 1) : null));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedFitIndex]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@') || isSubscribing) return;
    setIsSubscribing(true);
    try {
      await api.post('/users/newsletter', { email: email.trim() }).catch(() => {
        // Fallback gracefully if mock/dev backend does not persist newsletter
      });
      setSubscribed(true);
      setEmail('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased selection:bg-[#e6321c] selection:text-white">
      <SEO
        title="BINGOOO — Wear What Defines You"
        description="BINGOOO — Men's fashion, custom designs and clothing culture. Shop 240–280 GSM heavyweight streetwear or design your own in our 3D Atelier."
        keywords="mens wear, oversized tees, streetwear, custom t-shirts, hoodies, bingooo, heavyweight cotton, indian streetwear"
        canonical="https://bingooo.in"
        schema={[generateOrganizationSchema(), generateWebSiteSchema(), generateLocalBusinessSchema()]}
      />

      {/* =========================================================
          HERO SECTION — 100% Full Width Edge-to-Edge All Devices
      ========================================================= */}
      <section className="relative w-full min-h-[min(680px,calc(100vh-90px))] md:min-h-[min(720px,calc(100vh-104px))] overflow-hidden bg-[#f7eedb] m-0 p-0">
        {/* Full-bleed Hero Campaign Imagery — No Left/Right Bounds */}
        <div className="absolute inset-0 md:left-[36%] lg:left-[40%] xl:left-[42%] overflow-hidden pointer-events-none z-0">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=85"
            alt="Bingooo fashion campaign"
            className="h-full w-full object-cover object-top md:object-center grayscale"
          />
          {/* Gradient Overlay: Vertical blend on mobile, Horizontal blend on desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f7eedb] via-[#f7eedb]/75 to-[#f7eedb]/20 md:hidden" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#f7eedb] via-[#f7eedb]/60 to-transparent" />
        </div>

        {/* Hero Content — Full Width Grid with Edge-Aware Padding */}
        <div className="w-full min-h-[inherit] relative z-10 flex items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[620px] py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="eyebrow max-w-[140px] leading-[1.8] mb-6 sm:mb-7 text-[#171717]">
              CLOTHING<br />
              CUSTOM<br />
              CULTURE<br />
              BINGOOO
            </div>

            <h1 className="m-0 mb-6 sm:mb-8 text-[clamp(44px,6.8vw,96px)] font-extrabold leading-[0.84] tracking-[-0.07em] uppercase text-[#171717]">
              WEAR WHAT<br />
              DEFINES<br />
              YOU<span className="text-[#e6321c]">.</span>
            </h1>

            <p className="my-5 mb-6 text-[11px] font-semibold tracking-[0.34em] uppercase text-[#171717]">
              WEAR WHAT DEFINES YOU.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                to="/shop"
                className="btn btn-red min-h-[52px] px-8 text-xs font-extrabold tracking-wider w-full sm:w-auto shadow-[0_6px_22px_rgba(230,50,28,0.35)] hover:shadow-[0_8px_28px_rgba(230,50,28,0.45)] group justify-center cursor-pointer"
              >
                <span>SHOP MEN'S WEAR</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/customize"
                className="min-h-[52px] px-7 text-xs font-black tracking-wider uppercase inline-flex items-center justify-center gap-2.5 rounded-none border-2 border-[#171717] bg-[#171717] text-white hover:bg-white hover:text-[#171717] transition-all shadow-[0_8px_24px_rgba(0,0,0,0.22)] group w-full sm:w-auto cursor-pointer"
              >
                <Sparkles size={15} className="text-[#E6321C] group-hover:scale-115 transition-transform" />
                <span>CREATE YOUR DESIGN</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Metadata — Fixed to True Screen Right */}
        <div className="absolute right-4 sm:right-8 md:right-12 top-6 sm:top-8 md:top-12 z-20 text-right select-none pointer-events-none">
          <p className="m-0 text-[10px] font-semibold leading-[1.7] tracking-[0.18em] uppercase text-[#171717]">
            EST. 2026
          </p>
          <p className="m-0 text-[10px] font-semibold leading-[1.7] tracking-[0.18em] uppercase text-[#171717]">
            INDIA
          </p>
          <div className="w-[28px] h-[1px] bg-[#171717] mt-[13px] ml-auto" />
        </div>

        {/* Hero Collection Label — Fixed to True Screen Right */}
        <div className="hidden md:block absolute right-4 sm:right-8 md:right-12 bottom-8 md:bottom-12 z-20 text-[9px] leading-[1.7] tracking-[0.18em] uppercase text-[#171717] text-right select-none pointer-events-none">
          NEW<br />
          COLLECTION<br />
          001
        </div>
      </section>

      {/* =========================================================
          CATEGORY STRIP
      ========================================================= */}
      <section className="mt-6 sm:mt-10 md:mt-14 bg-[#171717] text-white">
        <div className="container-bingooo grid grid-cols-2">
          {/* Category: Men */}
          <article className="min-h-[140px] md:min-h-[165px] flex flex-col sm:grid sm:grid-cols-[90px_1fr] md:grid-cols-[120px_1fr] gap-3 sm:gap-5 items-start sm:items-center p-3 sm:p-5 md:p-[25px] border-r border-white/15">
            <Link to="/shop?category=men" className="w-full aspect-[4/3] sm:w-[90px] sm:h-[110px] md:w-[120px] md:h-[120px] overflow-hidden bg-[#252525] shrink-0 block group">
              <img
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=500&q=80"
                alt="Men collection"
                className="h-full w-full object-cover grayscale group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="w-full">
              <h3 className="m-0 mb-1 sm:mb-[9px] text-sm sm:text-[18px] font-bold uppercase text-white tracking-tight">
                Men
              </h3>
              <p className="m-0 mb-2 sm:mb-[18px] text-[#c7c3bd] text-[10px] sm:text-[11px] leading-snug sm:leading-[1.6] max-w-[150px]">
                Everyday fits for every you.
              </p>
              <Link to="/shop?category=men" className="text-[9px] font-bold uppercase border-b border-white pb-0.5 sm:pb-1 inline-block hover:text-[#e6321c] hover:border-[#e6321c] transition-colors whitespace-nowrap">
                SHOP MEN →
              </Link>
            </div>
          </article>

          {/* Category: Women */}
          <article className="min-h-[140px] md:min-h-[165px] flex flex-col sm:grid sm:grid-cols-[90px_1fr] md:grid-cols-[120px_1fr] gap-3 sm:gap-5 items-start sm:items-center p-3 sm:p-5 md:p-[25px]">
            <Link to="/shop?category=women" className="w-full aspect-[4/3] sm:w-[90px] sm:h-[110px] md:w-[120px] md:h-[120px] overflow-hidden bg-[#252525] shrink-0 block group">
              <img
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80"
                alt="Women collection"
                className="h-full w-full object-cover grayscale group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="w-full">
              <h3 className="m-0 mb-1 sm:mb-[9px] text-sm sm:text-[18px] font-bold uppercase text-white tracking-tight">
                Women
              </h3>
              <p className="m-0 mb-2 sm:mb-[18px] text-[#c7c3bd] text-[10px] sm:text-[11px] leading-snug sm:leading-[1.6] max-w-[150px]">
                Style that moves with you.
              </p>
              <Link to="/shop?category=women" className="text-[9px] font-bold uppercase border-b border-white pb-0.5 sm:pb-1 inline-block hover:text-[#e6321c] hover:border-[#e6321c] transition-colors whitespace-nowrap">
                SHOP WOMEN →
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section className="py-[clamp(56px,7vw,110px)]">
        <div className="container-bingooo">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-[36px]">
            <div>
              <div className="eyebrow text-[#171717]">NEW DROP</div>
              <h2 className="m-0 mt-2 max-w-[480px] text-[clamp(38px,4.5vw,64px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
                FEATURED<br />
                COLLECTION
              </h2>
            </div>

            <div className="hidden sm:block pb-[5px]">
              <Link to="/shop" className="text-link">
                VIEW ALL →
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[13px] sm:gap-[22px]">
            {FEATURED_PRODUCTS.map((prod) => (
              <article key={prod.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ede0cc]">
                  <button
                    onClick={(e) => toggleWishlist(prod.id, e)}
                    className="absolute right-3 top-3 w-[31px] h-[31px] rounded-full border border-[#ddd3c5] bg-white/85 grid place-items-center z-10 transition-transform active:scale-90 hover:bg-white"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={14}
                      className={wishlist[prod.id] ? 'fill-[#e6321c] text-[#e6321c]' : 'text-[#171717]'}
                    />
                  </button>

                  <Link
                    to={prod.link}
                    onMouseEnter={() => prefetchProduct(prod.link.replace('/product/', ''))}
                    onTouchStart={() => prefetchProduct(prod.link.replace('/product/', ''))}
                    className="block h-full w-full"
                  >
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-[#ede0cc]" />
                    )}
                  </Link>
                </div>

                <div className="pt-[13px]">
                  <p className="m-0 mb-[5px] text-[11px] sm:text-[12px] font-semibold text-[#171717]">
                    <Link to={prod.link} className="hover:text-[#e6321c] transition-colors">
                      {prod.name}
                    </Link>
                  </p>
                  <p className="m-0 text-[13px] sm:text-[14px] font-bold text-[#171717]">
                    {prod.price}
                  </p>

                  <div className="flex gap-[6px] mt-3">
                    {prod.swatches.map((swatchColor, idx) => (
                      <span
                        key={idx}
                        className="w-[13px] h-[13px] rounded-full border border-[#c9c0b3]"
                        style={{ backgroundColor: swatchColor }}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CUSTOM STUDIO CAMPAIGN
      ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px] bg-[#ede0cc]">
        <div className="overflow-hidden min-h-[320px] sm:min-h-[420px] lg:min-h-full relative">
          <img
            src="/custom-studio.jpg"
            alt="Bingooo Custom Studio atelier workshop"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#ede0cc]/40 via-transparent to-transparent lg:hidden" />
        </div>

        <div className="px-6 py-12 sm:p-12 md:p-14 lg:p-16 xl:p-20 flex flex-col justify-center text-left">
          <div className="eyebrow text-[#171717] mb-2">
            CUSTOM STUDIO
          </div>

          <h2 className="my-2 mb-4 text-[clamp(36px,4.8vw,68px)] font-extrabold leading-[0.9] tracking-[-0.065em] uppercase text-[#171717]">
            YOUR IDEA.<br />
            OUR CANVAS<span className="text-[#e6321c]">.</span>
          </h2>

          <p className="m-0 mb-8 text-[#6f6a63] text-[13px] sm:text-sm leading-[1.7] max-w-md">
            Create your own design. Customize your fit.
            Make something that feels completely yours.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md w-full">
            <Link
              to="/customize"
              className="btn btn-red min-h-[52px] px-8 text-xs font-extrabold tracking-wider justify-center w-full sm:w-auto shadow-[0_6px_22px_rgba(230,50,28,0.32)] hover:shadow-[0_8px_26px_rgba(230,50,28,0.42)] group"
            >
              <Sparkles size={14} className="shrink-0" />
              <span>START CREATING</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>

            <a
              href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-black min-h-[52px] px-6 text-xs font-extrabold tracking-wider justify-center w-full sm:w-auto inline-flex items-center gap-2.5 shadow-xs hover:bg-[#252525] transition-all group"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>BULK ORDERS</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST BAR
      ========================================================= */}
      <section className="bg-[#f9f5ed] border-t border-b border-[#ddd3c5]">
        <div className="container-bingooo grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Trust 1 */}
          <div className="min-h-[105px] flex items-center gap-[17px] p-[20px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
            <div className="w-[38px] h-[38px] rounded-[2px] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <p className="m-0 mb-1 text-[10px] font-bold uppercase text-[#171717]">
                Free Delivery
              </p>
              <p className="m-0 text-[#6f6a63] text-[9px]">
                On orders above ₹999
              </p>
            </div>
          </div>

          {/* Trust 2 */}
          <div className="min-h-[105px] flex items-center gap-[17px] p-[20px_25px] border-b sm:border-b-0 lg:border-r border-[#ddd3c5]">
            <div className="w-[38px] h-[38px] rounded-[2px] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <p className="m-0 mb-1 text-[10px] font-bold uppercase text-[#171717]">
                Easy Returns
              </p>
              <p className="m-0 text-[#6f6a63] text-[9px]">
                Within 15 days
              </p>
            </div>
          </div>

          {/* Trust 3 */}
          <div className="min-h-[105px] flex items-center gap-[17px] p-[20px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
            <div className="w-[38px] h-[38px] rounded-[2px] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#E6321C]" />
            </div>
            <div>
              <p className="m-0 mb-1 text-[10px] font-bold uppercase text-[#171717]">
                Premium Quality
              </p>
              <p className="m-0 text-[#6f6a63] text-[9px]">
                Made to last
              </p>
            </div>
          </div>

          {/* Trust 4 */}
          <div className="min-h-[105px] flex items-center gap-[17px] p-[20px_25px]">
            <div className="w-[38px] h-[38px] rounded-[2px] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <p className="m-0 mb-1 text-[10px] font-bold uppercase text-[#171717]">
                Secure Payment
              </p>
              <p className="m-0 text-[#6f6a63] text-[9px]">
                100% safe & secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SOCIAL (REAL PEOPLE. REAL FITS.)
      ========================================================= */}
      <section className="py-8 sm:py-12">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-3.5 sm:mb-5">
            <div>
              <div className="eyebrow text-[#171717]">@BINGOOO</div>
              <h2 className="m-0 mt-1 text-[clamp(22px,2.2vw,30px)] font-extrabold tracking-[-0.05em] uppercase text-[#171717]">
                REAL PEOPLE. REAL FITS.
              </h2>
            </div>

            <a
              href={BINGOOO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link text-xs"
            >
              FOLLOW US →
            </a>
          </div>

          {/* Compact 6-Photo Row in Full Clarity */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {COMMUNITY_FITS.map((fit, idx) => (
              <div
                key={fit.id}
                className="relative group overflow-hidden bg-[#ede0cc] border border-[#ddd3c5] hover:border-[#171717] transition-all duration-300 cursor-pointer shadow-2xs"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedFitIndex(idx);
                }}
              >
                <div className="w-full aspect-[4/5] overflow-hidden relative">
                  <img
                    src={fit.src}
                    alt={fit.alt}
                    className={`w-full h-full object-cover ${fit.objectPos || 'object-center'} transition-transform duration-500 ease-out group-hover:scale-105`}
                    loading="lazy"
                  />
                  {/* Subtle hover gradient badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-between p-2.5 sm:p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold tracking-[0.15em] uppercase bg-black/70 text-white px-2 py-0.5 backdrop-blur-xs border border-white/15">
                        {fit.badge}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>

                    <div>
                      <h3 className="m-0 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-tight line-clamp-1">
                        {fit.title}
                      </h3>
                      <p className="m-0 text-[#ddd3c5] text-[9px] tracking-wide line-clamp-1">
                        {fit.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slim Community Footer Bar */}
          <div className="mt-3 p-2.5 sm:p-3 bg-[#faf6ee] border border-[#ddd3c5] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#6f6a63]">
              Tag <span className="text-[#171717] font-extrabold">@bingooo</span> to be featured • Real People. Real Fits.
            </span>

            <a
              href={BINGOOO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs font-extrabold tracking-wider uppercase text-[#171717] hover:text-[#e6321c] transition-colors inline-flex items-center gap-1.5"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>FOLLOW ON INSTAGRAM →</span>
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox for Full Clarity View */}
      {selectedFitIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
          onClick={() => setSelectedFitIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedFitIndex(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-[#e6321c] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              setSelectedFitIndex((prev) => (prev !== null ? (prev === 0 ? COMMUNITY_FITS.length - 1 : prev - 1) : null));
            }}
            className="absolute left-3 sm:left-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              setSelectedFitIndex((prev) => (prev !== null ? (prev === COMMUNITY_FITS.length - 1 ? 0 : prev + 1) : null));
            }}
            className="absolute right-3 sm:right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content container */}
          <div
            className="max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[76vh] flex items-center justify-center overflow-hidden">
              <img
                src={COMMUNITY_FITS[selectedFitIndex].src}
                alt={COMMUNITY_FITS[selectedFitIndex].alt}
                className="max-h-[76vh] w-auto max-w-full object-contain rounded-xs shadow-2xl"
              />
            </div>

            {/* Bottom bar */}
            <div className="w-full max-w-2xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white px-2">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#e6321c] uppercase block">
                  {COMMUNITY_FITS[selectedFitIndex].badge} • {selectedFitIndex + 1} / {COMMUNITY_FITS.length}
                </span>
                <span className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-white block">
                  {COMMUNITY_FITS[selectedFitIndex].title}
                </span>
                <span className="text-[11px] text-[#ccc4b6]">
                  {COMMUNITY_FITS[selectedFitIndex].subtitle}
                </span>
              </div>

              <a
                href={BINGOOO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-red py-2 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm shrink-0"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>FOLLOW @BINGOOO</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}
      <section className="py-[70px] px-5 text-center bg-[#f7eedb]">
        <div className="eyebrow text-[#171717]">
          STAY IN THE LOOP
        </div>

        <h2 className="my-[9px] mb-2 text-[clamp(30px,4vw,52px)] font-extrabold tracking-[-0.06em] uppercase text-[#171717]">
          GET THE NEXT DROP.
        </h2>

        <p className="m-0 mb-[25px] text-[#6f6a63] text-[12px]">
          New drops, exclusive offers and more.
        </p>

        {subscribed ? (
          <div className="max-w-[480px] mx-auto p-4 bg-white border-2 border-[#238636] text-xs font-semibold text-[#171717] rounded-xl flex items-center justify-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-[#238636] shrink-0" />
            <span>Thank you for subscribing! Check your inbox for exclusive access to Drop 02.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="max-w-[480px] mx-auto w-full">
            <div className="relative flex items-center bg-white border-2 border-[#171717] rounded-full p-1 sm:p-1.5 shadow-[0_4px_20px_rgba(23,23,23,0.08)] transition-all focus-within:ring-4 focus-within:ring-[#E6321C]/15">
              <div className="flex items-center pl-3 sm:pl-4 text-[#171717]">
                <Mail size={18} className="text-[#171717] shrink-0" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="flex-1 min-w-0 h-11 sm:h-12 px-3 bg-transparent outline-none text-xs sm:text-sm text-[#171717] placeholder:text-[#9E988F] font-medium"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-[#171717] hover:bg-[#E6321C] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 shadow-xs active:scale-95 disabled:opacity-60"
              >
                {isSubscribing ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>JOINING...</span>
                  </span>
                ) : (
                  <>
                    <span>SUBSCRIBE</span>
                    <ArrowRight size={13} className="shrink-0" />
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-[#8C827A] mt-3 tracking-wide select-none">
              Exclusive drop notices only. No spam, ever.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
