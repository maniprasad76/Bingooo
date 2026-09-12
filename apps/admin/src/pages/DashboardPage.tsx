import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  TrendingUp,
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
  return '₹' + v.toLocaleString('en-IN');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted">Failed to load dashboard data.</p>;
  }

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, accent: 'text-success' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, accent: 'text-info' },
    { label: 'Pending Orders', value: data.pendingOrders, icon: Clock, accent: 'text-warning' },
    { label: 'Total Products', value: data.totalProducts, icon: Package, accent: 'text-ink' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink">Dashboard</h1>
        <p className="text-xs text-muted mt-0.5">Store overview and recent activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">{s.label}</span>
              <s.icon size={18} className={s.accent} />
            </div>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 admin-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <TrendingUp size={16} />
              Recent Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted py-8">No orders yet</td></tr>
                ) : (
                  data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs font-semibold">{o.orderNumber}</td>
                      <td className="font-bold">{formatCurrency(o.total)}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status] || 'badge-neutral'}`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-muted text-xs">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-card">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <AlertTriangle size={16} className="text-warning" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Low Stock</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
            {data.lowStockVariants.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">All stock levels healthy</p>
            ) : (
              data.lowStockVariants.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-ink">{v.productTitle}</p>
                    <p className="text-[10px] text-muted">
                      {v.size} · {v.color} · <span className="font-mono">{v.sku}</span>
                    </p>
                  </div>
                  <span className={`badge ${v.availableStock <= 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {v.availableStock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
