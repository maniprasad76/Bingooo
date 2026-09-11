import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { generateOrganizationSchema, generateWebSiteSchema } from '../lib/seo/schema';
import { BINGOOO_INSTAGRAM_URL, getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';
import { triggerHaptic } from '../lib/native/capacitorBridge';

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
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    swatches: ['#171717', '#ffffff', '#d9cbb8'],
    link: '/product/classic-oversized-tee',
  },
  {
    id: 'prod-2',
    name: 'Minimal Tee',
    price: '₹1,099',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85',
    swatches: ['#171717', '#d9cbb8', '#ffffff'],
    link: '/product/minimalist-heavyweight-tee',
  },
  {
    id: 'prod-3',
    name: 'Statement Hoodie',
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
    swatches: ['#171717', '#8d8984', '#d9cbb8'],
    link: '/product/heavyweight-fleece-hoodie',
  },
  {
    id: 'prod-4',
    name: 'Bold B Tee',
    price: '₹1,199',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=900&q=85',
    swatches: ['#171717', '#ffffff', '#8d8984'],
    link: '/product/bold-signature-tee',
  },
];

const SOCIAL_IMAGES = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=600&q=80',
];

export function HomePage() {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased selection:bg-[#e6321c] selection:text-white">
      <SEO
        title="BINGOOO — Wear What Defines You"
        description="BINGOOO — Men's fashion, custom designs and clothing culture."
        keywords="mens wear, oversized tees, streetwear, custom t-shirts, hoodies, bingooo"
        canonical="https://bingooo.in"
        schema={[generateOrganizationSchema(), generateWebSiteSchema()]}
      />

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative min-h-[min(650px,calc(100vh-104px))] md:min-h-[min(650px,calc(100vh-104px))] overflow-hidden bg-[#f7eedb]">
        <div className="container-bingooo min-h-[inherit] relative grid grid-cols-1 md:grid-cols-[43%_57%] items-center">
          {/* Hero Copy */}
          <div className="relative z-10 py-[65px] md:py-[70px] pr-0 md:pr-4 pl-0 md:pl-4">
            <div className="eyebrow max-w-[130px] leading-[1.8] mb-[28px] text-[#171717]">
              CLOTHING<br />
              CUSTOM<br />
              CULTURE<br />
              YOU
            </div>

            <h1 className="m-0 text-[clamp(52px,13vw,105px)] md:text-[clamp(55px,7vw,105px)] font-extrabold leading-[0.87] tracking-[-0.075em] max-w-[650px] uppercase text-[#171717]">
              <span className="block">NOT JUST</span>
              <span className="block">CLOTHES.</span>
              <span className="block text-[#e6321c]">A YOU.</span>
            </h1>

            <p className="my-[27px] mb-[24px] text-[11px] font-semibold tracking-[0.34em] uppercase text-[#171717]">
              WEAR WHAT DEFINES YOU.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[18px] sm:gap-[28px]">
              <Link to="/shop" className="btn btn-black w-full sm:w-auto">
                SHOP NOW →
              </Link>

              <Link to="/customize" className="text-link text-center sm:text-left self-start sm:self-center">
                CREATE YOUR OWN
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="absolute inset-[30%_0_0_0] md:inset-[0_0_0_34%] overflow-hidden pointer-events-none -z-0 md:z-0">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85"
              alt="Bingooo fashion campaign"
              className="h-full w-full object-cover object-center grayscale"
            />
            {/* Gradient Overlay for Smooth Editorial Blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f7eedb] via-[#f7eedb]/10 to-transparent md:bg-gradient-to-r md:from-[#f7eedb] md:via-[#f7eedb]/35 md:to-transparent" />
          </div>

          {/* Hero Metadata */}
          <div className="absolute right-4 md:right-[35px] top-[30px] md:top-[80px] z-20 text-right">
            <p className="m-0 text-[10px] font-semibold leading-[1.7] tracking-[0.18em] uppercase text-[#171717]">
              EST. 2026
            </p>
            <p className="m-0 text-[10px] font-semibold leading-[1.7] tracking-[0.18em] uppercase text-[#171717]">
              INDIA
            </p>
            <div className="w-[28px] h-[1px] bg-[#171717] mt-[13px] ml-auto" />
          </div>

          {/* Hero Collection Label (Hidden on mobile <800px) */}
          <div className="hidden md:block absolute right-[35px] bottom-[45px] z-20 text-[9px] leading-[1.7] tracking-[0.18em] uppercase text-[#171717] text-right">
            NEW<br />
            COLLECTION<br />
            001
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY STRIP
      ========================================================= */}
      <section className="bg-[#171717] text-white">
        <div className="container-bingooo grid grid-cols-1 md:grid-cols-2">
          {/* Category: Men */}
          <article className="min-h-[140px] md:min-h-[165px] grid grid-cols-[90px_1fr] sm:grid-cols-[120px_1fr] gap-5 items-center p-5 sm:p-[25px] border-b md:border-b-0 md:border-r border-white/15">
            <div className="w-[90px] h-[110px] sm:w-[120px] sm:h-[120px] overflow-hidden bg-[#252525] shrink-0">
              <img
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=500&q=80"
                alt="Men collection"
                className="h-full w-full object-cover grayscale"
              />
            </div>
            <div>
              <h3 className="m-0 mb-[9px] text-[18px] font-bold uppercase text-white">
                Men
              </h3>
              <p className="m-0 mb-[18px] text-[#c7c3bd] text-[11px] leading-[1.6] max-w-[130px]">
                Everyday fits for every you.
              </p>
              <Link to="/shop?category=men" className="text-[9px] font-bold uppercase border-b border-white pb-1 inline-block hover:text-[#e6321c] hover:border-[#e6321c] transition-colors">
                SHOP MEN →
              </Link>
            </div>
          </article>

          {/* Category: Women */}
          <article className="min-h-[140px] md:min-h-[165px] grid grid-cols-[90px_1fr] sm:grid-cols-[120px_1fr] gap-5 items-center p-5 sm:p-[25px]">
            <div className="w-[90px] h-[110px] sm:w-[120px] sm:h-[120px] overflow-hidden bg-[#252525] shrink-0">
              <img
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=80"
                alt="Women collection"
                className="h-full w-full object-cover grayscale"
              />
            </div>
            <div>
              <h3 className="m-0 mb-[9px] text-[18px] font-bold uppercase text-white">
                Women
              </h3>
              <p className="m-0 mb-[18px] text-[#c7c3bd] text-[11px] leading-[1.6] max-w-[130px]">
                Style that moves with you.
              </p>
              <Link to="/shop?category=women" className="text-[9px] font-bold uppercase border-b border-white pb-1 inline-block hover:text-[#e6321c] hover:border-[#e6321c] transition-colors">
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
                    <span className={wishlist[prod.id] ? 'text-[#e6321c] text-sm' : 'text-[#171717] text-sm'}>
                      {wishlist[prod.id] ? '♥' : '♡'}
                    </span>
                  </button>

                  <Link to={prod.link} className="block h-full w-full">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                    />
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
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[510px] bg-[#ede0cc]">
        <div className="overflow-hidden min-h-[330px] sm:min-h-[420px] md:min-h-full">
          <img
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1600&q=85"
            alt="Bingooo custom clothing"
            className="h-full w-full object-cover grayscale"
          />
        </div>

        <div className="p-[50px_24px] sm:p-[clamp(45px,7vw,100px)] flex flex-col justify-center">
          <div className="eyebrow text-[#171717]">
            CUSTOM STUDIO
          </div>

          <h2 className="my-[10px] mb-[18px] text-[clamp(42px,5vw,72px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-[#171717]">
            YOUR IDEA.<br />
            OUR CANVAS.
          </h2>

          <p className="m-0 mb-[28px] text-[#6f6a63] text-[13px] leading-[1.7] max-w-[370px]">
            Create your own design. Customize your fit.
            Make something that feels completely yours.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/customize" className="btn btn-red">
              START CREATING →
            </Link>
            <a
              href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-black inline-flex items-center gap-2"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>BULK ORDERS (WHATSAPP) →</span>
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
            <div className="text-2xl shrink-0 w-[31px]">🚚</div>
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
            <div className="text-2xl shrink-0 w-[31px]">📦</div>
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
            <div className="text-2xl shrink-0 w-[31px]">✦</div>
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
            <div className="text-2xl shrink-0 w-[31px]">♙</div>
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
      <section className="py-[clamp(56px,7vw,110px)]">
        <div className="container-bingooo">
          <div className="flex justify-between items-end mb-[25px]">
            <div>
              <div className="eyebrow text-[#171717]">@BINGOOO</div>
              <h2 className="m-0 mt-[6px] text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-0.05em] uppercase text-[#171717]">
                REAL PEOPLE. REAL FITS.
              </h2>
            </div>

            <a
              href={BINGOOO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              FOLLOW US →
            </a>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-[7px]">
            {SOCIAL_IMAGES.map((src, i) => (
              <a
                key={i}
                href={BINGOOO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square overflow-hidden bg-[#ede0cc] group block"
              >
                <img
                  src={src}
                  alt={`Bingooo fit community ${i + 1}`}
                  className="h-full w-full object-cover grayscale transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

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
          <div className="max-w-[500px] mx-auto p-4 bg-white border border-[#ddd3c5] text-xs font-semibold text-[#171717] rounded-sm">
            ✓ Thank you for subscribing! Check your inbox for exclusive access to Drop 02.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="max-w-[500px] mx-auto flex flex-col sm:flex-row gap-2 sm:gap-0">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 min-w-0 h-[48px] px-4 border border-[#ddd3c5] bg-white outline-none text-[11px] text-[#171717] focus:border-[#171717] transition-colors"
            />

            <button className="btn btn-black min-w-[145px] w-full sm:w-auto" type="submit">
              SUBSCRIBE →
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
