import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

const footerLinks = {
  Shop: [
    { label: 'All Catalog Drops', href: '/shop' },
    { label: 'Oversized Heavy Tees', href: '/shop?category=t-shirts' },
    { label: 'French Terry Hoodies', href: '/shop?category=hoodies' },
    { label: '2D/3D Design Studio', href: '/customize' },
  ],
  Atelier: [
    { label: 'Our Craftsmanship', href: '/about' },
    { label: '220 GSM Cotton Specs', href: '/about' },
    { label: 'DTG Print Technology', href: '/customize' },
    { label: 'Brand Guidelines', href: '/about' },
  ],
  Support: [
    { label: 'Contact Studio', href: '/contact' },
    { label: 'Air Express Dispatch', href: '/policies/shipping' },
    { label: '7-Day Return Policy', href: '/policies/returns' },
    { label: 'Size & Fit Guide', href: '/policies/size-guide' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms of Service', href: '/policies/terms' },
    { label: 'Customization Terms', href: '/policies/terms' },
  ],
};

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border-dark bg-ink text-white noise-overlay">
      <div className="container-wide py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Manifesto & Newsletter - 5 cols */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block py-1" aria-label="Bingooo Home">
              <Logo variant="white" size="lg" />
            </Link>
            <p className="text-caption text-white/70 max-w-sm font-sans leading-relaxed">
              India's premier luxury street fashion atelier. Built on 220 GSM combed organic cotton, bespoke industrial print finishes, and limitless creative freedom.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-gold block mb-2">
                JOIN THE ATELIER ARCHIVE
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-mono text-success bg-white/5 p-3 rounded-xl border border-success/30">
                  <CheckCircle2 size={16} />
                  <span>YOU'RE ON THE VIP DROP LIST.</span>
                </div>
              ) : (
                <form className="flex gap-2" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-xs font-mono text-white placeholder:text-white/40 focus:border-brand-red focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    className="bg-brand-red hover:bg-brand-red-hover text-white font-mono font-bold text-xs tracking-wider shrink-0 px-5"
                  >
                    JOIN
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Nav Link Columns - 8 cols */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/90">
                  {title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-xs font-sans text-white/60 hover:text-brand-red transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Trust Badges & Copyright */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs text-white/50">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-white/70">
              <ShieldCheck size={14} className="text-brand-red" /> 100% SECURE CHECKOUT
            </span>
            <span className="flex items-center gap-1.5 text-white/70">
              <Truck size={14} className="text-brand-red" /> AIR EXPRESS INDIA
            </span>
          </div>

          <p>
            &copy; {new Date().getFullYear()} BINGOOO APPAREL CORP. ALL RIGHTS RESERVED.
          </p>

          <div className="flex items-center gap-3">
            <SocialLink href="https://instagram.com" label="Instagram">
              <Instagram size={18} />
            </SocialLink>
            <SocialLink href="https://twitter.com" label="Twitter">
              <Twitter size={18} />
            </SocialLink>
            <SocialLink href="https://youtube.com" label="YouTube">
              <Youtube size={18} />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-brand-red transition-all"
      aria-label={label}
    >
      {children}
    </a>
  );
}
