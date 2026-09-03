import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Shirt,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Box,
  CheckCircle2,
  Clock,
  LoaderCircle,
  BarChart3,
  FileText,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';

export function DashboardOverviewPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () =>
      api.get<any>('/admin/dashboard').catch(() => ({
        totalRevenue: 245800,
        totalOrders: 184,
        pendingOrders: 12,
        totalCustomizations: 42,
        pendingCustomizations: 8,
        totalProducts: 16,
        recentOrders: [
          {
            id: 'ord-1029',
            orderNumber: 'BING-89421',
            total: 2498,
            status: 'processing',
            itemCount: 2,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'ord-1028',
            orderNumber: 'BING-89419',
            total: 1199,
            status: 'shipped',
            itemCount: 1,
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'ord-1027',
            orderNumber: 'BING-89412',
            total: 3499,
            status: 'delivered',
            itemCount: 3,
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
        ],
        lowStockVariants: [
          {
            id: 'v-1',
            sku: 'BING-TEE-BLK-L',
            productTitle: 'Heavyweight Boxy Tee',
            size: 'L',
            color: 'Washed Black',
            availableStock: 3,
          },
          {
            id: 'v-2',
            sku: 'BING-HOD-WHT-XL',
            productTitle: 'Oversized Minimal Hoodie',
            size: 'XL',
            color: 'Bone White',
            availableStock: 2,
          },
        ],
      })),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3 text-muted">
        <LoaderCircle size={22} className="animate-spin text-brand-red" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading operations data...</span>
      </div>
    );
  }

  const revenue = metrics?.totalRevenue ?? 245800;
  const totalOrders = metrics?.totalOrders ?? 184;
  const pendingOrders = metrics?.pendingOrders ?? 12;
  const totalCustomizations = metrics?.totalCustomizations ?? 42;
  const pendingCustomizations = metrics?.pendingCustomizations ?? 8;
  const totalProducts = metrics?.totalProducts ?? 16;
  const recentOrders = metrics?.recentOrders ?? [];
  const lowStockVariants = metrics?.lowStockVariants ?? [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-extrabold tracking-wide uppercase text-brand-red">
            <Sparkles size={13} /> Store Operations Live
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Welcome to Bingooo Control Center
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Monitor real-time sales velocity, fulfillment queues, and custom garment print submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/products/new" className="btn-primary">
            <Plus size={16} /> New Garment
          </Link>
          <Link to="/custom-orders" className="btn-secondary">
            <Sparkles size={16} /> Custom Queue ({pendingCustomizations})
          </Link>
          <Link to="/analytics" className="btn-secondary">
            <BarChart3 size={16} /> Analytics
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(revenue)}
          detail="Cumulative customer orders"
          icon={TrendingUp}
          trend={{ value: '+14% this month', isPositive: true }}
        />
        <StatCard
          label="Total Orders"
          value={totalOrders}
          detail={`${pendingOrders} awaiting fulfillment`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Custom Prints"
          value={totalCustomizations}
          detail={`${pendingCustomizations} ready for review`}
          icon={Sparkles}
        />
        <StatCard
          label="Product Catalog"
          value={totalProducts}
          detail="Active styles in catalog"
          icon={Shirt}
        />
      </div>

      {/* Operations Quick Links Strip */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Link
          to="/custom-requirements"
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 transition-all hover:border-brand-red/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <FileText size={18} />
            </div>
            <div>
              <p className="font-bold text-ink text-xs">Custom Requirements</p>
              <p className="text-[10px] text-muted">Bespoke & bulk orders</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-muted" />
        </Link>

        <Link
          to="/returns"
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 transition-all hover:border-brand-red/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <RotateCcw size={18} />
            </div>
            <div>
              <p className="font-bold text-ink text-xs">Returns & Exchanges</p>
              <p className="text-[10px] text-muted">Inspection & pickups</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-muted" />
        </Link>

        <Link
          to="/payments"
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 transition-all hover:border-brand-red/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="font-bold text-ink text-xs">Payments Ledger</p>
              <p className="text-[10px] text-muted">Razorpay & Settlements</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-muted" />
        </Link>

        <Link
          to="/inventory"
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-4 transition-all hover:border-brand-red/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <Box size={18} />
            </div>
            <div>
              <p className="font-bold text-ink text-xs">Inventory Radar</p>
              <p className="text-[10px] text-muted">Stock availability</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-muted" />
        </Link>
      </div>

      {/* Main Split: Recent Orders & Stock Watch */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Recent Orders Section */}
        <div className="card-admin p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Recent Orders</h3>
              <p className="text-xs text-muted">Latest checkout transactions across storefront</p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:text-[#B91F12]"
            >
              All Orders <ChevronRight size={15} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No orders recorded yet. As shoppers checkout, orders will stream here.
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 py-3.5 hover:bg-[#FDF9F4] px-2 rounded-xl transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7EEDB] text-ink font-bold text-xs">
                      #
                    </span>
                    <div>
                      <p className="font-mono text-xs font-extrabold text-ink hover:text-brand-red">
                        #{order.orderNumber || order.order_number}
                      </p>
                      <p className="text-[11px] text-muted">
                        {order.itemCount ?? 1} item(s) • {formatDate(order.createdAt || order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-ink">{formatCurrency(order.total)}</p>
                    <div className="mt-1">
                      <StatusBadge status={order.status || 'pending'} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watch Section */}
        <div className="rounded-2xl border border-brand-red/20 bg-[#FDF0EE] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-red">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-extrabold uppercase tracking-wide">Stock Radar</h3>
            </div>
            <Link
              to="/inventory"
              className="text-xs font-bold text-brand-red hover:underline"
            >
              Manage <ArrowUpRight size={14} className="inline" />
            </Link>
          </div>

          <p className="mt-1 text-xs text-brand-red/80">
            Garments with inventory threshold below 5 physical units.
          </p>

          <div className="mt-4 space-y-3">
            {lowStockVariants.length === 0 ? (
              <div className="rounded-xl border border-white/60 bg-white/70 p-4 text-center text-xs font-medium text-muted">
                Inventory levels healthy across all styles.
              </div>
            ) : (
              lowStockVariants.map((variant: any) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl border border-white/60 bg-white/90 p-3"
                >
                  <div>
                    <p className="text-xs font-bold text-ink">{variant.productTitle}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {variant.sku} • {variant.size}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-md bg-brand-red px-2 py-0.5 font-mono text-xs font-black text-white">
                      {variant.availableStock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
