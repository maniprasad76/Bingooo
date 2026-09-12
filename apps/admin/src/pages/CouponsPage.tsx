import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, ToggleLeft, ToggleRight, X, LoaderCircle } from 'lucide-react';

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
}

const EMPTY_FORM: {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number;
} = { code: '', type: 'percentage', value: 10, min_order_value: 0, max_uses: 100 };

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    api.get<Coupon[]>('/coupons')
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchCoupons();
    } catch {}
    setSaving(false);
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/coupons/${id}/toggle`);
      fetchCoupons();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink">Coupons</h1>
          <p className="text-xs text-muted mt-0.5">{coupons.length} coupons configured</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">Loading…</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted">No coupons created yet</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-extrabold tracking-wider">{c.code}</td>
                  <td className="font-bold">
                    {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="text-sm">₹{c.min_order_value.toLocaleString('en-IN')}</td>
                  <td className="text-sm">
                    <span className="font-semibold">{c.used_count}</span>
                    <span className="text-muted">/{c.max_uses}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-success' : 'badge-neutral'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className="btn-ghost p-1.5"
                        title={c.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {c.is_active
                          ? <ToggleRight size={18} className="text-success" />
                          : <ToggleLeft size={18} className="text-muted" />
                        }
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="btn-ghost p-1.5 text-danger hover:text-danger" title="Delete">
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Create Coupon</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="admin-label">Coupon Code</label>
                <input
                  className="admin-input uppercase"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="SUMMER25"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Type</label>
                  <select
                    className="admin-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Value</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    required
                    min={1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Min Order (₹)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div>
                  <label className="admin-label">Max Uses</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <LoaderCircle size={14} className="animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
