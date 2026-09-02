import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/collection/best-sellers' },
    { label: 'Custom Designs', href: '/customize' },
  ],
  Help: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping', href: '/policies/shipping' },
    { label: 'Returns & Exchanges', href: '/policies/returns' },
    { label: 'Size Guide', href: '/policies/size-guide' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms of Service', href: '/policies/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container-page py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">
          {/* Brand + newsletter */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link to="/" className="inline-block py-1" aria-label="Bingooo Home">
              <Logo variant="red" size="md" />
            </Link>
            <p className="mt-3 text-caption text-muted max-w-xs">
              Premium fashion and custom-designed apparel. Express yourself with Bingooo.
            </p>

            {/* Newsletter */}
            <form
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Input
                placeholder="Your email"
                type="email"
                aria-label="Email for newsletter"
                className="flex-1"
              />
              <Button variant="primary" size="md" type="submit">
                Join
              </Button>
            </form>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-caption font-semibold uppercase tracking-wider text-ink mb-4">
                {title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-caption text-muted transition-colors duration-hover hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-caption text-muted">
            &copy; {new Date().getFullYear()} Bingooo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
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
      className="flex items-center justify-center rounded-full p-2 text-muted transition-colors duration-hover hover:text-ink hover:bg-ink/5"
      aria-label={label}
    >
      {children}
    </a>
  );
}
