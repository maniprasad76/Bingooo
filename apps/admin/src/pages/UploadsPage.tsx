import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderUp,
  Search,
  Upload,
  Image as ImageIcon,
  Copy,
  Trash2,
  ExternalLink,
  LoaderCircle,
  Plus,
  UploadCloud,
  X,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatDate, resolveImageUrl } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export interface MediaAsset {
  id: string;
  name: string;
  category: 'products' | 'designs' | 'banners' | 'lookbook';
  url: string;
  sizeBytes: number;
  dimensions?: string;
  uploaded_at: string;
}

export function UploadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<'products' | 'designs' | 'banners' | 'lookbook'>('products');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: assets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ['admin', 'media-assets', categoryFilter, search],
    queryFn: () => api.get<MediaAsset[]>('/media/assets', { category: categoryFilter, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.post(`/media/assets/${id}/delete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-assets'] });
      toast({ title: 'Asset removed from storage', variant: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'danger' });
    },
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Media URL copied to clipboard', variant: 'success' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this media asset?')) {
      deleteMutation.mutate(id);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum upload file size is 25MB.',
        variant: 'danger',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedUploadCategory);
    formData.append('name', file.name);

    setIsUploading(true);
    try {
      const response = await api.upload<{ success: boolean; url: string; asset: MediaAsset }>('/media/upload', formData);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-assets'] });
      toast({
        title: 'File uploaded successfully!',
        description: `${file.name} is now stored and ready to use.`,
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload file to server.',
        variant: 'danger',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadFile(file));
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <FolderUp size={14} /> Cloud & Local Storage
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Media Asset Library & File Storage
          </h2>
          <p className="text-xs text-muted">
            Upload and manage high-resolution garment imagery, customer custom graphics, lookbooks, and hero banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedUploadCategory}
            onChange={(e) => setSelectedUploadCategory(e.target.value as any)}
            className="input-admin text-xs py-2 w-36"
            title="Choose category for new uploads"
          >
            <option value="products">Garment Product</option>
            <option value="designs">Custom Design</option>
            <option value="banners">Hero Banner</option>
            <option value="lookbook">Editorial Lookbook</option>
          </select>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary"
          >
            {isUploading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload New Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragOver
            ? 'border-brand-red bg-[#FDF0EE]/80 scale-[1.005]'
            : 'border-border bg-white hover:border-brand-red/50 hover:bg-[#F7EEDB]/20'
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7EEDB] text-brand-red transition-transform group-hover:scale-110">
          <UploadCloud size={28} />
        </div>
        <h3 className="mt-3 text-sm font-black text-ink">
          Drag & Drop Images Here, or <span className="text-brand-red underline">Browse Files</span>
        </h3>
        <p className="mt-1 text-xs text-muted">
          Supports JPG, PNG, WEBP, and SVG (up to 25MB). Uploads will be categorized as{' '}
          <span className="font-bold text-ink uppercase">{selectedUploadCategory}</span>.
        </p>
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
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3 card-admin p-12 text-muted">
          <LoaderCircle size={24} className="animate-spin text-brand-red" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading media assets...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="card-admin p-12 text-center">
          <ImageIcon size={40} className="mx-auto mb-3 text-muted/50" />
          <h3 className="text-sm font-bold text-ink">No media assets found</h3>
          <p className="text-xs text-muted mt-1">Upload an image above to populate the library.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group card-admin overflow-hidden border border-border transition-all hover:border-brand-red/40 hover:shadow-md"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE0CC]">
                <img
                  src={resolveImageUrl(asset.url)}
                  alt={asset.name}
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/hero-banner.png';
                  }}
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
                  {asset.uploaded_at && <span>{formatDate(asset.uploaded_at)}</span>}
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
                      title="Open full size in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1 text-muted hover:text-danger rounded"
                      title="Delete asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
