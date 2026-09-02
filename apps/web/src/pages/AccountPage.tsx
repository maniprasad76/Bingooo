import { Link } from 'react-router-dom';
import { User, Package, Heart, Palette, MapPin, LogOut } from 'lucide-react';

const accountLinks = [
  { label: 'My Orders', href: '/account/orders', icon: Package, description: 'View order history and tracking' },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart, description: 'Saved products' },
  { label: 'My Designs', href: '/account/designs', icon: Palette, description: 'Custom design projects' },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin, description: 'Manage delivery addresses' },
];

export function AccountPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light">
          <User size={28} className="text-accent" />
        </div>
        <div>
          <h1 className="text-heading text-ink">My Account</h1>
          <p className="text-caption text-muted">Manage your profile and orders</p>
        </div>
      </div>

      {/* Account links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {accountLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-4 rounded-lg border border-border bg-white p-5 transition-shadow duration-hover hover:shadow-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper">
                <Icon size={20} className="text-ink" />
              </div>
              <div>
                <h3 className="text-body font-medium text-ink">{link.label}</h3>
                <p className="text-caption text-muted">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <button className="mt-8 flex items-center gap-2 text-caption text-muted hover:text-danger transition-colors duration-hover">
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
