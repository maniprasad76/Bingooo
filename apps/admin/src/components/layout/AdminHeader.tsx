import { Menu, ExternalLink, Bell } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Overview', subtitle: 'Live store telemetry, active orders & inventory health' },
  '/analytics': { title: 'Analytics & Reports', subtitle: 'Sales velocity, conversion funnels & revenue performance' },
  '/products': { title: 'Product Catalog', subtitle: 'Manage menswear collections, pricing, and variants' },
  '/products/new': { title: 'New Product Creator', subtitle: 'Publish bespoke apparel, specifications and size matrices' },
  '/inventory': { title: 'Variant Inventory', subtitle: 'SKU availability, low stock triggers and adjustments' },
  '/categories': { title: 'Taxonomy & Categories', subtitle: 'Organize store menu collections and display order' },
  '/orders': { title: 'Orders & Fulfillment', subtitle: 'Process customer shipments, verify COD, and tracking' },
  '/custom-orders': { title: 'Custom Prints Queue', subtitle: 'Review and approve customer artwork & studio orders' },
  '/custom-requirements': { title: 'Custom Requirements', subtitle: 'Moderate bespoke bulk orders, custom briefs and quotes' },
  '/returns': { title: 'Returns & Refunds', subtitle: 'Manage customer exchange requests, pickups, and refunds' },
  '/coupons': { title: 'Coupons & Vouchers', subtitle: 'Promotional promo codes, minimum spend rules and incentives' },
  '/discounts': { title: 'Promotional Discounts', subtitle: 'Automated catalog markdowns, seasonal deals and volume rules' },
  '/banners': { title: 'Storefront Banners', subtitle: 'Manage hero slides, promotional cards and announcement strips' },
  '/payments': { title: 'Payments Ledger', subtitle: 'Razorpay transactions, captured checkouts, and refund audits' },
  '/uploads': { title: 'Media Asset Library', subtitle: 'Cloudflare R2 images, garment lookbooks, and studio uploads' },
  '/customers': { title: 'Customer Directory', subtitle: 'Registered customer profiles, spending & order history' },
  '/users': { title: 'Staff Users & Team', subtitle: 'Manage administrator accounts, permissions, and security' },
  '/roles': { title: 'Roles & Permissions', subtitle: 'Granular Role-Based Access Control (RBAC) definitions' },
  '/reviews': { title: 'Review Moderation', subtitle: 'Moderate shopper testimonials, ratings, and garment photos' },
  '/notifications': { title: 'Notification Center', subtitle: 'System operational alerts, stock flags, and queue updates' },
  '/audit-logs': { title: 'Audit Trail', subtitle: 'Immutable security log of admin operations and adjustments' },
  '/settings': { title: 'Store Settings', subtitle: 'Platform parameters, shipping matrix & integrations' },
  '/profile': { title: 'Admin Profile', subtitle: 'Personal credentials, active sessions, and security keys' },
};

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  let currentMeta = titles[currentPath];
  if (!currentMeta) {
    if (currentPath.startsWith('/orders/')) {
      currentMeta = { title: 'Order Details', subtitle: 'Inspect items, address, timeline, and customer fulfillment' };
    } else if (currentPath.startsWith('/customers/')) {
      currentMeta = { title: 'Customer Dossier', subtitle: 'Customer lifetime activity, orders, and addresses' };
    } else if (currentPath.startsWith('/products/') && currentPath.includes('/edit')) {
      currentMeta = { title: 'Edit Product', subtitle: 'Update catalog specifications, launch status, and pricing' };
    } else {
      currentMeta = { title: 'Operations Portal', subtitle: 'Bingooo Men\'s Wear Control Center' };
    }
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-border bg-[#F7EEDB]/90 px-4 backdrop-blur-md sm:px-8">
      {/* Left Title & Mobile Toggle */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="shrink-0 rounded-lg border border-border bg-white p-2 text-ink shadow-sm hover:border-brand-red lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {currentMeta.title}
          </h1>
          <p className="hidden truncate text-xs text-muted sm:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-border bg-white/70 px-3 py-1.5 text-xs font-semibold text-muted md:flex">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>API Connected (3000)</span>
        </div>

        <Link
          to="/notifications"
          className="relative rounded-lg border border-border bg-white p-2 text-ink shadow-sm transition-colors hover:border-brand-red hover:text-brand-red"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white">
            3
          </span>
        </Link>

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-ink shadow-sm transition-colors hover:border-brand-red hover:text-brand-red"
        >
          <span className="hidden sm:inline">Store</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
