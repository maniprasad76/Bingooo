import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Settings, Save, CheckCircle, AlertCircle, LoaderCircle, Store, Truck, CreditCard } from 'lucide-react';

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  support_hours: string;
  currency: string;
  cod_enabled: boolean;
  partial_cod_enabled: boolean;
  partial_cod_advance_amount: number;
  max_cod_limit: number;
  cod_deposit_percentage: number;
  shipping_fee_default: number;
  free_shipping_threshold: number;
  tax_rate_percentage: number;
  max_upload_size_mb: number;
  return_window_days: number;
  dtg_print_lead_days: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Bingooo Luxury Streetwear',
  store_email: 'care@bingooo.in',
  store_phone: '+91 98765 43210',
  support_hours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
  currency: 'INR',
  cod_enabled: true,
  partial_cod_enabled: true,
  partial_cod_advance_amount: 79,
  max_cod_limit: 5000,
  cod_deposit_percentage: 30,
  shipping_fee_default: 99,
  free_shipping_threshold: 999,
  tax_rate_percentage: 5,
  max_upload_size_mb: 15,
  return_window_days: 7,
  dtg_print_lead_days: 3,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<StoreSettings>('/admin/settings')
      .then((data) => {
        if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch(() => {
        // use default fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const updated = await api.put<StoreSettings>('/admin/settings', settings);
      if (updated) setSettings({ ...DEFAULT_SETTINGS, ...updated });
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle size={28} className="animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink flex items-center gap-2">
          <Settings size={22} className="text-brand-red" /> Store Settings
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Configure operations, payment rules, shipping fees, and store policies.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success-light p-3.5 text-success border border-success/20 text-xs font-semibold">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-light p-3.5 text-danger border border-danger/20 text-xs font-semibold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Store size={18} className="text-brand-red" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">General Store Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Store Name</label>
              <input
                type="text"
                className="admin-input"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="admin-label">Currency</label>
              <input
                type="text"
                className="admin-input"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="admin-label">Support Email</label>
              <input
                type="email"
                className="admin-input"
                value={settings.store_email}
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="admin-label">Support Phone</label>
              <input
                type="text"
                className="admin-input"
                value={settings.store_phone}
                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="admin-label">Support Hours</label>
              <input
                type="text"
                className="admin-input"
                value={settings.support_hours}
                onChange={(e) => setSettings({ ...settings, support_hours: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Payments & COD */}
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <CreditCard size={18} className="text-brand-red" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Payments & Cash on Delivery (COD)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-beige/20">
              <div>
                <p className="text-xs font-bold text-ink">Cash on Delivery (COD)</p>
                <p className="text-[11px] text-muted">Enable COD payment method at checkout</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-brand-red focus:ring-brand-red"
                checked={settings.cod_enabled}
                onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-beige/20">
              <div>
                <p className="text-xs font-bold text-ink">Partial COD Deposit</p>
                <p className="text-[11px] text-muted">Require nominal token advance to confirm COD</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-brand-red focus:ring-brand-red"
                checked={settings.partial_cod_enabled}
                onChange={(e) => setSettings({ ...settings, partial_cod_enabled: e.target.checked })}
              />
            </div>

            <div>
              <label className="admin-label">Partial COD Advance (₹)</label>
              <input
                type="number"
                min={0}
                className="admin-input"
                value={settings.partial_cod_advance_amount}
                onChange={(e) => setSettings({ ...settings, partial_cod_advance_amount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="admin-label">Max Allowed COD Order Value (₹)</label>
              <input
                type="number"
                min={0}
                className="admin-input"
                value={settings.max_cod_limit}
                onChange={(e) => setSettings({ ...settings, max_cod_limit: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Shipping & Logistics */}
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Truck size={18} className="text-brand-red" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Shipping & Fulfillment Policies</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min={0}
                className="admin-input"
                value={settings.shipping_fee_default}
                onChange={(e) => setSettings({ ...settings, shipping_fee_default: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="admin-label">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                min={0}
                className="admin-input"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="admin-label">Return Window (Days)</label>
              <input
                type="number"
                min={0}
                className="admin-input"
                value={settings.return_window_days}
                onChange={(e) => setSettings({ ...settings, return_window_days: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="admin-label">DTG Custom Studio Lead Time (Days)</label>
              <input
                type="number"
                min={1}
                className="admin-input"
                value={settings.dtg_print_lead_days}
                onChange={(e) => setSettings({ ...settings, dtg_print_lead_days: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
            {saving ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
