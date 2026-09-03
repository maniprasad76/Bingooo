import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

// ─── Clean Minimal Social Icons ───
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-[#F7EEDB] pt-8 pb-12 sm:pb-16 px-4 sm:px-8 font-sans">
      {/* ─── Floating Beige Luxury Card Container ─── */}
      <div className="max-w-[1360px] mx-auto bg-[#EDE0CC] border border-[#DDD3C5] rounded-2xl pt-12 sm:pt-16 lg:pt-20 px-6 sm:px-12 lg:px-16 overflow-hidden shadow-sm relative">
        
        {/* ─── Top Section: Brand Story & Navigation Columns ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-14">
          {/* Left: Red Bingooo Logo & Description */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <Link to="/" aria-label="Bingooo Home" className="inline-block group">
              <Logo variant="red" size="lg" className="transition-transform duration-200 group-hover:scale-105" />
            </Link>
            <p className="text-sm sm:text-base text-[#6F6A63] font-sans leading-relaxed max-w-sm">
              Wear what feels like you. Premium heavyweight cotton, custom atelier prints, and modern menswear silhouettes crafted in Srikakulam.
            </p>
          </div>

          {/* Right: Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            {/* Column 1: Shop */}
            <div className="space-y-3.5">
              <h4 className="font-heading font-extrabold text-xs uppercase tracking-[0.14em] text-[#171717]">
                Shop
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#6F6A63]">
                <li>
                  <Link to="/shop?category=t-shirts" className="hover:text-[#E6321C] transition-colors">
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=hoodies" className="hover:text-[#E6321C] transition-colors">
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=jeans" className="hover:text-[#E6321C] transition-colors">
                    Jeans
                  </Link>
                </li>
                <li>
                  <Link to="/shop?sort=newest" className="hover:text-[#E6321C] transition-colors inline-flex items-center gap-1.5">
                    <span>New Arrivals</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#E6321C] text-white text-[9px] font-bold font-mono">NEW</span>
                  </Link>
                </li>
                <li>
                  <Link to="/customize" className="hover:text-[#E6321C] transition-colors inline-flex items-center gap-1.5">
                    <span>Custom Atelier</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Customer Care */}
            <div className="space-y-3.5">
              <h4 className="font-heading font-extrabold text-xs uppercase tracking-[0.14em] text-[#171717]">
                Care
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#6F6A63]">
                <li>
                  <Link to="/account/orders" className="hover:text-[#E6321C] transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="hover:text-[#E6321C] transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link to="/returns-refunds" className="hover:text-[#E6321C] transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link to="/policies/size-guide" className="hover:text-[#E6321C] transition-colors">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#E6321C] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-[#E6321C] transition-colors">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company / Legal */}
            <div className="space-y-3.5">
              <h4 className="font-heading font-extrabold text-xs uppercase tracking-[0.14em] text-[#171717]">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#6F6A63]">
                <li>
                  <Link to="/about" className="hover:text-[#E6321C] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/about#story" className="hover:text-[#E6321C] transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-[#E6321C] transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-[#E6321C] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#E6321C] transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Social */}
            <div className="space-y-3.5">
              <h4 className="font-heading font-extrabold text-xs uppercase tracking-[0.14em] text-[#171717]">
                Social
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-[#6F6A63]">
                <li>
                  <a
                    href="https://instagram.com/bingooo.sklm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E6321C] transition-colors inline-flex items-center gap-2 group"
                  >
                    <InstagramIcon className="w-4 h-4 text-[#171717] group-hover:text-[#E6321C] transition-colors" />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/917981787317"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#25D366] transition-colors inline-flex items-center gap-2 group"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#171717] group-hover:text-[#25D366] transition-colors" />
                    <span>WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#171717] transition-colors inline-flex items-center gap-2 group"
                  >
                    <XTwitterIcon className="w-4 h-4 text-[#171717] group-hover:text-[#E6321C] transition-colors" />
                    <span>Twitter</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF0000] transition-colors inline-flex items-center gap-2 group"
                  >
                    <YouTubeIcon className="w-4 h-4 text-[#171717] group-hover:text-[#FF0000] transition-colors" />
                    <span>YouTube</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Middle Divider & Copyright ─── */}
        <div className="pt-8 pb-6 sm:pb-8 border-t border-[#DDD3C5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#6F6A63]">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} <strong className="text-[#171717]">Bingooo Men&apos;s Wear</strong>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-center sm:text-right">
            <span>Srikakulam, AP, India</span>
            <span>&bull;</span>
            <span className="text-[#171717] font-semibold">Wear What Feels Like You</span>
          </div>
        </div>

        {/* ─── Bottom Signature: ORIGINAL BINGOOO RED PNG LOGO IMAGE (PROPERLY VISIBLE) ─── */}
        <div className="pt-6 sm:pt-8 pb-8 sm:pb-12 px-4 sm:px-8 flex items-center justify-center border-t border-[#DDD3C5]/60 bg-[#EDE0CC]">
          <img
            src="/logo.png"
            alt="Bingooo Men's Wear"
            className="w-full max-w-[520px] sm:max-w-[680px] md:max-w-[800px] lg:max-w-[880px] h-auto object-contain select-none transition-transform duration-300 hover:scale-[1.01]"
          />
        </div>

      </div>
    </footer>
  );
}
