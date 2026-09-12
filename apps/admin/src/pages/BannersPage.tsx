import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, LoaderCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';

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
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    api.get<BannerItem[]>('/banners/all')
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
      } else {
        await api.post('/banners', form);
      }
      setShowModal(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/banners/${id}`, { isActive: !currentStatus });
      fetchBanners();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink">Hero Banners</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage carousel banners, announcements, and promotional hero slides on the storefront.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} />
          <span>New Banner</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle size={28} className="animate-spin text-brand-red" />
        </div>
      ) : banners.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <ImageIcon size={36} className="mx-auto text-muted/40 mb-3" />
          <p className="text-sm font-semibold text-ink">No banners created yet</p>
          <p className="text-xs text-muted mt-1">Create your first hero banner for the homepage.</p>
          <button onClick={openCreate} className="btn-primary mt-4">
            <Plus size={14} />
            <span>Create Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`admin-card overflow-hidden flex flex-col justify-between transition-all ${
                !b.isActive ? 'opacity-65' : ''
              }`}
            >
              {/* Banner Image Preview Container */}
              <div className="relative aspect-[16/8] w-full bg-stone-900 overflow-hidden group">
                <img
                  src={b.desktopImageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if broken link
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    {b.badge && (
                      <span className="badge bg-brand-red text-white text-[9px] font-extrabold tracking-wider uppercase">
                        {b.badge}
                      </span>
                    )}
                    <span className="badge bg-white/90 text-ink text-[10px] font-bold font-mono ml-auto">
                      Priority: {b.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white text-base font-extrabold line-clamp-1">{b.title || 'Untitled Banner'}</h3>
                    {b.subtitle && (
                      <p className="text-white/80 text-xs line-clamp-1 mt-0.5">{b.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted font-medium flex items-center gap-1">
                    Link: <span className="font-mono text-ink font-semibold">{b.targetUrl}</span>
                    <ExternalLink size={12} className="text-muted" />
                  </span>
                  <span className="text-muted font-medium">
                    CTA: <span className="text-ink font-semibold">{b.ctaText}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(b.id, b.isActive)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                      title={b.isActive ? 'Active — click to disable' : 'Inactive — click to enable'}
                    >
                      {b.isActive ? (
                        <>
                          <ToggleRight size={22} className="text-brand-red" />
                          <span className="badge badge-success text-[9px]">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={22} className="text-muted" />
                          <span className="badge badge-neutral text-[9px]">Draft</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 text-muted hover:text-ink rounded hover:bg-beige transition-colors"
                      title="Edit banner"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-muted hover:text-danger rounded hover:bg-danger-light transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-bold text-ink">
                {editId ? 'Edit Hero Banner' : 'Create Hero Banner'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted hover:text-ink rounded hover:bg-beige transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="admin-label">Headline Title</label>
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
                  <label className="admin-label">CTA Button Label</label>
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
                  <label className="admin-label">Target URL</label>
                  <input
                    type="text"
                    required
                    placeholder="/shop or /custom/design"
                    value={form.targetUrl}
                    onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                    className="admin-input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Desktop Image URL</label>
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
                  placeholder="Leave empty to use desktop image"
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
                    className="admin-input"
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

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-border text-brand-red focus:ring-brand-red h-4 w-4"
                />
                <label htmlFor="bannerIsActive" className="text-xs font-semibold text-ink cursor-pointer">
                  Active (display on storefront)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving && <LoaderCircle size={14} className="animate-spin" />}
                  <span>{saving ? 'Saving…' : editId ? 'Update Banner' : 'Create Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
