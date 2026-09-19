import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { adminLogout } from '../lib/auth';
import { useToast } from './Toast';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Store,
  Palette,
  FolderTree,
  Boxes,
  MessageSquare,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: Array<{
    to: string;
    icon: any;
    label: string;
    end?: boolean;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/orders', icon: ShoppingBag, label: 'Orders' },
    ],
  },
  {
    label: 'Catalog & Studio',
    items: [
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/categories', icon: FolderTree, label: 'Categories' },
      { to: '/inventory', icon: Boxes, label: 'Inventory' },
      { to: '/customizer', icon: Palette, label: '3D Customizer' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/reviews', icon: MessageSquare, label: 'Reviews' },
      { to: '/returns', icon: RotateCcw, label: 'Returns & Refunds' },
    ],
  },
  {
    label: 'Storefront & Config',
    items: [
      { to: '/coupons', icon: Ticket, label: 'Coupons' },
      { to: '/banners', icon: Image, label: 'Banners & Hero' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function AdminLayout() {
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    adminLogout();
    toast.info('Signed Out', 'You have been signed out of admin console.');
    navigate('/login');
  };

  const currentRouteName = () => {
    const p = location.pathname;
    for (const grp of NAV_GROUPS) {
      for (const item of grp.items) {
        if (item.end ? p === item.to : p.startsWith(item.to)) {
          return item.label;
        }
      }
    }
    return 'Management';
  };

  const sidebarW = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className="flex min-h-screen bg-paper text-ink font-sans selection:bg-brand-red selection:text-white">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Luxury Dark Obsidian Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#141414] border-r border-white/10 transition-all duration-300 ease-out shadow-2xl
          ${sidebarW}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand Crest Header */}
        <div
          className={`flex items-center h-[68px] border-b border-white/[0.08] px-4 shrink-0 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-[#F9EEDC]">
                <img src="/submark.png" alt="Bingooo" className="w-full h-full object-cover select-none" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black uppercase tracking-[0.18em] text-white font-sans">
                    Bingooo
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider bg-white/10 text-white/70">
                    ATELIER
                  </span>
                </div>
                <span className="text-[9px] font-mono text-white/40 tracking-wider">
                  OS v2.4 • PRODUCTION
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-[#F9EEDC]">
              <img src="/submark.png" alt="Bingooo" className="w-full h-full object-cover select-none" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={15}
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto overflow-x-hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[9px] font-mono font-bold tracking-[0.2em] text-white/30 uppercase">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150 no-underline
                      ${collapsed ? 'justify-center px-2' : ''}
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-red to-brand-red-deep text-white shadow-glow-red font-extrabold'
                          : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={17}
                      className="shrink-0 transition-transform duration-150 group-hover:scale-110"
                    />
                    {!collapsed && (
                      <span className="truncate tracking-wide">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/20 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Sign Out Footer */}
        <div className={`border-t border-white/[0.08] p-3.5 shrink-0 bg-white/[0.02] ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && user && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-red/20 border border-brand-red/30 text-brand-red font-black text-xs shrink-0 font-mono">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user.fullName || user.email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/40 truncate">
                    {user.role?.replace('_', ' ') || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-bold text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Sign out of Admin OS"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-[68px] bg-paper/85 backdrop-blur-md border-b border-border/80 px-4 lg:px-8 gap-4 shrink-0 transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl bg-white border border-border text-ink hover:bg-beige transition-colors shadow-2xs"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted">
                ATELIER OS
              </span>
              <span className="text-muted/40 font-mono">/</span>
              <span className="text-xs font-black uppercase tracking-wider text-ink font-sans">
                {currentRouteName()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live System Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-border/70 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-muted uppercase">
                API ONLINE
              </span>
            </div>

            {/* Visit Storefront CTA */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-wider text-ink shadow-2xs hover:border-brand-red hover:text-brand-red hover:shadow-glow-red hover:-translate-y-0.5 transition-all no-underline"
            >
              <Store size={14} className="text-brand-red" />
              <span className="hidden xs:inline">Storefront</span>
              <ExternalLink size={12} className="text-muted" />
            </a>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
