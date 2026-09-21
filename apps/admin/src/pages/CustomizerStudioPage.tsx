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

export interface GarmentItem {
  id: string; // 'tshirt' | 'oversized' | 'hoodie'
  name: string;
  price: number;
  compareAtPrice?: number;
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
  updatedAt: string;
}

// ─── Default Sizing Constants ───────────────────────────────────────────────
const ALL_AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const DEFAULT_MEASUREMENTS: Record<string, { cm: MeasurementRow[]; in: MeasurementRow[] }> = {
  oversized: {
    cm: [
      { size: 'XS', chest: '102 cm', length: '69 cm', shoulder: '51 cm', sleeve: '22 cm' },
      { size: 'S', chest: '107 cm', length: '71 cm', shoulder: '53 cm', sleeve: '23 cm' },
      { size: 'M', chest: '112 cm', length: '74 cm', shoulder: '56 cm', sleeve: '24 cm' },
      { size: 'L', chest: '117 cm', length: '76 cm', shoulder: '58 cm', sleeve: '25 cm' },
      { size: 'XL', chest: '122 cm', length: '79 cm', shoulder: '61 cm', sleeve: '26 cm' },
      { size: 'XXL', chest: '127 cm', length: '81 cm', shoulder: '64 cm', sleeve: '27 cm' },
      { size: '3XL', chest: '132 cm', length: '83 cm', shoulder: '67 cm', sleeve: '28 cm' },
    ],
    in: [
      { size: 'XS', chest: '40 in', length: '27 in', shoulder: '20 in', sleeve: '8.5 in' },
      { size: 'S', chest: '42 in', length: '28 in', shoulder: '21 in', sleeve: '9.0 in' },
      { size: 'M', chest: '44 in', length: '29 in', shoulder: '22 in', sleeve: '9.5 in' },
      { size: 'L', chest: '46 in', length: '30 in', shoulder: '23 in', sleeve: '10.0 in' },
      { size: 'XL', chest: '48 in', length: '31 in', shoulder: '24 in', sleeve: '10.5 in' },
      { size: 'XXL', chest: '50 in', length: '32 in', shoulder: '25 in', sleeve: '11.0 in' },
      { size: '3XL', chest: '52 in', length: '33 in', shoulder: '26.5 in', sleeve: '11.5 in' },
    ],
  },
  tshirt: {
    cm: [
      { size: 'XS', chest: '96 cm', length: '66 cm', shoulder: '42 cm', sleeve: '20 cm' },
      { size: 'S', chest: '102 cm', length: '68 cm', shoulder: '44 cm', sleeve: '21 cm' },
      { size: 'M', chest: '108 cm', length: '70 cm', shoulder: '46 cm', sleeve: '22 cm' },
      { size: 'L', chest: '114 cm', length: '72 cm', shoulder: '48 cm', sleeve: '23 cm' },
      { size: 'XL', chest: '120 cm', length: '74 cm', shoulder: '50 cm', sleeve: '24 cm' },
      { size: 'XXL', chest: '126 cm', length: '76 cm', shoulder: '52 cm', sleeve: '25 cm' },
      { size: '3XL', chest: '132 cm', length: '78 cm', shoulder: '54 cm', sleeve: '26 cm' },
    ],
    in: [
      { size: 'XS', chest: '38 in', length: '26 in', shoulder: '16.5 in', sleeve: '8 in' },
      { size: 'S', chest: '40 in', length: '27 in', shoulder: '17.5 in', sleeve: '8.2 in' },
      { size: 'M', chest: '42.5 in', length: '27.5 in', shoulder: '18 in', sleeve: '8.6 in' },
      { size: 'L', chest: '45 in', length: '28.5 in', shoulder: '19 in', sleeve: '9 in' },
      { size: 'XL', chest: '47 in', length: '29 in', shoulder: '19.5 in', sleeve: '9.4 in' },
      { size: 'XXL', chest: '49.5 in', length: '30 in', shoulder: '20.5 in', sleeve: '9.8 in' },
      { size: '3XL', chest: '52 in', length: '31 in', shoulder: '21.5 in', sleeve: '10.2 in' },
    ],
  },
  hoodie: {
    cm: [
      { size: 'XS', chest: '108 cm', length: '68 cm', shoulder: '52 cm', sleeve: '60 cm' },
      { size: 'S', chest: '114 cm', length: '70 cm', shoulder: '54 cm', sleeve: '61 cm' },
      { size: 'M', chest: '120 cm', length: '72 cm', shoulder: '56 cm', sleeve: '62 cm' },
      { size: 'L', chest: '126 cm', length: '74 cm', shoulder: '58 cm', sleeve: '63 cm' },
      { size: 'XL', chest: '132 cm', length: '76 cm', shoulder: '60 cm', sleeve: '64 cm' },
      { size: 'XXL', chest: '138 cm', length: '78 cm', shoulder: '62 cm', sleeve: '65 cm' },
      { size: '3XL', chest: '144 cm', length: '80 cm', shoulder: '64 cm', sleeve: '66 cm' },
    ],
    in: [
      { size: 'XS', chest: '42.5 in', length: '26.8 in', shoulder: '20.5 in', sleeve: '23.6 in' },
      { size: 'S', chest: '44.8 in', length: '27.5 in', shoulder: '21.2 in', sleeve: '24 in' },
      { size: 'M', chest: '47.2 in', length: '28.3 in', shoulder: '22.0 in', sleeve: '24.4 in' },
      { size: 'L', chest: '49.6 in', length: '29.1 in', shoulder: '22.8 in', sleeve: '24.8 in' },
      { size: 'XL', chest: '52.0 in', length: '30.0 in', shoulder: '23.6 in', sleeve: '25.2 in' },
      { size: 'XXL', chest: '54.3 in', length: '30.7 in', shoulder: '24.4 in', sleeve: '25.6 in' },
      { size: '3XL', chest: '56.7 in', length: '31.5 in', shoulder: '25.2 in', sleeve: '26.0 in' },
    ],
  },
};

const SIGNATURE_PALETTE = [
  { name: 'Obsidian Black', hex: '#171717', contrast: '#FFFFFF' },
  { name: 'Pure White', hex: '#FFFFFF', contrast: '#171717' },
  { name: 'Washed Sand', hex: '#D8C8B1', contrast: '#171717' },
  { name: 'Atelier Red', hex: '#E6321C', contrast: '#FFFFFF' },
  { name: 'Sage Green', hex: '#4A584A', contrast: '#FFFFFF' },
  { name: 'Vintage Cream', hex: '#F7EEDB', contrast: '#171717' },
  { name: 'Deep Navy', hex: '#1D3557', contrast: '#FFFFFF' },
  { name: 'Gold Ochre', hex: '#B7791F', contrast: '#FFFFFF' },
  { name: 'Charcoal Grey', hex: '#2B2B2B', contrast: '#FFFFFF' },
];

const DEFAULT_GARMENTS: GarmentItem[] = [
  {
    id: 'tshirt',
    name: 'Classic T-Shirt',
    price: 999,
    compareAtPrice: 1499,
    description: '100% Combed Cotton · Classic Everyday Crewneck (180 GSM)',
    isActive: true,
    sizes: [...ALL_AVAILABLE_SIZES],
    activeSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: DEFAULT_MEASUREMENTS.tshirt,
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png', isActive: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png', isActive: true },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
  {
    id: 'oversized',
    name: 'Oversized Tee',
    price: 1299,
    compareAtPrice: 1799,
    description: '240 GSM Heavyweight French Terry · Signature Drop-Shoulder Streetwear Cut',
    isActive: true,
    sizes: [...ALL_AVAILABLE_SIZES],
    activeSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: DEFAULT_MEASUREMENTS.oversized,
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png', isActive: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png', isActive: true },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
  {
    id: 'hoodie',
    name: 'Heavyweight Hoodie',
    price: 2499,
    compareAtPrice: 3499,
    description: '350 GSM Brushed Fleece Pullover · Double-Layered Thermal Hood',
    isActive: true,
    sizes: [...ALL_AVAILABLE_SIZES],
    activeSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: DEFAULT_MEASUREMENTS.hoodie,
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/hoodie-black-front.png', backImageUrl: '/custom/hoodie-black-back.png', isActive: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/hoodie-white-front.png', backImageUrl: '/custom/hoodie-white-back.png', isActive: true },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '', isActive: true },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '', isActive: true },
    ],
  },
];

function SilhouettePreview({ garmentId, colorHex }: { garmentId: string; colorHex: string }) {
  const isLight = ['#FFFFFF', '#D8C8B1', '#F7EEDB', '#C8B99D', '#FAF6EE'].some(
    (h) => colorHex?.toUpperCase() === h
  );
  const strokeColor = isLight ? '#2B2B2B' : '#FFFFFF';

  if (garmentId === 'hoodie') {
    return (
      <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-md" fill="none">
        <path
          d="M130 65 C130 35, 270 35, 270 65 C280 85, 275 110, 260 115 C240 120, 210 118, 200 125 C190 118, 160 120, 140 115 C125 110, 120 85, 130 65 Z"
          fill={colorHex}
          stroke={strokeColor}
          strokeWidth="3"
        />
        <path
          d="M138 108 L55 185 C48 192, 42 208, 55 220 L80 238 C90 245, 102 238, 110 228 L142 188 L140 375 C140 388, 150 395, 165 395 L235 395 C250 395, 260 388, 260 375 L258 188 L290 228 C298 238, 310 245, 320 238 L345 220 C358 208, 352 192, 345 185 L262 108 C242 118, 222 122, 200 122 C178 122, 158 118, 138 108 Z"
          fill={colorHex}
          stroke={strokeColor}
          strokeWidth="3.5"
        />
        <path
          d="M165 290 L235 290 L248 355 L152 355 Z"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          opacity="0.6"
        />
      </svg>
    );
  }

  const isOversized = garmentId === 'oversized';
  return (
    <svg viewBox="0 0 400 440" className="w-full h-full drop-shadow-md" fill="none">
      <path
        d={
          isOversized
            ? 'M145 78 C175 92, 225 92, 255 78 L330 135 C345 147, 335 175, 315 185 L285 195 L285 390 C285 402, 275 408, 260 408 L140 408 C125 408, 115 402, 115 390 L115 195 L85 185 C65 175, 55 147, 70 135 Z'
            : 'M148 80 C175 92, 225 92, 252 80 L318 128 C330 137, 324 160, 308 168 L282 178 L282 388 C282 398, 274 405, 260 405 L140 405 C126 405, 118 398, 118 388 L118 178 L92 168 C76 160, 70 137, 82 128 Z'
        }
        fill={colorHex}
        stroke={strokeColor}
        strokeWidth="3.5"
      />
      <path
        d="M148 80 C175 102, 225 102, 252 80"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        opacity="0.75"
      />
    </svg>
  );
}

export function CustomizerStudioPage() {
  const { toast } = useToast();

  const [config, setConfig] = useState<CustomizerStudioConfig>({
    garments: DEFAULT_GARMENTS,
    updatedAt: new Date().toISOString(),
  });
  const [selectedGarmentId, setSelectedGarmentId] = useState<string>('oversized');
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

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.get<any>('/customizations/studio/config');
      const garmentsRaw = data?.data?.garments || data?.garments;
      if (Array.isArray(garmentsRaw) && garmentsRaw.length > 0) {
        const enriched = garmentsRaw.map((g: any) => ({
          ...g,
          sizes: g.sizes?.length ? g.sizes : [...ALL_AVAILABLE_SIZES],
          activeSizes: g.activeSizes?.length ? g.activeSizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          sizeMeasurements: g.sizeMeasurements || DEFAULT_MEASUREMENTS[g.id] || DEFAULT_MEASUREMENTS.oversized,
          compareAtPrice: g.compareAtPrice || Math.round(g.price * 1.4),
        }));
        setConfig({
          garments: enriched,
          updatedAt: data?.updatedAt || new Date().toISOString(),
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
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

  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const payload: CustomizerStudioConfig = {
        garments: config.garments,
        updatedAt: new Date().toISOString(),
      };
      await api.put('/customizations/studio/config', payload);
      setHasUnsavedChanges(false);
      toast.success('Live Customizer Updated', 'All prices, sizes, and colors are live on the customer customizer.');
      setStatusMessage({
        type: 'success',
        text: '✓ Successfully published changes! Storefront is now synchronized.',
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

    try {
      let finalUrl = '';
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'garments');
        formData.append('name', `${activeGarment.id}-${colorId}-${side}`);

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
        // Fallback
      }

      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || '');
          reader.readAsDataURL(file);
        });
      }

      if (!finalUrl) throw new Error('Could not read image file.');

      updateActiveGarment((prev) => ({
        ...prev,
        colors: prev.colors.map((c) => {
          if (c.id !== colorId) return c;
          return side === 'front'
            ? { ...c, frontImageUrl: finalUrl }
            : { ...c, backImageUrl: finalUrl };
        }),
      }));

      toast.success('Photo Attached', `Updated ${side} view for ${colorId}.`);
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
      if (current.length <= 1) {
        toast.error('Validation Warning', 'At least one size must remain active.');
        return;
      }
      next = current.filter((s) => s !== size);
    } else {
      next = [...current, size];
    }

    updateActiveGarment((prev) => ({ ...prev, activeSizes: next }));
  };

  const handleMeasurementChange = (
    unit: 'cm' | 'in',
    size: string,
    field: 'chest' | 'length' | 'shoulder' | 'sleeve',
    value: string
  ) => {
    updateActiveGarment((prev) => {
      const baseMeasurements = prev.sizeMeasurements || DEFAULT_MEASUREMENTS[prev.id] || DEFAULT_MEASUREMENTS.oversized;
      const rows = [...(baseMeasurements[unit] || [])];
      const idx = rows.findIndex((r) => r.size === size);

      if (idx >= 0) {
        rows[idx] = { ...rows[idx], [field]: value };
      } else {
        rows.push({
          size,
          chest: field === 'chest' ? value : '—',
          length: field === 'length' ? value : '—',
          shoulder: field === 'shoulder' ? value : '—',
          sleeve: field === 'sleeve' ? value : '—',
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
    if (!confirm(`Reset all measurements for ${activeGarment.name} to industry defaults?`)) return;
    updateActiveGarment((prev) => ({
      ...prev,
      sizeMeasurements: DEFAULT_MEASUREMENTS[prev.id] || DEFAULT_MEASUREMENTS.oversized,
    }));
    toast.success('Measurements Reset', 'Restored standard garment dimension chart.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#E6321C]" />
        <p className="text-sm font-bold text-gray-600">Loading 3D Customizer Studio...</p>
      </div>
    );
  }

  const activeColorObj = activeGarment?.colors?.[previewColorIndex] || activeGarment?.colors?.[0];
  const activeImageUrl =
    previewSide === 'BACK'
      ? activeColorObj?.backImageUrl || activeColorObj?.frontImageUrl
      : activeColorObj?.frontImageUrl;

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
              3D Customizer Studio Manager
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            Control garment silhouettes, live DTF pricing, active colorways, mockups, and measurement matrices.
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

      {/* GARMENT SILHOUETTES SWITCHER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.garments.map((garment) => {
          const isSelected = garment.id === selectedGarmentId;
          const activeColorCount = garment.colors?.filter((c) => c.isActive !== false).length || 0;
          const sampleColorHex = garment.colors?.[0]?.hex || '#171717';

          return (
            <div
              key={garment.id}
              onClick={() => {
                setSelectedGarmentId(garment.id);
                setPreviewColorIndex(0);
              }}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative bg-white shadow-sm hover:shadow-md ${
                isSelected ? 'border-[#E6321C] ring-2 ring-[#E6321C]/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    garment.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {garment.isActive ? 'Active on Store' : 'Hidden'}
                </span>

                <span className="text-[10px] font-mono text-gray-400">ID: {garment.id}</span>
              </div>

              <div className="flex items-center gap-4 my-2">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 flex-shrink-0 overflow-hidden">
                  <SilhouettePreview garmentId={garment.id} colorHex={sampleColorHex} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">{garment.name}</h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{garment.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-extrabold text-[#E6321C]">₹{garment.price.toLocaleString('en-IN')}</span>
                    {garment.compareAtPrice && garment.compareAtPrice > garment.price && (
                      <span className="text-xs font-medium text-gray-400 line-through">
                        ₹{garment.compareAtPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{activeColorCount} Colors Configured</span>
                <span>{(garment.activeSizes || []).join(', ')}</span>
              </div>
            </div>
          );
        })}
      </div>

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

            <div className="flex p-1 bg-gray-100 rounded-2xl gap-1">
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
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
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
                        value={activeGarment.compareAtPrice || Math.round(activeGarment.price * 1.4)}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 0);
                          updateActiveGarment((prev) => ({ ...prev, compareAtPrice: val }));
                        }}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-base font-extrabold text-gray-900 focus:outline-none focus:border-[#E6321C]"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      Shown with strikethrough to highlight savings for customer value.
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
                      Garment Silhouette Display Name
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
                      Fabric & Specification Subtitle
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

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Silhouette Availability</div>
                    <div className="text-xs text-gray-500">
                      Enable or disable this garment type from appearing in the storefront customizer studio.
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
              </div>
            )}

            {/* TAB 2: COLORS */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase">Configured Colorways & Photo Mockups</h3>
                    <p className="text-xs text-gray-500">
                      Attach real-life front and back garment photography for photorealistic customer previews.
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

                              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
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

                              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
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
                            {hasFront ? '✓ Photo Ready' : '• Vector Silhouette'}
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
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                        Offered Sizes for {activeGarment.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Toggle which sizes customers can select. Inactive sizes are hidden on the customizer.
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateActiveGarment((prev) => ({ ...prev, activeSizes: [...ALL_AVAILABLE_SIZES] }))}
                        className="text-[10px] font-bold text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md bg-white border border-gray-200 cursor-pointer"
                      >
                        Enable All
                      </button>
                      <button
                        type="button"
                        onClick={() => updateActiveGarment((prev) => ({ ...prev, activeSizes: ['M', 'L', 'XL'] }))}
                        className="text-[10px] font-bold text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md bg-white border border-gray-200 cursor-pointer"
                      >
                        Standard (M-XL)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ALL_AVAILABLE_SIZES.map((size) => {
                      const isActive = (activeGarment.activeSizes || []).includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSizeActive(size)}
                          className={`w-12 h-10 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center justify-center cursor-pointer border ${
                            isActive
                              ? 'bg-gray-900 text-white border-gray-900 shadow-sm ring-2 ring-gray-900/10'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                        Precision Size Measurement Chart
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Displayed in the customer dynamic size guide modal. Admin can customize every dimension.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetMeasurements}
                        className="text-[10px] font-bold text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg border border-gray-200 bg-white cursor-pointer"
                      >
                        Reset Defaults
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
                        {((activeGarment.sizeMeasurements || DEFAULT_MEASUREMENTS[activeGarment.id] || DEFAULT_MEASUREMENTS.oversized)[measureUnit] || []).map((row) => {
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
                      <div className="scale-110">
                        <SilhouettePreview garmentId={activeGarment.id} colorHex={activeColorObj?.hex || '#171717'} />
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
                    <div>• Mockup Status: {activeImageUrl ? 'Real Photo Loaded' : 'Vector SVG Fallback'}</div>
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
                    Front Mockup URL (or upload from color card)
                  </label>
                  <input
                    type="text"
                    value={colorForm.frontImageUrl}
                    onChange={(e) => setColorForm((prev) => ({ ...prev, frontImageUrl: e.target.value }))}
                    placeholder="/custom/black-front.png or https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Back Mockup URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={colorForm.backImageUrl}
                    onChange={(e) => setColorForm((prev) => ({ ...prev, backImageUrl: e.target.value }))}
                    placeholder="/custom/black-back.png or https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-mono"
                  />
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
