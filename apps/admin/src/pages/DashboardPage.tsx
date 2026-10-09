import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Palette,
  ChevronRight,
  RefreshCw,
  Radio,
  ExternalLink,
  Sparkles,
  Tag,
  Sliders,
  CheckCircle2,
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

const INITIAL_DATA: DashboardData = {
  totalRevenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalProducts: 0,
  totalCustomizations: 0,
  pendingCustomizations: 0,
  lowStockVariants: [],
  recentOrders: [],
};

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
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchTelemetry = () => {
    setLoading(true);
    api
      .get<DashboardData>('/admin/dashboard')
      .then((res) => {
        if (res && typeof res.totalRevenue === 'number') {
          setData(res);
          setIsOfflineMode(false);
        }
      })
      .catch(() => {
        setIsOfflineMode(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const statCards = [
    {
      label: 'Gross Revenue',
      value: formatCurrency(data.totalRevenue),
      subtext: `${data.totalOrders} total orders processed`,
      icon: DollarSign,
      badge: 'LIVE SALES',
      highlight: true,
    },
    {
      label: 'Total Orders',
      value: data.totalOrders,
      subtext: `${data.pendingOrders} awaiting fulfillment`,
      icon: ShoppingBag,
      badge: data.pendingOrders > 0 ? `${data.pendingOrders} PENDING` : 'ALL CLEAR',
      highlight: false,
    },
    {
      label: 'Catalog Products',
      value: data.totalProducts,
      subtext: 'Active live storefront styles',
      icon: Package,
      badge: 'CATALOGUE',
      highlight: false,
    },
    {
      label: 'Customizer Jobs',
      value: data.totalCustomizations,
      subtext: `${data.pendingCustomizations} in production queue`,
      icon: Palette,
      badge: 'ATELIER',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Offline API Sync Notice */}
      {isOfflineMode && (
        <div className="bg-[#FEF08A] border-1.5 border-[#171717] p-3.5 rounded-lg shadow-[2px_2px_0px_#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#171717] text-[#FEF08A] rounded flex items-center justify-center font-mono font-black text-xs shrink-0">
              !
            </div>
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-wider text-[#171717]">
                Live Store Telemetry Syncing
              </p>
              <p className="font-sans text-xs text-[#171717]/80">
                Connecting to backend API at port 3000 to stream live purchases from bingooo.co.in.
              </p>
            </div>
          </div>
          <button
            onClick={fetchTelemetry}
            className="btn-outline text-[11px] py-1.5 px-3 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Stream
          </button>
        </div>
      )}

      {/* Executive Header Banner */}
      <div className="border-1.5 border-[#171717] bg-[#171717] text-white p-6 sm:p-7 rounded-xl shadow-[3px_3px_0px_#171717]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#E6321C] text-white px-2.5 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-widest">
                CENTRAL CONTROL
              </span>
              <span className="text-[10px] font-mono text-[#EDE0CC]/70 tracking-widest uppercase">
                BINGOOO ATELIER &bull; LIVE DISPATCH
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight font-sans text-white">
                Operations &amp; Sales Dispatch
              </h1>
              <p className="text-xs sm:text-sm text-[#EDE0CC]/80 font-medium max-w-2xl">
                Real-time monitor for customizer orders, standard catalogue apparel, inventory reserves, and storefront promotions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="btn-outline bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#171717] text-xs py-2 px-3"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync
            </button>
            <Link
              to="/orders"
              className="btn-primary text-xs py-2 px-4 shadow-[2px_2px_0px_#FFFFFF]"
            >
              Orders <ArrowUpRight size={14} />
            </Link>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-2 px-4"
            >
              <Radio size={14} className="text-[#E6321C]" /> Live Store <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Bento Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="border-1.5 border-[#171717] p-5 rounded-xl bg-white shadow-[2.5px_2.5px_0px_#171717] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#171717]"
          >
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#6F6A63]">
                    {s.label}
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight font-sans">
                    {s.value}
                  </p>
                </div>
                <div className="w-10 h-10 border-1.5 border-[#171717] bg-[#F7EEDB] rounded-lg flex items-center justify-center text-[#171717] shadow-[1.5px_1.5px_0px_#171717] shrink-0">
                  <s.icon size={18} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#171717]/10 text-[11px]">
                <span className="text-[#6F6A63] font-medium truncate font-sans">{s.subtext}</span>
                <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-[#171717] bg-[#EDE0CC] text-[#171717]">
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
        <div className="xl:col-span-2 border-1.5 border-[#171717] bg-white rounded-xl shadow-[3px_3px_0px_#171717] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#171717]/15 bg-[#EDE0CC]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 border border-[#171717] bg-[#171717] text-white rounded flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <ShoppingBag size={14} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#171717] font-mono">
                  Live Orders Stream
                </h2>
                <p className="text-[10px] text-[#6F6A63]">Customer purchases across web and mobile storefront</p>
              </div>
            </div>

            <Link
              to="/orders"
              className="font-mono text-[11px] font-black text-[#E6321C] hover:underline flex items-center gap-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              All Orders <ChevronRight size={13} />
            </Link>
          </div>

          <div className="flex-1">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F7EEDB] border-1.5 border-[#171717] flex items-center justify-center text-[#E6321C] shadow-[2px_2px_0px_#171717]">
                  <ShoppingBag size={24} />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-base font-black uppercase tracking-wider text-[#171717] font-sans">
                    Awaiting Customer Orders
                  </h3>
                  <p className="text-xs text-[#6F6A63] leading-relaxed">
                    Test and dummy data have been completely purged. When customers purchase products or submit custom designs on <span className="font-bold text-[#171717]">bingooo.co.in</span>, their genuine orders will stream directly into this table.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                  <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 px-4 shadow-[2px_2px_0px_#171717]"
                  >
                    Open Live Storefront <ExternalLink size={12} />
                  </a>
                  <Link
                    to="/customizer"
                    className="btn-outline text-xs py-2 px-4"
                  >
                    <Palette size={13} /> Custom Studio
                  </Link>
                  <Link
                    to="/coupons"
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    <Tag size={13} /> Manage Coupons
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="w-[180px]">Order Ref</th>
                      <th className="w-[120px]">Total</th>
                      <th className="w-[130px]">Status</th>
                      <th className="w-[130px]">Placed On</th>
                      <th className="w-[80px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FDFBF7]">
                        <td>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full shrink-0 bg-[#E6321C] border border-[#171717]" />
                            <span className="font-mono text-xs font-black text-[#171717]">
                              {o.orderNumber}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-black text-[#171717] font-mono text-xs">
                            {formatCurrency(o.total)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[o.status] || 'badge-neutral'}`}>
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="text-[#6F6A63] text-[11px] font-mono">
                            {formatDate(o.createdAt)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/orders?view=${o.id}`}
                            className="btn-outline text-[10px] uppercase tracking-wider font-mono py-1 px-2.5 rounded"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations & Inventory Alerts */}
        <div className="space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="border-1.5 border-[#171717] bg-white rounded-xl shadow-[3px_3px_0px_#171717] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#171717]/15 bg-[#EDE0CC]">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#171717] font-mono">
                Storefront Core Control
              </h2>
            </div>
            <div className="p-3 divide-y divide-[#171717]/10">
              <Link
                to="/customizer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7EEDB] transition-colors group no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#171717] text-white flex items-center justify-center shrink-0">
                    <Palette size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171717] group-hover:text-[#E6321C] transition-colors">
                      Custom Studio Matrix
                    </p>
                    <p className="text-[11px] text-[#6F6A63]">Garments, colours, sizes, prices &amp; mockups</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#6F6A63] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/coupons"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7EEDB] transition-colors group no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#E6321C] text-white flex items-center justify-center shrink-0">
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171717] group-hover:text-[#E6321C] transition-colors">
                      Coupons &amp; Discounts
                    </p>
                    <p className="text-[11px] text-[#6F6A63]">Promo codes (BINGOOO10, WELCOME20)</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#6F6A63] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/products"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7EEDB] transition-colors group no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#171717] text-white flex items-center justify-center shrink-0">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171717] group-hover:text-[#E6321C] transition-colors">
                      Product Catalogue
                    </p>
                    <p className="text-[11px] text-[#6F6A63]">Manage apparel drops, pricing &amp; variants</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#6F6A63] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Warehouse Low Stock Alerts */}
          <div className="border-1.5 border-[#171717] bg-white rounded-xl shadow-[3px_3px_0px_#171717] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#171717]/15 bg-[#EDE0CC]">
              <div className="flex items-center gap-2">
                <Boxes size={14} className="text-[#171717]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#171717] font-mono">
                  Inventory Health
                </h2>
              </div>
              <Link
                to="/inventory"
                className="font-mono text-[10px] font-black text-[#E6321C] hover:underline uppercase"
              >
                Adjust &rarr;
              </Link>
            </div>

            <div className="p-4">
              {data.lowStockVariants.length === 0 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950 font-sans">
                      All Inventory Stocked
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      No garments currently below the low stock safety threshold.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {data.lowStockVariants.map((v) => (
                    <div
                      key={v.id}
                      className="p-2.5 rounded-lg border border-[#171717]/20 bg-[#F7EEDB] flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-[#171717] truncate">
                          {v.productTitle}
                        </p>
                        <p className="text-[10px] text-[#6F6A63] font-mono">
                          {v.size} &bull; {v.color}
                        </p>
                      </div>
                      <span className="badge badge-warning text-[10px] shrink-0">
                        {v.availableStock} LEFT
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
