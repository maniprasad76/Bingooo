import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderUp,
  Search,
  Upload,
  Image as ImageIcon,
  Copy,
  Trash2,
  ExternalLink,
  Filter,
  Check,
  File,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

interface MediaAsset {
  id: string;
  name: string;
  category: 'products' | 'designs' | 'banners' | 'lookbook';
  url: string;
  sizeBytes: number;
  dimensions?: string;
  uploaded_at: string;
}

const mockAssets: MediaAsset[] = [
  {
    id: 'asset-1',
    name: 'heavyweight-tee-black-front.jpg',
    category: 'products',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
    sizeBytes: 840000,
    dimensions: '1600x2000',
    uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'asset-2',
    name: 'oversized-hoodie-bone-white.jpg',
    category: 'products',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
    sizeBytes: 1200000,
    dimensions: '1600x2000',
    uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'asset-3',
    name: 'summer-drop-hero-banner-desktop.jpg',
    category: 'banners',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop',
    sizeBytes: 2450000,
    dimensions: '2880x1200',
    uploaded_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'asset-4',
    name: 'tokyo-cyber-custom-graphic.png',
    category: 'designs',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
    sizeBytes: 650000,
    dimensions: '1200x1200',
    uploaded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'asset-5',
    name: 'cargo-pants-styling-lookbook.jpg',
    category: 'lookbook',
    url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop',
    sizeBytes: 1800000,
    dimensions: '1800x2400',
    uploaded_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

export function UploadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<MediaAsset[]>(mockAssets);
  const [isUploading, setIsUploading] = useState(false);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'CDN URL copied to clipboard', variant: 'success' });
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Asset deleted from Cloudflare R2', variant: 'success' });
  };

  const handleMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newAsset: MediaAsset = {
        id: `asset-${Date.now()}`,
        name: `garment-asset-${Date.now().toString().slice(-4)}.jpg`,
        category: (categoryFilter === 'all' ? 'products' : categoryFilter) as any,
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop',
        sizeBytes: 980000,
        dimensions: '1600x2000',
        uploaded_at: new Date().toISOString(),
      };
      setAssets((prev) => [newAsset, ...prev]);
      setIsUploading(false);
      toast({ title: 'New media asset stored in R2 bucket', variant: 'success' });
    }, 800);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filtered = assets.filter((a) => {
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <FolderUp size={14} /> Cloudflare R2 Storage
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Media Asset Library & File Storage
          </h2>
          <p className="text-xs text-muted">
            Manage high-resolution garment imagery, customer print uploads, and campaign lookbooks.
          </p>
        </div>

        <button
          onClick={handleMockUpload}
          disabled={isUploading}
          className="btn-primary"
        >
          <Upload size={16} />
          {isUploading ? 'Uploading to R2...' : 'Upload Media Asset'}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'All Files' },
            { key: 'products', label: 'Products' },
            { key: 'designs', label: 'Custom Designs' },
            { key: 'banners', label: 'Banners' },
            { key: 'lookbook', label: 'Lookbook' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                categoryFilter === tab.key
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-0 flex-1 sm:min-w-[240px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="group card-admin overflow-hidden border border-border transition-all hover:border-brand-red/40 hover:shadow-md"
          >
            {/* Image Preview Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE0CC]">
              <img
                src={asset.url}
                alt={asset.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {asset.category}
              </span>
            </div>

            {/* Meta & Actions */}
            <div className="p-4 space-y-2">
              <p className="truncate text-xs font-bold text-ink" title={asset.name}>
                {asset.name}
              </p>
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>{formatFileSize(asset.sizeBytes)}</span>
                {asset.dimensions && <span>{asset.dimensions}</span>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  onClick={() => handleCopyUrl(asset.url)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-ink hover:text-brand-red transition-colors"
                >
                  <Copy size={13} /> Copy URL
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-muted hover:text-ink rounded"
                    title="Open full size"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 text-muted hover:text-danger rounded"
                    title="Delete file"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
