import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Search,
  ChevronRight,
  Eye,
  LoaderCircle,
  Truck,
  CreditCard,
  User,
  MapPin,
  Clock,
  Package,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface OrderItem {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  address_snapshot_json?: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items?: Array<{
    id: string;
    title?: string;
    sku?: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
}

export function OrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const { data: orders = [], isLoading, isError } = useQuery<OrderItem[]>({
    queryKey: ['admin', 'orders'],
    queryFn: () => api.get<OrderItem[]>('/orders/admin/all'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({ title: 'Order fulfillment status updated', variant: 'success' });
      if (selectedOrder) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: prev.status } : null));
      }
    },
    onError: (err: Error) => {
      toast({ title: 'Update failed', description: err.message, variant: 'danger' });
    },
  });

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        (o.address_snapshot_json?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.address_snapshot_json?.phone || '').includes(search);

      const matchesStatus =
        statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const statusTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending_payment', label: 'Pending Payment' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="relative min-w-0 flex-1 sm:min-w-[260px]">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, customer name, or phone..."
            className="input-admin pl-10 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-admin w-auto min-w-[160px] text-xs font-bold"
        >
          <option value="all">All Fulfillment Stages</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden card-admin">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-xs">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Stage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted">
                    <LoaderCircle size={24} className="mx-auto animate-spin text-brand-red mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-danger">
                    Failed to load order records.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FDF9F4] transition-colors">
                    <td className="p-4">
                      <a
                        href={`/orders/${order.id}`}
                        className="font-mono font-extrabold text-ink hover:text-brand-red transition-colors block"
                      >
                        #{order.order_number}
                      </a>
                      <p className="text-[11px] text-muted">{formatDate(order.created_at)}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-ink">
                        {order.address_snapshot_json?.name || 'Customer'}
                      </p>
                      <p className="text-[11px] text-muted">
                        {order.address_snapshot_json?.city || 'India'}
                      </p>
                    </td>

                    <td className="p-4 font-semibold text-muted">
                      {order.items?.length || 1} item(s)
                    </td>

                    <td className="p-4 font-extrabold text-ink">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={order.payment_status || 'pending'} />
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        disabled={updateStatusMutation.isPending}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          })
                        }
                        className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-ink focus:border-brand-red focus:outline-none"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-ink shadow-xs transition-colors hover:border-brand-red hover:text-brand-red"
                          title="Quick preview modal"
                        >
                          <Eye size={13} /> Preview
                        </button>
                        <a
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red hover:bg-brand-red hover:text-white transition-colors"
                        >
                          Details →
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.order_number}`}
          description={`Placed on ${formatDate(selectedOrder.created_at)}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Summary Highlights */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-[#FDF9F4] p-4 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">Total Amount</p>
                <p className="text-base font-extrabold text-ink">{formatCurrency(selectedOrder.total)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">Payment</p>
                <StatusBadge status={selectedOrder.payment_status || 'paid'} className="mt-1" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">Fulfillment</p>
                <StatusBadge status={selectedOrder.status} className="mt-1" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">Method</p>
                <p className="mt-1 font-bold capitalize text-ink">{selectedOrder.payment_method || 'Online'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 font-bold text-ink mb-2">
                <MapPin size={16} className="text-brand-red" />
                <span>Delivery Address</span>
              </div>
              <p className="font-bold text-ink">{selectedOrder.address_snapshot_json?.name || 'Customer'}</p>
              <p className="text-muted mt-0.5">{selectedOrder.address_snapshot_json?.street || 'Address'}</p>
              <p className="text-muted">
                {selectedOrder.address_snapshot_json?.city},{' '}
                {selectedOrder.address_snapshot_json?.state} -{' '}
                {selectedOrder.address_snapshot_json?.pincode}
              </p>
              {selectedOrder.address_snapshot_json?.phone && (
                <p className="text-muted mt-1">Phone: {selectedOrder.address_snapshot_json.phone}</p>
              )}
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-muted text-[11px]">
                Ordered Garments ({selectedOrder.items?.length || 1})
              </p>
              <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEDB] text-brand-red font-bold">
                        <Package size={18} />
                      </span>
                      <div>
                        <p className="font-bold text-ink">{item.title || 'Bingooo Garment'}</p>
                        <p className="text-muted text-[11px]">
                          SKU: {item.sku || 'N/A'} • Size: {item.size || 'M'} • Color: {item.color || 'Standard'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink">{formatCurrency(item.price)}</p>
                      <p className="text-muted text-[11px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Status Selector */}
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <label className="text-xs font-bold text-muted flex items-center gap-2">
                <Truck size={16} className="text-brand-red" />
                Change fulfillment stage:
              </label>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  updateStatusMutation.mutate({
                    id: selectedOrder.id,
                    status: e.target.value,
                  })
                }
                className="input-admin w-auto"
              >
                <option value="pending_payment">Pending Payment</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
