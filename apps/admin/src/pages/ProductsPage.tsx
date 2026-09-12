import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, X, LoaderCircle } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  category: string;
  status: string;
  images: Array<{ url: string; alt_text?: string }>;
  variants: Array<{ id: string; size: string; color: string; price: number; stock_quantity: number }>;
}

const EMPTY_FORM = { title: '', slug: '', description: '', base_price: 0, category_id: '', status: 'active' };

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.get<Product[]>('/products/admin/catalog')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      base_price: p.base_price,
      category_id: '',
      status: p.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/products/${editId}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowModal(false);
      fetchProducts();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {}
  };

  const formatPrice = (v: number) => '₹' + v.toLocaleString('en-IN');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink">Products</h1>
          <p className="text-xs text-muted mt-0.5">{products.length} items in catalog</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Variants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted">No products found</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0].url} alt={p.title} className="w-10 h-10 rounded object-cover bg-beige" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-beige flex items-center justify-center text-[10px] text-muted">No img</div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-ink">{p.title}</p>
                        <p className="text-[10px] text-muted font-mono">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold">{formatPrice(p.base_price)}</td>
                  <td className="text-sm">{p.variants?.length || 0}</td>
                  <td>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="btn-ghost p-1.5" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn-ghost p-1.5 text-danger hover:text-danger" title="Delete">
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                {editId ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="admin-label">Title</label>
                <input
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Heavyweight Boxy Tee"
                />
              </div>
              <div>
                <label className="admin-label">Slug</label>
                <input
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="heavyweight-boxy-tee"
                />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input min-h-[80px] resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Price (₹)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="admin-label">Status</label>
                  <select
                    className="admin-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <LoaderCircle size={14} className="animate-spin" /> : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
