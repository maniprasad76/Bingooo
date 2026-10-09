import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { Settings, Save, CheckCircle, AlertCircle, LoaderCircle, Store, Truck, CreditCard } from 'lucide-react';

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  support_hours: string;
  currency: string;
  tax_rate_percentage: number;
  max_upload_size_mb: number;
  return_window_days: number;
  dtg_print_lead_days: number;
  prepaid_discount_percentage: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Bingooo Luxury Streetwear',
  store_email: 'care@bingooo.in',
  store_phone: '+91 98765 43210',
  support_hours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
  currency: 'INR',
  tax_rate_percentage: 0,
  max_upload_size_mb: 25,
  return_window_days: 7,
  dtg_print_lead_days: 3,
  prepaid_discount_percentage: 5,
};

export function SettingsPage() {
  const { toast } = useToast();
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
      toast.success('Settings Saved', 'Store configuration and checkout rules updated.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update store settings.');
      toast.error('Save Failed', err?.message || 'Failed to update store settings.');
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
      <div className="border-b-2 border-[#171717] pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#171717] font-sans flex items-center gap-2">
          <Settings size={22} className="text-[#E6321C]" /> Store Settings
        </h1>
        <p className="text-xs text-[#171717]/70 mt-1 font-medium">
          Configure operations, payment rules, and store policies.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-100 p-3.5 text-emerald-950 border-2 border-[#171717] text-xs font-bold shadow-[2px_2px_0px_#171717]">
          <CheckCircle size={16} className="text-emerald-800" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-100 p-3.5 text-rose-950 border-2 border-[#171717] text-xs font-bold shadow-[2px_2px_0px_#171717]">
          <AlertCircle size={16} className="text-[#E6321C]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white border-2 border-[#171717] p-6 space-y-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#171717]">
            <Store size={18} className="text-[#E6321C]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[#171717]">General Store Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Store Name</label>
              <input
                type="text"
                className="admin-input font-bold"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="admin-label">Currency</label>
              <input
                type="text"
                className="admin-input font-mono font-bold"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="admin-label">Support Email</label>
              <input
                type="email"
                className="admin-input font-mono"
                value={settings.store_email}
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="admin-label">Support Phone</label>
              <input
                type="text"
                className="admin-input font-mono"
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

        {/* Payments & Prepaid Policy */}
        <div className="bg-white border-2 border-[#171717] p-6 space-y-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#171717]">
            <CreditCard size={18} className="text-[#E6321C]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[#171717]">Payments & Prepaid Policy</h2>
          </div>

          <div className="p-3.5 border-2 border-[#171717] bg-[#F7EEDB] text-xs text-[#171717] font-medium leading-relaxed shadow-[2px_2px_0px_#171717]">
            Bingooo operates exclusively on a 100% secure prepaid architecture (Razorpay UPI, Cards, NetBanking). Cash on Delivery (COD) is permanently disabled across the storefront.
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]">
              <div>
                <p className="text-xs font-black uppercase text-[#171717]">Prepaid Discount (%)</p>
                <p className="text-[11px] text-[#171717]/70 font-medium">Flat percentage discount for customers who pay online (UPI / Cards)</p>
              </div>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                className="admin-input w-24 text-center font-mono font-black text-sm"
                value={settings.prepaid_discount_percentage}
                onChange={(e) => setSettings({ ...settings, prepaid_discount_percentage: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Shipping & Logistics */}
        <div className="bg-white border-2 border-[#171717] p-6 space-y-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#171717]">
            <Truck size={18} className="text-[#E6321C]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[#171717]">Shipping & Fulfillment Policies</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Return Window (Days)</label>
              <input
                type="number"
                min={0}
                className="admin-input font-mono font-bold"
                value={settings.return_window_days}
                onChange={(e) => setSettings({ ...settings, return_window_days: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="admin-label">DTG Custom Studio Lead Time (Days)</label>
              <input
                type="number"
                min={1}
                className="admin-input font-mono font-bold"
                value={settings.dtg_print_lead_days}
                onChange={(e) => setSettings({ ...settings, dtg_print_lead_days: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
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
