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
  Eye,
  Camera,
  DollarSign,
  Ruler,
  Save,
  Shirt,
  AlertTriangle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface MeasurementRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
}

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  textContrast: string;
  frontImageUrl: string;
  backImageUrl?: string;
  isActive: boolean;
}

/** Drives print-area placement and size-chart columns on the storefront. */
export type GarmentStyle = 'tshirt' | 'polo' | 'hoodie';

export interface GarmentItem {
  id: string;
  name: string;
  shortName: string;
  style: GarmentStyle;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  isActive: boolean;
  sizes: string[];
  activeSizes: string[];
  sizeMeasurements?: {
    cm: MeasurementRow[];
    in: MeasurementRow[];
  };
  colors: GarmentColor[];
}

export interface CustomizerStudioConfig {
  garments: GarmentItem[];
  updatedAt: string | null;
}

// ─── Size presets ───────────────────────────────────────────────────────────
const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
/** Upload target for photos chosen inside the add/edit colour dialog. */
const MODAL_UPLOAD = '__colour-dialog__';
const NUMERIC_SIZES = ['36', '38', '40', '42', '44', '46'];

const STYLE_OPTIONS: { id: GarmentStyle; label: string }[] = [
  { id: 'tshirt', label: 'T-shirt (oversized / regular)' },
  { id: 'polo', label: 'Polo shirt' },
  { id: 'hoodie', label: 'Hoodie / sweatshirt' },
];

/** What still has to be filled in before a garment looks right on the storefront. */
function garmentWarnings(g: GarmentItem): string[] {
  const active = g.colors.filter((c) => c.isActive !== false);
  const warnings: string[] = [];
  if (active.length === 0) warnings.push('Add a colour');
  else if (active.some((c) => !c.frontImageUrl)) warnings.push('Front photo missing');
  if ((g.activeSizes || []).length === 0) warnings.push('Add sizes');
  return warnings;
}

/** Typical charts, offered as a starting point ("Fill typical measurements"). */
const DEFAULT_MEASUREMENTS: Record<GarmentStyle, { cm: MeasurementRow[]; in: MeasurementRow[] }> = {
  tshirt: {
    in: [
      { size: 'S', chest: '42 in', length: '27.5 in', shoulder: '20 in', sleeve: '8.5 in' },
      { size: 'M', chest: '44 in', length: '28 in', shoulder: '21 in', sleeve: '9 in' },
      { size: 'L', chest: '46 in', length: '28.5 in', shoulder: '22 in', sleeve: '9.5 in' },
      { size: 'XL', chest: '48 in', length: '29 in', shoulder: '23 in', sleeve: '10 in' },
      { size: 'XXL', chest: '50 in', length: '29.5 in', shoulder: '24 in', sleeve: '10.5 in' },
    ],
    cm: [
      { size: 'S', chest: '107 cm', length: '70 cm', shoulder: '51 cm', sleeve: '22 cm' },
      { size: 'M', chest: '112 cm', length: '71 cm', shoulder: '53 cm', sleeve: '23 cm' },
      { size: 'L', chest: '117 cm', length: '72 cm', shoulder: '56 cm', sleeve: '24 cm' },
      { size: 'XL', chest: '122 cm', length: '74 cm', shoulder: '58 cm', sleeve: '25 cm' },
      { size: 'XXL', chest: '127 cm', length: '75 cm', shoulder: '61 cm', sleeve: '27 cm' },
    ],
  },
  polo: {
    in: [
      { size: '36', chest: '36 in', length: '26 in', shoulder: '16 in', sleeve: '8 in' },
      { size: '38', chest: '38 in', length: '27 in', shoulder: '17 in', sleeve: '8.5 in' },
      { size: '40', chest: '40 in', length: '28 in', shoulder: '17.5 in', sleeve: '9 in' },
      { size: '42', chest: '42 in', length: '29 in', shoulder: '18 in', sleeve: '9.5 in' },
      { size: '44', chest: '44 in', length: '30 in', shoulder: '18.5 in', sleeve: '10 in' },
      { size: '46', chest: '46 in', length: '31 in', shoulder: '19 in', sleeve: '10.5 in' },
    ],
    cm: [
      { size: '36', chest: '91 cm', length: '66 cm', shoulder: '41 cm', sleeve: '20 cm' },
      { size: '38', chest: '97 cm', length: '68 cm', shoulder: '43 cm', sleeve: '22 cm' },
      { size: '40', chest: '102 cm', length: '71 cm', shoulder: '44 cm', sleeve: '23 cm' },
      { size: '42', chest: '107 cm', length: '74 cm', shoulder: '46 cm', sleeve: '24 cm' },
      { size: '44', chest: '112 cm', length: '76 cm', shoulder: '47 cm', sleeve: '25 cm' },
      { size: '46', chest: '117 cm', length: '79 cm', shoulder: '48 cm', sleeve: '27 cm' },
    ],
  },
  hoodie: {
    in: [
      { size: 'S', chest: '42 in', length: '25 in', shoulder: '21 in', sleeve: '24 in' },
      { size: 'M', chest: '44 in', length: '26 in', shoulder: '22 in', sleeve: '24.5 in' },
      { size: 'L', chest: '46 in', length: '27 in', shoulder: '23 in', sleeve: '25 in' },
      { size: 'XL', chest: '48 in', length: '28 in', shoulder: '24 in', sleeve: '25.5 in' },
      { size: 'XXL', chest: '50 in', length: '29 in', shoulder: '25 in', sleeve: '26 in' },
    ],
    cm: [
      { size: 'S', chest: '107 cm', length: '64 cm', shoulder: '53 cm', sleeve: '61 cm' },
      { size: 'M', chest: '112 cm', length: '66 cm', shoulder: '56 cm', sleeve: '62 cm' },
      { size: 'L', chest: '117 cm', length: '69 cm', shoulder: '58 cm', sleeve: '63 cm' },
      { size: 'XL', chest: '122 cm', length: '71 cm', shoulder: '61 cm', sleeve: '65 cm' },
      { size: 'XXL', chest: '127 cm', length: '74 cm', shoulder: '64 cm', sleeve: '66 cm' },
    ],
  },
};

const SIGNATURE_PALETTE = [
  { name: 'Obsidian Black', hex: '#171717', contrast: '#FFFFFF' },
  { name: 'Pure White', hex: '#FFFFFF', contrast: '#171717' },
  { name: 'Washed Beige', hex: '#D8C8B1', contrast: '#171717' },
  { name: 'Signal Red', hex: '#E6321C', contrast: '#FFFFFF' },
  { name: 'Sage Green', hex: '#4A584A', contrast: '#FFFFFF' },
  { name: 'Vintage Cream', hex: '#F7EEDB', contrast: '#171717' },
  { name: 'Deep Navy', hex: '#1D3557', contrast: '#FFFFFF' },
  { name: 'Gold Ochre', hex: '#B7791F', contrast: '#FFFFFF' },
  { name: 'Charcoal Grey', hex: '#2B2B2B', contrast: '#FFFFFF' },
];

function GarmentThumb({ garment }: { garment: GarmentItem }) {
  const photo = garment.colors.find((c) => c.isActive !== false && c.frontImageUrl)?.frontImageUrl;
  if (photo) return <img src={photo} alt="" className="w-full h-full object-contain" />;
  return <Shirt size={28} className="text-gray-300" />;
}

export function CustomizerStudioPage() {
  const { toast } = useToast();

  const [config, setConfig] = useState<CustomizerStudioConfig>({ garments: [], updatedAt: null });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string>('');
  const [newSize, setNewSize] = useState('');
  const [activeTab, setActiveTab] = useState<'pricing' | 'colors' | 'sizes' | 'preview'>('pricing');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [measureUnit, setMeasureUnit] = useState<'cm' | 'in'>('in');
  const [previewColorIndex, setPreviewColorIndex] = useState<number>(0);
  const [previewSide, setPreviewSide] = useState<'FRONT' | 'BACK'>('FRONT');

  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [colorForm, setColorForm] = useState({
    name: '',
    hex: '#171717',
    textContrast: '#FFFFFF',
    frontImageUrl: '',
    backImageUrl: '',
    isActive: true,
  });

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ colorId: string; side: 'front' | 'back' } | null>(null);

  // Everything shown here comes from the backend; there are no built-in garments.
  const applyConfig = (data: any) => {
    const garments: GarmentItem[] = Array.isArray(data?.garments) ? data.garments : [];
    setConfig({ garments, updatedAt: data?.updatedAt ?? null });
    setSelectedGarmentId((current) => (garments.some((g) => g.id === current) ? current : garments[0]?.id || ''));
  };

  const loadConfig = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      applyConfig(await api.get<any>('/customizations/studio/config'));
      setHasUnsavedChanges(false);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load the custom studio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const activeGarment = config.garments.find((g) => g.id === selectedGarmentId) || config.garments[0];

  const updateActiveGarment = (updater: (prev: GarmentItem) => GarmentItem) => {
    if (!activeGarment) return;
    const updated = updater(activeGarment);
    const newGarments = config.garments.map((g) => (g.id === activeGarment.id ? updated : g));
    setConfig((prev) => ({ ...prev, garments: newGarments }));
    setHasUnsavedChanges(true);
  };

  const handleAddGarment = () => {
    const taken = new Set(config.garments.map((g) => g.id));
    let id = 'new-garment';
    for (let n = 2; taken.has(id); n++) id = `new-garment-${n}`;
    const garment: GarmentItem = {
      id,
      name: 'New garment',
      shortName: 'NEW',
      style: 'tshirt',
      price: 999,
      compareAtPrice: null,
      description: '',
      // Hidden until it has a colour with photos and sizes.
      isActive: false,
      sizes: [],
      activeSizes: [],
      sizeMeasurements: { in: [], cm: [] },
      colors: [],
    };
    setConfig((prev) => ({ ...prev, garments: [...prev.garments, garment] }));
    setSelectedGarmentId(id);
    setActiveTab('pricing');
    setHasUnsavedChanges(true);
  };

  const handleDeleteGarment = () => {
    if (!activeGarment) return;
    if (!confirm(`Delete "${activeGarment.name}" from the custom studio? Click Publish to make it final.`)) return;
    const remaining = config.garments.filter((g) => g.id !== activeGarment.id);
    setConfig((prev) => ({ ...prev, garments: remaining }));
    setSelectedGarmentId(remaining[0]?.id || '');
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const saved = await api.put<any>('/customizations/studio/config', { garments: config.garments });
      // The server returns the cleaned config (final ids, sizes and photo links).
      applyConfig(saved);
      setHasUnsavedChanges(false);
      toast.success('Live Customizer Updated', 'All prices, sizes, and colors are live on the customer customizer.');
      setStatusMessage({
        type: 'success',
        text: 'Published. The storefront custom studio now shows these garments.',
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      toast.error('Save Failed', err?.message || 'Could not update studio config.');
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddColor = () => {
    setEditingColorId(null);
    setColorForm({
      name: '',
      hex: '#4A584A',
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

  const handleHexChange = (hexVal: string) => {
    let cleanHex = hexVal.replace('#', '');
    if (cleanHex.length > 6) cleanHex = cleanHex.substring(0, 6);
    const fullHex = `#${cleanHex}`;

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

  const handleSaveColorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorForm.name.trim()) {
      toast.error('Validation Error', 'Please enter a colorway name.');
      return;
    }

    const colorId = editingColorId || colorForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newColor: GarmentColor = {
      id: colorId,
      name: colorForm.name.trim(),
      hex: colorForm.hex,
      textContrast: colorForm.textContrast,
      frontImageUrl: colorForm.frontImageUrl.trim(),
      backImageUrl: colorForm.backImageUrl.trim() || undefined,
      isActive: colorForm.isActive,
    };

    updateActiveGarment((prev) => {
      const colors = [...prev.colors];
      if (editingColorId) {
        const idx = colors.findIndex((c) => c.id === editingColorId);
        if (idx >= 0) colors[idx] = newColor;
      } else {
        const existingIdx = colors.findIndex((c) => c.id === colorId);
        if (existingIdx >= 0) colors[existingIdx] = newColor;
        else colors.push(newColor);
      }
      return { ...prev, colors };
    });

    setShowColorModal(false);
    toast.success('Colorway Saved', `"${newColor.name}" updated. Click Publish Changes to deploy.`);
  };

  const handleDeleteColor = (colorId: string) => {
    if (!confirm('Are you sure you want to remove this colorway?')) return;
    updateActiveGarment((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.id !== colorId),
    }));
    toast.success('Colorway Removed', 'Color has been deleted from this garment.');
  };

  const triggerPhotoUpload = (colorId: string, side: 'front' | 'back') => {
    setActiveUploadTarget({ colorId, side });
    uploadInputRef.current?.click();
  };

  const handleFileUploadAction = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget || !activeGarment) return;

    const { colorId, side } = activeUploadTarget;
    setUploadingColorId(colorId);
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photo too large', 'Please use an image under 10 MB.');
      setUploadingColorId(null);
      setActiveUploadTarget(null);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
      return;
    }

    try {
      // Goes through the API (not a relative URL, which on the deployed admin
      // hits the admin's own domain). No base64 fallback: embedding the image
      // in the studio config bloats the database and hides the failure.
      const { url: finalUrl } = await api.upload(file, 'garments');
      if (!finalUrl) throw new Error('Upload did not return an image URL.');

      if (colorId === MODAL_UPLOAD) {
        setColorForm((prev) => (side === 'front' ? { ...prev, frontImageUrl: finalUrl } : { ...prev, backImageUrl: finalUrl }));
        toast.success('Photo uploaded', `${side === 'front' ? 'Front' : 'Back'} photo attached.`);
        return;
      }

      updateActiveGarment((prev) => ({
        ...prev,
        colors: prev.colors.map((c) => {
          if (c.id !== colorId) return c;
          return side === 'front'
            ? { ...c, frontImageUrl: finalUrl }
            : { ...c, backImageUrl: finalUrl };
        }),
      }));

      toast.success('Photo Attached', `Updated ${side} photo. Click Publish to make it live.`);
    } catch (err: any) {
      toast.error('Upload Error', err?.message || 'Could not upload image.');
    } finally {
      setUploadingColorId(null);
      setActiveUploadTarget(null);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const toggleSizeActive = (size: string) => {
    if (!activeGarment) return;
    const current = activeGarment.activeSizes || [];
    const exists = current.includes(size);
    let next: string[];

    if (exists) {
      next = current.filter((s) => s !== size);
    } else {
      // Keep the garment's own size order.
      next = activeGarment.sizes.filter((s) => s === size || current.includes(s));
    }

    updateActiveGarment((prev) => ({ ...prev, activeSizes: next }));
  };

  const addSizes = (sizesToAdd: string[]) => {
    if (!activeGarment) return;
    const additions = sizesToAdd
      .map((s) => s.trim().slice(0, 12))
      .filter((s) => s && !activeGarment.sizes.some((x) => x.toLowerCase() === s.toLowerCase()));
    if (additions.length === 0) return;
    updateActiveGarment((prev) => ({
      ...prev,
      sizes: [...prev.sizes, ...additions],
      activeSizes: [...(prev.activeSizes || []), ...additions],
    }));
  };

  const removeSize = (size: string) => {
    updateActiveGarment((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
      activeSizes: (prev.activeSizes || []).filter((s) => s !== size),
      sizeMeasurements: {
        in: (prev.sizeMeasurements?.in || []).filter((r) => r.size !== size),
        cm: (prev.sizeMeasurements?.cm || []).filter((r) => r.size !== size),
      },
    }));
  };

  const handleMeasurementChange = (
    unit: 'cm' | 'in',
    size: string,
    field: 'chest' | 'length' | 'shoulder' | 'sleeve',
    value: string
  ) => {
    updateActiveGarment((prev) => {
      const baseMeasurements = prev.sizeMeasurements || { in: [], cm: [] };
      const rows = [...(baseMeasurements[unit] || [])];
      const idx = rows.findIndex((r) => r.size === size);

      if (idx >= 0) {
        rows[idx] = { ...rows[idx], [field]: value };
      } else {
        rows.push({
          size,
          chest: field === 'chest' ? value : '',
          length: field === 'length' ? value : '',
          shoulder: field === 'shoulder' ? value : '',
          sleeve: field === 'sleeve' ? value : '',
        });
      }

      return {
        ...prev,
        sizeMeasurements: {
          ...baseMeasurements,
          [unit]: rows,
        },
      };
    });
  };

  const handleResetMeasurements = () => {
    if (!activeGarment) return;
    if (!confirm(`Fill typical ${activeGarment.style} measurements for matching sizes? Your own values for those sizes are replaced.`)) return;
    const typical = DEFAULT_MEASUREMENTS[activeGarment.style] || DEFAULT_MEASUREMENTS.tshirt;
    updateActiveGarment((prev) => {
      const merge = (unit: 'in' | 'cm') => {
        const own = prev.sizeMeasurements?.[unit] || [];
        return prev.sizes
          .map((size) => typical[unit].find((r) => r.size === size) || own.find((r) => r.size === size))
          .filter((r): r is MeasurementRow => Boolean(r));
      };
      return { ...prev, sizeMeasurements: { in: merge('in'), cm: merge('cm') } };
    });
    toast.success('Measurements filled', 'Typical values added where your sizes match. Adjust them to your garment.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#E6321C]" />
        <p className="text-sm font-bold text-gray-600">Loading custom studio...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 rounded-3xl border border-red-200 bg-red-50 text-center space-y-3">
        <AlertTriangle className="w-7 h-7 mx-auto text-red-600" />
        <p className="text-sm font-bold text-red-800">{loadError}</p>
        <button type="button" onClick={loadConfig} className="btn-primary">Try again</button>
      </div>
    );
  }

  const activeColorObj = activeGarment?.colors?.[previewColorIndex] || activeGarment?.colors?.[0];
  const activeImageUrl = previewSide === 'BACK' ? activeColorObj?.backImageUrl : activeColorObj?.frontImageUrl;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleFileUploadAction}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* TOP BANNER & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
              Custom Studio
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            Garments customers can design on /customize: prices, colours with real front and back photos, sizes and size charts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://bingooo.co.in/customize"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors"
          >
            <span>View Storefront Studio</span>
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-[#E6321C] hover:bg-[#c92613] text-white animate-pulse'
                : 'bg-gray-900 hover:bg-black text-white'
            }`}
          >
            {saving ? (
              <>
                <LoaderCircle size={14} className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{hasUnsavedChanges ? 'Publish Changes *' : 'Publish Live'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-gray-500 hover:text-gray-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* GARMENT CARDS */}
      {config.garments.length === 0 ? (
        <div className="p-10 rounded-3xl border-2 border-dashed border-gray-300 bg-white text-center space-y-3">
          <Shirt className="w-10 h-10 mx-auto text-gray-300" />
          <h2 className="text-base font-black text-gray-900 uppercase">No garments yet</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Add a garment (e.g. Oversized T-shirt), set its price and sizes, then add colours with real front and back photos.
            The storefront custom studio stays hidden until a garment is active.
          </p>
          <button type="button" onClick={handleAddGarment} className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={14} />
            <span>Add garment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {config.garments.map((garment) => {
            const isSelected = garment.id === selectedGarmentId;
            const activeColorCount = garment.colors?.filter((c) => c.isActive !== false).length || 0;
            const warnings = garmentWarnings(garment);

            return (
              <button
                type="button"
                key={garment.id}
                onClick={() => {
                  setSelectedGarmentId(garment.id);
                  setPreviewColorIndex(0);
                }}
                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col text-left bg-white shadow-sm hover:shadow-md ${
                  isSelected ? 'border-[#E6321C] ring-2 ring-[#E6321C]/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3 w-full">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      garment.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {garment.isActive ? 'Live' : 'Hidden'}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 truncate">{garment.style}</span>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden">
                    <GarmentThumb garment={garment} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">{garment.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-extrabold text-[#E6321C]">₹{garment.price.toLocaleString('en-IN')}</span>
                      {garment.compareAtPrice && garment.compareAtPrice > garment.price && (
                        <span className="text-xs font-medium text-gray-400 line-through">₹{garment.compareAtPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 w-full text-[10px] font-mono text-gray-500 flex items-center justify-between gap-2">
                  <span>{activeColorCount} colour{activeColorCount === 1 ? '' : 's'}</span>
                  <span className="truncate">{(garment.activeSizes || []).join(', ') || 'No sizes'}</span>
                </div>
                {warnings.length > 0 && (
                  <div className="mt-2 w-full text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle size={11} className="shrink-0" />
                    <span className="truncate">{warnings.join(' · ')}</span>
                  </div>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleAddGarment}
            className="p-4 rounded-3xl border-2 border-dashed border-gray-300 bg-white/60 hover:bg-white hover:border-gray-400 text-gray-500 hover:text-gray-900 flex flex-col items-center justify-center gap-2 min-h-[150px] transition-colors cursor-pointer"
          >
            <Plus size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Add garment</span>
          </button>
        </div>
      )}

      {/* SELECTED GARMENT CONTROLS */}
      {activeGarment && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E6321C] uppercase tracking-wider">
                  Configuring Garment
                </span>
                <span className="text-xs text-gray-300">/</span>
                <span className="text-sm font-black text-gray-900 uppercase">{activeGarment.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust prices, manage size charts, upload color mockups, or test in the live simulator.
              </p>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-2xl gap-1 max-w-full overflow-x-auto">
              {[
                { id: 'pricing' as const, label: 'Pricing & Details', icon: DollarSign },
                { id: 'colors' as const, label: `Colorways (${activeGarment.colors?.length || 0})`, icon: Palette },
                { id: 'sizes' as const, label: `Sizes (${activeGarment.activeSizes?.length || 0})`, icon: Ruler },
                { id: 'preview' as const, label: 'Live Simulator', icon: Eye },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex shrink-0 items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isCurrent ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* TAB 1: PRICING */}
            {activeTab === 'pricing' && (
              <div className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Base Customizer Selling Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={activeGarment.price}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 0);
                          updateActiveGarment((prev) => ({ ...prev, price: val }));
                        }}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-base font-extrabold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      The live retail price shown on the customizer and added to the bag.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Original Compare-at Price / MRP (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={activeGarment.compareAtPrice ?? ''}
                        placeholder="Optional"
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateActiveGarment((prev) => ({ ...prev, compareAtPrice: Number.isFinite(val) && val > 0 ? val : null }));
                        }}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-base font-extrabold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      Optional. Shown crossed out when it is higher than the selling price.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Quick Price Adjustments
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Set ₹999', val: 999 },
                      { label: 'Set ₹1,299', val: 1299 },
                      { label: 'Set ₹1,499', val: 1499 },
                      { label: 'Set ₹1,999', val: 1999 },
                      { label: 'Set ₹2,499', val: 2499 },
                      { label: '+₹100', delta: 100 },
                      { label: '-₹100', delta: -100 },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          updateActiveGarment((prev) => {
                            const newPrice = btn.val !== undefined ? btn.val : Math.max(1, prev.price + (btn.delta || 0));
                            return { ...prev, price: newPrice };
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Garment Name
                    </label>
                    <input
                      type="text"
                      value={activeGarment.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveGarment((prev) => ({ ...prev, name: val }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Fabric & Details (shown under the name)
                    </label>
                    <input
                      type="text"
                      value={activeGarment.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveGarment((prev) => ({ ...prev, description: val }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Button Label (short)
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      value={activeGarment.shortName}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        updateActiveGarment((prev) => ({ ...prev, shortName: val }));
                      }}
                      placeholder="e.g. OVERSIZED"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Shown on the garment picker on the storefront.</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                      Garment Style
                    </label>
                    <select
                      value={activeGarment.style}
                      onChange={(e) => {
                        const val = e.target.value as GarmentStyle;
                        updateActiveGarment((prev) => ({ ...prev, style: val }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                    >
                      {STYLE_OPTIONS.map((o) => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">Sets where designs sit on the photo and the size-chart columns.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Show on storefront</div>
                    <div className="text-xs text-gray-500">
                      Customers only see live garments. Add at least one colour with a front photo and some sizes first.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeGarment.isActive}
                      onChange={(e) => {
                        const val = e.target.checked;
                        updateActiveGarment((prev) => ({ ...prev, isActive: val }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E6321C]"></div>
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleDeleteGarment}
                    className="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete this garment</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COLORS */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase">Configured Colorways & Photo Mockups</h3>
                    <p className="text-xs text-gray-500">
                      Upload real photos of the blank garment (PNG with transparent background works best, JPG/WEBP also fine, max 10 MB).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddColor}
                    className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add New Colorway</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeGarment.colors.map((color) => {
                    const hasFront = !!color.frontImageUrl;
                    const hasBack = !!color.backImageUrl;
                    const isUploadingThis = uploadingColorId === color.id;

                    return (
                      <div
                        key={color.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between bg-white shadow-sm ${
                          color.isActive !== false ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-full border border-gray-300 shadow-sm flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: color.hex }}
                              >
                                <span className="text-[9px] font-bold" style={{ color: color.textContrast }}>
                                  Aa
                                </span>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-gray-900">{color.name}</div>
                                <div className="text-[10px] font-mono text-gray-400">{color.hex}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditColor(color)}
                                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                title="Edit Colorway"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteColor(color.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Colorway"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 my-2">
                            <div className="relative rounded-xl border border-gray-100 bg-gray-50 h-28 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                              {hasFront ? (
                                <img
                                  src={color.frontImageUrl}
                                  alt={`${color.name} Front`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-center p-1">
                                  <Camera size={18} className="mx-auto text-gray-400 mb-1" />
                                  <span className="text-[9px] font-mono text-gray-500 block">No Front Photo</span>
                                </div>
                              )}

                              <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-center gap-2 p-1.5">
                                <button
                                  type="button"
                                  onClick={() => triggerPhotoUpload(color.id, 'front')}
                                  disabled={isUploadingThis}
                                  className="px-2 py-1 rounded-lg bg-white text-gray-900 text-[9px] font-bold uppercase shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload size={10} />
                                  <span>{hasFront ? 'Replace Front' : 'Upload Front'}</span>
                                </button>
                                {hasFront && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateActiveGarment((prev) => ({
                                        ...prev,
                                        colors: prev.colors.map((c) =>
                                          c.id === color.id ? { ...c, frontImageUrl: '' } : c
                                        ),
                                      }));
                                    }}
                                    className="text-[8px] text-white hover:underline cursor-pointer"
                                  >
                                    Remove Front
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="relative rounded-xl border border-gray-100 bg-gray-50 h-28 flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                              {hasBack ? (
                                <img
                                  src={color.backImageUrl}
                                  alt={`${color.name} Back`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-center p-1">
                                  <Camera size={18} className="mx-auto text-gray-400 mb-1" />
                                  <span className="text-[9px] font-mono text-gray-500 block">No Back Photo</span>
                                </div>
                              )}

                              <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-center gap-2 p-1.5">
                                <button
                                  type="button"
                                  onClick={() => triggerPhotoUpload(color.id, 'back')}
                                  disabled={isUploadingThis}
                                  className="px-2 py-1 rounded-lg bg-white text-gray-900 text-[9px] font-bold uppercase shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload size={10} />
                                  <span>{hasBack ? 'Replace Back' : 'Upload Back'}</span>
                                </button>
                                {hasBack && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateActiveGarment((prev) => ({
                                        ...prev,
                                        colors: prev.colors.map((c) =>
                                          c.id === color.id ? { ...c, backImageUrl: '' } : c
                                        ),
                                      }));
                                    }}
                                    className="text-[8px] text-white hover:underline cursor-pointer"
                                  >
                                    Remove Back
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                          <span className={hasFront ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                            {hasFront ? (hasBack ? 'Front & back photos' : 'Back photo missing') : 'Front photo needed'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateActiveGarment((prev) => ({
                                ...prev,
                                colors: prev.colors.map((c) =>
                                  c.id === color.id ? { ...c, isActive: !c.isActive } : c
                                ),
                              }));
                            }}
                            className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase cursor-pointer ${
                              color.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {color.isActive !== false ? 'Active' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SIZES */}
            {activeTab === 'sizes' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Sizes for {activeGarment.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Add the sizes you sell. Tap a size to switch it on or off for customers; use the x to remove it.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeGarment.sizes.length === 0 && (
                      <span className="text-xs text-gray-500">No sizes yet. Add them below.</span>
                    )}
                    {activeGarment.sizes.map((size) => {
                      const isOn = (activeGarment.activeSizes || []).includes(size);
                      return (
                        <span
                          key={size}
                          className={`inline-flex items-center rounded-xl border overflow-hidden ${
                            isOn ? 'border-gray-900' : 'border-gray-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSizeActive(size)}
                            title={isOn ? 'Offered: tap to hide' : 'Hidden: tap to offer'}
                            className={`h-9 px-3 font-mono text-xs font-bold uppercase cursor-pointer ${
                              isOn ? 'bg-gray-900 text-white' : 'bg-white text-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            aria-label={`Remove size ${size}`}
                            className={`h-9 px-2 cursor-pointer ${isOn ? 'bg-gray-800 text-white/70 hover:text-white' : 'bg-white text-gray-400 hover:text-red-600'}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addSizes(newSize.split(','));
                        setNewSize('');
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="e.g. XL or 42 (comma-separate several)"
                        maxLength={60}
                        className="w-60 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#E6321C]"
                      />
                      <button type="submit" className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                        <Plus size={12} />
                        <span>Add size</span>
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => addSizes(LETTER_SIZES)}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Add XS–3XL
                    </button>
                    <button
                      type="button"
                      onClick={() => addSizes(NUMERIC_SIZES)}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Add 36–46
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                        Precision Size Measurement Chart
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Shown in the storefront size chart. Leave a cell empty if you don't measure it.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetMeasurements}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg border border-gray-200 bg-white cursor-pointer"
                      >
                        Fill typical values
                      </button>

                      <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setMeasureUnit('in')}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                            measureUnit === 'in' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                          }`}
                        >
                          Inches (&quot;)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeasureUnit('cm')}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                            measureUnit === 'cm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                          }`}
                        >
                          Centimeters (cm)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-900 text-white font-mono text-[10px] uppercase">
                          <th className="p-3">Size</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Chest (Round)</th>
                          <th className="p-3">Total Length</th>
                          <th className="p-3">Shoulder Drop</th>
                          <th className="p-3">Sleeve Length</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white font-mono">
                        {activeGarment.sizes.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-xs text-gray-500 font-sans">Add sizes above to fill in the chart.</td>
                          </tr>
                        )}
                        {activeGarment.sizes.map((size) => {
                          const row = (activeGarment.sizeMeasurements?.[measureUnit] || []).find((r) => r.size === size) || {
                            size,
                            chest: '',
                            length: '',
                            shoulder: '',
                            sleeve: '',
                          };
                          const isSizeActive = (activeGarment.activeSizes || []).includes(row.size);
                          return (
                            <tr key={row.size} className={isSizeActive ? 'hover:bg-gray-50/70' : 'bg-gray-50/40 opacity-60'}>
                              <td className="p-3 font-extrabold text-gray-900 text-sm">{row.size}</td>
                              <td className="p-3">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    isSizeActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  {isSizeActive ? 'Offered' : 'Disabled'}
                                </span>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.chest}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'chest', e.target.value)}
                                  className="w-28 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#E6321C]"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.length}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'length', e.target.value)}
                                  className="w-28 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#E6321C]"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.shoulder}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'shoulder', e.target.value)}
                                  className="w-28 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#E6321C]"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.sleeve}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'sleeve', e.target.value)}
                                  className="w-28 px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#E6321C]"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PREVIEW SIMULATOR */}
            {activeTab === 'preview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="p-6 rounded-3xl bg-[#ede0cc] border border-[#ddd3c5] flex flex-col items-center justify-center relative min-h-[420px]">
                  <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                    {activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt={`${activeGarment.name} preview`}
                        className="max-h-[90%] max-w-[90%] object-contain drop-shadow-xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Camera size={28} />
                        <span className="text-xs font-semibold">No {previewSide === 'BACK' ? 'back' : 'front'} photo for this colour yet</span>
                      </div>
                    )}

                    <div className="absolute inset-0 m-auto w-28 h-28 border border-dashed border-[#E6321C]/60 rounded-xl flex items-center justify-center pointer-events-none">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#E6321C] opacity-75">
                        DTF Print Zone
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-xl border border-[#ddd3c5]">
                    <button
                      type="button"
                      onClick={() => setPreviewSide('FRONT')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                        previewSide === 'FRONT' ? 'bg-[#171717] text-white' : 'text-[#6f6a63]'
                      }`}
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSide('BACK')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                        previewSide === 'BACK' ? 'bg-[#171717] text-white' : 'text-[#6f6a63]'
                      }`}
                    >
                      Back
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E6321C]">
                      Live Customer Experience
                    </span>
                    <h3 className="text-xl font-black text-gray-900 uppercase mt-0.5">{activeGarment.name}</h3>
                    <p className="text-xs text-gray-500">{activeGarment.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-2xl font-black text-[#E6321C]">
                        ₹{activeGarment.price.toLocaleString('en-IN')}
                      </span>
                      {activeGarment.compareAtPrice && activeGarment.compareAtPrice > activeGarment.price && (
                        <span className="text-sm font-semibold text-gray-400 line-through">
                          ₹{activeGarment.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                      Select Colorway ({activeGarment.colors.length} Available)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeGarment.colors.map((c, idx) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setPreviewColorIndex(idx)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                            previewColorIndex === idx ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex, borderColor: '#ddd3c5' }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                      Available Sizes ({activeGarment.activeSizes?.length || 0} Offered)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(activeGarment.activeSizes || []).map((sz) => (
                        <span
                          key={sz}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-mono text-xs font-bold uppercase text-gray-800"
                        >
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                    <div className="font-bold text-gray-900">Storefront Status:</div>
                    <div>• Silhouette: {activeGarment.isActive ? 'Active on /customize' : 'Hidden'}</div>
                    <div>• Active Color: {activeColorObj?.name || 'Default'} ({activeColorObj?.hex})</div>
                    <div>• Photo: {activeImageUrl ? 'Uploaded' : 'Missing (customers see a placeholder)'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT COLORWAY MODAL */}
      {showColorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-5">
              <h3 className="text-base font-black uppercase text-gray-900">
                {editingColorId ? 'Edit Colorway' : 'Add New Colorway'}
              </h3>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveColorForm} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                  Color Name
                </label>
                <input
                  type="text"
                  value={colorForm.name}
                  onChange={(e) => setColorForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sage Green, Washed Charcoal"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#E6321C]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Bingooo Signature Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SIGNATURE_PALETTE.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setColorForm((prev) => ({
                          ...prev,
                          name: prev.name || item.name,
                          hex: item.hex,
                          textContrast: item.contrast,
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-bold flex items-center gap-1.5 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.hex }} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Hex Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorForm.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-gray-200 p-0.5 cursor-pointer flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={colorForm.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-sm font-semibold uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                    Ink Contrast
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setColorForm((p) => ({ ...p, textContrast: '#FFFFFF' }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        colorForm.textContrast === '#FFFFFF'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      Light Ink
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorForm((p) => ({ ...p, textContrast: '#171717' }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        colorForm.textContrast === '#171717'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      Dark Ink
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Front Photo
                  </label>
                  <div className="flex items-center gap-2">
                    {colorForm.frontImageUrl && (
                      <img src={colorForm.frontImageUrl} alt="" className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                    )}
                    <button
                      type="button"
                      onClick={() => triggerPhotoUpload(MODAL_UPLOAD, 'front')}
                      disabled={uploadingColorId === MODAL_UPLOAD}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                    >
                      {uploadingColorId === MODAL_UPLOAD && activeUploadTarget?.side === 'front' ? <LoaderCircle size={12} className="animate-spin" /> : <Upload size={12} />}
                      <span>{colorForm.frontImageUrl ? 'Replace' : 'Upload'}</span>
                    </button>
                    <input
                      type="text"
                      value={colorForm.frontImageUrl}
                      onChange={(e) => setColorForm((prev) => ({ ...prev, frontImageUrl: e.target.value }))}
                      placeholder="or paste an https:// image link"
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Back Photo
                  </label>
                  <div className="flex items-center gap-2">
                    {colorForm.backImageUrl && (
                      <img src={colorForm.backImageUrl} alt="" className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                    )}
                    <button
                      type="button"
                      onClick={() => triggerPhotoUpload(MODAL_UPLOAD, 'back')}
                      disabled={uploadingColorId === MODAL_UPLOAD}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                    >
                      {uploadingColorId === MODAL_UPLOAD && activeUploadTarget?.side === 'back' ? <LoaderCircle size={12} className="animate-spin" /> : <Upload size={12} />}
                      <span>{colorForm.backImageUrl ? 'Replace' : 'Upload'}</span>
                    </button>
                    <input
                      type="text"
                      value={colorForm.backImageUrl}
                      onChange={(e) => setColorForm((prev) => ({ ...prev, backImageUrl: e.target.value }))}
                      placeholder="or paste an https:// image link"
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E6321C] hover:bg-[#c92613] text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  Save Colorway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizerStudioPage;
