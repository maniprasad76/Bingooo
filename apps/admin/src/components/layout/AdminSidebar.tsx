import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  PlusCircle,
  Box,
  ClipboardList,
  Sparkles,
  FileText,
  RotateCcw,
  Layers,
  TicketPercent,
  Tag,
  Image,
  CreditCard,
  FolderUp,
  Users,
  UserCheck,
  ShieldCheck,
  Star,
  Bell,
  BarChart3,
  History,
  Settings,
  User,
  LogOut,
  ExternalLink,
  Crown,
  X,
} from 'lucide-react';
import { signOut } from '../../lib/auth/supabase';
import { useAuthStore } from '../../store/auth';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'Catalog & Stock',
    items: [
      { name: 'Products', href: '/products', icon: Shirt },
      { name: 'New Garment', href: '/products/new', icon: PlusCircle },
      { name: 'Categories', href: '/categories', icon: Layers },
      { name: 'Inventory', href: '/inventory', icon: Box },
    ],
  },
  {
    group: 'Orders & Studio',
    items: [
      { name: 'Orders', href: '/orders', icon: ClipboardList },
      { name: 'Custom Prints', href: '/custom-orders', icon: Sparkles },
      { name: 'Custom Requests', href: '/custom-requirements', icon: FileText },
      { name: 'Returns & Refunds', href: '/returns', icon: RotateCcw },
    ],
  },
  {
    group: 'Marketing & Sales',
    items: [
      { name: 'Coupons', href: '/coupons', icon: TicketPercent },
      { name: 'Discounts', href: '/discounts', icon: Tag },
      { name: 'Banners', href: '/banners', icon: Image },
    ],
  },
  {
    group: 'Finance & Media',
    items: [
      { name: 'Payments Ledger', href: '/payments', icon: CreditCard },
      { name: 'Uploads & Assets', href: '/uploads', icon: FolderUp },
    ],
  },
  {
    group: 'Customers & Team',
    items: [
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Staff Users', href: '/users', icon: UserCheck },
      { name: 'Roles & RBAC', href: '/roles', icon: ShieldCheck },
    ],
  },
  {
    group: 'Operations & System',
    items: [
      { name: 'Reviews Moderation', href: '/reviews', icon: Star },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Audit Logs', href: '/audit-logs', icon: History },
      { name: 'Store Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#2B2825] bg-[#171717] p-4 text-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 px-1">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-sans text-2xl font-black tracking-tight text-white">
              BINGOOO<span className="text-brand-red">.</span>
            </span>
            <span className="rounded-md bg-brand-red/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-red">
              ADMIN
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close admin menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Store Context Badge */}
        <Link
          to="/profile"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10 block mb-2"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
              <Crown size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">
                {user?.name || user?.email || 'Operations Admin'}
              </p>
              <p className="text-[11px] font-medium text-white/50">
                {user?.role || 'Super Admin'} • Profile →
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? location.pathname === '/'
                      : location.pathname === item.href ||
                        (item.href !== '/' &&
                          item.href !== '/products/new' &&
                          location.pathname.startsWith(item.href) &&
                          !location.pathname.includes('/new'));

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-red text-white shadow-sm'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="mt-2 border-t border-white/10 pt-3 space-y-1">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <User size={15} /> My Profile & Security
          </Link>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={15} /> Storefront
            </span>
            <span className="text-[10px] uppercase font-mono text-white/40">:5173</span>
          </a>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
