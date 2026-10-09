import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Truck, Package, Sparkles, ShieldCheck, CheckCircle2, Mail, ArrowRight, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '../components/common/SEO';
import { generateOrganizationSchema, generateLocalBusinessSchema, generateWebSiteSchema } from '../lib/seo/schema';
import { BINGOOO_INSTAGRAM_URL, BINGOOO_INSTAGRAM_HANDLE, InstagramIcon } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { api } from '../lib/api/client';
import { prefetchProduct } from '../lib/utils/preloader';
import { useProducts } from '../hooks/useProducts';
import { ProductPlaceholder } from '../components/ui/ProductPlaceholder';
import { resolveImageUrl } from '../lib/utils';
import { Picture } from '../components/ui/Picture';
import { IMAGES, HERO_SIZES, type ImageAsset } from '../lib/images';

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  category?: string;
  swatches: string[];
  link: string;
}

const FEATURED_PRODUCTS: FeaturedProduct[] = [];


interface CommunityFit {
  id: string;
  image: ImageAsset;
  alt: string;
  badge: string;
  title: string;
  subtitle: string;
  objectPos?: string;
}

const COMMUNITY_FITS: CommunityFit[] = [
  {
    id: 'fit-campaign',
    image: IMAGES.realFit3,
    alt: 'Bingooo — Wear What Defines You campaign look',
    badge: 'CAMPAIGN',
    title: 'Wear What Defines You',
    subtitle: 'Storefront Atelier',
    objectPos: 'object-[35%_center]',
  },
  {
    id: 'fit-white-tee',
    image: IMAGES.realFit2,
    alt: 'Bingooo — Classic Heavyweight Oversized Tee in Off-White',
    badge: 'OVERSIZED TEE',
    title: 'Off-White Heavyweight',
    subtitle: '240 GSM Cotton',
    objectPos: 'object-center',
  },
  {
    id: 'fit-olive-hoodie',
    image: IMAGES.realFit1,
    alt: 'Bingooo — Heavyweight Fleece Hoodie in Forest Olive',
    badge: 'HOODIE DROP',
    title: 'Fleece Hoodie',
    subtitle: '380 GSM Fleece',
    objectPos: 'object-center',
  },
  {
    id: 'fit-kraft-bag',
    image: IMAGES.realFit4,
    alt: 'Bingooo — Real You. Real Fit. Signature Kraft Tote & Packaging',
    badge: 'REAL YOU. REAL FIT.',
    title: 'Signature Kraft',
    subtitle: 'Real You. Real Fit.',
    objectPos: 'object-center',
  },
  {
    id: 'fit-street-walk',
    image: IMAGES.realFit5,
    alt: 'Bingooo — Street style everyday culture with Bingooo bag',
    badge: 'STREET STYLE',
    title: 'Everyday Culture',
    subtitle: 'Streetwear Fits',
    objectPos: 'object-center',
  },
  {
    id: 'fit-couple-walk',
    image: IMAGES.realFit6,
    alt: 'Bingooo — Real You. Real Fit. couple streetwear lookbook with shopping bags',
    badge: 'COMMUNITY',
    title: 'Real You. Real Fit.',
    subtitle: 'Better Outfits. Brighter Days.',
    objectPos: 'object-center',
  },
];

export function HomePage() {
  // Custom-studio teaser: the first garment photo uploaded in the admin studio.
  const { data: studioPhoto } = useQuery({
    queryKey: ['studio-teaser-photo'],
    queryFn: async () => {
      const res = await api.get<{ garments?: any[] }>(`/customizations/studio/config?_t=${Date.now()}`);
      for (const g of res?.garments || []) {
        if (g?.isActive === false) continue;
        const colour = (g.colors || []).find((c: any) => c?.isActive !== false && c?.frontImageUrl);
        if (colour) return colour.frontImageUrl as string;
      }
      return null;
    },
    staleTime: 10 * 60 * 1000,
  });
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedFitIndex, setSelectedFitIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Dynamic products from API/Admin DB (with clean fallback)
  const productsQuery = useProducts({ limit: 4 });
  const apiProducts = productsQuery.data?.data;

  const displayFeaturedProducts = useMemo(() => {
    if (Array.isArray(apiProducts) && apiProducts.length > 0) {
      return apiProducts.slice(0, 4).map((p: any) => {
        const rawImage =
          p.images?.[0]?.url ||
          p.images?.[0]?.object_key ||
          (typeof p.images?.[0] === 'string' ? p.images[0] : '') ||
          p.image_url ||
          p.imageUrl ||
          p.image ||
          '';
        const primaryImage = resolveImageUrl(rawImage);

        const swatches = p.variants?.length
          ? Array.from(new Set(p.variants.map((v: any) => v.colorHex || v.color_hex).filter(Boolean))).slice(0, 3)
          : ['#171717', '#ffffff', '#d9cbb8'];

        return {
          id: p.id,
          name: p.title || p.name,
          price: `₹${p.base_price || p.price || 999}`,
          image: primaryImage,
          category: p.category?.name || '',
          swatches: (swatches.length ? swatches : ['#171717', '#ffffff', '#d9cbb8']) as string[],
          link: `/product/${p.slug || p.id}`,
        };
      });
    }
    return FEATURED_PRODUCTS;
  }, [apiProducts]);

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
        title="Bingooo® — Oversized T-Shirts for Men (240 GSM) & Luxury Streetwear India"
        description="Shop India's #1 240–280 GSM heavyweight oversized t-shirts for men & streetwear. 100% super-combed cotton, drop-shoulder fit, 3D custom printing atelier. 100% secure prepaid & Pan-India free delivery."
        keywords="oversized t-shirts for men, 240 gsm oversized t shirt, heavyweight t shirt india, drop shoulder t shirt, luxury streetwear india, custom oversized t shirt printing india, streetwear brand india, boxy fit t shirt men, 100 combed cotton oversized tee, 380 gsm fleece hoodie, acid wash oversized t shirt, dtf printing custom t shirt, oversized tees india, bingooo menswear"
        canonical="https://www.bingooo.co.in"
        schema={[
          generateWebSiteSchema(),
          generateOrganizationSchema(),
          generateLocalBusinessSchema(),
        ]}
      />

      {/* =========================================================
          HERO SECTION — 100% Full Width Edge-to-Edge All Devices
      ========================================================= */}
      <section className="relative w-full min-h-[min(680px,calc(100vh-90px))] md:min-h-[min(720px,calc(100vh-104px))] overflow-hidden bg-[#f7eedb] m-0 p-0">
        {/* Full-bleed Hero Campaign Imagery */}
        <div className="absolute inset-0 md:left-[36%] lg:left-[40%] xl:left-[42%] overflow-hidden pointer-events-none z-0">
          <Picture
            image={IMAGES.hero}
            sizes={HERO_SIZES}
            loading="eager"
            fetchPriority="high"
            alt="Bingooo fashion campaign"
            className="h-full w-full object-cover object-[center_15%] contrast-[1.05]"
          />
          {/* Gradient Overlay: Vertical blend on mobile, Horizontal blend on desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f7eedb] via-[#f7eedb]/80 to-[#f7eedb]/30 md:hidden" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#f7eedb] via-[#f7eedb]/65 to-transparent" />
          {/* Subtle bottom fade to blend into next section */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7eedb] to-transparent pointer-events-none" />
        </div>

        {/* Hero Content — Aligned with Bauhaus Container */}
        <div className="container-bingooo min-h-[inherit] relative z-10 flex items-center">
          <div className="w-full max-w-[640px] py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="eyebrow max-w-[140px] leading-[1.8] mb-6 sm:mb-7 text-[#171717]">
              CLOTHING<br />
              CUSTOM<br />
              CULTURE<br />
              BINGOOO
            </div>

            <h1 className="m-0 mb-4 sm:mb-6 text-[clamp(44px,6.8vw,96px)] font-extrabold leading-[0.84] tracking-[-0.07em] uppercase text-[#171717]">
              WEAR WHAT<br />
              DEFINES<br />
              YOU<span className="text-[#e6321c]">.</span>
            </h1>

            <p className="my-4 mb-7 text-xs sm:text-[13px] font-semibold tracking-[0.18em] uppercase text-[#6f6a63] max-w-[480px] leading-relaxed">
              240–280 GSM Heavyweight Streetwear <span className="text-[#e6321c] font-bold mx-1.5">•</span> Custom 3D Atelier
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                to="/shop"
                className="h-[52px] px-8 rounded-none text-xs font-black tracking-wider uppercase inline-flex items-center justify-center gap-2.5 bg-[#E6321C] text-white hover:bg-[#ff3b20] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[6px_6px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 group w-full sm:w-auto cursor-pointer"
              >
                <span>SHOP MEN'S WEAR</span>
                <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
              </Link>

              <Link
                to="/shop?category=women"
                className="h-[52px] px-8 rounded-none text-xs font-black tracking-wider uppercase inline-flex items-center justify-center gap-2.5 bg-[#171717] text-white hover:bg-black border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[6px_6px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 group w-full sm:w-auto cursor-pointer"
              >
                <span>SHOP WOMEN'S WEAR</span>
                <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Metadata — Fixed to True Screen Right */}
        <div className="absolute right-4 sm:right-8 md:right-12 top-6 sm:top-8 md:top-12 z-20 text-right select-none pointer-events-none">
          <p className="m-0 text-[10px] font-mono font-bold leading-[1.7] tracking-[0.18em] uppercase text-[#171717]">
            EST. 2026
          </p>
          <p className="m-0 text-[10px] font-mono font-bold leading-[1.7] tracking-[0.18em] uppercase text-[#171717]">
            INDIA
          </p>
          <div className="w-[28px] h-[2px] bg-[#171717] mt-[13px] ml-auto" />
        </div>

        {/* Hero Collection Label — Fixed to True Screen Right */}
        <div className="hidden md:block absolute right-4 sm:right-8 md:right-12 bottom-8 md:bottom-12 z-20 text-[9px] font-mono font-bold leading-[1.7] tracking-[0.18em] uppercase text-[#171717] text-right select-none pointer-events-none">
          NEW<br />
          COLLECTION<br />
          001
        </div>
      </section>

      {/* =========================================================
          BAUHAUS GEOMETRIC TICKER STRIP
      ========================================================= */}
      <section className="w-full bg-[#171717] text-white py-3.5 border-y-[3px] border-[#171717] overflow-hidden select-none">
        <div className="container-bingooo flex items-center justify-between flex-wrap gap-3 sm:gap-6 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>01 · 240+ GSM HEAVYWEIGHT COTTON</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>02 · DROP-SHOULDER STREETWEAR DRAPE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>03 · LIVE BESPOKE CUSTOM STUDIO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>04 · PAN-INDIA FREE SHIPPING</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          BAUHAUS CATEGORY STRIP
      ========================================================= */}
      <section className="py-10 sm:py-14 bg-[#F7EEDB]">
        <div className="container-bingooo">
          {/* Section Heading with Bauhaus Step Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-7 h-7 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
              01
            </span>
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
              SHOP BY CATEGORY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
            {/* Category: Men */}
            <article className="bg-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] sm:shadow-[4px_4px_0px_#171717] hover:shadow-[4px_4px_0px_#171717] sm:hover:shadow-[6px_6px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-2.5 sm:p-6 flex flex-row items-center gap-2.5 sm:gap-6 group">
              <Link to="/shop?category=men" className="w-14 h-14 xs:w-16 xs:h-16 sm:w-[130px] sm:h-[130px] aspect-square overflow-hidden bg-[#252525] shrink-0 block border-2 border-[#171717]">
                <Picture
                  image={IMAGES.menCategory}
                  sizes="(min-width: 640px) 130px, 64px"
                  alt="Bingooo Men collection"
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="w-full flex-1 min-w-0">
                <span className="text-[7.5px] xs:text-[9px] sm:text-[10px] font-mono font-bold bg-[#E6321C] text-white px-1 sm:px-2 py-0.5 uppercase tracking-wider inline-block mb-0.5 sm:mb-1.5 border border-[#171717]">
                  MEN · 240+ GSM
                </span>
                <h3 className="m-0 mb-0.5 sm:mb-1 text-xs xs:text-sm sm:text-2xl font-black uppercase text-[#171717] tracking-tight truncate sm:whitespace-normal">
                  MEN'S WEAR
                </h3>
                <p className="m-0 mb-1 sm:mb-4 text-[#6F6A63] text-[9px] xs:text-[10px] sm:text-xs leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Drop-shoulder heavyweight tees, hoodies, and structured fits.
                </p>
                <Link
                  to="/shop?category=men"
                  className="inline-flex items-center gap-1 sm:gap-2 text-[9.5px] xs:text-[11px] sm:text-xs font-black uppercase text-[#171717] hover:text-[#E6321C] border-b-2 border-[#171717] pb-0.5 sm:pb-1 transition-colors"
                >
                  <span>SHOP MEN</span>
                  <span>→</span>
                </Link>
              </div>
            </article>

            {/* Category: Women */}
            <article className="bg-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] sm:shadow-[4px_4px_0px_#171717] hover:shadow-[4px_4px_0px_#171717] sm:hover:shadow-[6px_6px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-2.5 sm:p-6 flex flex-row items-center gap-2.5 sm:gap-6 group">
              <Link to="/shop?category=women" className="w-14 h-14 xs:w-16 xs:h-16 sm:w-[130px] sm:h-[130px] aspect-square overflow-hidden bg-[#252525] shrink-0 block border-2 border-[#171717]">
                <Picture
                  image={IMAGES.womenCategory}
                  sizes="(min-width: 640px) 130px, 64px"
                  alt="Bingooo Women collection"
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="w-full flex-1 min-w-0">
                <span className="text-[7.5px] xs:text-[9px] sm:text-[10px] font-mono font-bold bg-[#171717] text-white px-1 sm:px-2 py-0.5 uppercase tracking-wider inline-block mb-0.5 sm:mb-1.5 border border-[#171717]">
                  WOMEN · STREETWEAR
                </span>
                <h3 className="m-0 mb-0.5 sm:mb-1 text-xs xs:text-sm sm:text-2xl font-black uppercase text-[#171717] tracking-tight truncate sm:whitespace-normal">
                  WOMEN'S WEAR
                </h3>
                <p className="m-0 mb-1 sm:mb-4 text-[#6F6A63] text-[9px] xs:text-[10px] sm:text-xs leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Boxy silhouette tees, statement tops, and tailored essentials.
                </p>
                <Link
                  to="/shop?category=women"
                  className="inline-flex items-center gap-1 sm:gap-2 text-[9.5px] xs:text-[11px] sm:text-xs font-black uppercase text-[#171717] hover:text-[#E6321C] border-b-2 border-[#171717] pb-0.5 sm:pb-1 transition-colors"
                >
                  <span>SHOP WOMEN</span>
                  <span>→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section className="py-12 sm:py-16">
        <div className="container-bingooo">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-8 pb-4 border-b-2 border-[#171717]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
                  NEW DROPS
                </span>
              </div>
              <h2 className="m-0 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#171717]">
                FEATURED DROPS<span className="text-[#E6321C]">.</span>
              </h2>
            </div>

            <div>
              <Link to="/shop" className="btn btn-outline text-xs px-5 py-2">
                VIEW ALL DROPS →
              </Link>
            </div>
          </div>

          {/* Grid */}
          {displayFeaturedProducts.length === 0 ? (
            <div className="py-14 px-6 text-center bg-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717] max-w-2xl mx-auto">
              <p className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#6f6a63] mb-3 font-bold">
                New collection dropping soon
              </p>
              <p className="text-[11px] text-[#8d8984]">
                Products added from the Admin Panel will appear here live.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayFeaturedProducts.map((prod) => (
                <article
                  key={prod.id}
                  className="bg-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[6px_6px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all p-3 flex flex-col group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE0CC] border-b-2 border-[#171717]">
                    <button
                      onClick={(e) => toggleWishlist(prod.id, e)}
                      className="absolute right-2.5 top-2.5 w-7 h-7 border-2 border-[#171717] bg-white grid place-items-center z-10 transition-transform active:scale-90 hover:bg-[#E6321C] hover:text-white shadow-[1px_1px_0px_#171717]"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={13}
                        className={wishlist[prod.id] ? 'fill-[#E6321C] text-[#E6321C]' : 'text-[#171717]'}
                      />
                    </button>

                    <Link
                      to={prod.link}
                      onMouseEnter={() => prefetchProduct(prod.link.replace('/product/', ''))}
                      onTouchStart={() => prefetchProduct(prod.link.replace('/product/', ''))}
                      className="block h-full w-full"
                    >
                      {prod.image && !failedImages[prod.id] ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          onError={() => {
                            setFailedImages((prev) => ({ ...prev, [prod.id]: true }));
                          }}
                        />
                      ) : (
                        <ProductPlaceholder name={prod.name} category={prod.category} />
                      )}
                    </Link>
                  </div>

                  <div className="pt-3 flex flex-col justify-between flex-1">
                    <div>
                      <p className="m-0 mb-1 text-xs font-bold text-[#171717] truncate uppercase tracking-tight">
                        <Link to={prod.link} className="hover:text-[#E6321C] transition-colors">
                          {prod.name}
                        </Link>
                      </p>
                      <p className="m-0 text-sm font-mono font-black text-[#171717]">
                        {prod.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
                      <div className="flex gap-1.5">
                        {prod.swatches.map((swatchColor, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: swatchColor }}
                          />
                        ))}
                      </div>
                      <Link
                        to={prod.link}
                        className="text-[10px] font-mono font-bold uppercase text-[#171717] hover:text-[#E6321C] transition-colors"
                      >
                        VIEW →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          BAUHAUS CUSTOM STUDIO CAMPAIGN (MATCHING /CUSTOMIZE)
      ========================================================= */}
      <section className="py-12 sm:py-16 bg-[#F7EEDB]">
        <div className="container-bingooo">
          <div className="border-[3px] border-[#171717] shadow-[8px_8px_0px_#171717] bg-[#F7EEDB] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            {/* Left Signal Red Visualizer Panel */}
            <div className="w-full bg-[#E6321C] p-8 sm:p-12 relative flex flex-col justify-between items-center text-center overflow-hidden border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#171717] min-h-[380px]">
              {/* Giant Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-white/15 font-black text-[120px] sm:text-[190px] leading-none uppercase select-none">
                  YOU
                </span>
              </div>

              <div className="relative z-10 w-full flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                  BESPOKE STUDIO
                </span>
                <span className="bg-[#171717] text-white px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-white/20">
                  LIVE PREVIEW
                </span>
              </div>

              <div className="relative z-10 my-6 w-48 sm:w-60 aspect-square flex items-center justify-center">
                {studioPhoto ? (
                  <img
                    src={resolveImageUrl(studioPhoto)}
                    alt="Custom garment ready for your design"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_32px_rgba(0,0,0,0.5)]"
                  />
                ) : (
                  <div className="w-full h-full border-2 border-white/20 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center shadow-inner">
                    <span className="text-white/60 font-mono text-[10px] tracking-widest uppercase">BINGOOO ATELIER</span>
                    <span className="text-white text-base sm:text-lg font-black tracking-wider uppercase mt-1">BESPOKE STUDIO</span>
                    <span className="text-white/70 text-[10px] font-mono mt-3 uppercase tracking-wider">REAL-TIME DTF & SCREEN PRINTING</span>
                  </div>
                )}
              </div>

              <div className="relative z-10 text-[10px] sm:text-[11px] font-mono font-bold text-white/90 uppercase tracking-widest">
                DIRECT TO GARMENT · HIGH RESOLUTION PNG ONLY
              </div>
            </div>

            {/* Right Warm Cream Configuration Panel */}
            <div className="w-full bg-[#F7EEDB] p-8 sm:p-12 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center">
                    03
                  </span>
                  <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
                    CUSTOMIZE YOUR FIT
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#171717] tracking-tight leading-none mb-3">
                  BUILD YOURS<span className="text-[#E6321C]">.</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#171717]/80 font-medium mb-6 leading-relaxed">
                  Design bespoke oversized t-shirts, hoodies, or polo tees. Upload your PNG graphics for front, chest, and back with instant live preview and direct WhatsApp quotation.
                </p>

                {/* 3 Step Pills */}
                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-3 bg-white p-2.5 border-2 border-[#171717] shadow-[2px_2px_0px_#171717]">
                    <span className="w-5 h-5 rounded-full bg-[#171717] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="text-xs font-bold uppercase text-[#171717]">
                      PICK A FIT: Oversized (₹649) · Polo (₹699) · Hoodie (₹799)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-2.5 border-2 border-[#171717] shadow-[2px_2px_0px_#171717]">
                    <span className="w-5 h-5 rounded-full bg-[#171717] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="text-xs font-bold uppercase text-[#171717]">
                      COLOUR & SIZE: Black, White, Beige, Red (S to XXL / 36–46)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-2.5 border-2 border-[#171717] shadow-[2px_2px_0px_#171717]">
                    <span className="w-5 h-5 rounded-full bg-[#171717] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="text-xs font-bold uppercase text-[#171717]">
                      UPLOAD ARTWORK: Transparent PNG · Live Projection · WhatsApp Quote
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t-2 border-[#171717]">
                <Link
                  to="/customize"
                  className="w-full sm:w-auto btn btn-red text-xs py-3.5 px-8 font-black uppercase tracking-widest shadow-[4px_4px_0px_#171717] flex items-center justify-center gap-2"
                >
                  <span>LAUNCH CUSTOM STUDIO →</span>
                </Link>
                <span className="text-xs font-mono font-bold text-[#171717]">
                  Starting at ₹649
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BAUHAUS TRUST BAR
      ========================================================= */}
      <section className="bg-[#FAF6EE] border-y-2 border-[#171717] py-6 sm:py-8">
        <div className="container-bingooo grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trust 1 */}
          <div className="bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border-2 border-[#171717] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <p className="m-0 text-xs font-mono font-bold uppercase text-[#171717]">
                FREE DELIVERY
              </p>
              <p className="m-0 text-[#6F6A63] text-[11px] font-medium">
                Pan-India on every order
              </p>
            </div>
          </div>

          {/* Trust 2 */}
          <div className="bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border-2 border-[#171717] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <p className="m-0 text-xs font-mono font-bold uppercase text-[#171717]">
                EASY RETURNS
              </p>
              <p className="m-0 text-[#6F6A63] text-[11px] font-medium">
                15-day exchange window
              </p>
            </div>
          </div>

          {/* Trust 3 */}
          <div className="bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border-2 border-[#171717] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#E6321C]" />
            </div>
            <div>
              <p className="m-0 text-xs font-mono font-bold uppercase text-[#171717]">
                240+ GSM COTTON
              </p>
              <p className="m-0 text-[#6F6A63] text-[11px] font-medium">
                Heavyweight luxury drape
              </p>
            </div>
          </div>

          {/* Trust 4 */}
          <div className="bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 border-2 border-[#171717] bg-[#EDE0CC] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#171717]" />
            </div>
            <div>
              <p className="m-0 text-xs font-mono font-bold uppercase text-[#171717]">
                SECURE CHECKOUT
              </p>
              <p className="m-0 text-[#6F6A63] text-[11px] font-medium">
                Razorpay & UPI verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SOCIAL (REAL PEOPLE. REAL FITS.)
      ========================================================= */}
      <section className="py-10 sm:py-14 bg-[#F7EEDB]">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-6 pb-3 border-b-2 border-[#171717]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
                  LOOKBOOK & COMMUNITY
                </span>
              </div>
              <h2 className="m-0 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171717]">
                REAL PEOPLE. REAL FITS<span className="text-[#E6321C]">.</span>
              </h2>
            </div>

            <a
              href={BINGOOO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link text-xs font-black uppercase text-[#171717]"
            >
              FOLLOW INSTAGRAM →
            </a>
          </div>

          {/* Compact 6-Photo Row with Bauhaus frames */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {COMMUNITY_FITS.map((fit, idx) => (
              <div
                key={fit.id}
                className="relative group overflow-hidden bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedFitIndex(idx);
                }}
              >
                <div className="w-full aspect-[4/5] overflow-hidden relative">
                  <Picture
                    image={fit.image}
                    // Tile width: .container-bingooo (100% - 32px, - 48px above 800px, max 1440px)
                    // split into 2/3/6 columns with 12px gaps, minus the 2px border on each side.
                    sizes="(min-width: 1488px) 226px, (min-width: 1024px) calc(16.67vw - 22px), (min-width: 640px) calc(33.33vw - 23px), calc(50vw - 26px)"
                    alt={fit.alt}
                    className={`w-full h-full object-cover ${fit.objectPos || 'object-center'} transition-transform duration-500 ease-out group-hover:scale-105`}
                  />
                  {/* Subtle hover gradient badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono font-bold tracking-wider uppercase bg-[#171717] text-white px-2 py-0.5 border border-white/20">
                        {fit.badge}
                      </span>
                      <span className="w-5 h-5 bg-white text-[#171717] flex items-center justify-center border border-[#171717]">
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>

                    <div>
                      <h3 className="m-0 text-white text-[11px] font-black uppercase tracking-tight line-clamp-1">
                        {fit.title}
                      </h3>
                      <p className="m-0 text-[#F7EEDB] text-[9px] font-mono tracking-wide line-clamp-1">
                        {fit.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slim Community Footer Bar */}
          <div className="mt-4 p-3.5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#6F6A63]">
              Tag <span className="text-[#171717] font-black">{BINGOOO_INSTAGRAM_HANDLE}</span> to be featured • Real People. Real Fits.
            </span>

            <a
              href={BINGOOO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black tracking-wider uppercase text-[#171717] hover:text-[#E6321C] transition-colors inline-flex items-center gap-1.5"
            >
              <InstagramIcon className="w-4 h-4" />
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
            className="absolute top-4 right-4 z-20 w-10 h-10 border-2 border-white bg-black hover:bg-[#E6321C] text-white flex items-center justify-center transition-colors cursor-pointer shadow-[2px_2px_0px_white]"
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
            className="absolute left-3 sm:left-6 z-20 w-10 h-10 border-2 border-white bg-black hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-[2px_2px_0px_white]"
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
            className="absolute right-3 sm:right-6 z-20 w-10 h-10 border-2 border-white bg-black hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-[2px_2px_0px_white]"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content container */}
          <div
            className="max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[76vh] flex items-center justify-center overflow-hidden border-2 border-white shadow-2xl">
              <Picture
                key={selectedFitIndex}
                image={COMMUNITY_FITS[selectedFitIndex].image}
                sizes={`${COMMUNITY_FITS[selectedFitIndex].image.width}px`}
                loading="eager"
                alt={COMMUNITY_FITS[selectedFitIndex].alt}
                className="max-h-[76vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Bottom bar */}
            <div className="w-full max-w-2xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white px-2">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#E6321C] uppercase block">
                  {COMMUNITY_FITS[selectedFitIndex].badge} • {selectedFitIndex + 1} / {COMMUNITY_FITS.length}
                </span>
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white block">
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
                <span>FOLLOW {BINGOOO_INSTAGRAM_HANDLE.toUpperCase()}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          NEWSLETTER (ATELIER DISPATCH)
      ========================================================= */}
      <section className="py-16 px-5 text-center bg-[#FAF6EE] border-t-2 border-[#171717]">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center">
              05
            </span>
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
              ATELIER DISPATCH
            </span>
          </div>

          <h2 className="my-2 mb-2 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#171717]">
            GET THE NEXT DROP<span className="text-[#E6321C]">.</span>
          </h2>

          <p className="m-0 mb-6 text-[#6F6A63] text-xs sm:text-sm font-medium">
            Strictly drops, bespoke custom atelier updates, and limited archive releases.
          </p>

          {subscribed ? (
            <div className="max-w-[480px] mx-auto p-4 bg-white border-2 border-[#238636] shadow-[3px_3px_0px_#238636] text-xs font-bold text-[#171717] flex items-center justify-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#238636] shrink-0" />
              <span>Thank you for subscribing! Check your inbox for exclusive access to Drop 02.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-[480px] mx-auto w-full">
              <div className="relative flex items-center bg-white border-2 border-[#171717] shadow-[4px_4px_0px_#171717] p-1.5 transition-all">
                <div className="flex items-center pl-3 text-[#171717]">
                  <Mail size={18} className="text-[#171717] shrink-0" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className="flex-1 min-w-0 h-11 px-3 bg-transparent outline-none text-xs sm:text-sm text-[#171717] placeholder:text-[#9E988F] font-bold"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="h-10 px-5 sm:px-6 bg-[#E6321C] hover:bg-[#ff3b20] border-2 border-[#171717] text-white text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-60"
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
              <p className="text-[10px] text-[#8C827A] mt-3 tracking-wide font-mono">
                No spam. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
