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
  Package,
  Layers,
  Sparkles,
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red whitespace-nowrap">
              TAXONOMY STUDIO
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted whitespace-nowrap">
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

      {/* Bauhaus Tabs & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border-2 border-[#171717] shadow-[4px_4px_0px_#171717]">
        <div className="flex gap-1.5 p-1 border-2 border-[#171717] bg-[#EDE0CC]">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-[2px] font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#E6321C] text-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717]'
                : 'bg-white text-[#171717] hover:bg-[#F7EEDB] border-2 border-transparent'
            }`}
          >
            <FolderTree size={14} />
            <span>Garment Categories ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 rounded-[2px] font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'collections'
                ? 'bg-[#E6321C] text-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717]'
                : 'bg-white text-[#171717] hover:bg-[#F7EEDB] border-2 border-transparent'
            }`}
          >
            <Sparkles size={14} />
            <span>Capsules & Drops ({collections.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#171717]" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10 py-2 text-xs font-mono"
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
      <div className="border-2 border-[#171717] bg-white shadow-[4px_4px_0px_#171717] overflow-hidden">
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
                  <td colSpan={6} className="text-center py-16 text-[#6F6A63]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-[#E6321C]" />
                      <span className="font-mono text-xs uppercase tracking-widest font-bold">
                        Loading Taxonomy…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#6F6A63]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers size={28} className="text-[#6F6A63]/50" />
                      <span className="font-mono font-black text-[#171717] text-sm uppercase">No items found</span>
                      <p className="text-xs text-[#6F6A63] max-w-sm">
                        Create your first {activeTab === 'categories' ? 'category' : 'collection'} to organize your products.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F7EEDB]/60">
                    <td>
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 border-2 border-[#171717] rounded-[2px] bg-[#171717] text-white font-black text-xs flex items-center justify-center uppercase font-mono shadow-[1.5px_1.5px_0px_#171717]">
                          {cat.name.slice(0, 2)}
                        </div>
                        <div>
                          <strong className="text-xs font-black text-[#171717] block font-sans">{cat.name}</strong>
                          <span className="text-[10px] text-[#6F6A63] font-mono">
                            ID: {cat.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs text-[#171717] bg-[#EDE0CC] px-2.5 py-1 border border-[#171717] rounded-[2px] shadow-[1px_1px_0px_#171717]">
                        /{cat.slug}
                      </span>
                    </td>

                    <td>
                      {cat.is_active ? (
                        <span className="badge badge-success">
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          Hidden
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="font-mono font-black text-xs text-[#171717] flex items-center gap-1.5">
                        <Package size={13} className="text-[#6F6A63]" />
                        {cat.productCount ?? 0} pcs
                      </span>
                    </td>

                    <td className="text-[11px] text-[#6F6A63] font-mono">
                      {new Date(cat.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(cat)}
                          className="btn-outline p-1.5 text-[#171717] hover:bg-[#171717] hover:text-white"
                          title="Edit classification"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: cat.id, name: cat.name })}
                          className="btn-outline p-1.5 text-rose-600 hover:bg-[#E6321C] hover:text-white"
                          title="Delete classification"
                        >
                          <Trash2 size={13} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2px] max-w-md w-full p-6 sm:p-7 shadow-[6px_6px_0px_#171717] border-2 border-[#171717] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 bg-[#EDE0CC] -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 p-5">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-[#171717] font-mono">
                  {editingCat
                    ? `Edit ${activeTab === 'categories' ? 'Category' : 'Collection'}`
                    : `New ${activeTab === 'categories' ? 'Category' : 'Collection'}`}
                </h3>
                <span className="text-xs text-[#6F6A63]">
                  Configure display naming, URL routing slug, and storefront status.
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-[2px] bg-white border-2 border-[#171717] hover:bg-[#E6321C] hover:text-white flex items-center justify-center text-[#171717] font-bold cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border-2 border-rose-600 rounded-[2px] text-rose-700 text-xs font-mono font-bold">
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
                <span className="text-[10px] text-[#6F6A63] mt-1 block font-mono">
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
                    className="w-4 h-4 rounded-[2px] border-2 border-[#171717] text-[#E6321C] focus:ring-0"
                  />
                  <label htmlFor="cat-active" className="text-xs font-bold text-[#171717] cursor-pointer font-sans">
                    Active & visible in storefront navigation
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#171717]">
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
