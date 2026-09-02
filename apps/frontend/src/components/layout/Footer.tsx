import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '../ui/Logo';

// Custom clean SVG icon for WhatsApp
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

// Custom clean SVG icon for Instagram
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-[#F7EEDB] border-t border-[#DDD3C5] pt-14 pb-8 text-[#171717]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10 pb-12">
          {/* Column 1: Brand & Socials (md:col-span-3) */}
          <div className="col-span-2 md:col-span-3 flex flex-col items-start">
            <Link to="/" aria-label="Bingooo Home" className="inline-block py-1">
              <Logo variant="red" size="md" />
            </Link>

            <p className="mt-3 text-xs text-[#6F6A63] font-serif italic leading-relaxed">
              Express yourself. Create your style.<br />
              This is Bingooo.
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              <a
                href="https://instagram.com/bingooo.sklm"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full border border-[#DDD3C5] flex items-center justify-center text-[#6F6A63] hover:text-[#E6321C] hover:border-[#E6321C] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/917981787317"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full border border-[#DDD3C5] flex items-center justify-center text-[#6F6A63] hover:text-[#E6321C] hover:border-[#E6321C] transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: SHOP (md:col-span-2) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.14em] text-[#171717] mb-4">
              SHOP
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#6F6A63]">
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
                <Link to="/shop?sort=newest" className="hover:text-[#E6321C] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/customize" className="hover:text-[#E6321C] transition-colors">
                  Custom
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP (md:col-span-2) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.14em] text-[#171717] mb-4">
              HELP
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#6F6A63]">
              <li>
                <Link to="/contact" className="hover:text-[#E6321C] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/policies/shipping" className="hover:text-[#E6321C] transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-[#E6321C] transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-[#E6321C] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact#faqs" className="hover:text-[#E6321C] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: ABOUT (md:col-span-2) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.14em] text-[#171717] mb-4">
              ABOUT
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#6F6A63]">
              <li>
                <Link to="/about" className="hover:text-[#E6321C] transition-colors">
                  About Bingooo
                </Link>
              </li>
              <li>
                <Link to="/about#story" className="hover:text-[#E6321C] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/policies/size-guide" className="hover:text-[#E6321C] transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-[#E6321C] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-[#E6321C] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: CONTACT (md:col-span-3) */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.14em] text-[#171717] mb-4">
              CONTACT
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-[#6F6A63]">
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-[#E6321C] shrink-0" />
                <a href="tel:+917981787317" className="hover:text-[#E6321C] transition-colors">
                  +91 79817 87317
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-[#E6321C] shrink-0" />
                <a href="mailto:hello@bingooo.in" className="hover:text-[#E6321C] transition-colors">
                  hello@bingooo.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={13} className="text-[#E6321C] shrink-0 mt-0.5" />
                <span>Srikakulam, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Divider & Copyright */}
        <div className="pt-8 border-t border-[#DDD3C5] text-center">
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.18em] uppercase text-[#6F6A63]">
            &copy; {new Date().getFullYear()} BINGOOO MENS WEAR. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
