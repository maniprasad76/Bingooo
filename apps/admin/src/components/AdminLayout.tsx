import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { adminLogout } from '../lib/auth';
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
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/coupons',   icon: Ticket,          label: 'Coupons' },
  { to: '/banners',   icon: Image,           label: 'Banners' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  const sidebarW = collapsed ? 'w-[68px]' : 'w-[250px]';

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#111111] transition-all duration-300
          ${sidebarW}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand */}
        <div className={`flex items-center h-[60px] border-b border-white/8 px-4 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <Store size={20} className="text-brand-red" />
              <span className="text-[13px] font-extrabold uppercase tracking-[0.15em] text-white">
                Bingooo
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 ml-0.5">
                Admin
              </span>
            </div>
          )}
          {collapsed && <Store size={20} className="text-brand-red" />}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex lg:hidden items-center justify-center w-7 h-7 rounded text-white/40 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-150 no-underline
                ${collapsed ? 'justify-center px-2' : ''}
                ${isActive
                  ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className={`border-t border-white/8 p-3 shrink-0 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && user && (
            <div className="mb-2.5 px-1">
              <p className="text-[12px] font-bold text-white truncate">
                {user.fullName || user.email}
              </p>
              <p className="text-[10px] text-white/35 truncate">{user.email}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-red/80 mt-0.5">
                {user.role?.replace('_', ' ')}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-[11px] font-semibold text-white/40 hover:text-brand-red hover:bg-white/5 transition-colors ${collapsed ? 'justify-center px-2' : ''}`}
            title="Sign out"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-[56px] bg-white/80 backdrop-blur-lg border-b border-border px-4 lg:px-6 gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-ink hover:bg-beige transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-brand-red transition-colors no-underline"
          >
            View Store →
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
