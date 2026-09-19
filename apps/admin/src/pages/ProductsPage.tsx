import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  Sparkles,
  Filter,
  Loader2,
  Package,
  Layers,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  compare_at_price?: number;
  category?: { id: string; name: string; slug: string } | null;
  status: string;
  customization_enabled?: boolean;
  fabric?: string;
  gsm?: string;
  fit?: string;
  images: Array<{ url: string; alt_text?: string }>;
  variants: Array<{ id: string; size: string; color: string; price: number; stockQuantity?: number; stock_quantity?: number }>;
}

export function ProductsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');

  const fetchProducts = () => {
    setLoading(true);
    api
      .get<Product[]>('/products/admin/catalog')
      .then((data) => setProducts(data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const { id, title } = productToDelete;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted', `"${title}" has been deleted from catalog.`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete', err?.message || 'Could not delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (v: number) => '₹' + (v || 0).toLocaleString('en-IN');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.category?.name && p.category.name.toLowerCase().includes(term)) ||
        (p.fabric && p.fabric.toLowerCase().includes(term));
      return matchStatus && matchSearch;
    });
  }, [products, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'active').length;
    const customizable = products.filter((p) => p.customization_enabled).length;
    return { total, active, customizable };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              CATALOG ATELIER
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {stats.total} TOTAL • {stats.active} LIVE • {stats.customizable} 3D BESPOKE
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Products Workshop
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage heavy-duty tees, hoodies, oversize drops, and bespoke 3D customizer garments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="btn-outline p-2.5"
            title="Refresh catalog"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link to="/products/new" className="btn-primary">
            <Plus size={15} /> Add New Product
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <div className="relative w-full sm:w-96">
          <Search size={15} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search by title, slug, fabric, category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-9.5 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          <div className="flex gap-1 bg-beige/40 p-1 rounded-xl border border-border/60">
            {(['all', 'active', 'draft', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? 'bg-ink text-white shadow-2xs'
                    : 'text-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Garment & Spec</th>
                <th>Category</th>
                <th>Pricing (INR)</th>
                <th>Fabric & Fit</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-brand-red" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Loading Garment Catalog…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No products found</span>
                      <p className="text-xs text-muted max-w-sm">
                        No garments match your current search query or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const totalStock =
                    p.variants?.reduce(
                      (sum, v) => sum + (v.stockQuantity ?? v.stock_quantity ?? 0),
                      0
                    ) ?? 0;
                  const primaryImg = p.images?.[0]?.url || '';

                  return (
                    <tr key={p.id} className="group">
                      {/* Product details */}
                      <td>
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-xl bg-beige/50 overflow-hidden border border-border/70 shrink-0 relative shadow-2xs group-hover:border-ink/40 transition-colors flex items-center justify-center">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-[9px] font-mono font-bold text-ink/40 tracking-wider">
                                NO IMG
                              </span>
                            )}
                            {p.customization_enabled && (
                              <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-brand-red text-white shadow-xs">
                                3D
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/products/${p.id}/edit`}
                                className="text-xs font-bold text-ink hover:text-brand-red transition-colors no-underline line-clamp-1"
                              >
                                {p.title}
                              </Link>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted font-mono tracking-tight">
                                /{p.slug}
                              </span>
                              <span className="text-muted/40 text-[10px]">•</span>
                              <span className="text-[10px] text-muted font-mono">
                                {p.variants?.length || 0} variants
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-beige/70 text-ink border border-border/60">
                          {p.category?.name || 'Curated'}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-ink text-xs">
                            {formatPrice(p.base_price)}
                          </span>
                          {p.compare_at_price && p.compare_at_price > p.base_price && (
                            <span className="text-[10px] font-mono text-muted line-through">
                              {formatPrice(p.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fabric / Specs */}
                      <td>
                        <div className="text-[11px] space-y-0.5">
                          <span className="font-semibold text-ink block">
                            {p.gsm ? `${p.gsm} GSM Cotton` : 'Heavyweight Cotton'}
                          </span>
                          <span className="text-[10px] text-muted font-mono">
                            {p.fit || 'Oversized Boxy Fit'}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              totalStock > 20
                                ? 'bg-emerald-500'
                                : totalStock > 0
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-mono font-bold ${
                              totalStock > 20
                                ? 'text-emerald-700'
                                : totalStock > 0
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {totalStock} pcs
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            p.status === 'active'
                              ? 'badge-success'
                              : p.status === 'draft'
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/${p.id}/edit`}
                            className="btn-ghost p-2 text-muted hover:text-ink hover:bg-beige"
                            title="Edit product specs"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete({ id: p.id, title: p.title })}
                            disabled={deletingId !== null}
                            className="btn-ghost p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete product"
                          >
                            {deletingId === p.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={productToDelete !== null}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.title}"? All variants and images will be removed. This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Keep Product"
        isDestructive={true}
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
