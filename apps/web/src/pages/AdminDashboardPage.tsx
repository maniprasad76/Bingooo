import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Logo } from '../components/ui/Logo';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customizations' | 'inventory'>('overview');

  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get<any>('/admin/dashboard'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get<any[]>('/orders?admin=true'),
  });

  const { data: customizations = [] } = useQuery({
    queryKey: ['admin-customizations'],
    queryFn: () => api.get<any[]>('/customizations'),
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch<any>(`/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      toast({ title: 'Order status updated', variant: 'success' });
    },
  });

  const updateCustStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/customizations/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      toast({ title: 'Customization updated', variant: 'success' });
    },
  });

  return (
    <div className="container-page py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Logo variant="red" size="md" withLink />
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Admin Control Center</Badge>
            </div>
            <h1 className="text-display-sm font-bold text-ink mt-0.5">Store Management</h1>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center rounded-lg border border-border bg-white p-1 text-caption font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'orders' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('customizations')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'customizations' ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            }`}
          >
            Custom Prints ({customizations.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-caption text-muted font-semibold">Total Revenue</span>
                <span className="p-2 rounded-lg bg-success/10 text-success"><DollarSign size={18} /></span>
              </div>
              <h3 className="text-3xl font-extrabold text-ink mt-2">₹{metrics?.totalRevenue || 0}</h3>
              <span className="text-xs text-muted mt-1 block">Delivered & confirmed orders</span>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-caption text-muted font-semibold">Total Orders</span>
                <span className="p-2 rounded-lg bg-accent/10 text-accent"><Package size={18} /></span>
              </div>
              <h3 className="text-3xl font-extrabold text-ink mt-2">{metrics?.totalOrders || 0}</h3>
              <span className="text-xs text-muted mt-1 block">{metrics?.pendingOrders || 0} pending processing</span>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-caption text-muted font-semibold">Custom Artworks</span>
                <span className="p-2 rounded-lg bg-accent-light text-ink"><Sparkles size={18} /></span>
              </div>
              <h3 className="text-3xl font-extrabold text-ink mt-2">{metrics?.totalCustomizations || 0}</h3>
              <span className="text-xs text-muted mt-1 block">Submitted custom prints</span>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-caption text-muted font-semibold">Catalog Items</span>
                <span className="p-2 rounded-lg bg-paper text-ink"><ShoppingBag size={18} /></span>
              </div>
              <h3 className="text-3xl font-extrabold text-ink mt-2">{metrics?.totalProducts || 3}</h3>
              <span className="text-xs text-muted mt-1 block">Active garments in store</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {metrics?.lowStockVariants && metrics.lowStockVariants.length > 0 && (
            <div className="rounded-xl border border-accent/30 bg-accent-light/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-ink font-bold text-heading">
                <AlertTriangle size={20} className="text-accent" />
                <h3>Low Inventory Alerts</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.lowStockVariants.map((v: any) => (
                  <div key={v.id} className="rounded-lg bg-white p-3 border border-border flex justify-between items-center text-caption">
                    <div>
                      <strong className="text-ink block">{v.productTitle}</strong>
                      <span className="text-muted">SKU: {v.sku} ({v.size} / {v.color})</span>
                    </div>
                    <Badge variant="danger">{v.availableStock} left</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-heading font-bold text-ink">Customer Orders</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption">
              <thead className="bg-paper text-ink uppercase tracking-wider font-bold border-b border-border">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-paper/40 transition-colors">
                    <td className="p-4 font-bold text-ink">{o.order_number}</td>
                    <td className="p-4 text-muted">{o.address_snapshot_json?.name || 'Customer'}</td>
                    <td className="p-4 font-bold text-ink">₹{o.total}</td>
                    <td className="p-4">
                      <Badge variant={o.payment_status === 'captured' ? 'success' : 'default'}>
                        {o.payment_method?.toUpperCase()} • {o.payment_status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatusMutation.mutate({ orderId: o.id, status: e.target.value })}
                        className="rounded border border-border bg-white p-1 font-semibold text-ink focus:outline-none"
                      >
                        <option value="pending_payment">pending_payment</option>
                        <option value="paid">paid</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateOrderStatusMutation.mutate({ orderId: o.id, status: 'shipped' })}
                        disabled={o.status === 'shipped' || o.status === 'delivered'}
                      >
                        <Truck size={13} /> Mark Shipped
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Print Reviews */}
      {activeTab === 'customizations' && (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6 space-y-6">
          <h3 className="text-heading font-bold text-ink">Custom Print Artworks for Workshop</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customizations.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-border bg-paper p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="accent">{c.status}</Badge>
                  <span className="text-xs text-muted">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                <div className="aspect-video rounded-lg bg-white border border-border flex items-center justify-center p-3 text-center">
                  <div>
                    <Sparkles size={24} className="text-accent mx-auto mb-1" />
                    <span className="text-caption font-bold text-ink block">
                      {c.design_json?.garmentColor} Garment
                    </span>
                    <span className="text-xs text-muted">
                      Layers: {c.design_json?.layers?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => updateCustStatusMutation.mutate({ id: c.id, status: 'approved' })}
                  >
                    <CheckCircle2 size={14} /> Approve Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => updateCustStatusMutation.mutate({ id: c.id, status: 'rejected' })}
                  >
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
