import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  productCount?: number;
  created_at: string;
}

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  productCount?: number;
  created_at: string;
}

export function CategoriesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'categories' | 'collections'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | CollectionItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<Category[]>('/categories', { all: 'true' }).catch(() => []),
      api.get<CollectionItem[]>('/collections').catch(() => []),
    ])
      .then(([cats, cols]) => {
        setCategories(cats || []);
        setCollections(cols || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: Category | CollectionItem) => {
    setEditingCat(item);
    setName(item.name);
    setSlug(item.slug);
    setDescription((item as CollectionItem).description || '');
    setIsActive(item.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCat) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('Name and URL slug are strictly required.');
      return;
    }
    setSaving(true);
    setError(null);

    const isCol = activeTab === 'collections';
    const endpoint = isCol ? '/collections' : '/categories';

    try {
      if (editingCat) {
        await api.patch(`${endpoint}/${editingCat.id}`, {
          name: name.trim(),
          slug: slug.trim(),
          ...(isCol && { description: description.trim() }),
          is_active: isActive,
        });
        toast.success(
          `${isCol ? 'Collection' : 'Category'} Updated`,
          `"${name}" has been modified successfully.`
        );
      } else {
        await api.post(endpoint, {
          name: name.trim(),
          slug: slug.trim(),
          ...(isCol && { description: description.trim() }),
          is_active: true,
        });
        toast.success(
          `${isCol ? 'Collection' : 'Category'} Created`,
          `"${name}" has been added to the store.`
        );
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes. Ensure slug is unique.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const isCol = activeTab === 'collections';
    const endpoint = isCol ? '/collections' : '/categories';

    try {
      await api.delete(`${endpoint}/${itemToDelete.id}`);
      toast.success(
        'Deleted',
        `"${itemToDelete.name}" was removed from the catalog.`
      );
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      toast.error('Deletion Failed', err?.message || 'Could not delete item.');
    } finally {
      setDeleting(false);
    }
  };

  const currentList = activeTab === 'categories' ? categories : collections;
  const filtered = currentList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              TAXONOMY STUDIO
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {categories.length} CATEGORIES • {collections.length} COLLECTIONS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Categories & Collections
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Organize garment silhouettes, seasonal lookbooks, and limited atelier capsules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="btn-outline p-2.5"
            disabled={loading}
            title="Refresh taxonomy"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} />
            <span>New {activeTab === 'categories' ? 'Category' : 'Collection'}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <div className="flex gap-1 bg-beige/40 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-ink text-white shadow-2xs'
                : 'text-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            <FolderTree size={14} />
            <span>Garment Categories ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'collections'
                ? 'bg-ink text-white shadow-2xs'
                : 'text-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            <Sparkles size={14} />
            <span>Capsules & Drops ({collections.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9.5 py-2 text-xs"
          />
        </div>
      </div>

      {/* Bento Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Classified</span>
            <div className="w-9 h-9 rounded-xl bg-beige/60 border border-border/60 flex items-center justify-center text-ink">
              <Layers size={16} />
            </div>
          </div>
          <p className="stat-value">{currentList.length}</p>
          <span className="text-[10px] font-mono text-muted mt-1 block">
            {activeTab === 'categories' ? 'Product Categories' : 'Lookbook Capsules'}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Active on Storefront</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="stat-value">{currentList.filter((c) => c.is_active).length}</p>
          <span className="text-[10px] font-mono text-emerald-700 mt-1 block">
            Live in navigation menus
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Assigned Garments</span>
            <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
              <Package size={16} />
            </div>
          </div>
          <p className="stat-value">
            {currentList.reduce((acc, c) => acc + (c.productCount || 0), 0)}
          </p>
          <span className="text-[10px] font-mono text-muted mt-1 block">
            Total garments attached
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title & Monogram</th>
                <th>URL Slug</th>
                <th>Status</th>
                <th>Live Garments</th>
                <th>Created</th>
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
                        Loading Taxonomy…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No items found</span>
                      <p className="text-xs text-muted max-w-sm">
                        Create your first {activeTab === 'categories' ? 'category' : 'collection'} to organize your products.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="group">
                    <td>
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-ink text-white font-black text-xs flex items-center justify-center uppercase font-mono shadow-2xs">
                          {cat.name.slice(0, 2)}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-ink block">{cat.name}</strong>
                          <span className="text-[10px] text-muted font-mono">
                            ID: {cat.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-muted bg-beige/60 px-2.5 py-1 rounded-lg border border-border/60">
                        /{cat.slug}
                      </span>
                    </td>

                    <td>
                      {cat.is_active ? (
                        <span className="badge badge-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Hidden
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="font-mono font-bold text-xs text-ink flex items-center gap-1.5">
                        <Package size={13} className="text-muted" />
                        {cat.productCount ?? 0} pcs
                      </span>
                    </td>

                    <td className="text-[11px] text-muted font-mono">
                      {new Date(cat.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="btn-ghost p-2 text-muted hover:text-ink hover:bg-beige"
                          title="Edit classification"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: cat.id, name: cat.name })}
                          className="btn-ghost p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete classification"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-ink font-sans">
                  {editingCat
                    ? `Edit ${activeTab === 'categories' ? 'Category' : 'Collection'}`
                    : `New ${activeTab === 'categories' ? 'Category' : 'Collection'}`}
                </h3>
                <span className="text-xs text-muted">
                  Configure display naming, URL routing slug, and storefront status.
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
              >
                <X size={15} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="admin-label">
                  Classification Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Heavyweight Hoodies"
                  className="admin-input w-full"
                  required
                />
              </div>

              <div>
                <label className="admin-label">
                  URL Route Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. heavyweight-hoodies"
                  className="admin-input w-full font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-muted mt-1 block font-mono">
                  Store URL: /{activeTab === 'categories' ? 'category' : 'collection'}/{slug || '...'}
                </span>
              </div>

              {editingCat && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-brand-red focus:ring-brand-red"
                  />
                  <label htmlFor="cat-active" className="text-xs font-bold text-ink cursor-pointer">
                    Active & visible in storefront navigation
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCat ? 'Update Classification' : 'Create Classification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={itemToDelete !== null}
        title={`Delete ${activeTab === 'categories' ? 'Category' : 'Collection'}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? Products in this ${activeTab === 'categories' ? 'category' : 'collection'} will become unassigned.`}
        confirmText="Delete"
        cancelText="Keep"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
