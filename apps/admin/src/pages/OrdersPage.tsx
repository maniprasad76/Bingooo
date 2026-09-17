import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  Search,
  RefreshCw,
  Eye,
  Truck,
  Package,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';

interface OrderItem {
  id: string;
  title_snapshot?: string;
  title?: string;
  quantity: number;
  unit_price: number;
  total: number;
  sku?: string;
  size?: string;
  color?: string;
  customization?: any;
}

interface Order {
  id: string;
  user_id?: string;
  order_number?: string;
  orderNumber?: string;
  total?: number;
  total_amount?: number;
  subtotal?: number;
  discount?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_fee?: number;
  status: string;
  payment_status?: string;
  paymentStatus?: string;
  payment_method?: string;
  paymentMethod?: string;
  tracking_number?: string;
  carrier?: string;
  items_count?: number;
  itemCount?: number;
  items?: OrderItem[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  user?: { fullName?: string; email?: string };
  shipping_address?: any;
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

const CARRIERS = ['Blue Dart', 'Delhivery', 'DTDC', 'Shadowfax', 'Ecom Express', 'India Post'];

function formatCurrency(v?: number) {
  return '₹' + (v || 0).toLocaleString('en-IN');
}

function formatDate(d?: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  // Inspector Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipping Fulfillment Modal
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('Blue Dart');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingSaving, setShippingSaving] = useState(false);

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

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    if (newStatus === 'shipped') {
      // Prompt for carrier and tracking AWB
      setShippingOrder(order);
      setCarrier(order.carrier || 'Blue Dart');
      setTrackingNumber(order.tracking_number || `BD-${Math.floor(100000000 + Math.random() * 900000000)}`);
      return;
    }
    updateStatusDirect(order.id, newStatus);
  };

  const updateStatusDirect = async (id: string, status: string, carrierName?: string, tracking?: string) => {
    setUpdating(id);
    try {
      await api.patch(`/orders/${id}/status`, {
        status,
        carrier: carrierName,
        trackingNumber: tracking,
      });
      toast.success('Status Updated', `Order #${id.slice(0, 8)} status set to ${status.toUpperCase()}.`);
      fetchOrders();
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Failed to update order status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;
    setShippingSaving(true);
    try {
      await api.patch(`/orders/${shippingOrder.id}/status`, {
        status: 'shipped',
        carrier,
        trackingNumber: trackingNumber.trim(),
      });
      toast.success('Shipment Dispatched', `Tracking #${trackingNumber.trim()} assigned via ${carrier}.`);
      setShippingOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error('Fulfillment Failed', err?.message || 'Failed to save fulfillment details.');
    } finally {
      setShippingSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              FULFILLMENT OPS
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {orders.length} ORDERS TOTAL
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Orders & Shipments
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage customer orders, track dispatch status, assign courier AWBs, and inspect custom prints.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn-outline gap-2"
          disabled={loading}
          title="Refresh orders"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <div className="flex flex-wrap gap-1 bg-beige/40 p-1 rounded-xl border border-border/60">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                filter === s
                  ? 'bg-ink text-white shadow-2xs'
                  : 'text-muted hover:text-ink hover:bg-white/60'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search Order #, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9.5 w-full sm:w-[280px] py-1.5 text-xs"
            />
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Total Paid</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Logistics / AWB</th>
                <th>Placed Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-brand-red" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Loading Orders…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No orders matching filter</span>
                      <p className="text-xs text-muted max-w-sm">
                        Try clearing search terms or selecting a different status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const orderNum = o.order_number || o.orderNumber || o.id;
                  const payment = o.payment_status || o.paymentStatus || 'pending';
                  const dateVal = o.created_at || o.createdAt;
                  const addr = o.shipping_address || o.shippingAddress;
                  const custName = addr?.name || o.user?.fullName || 'Customer';

                  return (
                    <tr key={o.id} className="group">
                      <td>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="font-mono text-xs font-bold text-ink hover:text-brand-red flex items-center gap-1.5 text-left transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                          <span>{orderNum}</span>
                          <Eye size={12} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      <td>
                        <div>
                          <strong className="text-xs font-bold text-ink block">{custName}</strong>
                          {addr?.phone && (
                            <span className="text-[10px] text-muted font-mono">{addr.phone}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-bold text-ink">
                          {o.items?.length || o.itemCount || 1} pcs
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-black text-ink">
                          {formatCurrency(o.total)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            payment === 'captured' || payment === 'paid'
                              ? 'badge-success'
                              : 'badge-neutral'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {payment}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status] || 'badge-neutral'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td>
                        {o.tracking_number ? (
                          <div className="text-xs font-mono">
                            <span className="text-[9px] text-muted block uppercase font-bold tracking-wider">
                              {o.carrier || 'Courier'}
                            </span>
                            <span className="font-bold text-ink tracking-tight">{o.tracking_number}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted italic">Awaiting AWB</span>
                        )}
                      </td>

                      <td className="text-[11px] text-muted whitespace-nowrap font-mono">
                        {formatDate(dateVal)}
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o, e.target.value)}
                            disabled={updating === o.id}
                            className="admin-select text-xs py-1 px-2.5 w-[130px] rounded-lg"
                          >
                            {STATUSES.filter((s) => s !== 'all').map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="btn-ghost p-1.5 rounded-lg text-muted hover:text-ink hover:bg-beige"
                            title="Inspect Order Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border/80 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black uppercase tracking-tight text-ink font-mono">
                    #{selectedOrder.order_number || selectedOrder.orderNumber}
                  </h3>
                  <span
                    className={`badge ${
                      STATUS_BADGE[selectedOrder.status] || 'badge-neutral'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {selectedOrder.status}
                  </span>
                </div>
                <span className="text-xs text-muted font-mono mt-0.5 block">
                  Placed on {formatDate(selectedOrder.created_at || selectedOrder.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-outline py-2 px-3 text-xs gap-1.5"
                >
                  <Printer size={14} />
                  Print Manifest
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tracking Banner if dispatched */}
            {selectedOrder.tracking_number && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Truck size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-ink">
                      Dispatched via {selectedOrder.carrier || 'Blue Dart Air Express'}
                    </span>
                    <span className="text-[11px] text-muted block font-mono">
                      AWB Manifest: {selectedOrder.tracking_number}
                    </span>
                  </div>
                </div>
                <a
                  href={`http://localhost:5173/track-order?awb=${selectedOrder.tracking_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-bold text-sky-700 underline hover:text-sky-900"
                >
                  Live Track ↗
                </a>
              </div>
            )}

            {/* Items Ordered */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
                Manifest Items ({selectedOrder.items?.length || 1})
              </h4>
              <div className="divide-y divide-border/60 border border-border/80 rounded-2xl p-4 bg-[#FAF7F2]">
                {((selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items : [
                  {
                    id: 'it-1',
                    title_snapshot: 'Bingooo Atelier Heavyweight Garment',
                    title: 'Bingooo Atelier Heavyweight Garment',
                    quantity: 1,
                    total: selectedOrder.total,
                    size: 'Standard',
                    color: 'Black',
                    customization: null,
                  },
                ]) as OrderItem[]).map((it, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <strong className="font-bold text-ink block text-xs">
                        {it.title_snapshot || it.title || 'Heavyweight Garment'}
                      </strong>
                      <span className="text-muted text-[11px] font-mono">
                        Qty: {it.quantity} • Size: {it.size || 'M'} • Color: {it.color || 'Onyx'}
                      </span>
                      {it.customization && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded mt-1">
                          <Sparkles size={11} /> 3D Bespoke Graphic Applied
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-black text-ink text-xs">
                      {formatCurrency(it.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown & Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Shipping Destination */}
              <div className="p-4 rounded-2xl border border-border/80 bg-[#FAF7F2] space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-muted flex items-center gap-1.5">
                  <MapPin size={12} className="text-brand-red" /> Delivery Destination
                </span>
                {selectedOrder.shipping_address || selectedOrder.shippingAddress ? (
                  <div className="leading-relaxed text-ink space-y-0.5">
                    <strong className="block font-bold">
                      {(selectedOrder.shipping_address || selectedOrder.shippingAddress).name}
                    </strong>
                    <span className="font-mono text-muted text-[11px] block">
                      {(selectedOrder.shipping_address || selectedOrder.shippingAddress).phone}
                    </span>
                    <span>{(selectedOrder.shipping_address || selectedOrder.shippingAddress).line1}</span><br />
                    <span>
                      {(selectedOrder.shipping_address || selectedOrder.shippingAddress).city},{' '}
                      {(selectedOrder.shipping_address || selectedOrder.shippingAddress).state} -{' '}
                      {(selectedOrder.shipping_address || selectedOrder.shippingAddress).postalCode}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted italic">No delivery address attached.</p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl border border-border/80 bg-[#FAF7F2] space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-muted block">
                  Payment Ledger
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted">Method:</span>
                    <span className="font-mono font-bold text-ink uppercase text-[11px]">
                      {selectedOrder.payment_method || selectedOrder.paymentMethod || 'Prepaid Online'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Status:</span>
                    <span className="font-mono font-bold text-emerald-700 uppercase text-[11px]">
                      {selectedOrder.payment_status || selectedOrder.paymentStatus || 'Captured'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/80 font-bold text-sm text-ink">
                    <span>Total Amount:</span>
                    <span className="font-mono font-black">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Fulfillment Modal */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-ink flex items-center gap-2 font-sans">
                  <Truck size={18} className="text-brand-red" />
                  Dispatch Order #{shippingOrder.order_number || shippingOrder.orderNumber}
                </h3>
                <span className="text-xs text-muted">
                  Assign air courier manifest & push live tracking link.
                </span>
              </div>
              <button
                onClick={() => setShippingOrder(null)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConfirmShipping} className="space-y-4">
              <div>
                <label className="admin-label">
                  Logistics Courier Partner *
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="admin-select w-full text-xs"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-label">
                  Airway Bill (AWB) Tracking Reference *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BD-892104928"
                  className="admin-input w-full font-mono text-xs uppercase tracking-wider font-bold"
                  required
                />
                <span className="text-[10px] text-muted mt-1 block">
                  Customer will receive automated dispatch notification with live tracking.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShippingOrder(null)}
                  className="btn-outline"
                  disabled={shippingSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary gap-1.5" disabled={shippingSaving}>
                  <Truck size={14} />
                  <span>{shippingSaving ? 'Dispatching...' : 'Confirm Shipment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
