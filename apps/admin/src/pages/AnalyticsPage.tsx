import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Users,
  CreditCard,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { StatCard } from '../components/ui/StatCard';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const topProducts = [
    { name: 'Heavyweight Boxy Tee (240 GSM)', salesCount: 142, revenue: 170258, share: 38 },
    { name: 'Oversized Minimal Hoodie (Bone White)', salesCount: 94, revenue: 178506, share: 29 },
    { name: 'Signature Relaxed Sweatshirt', salesCount: 71, revenue: 106429, share: 19 },
    { name: 'Custom Studio Bespoke Prints', salesCount: 48, revenue: 67200, share: 14 },
  ];

  const categoryBreakdown = [
    { category: 'Oversized T-Shirts', revenue: 215000, percentage: 42, color: 'bg-brand-red' },
    { category: 'Hoodies & Sweatshirts', revenue: 184935, percentage: 36, color: 'bg-[#171717]' },
    { category: 'Custom Print Studio', revenue: 67200, percentage: 14, color: 'bg-[#B91F12]' },
    { category: 'Accessories & Headwear', revenue: 41000, percentage: 8, color: 'bg-[#DDD3C5]' },
  ];

  const salesVelocityBars = [
    { day: 'Mon', amount: 28400, height: '55%' },
    { day: 'Tue', amount: 34100, height: '65%' },
    { day: 'Wed', amount: 42500, height: '80%' },
    { day: 'Thu', amount: 39800, height: '75%' },
    { day: 'Fri', amount: 54900, height: '100%' },
    { day: 'Sat', amount: 48200, height: '90%' },
    { day: 'Sun', amount: 36900, height: '70%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <BarChart3 size={14} /> Telemetry & Intelligence
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Store Performance & Sales Analytics
          </h2>
          <p className="text-xs text-muted">
            Track revenue velocity, Average Order Value (AOV), Custom Design conversion funnels, and garment demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                timeRange === range
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Gross Sales"
          value={formatCurrency(508135)}
          detail="+18.4% compared to previous period"
          icon={TrendingUp}
          trend={{ value: '+18.4%', isPositive: true }}
        />
        <StatCard
          label="Average Order Value (AOV)"
          value={formatCurrency(1435)}
          detail="Target: ₹1,200 threshold"
          icon={ShoppingBag}
          trend={{ value: '+6.2%', isPositive: true }}
        />
        <StatCard
          label="Custom Studio Conversions"
          value="18.2%"
          detail="Visitors who order custom apparel"
          icon={Sparkles}
          trend={{ value: '+3.1%', isPositive: true }}
        />
        <StatCard
          label="Customer Repeat Rate"
          value="34.8%"
          detail="Shoppers ordering 2+ garments"
          icon={Users}
          trend={{ value: '+4.5%', isPositive: true }}
        />
      </div>

      {/* Revenue Velocity Chart & Studio Funnel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Velocity (2 cols) */}
        <div className="lg:col-span-2 card-admin p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-ink text-base">Weekly Revenue Velocity</h3>
              <p className="text-xs text-muted">Daily gross merchandise value across all channels</p>
            </div>
            <span className="text-xs font-bold text-brand-red font-mono">Peak: ₹54,900 (Fri)</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="flex h-56 items-end justify-between gap-3 pt-6 px-2">
            {salesVelocityBars.map((bar) => (
              <div key={bar.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-ink">{formatCurrency(bar.amount)}</span>
                <div
                  style={{ height: bar.height }}
                  className="w-full max-w-[48px] rounded-t-xl bg-brand-red/90 transition-all hover:bg-brand-red"
                />
                <span className="text-xs font-bold text-muted">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Studio Conversion Funnel (1 col) */}
        <div className="card-admin p-6 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-bold text-ink text-base">Custom Design Studio Funnel</h3>
            <p className="text-xs text-muted">Conversion progression from design to checkout</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-ink">
                <span>1. Studio Views</span>
                <span>2,410 sessions</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#EDE0CC]">
                <div className="h-full rounded-full bg-[#171717] w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-ink">
                <span>2. Artwork Uploaded</span>
                <span>890 designs (36.9%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#EDE0CC]">
                <div className="h-full rounded-full bg-brand-red/70 w-[37%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-ink">
                <span>3. Added to Cart</span>
                <span>340 items (14.1%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#EDE0CC]">
                <div className="h-full rounded-full bg-brand-red w-[14%]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-ink">
                <span>4. Paid & Captured</span>
                <span>218 orders (9.0%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#EDE0CC]">
                <div className="h-full rounded-full bg-success w-[9%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Garments & Category Revenue Share */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Garments */}
        <div className="card-admin p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-ink text-base">Top Performing Garments</h3>
            <p className="text-xs text-muted">Best-selling pieces by sales volume and gross revenue</p>
          </div>

          <div className="divide-y divide-border">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F7EEDB] text-xs font-black text-ink">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-ink text-xs">{p.name}</h4>
                    <p className="text-[11px] text-muted">{p.salesCount} units ordered</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink text-xs">{formatCurrency(p.revenue)}</p>
                  <p className="text-[10px] text-muted">{p.share}% share</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="card-admin p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-ink text-base">Category Revenue Distribution</h3>
            <p className="text-xs text-muted">Share of sales across core menswear categories</p>
          </div>

          <div className="space-y-4 pt-2">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-ink">{cat.category}</span>
                  <span className="font-mono text-muted">{formatCurrency(cat.revenue)} ({cat.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EDE0CC]">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
