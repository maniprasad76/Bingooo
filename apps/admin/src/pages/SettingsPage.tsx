import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Store,
  CreditCard,
  Truck,
  Database,
  Bell,
  Search,
  Check,
  ShieldCheck,
  Globe,
  Sliders,
  Sparkles,
  LoaderCircle,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'store' | 'commerce' | 'shipping' | 'cod' | 'payments' | 'notifications' | 'storage' | 'seo'
  >('store');

  // Store Settings
  const [storeName, setStoreName] = useState("Bingooo Men's Wear");
  const [tagline, setTagline] = useState('Wear what feels like you.');
  const [supportEmail, setSupportEmail] = useState('support@bingooo.in');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [storeAddress, setStoreAddress] = useState('12th Main, Indiranagar, Bengaluru, Karnataka 560038');

  // Commerce
  const [currency, setCurrency] = useState('INR (₹)');
  const [gstRate, setGstRate] = useState('5');
  const [minOrderValue, setMinOrderValue] = useState('499');

  // Shipping
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [standardShippingFee, setStandardShippingFee] = useState('99');
  const [expressShippingFee, setExpressShippingFee] = useState('199');
  const [deliveryDays, setDeliveryDays] = useState('3-7 business days');

  // COD
  const [codEnabled, setCodEnabled] = useState(true);
  const [partialCodEnabled, setPartialCodEnabled] = useState(true);
  const [partialCodAmount, setPartialCodAmount] = useState('150');
  const [maxCodLimit, setMaxCodLimit] = useState('5000');

  // Payments
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_1DP5mmOlF5G5ag');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••••••••••');
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>('test');

  // Storage
  const [r2Bucket, setR2Bucket] = useState('bingooo-production-media');
  const [r2AccountId, setR2AccountId] = useState('d3b07384d113edec49eaa6238ad5ff00');
  const [cdnDomain, setCdnDomain] = useState('https://media.bingooo.in');

  // SEO
  const [seoTitle, setSeoTitle] = useState("Bingooo Men's Wear | Streetwear & Custom Design Studio");
  const [seoDescription, setSeoDescription] = useState('Premium 240 GSM boxy streetwear t-shirts, fleece hoodies, and live custom design studio. Wear what feels like you.');
  const [ogImageUrl, setOgImageUrl] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200');

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get<Record<string, any>>('/admin/settings'),
  });

  useEffect(() => {
    if (serverSettings) {
      if (serverSettings.store_name) setStoreName(serverSettings.store_name);
      if (serverSettings.store_email) setSupportEmail(serverSettings.store_email);
      if (serverSettings.store_phone) setSupportPhone(serverSettings.store_phone);
      if (serverSettings.free_shipping_threshold) setFreeShippingThreshold(String(serverSettings.free_shipping_threshold));
      if (serverSettings.shipping_fee_default) setStandardShippingFee(String(serverSettings.shipping_fee_default));
      if (serverSettings.tax_rate_percentage) setGstRate(String(serverSettings.tax_rate_percentage));
      if (serverSettings.cod_enabled !== undefined) setCodEnabled(Boolean(serverSettings.cod_enabled));
      if (serverSettings.currency) setCurrency(serverSettings.currency);
    }
  }, [serverSettings]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, any>) => api.put('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast({
        title: 'Store settings synchronized',
        description: 'Parameters saved to backend database and updated across storefront.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Save failed',
        description: err.message || 'Could not update settings.',
        variant: 'danger',
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      store_name: storeName,
      store_email: supportEmail,
      store_phone: supportPhone,
      free_shipping_threshold: Number(freeShippingThreshold) || 999,
      shipping_fee_default: Number(standardShippingFee) || 99,
      tax_rate_percentage: Number(gstRate) || 5,
      cod_enabled: codEnabled,
      currency: currency,
    });
  };

  const tabs = [
    { key: 'store', label: 'Store Profile', icon: Store },
    { key: 'commerce', label: 'Commerce & GST', icon: Sliders },
    { key: 'shipping', label: 'Shipping Rules', icon: Truck },
    { key: 'cod', label: 'COD & Partial COD', icon: CreditCard },
    { key: 'payments', label: 'Razorpay Gateway', icon: ShieldCheck },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'storage', label: 'Cloudflare R2', icon: Database },
    { key: 'seo', label: 'SEO & Metadata', icon: Globe },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Settings size={14} /> System Parameters
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Store & Infrastructure Settings
          </h2>
          <p className="text-xs text-muted">
            Configure storefront branding, shipping matrices, Razorpay keys, and Cloudflare R2 endpoints.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Store Profile */}
        {activeTab === 'store' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Store Identity & Contact Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Storefront Name *
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Brand Tagline
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Support Email
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Support Phone / WhatsApp
                  <input
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted">
                  Business HQ Address
                  <input
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Commerce */}
        {activeTab === 'commerce' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Commerce Economics & Taxation
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Storefront Currency
                  <input
                    disabled
                    value={currency}
                    className="input-admin mt-1 font-bold opacity-75"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Applicable GST Rate (%)
                  <input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
                <p className="text-[11px] text-muted mt-1">HSN 6109 (Apparel below ₹1,000 is 5% GST)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Minimum Cart Checkout (₹)
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping */}
        {activeTab === 'shipping' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Logistics & Courier Delivery Rules
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Free Shipping Minimum Cart (₹)
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="input-admin mt-1 font-bold"
                  />
                </label>
                <p className="text-[11px] text-muted mt-1">Orders above this threshold qualify for zero delivery fee</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Standard Shipping Fee (₹)
                  <input
                    type="number"
                    value={standardShippingFee}
                    onChange={(e) => setStandardShippingFee(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Express Air Delivery Fee (₹)
                  <input
                    type="number"
                    value={expressShippingFee}
                    onChange={(e) => setExpressShippingFee(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Estimated Delivery Commitment
                  <input
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: COD */}
        {activeTab === 'cod' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Cash On Delivery & Partial COD Advance
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="h-4 w-4 accent-brand-red"
                />
                <div>
                  <span className="text-xs font-bold text-ink block">Enable Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-muted">Allow shoppers to pay courier at delivery</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={partialCodEnabled}
                  onChange={(e) => setPartialCodEnabled(e.target.checked)}
                  className="h-4 w-4 accent-brand-red"
                />
                <div>
                  <span className="text-xs font-bold text-ink block">Enable Partial COD (Advance Security Deposit)</span>
                  <span className="text-[11px] text-muted">Collect advance via UPI to minimize courier RTO return rates</span>
                </div>
              </label>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold text-muted">
                    Partial COD Advance Deposit (₹)
                    <input
                      type="number"
                      value={partialCodAmount}
                      onChange={(e) => setPartialCodAmount(e.target.value)}
                      className="input-admin mt-1 font-bold"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted">
                    Maximum COD Order Cap (₹)
                    <input
                      type="number"
                      value={maxCodLimit}
                      onChange={(e) => setMaxCodLimit(e.target.value)}
                      className="input-admin mt-1"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Payments */}
        {activeTab === 'payments' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Razorpay Gateway Credentials
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Environment Mode
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="input-admin mt-1 text-xs font-bold"
                  >
                    <option value="test">Test Mode (Sandboxed)</option>
                    <option value="live">Live Production</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Razorpay Key ID *
                  <input
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    className="input-admin mt-1 font-mono text-xs"
                  />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted">
                  Razorpay Key Secret *
                  <input
                    type="password"
                    value={razorpaySecret}
                    onChange={(e) => setRazorpaySecret(e.target.value)}
                    className="input-admin mt-1 font-mono text-xs"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Notifications */}
        {activeTab === 'notifications' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Operational Notifications & Webhooks
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-red" />
                <span>Send transactional email alert to admin on new paid order</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-red" />
                <span>Alert production queue when customer uploads custom DTG vector</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-red" />
                <span>Trigger low stock warning email when SKU drops below 5 units</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 7: Storage */}
        {activeTab === 'storage' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Cloudflare R2 Object Storage Configuration
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted">
                  R2 Bucket Name
                  <input
                    value={r2Bucket}
                    onChange={(e) => setR2Bucket(e.target.value)}
                    className="input-admin mt-1 font-mono text-xs"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Cloudflare Account ID
                  <input
                    value={r2AccountId}
                    onChange={(e) => setR2AccountId(e.target.value)}
                    className="input-admin mt-1 font-mono text-xs"
                  />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted">
                  Public CDN Domain URL
                  <input
                    value={cdnDomain}
                    onChange={(e) => setCdnDomain(e.target.value)}
                    className="input-admin mt-1 text-xs"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: SEO */}
        {activeTab === 'seo' && (
          <div className="card-admin p-6 space-y-4">
            <h3 className="font-bold text-ink text-base border-b border-border pb-3">
              Default SEO Metadata & Open Graph Social Cards
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Global Meta Title
                  <input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="input-admin mt-1"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Global Meta Description
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="input-admin mt-1 text-xs"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Open Graph Social Share Image URL
                  <input
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    className="input-admin mt-1 text-xs"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 card-admin p-4">
          <button type="submit" className="btn-primary">
            <Check size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
