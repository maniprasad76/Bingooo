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
      { to: '/customizer', icon: Palette, label: 'Custom Studio' },
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

  const sidebarW = collapsed ? 'w-[76px]' : 'w-[270px]';

  return (
    <div className="flex min-h-screen bg-[#F7EEDB] text-[#171717] font-sans selection:bg-[#E6321C] selection:text-white">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Atelier Executive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#F7EEDB] border-r-2 border-[#171717] transition-all duration-200 ease-out shadow-[3px_0px_0px_#171717]
          ${sidebarW}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto shrink-0
        `}
      >
        {/* Brand Crest Header */}
        <div
          className={`flex items-center h-[68px] border-b-2 border-[#171717] bg-[#EDE0CC] px-4 shrink-0 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-md overflow-hidden border-2 border-[#171717] shadow-[2px_2px_0px_#171717] shrink-0 bg-white">
                <img src="/submark.png" alt="Bingooo" className="w-full h-full object-cover select-none" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black uppercase tracking-wider text-[#171717] font-sans">
                    BINGOOO<span className="text-[#E6321C]">.</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider bg-[#171717] text-white">
                    ATELIER
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-[#6F6A63] tracking-widest uppercase">
                  OS v2.4 • CONTROL
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-9 h-9 rounded-md overflow-hidden border-2 border-[#171717] shadow-[2px_2px_0px_#171717] shrink-0 bg-white">
              <img src="/submark.png" alt="Bingooo" className="w-full h-full object-cover select-none" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 border-1.5 border-[#171717] rounded-md bg-white text-[#171717] hover:bg-[#171717] hover:text-white transition-colors shadow-[1.5px_1.5px_0px_#171717] cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={15}
              className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden items-center justify-center w-8 h-8 border-1.5 border-[#171717] rounded-md bg-white text-[#171717] hover:bg-[#E6321C] hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto overflow-x-hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[9px] font-mono font-black tracking-[0.2em] text-[#6F6A63] uppercase border-b border-[#171717]/15">
                  {group.label}
                </div>
              )}
              <div className="space-y-1 pt-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-md px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 no-underline
                      ${collapsed ? 'justify-center px-2' : ''}
                      ${
                        isActive
                          ? 'bg-[#E6321C] text-white border-1.5 border-[#171717] shadow-[2px_2px_0px_#171717] font-black'
                          : 'text-[#171717] hover:bg-[#EDE0CC] hover:border-1.5 hover:border-[#171717] border-1.5 border-transparent'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={16}
                      className="shrink-0 transition-transform duration-150 group-hover:scale-110"
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-mono font-black bg-[#171717] text-white border border-[#171717]">
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
        <div className={`border-t-2 border-[#171717] p-3 shrink-0 bg-[#EDE0CC] ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 p-2 rounded-md bg-white border-1.5 border-[#171717] shadow-[2px_2px_0px_#171717] mb-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded bg-[#E6321C] border border-[#171717] text-white font-mono font-black text-xs shrink-0">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#171717] truncate leading-tight uppercase font-mono">
                  {user.fullName || user.email}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 border border-[#171717]"></span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] truncate">
                    {user.role?.replace('_', ' ') || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full rounded-md px-3 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#171717] bg-white border-1.5 border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
              collapsed ? 'justify-center px-1' : ''
            }`}
            title="Sign out of Admin OS"
          >
            <LogOut size={14} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Atelier Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-[68px] bg-[#F7EEDB] border-b-2 border-[#171717] px-4 lg:px-8 gap-4 shrink-0 transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex lg:hidden items-center justify-center w-9 h-9 rounded-md bg-white border-1.5 border-[#171717] text-[#171717] hover:bg-[#EDE0CC] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] text-[#6F6A63]">
                ATELIER OS
              </span>
              <span className="text-[#171717]/40 font-mono font-bold">/</span>
              <span className="text-xs font-black uppercase tracking-wider text-[#171717] font-mono bg-white px-2.5 py-1 border-1.5 border-[#171717] rounded-md shadow-[1.5px_1.5px_0px_#171717]">
                {currentRouteName()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live System Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border-1.5 border-[#171717] shadow-[1.5px_1.5px_0px_#171717]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#171717] animate-pulse"></span>
              <span className="text-[10px] font-mono font-black tracking-wider text-[#171717] uppercase">
                API ONLINE
              </span>
            </div>

            {/* Visit Storefront CTA */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#EDE0CC] border-1.5 border-[#171717] text-xs font-mono font-black uppercase tracking-wider text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#E6321C] hover:text-white hover:border-[#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all no-underline"
            >
              <Store size={14} />
              <span className="hidden xs:inline">Storefront</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
