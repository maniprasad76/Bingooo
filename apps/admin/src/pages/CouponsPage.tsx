import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  LoaderCircle,
  Ticket,
  Percent,
  CheckCircle2,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value?: number | null;
  max_uses?: number | null;
  used_count?: number | null;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

const EMPTY_FORM: {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number;
} = {
  code: '',
  type: 'percentage',
  value: 10,
  min_order_value: 0,
  max_uses: 100,
};

export function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    api
      .get<Coupon[]>('/coupons')
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', form);
      toast.success('Coupon Created', `Voucher code "${form.code}" is ready for customers.`);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchCoupons();
    } catch (err: any) {
      toast.error('Failed to create coupon', err?.message || 'Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, code: string, willBeActive: boolean) => {
    try {
      await api.patch(`/coupons/${id}/toggle`);
      toast.success('Coupon Status Updated', `Coupon "${code}" is now ${willBeActive ? 'active' : 'inactive'}.`);
      fetchCoupons();
    } catch (err: any) {
      toast.error('Toggle Failed', err?.message || 'Could not update coupon status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/coupons/${couponToDelete.id}`);
      toast.success('Coupon Deleted', `Coupon code "${couponToDelete.code}" has been deleted.`);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Could not delete coupon.');
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.info('Copied to Clipboard', `Coupon code "${code}" copied.`);
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#171717] text-white px-2 py-0.5">
              PROMOTIONS ENGINE
            </span>
            <span className="text-[#171717]/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717]/70">
              {activeCoupons} ACTIVE PROMOS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171717] font-sans mt-1">
            Discount Vouchers & Coupons
          </h1>
          <p className="text-xs text-[#171717]/70 mt-0.5 font-medium">
            Create promotional codes, seasonal drops, and minimum order threshold discounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCoupons}
            className="btn-outline p-2.5"
            disabled={loading}
            title="Refresh coupons"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={15} /> Create Voucher
          </button>
        </div>
      </div>

      {/* Bauhaus Bento Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Configured Vouchers</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-[#F7EEDB] flex items-center justify-center text-[#171717] shadow-[2px_2px_0px_#171717]">
              <Ticket size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#171717] mt-2">{totalCoupons}</p>
          <span className="text-[10px] font-mono text-[#171717]/60 mt-1 block uppercase">Total promotional codes</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Active on Checkout</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-emerald-100 flex items-center justify-center text-emerald-900 shadow-[2px_2px_0px_#171717]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-800 mt-2">{activeCoupons}</p>
          <span className="text-[10px] font-mono text-emerald-800 font-bold mt-1 block uppercase">Can be claimed by customers</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Total Redemptions</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-[#E6321C] flex items-center justify-center text-white shadow-[2px_2px_0px_#171717]">
              <Percent size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#E6321C] mt-2">{totalRedemptions}</p>
          <span className="text-[10px] font-mono text-[#E6321C] font-bold mt-1 block uppercase">Orders with voucher applied</span>
        </div>
      </div>

      {/* Bauhaus Coupons Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Voucher Code</th>
                <th>Discount Benefit</th>
                <th>Minimum Cart</th>
                <th>Usage Progress</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={22} className="animate-spin text-[#E6321C]" />
                      <span className="font-mono text-xs uppercase tracking-widest font-bold">
                        Loading Vouchers…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ticket size={32} className="text-[#171717]/40" />
                      <span className="font-bold text-[#171717] text-sm uppercase font-mono">No vouchers created</span>
                      <p className="text-xs text-[#171717]/70 max-w-sm">
                        Create discount codes to drive sales and celebrate new drops.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black tracking-widest bg-[#F7EEDB] border-2 border-[#171717] px-2.5 py-1 text-[#171717] shadow-[2px_2px_0px_#171717]">
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyCode(c.code)}
                          className="p-1 border border-[#171717] bg-white hover:bg-[#FAF7F2] text-[#171717] transition-colors"
                          title="Copy Code"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono font-black text-xs text-[#E6321C]">
                        {c.type === 'percentage'
                          ? `${c.value ?? 0}% OFF`
                          : `₹${Number(c.value ?? 0).toLocaleString('en-IN')} FLAT`}
                      </span>
                    </td>

                    <td>
                      <span className="font-mono text-xs font-bold text-[#171717]">
                        ₹{Number(c.min_order_value ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <div className="space-y-1 max-w-[120px]">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-[#171717]">{c.used_count ?? 0}</span>
                          <span className="text-[#171717]/60 font-semibold">/{c.max_uses ?? '∞'}</span>
                        </div>
                        <div className="w-full bg-[#FAF7F2] h-2 border border-[#171717] overflow-hidden">
                          <div
                            className="bg-[#E6321C] h-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round(((c.used_count ?? 0) / (c.max_uses || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717] ${
                          c.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-current" />
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(c.id, c.code, !c.is_active)}
                          className="p-1 border border-[#171717] bg-white hover:bg-[#F7EEDB] transition-colors"
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {c.is_active ? (
                            <ToggleRight size={20} className="text-emerald-700" />
                          ) : (
                            <ToggleLeft size={20} className="text-[#171717]/40" />
                          )}
                        </button>
                        <button
                          onClick={() => setCouponToDelete(c)}
                          className="p-1 border border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white text-[#171717] transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bauhaus Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#F7EEDB] border-2 border-[#171717] max-w-md w-full p-6 shadow-[8px_8px_0px_#171717] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-[#171717] font-sans">
                  Create Promotional Voucher
                </h3>
                <span className="text-xs text-[#171717]/70 font-medium">
                  Configure discount percentage, min order, and redemption limit.
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white flex items-center justify-center text-[#171717] font-bold transition-colors shadow-[2px_2px_0px_#171717]"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="admin-label">Coupon Code *</label>
                <input
                  className="admin-input uppercase font-mono tracking-widest font-black"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="ATELIER20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Discount Type</label>
                  <select
                    className="admin-select font-mono font-semibold"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Benefit Value</label>
                  <input
                    type="number"
                    className="admin-input font-mono font-bold"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    required
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Min Cart (₹)</label>
                  <input
                    type="number"
                    className="admin-input font-mono"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div>
                  <label className="admin-label">Max Uses</label>
                  <input
                    type="number"
                    className="admin-input font-mono"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-[#171717]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <LoaderCircle size={14} className="animate-spin" /> : 'Launch Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={couponToDelete !== null}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon code "${couponToDelete?.code}"? Customers will no longer be able to use it.`}
        confirmText="Delete Coupon"
        cancelText="Keep"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  );
}
