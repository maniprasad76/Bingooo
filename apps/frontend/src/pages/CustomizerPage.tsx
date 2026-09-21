import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  Check, ArrowRight, ZoomIn, ZoomOut, Type, Upload,
  Image as ImageIcon, Bold, Italic, Crosshair, ShoppingBag,
  RotateCw, Undo2, Redo2, Trash2, Sparkles,
  Eye, Share2, Bookmark, Download, Ruler, Copy, X,
  User, Palette
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { SEO } from '../components/common/SEO';
import { WhatsAppIcon } from '../components/ui/SocialIcons';
import { api } from '../lib/api/client';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ColorOption {
  id?: string;
  name: string;
  hex: string;
  textContrast: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  isActive?: boolean;
}

export interface GarmentType {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  isActive?: boolean;
  colors?: ColorOption[];
  sizes?: string[];
  activeSizes?: string[];
  sizeMeasurements?: {
    cm: Array<{ size: string; chest: string; length: string; shoulder: string; sleeve: string }>;
    in: Array<{ size: string; chest: string; length: string; shoulder: string; sleeve: string }>;
  };
}

interface DesignSnapshot {
  dragXVal: number;
  dragYVal: number;
  zoomScale: number;
  rotation: number;
  customText: string;
  selectedFont: string;
  isBold: boolean;
  isItalic: boolean;
  isUppercase: boolean;
  textColor: string;
  letterSpacing: string;
  uploadedImage: string | null;
  designMode: 'upload' | 'text';
}

export interface SavedCustomDesign {
  id: string;
  name: string;
  garmentId: string;
  garmentName: string;
  colorName: string;
  colorHex: string;
  price: number;
  size: string;
  viewSide: 'FRONT' | 'BACK';
  customText: string;
  selectedFont: string;
  uploadedImage: string | null;
  designMode: 'upload' | 'text';
  zoomScale: number;
  rotation: number;
  dragXVal: number;
  dragYVal: number;
  textColor: string;
  createdAt: string;
}

// ─── Models for Dynamic Fit Visualizer ───────────────────────────────────────
interface FitModel {
  name: string;
  height: string;
  weight: string;
  sizeWorn: string;
  fitStyle: string;
  silhouette: string;
  notes: string;
  chest: string;
}

const FIT_MODELS: FitModel[] = [
  {
    name: 'Arjun',
    height: "5'11\" (180 cm)",
    weight: '74 kg',
    sizeWorn: 'L',
    fitStyle: 'Signature Drop-Shoulder Oversized',
    silhouette: 'BOXY STREETWEAR',
    notes: 'Generous 3-inch chest drape with dropped seam falls right below the natural shoulder line. Sits at upper hip.',
    chest: '40" (101 cm)',
  },
  {
    name: 'Vikram',
    height: "5'8\" (173 cm)",
    weight: '68 kg',
    sizeWorn: 'M',
    fitStyle: 'Relaxed Casual Everyday Cut',
    silhouette: 'RELAXED ESSENTIAL',
    notes: 'Slightly dropped shoulder with clean vertical drape. Zero bunching around waistband. Ideal balance of room and structure.',
    chest: '38" (96 cm)',
  },
  {
    name: 'Kabir',
    height: "6'2\" (188 cm)",
    weight: '86 kg',
    sizeWorn: 'XL',
    fitStyle: 'Ultra Heavyweight Statement Cut',
    silhouette: 'ARCHIVAL STATEMENT',
    notes: 'Substantial room through the bicep and lats. Rigid 240 GSM body creates architectural streetwear silhouette.',
    chest: '44" (112 cm)',
  },
];

// ─── Static Garments & Colors ────────────────────────────────────────────────
const SHIRT_COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png' },
  { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png' },
  { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png' },
  { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png' },
];

const HOODIE_COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/hoodie-black-front.png', backImageUrl: '/custom/hoodie-black-back.png' },
  { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/hoodie-white-front.png', backImageUrl: '/custom/hoodie-white-back.png' },
  { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717' },
  { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF' },
];

const COLORS: ColorOption[] = SHIRT_COLORS;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ─── Size Measurements (cm / in) ─────────────────────────────────────────────
const SIZE_TABLE = {
  oversized: {
    cm: [
      { size: 'XS', chest: '102 cm', length: '69 cm', shoulder: '51 cm', sleeve: '22 cm' },
      { size: 'S', chest: '107 cm', length: '71 cm', shoulder: '53 cm', sleeve: '23 cm' },
      { size: 'M', chest: '112 cm', length: '74 cm', shoulder: '56 cm', sleeve: '24 cm' },
      { size: 'L', chest: '117 cm', length: '76 cm', shoulder: '58 cm', sleeve: '25 cm' },
      { size: 'XL', chest: '122 cm', length: '79 cm', shoulder: '61 cm', sleeve: '26 cm' },
      { size: 'XXL', chest: '127 cm', length: '81 cm', shoulder: '64 cm', sleeve: '27 cm' },
    ],
    in: [
      { size: 'XS', chest: '40 in', length: '27 in', shoulder: '20 in', sleeve: '8.5 in' },
      { size: 'S', chest: '42 in', length: '28 in', shoulder: '21 in', sleeve: '9.0 in' },
      { size: 'M', chest: '44 in', length: '29 in', shoulder: '22 in', sleeve: '9.5 in' },
      { size: 'L', chest: '46 in', length: '30 in', shoulder: '23 in', sleeve: '10.0 in' },
      { size: 'XL', chest: '48 in', length: '31 in', shoulder: '24 in', sleeve: '10.5 in' },
      { size: 'XXL', chest: '50 in', length: '32 in', shoulder: '25 in', sleeve: '11.0 in' },
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
    ],
    in: [
      { size: 'XS', chest: '38 in', length: '26 in', shoulder: '16.5 in', sleeve: '8 in' },
      { size: 'S', chest: '40 in', length: '27 in', shoulder: '17.5 in', sleeve: '8.2 in' },
      { size: 'M', chest: '42.5 in', length: '27.5 in', shoulder: '18 in', sleeve: '8.6 in' },
      { size: 'L', chest: '45 in', length: '28.5 in', shoulder: '19 in', sleeve: '9 in' },
      { size: 'XL', chest: '47 in', length: '29 in', shoulder: '19.5 in', sleeve: '9.4 in' },
      { size: 'XXL', chest: '49.5 in', length: '30 in', shoulder: '20.5 in', sleeve: '9.8 in' },
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
    ],
    in: [
      { size: 'XS', chest: '42.5 in', length: '26.8 in', shoulder: '20.5 in', sleeve: '23.6 in' },
      { size: 'S', chest: '44.8 in', length: '27.5 in', shoulder: '21.2 in', sleeve: '24 in' },
      { size: 'M', chest: '47.2 in', length: '28.3 in', shoulder: '22.0 in', sleeve: '24.4 in' },
      { size: 'L', chest: '49.6 in', length: '29.1 in', shoulder: '22.8 in', sleeve: '24.8 in' },
      { size: 'XL', chest: '52.0 in', length: '30.0 in', shoulder: '23.6 in', sleeve: '25.2 in' },
      { size: 'XXL', chest: '54.3 in', length: '30.7 in', shoulder: '24.4 in', sleeve: '25.6 in' },
    ],
  },
};

const GARMENTS: GarmentType[] = [
  {
    id: 'oversized',
    name: 'Oversized',
    price: 1299,
    compareAtPrice: 1699,
    description: '240 GSM Heavyweight · Drop-Shoulder Streetwear Fit',
    isActive: true,
    colors: SHIRT_COLORS.map(c => ({ ...c })),
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    activeSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: SIZE_TABLE.oversized,
  },
  {
    id: 'tshirt',
    name: 'T-Shirt',
    price: 999,
    compareAtPrice: 1299,
    description: '100% Combed Cotton · Classic Structured Crewneck',
    isActive: true,
    colors: SHIRT_COLORS.map(c => ({ ...c })),
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    activeSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: SIZE_TABLE.tshirt,
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    price: 2499,
    compareAtPrice: 3199,
    description: '350 GSM Brushed Fleece · Heavy Pullover Silhouette',
    isActive: true,
    colors: HOODIE_COLORS.map(c => ({ ...c })),
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    activeSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: SIZE_TABLE.hoodie,
  },
];

// ─── Font Options ────────────────────────────────────────────────────────────
interface FontOption {
  id: string;
  name: string;
  label: string;
  family: string;
  category: 'street' | 'luxury' | 'creative';
  preview: string;
}

const FONT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'street', label: 'Street' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'creative', label: 'Creative' },
];

const FONT_OPTIONS: FontOption[] = [
  { id: 'manrope', name: 'Manrope', label: 'Clean Modern', family: "'Manrope', sans-serif", category: 'street', preview: 'BINGOOO' },
  { id: 'outfit', name: 'Outfit', label: 'High-End Street', family: "'Outfit', sans-serif", category: 'street', preview: 'STREET' },
  { id: 'anton', name: 'Anton', label: 'Ultra Heavy', family: "'Anton', sans-serif", category: 'street', preview: 'HEAVY' },
  { id: 'bebas', name: 'Bebas Neue', label: 'Bold Headline', family: "'Bebas Neue', sans-serif", category: 'street', preview: 'HEADLINE' },
  { id: 'space', name: 'Space Grotesk', label: 'Brutalist Tech', family: "'Space Grotesk', sans-serif", category: 'street', preview: 'BRUTAL' },
  { id: 'russo', name: 'Russo One', label: 'Impact Block', family: "'Russo One', sans-serif", category: 'street', preview: 'IMPACT' },
  { id: 'bungee', name: 'Bungee', label: 'Cyber Arcade', family: "'Bungee', cursive", category: 'street', preview: 'ARCADE' },
  { id: 'playfair', name: 'Playfair', label: 'Vogue Editorial', family: "'Playfair Display', serif", category: 'luxury', preview: 'Atelier' },
  { id: 'cinzel', name: 'Cinzel', label: 'Royal Roman', family: "'Cinzel', serif", category: 'luxury', preview: 'IMPERIAL' },
  { id: 'prata', name: 'Prata', label: 'Haute Couture', family: "'Prata', serif", category: 'luxury', preview: 'Elegance' },
  { id: 'cormorant', name: 'Cormorant', label: 'Archival Serif', family: "'Cormorant Garamond', serif", category: 'luxury', preview: 'Archival' },
  { id: 'syne', name: 'Syne', label: 'Avant-Garde', family: "'Syne', sans-serif", category: 'luxury', preview: 'AVANT' },
  { id: 'marker', name: 'Permanent Marker', label: 'Graffiti Tag', family: "'Permanent Marker', cursive", category: 'creative', preview: 'GRAFFITI' },
  { id: 'caveat', name: 'Caveat', label: 'Artisan Script', family: "'Caveat', cursive", category: 'creative', preview: 'Handwritten' },
  { id: 'righteous', name: 'Righteous', label: 'Retro 80s', family: "'Righteous', cursive", category: 'creative', preview: 'SYNTHWAVE' },
  { id: 'mono', name: 'IBM Plex Mono', label: 'Technical Spec', family: "'IBM Plex Mono', monospace", category: 'creative', preview: '240_GSM' },
  { id: 'majormono', name: 'Major Mono', label: 'Glitch Mono', family: "'Major Mono Display', monospace", category: 'creative', preview: '001//BIO' },
];

const TEXT_COLORS = [
  { name: 'Auto', hex: '' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#171717' },
  { name: 'Cream', hex: '#F7EEDB' },
  { name: 'Sand', hex: '#D8C8B1' },
  { name: 'Red', hex: '#E6321C' },
  { name: 'Gold', hex: '#B7791F' },
  { name: 'Navy', hex: '#1D3557' },
];

const SPACING_OPTIONS = [
  { label: 'Normal', value: '0.02em' },
  { label: 'Wide', value: '0.12em' },
  { label: 'Ultra', value: '0.28em' },
];

const PLACEMENTS = [
  { id: 'CENTER', label: 'Center Chest', icon: '⊙' },
  { id: 'LEFT_CHEST', label: 'Left Chest', icon: '◧' },
  { id: 'BACK', label: 'Back Center', icon: '⊞' },
  { id: 'LOWER_HEM', label: 'Lower Hem', icon: '⊟' },
] as const;

// ─── SVG Garment Silhouettes (Clean High-Res Vector Fallbacks) ───────────────
function TShirtSVG({ color }: { color: string }) {
  const isDark = parseInt(color.replace('#', ''), 16) < 0x888888;
  const stroke = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const sh = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.12)';
  return (
    <svg width="300" height="320" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 14px 32px ${sh})` }}>
      <path d="M70 10 C70 10 80 28 100 28 C120 28 130 10 130 10 L162 30 L182 52 L165 68 L148 57 L148 210 L52 210 L52 57 L35 68 L18 52 L38 30 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <path d="M82 16 C86 24 94 28 100 28 C106 28 114 24 118 16" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'} strokeWidth="1" fill="none" />
    </svg>
  );
}

function OversizedSVG({ color }: { color: string }) {
  const isDark = parseInt(color.replace('#', ''), 16) < 0x888888;
  const stroke = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const sh = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.12)';
  return (
    <svg width="310" height="320" viewBox="0 0 220 230" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 14px 32px ${sh})` }}>
      <path d="M74 12 C74 12 86 32 110 32 C134 32 146 12 146 12 L180 37 L202 65 L184 80 L162 67 L158 215 L62 215 L58 67 L36 80 L18 65 L40 37 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <path d="M88 18 C93 28 102 32 110 32 C118 32 127 28 132 18" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'} strokeWidth="1" fill="none" />
    </svg>
  );
}

function HoodieSVG({ color }: { color: string }) {
  const isDark = parseInt(color.replace('#', ''), 16) < 0x888888;
  const stroke = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const sh = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.12)';
  return (
    <svg width="310" height="340" viewBox="0 0 220 250" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: `drop-shadow(0 14px 32px ${sh})` }}>
      <path d="M80 8 C75 0 62 0 58 10 C50 22 55 38 65 46 C72 30 90 28 110 28 C130 28 148 30 155 46 C165 38 170 22 162 10 C158 0 145 0 140 8 C134 4 122 2 110 2 C98 2 86 4 80 8 Z" fill={color} stroke={stroke} strokeWidth="0.8" />
      <path d="M65 46 C58 50 42 35 20 65 L38 82 L58 68 L58 230 L162 230 L162 68 L182 82 L200 65 C178 35 162 50 155 46 C148 30 130 28 110 28 C90 28 72 30 65 46 Z" fill={color} stroke={stroke} strokeWidth="1" />
      <rect x="78" y="148" width="64" height="36" rx="4" fill={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
      <line x1="110" y1="46" x2="110" y2="148" stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="1.5" strokeDasharray="3,2" />
    </svg>
  );
}

function GarmentSVG({ garmentId, color }: { garmentId: string; color: string }) {
  if (garmentId === 'tshirt') return <TShirtSVG color={color} />;
  if (garmentId === 'oversized') return <OversizedSVG color={color} />;
  if (garmentId === 'hoodie') return <HoodieSVG color={color} />;
  return <OversizedSVG color={color} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CustomizerPage() {
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();

  // Dynamic Garments state synced with Admin Customizer Studio
  const [garmentsList, setGarmentsList] = useState<GarmentType[]>(GARMENTS);

  // Garment state
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>(GARMENTS[0]); // Default to Oversized 240 GSM
  const [selectedColor, setSelectedColor] = useState<ColorOption>(GARMENTS[0].colors?.[0] || COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [viewSide, setViewSide] = useState<'FRONT' | 'BACK'>('FRONT');

  // Dynamic active sizes and colors for currently selected garment
  const availableSizes = (selectedGarment.activeSizes && selectedGarment.activeSizes.length > 0)
    ? selectedGarment.activeSizes
    : (selectedGarment.sizes && selectedGarment.sizes.length > 0 ? selectedGarment.sizes : SIZES);

  const availableColors = (selectedGarment.colors && selectedGarment.colors.length > 0)
    ? selectedGarment.colors.filter(c => c.isActive !== false)
    : COLORS;

  // Auto-adjust selected size if current size is not in active sizes
  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  // Auto-adjust selected color if current color is not in active colors
  useEffect(() => {
    if (availableColors.length > 0 && !availableColors.some(c => c.name.toLowerCase() === selectedColor.name.toLowerCase())) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  // ── Sync with Admin Customizer Studio Config (Live Dynamic Control) ─────────
  useEffect(() => {
    let isMounted = true;
    api.get('/customizations/studio/config')
      .then((res: any) => {
        if (!isMounted) return;
        const gMap = res?.garments || res?.data?.garments;
        if (!gMap) return;
        const parsed: GarmentType[] = Object.keys(gMap)
          .map(k => gMap[k])
          .filter((g: any) => g && g.isActive !== false);
        if (parsed.length > 0) {
          setGarmentsList(parsed);
          setSelectedGarment(prev => {
            const matched = parsed.find(p => p.id === prev.id) || parsed[0];
            return matched;
          });
        }
      })
      .catch((err) => {
        console.warn('Customizer using local fallback configurations:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Design state
  const [designMode, setDesignMode] = useState<'upload' | 'text'>('text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('BINGOOO');
  const [selectedFont, setSelectedFont] = useState<string>('anton');
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('all');
  const [isBold, setIsBold] = useState<boolean>(true);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>('');
  const [letterSpacing, setLetterSpacing] = useState<string>('0.05em');

  // Canvas state
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [activePlacement, setActivePlacement] = useState<string>('CENTER');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);

  // Modals & Panels
  const [activeTab, setActiveTab] = useState<'garment' | 'design' | 'placement' | 'order'>('design');
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState<boolean>(false);
  const [saveDesignTitle, setSaveDesignTitle] = useState<string>('');
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);

  // Mobile Bottom Action Tool Sheet
  const [activeMobileTool, setActiveMobileTool] = useState<'none' | 'garment' | 'color' | 'text' | 'upload' | 'placement' | 'size'>('none');

  // Size Guide States
  const [sizeGuideUnit, setSizeGuideUnit] = useState<'cm' | 'in'>('in');
  const [selectedFitModelIndex, setSelectedFitModelIndex] = useState<number>(0);

  // Wishlist / Saved Designs State
  const [savedDesigns, setSavedDesigns] = useState<SavedCustomDesign[]>([]);

  // History for Undo/Redo
  const [history, setHistory] = useState<DesignSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isApplyingHistory = useRef(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const mockupRef = useRef<HTMLDivElement | null>(null);

  const activeFont = FONT_OPTIONS.find(f => f.id === selectedFont) || FONT_OPTIONS[0];
  const filteredFonts = FONT_OPTIONS.filter(f => selectedFontCategory === 'all' ? true : f.category === selectedFontCategory);
  const isLightGarment = ['#FFFFFF', '#D8C8B1', '#F7EEDB', '#C8B99D', '#FAF6EE'].some(h => selectedColor.hex?.toUpperCase() === h) || ['beige', 'white', 'cream', 'sand'].includes(selectedColor.name?.toLowerCase());
  const designBlendMode = isLightGarment ? 'multiply' : 'normal';

  const currentGarmentColor = selectedGarment.colors?.find((c: ColorOption) => c.name.toLowerCase() === selectedColor.name.toLowerCase()) || selectedColor;
  const currentFrontImage = currentGarmentColor.frontImageUrl || '';
  const currentBackImage = currentGarmentColor.backImageUrl || '';
  const imageSrc = (viewSide === 'BACK' && currentBackImage) ? currentBackImage : currentFrontImage;

  // ── Load Saved Designs from localStorage on Mount ───────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bingooo_saved_custom_designs');
      if (stored) {
        setSavedDesigns(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Read URL Query Params on Mount (For Social Media Share Links) ───────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qGarment = params.get('garment');
    const qColor = params.get('color');
    const qText = params.get('text');
    const qFont = params.get('font');
    const qSize = params.get('size');

    if (qGarment) {
      const foundG = garmentsList.find(g => g.id === qGarment.toLowerCase()) || GARMENTS.find(g => g.id === qGarment.toLowerCase());
      if (foundG) setSelectedGarment(foundG);
    }
    if (qColor) {
      const foundC = COLORS.find(c => c.name.toLowerCase() === qColor.toLowerCase());
      if (foundC) setSelectedColor(foundC);
    }
    if (qText) {
      setCustomText(decodeURIComponent(qText));
      setDesignMode('text');
    }
    if (qFont) {
      const foundF = FONT_OPTIONS.find(f => f.id === qFont);
      if (foundF) setSelectedFont(foundF.id);
    }
    if (qSize && SIZES.includes(qSize.toUpperCase())) {
      setSelectedSize(qSize.toUpperCase());
    }
  }, []);

  // ── History Helpers ────────────────────────────────────────────────────────
  const captureSnapshot = useCallback((): DesignSnapshot => ({
    dragXVal: dragX.get(),
    dragYVal: dragY.get(),
    zoomScale,
    rotation,
    customText,
    selectedFont,
    isBold,
    isItalic,
    isUppercase,
    textColor,
    letterSpacing,
    uploadedImage,
    designMode,
  }), [dragX, dragY, zoomScale, rotation, customText, selectedFont, isBold, isItalic, isUppercase, textColor, letterSpacing, uploadedImage, designMode]);

  const pushHistory = useCallback(() => {
    if (isApplyingHistory.current) return;
    const snap = captureSnapshot();
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, snap].slice(-30);
    });
    setHistoryIndex(i => Math.min(i + 1, 29));
  }, [captureSnapshot, historyIndex]);

  const applySnapshot = (snap: DesignSnapshot) => {
    isApplyingHistory.current = true;
    dragX.set(snap.dragXVal);
    dragY.set(snap.dragYVal);
    setZoomScale(snap.zoomScale);
    setRotation(snap.rotation);
    setCustomText(snap.customText);
    setSelectedFont(snap.selectedFont);
    setIsBold(snap.isBold);
    setIsItalic(snap.isItalic);
    setIsUppercase(snap.isUppercase);
    setTextColor(snap.textColor);
    setLetterSpacing(snap.letterSpacing);
    setUploadedImage(snap.uploadedImage);
    setDesignMode(snap.designMode);
    setTimeout(() => {
      isApplyingHistory.current = false;
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    triggerHaptic('light');
    const ni = historyIndex - 1;
    setHistoryIndex(ni);
    applySnapshot(history[ni]);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    triggerHaptic('light');
    const ni = historyIndex + 1;
    setHistoryIndex(ni);
    applySnapshot(history[ni]);
  };

  // ── Wishlist: Save Custom Design ───────────────────────────────────────────
  const handleSaveToWishlist = () => {
    const title = saveDesignTitle.trim() || `${selectedGarment.name} - ${selectedColor.name} #${savedDesigns.length + 1}`;
    const newDesign: SavedCustomDesign = {
      id: `custom_design_${Date.now()}`,
      name: title,
      garmentId: selectedGarment.id,
      garmentName: selectedGarment.name,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      price: selectedGarment.price,
      size: selectedSize || 'L',
      viewSide,
      customText,
      selectedFont,
      uploadedImage,
      designMode,
      zoomScale,
      rotation,
      dragXVal: dragX.get(),
      dragYVal: dragY.get(),
      textColor,
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    const updated = [newDesign, ...savedDesigns.filter(d => d.id !== newDesign.id)];
    setSavedDesigns(updated);
    try {
      localStorage.setItem('bingooo_saved_custom_designs', JSON.stringify(updated));
    } catch {
      // ignore
    }

    triggerHaptic('medium');
    toast({
      title: 'Design Saved to Wishlist! ✨',
      description: `"${title}" has been saved to your custom design wishlist.`,
      variant: 'success',
    });

    setIsSavePromptOpen(false);
    setSaveDesignTitle('');
  };

  const handleLoadSavedDesign = (design: SavedCustomDesign) => {
    triggerHaptic('medium');
    const g = garmentsList.find(x => x.id === design.garmentId) || GARMENTS.find(x => x.id === design.garmentId) || GARMENTS[0];
    setSelectedGarment(g);
    const c = g.colors?.find(col => col.name.toLowerCase() === design.colorName.toLowerCase()) || COLORS[0];
    setSelectedColor(c);
    setSelectedSize(design.size || 'L');
    setViewSide(design.viewSide || 'FRONT');

    setDesignMode(design.designMode);
    setCustomText(design.customText || 'BINGOOO');
    setSelectedFont(design.selectedFont || 'anton');
    setUploadedImage(design.uploadedImage);
    setZoomScale(design.zoomScale || 1.0);
    setRotation(design.rotation || 0);
    dragX.set(design.dragXVal || 0);
    dragY.set(design.dragYVal || 0);
    setTextColor(design.textColor || '');

    toast({
      title: 'Design Loaded! 🎨',
      description: `"${design.name}" is now loaded in your Atelier canvas.`,
      variant: 'default',
    });
    setIsSavedDrawerOpen(false);
    setActiveMobileTool('none');
    setTimeout(pushHistory, 50);
  };

  const handleDeleteSavedDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const filtered = savedDesigns.filter(d => d.id !== id);
    setSavedDesigns(filtered);
    try {
      localStorage.setItem('bingooo_saved_custom_designs', JSON.stringify(filtered));
    } catch {
      // ignore
    }
    toast({
      title: 'Design removed',
      description: 'The design was removed from your saved wishlist.',
      variant: 'default',
    });
  };

  // ── Social Media Sharing ────────────────────────────────────────────────────
  const generateShareUrl = () => {
    const base = 'https://bingooo.co.in/customize';
    const params = new URLSearchParams({
      garment: selectedGarment.id,
      color: selectedColor.name,
      text: customText,
      font: selectedFont,
      size: selectedSize || 'L',
    });
    return `${base}?${params.toString()}`;
  };

  const handleCopyLink = () => {
    triggerHaptic('light');
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied! 📋',
      description: 'Your bespoke design link has been copied to your clipboard.',
      variant: 'success',
    });
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('light');
    const shareUrl = generateShareUrl();
    const text = `Check out this custom ${selectedGarment.name} I designed at Bingooo Atelier! 🔥\nPrice: ₹${selectedGarment.price.toLocaleString('en-IN')}\nColor: ${selectedColor.name}\n\nView or customize your own here:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadMockup = () => {
    triggerHaptic('medium');
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = selectedColor.hex;
    ctx.fillRect(0, 0, 800, 800);

    // Draw frame styling
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 760, 760);

    // Brand mark
    ctx.fillStyle = selectedColor.textContrast;
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BINGOOO ATELIER', 400, 80);

    // Garment spec
    ctx.font = '16px monospace';
    ctx.fillStyle = selectedColor.textContrast === '#FFFFFF' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    ctx.fillText(`${selectedGarment.name.toUpperCase()} · ${selectedColor.name.toUpperCase()} · 240 GSM`, 400, 115);

    // Artwork representation
    if (customText) {
      ctx.fillStyle = textColor || selectedColor.textContrast;
      ctx.font = `bold 60px ${activeFont.name}, sans-serif`;
      ctx.fillText(customText, 400, 420);
    }

    // Watermark footer
    ctx.font = '14px sans-serif';
    ctx.fillStyle = selectedColor.textContrast === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    ctx.fillText('Crafted with 3D Atelier · bingooo.co.in', 400, 740);

    const a = document.createElement('a');
    a.download = `bingooo-bespoke-${selectedGarment.id}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();

    toast({
      title: 'Mockup Downloaded! 📸',
      description: 'Your high-res garment preview has been saved to your device.',
      variant: 'success',
    });
  };

  // ── Placement & Reset Handlers ──────────────────────────────────────────────
  const applyPresetPlacement = (placement: typeof PLACEMENTS[number]['id']) => {
    triggerHaptic('light');
    setActivePlacement(placement);
    if (placement === 'CENTER') {
      dragX.set(0);
      dragY.set(0);
      if (viewSide === 'BACK') setViewSide('FRONT');
    } else if (placement === 'LEFT_CHEST') {
      dragX.set(-52);
      dragY.set(-42);
      if (viewSide === 'BACK') setViewSide('FRONT');
    } else if (placement === 'BACK') {
      dragX.set(0);
      dragY.set(-20);
      setViewSide('BACK');
    } else if (placement === 'LOWER_HEM') {
      dragX.set(48);
      dragY.set(90);
      if (viewSide === 'BACK') setViewSide('FRONT');
    }
    setTimeout(pushHistory, 50);
  };

  const handleResetPosition = () => {
    triggerHaptic('light');
    dragX.set(0);
    dragY.set(0);
    setRotation(0);
    setZoomScale(1.0);
    setActivePlacement('CENTER');
    toast({ title: 'Position reset', description: 'Centered • 100% zoom • 0° rotation', variant: 'default' });
    setTimeout(pushHistory, 50);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload under 15 MB.', variant: 'danger' });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      setUploadedImage(e.target?.result as string);
      setDesignMode('upload');
      triggerHaptic('medium');
      toast({ title: 'Design loaded!', description: 'Drag to position · pinch or scroll to zoom · rotate with controls.', variant: 'success' });
      setTimeout(pushHistory, 50);
    };
    reader.readAsDataURL(file);
  };

  const handleClearArtwork = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Design removed', description: 'Upload a new image or switch to text mode.', variant: 'default' });
    setTimeout(pushHistory, 50);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: 'Pick a size', description: 'Please choose your size before adding to cart.', variant: 'danger' });
      setIsSizeGuideModalOpen(true);
      return;
    }
    triggerHaptic('medium');
    addItem(`custom-${selectedGarment.id}-${selectedColor.name.toLowerCase()}-${selectedSize.toLowerCase()}`, 1, `custom-${Date.now()}`);
    setIsAddedFeedback(true);
    toast({
      title: 'Added to Bag! 🛍️',
      description: `Bespoke ${selectedGarment.name} (${selectedSize}) is ready for checkout.`,
      variant: 'success',
    });
    setTimeout(() => setIsAddedFeedback(false), 2200);
  };

  // Keyboard accessibility
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSizeGuideModalOpen(false);
        setIsShareModalOpen(false);
        setIsSavedDrawerOpen(false);
        setIsSavePromptOpen(false);
        setActiveMobileTool('none');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, [historyIndex, history]);

  // Lock body scroll on open modals
  useEffect(() => {
    const isModalOpen = isSizeGuideModalOpen || isShareModalOpen || isSavedDrawerOpen || isSavePromptOpen || activeMobileTool !== 'none';
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSizeGuideModalOpen, isShareModalOpen, isSavedDrawerOpen, isSavePromptOpen, activeMobileTool]);

  // ─── Control Panels Tabs Content ───────────────────────────────────────────
  const GarmentTab = () => (
    <div className="space-y-6 p-5">
      {/* Garment type */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63]">Silhouette</p>
          <button
            type="button"
            onClick={() => setIsSizeGuideModalOpen(true)}
            className="text-[10px] font-bold text-[#E6321C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Ruler size={11} /> Model Fit Guide
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {garmentsList.map((garment: GarmentType) => (
            <button
              key={garment.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedGarment(garment);
                const gc = garment.colors?.filter(c => c.isActive !== false)?.length ? garment.colors.filter(c => c.isActive !== false) : COLORS;
                const m = gc.find((c: ColorOption) => c.name.toLowerCase() === selectedColor.name.toLowerCase()) || gc[0];
                if (m) setSelectedColor(m);
              }}
              className={`relative border-2 rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${selectedGarment.id === garment.id ? 'border-[#171717] bg-[#171717]' : 'border-[#ddd3c5] hover:border-[#aaa] bg-white'}`}
            >
              <div className="h-14 w-full flex items-center justify-center overflow-hidden">
                <div style={{ transform: 'scale(0.22)', transformOrigin: 'center', width: 80, height: 72 }}>
                  <GarmentSVG garmentId={garment.id} color={selectedColor.hex} />
                </div>
              </div>
              <div className={`text-[10px] font-extrabold uppercase tracking-wider ${selectedGarment.id === garment.id ? 'text-white' : 'text-[#171717]'}`}>{garment.name}</div>
              <div className="flex items-center gap-1">
                {garment.compareAtPrice && garment.compareAtPrice > garment.price && (
                  <span className={`text-[9px] line-through ${selectedGarment.id === garment.id ? 'text-white/50' : 'text-[#6f6a63]'}`}>₹{garment.compareAtPrice}</span>
                )}
                <span className="text-[10px] font-bold text-[#E6321C]">₹{garment.price.toLocaleString('en-IN')}</span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#6f6a63] mt-2.5 font-medium">{selectedGarment.description}</p>
      </div>

      {/* Color swatches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63]">Colorway</p>
          <span className="text-[10px] font-bold text-[#171717]">{selectedColor.name}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {availableColors.map(color => (
            <button
              key={color.id || color.name}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedColor(color);
              }}
              title={color.name}
              aria-label={color.name}
              className={`relative w-10 h-10 rounded-full transition-all duration-200 cursor-pointer ${selectedColor.name.toLowerCase() === color.name.toLowerCase() ? 'shadow-[0_0_0_2.5px_#f7eedb,0_0_0_4.5px_#171717] scale-110' : 'hover:scale-105 hover:shadow-sm'}`}
              style={{ backgroundColor: color.hex, border: color.hex.toLowerCase() === '#ffffff' ? '1.5px solid #c5bdb4' : 'none' }}
            >
              {selectedColor.name.toLowerCase() === color.name.toLowerCase() && (
                <Check size={12} strokeWidth={3} className="absolute inset-0 m-auto" style={{ color: color.textContrast }} />
              )}
            </button>
          ))}
        </div>

        {/* View side quick toggle */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => setViewSide('FRONT')}
            className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${viewSide === 'FRONT' ? 'border-[#171717] bg-[#171717] text-white' : 'border-[#ddd3c5] bg-white text-[#6f6a63]'}`}
          >
            <span>Front Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setViewSide('BACK')}
            className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${viewSide === 'BACK' ? 'border-[#171717] bg-[#171717] text-white' : 'border-[#ddd3c5] bg-white text-[#6f6a63]'}`}
          >
            <span>Back Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );

  const DesignTab = () => (
    <div className="space-y-5 p-5">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#ede0cc] rounded-xl">
        {[
          { mode: 'text' as const, icon: <Type size={13} />, label: 'Custom Text' },
          { mode: 'upload' as const, icon: <Upload size={13} />, label: 'Upload Artwork' },
        ].map(({ mode, icon, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setDesignMode(mode);
            }}
            className={`py-2.5 px-3 text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${designMode === mode ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6f6a63] hover:text-[#171717]'}`}
          >
            {icon}<span>{label}</span>
          </button>
        ))}
      </div>

      {/* Text Mode */}
      {designMode === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63] block mb-2">Input Text</label>
            <input
              type="text"
              value={customText}
              maxLength={40}
              onChange={e => {
                setCustomText(e.target.value);
                pushHistory();
              }}
              placeholder="e.g. ATELIER NO. 01"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ddd3c5] bg-white text-sm font-semibold text-[#171717] focus:outline-none focus:border-[#171717]"
            />
          </div>

          {/* Font selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63]">Curated Typography</label>
              <div className="flex gap-1">
                {FONT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedFontCategory(cat.id)}
                    className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${selectedFontCategory === cat.id ? 'bg-[#171717] text-white' : 'text-[#6f6a63] hover:bg-[#ede0cc]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {filteredFonts.map(font => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedFont(font.id);
                    setTimeout(pushHistory, 50);
                  }}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${selectedFont === font.id ? 'border-[#171717] bg-[#171717] text-white' : 'border-[#ddd3c5] bg-white text-[#171717] hover:border-[#aaa]'}`}
                >
                  <span className="text-[8px] font-mono uppercase tracking-wider opacity-70">{font.label}</span>
                  <span className="text-sm font-bold truncate mt-1" style={{ fontFamily: font.family }}>{customText || font.preview}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text color swatches */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63] block mb-2">Print Color</label>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTextColor(c.hex);
                    setTimeout(pushHistory, 50);
                  }}
                  className={`w-7 h-7 rounded-full transition-all border ${textColor === c.hex ? 'ring-2 ring-offset-2 ring-[#171717] scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.hex || selectedColor.textContrast, borderColor: '#ddd3c5' }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Text style toggles */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => { setIsBold(b => !b); setTimeout(pushHistory, 50); }}
              className={`p-2 rounded-lg border text-xs font-bold ${isBold ? 'bg-[#171717] text-white border-[#171717]' : 'bg-white text-[#171717] border-[#ddd3c5]'}`}
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onClick={() => { setIsItalic(i => !i); setTimeout(pushHistory, 50); }}
              className={`p-2 rounded-lg border text-xs font-bold ${isItalic ? 'bg-[#171717] text-white border-[#171717]' : 'bg-white text-[#171717] border-[#ddd3c5]'}`}
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onClick={() => { setIsUppercase(u => !u); setTimeout(pushHistory, 50); }}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold ${isUppercase ? 'bg-[#171717] text-white border-[#171717]' : 'bg-white text-[#171717] border-[#ddd3c5]'}`}
              title="Uppercase"
            >
              AA / aa
            </button>
            <div className="h-4 w-px bg-[#ddd3c5] mx-1" />
            {SPACING_OPTIONS.map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setLetterSpacing(opt.value);
                  setTimeout(pushHistory, 50);
                }}
                className={`px-2 py-1 rounded-lg border text-[9px] font-mono font-bold ${letterSpacing === opt.value ? 'bg-[#171717] text-white border-[#171717]' : 'bg-white text-[#6f6a63] border-[#ddd3c5]'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {designMode === 'upload' && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-[#ddd3c5] hover:border-[#171717] bg-[#faf8f5] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#ede0cc] flex items-center justify-center">
              <Upload size={18} className="text-[#171717]" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#171717]">Upload Custom Artwork</p>
            <p className="text-[9px] text-[#6f6a63]">PNG with transparent background, SVG, or JPG (max 15MB)</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/svg+xml, image/webp"
            className="hidden"
          />
          {uploadedImage && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#ddd3c5] bg-white">
              <div className="flex items-center gap-2.5">
                <img src={uploadedImage} alt="Preview" className="w-10 h-10 object-contain rounded-md border border-[#eee]" />
                <div>
                  <p className="text-[10px] font-bold text-[#171717]">Custom Graphic Loaded</p>
                  <p className="text-[9px] text-[#6f6a63]">HD DTF Print Ready</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearArtwork}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                title="Remove Graphic"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const PlacementTab = () => (
    <div className="space-y-5 p-5">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63] block mb-2.5">Preset Anchor Locations</label>
        <div className="grid grid-cols-2 gap-2">
          {PLACEMENTS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPresetPlacement(p.id)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${activePlacement === p.id ? 'border-[#171717] bg-[#171717] text-white' : 'border-[#ddd3c5] bg-white text-[#171717] hover:border-[#aaa]'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
              <span className="font-mono text-sm opacity-60">{p.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63]">Scale & Dimensions</label>
          <span className="text-[10px] font-mono font-bold">{Math.round(zoomScale * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="2.5"
          step="0.05"
          value={zoomScale}
          onChange={e => {
            setZoomScale(parseFloat(e.target.value));
            pushHistory();
          }}
          className="w-full accent-[#171717] cursor-pointer"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63]">Angle & Rotation</label>
          <span className="text-[10px] font-mono font-bold">{rotation}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={rotation}
          onChange={e => {
            setRotation(parseInt(e.target.value));
            pushHistory();
          }}
          className="w-full accent-[#171717] cursor-pointer"
        />
      </div>

      <button
        type="button"
        onClick={handleResetPosition}
        className="w-full py-2.5 rounded-xl border border-[#ddd3c5] bg-[#faf8f5] hover:bg-white text-[10px] font-bold uppercase tracking-wider text-[#171717] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Crosshair size={12} /> Reset Canvas Alignment
      </button>
    </div>
  );

  const OrderTab = () => (
    <div className="space-y-6 p-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6a63]">Select Garment Size</label>
          <button
            type="button"
            onClick={() => setIsSizeGuideModalOpen(true)}
            className="text-[10px] font-bold text-[#E6321C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Ruler size={11} /> Model Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedSize(sz);
              }}
              className={`flex-1 min-w-[42px] py-2.5 rounded-xl border text-[11px] font-bold uppercase transition-all cursor-pointer ${selectedSize === sz ? 'border-[#171717] bg-[#171717] text-white shadow-sm' : 'border-[#ddd3c5] bg-white text-[#171717] hover:border-[#aaa]'}`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="p-4 rounded-2xl border border-[#ddd3c5] bg-[#faf8f5] space-y-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#6f6a63]">{selectedGarment.name} Canvas (Heavy Cotton)</span>
          <span className="font-bold">₹{selectedGarment.price.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#6f6a63]">High-Definition Direct-To-Film Printing</span>
          <span className="text-emerald-700 font-bold">Included</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#6f6a63]">Standard Pan-India Express Delivery</span>
          <span className="text-emerald-700 font-bold">FREE</span>
        </div>
        <div className="pt-2 border-t border-[#ddd3c5] flex justify-between items-baseline">
          <span className="text-xs font-bold uppercase tracking-wider">Total Atelier Cost</span>
          <div className="flex items-center gap-2">
            {selectedGarment.compareAtPrice && selectedGarment.compareAtPrice > selectedGarment.price && (
              <span className="text-xs text-[#6f6a63] line-through font-normal">₹{selectedGarment.compareAtPrice.toLocaleString('en-IN')}</span>
            )}
            <span className="text-xl font-extrabold text-[#E6321C]">₹{selectedGarment.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full py-3.5 rounded-xl bg-[#E6321C] text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#b91f12] transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          {isAddedFeedback ? (
            <>
              <span>Added to Cart!</span>
              <Check size={16} />
            </>
          ) : (
            <>
              <ShoppingBag size={15} />
              <span>Add Bespoke Garment to Bag</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsSavePromptOpen(true)}
            className="py-2.5 rounded-xl border border-[#ddd3c5] bg-white hover:bg-[#faf8f5] text-[10px] font-bold uppercase tracking-wider text-[#171717] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bookmark size={13} className="text-[#E6321C]" />
            <span>Save to Wishlist</span>
          </button>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="py-2.5 rounded-xl border border-[#ddd3c5] bg-white hover:bg-[#faf8f5] text-[10px] font-bold uppercase tracking-wider text-[#171717] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>Share Design</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="bg-[#f7eedb] min-h-screen text-[#171717] font-sans antialiased pb-28 lg:pb-12">
      <SEO
        title="Bespoke Custom Atelier Studio — BINGOOO"
        description="Craft custom oversized t-shirts, crewnecks, and hoodies with 240 GSM combed cotton, custom text, HD DTF graphic printing, and model size guides."
        canonical="https://bingooo.co.in/customize"
      />

      {/* ── TOP ACTION & STATUS BAR ────────────────────────────────────────── */}
      <div className="border-b border-[#ddd3c5] bg-[#ede0cc]/70 px-4 sm:px-8 py-2.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-tighter uppercase text-[#171717]">ATELIER 3D STUDIO</span>
          <span className="hidden sm:inline text-[#6f6a63]">·</span>
          <span className="hidden sm:inline text-[#6f6a63] font-medium">{selectedGarment.name} · {selectedColor.name} · ₹{selectedGarment.price}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSavedDrawerOpen(true)}
            className="px-2.5 py-1 rounded-lg border border-[#ddd3c5] bg-white hover:bg-[#171717] hover:text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bookmark size={12} className="text-[#E6321C]" />
            <span>Wishlist ({savedDesigns.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1 rounded-lg border border-[#ddd3c5] bg-white hover:bg-[#171717] hover:text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 size={12} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSizeGuideModalOpen(true)}
            className="px-2.5 py-1 rounded-lg border border-[#ddd3c5] bg-white hover:bg-[#171717] hover:text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Ruler size={12} />
            <span className="hidden sm:inline">Size Guide</span>
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ──────────────────────────────────────────────────── */}
      <div className="w-[min(calc(100%-24px),1440px)] mx-auto py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">

          {/* ── LEFT: INTERACTIVE GARMENT CANVAS ──────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div
              ref={canvasRef}
              className="relative w-full aspect-[4/5] sm:aspect-square max-h-[580px] rounded-3xl bg-[#ede0cc] border border-[#ddd3c5] overflow-hidden flex items-center justify-center select-none shadow-sm"
              onWheel={e => {
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  setZoomScale(z => Math.min(2.5, Math.max(0.3, +(z - e.deltaY * 0.005).toFixed(2))));
                }
              }}
            >
              {/* Garment Silhouette / Mockup */}
              <div ref={mockupRef} className="relative w-full h-full flex items-center justify-center p-6">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={`${selectedGarment.name} ${viewSide}`}
                    className="max-h-[85%] max-w-[85%] object-contain pointer-events-none drop-shadow-xl"
                    draggable={false}
                  />
                ) : (
                  <div className="scale-100 sm:scale-110 transition-transform">
                    <GarmentSVG garmentId={selectedGarment.id} color={selectedColor.hex} />
                  </div>
                )}

                {/* Print Safe-Zone Bounding Box */}
                {showSafeZone && (
                  <div className="absolute inset-0 m-auto w-[200px] sm:w-[240px] h-[260px] sm:h-[300px] border border-dashed border-[#171717]/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="text-[8px] font-mono text-[#171717]/40 tracking-wider uppercase">Safe Print Area</div>
                    <div className="text-[8px] font-mono text-[#171717]/40 tracking-wider uppercase self-end">DTF Max 300 DPI</div>
                  </div>
                )}

                {/* Draggable Artwork / Text Container */}
                <motion.div
                  drag
                  dragMomentum={false}
                  dragElastic={0.08}
                  onDragEnd={() => pushHistory()}
                  style={{
                    x: dragX,
                    y: dragY,
                    scale: zoomScale,
                    rotate: rotation,
                    mixBlendMode: (uploadedImage && designBlendMode === 'multiply') ? 'multiply' : 'normal',
                  }}
                  className="absolute z-20 flex flex-col justify-center items-center text-center origin-center cursor-grab active:cursor-grabbing group p-2 touch-none select-none"
                >
                  {/* Selection Indicator */}
                  <div className="absolute -inset-2 border border-dashed border-[#E6321C]/60 rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 pointer-events-none">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E6321C] text-white text-[7px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap shadow-sm">
                      Drag to Position
                    </div>
                  </div>

                  {uploadedImage ? (
                    <div className="relative flex items-center justify-center">
                      <img
                        src={uploadedImage}
                        alt="Custom print artwork"
                        style={{
                          filter: isLightGarment
                            ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                            : 'drop-shadow(0 2px 10px rgba(0,0,0,0.6)) brightness(0.97) saturate(1.04)',
                        }}
                        className="w-[160px] h-[160px] sm:w-[210px] sm:h-[210px] object-contain select-none pointer-events-none"
                        draggable={false}
                      />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleClearArtwork(); }}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-[#171717] hover:bg-[#E6321C] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer"
                        aria-label="Remove Graphic"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ) : designMode === 'upload' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-4 rounded-2xl border-2 border-dashed border-[#E6321C]/40 bg-white/80 hover:bg-white transition-all cursor-pointer flex flex-col items-center gap-1 shadow-sm backdrop-blur-sm"
                    >
                      <Upload size={20} className="text-[#E6321C]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#171717]">Upload Artwork</span>
                      <span className="text-[8px] text-[#6f6a63]">PNG · JPG · SVG</span>
                    </div>
                  ) : (
                    <div
                      className="px-3 py-1 select-none leading-tight break-words text-center"
                      style={{
                        fontFamily: activeFont.family,
                        fontWeight: isBold ? 800 : 500,
                        fontStyle: isItalic ? 'italic' : 'normal',
                        textTransform: isUppercase ? 'uppercase' : 'none',
                        letterSpacing,
                        color: textColor || selectedColor.textContrast,
                        fontSize: 'clamp(20px, 3.5vw, 36px)',
                        textShadow: (textColor === '#FFFFFF' || (!textColor && selectedColor.textContrast === '#FFFFFF')) ? '0 1px 4px rgba(0,0,0,0.4)' : undefined,
                      }}
                    >
                      {customText || 'BINGOOO'}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* View Side Badge & Toggle */}
              <div className="absolute top-4 left-4 z-20 flex gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-[#ddd3c5] shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewSide('FRONT')}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${viewSide === 'FRONT' ? 'bg-[#171717] text-white' : 'text-[#6f6a63]'}`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('BACK')}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${viewSide === 'BACK' ? 'bg-[#171717] text-white' : 'text-[#6f6a63]'}`}
                >
                  Back
                </button>
              </div>

              {/* Floating Desktop Controls */}
              <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-[#ddd3c5] p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.max(0.3, +(z - 0.1).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono font-bold min-w-[36px] text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.min(2.5, +(z + 0.1).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <div className="h-4 w-px bg-[#ddd3c5] mx-1" />
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 15) % 360)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] cursor-pointer"
                  title="Rotate 15°"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSafeZone(v => !v)}
                  className={`px-2 h-7 rounded-xl text-[9px] font-bold cursor-pointer flex items-center gap-1 transition-colors ${showSafeZone ? 'bg-[#ede0cc] text-[#171717]' : 'hover:bg-[#ede0cc] text-[#6f6a63]'}`}
                  title="Toggle Safe Zone Guide"
                >
                  <Eye size={11} /> Safe Zone
                </button>
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="px-2 h-7 rounded-xl text-[9px] font-bold hover:bg-[#ede0cc] cursor-pointer flex items-center gap-1"
                >
                  <Crosshair size={11} /> Reset
                </button>
              </div>

              {/* Undo / Redo Floating */}
              <div className="absolute bottom-4 left-4 z-20 hidden sm:flex gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/90 border border-[#ddd3c5] hover:bg-[#ede0cc] disabled:opacity-30 cursor-pointer shadow-sm"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/90 border border-[#ddd3c5] hover:bg-[#ede0cc] disabled:opacity-30 cursor-pointer shadow-sm"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={13} />
                </button>
              </div>
            </div>

            {/* Quality Specs Pill */}
            <div className="p-3 bg-white border border-[#ddd3c5] rounded-2xl text-[10px] text-[#6f6a63] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#E6321C]" />
                <span><strong className="text-[#171717]">240–280 GSM Pure Combed Cotton.</strong> Wash-fast DTF thermal print guarantee.</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">IN STOCK</span>
            </div>
          </div>

          {/* ── RIGHT: DESKTOP CONTROL PANEL ─────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col border border-[#ddd3c5] rounded-3xl bg-white shadow-sm overflow-hidden">
            {/* Desktop Tabs Navigation */}
            <div className="flex border-b border-[#ddd3c5]">
              {[
                { key: 'garment', label: 'Garment', icon: <Eye size={12} /> },
                { key: 'design', label: 'Design', icon: <ImageIcon size={12} /> },
                { key: 'placement', label: 'Placement', icon: <Crosshair size={12} /> },
                { key: 'order', label: 'Size & Bag', icon: <ShoppingBag size={12} /> },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${activeTab === tab.key ? 'border-[#E6321C] text-[#171717] bg-[#faf8f5]' : 'border-transparent text-[#6f6a63] hover:text-[#171717]'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              {activeTab === 'garment' && <GarmentTab />}
              {activeTab === 'design' && <DesignTab />}
              {activeTab === 'placement' && <PlacementTab />}
              {activeTab === 'order' && <OrderTab />}
            </div>

            {/* Quick Next Button */}
            {activeTab !== 'order' && (
              <div className="p-4 border-t border-[#ddd3c5] bg-white">
                <button
                  type="button"
                  onClick={() => setActiveTab('order')}
                  className="w-full h-11 rounded-xl bg-[#E6321C] text-white text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#b91f12] transition-colors cursor-pointer shadow-md"
                >
                  <ShoppingBag size={14} />
                  <span>Choose Size & Order →</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ── MOBILE STICKY QUICK ACTION DOCK (BOTTOM) ────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#171717]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          {/* Quick Color Button */}
          <button
            type="button"
            onClick={() => setActiveMobileTool(activeMobileTool === 'color' ? 'none' : 'color')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl transition-all ${activeMobileTool === 'color' ? 'bg-[#E6321C] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Palette size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Color</span>
          </button>

          {/* Quick Text Button */}
          <button
            type="button"
            onClick={() => {
              setDesignMode('text');
              setActiveMobileTool(activeMobileTool === 'text' ? 'none' : 'text');
            }}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl transition-all ${activeMobileTool === 'text' ? 'bg-[#E6321C] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Type size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Text</span>
          </button>

          {/* Quick Graphic Button */}
          <button
            type="button"
            onClick={() => {
              setDesignMode('upload');
              setActiveMobileTool(activeMobileTool === 'upload' ? 'none' : 'upload');
            }}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl transition-all ${activeMobileTool === 'upload' ? 'bg-[#E6321C] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Upload size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Upload</span>
          </button>

          {/* Quick Placement */}
          <button
            type="button"
            onClick={() => setActiveMobileTool(activeMobileTool === 'placement' ? 'none' : 'placement')}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl transition-all ${activeMobileTool === 'placement' ? 'bg-[#E6321C] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Crosshair size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Place</span>
          </button>

          {/* Quick Fit Guide */}
          <button
            type="button"
            onClick={() => setIsSizeGuideModalOpen(true)}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all"
          >
            <Ruler size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Fit</span>
          </button>

          {/* Quick Wishlist */}
          <button
            type="button"
            onClick={() => setIsSavePromptOpen(true)}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all"
          >
            <Bookmark size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Save</span>
          </button>

          {/* Quick Share */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-white/80 hover:bg-white/10 transition-all"
          >
            <Share2 size={15} />
            <span className="text-[8px] font-bold uppercase mt-0.5">Share</span>
          </button>
        </div>

        {/* Mobile Sticky Add to Bag Bar */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
          <div>
            <div className="text-[8px] font-mono uppercase tracking-wider text-white/60">
              {selectedGarment.name} · {selectedColor.name} · {selectedSize || 'Size: None'}
            </div>
            <div className="text-base font-extrabold text-white">₹{selectedGarment.price.toLocaleString('en-IN')}</div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="h-10 px-5 rounded-xl bg-[#E6321C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            {isAddedFeedback ? (
              <><span>Added!</span><Check size={14} /></>
            ) : (
              <><span>Add to Bag</span><ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDING BOTTOM DRAWER (WHEN TOOL CLICKED) ─────────────────── */}
      <AnimatePresence>
        {activeMobileTool !== 'none' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setActiveMobileTool('none')}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-[60] bg-[#f7eedb] rounded-t-3xl shadow-2xl lg:hidden max-h-[80vh] flex flex-col border-t border-[#ddd3c5]"
            >
              {/* Drag Handle & Header */}
              <div className="p-3 pb-2 border-b border-[#ddd3c5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6321C]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                    {activeMobileTool === 'color' && 'Select Colorway & Canvas'}
                    {activeMobileTool === 'text' && 'Type & Style Custom Text'}
                    {activeMobileTool === 'upload' && 'Upload Custom Print Graphics'}
                    {activeMobileTool === 'placement' && 'Adjust Positioning & Scale'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMobileTool('none')}
                  className="w-7 h-7 rounded-full bg-white border border-[#ddd3c5] flex items-center justify-center cursor-pointer text-[#171717]"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="overflow-y-auto p-4 flex-1">
                {activeMobileTool === 'color' && <GarmentTab />}
                {activeMobileTool === 'text' && <DesignTab />}
                {activeMobileTool === 'upload' && <DesignTab />}
                {activeMobileTool === 'placement' && <PlacementTab />}
              </div>

              {/* Done Button */}
              <div className="p-3 border-t border-[#ddd3c5] bg-white">
                <button
                  type="button"
                  onClick={() => setActiveMobileTool('none')}
                  className="w-full py-2.5 rounded-xl bg-[#171717] text-white text-[11px] font-bold uppercase tracking-wider"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DYNAMIC SIZE & FIT GUIDE MODAL (WITH REAL MODELS) ───────────────── */}
      <AnimatePresence>
        {isSizeGuideModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
            onClick={() => setIsSizeGuideModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-[min(760px,100%)] max-h-[90vh] overflow-y-auto bg-[#f7eedb] rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#ddd3c5]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-[#ddd3c5] mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#171717]">
                    Dynamic Size & Fit Guide
                  </h2>
                  <p className="text-[11px] text-[#6f6a63]">Real model measurements & precision garment sizing</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideModalOpen(false)}
                  className="w-9 h-9 border border-[#ddd3c5] rounded-xl bg-white flex items-center justify-center hover:bg-[#171717] hover:text-white cursor-pointer transition-colors"
                  aria-label="Close Size Guide"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Model Fit Visualizer Cards */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f6a63]">
                    Explore Live Model References
                  </span>
                  <span className="text-[9px] font-mono text-[#E6321C] font-bold uppercase">100% Authentic Fits</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FIT_MODELS.map((model, idx) => (
                    <div
                      key={model.name}
                      onClick={() => setSelectedFitModelIndex(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${selectedFitModelIndex === idx ? 'border-[#171717] bg-white shadow-md' : 'border-[#ddd3c5] bg-[#faf8f5] hover:border-[#aaa]'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#E6321C]" />
                          <span className="text-xs font-bold text-[#171717]">{model.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#171717] text-white text-[9px] font-mono font-bold">
                          Size {model.sizeWorn}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#6f6a63] space-y-0.5 mb-2 font-mono">
                        <div>Height: <strong className="text-[#171717]">{model.height}</strong></div>
                        <div>Weight: <strong className="text-[#171717]">{model.weight}</strong></div>
                        <div>Chest: <strong className="text-[#171717]">{model.chest}</strong></div>
                      </div>
                      <div className="text-[9px] text-[#171717] font-semibold bg-[#ede0cc]/70 p-2 rounded-lg leading-relaxed">
                        {model.notes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Garment Sizing Table with Unit Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f6a63]">
                    {selectedGarment.name} Precision Dimensions
                  </span>
                  {/* Unit Switcher */}
                  <div className="flex gap-1 bg-[#ede0cc] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSizeGuideUnit('in')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${sizeGuideUnit === 'in' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6f6a63]'}`}
                    >
                      Inches (&quot;)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeGuideUnit('cm')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer ${sizeGuideUnit === 'cm' ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6f6a63]'}`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#ddd3c5] bg-white">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#171717] text-white">
                        <th className="p-3 font-bold uppercase">Size</th>
                        <th className="p-3 font-bold uppercase">Chest (Round)</th>
                        <th className="p-3 font-bold uppercase">Length</th>
                        <th className="p-3 font-bold uppercase">Shoulder Drop</th>
                        <th className="p-3 font-bold uppercase">Sleeve</th>
                        <th className="p-3 font-bold uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ddd3c5]">
                      {((selectedGarment.sizeMeasurements?.[sizeGuideUnit] || (SIZE_TABLE[selectedGarment.id as keyof typeof SIZE_TABLE] || SIZE_TABLE.oversized)[sizeGuideUnit])).filter(r => !availableSizes.length || availableSizes.includes(r.size)).map(row => (
                        <tr key={row.size} className={row.size === selectedSize ? 'bg-[#ede0cc]/50 font-bold' : ''}>
                          <td className="p-3 text-xs font-extrabold text-[#171717]">{row.size}</td>
                          <td className="p-3">{row.chest}</td>
                          <td className="p-3">{row.length}</td>
                          <td className="p-3">{row.shoulder}</td>
                          <td className="p-3">{row.sleeve}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                setSelectedSize(row.size);
                                setIsSizeGuideModalOpen(false);
                                toast({
                                  title: `Size ${row.size} Selected!`,
                                  description: `Your custom ${selectedGarment.name} is now set to ${row.size}.`,
                                  variant: 'default',
                                });
                              }}
                              className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer ${row.size === selectedSize ? 'bg-[#171717] text-white' : 'border border-[#ddd3c5] hover:bg-[#171717] hover:text-white'}`}
                            >
                              {row.size === selectedSize ? 'Selected' : 'Choose Size'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SOCIAL SHARE MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-[min(480px,100%)] bg-[#f7eedb] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ddd3c5]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#ddd3c5] mb-5">
                <h3 className="text-lg font-extrabold uppercase text-[#171717]">Share Bespoke Design</h3>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#ddd3c5] flex items-center justify-center cursor-pointer text-[#171717]"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>Share on WhatsApp</span>
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-3 px-4 rounded-2xl border border-[#ddd3c5] bg-white hover:bg-[#faf8f5] text-[#171717] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Copy size={15} />
                  <span>Copy Shareable Design URL</span>
                </button>

                {/* Download Mockup Card */}
                <button
                  type="button"
                  onClick={handleDownloadMockup}
                  className="w-full py-3 px-4 rounded-2xl border border-[#ddd3c5] bg-white hover:bg-[#faf8f5] text-[#171717] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download size={15} />
                  <span>Download High-Res Mockup (.PNG)</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SAVE TO WISHLIST PROMPT MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {isSavePromptOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsSavePromptOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-[min(440px,100%)] bg-[#f7eedb] rounded-3xl p-6 shadow-2xl border border-[#ddd3c5]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#ddd3c5] mb-4">
                <h3 className="text-base font-extrabold uppercase text-[#171717]">Name Your Custom Creation</h3>
                <button
                  type="button"
                  onClick={() => setIsSavePromptOpen(false)}
                  className="w-7 h-7 rounded-full bg-white border border-[#ddd3c5] flex items-center justify-center cursor-pointer text-[#171717]"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6f6a63] block mb-1.5">
                    Design Title
                  </label>
                  <input
                    type="text"
                    value={saveDesignTitle}
                    onChange={e => setSaveDesignTitle(e.target.value)}
                    placeholder={`e.g. My Heavyweight ${selectedColor.name} Drop`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ddd3c5] bg-white text-sm font-semibold focus:outline-none focus:border-[#171717]"
                  />
                </div>
                <div className="text-[10px] text-[#6f6a63] bg-[#ede0cc]/60 p-3 rounded-xl">
                  Saves all current front & back placements, typography, custom text, and color selections so you can reload them anytime.
                </div>
                <button
                  type="button"
                  onClick={handleSaveToWishlist}
                  className="w-full py-3 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#b91f12] cursor-pointer"
                >
                  Save to Design Wishlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SAVED DESIGNS DRAWER (SLIDE-OVER) ─────────────────────────────────── */}
      <AnimatePresence>
        {isSavedDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSavedDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 z-[101] w-[min(480px,100%)] bg-[#f7eedb] shadow-2xl p-6 flex flex-col border-l border-[#ddd3c5]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#ddd3c5] mb-4">
                <div>
                  <h3 className="text-lg font-extrabold uppercase text-[#171717]">My Custom Wishlist</h3>
                  <p className="text-[10px] text-[#6f6a63]">{savedDesigns.length} saved atelier garments</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSavedDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-[#ddd3c5] flex items-center justify-center cursor-pointer text-[#171717]"
                  aria-label="Close Wishlist"
                >
                  <X size={15} />
                </button>
              </div>

              {savedDesigns.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Bookmark size={36} className="text-[#6f6a63]/40" />
                  <p className="text-sm font-bold text-[#171717]">Your custom wishlist is empty</p>
                  <p className="text-xs text-[#6f6a63]">Design your garment and click &quot;Save to Wishlist&quot; to bookmark it here.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {savedDesigns.map(design => (
                    <div
                      key={design.id}
                      onClick={() => handleLoadSavedDesign(design)}
                      className="p-3.5 rounded-2xl border border-[#ddd3c5] bg-white hover:border-[#171717] transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#ddd3c5]"
                          style={{ backgroundColor: design.colorHex }}
                        >
                          <Sparkles size={16} style={{ color: design.colorHex === '#FFFFFF' ? '#171717' : '#FFFFFF' }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171717] group-hover:text-[#E6321C] transition-colors">{design.name}</p>
                          <p className="text-[10px] text-[#6f6a63]">
                            {design.garmentName} · {design.colorName} · {design.size}
                          </p>
                          <p className="text-[9px] font-mono text-[#6f6a63]">{design.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#171717]">₹{design.price.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedDesign(design.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Delete from Wishlist"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

export default CustomizerPage;
