import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  LoaderCircle,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  targetUrl: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  badge?: string;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  created_at?: string;
  updated_at?: string;
}

const EMPTY_FORM: Omit<BannerItem, 'id'> = {
  title: '',
  subtitle: '',
  ctaText: "Shop Men's Wear",
  targetUrl: '/shop',
  desktopImageUrl: '/hero-banner.png',
  mobileImageUrl: '/hero-banner.png',
  badge: 'EXCLUSIVE DROP',
  priority: 1,
  isActive: true,
};

export function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    api
      .get<BannerItem[]>('/banners/all')
      .then((data) => setBanners(data || []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      priority: banners.length + 1,
    });
    setShowModal(true);
  };

  const openEdit = (banner: BannerItem) => {
    setEditId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText || "Shop Men's Wear",
      targetUrl: banner.targetUrl || '/shop',
      desktopImageUrl: banner.desktopImageUrl || '/hero-banner.png',
      mobileImageUrl: banner.mobileImageUrl || banner.desktopImageUrl || '/hero-banner.png',
      badge: banner.badge || '',
      priority: banner.priority || 1,
      isActive: banner.isActive !== false,
      startDate: banner.startDate || '',
      endDate: banner.endDate || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/banners/${editId}`, form);
        toast.success('Banner Updated', `"${form.title}" was saved.`);
      } else {
        await api.post('/banners', form);
        toast.success('Banner Created', `"${form.title}" is now active.`);
      }
      setShowModal(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchBanners();
    } catch (err: any) {
      toast.error('Failed to save banner', err?.message || 'Check inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean, title: string) => {
    try {
      await api.patch(`/banners/${id}`, { isActive: !currentStatus });
      toast.success(
        'Banner Status Changed',
        `"${title || 'Banner'}" is now ${!currentStatus ? 'active' : 'draft'}.`
      );
      fetchBanners();
    } catch (err: any) {
      toast.error('Toggle Failed', err?.message || 'Failed to update banner status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/banners/${bannerToDelete.id}`);
      toast.success('Banner Deleted', `"${bannerToDelete.title || 'Banner'}" was removed.`);
      setBannerToDelete(null);
      fetchBanners();
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Failed to delete banner.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              CAMPAIGN WORKSHOP
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {banners.filter((b) => b.isActive).length} LIVE HERO SLIDES
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Storefront Banners & Campaigns
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage full-width carousel slides, seasonal campaign drops, and promotional call-to-actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBanners}
            className="btn-outline p-2.5"
            disabled={loading}
            title="Refresh banners"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} />
            <span>New Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <RefreshCw size={24} className="animate-spin text-brand-red" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted">
            Loading Hero Carousel…
          </span>
        </div>
      ) : banners.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <ImageIcon size={36} className="mx-auto text-muted/40 mb-3" />
          <p className="text-sm font-bold text-ink">No hero slides configured</p>
          <p className="text-xs text-muted mt-1">
            Create your first visual drop banner to greet storefront visitors.
          </p>
          <button onClick={openCreate} className="btn-primary mt-4">
            <Plus size={14} />
            <span>Create Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`admin-card overflow-hidden flex flex-col justify-between transition-all group hover:shadow-card-hover ${
                !b.isActive ? 'opacity-65' : ''
              }`}
            >
              {/* Banner Image Preview Container */}
              <div className="relative aspect-[16/8] w-full bg-[#141414] overflow-hidden">
                <img
                  src={b.desktopImageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    {b.badge ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-red text-white text-[9px] font-mono font-bold tracking-widest uppercase shadow-xs">
                        <Sparkles size={10} /> {b.badge}
                      </span>
                    ) : <span />}
                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-ink text-[10px] font-bold font-mono">
                      PRIORITY #{b.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white text-lg font-black uppercase tracking-tight line-clamp-1 font-sans">
                      {b.title || 'Untitled Banner'}
                    </h3>
                    {b.subtitle && (
                      <p className="text-white/80 text-xs line-clamp-1 mt-0.5">
                        {b.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted font-medium flex items-center gap-1.5">
                    Target:{' '}
                    <span className="font-mono text-ink font-bold bg-beige/60 px-2 py-0.5 rounded">
                      {b.targetUrl}
                    </span>
                    <ExternalLink size={12} className="text-muted" />
                  </span>
                  <span className="text-muted font-medium">
                    CTA:{' '}
                    <span className="text-ink font-bold font-mono text-[11px]">
                      "{b.ctaText}"
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(b.id, b.isActive, b.title)}
                      className="inline-flex items-center gap-2 text-xs font-semibold"
                      title={b.isActive ? 'Active — click to disable' : 'Inactive — click to enable'}
                    >
                      {b.isActive ? (
                        <>
                          <ToggleRight size={24} className="text-emerald-600" />
                          <span className="badge badge-success text-[9px]">Live On Store</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={24} className="text-muted" />
                          <span className="badge badge-neutral text-[9px]">Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="btn-ghost p-2 text-muted hover:text-ink hover:bg-beige"
                      title="Edit banner"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setBannerToDelete(b)}
                      className="btn-ghost p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete banner"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-border/80 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border/70">
              <div>
                <h2 className="text-base font-black uppercase tracking-wide text-ink font-sans">
                  {editId ? 'Edit Hero Banner' : 'Create Hero Banner'}
                </h2>
                <span className="text-xs text-muted">
                  Configure storefront slide graphics, headline copy, and destination URL.
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="admin-label">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wear What Feels Like You"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Subtitle / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Oversized Fits, Heavyweight Cotton, Custom DTG Prints."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="admin-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">CTA Button Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="Shop Men's Wear"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Target URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="/shop or /customizer"
                    value={form.targetUrl}
                    onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                    className="admin-input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Desktop Image URL *</label>
                <input
                  type="text"
                  required
                  placeholder="/hero-banner.png or https://..."
                  value={form.desktopImageUrl}
                  onChange={(e) => setForm({ ...form, desktopImageUrl: e.target.value })}
                  className="admin-input font-mono text-xs"
                />
              </div>

              <div>
                <label className="admin-label">Mobile Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty to inherit desktop image"
                  value={form.mobileImageUrl}
                  onChange={(e) => setForm({ ...form, mobileImageUrl: e.target.value })}
                  className="admin-input font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Badge Text</label>
                  <input
                    type="text"
                    placeholder="EXCLUSIVE DROP"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="admin-input uppercase font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="admin-label">Display Priority</label>
                  <input
                    type="number"
                    min="1"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className="admin-input font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-brand-red focus:ring-brand-red"
                />
                <label htmlFor="bannerIsActive" className="text-xs font-bold text-ink cursor-pointer">
                  Active (display on storefront carousel immediately)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving && <LoaderCircle size={14} className="animate-spin" />}
                  <span>{saving ? 'Saving…' : editId ? 'Update Slide' : 'Publish Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Banner Modal */}
      <ConfirmModal
        isOpen={bannerToDelete !== null}
        title="Delete Hero Banner"
        message={`Are you sure you want to delete "${bannerToDelete?.title || 'Untitled'}"? It will be removed from the storefront hero slider immediately.`}
        confirmText="Delete Banner"
        cancelText="Cancel"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBannerToDelete(null)}
      />
    </div>
  );
}
