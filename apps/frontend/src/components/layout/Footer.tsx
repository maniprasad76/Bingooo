import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowRight, Check } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface FooterColumn {
  title: string;
  links: { label: string; to: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Oversized Tees', to: '/shop?category=t-shirts' },
      { label: 'Heavyweight Hoodies', to: '/shop?category=hoodies' },
      { label: 'Denim and Pants', to: '/shop?category=jeans' },
      { label: 'Casual Shirts', to: '/shop?category=shirts' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
      { label: 'All Garments', to: '/shop' },
    ],
  },
  {
    title: 'Custom Studio',
    links: [
      { label: '3D Design Lab', to: '/customize' },
      { label: 'DTF Printing', to: '/customize' },
      { label: 'Bulk Orders', to: '/contact' },
      { label: 'Fabric Specifications', to: '/policies/size-guide' },
      { label: 'Artwork Guidelines', to: '/about' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Track Order', to: '/account/orders' },
      { label: 'Shipping Policy', to: '/shipping-policy' },
      { label: 'Returns and Exchange', to: '/returns-refunds' },
      { label: 'Size and Fit Guide', to: '/policies/size-guide' },
      { label: 'Contact Support', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Bingooo', to: '/about' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'My Account', to: '/account' },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsSubscribed(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Bingooo Footer"
      className="w-full bg-[#121212] text-[#DDD3C5] font-sans border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-20">
        
        {/* ─── Top Section: Logo & Clean Drop Subscription ─── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-14 border-b border-white/10">
          <div className="space-y-3 max-w-md">
            <Link
              to="/"
              aria-label="Bingooo Home"
              className="inline-block focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none rounded"
            >
              <Logo variant="white" size="lg" />
            </Link>
            <p className="text-sm text-[#DDD3C5]/70 leading-relaxed">
              Contemporary Indian menswear crafted with 240 to 280 GSM heavyweight cotton. Wear what feels like you.
            </p>
          </div>

          {/* Simple Drop Newsletter Form */}
          <div className="w-full lg:max-w-md">
            {isSubscribed ? (
              <div
                aria-live="polite"
                className="flex items-center gap-3 p-3.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
              >
                <Check className="w-4 h-4 text-[#238636] shrink-0" aria-hidden="true" />
                <span>You are subscribed. Use code <strong className="font-mono text-[#E6321C]">BINGOOO10</strong> for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <label htmlFor="simple-footer-email" className="sr-only">
                  Email for drop updates
                </label>
                <input
                  id="simple-footer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for drop alerts…"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-white placeholder-[#DDD3C5]/40 text-sm focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-5 py-2.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-medium text-xs uppercase tracking-wider font-heading transition-colors shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ─── Middle Section: 4 Spacious, Non-Wrapping Nav Columns ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 py-14 border-b border-white/10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                {col.title}
              </h3>
              <ul className="space-y-3" role="list">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#DDD3C5]/70 hover:text-white transition-colors duration-150 block truncate focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom Section: Clean Copyright & Top Link ─── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DDD3C5]/60">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
            <p>&copy; {new Date().getFullYear()} Bingooo Men&apos;s Wear. All rights reserved.</p>
            <span className="hidden sm:inline text-white/20" aria-hidden="true">•</span>
            <span>Srikakulam, Andhra Pradesh</span>
            <span className="hidden sm:inline text-white/20" aria-hidden="true">•</span>
            <p>
              Developed by{' '}
              <a
                href="https://instagram.com/___mani___76"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white hover:text-[#E6321C] transition-colors focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none rounded"
              >
                ___mani___76
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-[#E6321C] focus-visible:outline-none"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

      </div>
    </footer>
  );
}
