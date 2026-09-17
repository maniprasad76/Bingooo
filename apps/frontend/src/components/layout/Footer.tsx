import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getWhatsAppUrl,
  BINGOOO_INSTAGRAM_URL,
  WhatsAppIcon,
  InstagramIcon,
  YouTubeIcon,
  PinterestIcon,
} from '../ui/SocialIcons';

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
  isWaHighlight?: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  hasDot?: boolean;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    id: 'shop',
    title: 'Shop',
    links: [
      { label: 'Men', href: '/shop?category=men' },
      { label: 'Women', href: '/shop?category=women' },
      { label: 'Custom Studio', href: '/customize' },
      { label: 'All Products', href: '/shop' },
      {
        label: 'Bulk Orders (WA)',
        href: getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk order for custom apparel.'),
        isExternal: true,
        isWaHighlight: true,
      },
    ],
  },
  {
    id: 'collections',
    title: 'Collections',
    hasDot: true,
    links: [
      { label: 'Animes Collection', href: '/shop?collection=anime' },
      { label: 'TFI Collection', href: '/shop?collection=tfi' },
      { label: 'Marvel Collection', href: '/shop?collection=marvel' },
      { label: 'Personal Collection', href: '/customize?collection=personal' },
      { label: 'Cartoon Collection', href: '/shop?collection=cartoon' },
    ],
  },
  {
    id: 'help',
    title: 'Help',
    links: [
      { label: 'Track Order', href: '/track-order' },
      { label: 'Shipping', href: '/shipping-policy' },
      { label: 'Returns', href: '/returns-refunds' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'FAQs', href: '/faq' },
    ],
  },
  {
    id: 'about',
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Sustainability', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Press', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Bingooo Footer"
      className="bg-[#171717] text-white pt-[60px] sm:pt-[72px] pb-[100px] md:pb-[36px] font-sans"
    >
      <div className="w-[min(calc(100%-32px),1440px)] md:w-[min(calc(100%-48px),1440px)] mx-auto">
        {/* ─── Bulk Order Typography Banner (Chat on WhatsApp) ─── */}
        <div className="border-b border-white/10 pb-8 sm:pb-10 mb-10 sm:mb-12 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl flex flex-col items-center md:items-start">
            <div className="text-[10px] font-extrabold tracking-[0.24em] uppercase text-[#E6321C] mb-2 flex items-center justify-center md:justify-start gap-2">
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
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#F7EEDB] text-[#171717] font-bold text-xs tracking-[0.14em] uppercase hover:bg-[#E6321C] hover:text-white transition-all shrink-0 border border-transparent shadow-sm select-none"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>CHAT ON WHATSAPP →</span>
          </a>
        </div>

        {/* ─── Footer Navigation: Collapsible Dropdown List on Mobile, Multi-column on Desktop ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1.5fr_0.9fr_1.1fr_0.9fr_0.9fr_0.9fr] gap-0 md:gap-[30px] lg:gap-[35px]">
          {/* Brand */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0 pb-6 md:pb-0 border-b border-white/10 md:border-b-0">
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

            <div className="flex items-center justify-center md:justify-start gap-[11px]">
              <a
                href={BINGOOO_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Bingooo on Instagram"
                title="Instagram (@bingooo.sklm)"
                className="w-[32px] h-[32px] border border-white/20 rounded-full grid place-items-center text-[#d4d1cc] hover:text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-all duration-150"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Bingooo on YouTube"
                title="YouTube"
                className="w-[32px] h-[32px] border border-white/20 rounded-full grid place-items-center text-[#d4d1cc] hover:text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-all duration-150"
              >
                <YouTubeIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Bingooo on Pinterest"
                title="Pinterest"
                className="w-[32px] h-[32px] border border-white/20 rounded-full grid place-items-center text-[#d4d1cc] hover:text-white hover:bg-[#E6321C] hover:border-[#E6321C] transition-all duration-150"
              >
                <PinterestIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={getWhatsAppUrl('Hi Bingooo, I would like to chat about your menswear.')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Bingooo on WhatsApp"
                title="WhatsApp"
                className="w-[32px] h-[32px] border border-white/20 rounded-full grid place-items-center text-[#d4d1cc] hover:text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-150"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Collapsible Dropdown Sections (Shop, Collections, Help, About) */}
          {FOOTER_SECTIONS.map((section) => {
            const isOpen = !!openSections[section.id];
            return (
              <div
                key={section.id}
                className="border-b border-white/10 md:border-b-0 flex flex-col items-start w-full text-left"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  aria-controls={`footer-section-${section.id}`}
                  className="w-full py-4 md:py-0 flex items-center justify-between text-left focus:outline-none group cursor-pointer md:cursor-default md:pointer-events-none md:mb-[17px]"
                >
                  <span className="text-[11px] md:text-[10px] tracking-[0.18em] md:tracking-[0.15em] uppercase font-bold text-white inline-flex items-center gap-1.5 transition-colors group-hover:text-[#F7EEDB] md:group-hover:text-white">
                    <span>{section.title}</span>
                    {section.hasDot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6321C]" />
                    )}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-[#aaa7a1] group-hover:text-white transition-transform duration-200 shrink-0 md:hidden',
                      isOpen && 'rotate-180 text-[#F7EEDB]'
                    )}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`footer-section-${section.id}`}
                  className={cn(
                    'grid transition-all duration-200 ease-in-out w-full md:!grid-rows-[1fr] md:!opacity-100',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 pb-5 pt-1'
                      : 'grid-rows-[0fr] opacity-0 pb-0 pt-0 md:pb-0 md:pt-0'
                  )}
                >
                  <div className="overflow-hidden md:overflow-visible">
                    <div className="space-y-[13px] md:space-y-[11px] text-[12px] md:text-[10px] w-full">
                      {section.links.map((link) => {
                        if (link.isExternal) {
                          return (
                            <a
                              key={link.label}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#F7EEDB] hover:text-[#25D366] transition-colors font-semibold py-0.5"
                            >
                              <span>{link.label}</span>
                              <ArrowUpRight size={12} />
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={link.label}
                            to={link.href}
                            onClick={scrollToTop}
                            className={cn(
                              'block transition-colors py-0.5',
                              section.id === 'collections'
                                ? 'text-[#aaa7a1] hover:text-[#F7EEDB]'
                                : 'text-[#aaa7a1] hover:text-white'
                            )}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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
        <div className="mt-[50px] pt-[22px] border-t border-[#363636] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-[#85827d] text-[11px] font-sans">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>© 2026 Bingooo. All rights reserved.</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="inline-flex items-center gap-1.5">
              <span>Designed by</span>
              <a
                href="https://www.instagram.com/___mani___76/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Designed by ___mani___76 on Instagram"
                title="Follow ___mani___76 on Instagram"
                className="font-medium text-[#f7eedb] hover:text-[#E6321C] transition-colors inline-flex items-center gap-1 group"
              >
                <span className="hover:underline underline-offset-2">___mani___76</span>
                <InstagramIcon className="w-3.5 h-3.5 text-[#85827d] group-hover:text-[#E6321C] transition-colors shrink-0" />
              </a>
            </span>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end gap-x-5 gap-y-2 text-[11px]">
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
