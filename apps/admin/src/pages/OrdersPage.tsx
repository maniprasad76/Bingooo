import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string;
  user?: { fullName?: string; email?: string };
  shippingAddress?: any;
}

const STATUSES = ['all', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'];
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

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    api.get<Order[]>('/orders/admin/all', params)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch {}
    setUpdating(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink">Orders</h1>
          <p className="text-xs text-muted mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary gap-1.5" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
                ${filter === s
                  ? 'bg-ink text-white'
                  : 'bg-white text-muted border border-border hover:border-ink hover:text-ink'
                }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-[220px]"
            />
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted">No orders found</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs font-bold">{o.orderNumber}</td>
                  <td>{o.itemCount}</td>
                  <td className="font-bold">{formatCurrency(o.total)}</td>
                  <td>
                    <span className={`badge ${o.paymentStatus === 'captured' || o.paymentStatus === 'paid' ? 'badge-success' : 'badge-neutral'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[o.status] || 'badge-neutral'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-xs text-muted whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={updating === o.id}
                      className="admin-select text-xs py-1.5 w-[140px]"
                    >
                      {STATUSES.filter((s) => s !== 'all').map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
