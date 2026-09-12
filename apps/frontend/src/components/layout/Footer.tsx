import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { getWhatsAppUrl, BINGOOO_INSTAGRAM_URL, WhatsAppIcon } from '../ui/SocialIcons';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Bingooo Footer"
      className="bg-[#171717] text-white pt-[60px] sm:pt-[72px] pb-[25px] font-sans"
    >
      <div className="w-[min(calc(100%-32px),1440px)] md:w-[min(calc(100%-48px),1440px)] mx-auto">
        {/* ─── Bulk Order Typography Banner (Chat on WhatsApp) ─── */}
        <div className="border-b border-white/10 pb-8 sm:pb-10 mb-10 sm:mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-[10px] font-extrabold tracking-[0.24em] uppercase text-[#E6321C] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6321C]" />
              <span>CUSTOM TEAMS, MERCH & WHOLESALE APPAREL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none">
              PLANNING A BULK ORDER? <span className="text-[#F7EEDB]">CHAT ON WHATSAPP.</span>
            </h2>
            <p className="text-[#aaa7a1] text-xs sm:text-[13px] mt-2 leading-relaxed">
              Wholesale custom manufacturing for college fests, corporate teams & streetwear brands. Direct factory pricing, free mockups & priority delivery.
            </p>
          </div>

          <a
            href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#F7EEDB] text-[#171717] font-bold text-xs tracking-[0.14em] uppercase hover:bg-[#E6321C] hover:text-white transition-all shrink-0 border border-transparent shadow-sm select-none"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>CHAT ON WHATSAPP →</span>
          </a>
        </div>

        {/* ─── 5-Column Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.7fr_1fr_1fr_1fr_1fr] gap-[35px_25px] md:gap-[45px]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              to="/"
              onClick={scrollToTop}
              className="text-[31px] font-extrabold tracking-[-0.07em] leading-none inline-block text-white"
              aria-label="BINGOOO."
            >
              BINGOOO<span className="text-[#E6321C]">.</span>
            </Link>

            <p className="text-[#aaa7a1] text-[11px] my-[14px] mb-[25px]">
              Wear what defines you.
            </p>

            <div className="flex items-center gap-[13px]">
              <a
                href={BINGOOO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-[30px] h-[30px] border border-[#444] rounded-full grid place-items-center text-[10px] text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-colors"
              >
                IG
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-[30px] h-[30px] border border-[#444] rounded-full grid place-items-center text-[10px] text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-colors"
              >
                YT
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-[30px] h-[30px] border border-[#444] rounded-full grid place-items-center text-[10px] text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-colors"
              >
                P
              </a>
              <a
                href={getWhatsAppUrl('Hi Bingooo, I would like to chat about your menswear.')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-[30px] h-[30px] border border-[#444] rounded-full grid place-items-center text-[10px] text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-colors"
              >
                WA
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-[17px] text-[10px] tracking-[0.15em] uppercase font-bold text-white">
              Shop
            </h3>
            <div className="space-y-[11px] text-[10px]">
              <Link to="/shop?category=men" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Men
              </Link>
              <Link to="/shop?category=women" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Women
              </Link>
              <Link to="/customize" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Custom
              </Link>
              <Link to="/shop" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Collections
              </Link>
              <a
                href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#F7EEDB] hover:text-[#25D366] transition-colors font-semibold"
              >
                <span>Bulk Orders (WA)</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-[17px] text-[10px] tracking-[0.15em] uppercase font-bold text-white">
              Help
            </h3>
            <div className="space-y-[11px] text-[10px]">
              <Link to="/track-order" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Track Order
              </Link>
              <Link to="/shipping-policy" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Shipping
              </Link>
              <Link to="/returns-refunds" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Returns
              </Link>
              <Link to="/size-guide" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Size Guide
              </Link>
              <Link to="/faq" className="block text-[#aaa7a1] hover:text-white transition-colors">
                FAQs
              </Link>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-[17px] text-[10px] tracking-[0.15em] uppercase font-bold text-white">
              About
            </h3>
            <div className="space-y-[11px] text-[10px]">
              <Link to="/about" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Our Story
              </Link>
              <Link to="/about" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Sustainability
              </Link>
              <Link to="/about" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Careers
              </Link>
              <Link to="/about" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Press
              </Link>
              <Link to="/contact" className="block text-[#aaa7a1] hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Message (Hidden on mobile <800px per reference CSS) */}
          <div className="hidden lg:block self-start text-[10px] font-semibold tracking-[0.18em] leading-[1.7] uppercase text-white after:content-[''] after:block after:w-[28px] after:h-[1px] after:bg-white after:mt-[14px]">
            CLOTHES<br />
            IDEAS<br />
            PEOPLE<br />
            CULTURE<br />
            YOU
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="mt-[55px] pt-[20px] border-t border-[#363636] flex flex-col sm:flex-row justify-between gap-[20px] text-[#85827d] text-[9px]">
          <div>
            © 2026 Bingooo. All rights reserved.
          </div>

          <div className="flex flex-wrap gap-[22px]">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cancellation-policy" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
