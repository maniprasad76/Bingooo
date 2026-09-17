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
  min_order_value: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              PROMOTIONS ENGINE
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {activeCoupons} ACTIVE PROMOS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Discount Vouchers & Coupons
          </h1>
          <p className="text-xs text-muted mt-0.5">
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

      {/* Bento Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Configured Vouchers</span>
            <div className="w-9 h-9 rounded-xl bg-beige/60 border border-border/60 flex items-center justify-center text-ink">
              <Ticket size={16} />
            </div>
          </div>
          <p className="stat-value">{totalCoupons}</p>
          <span className="text-[10px] font-mono text-muted mt-1 block">Total promotional codes</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Active on Checkout</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="stat-value text-emerald-700">{activeCoupons}</p>
          <span className="text-[10px] font-mono text-emerald-700 mt-1 block">Can be claimed by customers</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Redemptions</span>
            <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
              <Percent size={16} />
            </div>
          </div>
          <p className="stat-value">{totalRedemptions}</p>
          <span className="text-[10px] font-mono text-muted mt-1 block">Orders with voucher applied</span>
        </div>
      </div>

      {/* Coupons Table */}
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
                  <td colSpan={6} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-brand-red" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Loading Vouchers…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ticket size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No vouchers created</span>
                      <p className="text-xs text-muted max-w-sm">
                        Create discount codes to drive sales and celebrate new drops.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="group">
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black tracking-widest bg-beige/80 border border-border/80 px-2.5 py-1 rounded-lg text-ink">
                          {c.code}
                        </span>
                        <button
                          onClick={() => copyCode(c.code)}
                          className="text-muted hover:text-ink transition-colors p-1"
                          title="Copy Code"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono font-bold text-xs text-brand-red">
                        {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                      </span>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-ink">
                        ₹{c.min_order_value.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <div className="space-y-1 max-w-[120px]">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-ink">{c.used_count}</span>
                          <span className="text-muted">/{c.max_uses} max</span>
                        </div>
                        <div className="w-full bg-beige/60 h-1.5 rounded-full overflow-hidden border border-border/40">
                          <div
                            className="bg-brand-red h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round((c.used_count / c.max_uses) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${c.is_active ? 'badge-success' : 'badge-neutral'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggle(c.id, c.code, !c.is_active)}
                          className="btn-ghost p-1.5"
                          title={c.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {c.is_active ? (
                            <ToggleRight size={22} className="text-emerald-600" />
                          ) : (
                            <ToggleLeft size={22} className="text-muted" />
                          )}
                        </button>
                        <button
                          onClick={() => setCouponToDelete(c)}
                          className="btn-ghost p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-ink font-sans">
                  Create Promotional Voucher
                </h3>
                <span className="text-xs text-muted">
                  Configure discount percentage, min order, and redemption limit.
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
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
                    className="admin-select"
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
                    className="admin-input font-mono"
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

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/70">
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
