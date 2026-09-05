import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  Sparkles,
  CreditCard,
  Shield,
  Star,
  LoaderCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: rawCustomer, isLoading } = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => api.get<any>(`/users/${id}`),
    enabled: !!id,
  });

  const customer = rawCustomer
    ? {
        id: rawCustomer.id,
        email: rawCustomer.email,
        full_name: rawCustomer.full_name || rawCustomer.name || 'Customer',
        phone: rawCustomer.phone,
        created_at: rawCustomer.created_at,
        order_count: rawCustomer.orderCount || rawCustomer.orders?.length || 0,
        total_spent: rawCustomer.totalSpent || 0,
        status: rawCustomer.status || 'active',
        addresses: (rawCustomer.addresses || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          phone: a.phone,
          street: a.line1 + (a.line2 ? `, ${a.line2}` : ''),
          city: a.city,
          state: a.state,
          pincode: a.postal_code,
          is_default: a.is_default,
        })),
        recentOrders: (rawCustomer.orders || []).map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          created_at: o.created_at,
          total: o.total,
          status: o.status,
          item_count: o.items?.length || 1,
        })),
        customDesigns: (rawCustomer.customizations || []).map((c: any) => ({
          id: c.id,
          title: c.product_title || 'Custom Garment',
          created_at: c.created_at,
          status: c.status,
        })),
      }
    : null;

  if (isLoading || !customer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3 text-muted">
        <LoaderCircle size={22} className="animate-spin text-brand-red" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading customer file...</span>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="flex items-center gap-4">
          <Link
            to="/customers"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-sm hover:border-brand-red hover:text-brand-red"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-ink">{customer.full_name || 'Customer'}</h2>
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase">
                Active Shopper
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Member since {formatDate(customer.created_at)} • User ID: {customer.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${customer.email}`}
            className="btn-secondary text-xs"
          >
            <Mail size={14} /> Send Email
          </a>
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="btn-primary text-xs"
            >
              <Phone size={14} /> Call Customer
            </a>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Lifetime Value</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatCurrency(customer.total_spent || 0)}</p>
          <p className="text-[11px] text-muted">Across {customer.order_count || 0} completed orders</p>
        </div>
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Orders Placed</p>
          <p className="mt-2 text-2xl font-black text-ink">{customer.order_count || 0}</p>
          <p className="text-[11px] text-muted">Average spend: {formatCurrency(Math.round((customer.total_spent || 0) / (customer.order_count || 1)))}</p>
        </div>
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Studio Custom Projects</p>
          <p className="mt-2 text-2xl font-black text-ink">{customer.customDesigns?.length || 0}</p>
          <p className="text-[11px] text-muted">Bespoke garment designs submitted</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-admin p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand-red" />
                <h3 className="font-bold text-ink">Order History</h3>
              </div>
              <span className="text-xs font-bold text-muted">{customer.recentOrders?.length || 0} Records</span>
            </div>

            <div className="divide-y divide-border">
              {(customer.recentOrders || []).map((ord: any) => (
                <div key={ord.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-sm">#{ord.order_number}</span>
                      <StatusBadge status={ord.status} />
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {formatDate(ord.created_at)} • {ord.item_count} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-ink text-sm">{formatCurrency(ord.total)}</span>
                    <Link
                      to={`/orders/${ord.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:border-brand-red text-ink hover:text-brand-red transition-colors"
                      title="View Order Details"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Studio Submissions */}
          <div className="card-admin p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sparkles size={18} className="text-brand-red" />
              <h3 className="font-bold text-ink">Bingooo Studio Submissions</h3>
            </div>

            <div className="divide-y divide-border">
              {(customer.customDesigns || []).map((des: any) => (
                <div key={des.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-bold text-ink text-xs">{des.title}</p>
                    <p className="text-[11px] text-muted">{formatDate(des.created_at)}</p>
                  </div>
                  <StatusBadge status={des.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Addresses & Profile (1 col) */}
        <div className="space-y-6">
          {/* Profile Overview */}
          <div className="card-admin p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <User size={18} className="text-brand-red" />
              <h3 className="font-bold text-ink">Contact Dossier</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted block text-[11px]">Full Name</span>
                <span className="font-bold text-ink">{customer.full_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Email Address</span>
                <span className="font-bold text-ink">{customer.email}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Phone Number</span>
                <span className="font-bold text-ink">{customer.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Saved Delivery Addresses */}
          <div className="card-admin p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin size={18} className="text-brand-red" />
              <h3 className="font-bold text-ink">Saved Shipping Addresses</h3>
            </div>

            <div className="space-y-3">
              {(customer.addresses || []).map((addr: any) => (
                <div
                  key={addr.id}
                  className={`rounded-xl border p-3 text-xs space-y-1 ${
                    addr.is_default ? 'border-brand-red/40 bg-[#FDF0EE]/30' : 'border-border bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{addr.name}</span>
                    {addr.is_default && (
                      <span className="rounded-md bg-brand-red px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-muted">{addr.street}</p>
                  <p className="text-muted">
                    {addr.city}, {addr.state} - <strong className="text-ink">{addr.pincode}</strong>
                  </p>
                  <p className="text-[11px] text-muted">Ph: {addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
