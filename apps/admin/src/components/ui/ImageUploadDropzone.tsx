import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  LoaderCircle,
  CheckCircle2,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api/client';
import { useToast } from './Toast';
import { useQueryClient } from '@tanstack/react-query';
import { resolveImageUrl } from '../../lib/utils';

export interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  category?: 'products' | 'designs' | 'banners' | 'lookbook';
  aspectRatio?: 'portrait' | 'wide' | 'square' | 'banner' | 'auto';
  className?: string;
  allowManualUrl?: boolean;
}

export function ImageUploadDropzone({
  value = '',
  onChange,
  label,
  helperText,
  category = 'products',
  aspectRatio = 'wide',
  className = '',
  allowManualUrl = true,
}: ImageUploadDropzoneProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [localBlobUrl]);

  // Reset failure if external value changes
  useEffect(() => {
    setImgLoadFailed(false);
  }, [value]);

  const resolvedValue = resolveImageUrl(value);
  // Display local blob if just uploaded, otherwise resolved server URL
  const displayImage = localBlobUrl || resolvedValue;

  const aspectRatioClass = {
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
    square: 'aspect-square',
    banner: 'aspect-[21/9] min-h-[140px]',
    auto: 'h-48',
  }[aspectRatio];

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file format',
        description: 'Please select a valid image file (JPG, PNG, WEBP, SVG, GIF).',
        variant: 'danger',
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum upload file size is 25MB.',
        variant: 'danger',
      });
      return;
    }

    // Instant local preview for zero lag & guaranteed rendering
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
    }
    const newBlobUrl = URL.createObjectURL(file);
    setLocalBlobUrl(newBlobUrl);
    setImgLoadFailed(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('name', file.name);

      const res = await api.upload<{ success: boolean; url: string }>('/media/upload', formData);
      const serverUrl = res?.url || (res as any)?.data?.url || (res as any)?.asset?.url || '';

      if (serverUrl) {
        onChange(serverUrl);
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'media-assets'] });

      toast({
        title: 'Image uploaded successfully!',
        description: 'Asset is now linked and saved to storage.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload image to server.',
        variant: 'danger',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
    }
    setLocalBlobUrl(null);
    setImgLoadFailed(false);
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Header */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-muted">{label}</label>
          {displayImage && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} /> Image Ready
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Image Present State */}
      {displayImage ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group overflow-hidden rounded-xl border-2 transition-all ${
            isDragActive
              ? 'border-brand-red bg-[#FDF0EE]/60 ring-2 ring-brand-red/30'
              : 'border-border bg-[#FAF8F5]'
          }`}
        >
          <div
            className={`relative w-full ${aspectRatioClass} flex items-center justify-center overflow-hidden bg-[#EDE0CC]`}
          >
            {!imgLoadFailed ? (
              <img
                src={displayImage}
                alt="Uploaded Preview"
                crossOrigin="anonymous"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => {
                  // If remote failed and local blob exists, try using local blob
                  if (localBlobUrl && displayImage !== localBlobUrl) {
                    setImgLoadFailed(false);
                  } else {
                    setImgLoadFailed(true);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-muted">
                <AlertCircle size={28} className="text-danger" />
                <p className="text-xs font-bold text-ink">Image Display Issue</p>
                <p className="text-[10px] text-muted max-w-[200px]">
                  Could not load preview. Click below to re-upload.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm border border-border hover:border-brand-red"
                >
                  Choose New File
                </button>
              </div>
            )}

            {/* Hover overlay with action buttons */}
            {!imgLoadFailed && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-ink shadow hover:bg-brand-sand transition"
                  >
                    {isUploading ? (
                      <LoaderCircle size={14} className="animate-spin text-brand-red" />
                    ) : (
                      <RefreshCw size={14} className="text-brand-red" />
                    )}
                    {isUploading ? 'Uploading...' : 'Replace Image'}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-3 py-2 text-xs font-bold text-white shadow hover:bg-danger/90 transition"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>

                <p className="text-[11px] font-medium text-white/80">
                  Or drag & drop another photo right here to replace
                </p>
              </div>
            )}

            {/* In-flight upload spinner badge */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
                <LoaderCircle size={28} className="animate-spin text-brand-red" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Saving file to storage...
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State: Drag & Drop Zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group cursor-pointer rounded-xl border-2 border-dashed transition-all p-6 text-center flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-brand-red bg-[#FDF0EE] ring-4 ring-brand-red/10 scale-[1.01]'
              : 'border-border bg-[#FAF8F5]/80 hover:border-brand-red/60 hover:bg-[#FDF0EE]/30'
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 ${
              isDragActive ? 'scale-110 text-brand-red' : 'text-brand-red group-hover:scale-110'
            }`}
          >
            {isUploading ? (
              <LoaderCircle size={24} className="animate-spin text-brand-red" />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>

          <p className="mt-3 text-xs font-bold text-ink">
            {isUploading
              ? 'Uploading Image to Server...'
              : isDragActive
              ? 'Drop Image Here Now!'
              : 'Drag & Drop Image Here, or Click to Browse'}
          </p>

          <p className="text-[11px] text-muted mt-1">
            {helperText || 'Supports PNG, JPG, WEBP, SVG (Up to 25MB)'}
          </p>
        </div>
      )}

      {/* Discreet URL Fallback option */}
      {allowManualUrl && (
        <div className="pt-1">
          {!showUrlInput && !displayImage ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-[11px] text-muted hover:text-ink font-medium inline-flex items-center gap-1 hover:underline transition"
            >
              <LinkIcon size={12} />
              Have an image link instead? Paste URL
            </button>
          ) : showUrlInput ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted">Image Direct URL:</span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="text-[10px] text-muted hover:underline"
                >
                  Hide URL Input
                </button>
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setLocalBlobUrl(null);
                  setImgLoadFailed(false);
                  onChange(e.target.value);
                }}
                placeholder="https://..."
                className="input-admin text-xs font-mono py-1.5"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
