import { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Check,
  Smartphone,
  Monitor,
  UploadCloud,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

export interface BannerItem {
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
}

export const defaultHeroBanners: BannerItem[] = [
  {
    id: 'ban-1',
    title: 'Wear What Feels Like You',
    subtitle: 'Streetwear silhouettes. Heavyweight 240 GSM combed cotton.',
    ctaText: "Shop Men's Wear",
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner.png',
    mobileImageUrl: '/hero-banner.png',
    badge: 'DROP 01 • OVERSIZED FIT',
    priority: 1,
    isActive: true,
  },
  {
    id: 'ban-2',
    title: 'Everyday Luxury. Built to Last.',
    subtitle: 'Minimalist cuts crafted from premium combed cotton. Architectural edit.',
    ctaText: 'Explore Drop 02',
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner-2.jpg',
    mobileImageUrl: '/hero-banner-2.jpg',
    badge: 'STUDIO DROP • DROP 02',
    priority: 2,
    isActive: true,
  },
  {
    id: 'ban-3',
    title: 'Tailored Statement Menswear',
    subtitle: 'Signature back prints, relaxed drape, and confident proportions.',
    ctaText: 'Shop The Look',
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner-3.jpg',
    mobileImageUrl: '/hero-banner-3.jpg',
    badge: 'CAMPAIGN 2026 • SIGNATURE FIT',
    priority: 3,
    isActive: true,
  },
  {
    id: 'ban-4',
    title: 'Natural Earth Tones & Minimalism',
    subtitle: 'Warm cream streetwear essentials with precision embroidery.',
    ctaText: 'Discover Essentials',
    targetUrl: '/shop',
    desktopImageUrl: '/hero-banner-4.jpg',
    mobileImageUrl: '/hero-banner-4.jpg',
    badge: 'LIMITED EDITION • NATURAL PALETTE',
    priority: 4,
    isActive: true,
  },
  {
    id: 'ban-5',
    title: 'Heavyweight Crimson Collection',
    subtitle: 'Ultra-warm drop-shoulder hoodies with iconic distressed B artwork.',
    ctaText: 'Create Your Design',
    targetUrl: '/customize',
    desktopImageUrl: '/hero-banner-5.jpg',
    mobileImageUrl: '/hero-banner-5.jpg',
    badge: 'CUSTOM STUDIO • HOODIES & TEES',
    priority: 5,
    isActive: true,
  },
];

const PRESET_IMAGES = [
  { name: 'Drop 01 Graphic B Tee', url: '/hero-banner.png' },
  { name: 'Studio Architecture Arch', url: '/hero-banner-2.jpg' },
  { name: 'Campaign Bag & Minimal Studio', url: '/hero-banner-3.jpg' },
  { name: 'Natural Cream Embroidered Tee', url: '/hero-banner-4.jpg' },
  { name: 'Crimson Red Heavyweight Hoodie', url: '/hero-banner-5.jpg' },
];

const STORAGE_KEY = 'bingooo_hero_banners';

export function BannersPage() {
  const { toast } = useToast();

  const [banners, setBanners] = useState<BannerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultHeroBanners;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('DROP 01 • OVERSIZED FIT');
  const [ctaText, setCtaText] = useState("Shop Men's Wear");
  const [targetUrl, setTargetUrl] = useState('/shop');
  const [desktopImage, setDesktopImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [priority, setPriority] = useState('1');
  const [isActive, setIsActive] = useState(true);

  // Sync with backend on mount
  useEffect(() => {
    api.get<BannerItem[]>('/banners/all')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {
        // Fallback to local storage / defaults
      });
  }, []);

  const saveToStorageAndState = (updated: BannerItem[]) => {
    const sorted = [...updated].sort((a, b) => a.priority - b.priority);
    setBanners(sorted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch {
      // ignore
    }
  };

  const openCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge(`DROP 0${banners.length + 1} • LIMITED`);
    setCtaText("Shop Men's Wear");
    setTargetUrl('/shop');
    setDesktopImage('/hero-banner.png');
    setMobileImage('/hero-banner.png');
    setPriority(String(banners.length + 1));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setBadge(b.badge || 'EXCLUSIVE DROP');
    setCtaText(b.ctaText);
    setTargetUrl(b.targetUrl);
    setDesktopImage(b.desktopImageUrl);
    setMobileImage(b.mobileImageUrl);
    setPriority(String(b.priority));
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDesktopImage(result);
      if (!mobileImage) setMobileImage(result);
      toast({ title: 'Image loaded from local file', variant: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDesktop = desktopImage || '/hero-banner.png';
    const finalMobile = mobileImage || finalDesktop;

    if (editingBanner) {
      const updatedBanner: BannerItem = {
        ...editingBanner,
        title,
        subtitle,
        badge,
        ctaText,
        targetUrl,
        desktopImageUrl: finalDesktop,
        mobileImageUrl: finalMobile,
        priority: Number(priority),
        isActive,
      };

      const updated = banners.map((b) => (b.id === editingBanner.id ? updatedBanner : b));
      saveToStorageAndState(updated);

      // Async backend sync
      api.put(`/banners/${editingBanner.id}`, updatedBanner).catch(() => {});
      toast({ title: 'Banner updated successfully', variant: 'success' });
    } else {
      const newBanner: BannerItem = {
        id: `ban-${Date.now()}`,
        title,
        subtitle,
        badge,
        ctaText,
        targetUrl,
        desktopImageUrl: finalDesktop,
        mobileImageUrl: finalMobile,
        priority: Number(priority),
        isActive,
      };

      const updated = [...banners, newBanner];
      saveToStorageAndState(updated);

      // Async backend sync
      api.post('/banners', newBanner).catch(() => {});
      toast({ title: 'New hero banner added', variant: 'success' });
    }
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    saveToStorageAndState(updated);
    const target = updated.find((b) => b.id === id);
    if (target) {
      api.patch(`/banners/${id}`, { isActive: target.isActive }).catch(() => {});
    }
    toast({ title: 'Banner visibility toggled', variant: 'success' });
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete banner "${bannerTitle}"?`)) {
      return;
    }
    const updated = banners.filter((b) => b.id !== id);
    saveToStorageAndState(updated);
    api.delete(`/banners/${id}`).catch(() => {});
    toast({ title: `Banner "${bannerTitle}" deleted`, variant: 'success' });
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all hero banners to the 5 official Bingooo images?')) {
      saveToStorageAndState(defaultHeroBanners);
      toast({ title: 'Reset to 5 official hero banners', variant: 'success' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <ImageIcon size={14} /> Storefront Hero Management
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Hero Banners & Auto-Swipe Showcase ({banners.length} images)
          </h2>
          <p className="text-xs text-muted">
            Configure homepage hero carousel images, typography, CTA buttons, and responsive view. Auto-swipes left one by one on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={resetToDefaults} className="btn-secondary text-xs" title="Reset to default 5 images">
            <RefreshCw size={14} /> Reset 5 Images
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add Hero Image
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="card-admin overflow-hidden border border-border p-6 space-y-4 hover:border-brand-red/40 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7EEDB] font-black text-xs text-brand-red">
                  0{index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-ink text-base">{banner.title}</h3>
                    {banner.badge && (
                      <span className="rounded-full bg-[#171717] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                        {banner.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{banner.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(banner.id)}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-colors ${
                    banner.isActive
                      ? 'bg-success/15 text-success'
                      : 'bg-muted/15 text-muted'
                  }`}
                >
                  {banner.isActive ? 'Active on Storefront' : 'Disabled'}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="p-2 text-muted hover:text-ink rounded-lg border border-border hover:border-brand-red transition-colors"
                  title="Edit Banner"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id, banner.title)}
                  className="p-2 text-muted hover:text-danger rounded-lg border border-border hover:border-danger transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Visual Previews */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Desktop Preview */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <Monitor size={14} /> Desktop Crisp View (3:2 Ratio)
                </div>
                <div className="relative aspect-[3/2] max-h-[280px] w-full overflow-hidden rounded-xl border border-border bg-[#F0E7DF]">
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                    <h4 className="text-sm font-black">{banner.title}</h4>
                    <span className="mt-1 inline-block w-fit rounded-lg bg-brand-red px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                      {banner.ctaText} →
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <Smartphone size={14} /> Mobile View
                </div>
                <div className="relative aspect-[4/5] max-h-[280px] w-full overflow-hidden rounded-xl border border-border bg-[#F0E7DF]">
                  <img
                    src={banner.mobileImageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                    <h5 className="text-xs font-black">{banner.title}</h5>
                    <span className="mt-1 text-[9px] text-brand-red font-bold uppercase">
                      {banner.ctaText}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target URL & Priority */}
            <div className="flex flex-wrap items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
              <span className="font-mono">Links to: <strong>{banner.targetUrl}</strong></span>
              <span>Priority Order: <strong>#{banner.priority}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Hero Image Banner' : 'Add New Hero Banner'}
        description="Configure banner headline, photography, target URL, and storefront order."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-muted mb-2">
              <Sparkles size={13} className="inline mr-1 text-brand-red" />
              Quick Select Preset High-Resolution Image:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.url}
                  onClick={() => {
                    setDesktopImage(preset.url);
                    setMobileImage(preset.url);
                  }}
                  className={`group flex flex-col items-center p-1.5 rounded-lg border text-left transition-all ${
                    desktopImage === preset.url
                      ? 'border-brand-red bg-brand-red/5 ring-1 ring-brand-red'
                      : 'border-border hover:border-brand-red/50 bg-white'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="h-16 w-full object-cover rounded"
                  />
                  <span className="mt-1 text-[10px] font-bold text-ink line-clamp-1">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-muted">
                Banner Headline *
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Wear What Feels Like You"
                  className="input-admin mt-1"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Badge / Tag
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="DROP 01 • OVERSIZED FIT"
                  className="input-admin mt-1"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Display Order Priority
                <input
                  type="number"
                  min="1"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-admin mt-1"
                />
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-muted">
                Sub-headline / Description
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Streetwear silhouettes. Heavyweight 240 GSM combed cotton."
                  className="input-admin mt-1"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                CTA Button Text
                <input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Shop Men's Wear"
                  className="input-admin mt-1"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Target URL Link
                <input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="/shop or /customize"
                  className="input-admin mt-1"
                />
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-muted">
                Image URL (or select preset above)
                <input
                  required
                  value={desktopImage}
                  onChange={(e) => {
                    setDesktopImage(e.target.value);
                    if (!mobileImage) setMobileImage(e.target.value);
                  }}
                  placeholder="/hero-banner.png or https://..."
                  className="input-admin mt-1 font-mono text-xs"
                />
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-muted">
                Or Upload Local Image:
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-ink hover:border-brand-red">
                    <UploadCloud size={16} /> Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {desktopImage && (
                    <span className="text-xs text-muted truncate max-w-[300px]">
                      Selected: {desktopImage.slice(0, 45)}...
                    </span>
                  )}
                </div>
              </label>
            </div>

            <div className="sm:col-span-2 flex items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-brand-red"
                />
                  Active immediately on storefront auto-swipe
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Banner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
