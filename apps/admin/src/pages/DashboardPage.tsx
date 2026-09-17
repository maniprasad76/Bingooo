import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Boxes,
  Palette,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomizations: number;
  pendingCustomizations: number;
  lowStockVariants: Array<{
    id: string;
    sku: string;
    productTitle: string;
    size: string;
    color: string;
    availableStock: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
    itemCount: number;
    createdAt: string;
  }>;
}

const STATUS_BADGE: Record<string, string> = {
  delivered: 'badge-success',
  shipped: 'badge-info',
  processing: 'badge-warning',
  pending_payment: 'badge-neutral',
  cancelled: 'badge-danger',
};

function formatCurrency(v: number) {
  return '₹' + (v || 0).toLocaleString('en-IN');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted">
          Loading Atelier Telemetry…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-card p-12 text-center">
        <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
        <h3 className="text-base font-bold text-ink">Failed to Synchronize Telemetry</h3>
        <p className="text-xs text-muted mt-1">
          Could not establish connection to the admin dashboard service.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline mt-4"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Gross Revenue',
      value: formatCurrency(data.totalRevenue),
      subtext: 'Lifetime fulfilled & processing',
      icon: DollarSign,
      gradient: 'from-brand-red/10 via-brand-red/5 to-transparent',
      iconBg: 'bg-brand-red/10 text-brand-red border-brand-red/20',
      badge: 'LIVE',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders,
      subtext: `${data.pendingOrders} pending fulfillment`,
      icon: ShoppingBag,
      gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      badge: `${data.pendingOrders} QUEUED`,
    },
    {
      label: 'Catalog Products',
      value: data.totalProducts,
      subtext: `${data.totalCustomizations || 0} 3D bespoke models`,
      icon: Package,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'ACTIVE',
    },
    {
      label: 'Customizer Jobs',
      value: data.totalCustomizations,
      subtext: `${data.pendingCustomizations || 0} awaiting production`,
      icon: Palette,
      gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: '3D ATELIER',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141414] p-6 sm:p-8 text-white shadow-elevated border border-white/10">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-brand-red/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-brand-red text-white">
                EXECUTIVE OVERVIEW
              </span>
              <span className="text-[10px] font-mono text-white/50 tracking-wider">
                BINGOOO ATELIER CORE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-sans">
              Store Command Center
            </h1>
            <p className="text-xs text-white/60 max-w-xl">
              Real-time telemetry across heavyweight catalog, incoming bespoke garment orders, and warehouse inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products/new"
              className="btn-primary"
            >
              <Package size={14} /> New Product
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all"
            >
              View Orders <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="stat-card group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50 pointer-events-none transition-opacity group-hover:opacity-100`} />
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="stat-label">{s.label}</span>
                  <p className="stat-value">{s.value}</p>
                </div>
                <div className={`flex items-center justify-center w-11 h-11 rounded-2xl border ${s.iconBg} shadow-2xs`}>
                  <s.icon size={20} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                <span className="text-muted font-medium truncate">{s.subtext}</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-beige/60 text-ink">
                  {s.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Stream */}
        <div className="xl:col-span-2 admin-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-[#FAF7F2]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-ink text-white">
                <ShoppingBag size={14} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-ink font-sans">
                  Recent Orders Stream
                </h2>
                <p className="text-[10px] text-muted">Latest purchases across web & mobile storefront</p>
              </div>
            </div>

            <Link
              to="/orders"
              className="text-[11px] font-mono font-bold text-brand-red hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              All Orders <ChevronRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((o) => (
                    <tr key={o.id} className="group">
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-red/60" />
                          <span className="font-mono text-xs font-bold text-ink group-hover:text-brand-red transition-colors">
                            {o.orderNumber}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-bold text-ink font-mono text-xs">
                          {formatCurrency(o.total)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status] || 'badge-neutral'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted text-[11px] font-mono">
                          {formatDate(o.createdAt)}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/orders?view=${o.id}`}
                          className="btn-ghost text-[10px] uppercase tracking-wider font-mono py-1 px-2.5"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouse Low Stock Alerts */}
        <div className="admin-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-[#FAF7F2]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-white">
                <AlertTriangle size={14} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-ink font-sans">
                  Stock Depletion
                </h2>
                <p className="text-[10px] text-muted">Garments requiring replenishment</p>
              </div>
            </div>

            <Link
              to="/inventory"
              className="text-[11px] font-mono font-bold text-brand-red hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              Inventory <ChevronRight size={13} />
            </Link>
          </div>

          <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[380px]">
            {data.lowStockVariants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Boxes size={20} />
                </div>
                <p className="text-xs font-bold text-ink">Healthy Inventory Levels</p>
                <p className="text-[10px] text-muted mt-0.5">All product variants are sufficiently stocked.</p>
              </div>
            ) : (
              data.lowStockVariants.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-ink truncate leading-snug">
                      {v.productTitle}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-border/60">
                        {v.size}
                      </span>
                      <span>•</span>
                      <span>{v.color}</span>
                      <span>•</span>
                      <span className="font-mono text-muted/70">{v.sku}</span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 badge ${
                      v.availableStock <= 0 ? 'badge-danger' : 'badge-warning'
                    }`}
                  >
                    {v.availableStock <= 0 ? 'OUT OF STOCK' : `${v.availableStock} LEFT`}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-border/60 bg-[#FAF7F2]/40 text-center">
            <Link
              to="/inventory"
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors"
            >
              Open Bulk Stock Adjuster →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
