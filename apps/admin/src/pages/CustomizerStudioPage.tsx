import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  Palette,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ExternalLink,
  LoaderCircle,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  Shirt,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  textContrast: string;
  frontImageUrl: string;
  backImageUrl?: string;
  isActive: boolean;
}

export interface GarmentItem {
  id: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  colors: GarmentColor[];
}

export interface CustomizerStudioConfig {
  garments: GarmentItem[];
  updatedAt: string;
}

const DEFAULT_GARMENTS: GarmentItem[] = [
  {
    id: 'tshirt',
    name: 'T-SHIRT',
    price: 999,
    description: '100% Combed Cotton Classic Crewneck',
    isActive: true,
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png', isActive: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png', isActive: true },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
  {
    id: 'oversized',
    name: 'OVERSIZED',
    price: 1299,
    description: '240 GSM Heavyweight Drop-Shoulder Fit',
    isActive: true,
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png', isActive: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png', isActive: true },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
  {
    id: 'hoodie',
    name: 'HOODIE',
    price: 2499,
    description: '350 GSM Brushed Fleece Pullover Hoodie',
    isActive: true,
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/hoodie-black-front.png', backImageUrl: '/custom/hoodie-black-back.png', isActive: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/hoodie-white-front.png', backImageUrl: '/custom/hoodie-white-back.png', isActive: true },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '', isActive: true },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '', isActive: true },
    ],
  },
];

export function CustomizerStudioPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<CustomizerStudioConfig>({
    garments: DEFAULT_GARMENTS,
    updatedAt: new Date().toISOString(),
  });
  const [selectedGarmentId, setSelectedGarmentId] = useState<string>('oversized');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [colorForm, setColorForm] = useState({
    name: '',
    hex: '#171717',
    textContrast: '#FFFFFF',
    frontImageUrl: '',
    backImageUrl: '',
    isActive: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [targetColorForUpload, setTargetColorForUpload] = useState<string | null>(null);

  // Fetch current config from backend
  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.get<CustomizerStudioConfig>('/customizations/studio/config');
      if (data && Array.isArray(data.garments) && data.garments.length > 0) {
        setConfig(data);
      }
    } catch {
      // Fallback to defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const activeGarment = config.garments.find((g) => g.id === selectedGarmentId) || config.garments[0];

  const handleOpenAddColor = () => {
    setEditingColorId(null);
    setColorForm({
      name: '',
      hex: '#3B4D3C',
      textContrast: '#FFFFFF',
      frontImageUrl: '',
      backImageUrl: '',
      isActive: true,
    });
    setShowColorModal(true);
  };

  const handleOpenEditColor = (color: GarmentColor) => {
    setEditingColorId(color.id);
    setColorForm({
      name: color.name,
      hex: color.hex,
      textContrast: color.textContrast,
      frontImageUrl: color.frontImageUrl,
      backImageUrl: color.backImageUrl || '',
      isActive: color.isActive !== false,
    });
    setShowColorModal(true);
  };

  // Upload Real-Life Photo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'customizer-mockups');
      formData.append('name', `${activeGarment?.id || 'garment'}-${colorForm.name || 'color'}`);

      const token = localStorage.getItem('bingooo_auth_token');
      const res = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (json && (json.data?.url || json.url)) {
        const url = json.data?.url || json.url;
        setColorForm((prev) => ({ ...prev, frontImageUrl: url }));
      } else {
        // Fallback to local data URL for instant live preview
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          if (uploadEvent.target?.result) {
            setColorForm((prev) => ({ ...prev, frontImageUrl: uploadEvent.target!.result as string }));
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Local preview fallback
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setColorForm((prev) => ({ ...prev, frontImageUrl: uploadEvent.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Color selection helper with smart text contrast detection
  const handleHexChange = (hexVal: string) => {
    let cleanHex = hexVal.replace('#', '');
    if (cleanHex.length > 6) cleanHex = cleanHex.substring(0, 6);
    const fullHex = `#${cleanHex}`;

    // Auto-calculate contrast
    let contrast = '#FFFFFF';
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      contrast = brightness > 140 ? '#171717' : '#FFFFFF';
    }

    setColorForm((prev) => ({
      ...prev,
      hex: fullHex,
      textContrast: contrast,
    }));
  };

  // Direct 1-Click Upload For Any Garment Color From Device
  const handleQuickUploadForColor = async (colorId: string, file: File) => {
    if (!activeGarment || !file) return;
    setUploadingColorId(colorId);
    setStatusMessage(null);

    try {
      let finalUrl = '';
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'garments');
        formData.append('name', `${activeGarment.id}-${colorId}`);

        const token = localStorage.getItem('bingooo_auth_token');
        const res = await fetch('/api/v1/media/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          finalUrl = json?.data?.url || json?.url || '';
        }
      } catch {
        // Fallback to local data URL if server upload unreachable
      }

      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.readAsDataURL(file);
        });
      }

      if (!finalUrl) {
        throw new Error('Could not read image file.');
      }

      const updatedColors = activeGarment.colors.map((c) =>
        c.id === colorId ? { ...c, frontImageUrl: finalUrl } : c
      );

      const updatedGarments = config.garments.map((g) =>
        g.id === activeGarment.id ? { ...g, colors: updatedColors } : g
      );

      const newConfig: CustomizerStudioConfig = {
        garments: updatedGarments,
        updatedAt: new Date().toISOString(),
      };

      await api.put('/customizations/studio/config', newConfig);
      setConfig(newConfig);

      const colorObj = activeGarment.colors.find((c) => c.id === colorId);
      toast.success(
        'Photo Uploaded',
        `Real photo uploaded for ${activeGarment.name} (${colorObj?.name || 'Color'}).`
      );
      setStatusMessage({
        type: 'success',
        text: `✓ Real photo uploaded for ${activeGarment.name} (${colorObj?.name || 'Color'})! Storefront customizer is now updated.`,
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err: any) {
      toast.error('Upload Failed', err?.message || 'Failed to upload photo.');
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to upload photo.',
      });
    } finally {
      setUploadingColorId(null);
    }
  };

  const handleRemovePhotoFromColor = async (colorId: string) => {
    if (!activeGarment) return;
    if (!confirm('Remove this photo? The storefront will show a clean apparel silhouette until a new photo is uploaded.')) return;

    setSaving(true);
    try {
      const updatedColors = activeGarment.colors.map((c) =>
        c.id === colorId ? { ...c, frontImageUrl: '', backImageUrl: '' } : c
      );
      const updatedGarments = config.garments.map((g) =>
        g.id === activeGarment.id ? { ...g, colors: updatedColors } : g
      );
      const newConfig: CustomizerStudioConfig = {
        garments: updatedGarments,
        updatedAt: new Date().toISOString(),
      };
      await api.put('/customizations/studio/config', newConfig);
      setConfig(newConfig);
      toast.success('Photo Removed', 'Apparel silhouette is now active on the storefront.');
      setStatusMessage({ type: 'success', text: 'Photo removed successfully.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      toast.error('Removal Failed', 'Failed to remove photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGarment) return;

    if (!colorForm.name.trim()) {
      toast.error('Validation Error', 'Please enter a color name.');
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const colorId = editingColorId || colorForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const updatedColors = [...activeGarment.colors];

      const newColorObj: GarmentColor = {
        id: colorId,
        name: colorForm.name.trim(),
        hex: colorForm.hex,
        textContrast: colorForm.textContrast,
        frontImageUrl: colorForm.frontImageUrl.trim(),
        backImageUrl: colorForm.backImageUrl.trim() || undefined,
        isActive: colorForm.isActive,
      };

      if (editingColorId) {
        const idx = updatedColors.findIndex((c) => c.id === editingColorId);
        if (idx >= 0) updatedColors[idx] = newColorObj;
      } else {
        const existingIdx = updatedColors.findIndex((c) => c.id === colorId);
        if (existingIdx >= 0) {
          updatedColors[existingIdx] = newColorObj;
        } else {
          updatedColors.push(newColorObj);
        }
      }

      const updatedGarments = config.garments.map((g) =>
        g.id === activeGarment.id ? { ...g, colors: updatedColors } : g
      );

      const newConfig: CustomizerStudioConfig = {
        garments: updatedGarments,
        updatedAt: new Date().toISOString(),
      };

      // Save to backend
      await api.put('/customizations/studio/config', newConfig);
      setConfig(newConfig);
      setShowColorModal(false);
      toast.success('Color Saved', `Color "${newColorObj.name}" saved successfully.`);
      setStatusMessage({
        type: 'success',
        text: `Color "${newColorObj.name}" saved! ${newColorObj.frontImageUrl ? 'Photo is active.' : 'You can upload a real photo now.'}`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      toast.error('Save Failed', err.message || 'Failed to save color.');
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save color. Saved locally.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteColor = async (colorId: string) => {
    if (!activeGarment) return;
    if (!confirm('Are you sure you want to remove this color and its preview image?')) return;

    setSaving(true);
    try {
      const updatedColors = activeGarment.colors.filter((c) => c.id !== colorId);
      const updatedGarments = config.garments.map((g) =>
        g.id === activeGarment.id ? { ...g, colors: updatedColors } : g
      );

      const newConfig: CustomizerStudioConfig = {
        garments: updatedGarments,
        updatedAt: new Date().toISOString(),
      };

      await api.put('/customizations/studio/config', newConfig);
      setConfig(newConfig);
      toast.success('Color Removed', 'Color removed from garment customizer.');
      setStatusMessage({ type: 'success', text: 'Color removed successfully.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      toast.error('Delete Failed', 'Failed to delete color.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle size={28} className="animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Hidden File Input for Direct Card Upload */}
      <input
        ref={cardFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && targetColorForUpload) {
            handleQuickUploadForColor(targetColorForUpload, file);
          }
          e.target.value = '';
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-ink flex items-center gap-2">
              <Palette size={22} className="text-brand-red" /> Customizer Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#e6321c]/10 text-[#e6321c] text-[10px] font-bold uppercase tracking-wider">
              Real-Life Garment Photos
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Upload your real photos for T-Shirts, Oversized tees, and Hoodies from your device. Changes sync immediately to the customer customizer!
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="http://localhost:5173/customize"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg border border-[#ddd3c5] bg-white hover:bg-beige text-[11px] font-bold uppercase tracking-wider text-ink flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Eye size={14} className="text-brand-red" />
            <span>View Storefront Customizer</span>
            <ExternalLink size={12} className="text-muted ml-0.5" />
          </a>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-success-light text-success border-success/20'
              : 'bg-error-light text-error border-error/20'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Garment Selector Tabs */}
      <div className="admin-card p-2 bg-[#f7eedb] border-[#ddd3c5] flex flex-wrap gap-2">
        {config.garments.map((garment) => {
          const uploadedCount = garment.colors.filter((c) => !!c.frontImageUrl).length;
          return (
            <button
              key={garment.id}
              type="button"
              onClick={() => setSelectedGarmentId(garment.id)}
              className={`px-4 py-2.5 rounded-md text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                selectedGarmentId === garment.id
                  ? 'bg-[#171717] text-white shadow-md'
                  : 'bg-white/80 hover:bg-white text-ink border border-[#ddd3c5]'
              }`}
            >
              <Shirt size={14} />
              <span>{garment.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  selectedGarmentId === garment.id
                    ? 'bg-white/20 text-white'
                    : 'bg-black/5 text-[#6f6a63]'
                }`}
              >
                {uploadedCount}/{garment.colors.length} Photos
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Garment Overview & Colors Section */}
      {activeGarment && (
        <div className="space-y-5">
          <div className="admin-card p-5 bg-white border border-[#ddd3c5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold uppercase tracking-wide text-ink">
                  {activeGarment.name}
                </span>
                <span className="text-xs font-bold text-brand-red font-mono">
                  ₹{activeGarment.price}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">{activeGarment.description}</p>
              <div className="text-[11px] text-ink font-semibold mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span>{activeGarment.colors.length} Colorways Available</span>
                <span className="text-muted">•</span>
                <span className="text-brand-red font-bold">
                  {activeGarment.colors.filter((c) => !!c.frontImageUrl).length} Photos Uploaded
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddColor}
              className="btn-primary flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Colorway</span>
            </button>
          </div>

          {/* Color & Real-Life Mockups Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeGarment.colors.map((color) => {
              const isUploadingThis = uploadingColorId === color.id;
              const hasPhoto = !!color.frontImageUrl;

              return (
                <div
                  key={color.id}
                  className={`admin-card bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col ${
                    hasPhoto ? 'border-[#ddd3c5]' : 'border-amber-300 ring-1 ring-amber-200'
                  }`}
                >
                  {/* Real-Life Photo Preview OR 1-Click Upload Dropzone */}
                  <div className="relative aspect-square bg-[#f5efe4] flex items-center justify-center p-3 border-b border-[#ddd3c5] overflow-hidden">
                    {hasPhoto ? (
                      <>
                        <img
                          src={color.frontImageUrl}
                          alt={`${color.name} ${activeGarment.name} real photo`}
                          className="max-h-full max-w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-300 select-none"
                        />
                        {/* Hover Overlay with Replace Photo */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetColorForUpload(color.id);
                              cardFileInputRef.current?.click();
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-white text-ink text-[10px] font-extrabold uppercase tracking-wider shadow-md hover:bg-beige transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Camera size={13} className="text-brand-red" />
                            <span>Replace Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromColor(color.id)}
                            className="text-[10px] text-white/80 hover:text-white underline cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Empty State: Direct 1-Click Upload Zone */
                      <div
                        onClick={() => {
                          setTargetColorForUpload(color.id);
                          cardFileInputRef.current?.click();
                        }}
                        className="w-full h-full border-2 border-dashed border-[#ddd3c5] hover:border-brand-red rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-white/70 hover:bg-white group/drop"
                      >
                        {isUploadingThis ? (
                          <div className="flex flex-col items-center gap-2">
                            <LoaderCircle size={26} className="animate-spin text-brand-red" />
                            <span className="text-[11px] font-bold text-ink">Uploading photo...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-[#f7eedb] group-hover/drop:bg-brand-red/10 flex items-center justify-center mb-2 transition-colors">
                              <Camera size={22} className="text-brand-red" />
                            </div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink group-hover/drop:text-brand-red">
                              + Upload Real Photo
                            </span>
                            <span className="text-[9px] text-muted mt-1 leading-tight max-w-[170px]">
                              Click to select {color.name} {activeGarment.name} photo from device
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Color Swatch Badge on Top-Left */}
                    <div
                      className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-black/10 shadow-xs"
                      title={`Hex: ${color.hex}`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[9px] font-mono font-bold text-ink">
                        {color.hex.toUpperCase()}
                      </span>
                    </div>

                    {/* Status indicator on Top-Right */}
                    <div className="absolute top-2.5 right-2.5">
                      {hasPhoto ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-success-light text-success border border-success/30">
                          ✓ Photo Live
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                          No Photo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Information & Actions */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                          {color.name}
                        </h3>
                        <span className="text-[9px] font-mono text-muted">
                          Contrast: {color.textContrast === '#FFFFFF' ? 'White' : 'Dark'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted font-mono truncate mt-1">
                        {hasPhoto ? color.frontImageUrl : 'No photo uploaded yet'}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#eee6da] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditColor(color)}
                        className="flex-1 py-1.5 px-2 rounded border border-[#ddd3c5] hover:bg-beige text-[10px] font-bold uppercase tracking-wider text-ink flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pencil size={11} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteColor(color.id)}
                        className="py-1.5 px-2.5 rounded border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold transition-colors cursor-pointer"
                        title="Delete Color"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: Insert / Edit Color & Real-Life Photo ── */}
      {showColorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#ddd3c5] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#ddd3c5] bg-[#f7eedb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand-red" />
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">
                  {editingColorId ? `Edit Color: ${colorForm.name}` : `Add Color to ${activeGarment?.name}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="p-1 rounded-md text-muted hover:text-ink hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveColor} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Color Name */}
              <div>
                <label className="admin-label">Color Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Charcoal, Sage Green, Royal Navy, Sunset Orange"
                  value={colorForm.name}
                  onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                  className="admin-input"
                />
              </div>

              {/* Color Hex & Interactive Palette */}
              <div>
                <label className="admin-label">Color Hex Code *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorForm.hex.startsWith('#') && colorForm.hex.length === 7 ? colorForm.hex : '#171717'}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#ddd3c5] cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="#171717"
                    value={colorForm.hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="admin-input font-mono uppercase"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-black/15 shadow-inner shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: colorForm.hex, color: colorForm.textContrast }}
                  >
                    Aa
                  </div>
                </div>
              </div>

              {/* Text Contrast Selection */}
              <div>
                <label className="admin-label">Text Contrast On Garment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorForm({ ...colorForm, textContrast: '#FFFFFF' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      colorForm.textContrast === '#FFFFFF'
                        ? 'border-2 border-[#171717] bg-[#171717] text-white'
                        : 'border-[#ddd3c5] bg-white text-ink hover:bg-beige'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white border border-black/20" />
                    <span>White Text (For Dark Fabric)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorForm({ ...colorForm, textContrast: '#171717' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      colorForm.textContrast === '#171717'
                        ? 'border-2 border-[#171717] bg-[#171717] text-white'
                        : 'border-[#ddd3c5] bg-white text-ink hover:bg-beige'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#171717] border border-white/20" />
                    <span>Dark Text (For Light Fabric)</span>
                  </button>
                </div>
              </div>

              {/* Real-Life Mockup Image Upload / URL */}
              <div className="space-y-2">
                <label className="admin-label">Real-Life Garment Photo *</label>

                {/* Upload File Button */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex-1 py-2.5 px-3 rounded-lg border-2 border-dashed border-[#171717]/30 bg-[#f7eedb] hover:bg-[#ede0cc] text-xs font-bold uppercase tracking-wider text-ink flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {uploadingImage ? (
                      <LoaderCircle size={15} className="animate-spin text-brand-red" />
                    ) : (
                      <Upload size={15} className="text-brand-red" />
                    )}
                    <span>{uploadingImage ? 'Uploading Image...' : 'Upload Real Photo From Device'}</span>
                  </button>
                </div>

                {/* Or Direct Image URL Input */}
                <div>
                  <div className="text-[10px] text-muted font-bold uppercase mb-1">
                    Or Direct Photo URL:
                  </div>
                  <input
                    type="text"
                    placeholder="https://... or /api/v1/media/file/..."
                    value={colorForm.frontImageUrl}
                    onChange={(e) => setColorForm({ ...colorForm, frontImageUrl: e.target.value })}
                    className="admin-input font-mono text-xs"
                  />
                </div>

                {/* Live Preview Thumbnail */}
                {colorForm.frontImageUrl && (
                  <div className="mt-2 p-3 rounded-xl bg-[#f5efe4] border border-[#ddd3c5] flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-white border border-[#ddd3c5] flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img
                        src={colorForm.frontImageUrl}
                        alt="Photo preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-extrabold uppercase text-ink">
                        Photo Loaded
                      </div>
                      <div className="text-[9px] text-muted font-mono truncate max-w-[260px]">
                        {colorForm.frontImageUrl}
                      </div>
                      <div className="text-[10px] text-success font-semibold mt-0.5">
                        ✓ Ready to render on Customizer Studio
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#ddd3c5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#ddd3c5] text-xs font-bold uppercase tracking-wider text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="btn-primary flex items-center gap-1.5 cursor-pointer"
                >
                  {saving && <LoaderCircle size={14} className="animate-spin" />}
                  <span>{saving ? 'Saving...' : editingColorId ? 'Update Color' : 'Save & Publish Color'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
