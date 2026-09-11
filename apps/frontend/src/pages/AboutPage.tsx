import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

export function AboutPage() {
  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased">
      <SEO
        title="About Us — BINGOOO"
        description="BINGOOO — Not just clothes. A you. Discover our story, our values and the culture behind the brand."
        canonical="https://bingooo.in/about"
      />

      {/* =======================================================
           HERO
      ======================================================= */}
      <section className="min-h-[600px] lg:min-h-[650px] grid grid-cols-1 lg:grid-cols-[45%_55%] bg-[#f7eedb]">
        <div className="flex flex-col justify-center py-[65px] px-6 sm:px-10 lg:py-[clamp(50px,8vw,110px)] lg:px-[clamp(25px,6vw,90px)]">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-3">
            BINGOOO / OUR STORY
          </div>

          <h1 className="my-3 mb-6 text-[clamp(52px,7vw,105px)] font-extrabold leading-[0.84] tracking-[-0.075em] uppercase">
            <span className="block">NOT JUST</span>
            <span className="block">CLOTHES.</span>
            <span className="block text-[#e6321c]">A YOU.</span>
          </h1>

          <p className="max-w-[440px] m-0 mb-[30px] text-[#6f6a63] text-[13px] leading-[1.8]">
            BINGOOO exists for people who believe clothing should say something about who they are. Not louder. Just more personal.
          </p>

          <div>
            <a
              href="#story"
              onClick={() => triggerHaptic('light')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              OUR STORY ↓
            </a>
          </div>
        </div>

        <div className="h-[400px] sm:h-[500px] lg:h-auto overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=90"
            alt="Bingooo fashion editorial"
            className="w-full h-full object-cover grayscale"
          />
        </div>
      </section>

      {/* =======================================================
           STATEMENT
      ======================================================= */}
      <section className="py-[clamp(75px,10vw,145px)] px-5 bg-[#171717] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#aaaaaa] mb-4">
          WHAT WE BELIEVE
        </div>

        <h2 className="max-w-[1000px] mx-auto m-0 text-[clamp(40px,7vw,88px)] leading-[0.9] font-extrabold tracking-[-0.07em] uppercase text-white">
          CLOTHES AREN'T<br />
          JUST WHAT YOU <span className="text-[#e6321c]">WEAR.</span><br />
          THEY'RE HOW<br />
          YOU <span className="text-[#e6321c]">EXPRESS.</span>
        </h2>
      </section>

      {/* =======================================================
           STORY
      ======================================================= */}
      <section className="py-[clamp(70px,9vw,120px)]" id="story">
        <div className="container-bingooo grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-[clamp(50px,9vw,140px)] items-center">
          <div className="aspect-[4/5] overflow-hidden bg-[#ede0cc] max-w-[600px] mx-auto lg:mx-0 w-full">
            <img
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=90"
              alt="Bingooo clothing story"
              className="w-full h-full object-cover grayscale"
            />
          </div>

          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              THE BEGINNING
            </div>

            <h2 className="my-2.5 mb-6 text-[clamp(40px,5vw,70px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase">
              BUILT<br />
              FOR<br />
              <span className="text-[#e6321c]">YOU.</span>
            </h2>

            <p className="max-w-[600px] m-0 mb-[18px] text-[#6f6a63] text-[13px] leading-[1.85]">
              BINGOOO started with a simple idea: clothing shouldn't feel like something everyone else is wearing.
            </p>

            <p className="max-w-[600px] m-0 mb-[18px] text-[#6f6a63] text-[13px] leading-[1.85]">
              We wanted to create a space where everyday clothing meets individuality — where people can discover pieces, create their own designs and wear something that actually feels like them.
            </p>

            <p className="max-w-[600px] m-0 mb-[18px] text-[#6f6a63] text-[13px] leading-[1.85]">
              From everyday essentials to custom creations, everything we make starts with the same question: <strong>"Does this feel like you?"</strong>
            </p>

            <div className="mt-[30px] text-[10px] font-bold tracking-[0.15em] uppercase font-mono text-[#171717]">
              BINGOOO / EST. 2026 / INDIA
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           NUMBERS
      ======================================================= */}
      <section className="pb-[110px]">
        <div className="container-bingooo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-[#ddd3c5]">
            <div className="p-[35px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                2026
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Founded
              </div>
            </div>

            <div className="p-[35px_25px] border-b sm:border-b-0 lg:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                001
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                First Collection
              </div>
            </div>

            <div className="p-[35px_25px] border-b sm:border-b-0 sm:border-r border-[#ddd3c5]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em]">
                ∞
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                Ways To Express
              </div>
            </div>

            <div className="p-[35px_25px]">
              <div className="text-[clamp(35px,4vw,58px)] font-extrabold tracking-[-0.06em] text-[#e6321c]">
                YOU
              </div>
              <div className="mt-[7px] text-[#6f6a63] text-[9px] font-semibold uppercase tracking-[0.12em]">
                The Reason
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
           BELIEFS (VALUES)
      ======================================================= */}
      <section className="py-[100px] bg-[#ede0cc]">
        <div className="container-bingooo">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[45px] gap-4">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2">
                OUR VALUES
              </div>

              <h2 className="m-0 text-[clamp(40px,5vw,68px)] leading-[0.88] font-extrabold tracking-[-0.065em] uppercase">
                WHAT WE<br />
                STAND FOR.
              </h2>
            </div>

            <p className="max-w-[330px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
              Three simple ideas guide every piece, product and experience we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#ddd3c5]">
            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  01
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Individuality
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                There is no single way to dress. Your style belongs to you. We create pieces that give you room to make them your own.
              </p>
            </article>

            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  02
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Quality
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                Good design means nothing without good construction. We focus on materials, fit, comfort and details that last.
              </p>
            </article>

            <article className="min-h-[300px] p-[35px] bg-[#f7eedb] flex flex-col justify-between">
              <div>
                <div className="text-[#e6321c] font-mono text-[11px] font-bold">
                  03
                </div>
                <h3 className="mt-[50px] mb-3 text-[20px] font-extrabold tracking-[-0.03em] uppercase">
                  Community
                </h3>
              </div>
              <p className="max-w-[300px] m-0 text-[#6f6a63] text-[11px] leading-[1.7]">
                BINGOOO isn't just a clothing brand. It's a collection of people, ideas, stories and personalities.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =======================================================
           CUSTOM ATELIER SPLIT
      ======================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[550px] lg:min-h-[600px]">
        <div className="min-h-[380px] lg:min-h-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1500&q=90"
            alt="Custom Bingooo clothing"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="flex flex-col justify-center p-[45px_24px] sm:p-[clamp(45px,7vw,100px)] bg-[#171717] text-white">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#e6321c] mb-3">
            CUSTOM STUDIO
          </div>

          <h2 className="my-3 mb-5 text-[clamp(40px,5vw,70px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-white">
            YOUR IDEA.<br />
            YOUR CANVAS.
          </h2>

          <p className="max-w-[410px] m-0 mb-[30px] text-[#aaa7a1] text-[12px] leading-[1.8]">
            We believe your favourite piece of clothing doesn't always exist yet. That's why we built BINGOOO Custom. Upload your artwork, choose your garment, customize it and make something completely yours.
          </p>

          <div>
            <Link
              to="/customize"
              onClick={() => triggerHaptic('medium')}
              className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#e6321c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b91f12] hover:-translate-y-0.5 transition-all"
            >
              CREATE YOUR OWN →
            </Link>
          </div>
        </div>
      </section>

      {/* =======================================================
           COMMUNITY GRID
      ======================================================= */}
      <section className="py-[110px]">
        <div className="container-bingooo">
          <div className="text-center mb-[45px]">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              THE BINGOOO COMMUNITY
            </div>

            <h2 className="my-2.5 mb-[15px] text-[clamp(40px,6vw,75px)] font-extrabold leading-[0.88] tracking-[-0.07em] uppercase">
              PEOPLE.<br />
              THREADS.<br />
              STORIES.
            </h2>

            <p className="max-w-[470px] mx-auto text-[#6f6a63] text-[12px] leading-[1.7]">
              The best part of BINGOOO isn't what we make. It's the people who make it theirs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',
              'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=85',
              'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=85',
              'https://images.unsplash.com/photo-1583743814966-8936f37f7996?auto=format&fit=crop&w=700&q=85',
            ].map((imgSrc, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-[#ede0cc]">
                <img
                  src={imgSrc}
                  alt={`Bingooo Community ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale hover:scale-[1.04] transition-transform duration-500 ease-out"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
           MANIFESTO
      ======================================================= */}
      <section className="py-[110px] px-5 bg-[#f7eedb] border-t border-[#ddd3c5]">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
            THE BINGOOO MANIFESTO
          </div>

          <h2 className="my-2.5 mb-[35px] text-[clamp(42px,6vw,80px)] leading-[0.9] font-extrabold tracking-[-0.07em] uppercase">
            WEAR WHAT<br />
            <span className="text-[#e6321c]">DEFINES</span><br />
            YOU.
          </h2>

          <p className="max-w-[650px] mx-auto text-[#6f6a63] text-[13px] leading-[1.8]">
            Don't dress for everyone else. Find your fit. Make your statement. Change your mind. Try something different. Be comfortable. Be weird. Be simple. Be loud. Be you.
          </p>
        </div>
      </section>

      {/* =======================================================
           FINAL CTA
      ======================================================= */}
      <section className="py-[100px] px-5 bg-[#e6321c] text-white text-center">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-2">
          READY?
        </div>

        <h2 className="my-2 mb-[25px] text-[clamp(45px,7vw,90px)] leading-[0.85] font-extrabold tracking-[-0.07em] uppercase text-white">
          FIND YOUR<br />
          BINGOOO.
        </h2>

        <p className="max-w-[450px] mx-auto mb-[30px] text-white/90 text-[12px] leading-[1.7]">
          Explore the collection or create something that is completely yours.
        </p>

        <Link
          to="/shop"
          onClick={() => triggerHaptic('medium')}
          className="inline-flex items-center justify-center min-h-[48px] px-[23px] rounded-[7px] bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 transition-all"
        >
          SHOP THE COLLECTION →
        </Link>
      </section>
    </main>
  );
}

export default AboutPage;
