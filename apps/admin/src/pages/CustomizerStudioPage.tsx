import { useEffect, useState, useRef } from 'react';
import { api, resolveImageUrl } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  PrintAreaPreview,
  printAreasFor,
  checkGarmentPhoto,
  CHECKERBOARD,
  type PrintAreas,
} from '../components/PrintAreaPreview';
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
  DollarSign,
  Ruler,
  Save,
  Shirt,
  AlertTriangle,
  ImageOff,
  RotateCcw,
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
  /** Where prints sit on this garment's photos; unset = the style's default placement. */
  printAreas?: PrintAreas;
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
  if (photo) return <img src={resolveImageUrl(photo)} alt="" className="w-full h-full object-contain" />;
  return <ImageOff size={18} className="text-[#171717]/40" aria-label="No photo yet" />;
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
  const [focusSpot, setFocusSpot] = useState<keyof PrintAreas | null>(null);

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
    toast.success('Colorway Saved (Draft)', `"${newColor.name}" updated. Click Save to Frontend to make it live.`);
  };

  const handleSaveColorFormAndPublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!colorForm.name.trim()) {
      toast.error('Validation Error', 'Please enter a colorway name.');
      return;
    }
    if (!activeGarment) return;

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

    const colors = [...activeGarment.colors];
    if (editingColorId) {
      const idx = colors.findIndex((c) => c.id === editingColorId);
      if (idx >= 0) colors[idx] = newColor;
    } else {
      const existingIdx = colors.findIndex((c) => c.id === colorId);
      if (existingIdx >= 0) colors[existingIdx] = newColor;
      else colors.push(newColor);
    }

    const updatedGarment = { ...activeGarment, colors };
    const newGarments = config.garments.map((g) => (g.id === activeGarment.id ? updatedGarment : g));

    setSaving(true);
    setStatusMessage(null);
    try {
      const saved = await api.put<any>('/customizations/studio/config', { garments: newGarments });
      applyConfig(saved);
      setHasUnsavedChanges(false);
      setShowColorModal(false);
      toast.success('Saved & Published Live!', `"${newColor.name}" is now live on http://localhost:5173/customize`);
      setStatusMessage({
        type: 'success',
        text: `Published! "${newColor.name}" images are now visible on the storefront custom studio.`,
      });
      setTimeout(() => setStatusMessage(null), 6000);
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

    const check = await checkGarmentPhoto(file);
    if (check.error) {
      toast.error('Photo not uploaded', check.error);
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
        check.warnings.forEach((w) => toast.warning('Check this photo', w, 8000));
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

      toast.success('Photo Attached!', `Updated ${side} photo. Click "SAVE TO FRONTEND" to show it live.`);
      check.warnings.forEach((w) => toast.warning('Check this photo', w, 8000));
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
        <p className="text-sm font-bold text-[#6F6A63]">Loading custom studio...</p>
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

  // Print placement is per garment (shared by its colours), as a % of the photo.
  const setPrintSpot = (key: keyof PrintAreas, axis: 'x' | 'y' | 'w', value: number) =>
    updateActiveGarment((prev) => {
      const current = printAreasFor(prev.style, prev.printAreas);
      return { ...prev, printAreas: { ...current, [key]: { ...current[key], [axis]: value } } };
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleFileUploadAction}
        accept="image/png, image/webp"
        className="hidden"
      />

      {/* TOP BANNER & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 border-2 border-[#171717] shadow-[4px_4px_0px_#171717]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#E6321C] shadow-[1px_1px_0px_#171717]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#171717] uppercase tracking-tight">
              Custom Studio Matrix
            </h1>
          </div>
          <p className="text-xs text-[#171717]/70 font-medium">
            Garments customers can design on /customize: prices, colours with real front and back photos, sizes and size charts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="http://localhost:5173/customize"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs gap-1.5 font-bold"
          >
            <span>Preview Frontend</span>
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className={`text-xs font-black uppercase tracking-wider px-5 py-2.5 border-2 border-[#171717] flex items-center gap-2 cursor-pointer transition-all ${
              hasUnsavedChanges
                ? 'bg-[#E6321C] text-white shadow-[4px_4px_0px_#171717] hover:bg-[#ff3b20] hover:shadow-[6px_6px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none animate-pulse'
                : 'bg-[#171717] text-white shadow-[3px_3px_0px_#171717] hover:bg-black'
            }`}
            title="Save changes and make them live on the customer customizer"
          >
            {saving ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                <span>SAVING TO FRONTEND...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{hasUnsavedChanges ? 'SAVE TO FRONTEND *' : 'SAVED TO FRONTEND ✓'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 border-2 border-[#171717] text-xs font-bold flex items-center justify-between shadow-[2px_2px_0px_#171717] ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-950'
              : 'bg-rose-100 text-rose-950'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-[#171717] hover:text-[#E6321C]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* GARMENT CARDS */}
      {config.garments.length === 0 ? (
        <div className="p-10 border-2 border-dashed border-[#171717] bg-white text-center space-y-3 shadow-[4px_4px_0px_#171717]">
          <Shirt className="w-10 h-10 mx-auto text-[#171717]/40" />
          <h2 className="text-base font-black text-[#171717] uppercase font-mono">No garments yet</h2>
          <p className="text-xs text-[#171717]/70 max-w-md mx-auto">
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
                className={`p-4 border-2 transition-all cursor-pointer flex flex-col text-left ${
                  isSelected
                    ? 'border-[#171717] bg-[#F7EEDB] shadow-[5px_5px_0px_#E6321C]'
                    : 'border-[#171717] bg-white shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3 w-full">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#171717] ${
                      garment.isActive ? 'bg-emerald-100 text-emerald-950' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {garment.isActive ? 'Live' : 'Hidden'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#171717]/60 uppercase truncate">{garment.style}</span>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <div className="w-16 h-16 border-2 border-[#171717] bg-[#FAF7F2] flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden shadow-[2px_2px_0px_#171717]">
                    <GarmentThumb garment={garment} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-[#171717] uppercase tracking-tight truncate">{garment.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-black font-mono text-[#E6321C]">₹{garment.price.toLocaleString('en-IN')}</span>
                      {garment.compareAtPrice && garment.compareAtPrice > garment.price && (
                        <span className="text-xs font-mono text-[#171717]/50 line-through">₹{garment.compareAtPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t-2 border-[#171717] w-full text-[10px] font-mono font-bold text-[#171717]/70 flex items-center justify-between gap-2 uppercase">
                  <span>{activeColorCount} colour{activeColorCount === 1 ? '' : 's'}</span>
                  <span className="truncate">{(garment.activeSizes || []).join(', ') || 'No sizes'}</span>
                </div>
                {warnings.length > 0 && (
                  <div className="mt-2 w-full text-[10px] font-bold text-amber-800 flex items-center gap-1 font-mono uppercase">
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
            className="p-4 border-2 border-dashed border-[#171717] bg-white/70 hover:bg-white text-[#171717] flex flex-col items-center justify-center gap-2 min-h-[150px] transition-colors cursor-pointer shadow-[2px_2px_0px_#171717]"
          >
            <Plus size={20} />
            <span className="text-xs font-black uppercase font-mono tracking-wider">Add garment</span>
          </button>
        </div>
      )}

      {/* SELECTED GARMENT CONTROLS */}
      {activeGarment && (
        <div className="bg-white border-2 border-[#171717] shadow-[6px_6px_0px_#171717] overflow-hidden">
          <div className="p-5 border-b-2 border-[#171717] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FAF7F2]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E6321C] uppercase tracking-wider">
                  Configuring Garment
                </span>
                <span className="text-xs text-[#171717]/40">/</span>
                <span className="text-sm font-black text-[#171717] uppercase">{activeGarment.name}</span>
              </div>
              <p className="text-xs text-[#171717]/70 mt-0.5 font-medium">
                Adjust prices, manage size charts, upload color mockups, or test in the live simulator.
              </p>
            </div>

            <div className="flex p-1 bg-[#F7EEDB] border-2 border-[#171717] gap-1 max-w-full overflow-x-auto shadow-[2px_2px_0px_#171717]">
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
                    className={`px-3 py-1.5 text-xs font-black uppercase font-mono transition-all flex shrink-0 items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isCurrent ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]' : 'text-[#171717] hover:bg-white'
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
                  <div className="p-4 border-2 border-[#171717] bg-[#F7EEDB]">
                    <label className="admin-label">
                      Base Customizer Selling Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6A63] font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={activeGarment.price}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 0);
                          updateActiveGarment((prev) => ({ ...prev, price: val }));
                        }}
                        className="admin-input pl-8 pr-3 text-base font-extrabold"
                      />
                    </div>
                    <p className="text-[10px] text-[#6F6A63] mt-1.5">
                      The live retail price shown on the customizer and added to the bag.
                    </p>
                  </div>

                  <div className="p-4 border-2 border-[#171717] bg-[#F7EEDB]">
                    <label className="admin-label">
                      Original Compare-at Price / MRP (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6A63] font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={activeGarment.compareAtPrice ?? ''}
                        placeholder="Optional"
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateActiveGarment((prev) => ({ ...prev, compareAtPrice: Number.isFinite(val) && val > 0 ? val : null }));
                        }}
                        className="admin-input pl-8 pr-3 text-base font-extrabold"
                      />
                    </div>
                    <p className="text-[10px] text-[#6F6A63] mt-1.5">
                      Optional. Shown crossed out when it is higher than the selling price.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="admin-label text-[#6F6A63] mb-2">
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
                        className="px-3 py-1.5 font-mono text-xs font-bold border-2 border-[#171717] bg-white hover:bg-[#EDE0CC] text-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="admin-label">
                      Garment Name
                    </label>
                    <input
                      type="text"
                      value={activeGarment.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveGarment((prev) => ({ ...prev, name: val }));
                      }}
                      className="admin-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="admin-label">
                      Fabric & Details (shown under the name)
                    </label>
                    <input
                      type="text"
                      value={activeGarment.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveGarment((prev) => ({ ...prev, description: val }));
                      }}
                      className="admin-input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">
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
                      className="admin-input text-sm"
                    />
                    <p className="text-[10px] text-[#6F6A63] mt-1">Shown on the garment picker on the storefront.</p>
                  </div>
                  <div>
                    <label className="admin-label">
                      Garment Style
                    </label>
                    <select
                      value={activeGarment.style}
                      onChange={(e) => {
                        const val = e.target.value as GarmentStyle;
                        // A new style starts from that style's default print placement.
                        updateActiveGarment((prev) => ({ ...prev, style: val, printAreas: undefined }));
                      }}
                      className="admin-input text-sm"
                    >
                      {STYLE_OPTIONS.map((o) => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#6F6A63] mt-1">Sets where designs sit on the photo and the size-chart columns.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#171717]/15 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#171717]">Show on storefront</div>
                    <div className="text-xs text-[#6F6A63]">
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

                <div className="pt-4 border-t-2 border-[#171717]/15 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDeleteGarment}
                    className="px-3 py-2 border-2 border-[#E6321C] bg-white text-[#E6321C] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#E6321C] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete this garment</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="btn-primary text-xs gap-2 py-2 px-5 font-black uppercase tracking-wider"
                  >
                    {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{hasUnsavedChanges ? 'SAVE TO LIVE FRONTEND *' : 'SAVED TO FRONTEND ✓'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COLORS */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-[#171717] bg-[#FAF7F2] shadow-[3px_3px_0px_#171717]">
                  <div>
                    <h3 className="text-sm font-black text-[#171717] uppercase tracking-tight">Colorways & Mockup Photos</h3>
                    <p className="text-xs text-[#171717]/60 font-medium mt-0.5">
                      Upload transparent PNG/WebP garment photos. Click <strong className="text-[#E6321C]">SAVE IMAGES TO FRONTEND</strong> to show your uploads on the live customizer.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={saving}
                      className={`px-3.5 py-2 text-xs font-black uppercase font-mono border-2 border-[#171717] flex items-center gap-1.5 cursor-pointer transition-all shadow-[2px_2px_0px_#171717] ${
                        hasUnsavedChanges
                          ? 'bg-[#E6321C] text-white hover:bg-[#ff3820] animate-pulse'
                          : 'bg-white text-[#171717] hover:bg-[#F7EEDB]'
                      }`}
                      title="Save all mockup images to the live customer studio"
                    >
                      {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>{hasUnsavedChanges ? 'SAVE IMAGES TO FRONTEND *' : 'ALL IMAGES SAVED ✓'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddColor}
                      className="btn-primary text-xs gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Colorway</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeGarment.colors.map((color) => {
                    const hasFront = !!color.frontImageUrl;
                    const hasBack = !!color.backImageUrl;
                    const isUploadingThis = uploadingColorId === color.id;

                    const deleteImage = (side: 'front' | 'back') => {
                      if (!confirm(`Delete ${side} mockup photo for "${color.name}"? Click Publish to make it final.`)) return;
                      updateActiveGarment((prev) => ({
                        ...prev,
                        colors: prev.colors.map((c) =>
                          c.id === color.id
                            ? { ...c, ...(side === 'front' ? { frontImageUrl: '' } : { backImageUrl: '' }) }
                            : c
                        ),
                      }));
                      toast.success('Image Removed', `${side === 'front' ? 'Front' : 'Back'} mockup deleted. Click Publish Changes to update the store.`);
                    };

                    return (
                      <div
                        key={color.id}
                        className={`border-2 transition-all flex flex-col bg-white ${
                          color.isActive !== false
                            ? 'border-[#171717] shadow-[4px_4px_0px_#171717]'
                            : 'border-dashed border-[#171717]/40 opacity-60'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#171717] bg-[#FAF7F2]">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 border-2 border-[#171717] flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div>
                              <div className="text-[11px] font-black text-[#171717] uppercase tracking-tight">{color.name}</div>
                              <div className="text-[9px] font-mono text-[#171717]/50">{color.hex}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
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
                              className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border-2 border-[#171717] cursor-pointer transition-colors ${
                                color.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              {color.isActive !== false ? 'Live' : 'Off'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditColor(color)}
                              className="p-1 text-[#171717] hover:bg-[#F7EEDB] border-2 border-transparent hover:border-[#171717] transition-all cursor-pointer"
                              title="Edit Colorway"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColor(color.id)}
                              className="p-1 text-[#E6321C] hover:bg-[#E6321C] hover:text-white border-2 border-transparent hover:border-[#171717] transition-all cursor-pointer"
                              title="Delete entire colorway"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 divide-x-2 divide-[#171717]">
                          {/* FRONT IMAGE SLOT */}
                          <div className="flex flex-col">
                            <div className="text-[9px] font-mono font-black uppercase text-[#171717]/60 px-2 pt-2 pb-1 tracking-wider">Front</div>
                            <div className="relative bg-[#F7EEDB] h-32 flex items-center justify-center overflow-hidden" style={hasFront ? CHECKERBOARD : undefined}>
                              {isUploadingThis ? (
                                <LoaderCircle className="w-6 h-6 animate-spin text-[#E6321C]" />
                              ) : hasFront ? (
                                <img
                                  src={resolveImageUrl(color.frontImageUrl)}
                                  alt={`${color.name} Front`}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                                  <ImageOff size={22} className="text-[#171717]/35" />
                                  <span className="text-[8px] font-mono text-[#171717]/40 uppercase">No Photo</span>
                                </div>
                              )}
                            </div>
                            {/* Front action buttons */}
                            <div className="flex border-t-2 border-[#171717]">
                              <button
                                type="button"
                                onClick={() => triggerPhotoUpload(color.id, 'front')}
                                disabled={isUploadingThis}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-black uppercase font-mono text-[#171717] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer border-r border-[#171717]/20"
                              >
                                <Upload size={9} />
                                <span>{hasFront ? 'Replace' : 'Upload'}</span>
                              </button>
                              {hasFront && (
                                <button
                                  type="button"
                                  onClick={() => deleteImage('front')}
                                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-black uppercase font-mono bg-[#E6321C] text-white hover:bg-red-800 transition-colors cursor-pointer"
                                  title="Delete front mockup"
                                >
                                  <Trash2 size={9} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* BACK IMAGE SLOT */}
                          <div className="flex flex-col">
                            <div className="text-[9px] font-mono font-black uppercase text-[#171717]/60 px-2 pt-2 pb-1 tracking-wider">Back</div>
                            <div className="relative bg-[#F7EEDB] h-32 flex items-center justify-center overflow-hidden" style={hasBack ? CHECKERBOARD : undefined}>
                              {isUploadingThis ? (
                                <LoaderCircle className="w-6 h-6 animate-spin text-[#E6321C]" />
                              ) : hasBack ? (
                                <img
                                  src={resolveImageUrl(color.backImageUrl!)}
                                  alt={`${color.name} Back`}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                                  <ImageOff size={22} className="text-[#171717]/35" />
                                  <span className="text-[8px] font-mono text-[#171717]/40 uppercase">No Photo</span>
                                </div>
                              )}
                            </div>
                            {/* Back action buttons */}
                            <div className="flex border-t-2 border-[#171717]">
                              <button
                                type="button"
                                onClick={() => triggerPhotoUpload(color.id, 'back')}
                                disabled={isUploadingThis}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-black uppercase font-mono text-[#171717] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer border-r border-[#171717]/20"
                              >
                                <Upload size={9} />
                                <span>{hasBack ? 'Replace' : 'Upload'}</span>
                              </button>
                              {hasBack && (
                                <button
                                  type="button"
                                  onClick={() => deleteImage('back')}
                                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] font-black uppercase font-mono bg-[#E6321C] text-white hover:bg-red-800 transition-colors cursor-pointer"
                                  title="Delete back mockup"
                                >
                                  <Trash2 size={9} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status bar */}
                        <div className="px-3 py-1.5 border-t-2 border-[#171717] bg-[#FAF7F2]">
                          <span className={`text-[9px] font-mono font-bold uppercase ${
                            hasFront ? (hasBack ? 'text-emerald-700' : 'text-amber-700') : 'text-[#E6321C]'
                          }`}>
                            {hasFront ? (hasBack ? '✓ Front & back ready' : '⚠ Back photo missing') : '✗ Front photo required'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save Bar for Colors Tab */}
                <div className="p-4 border-2 border-[#171717] bg-[#F7EEDB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[3px_3px_0px_#171717]">
                  <div>
                    <div className="text-xs font-black uppercase text-[#171717]">
                      {hasUnsavedChanges ? '⚠️ You have unsaved image or colorway changes' : '✓ All colorways and photos are published'}
                    </div>
                    <p className="text-[11px] text-[#6F6A63] mt-0.5">
                      Save to immediately reflect your front and back mockup images on the customer customizer (http://localhost:5173/customize).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="btn-primary text-xs gap-2 py-2.5 px-6 font-black uppercase tracking-wider self-start sm:self-auto cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>SAVE TO LIVE FRONTEND</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SIZES */}
            {activeTab === 'sizes' && (
              <div className="space-y-6">
                <div className="p-4 border-2 border-[#171717] bg-[#F7EEDB] space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">Sizes for {activeGarment.name}</h4>
                    <p className="text-[11px] text-[#6F6A63]">
                      Add the sizes you sell. Tap a size to switch it on or off for customers; use the x to remove it.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeGarment.sizes.length === 0 && (
                      <span className="text-xs text-[#6F6A63]">No sizes yet. Add them below.</span>
                    )}
                    {activeGarment.sizes.map((size) => {
                      const isOn = (activeGarment.activeSizes || []).includes(size);
                      return (
                        <span
                          key={size}
                          className={`inline-flex items-center border-2 overflow-hidden ${
                            isOn ? 'border-[#171717]' : 'border-[#171717]/25'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSizeActive(size)}
                            title={isOn ? 'Offered: tap to hide' : 'Hidden: tap to offer'}
                            className={`h-9 px-3 font-mono text-xs font-bold uppercase cursor-pointer ${
                              isOn ? 'bg-[#171717] text-white' : 'bg-white text-[#6F6A63]'
                            }`}
                          >
                            {size}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            aria-label={`Remove size ${size}`}
                            className={`h-9 px-2 cursor-pointer ${isOn ? 'bg-[#2B2825] text-white/70 hover:text-white' : 'bg-white text-[#6F6A63] hover:text-red-600'}`}
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
                        className="admin-input w-60 px-3 py-2 text-xs"
                      />
                      <button type="submit" className="px-3 py-2 border-2 border-[#171717] bg-[#171717] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#E6321C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1 cursor-pointer">
                        <Plus size={12} />
                        <span>Add size</span>
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => addSizes(LETTER_SIZES)}
                      className="px-3 py-2 border-2 border-[#171717] bg-white font-mono text-xs font-bold text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#EDE0CC] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      Add XS–3XL
                    </button>
                    <button
                      type="button"
                      onClick={() => addSizes(NUMERIC_SIZES)}
                      className="px-3 py-2 border-2 border-[#171717] bg-white font-mono text-xs font-bold text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#EDE0CC] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      Add 36–46
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                        Precision Size Measurement Chart
                      </h4>
                      <p className="text-[11px] text-[#6F6A63]">
                        Shown in the storefront size chart. Leave a cell empty if you don't measure it.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetMeasurements}
                        className="text-[10px] font-mono font-bold text-[#171717] px-2 py-1 border-2 border-[#171717] bg-white hover:bg-[#EDE0CC] cursor-pointer"
                      >
                        Fill typical values
                      </button>

                      <div className="flex p-1 bg-[#EDE0CC] border-2 border-[#171717]">
                        <button
                          type="button"
                          onClick={() => setMeasureUnit('in')}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                            measureUnit === 'in' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6F6A63]'
                          }`}
                        >
                          Inches (&quot;)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeasureUnit('cm')}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                            measureUnit === 'cm' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6F6A63]'
                          }`}
                        >
                          Centimeters (cm)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border-2 border-[#171717]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#171717] text-white font-mono text-[10px] uppercase">
                          <th className="p-3">Size</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Chest (Round)</th>
                          <th className="p-3">Total Length</th>
                          <th className="p-3">Shoulder Drop</th>
                          <th className="p-3">Sleeve Length</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#171717]/10 bg-white font-mono">
                        {activeGarment.sizes.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-xs text-[#6F6A63] font-sans">Add sizes above to fill in the chart.</td>
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
                            <tr key={row.size} className={isSizeActive ? 'hover:bg-[#F7EEDB]' : 'bg-[#EDE0CC]/40 opacity-60'}>
                              <td className="p-3 font-extrabold text-[#171717] text-sm">{row.size}</td>
                              <td className="p-3">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    isSizeActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-[#6F6A63]'
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
                                  className="admin-input w-28 px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.length}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'length', e.target.value)}
                                  className="admin-input w-28 px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.shoulder}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'shoulder', e.target.value)}
                                  className="admin-input w-28 px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.sleeve}
                                  onChange={(e) => handleMeasurementChange(measureUnit, row.size, 'sleeve', e.target.value)}
                                  className="admin-input w-28 px-2 py-1 text-xs"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Save Bar for Sizes Tab */}
                <div className="p-4 border-2 border-[#171717] bg-[#F7EEDB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[3px_3px_0px_#171717]">
                  <div>
                    <div className="text-xs font-black uppercase text-[#171717]">
                      {hasUnsavedChanges ? '⚠️ You have unsaved size or measurement changes' : '✓ All sizes and measurements are saved'}
                    </div>
                    <p className="text-[11px] text-[#6F6A63] mt-0.5">
                      Save to update available size selectors and size chart tables on http://localhost:5173/customize.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="btn-primary text-xs gap-2 py-2.5 px-6 font-black uppercase tracking-wider self-start sm:self-auto cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>SAVE TO LIVE FRONTEND</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: PREVIEW SIMULATOR */}
            {activeTab === 'preview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="p-6 bg-[#EDE0CC] border-2 border-[#171717] flex flex-col items-center justify-center relative min-h-[420px]">
                  <div className="relative w-full max-w-[360px] aspect-square border-2 border-[#171717] shadow-[4px_4px_0px_#171717] mt-8">
                    <PrintAreaPreview
                      photoUrl={activeImageUrl ? resolveImageUrl(activeImageUrl) : ''}
                      side={previewSide}
                      areas={printAreasFor(activeGarment.style, activeGarment.printAreas)}
                      focus={focusSpot}
                    />
                  </div>

                  <div className="absolute top-4 right-4 flex gap-1 bg-white p-1 border-2 border-[#171717] shadow-[2px_2px_0px_#171717]">
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
                    <h3 className="text-xl font-black text-[#171717] uppercase mt-0.5">{activeGarment.name}</h3>
                    <p className="text-xs text-[#6F6A63]">{activeGarment.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-2xl font-black text-[#E6321C]">
                        ₹{activeGarment.price.toLocaleString('en-IN')}
                      </span>
                      {activeGarment.compareAtPrice && activeGarment.compareAtPrice > activeGarment.price && (
                        <span className="text-sm font-semibold text-[#6F6A63] line-through">
                          ₹{activeGarment.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="admin-label text-[#6F6A63] mb-2">
                      Select Colorway ({activeGarment.colors.length} Available)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeGarment.colors.map((c, idx) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setPreviewColorIndex(idx)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                            previewColorIndex === idx ? 'ring-2 ring-offset-2 ring-[#171717] scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex, borderColor: '#ddd3c5' }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="admin-label text-[#6F6A63] mb-2">
                      Available Sizes ({activeGarment.activeSizes?.length || 0} Offered)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(activeGarment.activeSizes || []).map((sz) => (
                        <span
                          key={sz}
                          className="px-3 py-1.5 border-2 border-[#171717] bg-white font-mono text-xs font-bold uppercase text-[#171717]"
                        >
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="admin-label mb-0.5">Print placement</div>
                        <p className="text-[11px] text-[#6F6A63] leading-snug">
                          Line the {previewSide === 'FRONT' ? 'front' : 'back'} print areas up with the photo. Applies to every colour of this garment; Publish to save.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateActiveGarment((prev) => ({ ...prev, printAreas: undefined }))}
                        className="btn-outline shrink-0 text-[10px] px-2.5 py-1.5"
                        title="Back to this style's default placement"
                      >
                        <RotateCcw size={12} />
                        Reset
                      </button>
                    </div>
                    {(previewSide === 'FRONT' ? (['front', 'chest'] as const) : (['back'] as const)).map((key) => {
                      const spot = printAreasFor(activeGarment.style, activeGarment.printAreas)[key];
                      return (
                        <fieldset
                          key={key}
                          className="space-y-1.5"
                          onPointerEnter={() => setFocusSpot(key)}
                          onPointerLeave={() => setFocusSpot(null)}
                          onFocus={() => setFocusSpot(key)}
                          onBlur={() => setFocusSpot(null)}
                        >
                          <legend className="text-[11px] font-mono font-black uppercase tracking-wider text-[#171717] mb-1">
                            {key === 'front' ? 'Front print' : key === 'chest' ? 'Left chest logo' : 'Back print'}
                          </legend>
                          {([
                            ['x', 'Across', 5, 95],
                            ['y', 'Down', 5, 95],
                            ['w', 'Width', 5, 80],
                          ] as const).map(([axis, label, min, max]) => (
                            <label key={axis} className="grid grid-cols-[56px_1fr_48px] items-center gap-2 text-[11px] text-[#6F6A63]">
                              <span>{label}</span>
                              <input
                                type="range"
                                min={min}
                                max={max}
                                step={0.5}
                                value={spot[axis]}
                                onChange={(e) => setPrintSpot(key, axis, Number(e.target.value))}
                                className="w-full accent-[#E6321C] cursor-pointer"
                                aria-label={`${key} print ${label.toLowerCase()}`}
                              />
                              <span className="font-mono font-bold text-[#171717] text-right">{spot[axis]}%</span>
                            </label>
                          ))}
                        </fieldset>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-[#F7EEDB] border-2 border-[#171717] text-xs text-[#6F6A63] space-y-1">
                    <div className="font-bold text-[#171717]">Storefront status</div>
                    <div>• Garment: {activeGarment.isActive ? 'Live on /customize' : 'Hidden'}</div>
                    <div>• Colour: {activeColorObj?.name || 'None'}{activeColorObj?.hex ? ` (${activeColorObj.hex})` : ''}</div>
                    <div>
                      • {previewSide === 'FRONT' ? 'Front' : 'Back'} photo:{' '}
                      {activeImageUrl
                        ? 'Uploaded'
                        : previewSide === 'FRONT'
                          ? 'Missing — this colour is hidden from customers until it has one'
                          : 'Missing — customers see a “back photo coming soon” note'}
                    </div>
                  </div>

                  {/* Bottom Save Bar for Preview Tab */}
                  <div className="p-4 border-2 border-[#171717] bg-[#F7EEDB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[3px_3px_0px_#171717]">
                    <div>
                      <div className="text-xs font-black uppercase text-[#171717]">
                        {hasUnsavedChanges ? '⚠️ You have unsaved print area or garment changes' : '✓ Custom studio is ready and live'}
                      </div>
                      <p className="text-[11px] text-[#6F6A63] mt-0.5">
                        Save all changes to update the live customer studio on http://localhost:5173/customize.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={saving}
                      className="btn-primary text-xs gap-2 py-2.5 px-6 font-black uppercase tracking-wider self-start sm:self-auto cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          <span>SAVING...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>SAVE TO LIVE FRONTEND</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BAUHAUS ADD / EDIT COLORWAY MODAL */}
      {showColorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#F7EEDB] border-2 border-[#171717] p-6 sm:p-7 max-w-lg w-full shadow-[8px_8px_0px_#171717]">
            <div className="flex justify-between items-center pb-3 border-b-2 border-[#171717] mb-5">
              <h3 className="text-base font-black uppercase tracking-wide text-[#171717] font-sans">
                {editingColorId ? 'Edit Colorway' : 'Add New Colorway'}
              </h3>
              <button
                type="button"
                onClick={() => setShowColorModal(false)}
                className="w-7 h-7 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white flex items-center justify-center text-[#171717] font-bold transition-colors shadow-[2px_2px_0px_#171717] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveColorForm} className="space-y-4">
              <div>
                <label className="admin-label">
                  Color Name *
                </label>
                <input
                  type="text"
                  value={colorForm.name}
                  onChange={(e) => setColorForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sage Green, Washed Charcoal"
                  className="admin-input font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717]/70 block mb-1.5">
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
                      className="px-2.5 py-1 border-2 border-[#171717] text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 bg-white hover:bg-[#F7EEDB] transition-colors cursor-pointer shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <span className="w-3 h-3 border border-[#171717]" style={{ backgroundColor: item.hex }} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="admin-label">
                    Hex Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorForm.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-9 h-9 border-2 border-[#171717] p-0.5 cursor-pointer flex-shrink-0 shadow-[2px_2px_0px_#171717]"
                    />
                    <input
                      type="text"
                      value={colorForm.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="admin-input font-mono text-xs font-bold uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">
                    Ink Contrast
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setColorForm((p) => ({ ...p, textContrast: '#FFFFFF' }))}
                      className={`flex-1 py-2 text-xs font-mono font-bold uppercase border-2 border-[#171717] transition-all cursor-pointer ${
                        colorForm.textContrast === '#FFFFFF'
                          ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                          : 'bg-white text-[#171717] shadow-[2px_2px_0px_#171717]'
                      }`}
                    >
                      Light Ink
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorForm((p) => ({ ...p, textContrast: '#171717' }))}
                      className={`flex-1 py-2 text-xs font-mono font-bold uppercase border-2 border-[#171717] transition-all cursor-pointer ${
                        colorForm.textContrast === '#171717'
                          ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                          : 'bg-white text-[#171717] shadow-[2px_2px_0px_#171717]'
                      }`}
                    >
                      Dark Ink
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t-2 border-[#171717]">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717] block mb-1">
                    Front Photo *
                  </label>
                  <div className="flex items-center gap-2">
                    {colorForm.frontImageUrl && (
                      <img src={resolveImageUrl(colorForm.frontImageUrl)} alt="" className="w-10 h-10 object-contain border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]" />
                    )}
                    <button
                      type="button"
                      onClick={() => triggerPhotoUpload(MODAL_UPLOAD, 'front')}
                      disabled={uploadingColorId === MODAL_UPLOAD}
                      className="btn-secondary py-1 px-3 text-[10px] font-bold"
                    >
                      {uploadingColorId === MODAL_UPLOAD && activeUploadTarget?.side === 'front' ? <LoaderCircle size={12} className="animate-spin" /> : <Upload size={12} />}
                      <span>{colorForm.frontImageUrl ? 'Replace' : 'Upload'}</span>
                    </button>
                    <input
                      type="text"
                      value={colorForm.frontImageUrl}
                      onChange={(e) => setColorForm((prev) => ({ ...prev, frontImageUrl: e.target.value }))}
                      placeholder="or paste an https:// image link"
                      className="admin-input flex-1 min-w-0 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717] block mb-1">
                    Back Photo
                  </label>
                  <div className="flex items-center gap-2">
                    {colorForm.backImageUrl && (
                      <img src={resolveImageUrl(colorForm.backImageUrl)} alt="" className="w-10 h-10 object-contain border-2 border-[#171717] bg-white shadow-[2px_2px_0px_#171717]" />
                    )}
                    <button
                      type="button"
                      onClick={() => triggerPhotoUpload(MODAL_UPLOAD, 'back')}
                      disabled={uploadingColorId === MODAL_UPLOAD}
                      className="btn-secondary py-1 px-3 text-[10px] font-bold"
                    >
                      {uploadingColorId === MODAL_UPLOAD && activeUploadTarget?.side === 'back' ? <LoaderCircle size={12} className="animate-spin" /> : <Upload size={12} />}
                      <span>{colorForm.backImageUrl ? 'Replace' : 'Upload'}</span>
                    </button>
                    <input
                      type="text"
                      value={colorForm.backImageUrl}
                      onChange={(e) => setColorForm((prev) => ({ ...prev, backImageUrl: e.target.value }))}
                      placeholder="or paste an https:// image link"
                      className="admin-input flex-1 min-w-0 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2 border-t-2 border-[#171717]">
                <button
                  type="button"
                  onClick={() => setShowColorModal(false)}
                  className="btn-outline flex-1 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveColorFormAndPublish}
                  disabled={saving}
                  className="flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider bg-[#E6321C] text-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:bg-[#ff3820] flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                  title="Save this colorway and push all garments live to the customer storefront immediately"
                >
                  {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save & Publish Live</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 text-xs font-bold uppercase bg-[#171717] text-white border-2 border-[#171717] hover:bg-black flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#171717]"
                  title="Save changes in local memory; you can publish to frontend later"
                >
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STICKY FLOATING ACTION BAR FOR UNSAVED CHANGES */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(calc(100%-32px),680px)] bg-[#171717] text-white border-2 border-[#E6321C] shadow-[6px_6px_0px_#E6321C] p-3 sm:p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3 h-3 rounded-full bg-[#E6321C] animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-wider text-white truncate">
                Unsaved Studio Changes Ready to Publish
              </div>
              <div className="text-[10px] text-[#F7EEDB]/80 truncate hidden sm:block">
                Click Save to immediately display your uploaded images on http://localhost:5173/customize
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 bg-[#E6321C] text-white font-mono text-xs font-black uppercase tracking-wider border-2 border-white hover:bg-[#ff3b20] active:scale-95 transition-all shadow-[2px_2px_0px_white] flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <LoaderCircle size={13} className="animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>SAVE TO FRONTEND NOW</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizerStudioPage;
