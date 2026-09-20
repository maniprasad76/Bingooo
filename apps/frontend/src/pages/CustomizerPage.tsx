import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  Check, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Type, Upload,
  Image as ImageIcon, Bold, Italic, Move, Crosshair, ShoppingBag,
  RotateCw, Undo2, Redo2, Trash2, Sparkles,
  FlipHorizontal, Scan, Layers, Eye,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { SEO } from '../components/common/SEO';
import { getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ColorOption {
  id?: string; name: string; hex: string; textContrast: string;
  frontImageUrl?: string; backImageUrl?: string; isActive?: boolean;
}
interface GarmentType {
  id: string; name: string; price: number; description: string;
  isActive?: boolean; colors?: ColorOption[];
}
interface DesignSnapshot {
  dragXVal: number; dragYVal: number; zoomScale: number; rotation: number;
  customText: string; selectedFont: string; isBold: boolean; isItalic: boolean;
  isUppercase: boolean; textColor: string; letterSpacing: string;
  uploadedImage: string | null; designMode: 'upload' | 'text';
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const SHIRT_COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF',
    frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png' },
  { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717',
    frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png' },
  { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717',
    frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png' },
  { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF',
    frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png' },
];
const HOODIE_COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF',
    frontImageUrl: '/custom/hoodie-black-front.png', backImageUrl: '/custom/hoodie-black-back.png' },
  { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717',
    frontImageUrl: '/custom/hoodie-white-front.png', backImageUrl: '/custom/hoodie-white-back.png' },
  { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717' },
  { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF' },
];
const COLORS: ColorOption[] = SHIRT_COLORS;
const GARMENTS: GarmentType[] = [
  { id: 'tshirt',    name: 'T-Shirt',   price: 999,  description: '100% Combed Cotton · Classic Crewneck', colors: SHIRT_COLORS.map(c => ({ ...c })) },
  { id: 'oversized', name: 'Oversized', price: 1299, description: '240 GSM Heavyweight · Drop-Shoulder',    colors: SHIRT_COLORS.map(c => ({ ...c })) },
  { id: 'hoodie',    name: 'Hoodie',    price: 2499, description: '350 GSM Brushed Fleece · Pullover',      colors: HOODIE_COLORS.map(c => ({ ...c })) },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface FontOption { id: string; name: string; label: string; family: string; category: 'street' | 'luxury' | 'creative'; preview: string; }
const FONT_CATEGORIES = [{ id: 'all', label: 'All' }, { id: 'street', label: 'Street' }, { id: 'luxury', label: 'Luxury' }, { id: 'creative', label: 'Creative' }];
const FONT_OPTIONS: FontOption[] = [
  { id: 'manrope',  name: 'Manrope',          label: 'Clean Modern',    family: "'Manrope', sans-serif",            category: 'street',   preview: 'BINGOOO' },
  { id: 'outfit',   name: 'Outfit',            label: 'High-End Street', family: "'Outfit', sans-serif",             category: 'street',   preview: 'STREET' },
  { id: 'anton',    name: 'Anton',             label: 'Ultra Heavy',     family: "'Anton', sans-serif",              category: 'street',   preview: 'HEAVY' },
  { id: 'bebas',    name: 'Bebas Neue',        label: 'Bold Headline',   family: "'Bebas Neue', sans-serif",         category: 'street',   preview: 'HEADLINE' },
  { id: 'space',    name: 'Space Grotesk',     label: 'Brutalist Tech',  family: "'Space Grotesk', sans-serif",      category: 'street',   preview: 'BRUTAL' },
  { id: 'russo',    name: 'Russo One',         label: 'Impact Block',    family: "'Russo One', sans-serif",          category: 'street',   preview: 'IMPACT' },
  { id: 'bungee',   name: 'Bungee',            label: 'Cyber Arcade',    family: "'Bungee', cursive",                category: 'street',   preview: 'ARCADE' },
  { id: 'playfair', name: 'Playfair',          label: 'Vogue Editorial', family: "'Playfair Display', serif",        category: 'luxury',   preview: 'Atelier' },
  { id: 'cinzel',   name: 'Cinzel',            label: 'Royal Roman',     family: "'Cinzel', serif",                  category: 'luxury',   preview: 'IMPERIAL' },
  { id: 'prata',    name: 'Prata',             label: 'Haute Couture',   family: "'Prata', serif",                   category: 'luxury',   preview: 'Elegance' },
  { id: 'cormorant',name: 'Cormorant',         label: 'Archival Serif',  family: "'Cormorant Garamond', serif",      category: 'luxury',   preview: 'Archival' },
  { id: 'syne',     name: 'Syne',              label: 'Avant-Garde',     family: "'Syne', sans-serif",               category: 'luxury',   preview: 'AVANT' },
  { id: 'marker',   name: 'Permanent Marker',  label: 'Graffiti Tag',    family: "'Permanent Marker', cursive",      category: 'creative', preview: 'GRAFFITI' },
  { id: 'caveat',   name: 'Caveat',            label: 'Artisan Script',  family: "'Caveat', cursive",                category: 'creative', preview: 'Handwritten' },
  { id: 'righteous',name: 'Righteous',         label: 'Retro 80s',       family: "'Righteous', cursive",             category: 'creative', preview: 'SYNTHWAVE' },
  { id: 'mono',     name: 'IBM Plex Mono',     label: 'Technical Spec',  family: "'IBM Plex Mono', monospace",       category: 'creative', preview: '240_GSM' },
  { id: 'majormono',name: 'Major Mono',        label: 'Glitch Mono',     family: "'Major Mono Display', monospace",  category: 'creative', preview: '001//BIO' },
];
const TEXT_COLORS = [
  { name: 'Auto',    hex: '' },        { name: 'White',   hex: '#FFFFFF' },
  { name: 'Black',   hex: '#171717' }, { name: 'Cream',   hex: '#F7EEDB' },
  { name: 'Sand',    hex: '#D8C8B1' }, { name: 'Red',     hex: '#E6321C' },
  { name: 'Gold',    hex: '#B7791F' }, { name: 'Navy',    hex: '#1D3557' },
];
const SPACING_OPTIONS = [{ label: 'Normal', value: '0.02em' }, { label: 'Wide', value: '0.12em' }, { label: 'Ultra', value: '0.28em' }];
const PLACEMENTS = [
  { id: 'CENTER',     label: 'Center Chest',  icon: '⊙' },
  { id: 'LEFT_CHEST', label: 'Left Chest',    icon: '◧' },
  { id: 'BACK',       label: 'Back Center',   icon: '⊞' },
  { id: 'LOWER_HEM',  label: 'Lower Hem',     icon: '⊟' },
] as const;

// ─── SVG Garment Silhouettes (fallback when no photo) ────────────────────────
function TShirtSVG({ color }: { color: string }) {
  const isDark = parseInt(color.replace('#',''), 16) < 0x888888;
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
  const isDark = parseInt(color.replace('#',''), 16) < 0x888888;
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
  const isDark = parseInt(color.replace('#',''), 16) < 0x888888;
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
  return <TShirtSVG color={color} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CustomizerPage() {
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();

  // Garment state
  const [garmentsList, setGarmentsList] = useState<GarmentType[]>(GARMENTS);
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>(GARMENTS[1]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(GARMENTS[1].colors?.[0] || COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [viewSide, setViewSide] = useState<'FRONT' | 'BACK'>('FRONT');

  // Design state
  const [designMode, setDesignMode] = useState<'upload' | 'text'>('upload');
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

  // UI state
  const [activeTab, setActiveTab] = useState<'garment' | 'design' | 'placement' | 'order'>('garment');
  const [isSizeModalOpen, setIsSizeModalOpen] = useState<boolean>(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // History
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

  const currentGarmentColor = garmentsList.find(g => g.id === selectedGarment.id)?.colors?.find(c => c.name.toLowerCase() === selectedColor.name.toLowerCase()) || selectedColor;
  const currentFrontImage = currentGarmentColor.frontImageUrl || '';
  const currentBackImage = currentGarmentColor.backImageUrl || '';
  const imageSrc = (viewSide === 'BACK' && currentBackImage) ? currentBackImage : currentFrontImage;

  // Fetch live config from API
  useEffect(() => {
    fetch('/api/v1/customizations/studio/config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const config = data?.data || data;
        if (config && Array.isArray(config.garments) && config.garments.length > 0) {
          const mergedGarments = config.garments.map((g: GarmentType) => {
            const defaultG = GARMENTS.find(dg => dg.id === g.id);
            if (!defaultG) return g;
            return {
              ...g,
              colors: g.colors?.map(c => {
                const defaultC = defaultG.colors?.find(dc => dc.name.toLowerCase() === c.name.toLowerCase());
                return {
                  ...c,
                  frontImageUrl: c.frontImageUrl || defaultC?.frontImageUrl || '',
                  backImageUrl: c.backImageUrl || defaultC?.backImageUrl || '',
                };
              }) || defaultG.colors,
            };
          });
          setGarmentsList(mergedGarments);
          setSelectedGarment(prevG => {
            const currentG = mergedGarments.find((g: GarmentType) => g.id === prevG.id) || mergedGarments[0];
            if (currentG.colors?.length > 0) {
              setSelectedColor(prevC => currentG.colors.find((c: ColorOption) => c.name.toLowerCase() === prevC.name.toLowerCase()) || currentG.colors[0]);
            }
            return currentG;
          });
        }
      })
      .catch(() => {});
  }, []);

  // History helpers
  const captureSnapshot = useCallback((): DesignSnapshot => ({
    dragXVal: dragX.get(), dragYVal: dragY.get(), zoomScale, rotation,
    customText, selectedFont, isBold, isItalic, isUppercase, textColor, letterSpacing,
    uploadedImage, designMode,
  }), [dragX, dragY, zoomScale, rotation, customText, selectedFont, isBold, isItalic, isUppercase, textColor, letterSpacing, uploadedImage, designMode]);

  const pushHistory = useCallback(() => {
    if (isApplyingHistory.current) return;
    const snap = captureSnapshot();
    setHistory(prev => { const trimmed = prev.slice(0, historyIndex + 1); return [...trimmed, snap].slice(-30); });
    setHistoryIndex(i => Math.min(i + 1, 29));
  }, [captureSnapshot, historyIndex]);

  const applySnapshot = (snap: DesignSnapshot) => {
    isApplyingHistory.current = true;
    dragX.set(snap.dragXVal); dragY.set(snap.dragYVal);
    setZoomScale(snap.zoomScale); setRotation(snap.rotation);
    setCustomText(snap.customText); setSelectedFont(snap.selectedFont);
    setIsBold(snap.isBold); setIsItalic(snap.isItalic); setIsUppercase(snap.isUppercase);
    setTextColor(snap.textColor); setLetterSpacing(snap.letterSpacing);
    setUploadedImage(snap.uploadedImage); setDesignMode(snap.designMode);
    setTimeout(() => { isApplyingHistory.current = false; }, 0);
  };

  const handleUndo = () => { if (historyIndex <= 0) return; triggerHaptic('light'); const ni = historyIndex - 1; setHistoryIndex(ni); applySnapshot(history[ni]); };
  const handleRedo = () => { if (historyIndex >= history.length - 1) return; triggerHaptic('light'); const ni = historyIndex + 1; setHistoryIndex(ni); applySnapshot(history[ni]); };

  // Pinch-to-zoom
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    let startDist = 0; let baseZoom = 1.0;
    const onStart = (e: TouchEvent) => { if (e.touches.length === 2) { startDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); baseZoom = zoomScale; } };
    const onMove = (e: TouchEvent) => { if (e.touches.length === 2 && startDist > 0) { if (e.cancelable) e.preventDefault(); const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); setZoomScale(Math.min(2.5, Math.max(0.3, +((d / startDist) * baseZoom).toFixed(2)))); } };
    const onEnd = (e: TouchEvent) => { if (e.touches.length < 2) startDist = 0; };
    canvas.addEventListener('touchstart', onStart, { passive: true }); canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd, { passive: true }); canvas.addEventListener('touchcancel', onEnd, { passive: true });
    return () => { canvas.removeEventListener('touchstart', onStart); canvas.removeEventListener('touchmove', onMove); canvas.removeEventListener('touchend', onEnd); canvas.removeEventListener('touchcancel', onEnd); };
  }, [zoomScale]);

  const handleWheel = (e: React.WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoomScale(prev => Math.min(2.5, Math.max(0.3, +(prev - e.deltaY * 0.005).toFixed(2)))); } };

  const applyPresetPlacement = (placement: typeof PLACEMENTS[number]['id']) => {
    triggerHaptic('light'); setActivePlacement(placement);
    if (placement === 'CENTER')     { dragX.set(0);   dragY.set(0);   if (viewSide === 'BACK') setViewSide('FRONT'); }
    else if (placement === 'LEFT_CHEST') { dragX.set(-52); dragY.set(-42); if (viewSide === 'BACK') setViewSide('FRONT'); }
    else if (placement === 'BACK')  { dragX.set(0);   dragY.set(-20); setViewSide('BACK'); }
    else if (placement === 'LOWER_HEM') { dragX.set(48); dragY.set(90); if (viewSide === 'BACK') setViewSide('FRONT'); }
    setTimeout(pushHistory, 50);
  };

  const handleResetPosition = () => {
    triggerHaptic('light'); dragX.set(0); dragY.set(0); setRotation(0); setZoomScale(1.0); setActivePlacement('CENTER');
    toast({ title: 'Position reset', description: 'Centered • 100% zoom • 0° rotation', variant: 'default' });
    setTimeout(pushHistory, 50);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast({ title: 'File too large', description: 'Please upload under 15 MB.', variant: 'danger' }); return; }
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
    if (!selectedSize) { toast({ title: 'Pick a size', description: 'Please choose your size before adding to cart.', variant: 'danger' }); setActiveTab('order'); return; }
    triggerHaptic('medium');
    addItem(`custom-${selectedGarment.id}-${selectedColor.name.toLowerCase()}-${selectedSize.toLowerCase()}`, 1, `custom-${Date.now()}`);
    setIsAddedFeedback(true); setTimeout(() => setIsAddedFeedback(false), 2200);
  };

  // Keyboard
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsSizeModalOpen(false); setMobileDrawerOpen(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, [historyIndex, history]);

  useEffect(() => {
    document.body.style.overflow = (isSizeModalOpen || mobileDrawerOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSizeModalOpen, mobileDrawerOpen]);

  // ─── Control Panel Tabs Content ─────────────────────────────────────────────
  const GarmentTab = () => (
    <div className="space-y-6 p-5">
      {/* Garment type */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f6a63] mb-3">Product Type</p>
        <div className="grid grid-cols-3 gap-2">
          {garmentsList.map(garment => {
            const gImg = (() => {
              const g = garmentsList.find(x => x.id === garment.id);
              const c = g?.colors?.find(x => x.name.toLowerCase() === selectedColor.name.toLowerCase());
              return c?.frontImageUrl || '';
            })();
            return (
              <button
                key={garment.id} type="button"
                onClick={() => {
                  triggerHaptic('light'); setSelectedGarment(garment);
                  const gc = garment.colors?.length ? garment.colors : COLORS;
                  const m = gc.find(c => c.name.toLowerCase() === selectedColor.name.toLowerCase()) || gc[0];
                  if (m) setSelectedColor(m);
                }}
                className={`relative border-2 rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 ${selectedGarment.id === garment.id ? 'border-[#171717] bg-[#171717]' : 'border-[#ddd3c5] hover:border-[#aaa] bg-white'}`}
              >
                <div className="h-16 w-full flex items-center justify-center overflow-hidden">
                  {gImg ? (
                    <img src={gImg} alt={garment.name} className="max-h-full max-w-full object-contain" draggable={false} />
                  ) : (
                    <div style={{ transform: 'scale(0.23)', transformOrigin: 'center', width: 80, height: 72 }}>
                      <GarmentSVG garmentId={garment.id} color={selectedColor.hex} />
                    </div>
                  )}
                </div>
                <div className={`text-[9px] font-extrabold uppercase tracking-wider ${selectedGarment.id === garment.id ? 'text-white' : 'text-[#171717]'}`}>{garment.name}</div>
                <div className={`text-[9px] font-bold ${selectedGarment.id === garment.id ? 'text-[#E6321C]' : 'text-[#E6321C]'}`}>₹{garment.price.toLocaleString('en-IN')}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[#6f6a63] mt-2">{selectedGarment.description}</p>
      </div>

      {/* Color */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f6a63]">Colorway</p>
          <span className="text-[10px] font-semibold text-[#171717]">{selectedColor.name}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {(selectedGarment.colors?.length ? selectedGarment.colors : COLORS).map(color => (
            <button
              key={color.id || color.name} type="button"
              onClick={() => { triggerHaptic('light'); setSelectedColor(color); }}
              title={color.name} aria-label={color.name}
              className={`relative w-9 h-9 rounded-full transition-all duration-200 cursor-pointer ${selectedColor.name.toLowerCase() === color.name.toLowerCase() ? 'shadow-[0_0_0_2.5px_#f7eedb,0_0_0_4px_#171717] scale-110' : 'hover:scale-110 hover:shadow-sm'}`}
              style={{ backgroundColor: color.hex, border: color.hex.toLowerCase() === '#ffffff' ? '1.5px solid #c5bdb4' : 'none' }}
            >
              {selectedColor.name.toLowerCase() === color.name.toLowerCase() && (
                <Check size={10} strokeWidth={3} className="absolute inset-0 m-auto" style={{ color: color.textContrast }} />
              )}
            </button>
          ))}
        </div>

        {/* Color photo thumbnails */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div
            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#ddd3c5] bg-[#ede0cc] cursor-pointer group"
            onClick={() => setViewSide('FRONT')}
          >
            {currentFrontImage ? (
              <img
                src={currentFrontImage}
                alt="Front"
                className={`w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105 ${viewSide === 'FRONT' ? '' : 'opacity-70'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div style={{ transform: 'scale(0.3)', transformOrigin: 'center' }}>
                  <GarmentSVG garmentId={selectedGarment.id} color={selectedColor.hex} />
                </div>
              </div>
            )}
            <div className={`absolute inset-x-0 bottom-0 text-center py-1.5 text-[8px] font-bold uppercase tracking-wider ${viewSide === 'FRONT' ? 'bg-[#171717] text-white' : 'bg-black/20 text-[#171717]'}`}>Front</div>
          </div>
          <div
            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#ddd3c5] bg-[#ede0cc] cursor-pointer group"
            onClick={() => setViewSide('BACK')}
          >
            {currentBackImage ? (
              <img
                src={currentBackImage}
                alt="Back"
                className={`w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105 ${viewSide === 'BACK' ? '' : 'opacity-70'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-50">
                <FlipHorizontal size={24} className="text-[#6f6a63]" />
              </div>
            )}
            <div className={`absolute inset-x-0 bottom-0 text-center py-1.5 text-[8px] font-bold uppercase tracking-wider ${viewSide === 'BACK' ? 'bg-[#171717] text-white' : 'bg-black/20 text-[#171717]'}`}>Back</div>
          </div>
        </div>
      </div>
    </div>
  );

  const DesignTab = () => (
    <div className="space-y-5 p-5">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#ede0cc] rounded-xl">
        {([{ mode: 'upload' as const, icon: <Upload size={13} />, label: 'Upload Image' }, { mode: 'text' as const, icon: <Type size={13} />, label: 'Custom Text' }]).map(({ mode, icon, label }) => (
          <button key={mode} type="button" onClick={() => { triggerHaptic('light'); setDesignMode(mode); }}
            className={`py-2.5 px-3 text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${designMode === mode ? 'bg-white text-[#171717] shadow-sm' : 'text-[#6f6a63] hover:text-[#171717]'}`}
          >{icon}<span>{label}</span></button>
        ))}
      </div>

      {/* Upload zone */}
      {designMode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${uploadedImage ? 'border-[#171717] bg-[#faf8f5]' : 'border-[#E6321C]/30 bg-[#faf7f0] hover:border-[#E6321C]/60 hover:bg-white'}`}
        >
          {uploadedImage ? (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-xl border border-[#ddd3c5] bg-white p-1.5 mb-3 flex items-center justify-center overflow-hidden shadow-sm">
                <img src={uploadedImage} alt="Artwork" className="max-h-full max-w-full object-contain" />
              </div>
              <span className="text-[11px] font-extrabold text-[#171717] uppercase tracking-wide mb-1">Design Loaded ✓</span>
              <p className="text-[9px] text-[#6f6a63] mb-4">Drag on shirt · Pinch to zoom · Rotate with controls</p>
              <div className="flex gap-2">
                <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-1.5 rounded-lg bg-[#171717] text-white text-[9px] font-bold uppercase hover:bg-black cursor-pointer">Replace</button>
                <button type="button" onClick={e => { e.stopPropagation(); handleClearArtwork(); }}
                  className="px-4 py-1.5 rounded-lg border border-[#ddd3c5] bg-white text-[9px] font-bold uppercase hover:border-[#E6321C] hover:text-[#E6321C] cursor-pointer">Remove</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E6321C]/10 flex items-center justify-center mb-3">
                <ImageIcon size={26} className="text-[#E6321C]" />
              </div>
              <strong className="block text-[12px] font-extrabold uppercase tracking-wide text-[#171717] mb-1">Upload Your Design</strong>
              <p className="text-[#6f6a63] text-[10px] max-w-[240px] mb-4 leading-relaxed">Any image, logo, anime art, or photo. PNG with transparent background works best.</p>
              <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-6 py-2.5 rounded-xl bg-[#E6321C] text-white text-[10px] font-bold uppercase hover:bg-[#b91f12] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md cursor-pointer">
                <Upload size={13} /><span>Choose File</span>
              </button>
              <span className="text-[8px] font-mono text-[#8a847b] mt-3">PNG · JPG · WEBP · SVG · Max 15 MB</span>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*" onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {/* Text mode */}
      {designMode === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6f6a63] mb-1.5">Your Text</label>
            <input type="text" value={customText}
              onChange={e => setCustomText(isUppercase ? e.target.value.toUpperCase() : e.target.value)}
              onBlur={pushHistory} placeholder="E.G. BINGOOO" maxLength={24}
              className="w-full h-11 px-3 bg-[#faf7f0] border border-[#ddd3c5] rounded-xl text-sm font-bold outline-none focus:border-[#171717] transition-colors" />
          </div>

          {/* Live preview */}
          <div className="rounded-xl border border-[#ddd3c5] bg-[#ede0cc] p-4 flex items-center justify-center min-h-[60px]"
            style={{ backgroundColor: selectedColor.hex }}>
            <span style={{
              fontFamily: activeFont.family, fontWeight: isBold ? 800 : 500,
              fontStyle: isItalic ? 'italic' : 'normal', textTransform: isUppercase ? 'uppercase' : 'none',
              letterSpacing, color: textColor || selectedColor.textContrast,
              fontSize: 'clamp(14px, 3vw, 22px)',
            }}>{customText || 'PREVIEW'}</span>
          </div>

          {/* Font selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6f6a63]">Font</label>
              <span className="text-[9px] font-mono text-[#E6321C]">{filteredFonts.length} styles</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {FONT_CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setSelectedFontCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase whitespace-nowrap cursor-pointer flex-shrink-0 ${selectedFontCategory === cat.id ? 'bg-[#171717] text-white' : 'bg-[#ede0cc] text-[#6f6a63] hover:text-[#171717]'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto pr-0.5">
              {filteredFonts.map(font => (
                <button key={font.id} type="button" onClick={() => { triggerHaptic('light'); setSelectedFont(font.id); }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer flex flex-col justify-between transition-all ${selectedFont === font.id ? 'border-2 border-[#171717] bg-[#f7eedb]' : 'border-[#ddd3c5] bg-white hover:border-[#aaa]'}`}>
                  <span className="text-base truncate block select-none" style={{ fontFamily: font.family }}>{font.preview}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-bold uppercase text-[#171717]">{font.name}</span>
                    <span className="text-[8px] text-[#6f6a63]">{font.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[9px] font-bold uppercase text-[#6f6a63] mb-1.5">Style</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setIsBold(!isBold); pushHistory(); }}
                  className={`w-9 h-9 rounded-xl border cursor-pointer flex items-center justify-center transition-all ${isBold ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#171717] hover:border-[#aaa]'}`}><Bold size={13} /></button>
                <button type="button" onClick={() => { setIsItalic(!isItalic); pushHistory(); }}
                  className={`w-9 h-9 rounded-xl border cursor-pointer flex items-center justify-center transition-all ${isItalic ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#171717] hover:border-[#aaa]'}`}><Italic size={13} /></button>
                <button type="button" onClick={() => { const n = !isUppercase; setIsUppercase(n); if (n) setCustomText(t => t.toUpperCase()); pushHistory(); }}
                  className={`px-2.5 h-9 rounded-xl border cursor-pointer text-[10px] font-bold transition-all ${isUppercase ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#171717] hover:border-[#aaa]'}`}>AA</button>
              </div>
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase text-[#6f6a63] mb-1.5">Spacing</span>
              <div className="flex gap-1">
                {SPACING_OPTIONS.map(opt => (
                  <button key={opt.label} type="button" onClick={() => { setLetterSpacing(opt.value); pushHistory(); }}
                    className={`flex-1 h-9 rounded-xl text-[9px] font-bold uppercase border cursor-pointer transition-all ${letterSpacing === opt.value ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#6f6a63] hover:border-[#aaa]'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Print color */}
          <div>
            <span className="block text-[9px] font-bold uppercase text-[#6f6a63] mb-2">Print Color</span>
            <div className="flex flex-wrap gap-1.5">
              {TEXT_COLORS.map(col => (
                <button key={col.name} type="button" onClick={() => { triggerHaptic('light'); setTextColor(col.hex); pushHistory(); }}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase border cursor-pointer flex items-center gap-1 transition-all ${textColor === col.hex ? 'border-2 border-[#171717] bg-[#f7eedb] text-[#171717]' : 'border-[#ddd3c5] bg-white text-[#6f6a63] hover:border-[#aaa]'}`}>
                  {col.hex && <span className="w-3 h-3 rounded-full border border-black/15 flex-shrink-0" style={{ backgroundColor: col.hex }} />}
                  {col.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const PlacementTab = () => (
    <div className="space-y-5 p-5">
      <p className="text-[10px] text-[#6f6a63] leading-relaxed">Drag the design anywhere on the garment, or snap to a preset print position:</p>
      <div className="grid grid-cols-2 gap-2">
        {PLACEMENTS.map(p => (
          <button key={p.id} type="button" onClick={() => applyPresetPlacement(p.id)}
            className={`min-h-[52px] px-3 rounded-2xl border-2 text-left cursor-pointer flex items-center gap-3 transition-all ${activePlacement === p.id ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] bg-white hover:border-[#aaa]'}`}>
            <span className="text-xl leading-none">{p.icon}</span>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide">{p.label}</div>
              <div className={`text-[8px] mt-0.5 ${activePlacement === p.id ? 'text-white/60' : 'text-[#6f6a63]'}`}>Snap to position</div>
            </div>
          </button>
        ))}
      </div>

      {/* Safe zone toggle */}
      <button type="button" onClick={() => setShowSafeZone(s => !s)}
        className={`w-full min-h-[44px] rounded-2xl border-2 text-[10px] font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${showSafeZone ? 'border-[#E6321C] bg-[#E6321C]/5 text-[#E6321C]' : 'border-[#ddd3c5] bg-white text-[#6f6a63] hover:border-[#aaa]'}`}>
        <Scan size={13} /><span>{showSafeZone ? 'Hide' : 'Show'} Print Zone Guide</span>
      </button>

      {/* Reset */}
      <button type="button" onClick={handleResetPosition}
        className="w-full min-h-[44px] rounded-2xl border border-[#ddd3c5] bg-white text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:border-[#171717] cursor-pointer transition-all">
        <RotateCcw size={13} /><span>Reset to Center</span>
      </button>

      {/* Zoom & Rotation display */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-[#f7eedb] rounded-2xl">
        <div className="text-center">
          <div className="text-[8px] font-bold uppercase text-[#6f6a63] mb-1">Zoom</div>
          <div className="text-[18px] font-extrabold font-mono text-[#171717]">{Math.round(zoomScale * 100)}%</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] font-bold uppercase text-[#6f6a63] mb-1">Rotation</div>
          <div className="text-[18px] font-extrabold font-mono text-[#171717]">{rotation}°</div>
        </div>
      </div>
    </div>
  );

  const OrderTab = () => (
    <div className="space-y-5 p-5">
      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f6a63]">Size</p>
          <button type="button" onClick={() => setIsSizeModalOpen(true)} className="text-[9px] font-bold uppercase text-[#E6321C] underline underline-offset-2 cursor-pointer hover:text-[#b91f12]">Size Guide</button>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {SIZES.map(size => (
            <button key={size} type="button" onClick={() => { triggerHaptic('light'); setSelectedSize(size); }}
              className={`h-11 rounded-xl border-2 text-[10px] font-bold cursor-pointer transition-all ${selectedSize === size ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] bg-white hover:border-[#aaa]'}`}>{size}</button>
          ))}
        </div>
      </div>

      {/* Order summary card */}
      <div className="rounded-2xl border border-[#ddd3c5] bg-[#f7eedb] overflow-hidden">
        <div className="p-4 border-b border-[#ddd3c5]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#171717]">Custom {selectedGarment.name}</div>
              <div className="text-[9px] text-[#6f6a63] mt-0.5">{selectedColor.name} · {selectedSize || 'No size'} · HD DTF Print</div>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-extrabold text-[#171717]">₹{selectedGarment.price.toLocaleString('en-IN')}</div>
              <div className="text-[8px] text-[#6f6a63]">incl. printing</div>
            </div>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#238636]" />
          <span className="text-[9px] text-[#6f6a63]">3–7 day delivery · COD available · Easy returns</span>
        </div>
      </div>

      {/* Add to cart */}
      <button type="button" onClick={handleAddToCart} disabled={isAdding}
        className={`w-full min-h-[56px] rounded-2xl text-white text-[12px] font-extrabold uppercase tracking-[0.06em] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 group ${isAddedFeedback ? 'bg-[#238636] shadow-[0_6px_20px_rgba(35,134,54,0.3)]' : 'bg-[#E6321C] hover:bg-[#B91F12] shadow-[0_6px_22px_rgba(230,50,28,0.28)] hover:shadow-[0_8px_28px_rgba(230,50,28,0.38)]'}`}>
        {isAddedFeedback ? (<><Check className="w-5 h-5" strokeWidth={2.5} /><span>Added to Cart!</span></>) : (<><ShoppingBag className="w-5 h-5" /><span>Add Custom Design to Cart</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
      </button>

      {/* Bulk/WhatsApp */}
      <div className="text-center pt-1 pb-2">
        <p className="text-[9px] font-semibold text-[#6f6a63] uppercase tracking-wider mb-1.5">Ordering for a team or brand?</p>
        <a href={getWhatsAppUrl('Hi Bingooo! I want to place a bulk custom order.')} target="_blank" rel="noopener noreferrer"
          className="text-[11px] font-extrabold uppercase tracking-wide text-[#171717] hover:text-[#E6321C] inline-flex items-center gap-1.5 transition-colors">
          <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          <span>Bulk Orders via WhatsApp →</span>
        </a>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="bg-[#f7eedb] min-h-screen text-[#171717] font-sans antialiased pb-28 lg:pb-0">
      <SEO
        title="Custom Studio — Design Your Own Garment | BINGOOO"
        description="Create custom T-shirts, oversized tees, and hoodies with HD DTF printing. Upload any design or type custom text. 17 font styles, drag-and-drop placement, 3–7 day delivery."
        canonical="https://bingooo.in/customize"
      />

      {/* ── HERO HEADER ───────────────────────────────────────────────────────── */}
      <section className="relative bg-[#171717] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #E6321C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #E6321C 0%, transparent 40%)',
        }} />
        <div className="relative container-bingooo py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] font-bold uppercase tracking-[0.22em] text-[#E6321C]">
                <Sparkles size={9} /><span>Bingooo Custom Studio</span>
              </div>
              <h1 className="text-[clamp(40px,7vw,80px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase mb-4">
                Create.<br /><span className="text-[#E6321C]">Customize.</span><br />Wear.
              </h1>
              <p className="text-[#888] text-[13px] leading-[1.75] max-w-[420px]">
                Upload any design or write custom text. Pick your garment, choose a color — your idea, your clothes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['HD DTF Printing', 'Drag Placement', '17 Font Styles', '3–7 Day Delivery', 'COD Available'].map(chip => (
                <span key={chip} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/12 text-[10px] font-semibold text-white/65">{chip}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="h-px bg-[#2a2a2a]" />
      </section>

      {/* ── MAIN BUILDER ─────────────────────────────────────────────────────── */}
      <section className="container-bingooo py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-5 xl:gap-7 items-start">

          {/* ── LEFT: LIVE CANVAS ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-[70px]">

            {/* Canvas stage */}
            <div
              ref={canvasRef}
              onWheel={handleWheel}
              className="relative bg-[#ede0cc] border border-[#ddd3c5] rounded-3xl overflow-hidden flex items-center justify-center select-none shadow-sm"
              style={{ minHeight: 'clamp(360px, 60vw, 640px)' }}
            >
              {/* Top bar */}
              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <span className="px-2.5 py-1 rounded-full bg-[#171717] text-[#f7eedb] text-[8px] font-bold uppercase tracking-wider">Live Preview</span>
                  {uploadedImage && (
                    <span className="px-2.5 py-1 rounded-full bg-white/80 border border-[#ddd3c5] text-[8px] font-bold text-[#171717] flex items-center gap-1">
                      <Move size={7} /> Drag design
                    </span>
                  )}
                </div>
                {/* Front/Back toggle */}
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-xl border border-[#ddd3c5] p-1 shadow-sm pointer-events-auto">
                  <button type="button" onClick={() => setViewSide('FRONT')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${viewSide === 'FRONT' ? 'bg-[#171717] text-white shadow-sm' : 'text-[#6f6a63] hover:text-[#171717]'}`}>
                    Front
                  </button>
                  <button type="button" onClick={() => setViewSide('BACK')}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${viewSide === 'BACK' ? 'bg-[#171717] text-white shadow-sm' : 'text-[#6f6a63] hover:text-[#171717]'}`}>
                    Back
                  </button>
                </div>
              </div>

              {/* Hint pill */}
              <AnimatePresence>
                {!uploadedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-14 inset-x-0 flex justify-center z-10 pointer-events-none"
                  >
                    <div className="flex items-center gap-1.5 bg-[#171717]/75 text-[#f7eedb] backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-mono border border-white/10 whitespace-nowrap">
                      <span>✋ Drag</span><span className="text-[#E6321C]">•</span><span>✌️ Pinch zoom</span><span className="text-[#E6321C]">•</span><span>⌥ Scroll+Ctrl</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mockup stage */}
              <div ref={mockupRef} className="relative w-[min(82%,480px)] aspect-square flex items-center justify-center select-none">
                {/* Garment */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={`${selectedColor.name} ${selectedGarment.name} – ${viewSide.toLowerCase()} view`}
                      className={`w-full h-full object-contain select-none transition-all duration-500 drop-shadow-[0_18px_48px_rgba(0,0,0,0.16)]${viewSide === 'BACK' && !currentBackImage ? ' scale-x-[-1]' : ''}`}
                      draggable={false}
                    />
                  ) : (
                    <div className="transition-all duration-300"><GarmentSVG garmentId={selectedGarment.id} color={selectedColor.hex} /></div>
                  )}
                </div>

                {/* Print zone guide */}
                <AnimatePresence>
                  {showSafeZone && !uploadedImage && designMode === 'upload' && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute z-10 pointer-events-none"
                      style={{
                        width: '42%', height: '38%',
                        top: viewSide === 'BACK' ? '18%' : '22%', left: '29%',
                        border: '1.5px dashed rgba(230,50,28,0.4)',
                        borderRadius: 8,
                        boxShadow: '0 0 0 1px rgba(230,50,28,0.1), inset 0 0 18px rgba(230,50,28,0.04)',
                      }}
                    >
                      <span className="absolute left-1/2 -translate-x-1/2 -top-4 px-2.5 py-0.5 rounded-full bg-[#E6321C]/12 border border-[#E6321C]/30 text-[7px] font-bold uppercase tracking-wider text-[#E6321C] whitespace-nowrap">Print Zone</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Draggable design */}
                <motion.div
                  drag dragConstraints={mockupRef} dragElastic={0.04} dragMomentum={false}
                  onDragStart={() => { triggerHaptic('light'); setActivePlacement('CUSTOM'); }}
                  onDragEnd={() => pushHistory()}
                  style={{
                    x: dragX, y: dragY, scale: zoomScale, rotate: rotation,
                    mixBlendMode: (uploadedImage && designBlendMode === 'multiply') ? 'multiply' : 'normal',
                  }}
                  className="absolute z-20 flex flex-col justify-center items-center text-center origin-center cursor-grab active:cursor-grabbing group p-2 touch-none select-none"
                >
                  {/* Selection handle */}
                  <div className="absolute -inset-2 border border-dashed border-[#E6321C]/60 rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150 pointer-events-none">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E6321C] text-white text-[7px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap shadow-sm">Move</div>
                  </div>

                  {uploadedImage ? (
                    <div className="relative flex items-center justify-center">
                      <img
                        src={uploadedImage}
                        alt="Uploaded artwork"
                        style={{
                          filter: isLightGarment
                            ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                            : 'drop-shadow(0 2px 10px rgba(0,0,0,0.6)) brightness(0.97) saturate(1.04)',
                          imageRendering: 'crisp-edges',
                        }}
                        className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] object-contain select-none pointer-events-none"
                        draggable={false}
                      />
                      <button type="button" onClick={e => { e.stopPropagation(); handleClearArtwork(); }}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-[#171717] hover:bg-[#E6321C] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer" aria-label="Remove">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ) : designMode === 'upload' ? (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-4 rounded-2xl border-2 border-dashed border-[#E6321C]/40 bg-white/75 hover:bg-white hover:border-[#E6321C]/70 transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 shadow-sm backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-[#E6321C]/10 flex items-center justify-center">
                        <Upload size={18} className="text-[#E6321C]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#171717]">Upload Design</span>
                      <span className="text-[8px] text-[#6f6a63]">PNG · JPG · SVG</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 select-none leading-tight break-words text-center"
                      style={{
                        fontFamily: activeFont.family, fontWeight: isBold ? 800 : 500,
                        fontStyle: isItalic ? 'italic' : 'normal', textTransform: isUppercase ? 'uppercase' : 'none',
                        letterSpacing, color: textColor || selectedColor.textContrast,
                        fontSize: 'clamp(18px, 2.8vw, 32px)',
                        textShadow: (textColor === '#FFFFFF' || (!textColor && selectedColor.textContrast === '#FFFFFF')) ? '0 1px 4px rgba(0,0,0,0.4)' : undefined,
                        mixBlendMode: designBlendMode === 'multiply' ? 'multiply' : 'normal',
                      }}>
                      {customText || 'BINGOOO'}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Desktop canvas controls */}
              <div className="absolute bottom-3 right-3 z-20 hidden sm:flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-[#ddd3c5] p-1.5 gap-0.5">
                <button type="button" onClick={() => setZoomScale(z => Math.max(0.3, +(z - 0.1).toFixed(1)))} disabled={zoomScale <= 0.3}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] disabled:opacity-30 cursor-pointer" aria-label="Zoom Out"><ZoomOut size={12} /></button>
                <span className="text-[10px] font-mono font-bold px-1 min-w-[36px] text-center">{Math.round(zoomScale * 100)}%</span>
                <button type="button" onClick={() => setZoomScale(z => Math.min(2.5, +(z + 0.1).toFixed(1)))} disabled={zoomScale >= 2.5}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] disabled:opacity-30 cursor-pointer" aria-label="Zoom In"><ZoomIn size={12} /></button>
                <div className="h-4 w-px bg-[#ddd3c5] mx-0.5" />
                <button type="button" onClick={() => setRotation(r => (r - 15 + 360) % 360)} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] cursor-pointer"><RotateCcw size={12} /></button>
                <span className="text-[10px] font-mono font-bold px-1 min-w-[28px] text-center">{rotation}°</span>
                <button type="button" onClick={() => setRotation(r => (r + 15) % 360)} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-[#ede0cc] cursor-pointer"><RotateCw size={12} /></button>
                <div className="h-4 w-px bg-[#ddd3c5] mx-0.5" />
                <button type="button" onClick={handleResetPosition} className="px-2 h-7 rounded-xl text-[9px] font-bold hover:bg-[#ede0cc] cursor-pointer flex items-center gap-1"><Crosshair size={10} /><span>Reset</span></button>
              </div>

              {/* Undo/Redo */}
              <div className="absolute bottom-3 left-3 z-20 hidden sm:flex gap-1">
                <button type="button" onClick={handleUndo} disabled={historyIndex <= 0}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/90 border border-[#ddd3c5] hover:bg-[#ede0cc] disabled:opacity-30 cursor-pointer shadow-sm" title="Undo (Ctrl+Z)"><Undo2 size={12} /></button>
                <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/90 border border-[#ddd3c5] hover:bg-[#ede0cc] disabled:opacity-30 cursor-pointer shadow-sm" title="Redo (Ctrl+Y)"><Redo2 size={12} /></button>
              </div>
            </div>

            {/* Mobile quick bar */}
            <div className="sm:hidden flex items-center justify-between gap-2 p-3 bg-white border border-[#ddd3c5] rounded-2xl shadow-sm">
              <div className="flex gap-1">
                <button type="button" onClick={handleUndo} disabled={historyIndex <= 0} className="w-9 h-9 rounded-xl border border-[#ddd3c5] bg-[#f7eedb] flex items-center justify-center disabled:opacity-30 cursor-pointer"><Undo2 size={14} /></button>
                <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="w-9 h-9 rounded-xl border border-[#ddd3c5] bg-[#f7eedb] flex items-center justify-center disabled:opacity-30 cursor-pointer"><Redo2 size={14} /></button>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setZoomScale(z => Math.max(0.3, +(z - 0.1).toFixed(1)))} disabled={zoomScale <= 0.3} className="w-9 h-9 rounded-xl border border-[#ddd3c5] bg-white flex items-center justify-center disabled:opacity-30 cursor-pointer"><ZoomOut size={14} /></button>
                <span className="font-mono text-[10px] font-bold min-w-[34px] text-center">{Math.round(zoomScale * 100)}%</span>
                <button type="button" onClick={() => setZoomScale(z => Math.min(2.5, +(z + 0.1).toFixed(1)))} disabled={zoomScale >= 2.5} className="w-9 h-9 rounded-xl border border-[#ddd3c5] bg-white flex items-center justify-center disabled:opacity-30 cursor-pointer"><ZoomIn size={14} /></button>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setRotation(r => (r - 15 + 360) % 360)} className="w-9 h-9 rounded-xl border border-[#ddd3c5] bg-white flex items-center justify-center cursor-pointer"><RotateCcw size={14} /></button>
                <span className="font-mono text-[10px] font-bold min-w-[26px] text-center">{rotation}°</span>
                <button type="button" onClick={() => setRotation(r => (r + 15) % 360)} className="w-9 h-9 rounded-xl border border-[#ddd3c5] bg-white flex items-center justify-center cursor-pointer"><RotateCw size={14} /></button>
              </div>
              {/* Mobile: open drawer */}
              <button type="button" onClick={() => setMobileDrawerOpen(true)}
                className="h-9 px-3 rounded-xl bg-[#171717] text-white text-[9px] font-bold flex items-center gap-1.5 cursor-pointer">
                <Layers size={12} /><span>Controls</span>
              </button>
            </div>

            {/* Print info strip */}
            <div className="p-3.5 bg-white border border-[#ddd3c5] rounded-2xl text-[10px] text-[#6f6a63] flex items-start gap-2.5 shadow-sm">
              <span className="text-base shrink-0">✨</span>
              <span><strong className="text-[#171717]">High-Definition DTF Printing.</strong> Your design is permanently printed with vivid, wash-safe direct-to-film colors.</span>
            </div>
          </div>

          {/* ── RIGHT: CONTROL PANEL ──────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col border border-[#ddd3c5] rounded-3xl bg-white shadow-sm overflow-hidden">

            {/* Tab nav */}
            <div className="flex border-b border-[#ddd3c5] overflow-x-auto scrollbar-none">
              {([
                { key: 'garment',   label: 'Garment', icon: <Eye size={12} /> },
                { key: 'design',    label: 'Design',   icon: <ImageIcon size={12} /> },
                { key: 'placement', label: 'Place',    icon: <Crosshair size={12} /> },
                { key: 'order',     label: 'Order',    icon: <ShoppingBag size={12} /> },
              ] as const).map(tab => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === tab.key ? 'border-[#E6321C] text-[#171717] bg-[#faf8f5]' : 'border-transparent text-[#6f6a63] hover:text-[#171717] hover:bg-[#faf8f5]'}`}>
                  {tab.icon}<span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                  {activeTab === 'garment'   && <GarmentTab />}
                  {activeTab === 'design'    && <DesignTab />}
                  {activeTab === 'placement' && <PlacementTab />}
                  {activeTab === 'order'     && <OrderTab />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky CTA */}
            {activeTab !== 'order' && (
              <div className="p-4 border-t border-[#ddd3c5] bg-white">
                <button type="button" onClick={() => setActiveTab('order')}
                  className="w-full h-11 rounded-xl bg-[#E6321C] text-white text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#B91F12] transition-colors cursor-pointer shadow-md">
                  <ShoppingBag size={14} /><span>Go to Order →</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#171717] text-white mt-8">
        <div className="container-bingooo">
          <div className="text-center mb-12">
            <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#6f6a63] mb-3">How It Works</div>
            <h2 className="text-[clamp(32px,5vw,60px)] leading-[0.9] font-extrabold tracking-[-0.06em] uppercase">Your Idea.<br /><span className="text-[#E6321C]">Your Clothes.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#2a2a2a] rounded-2xl overflow-hidden">
            {[
              { n: '01', title: 'Choose Canvas',  body: 'Pick your T-shirt, oversized tee, or hoodie and choose your preferred colorway.' },
              { n: '02', title: 'Upload or Type', body: 'Upload any artwork from your gallery, or type custom text with 17 curated font styles.' },
              { n: '03', title: 'Position & Scale', body: 'Drag anywhere on the shirt. Pinch or scroll to zoom. Rotate to perfect the angle.' },
              { n: '04', title: 'Preview & Order', body: 'Check your custom piece, pick your size, and add to cart for HD DTF printing.' },
            ].map(({ n, title, body }) => (
              <article key={n} className="p-8 bg-[#171717] flex flex-col">
                <div className="text-[#E6321C] font-mono text-[11px] font-bold mb-4">{n}</div>
                <h3 className="text-[15px] font-bold text-white uppercase mb-2">{title}</h3>
                <p className="text-[#777] text-[11px] leading-[1.75]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE BOTTOM DRAWER ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileDrawerOpen(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-[60] bg-white rounded-t-3xl shadow-2xl lg:hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#ddd3c5]" />
              </div>
              {/* Drawer tabs */}
              <div className="flex border-b border-[#ddd3c5] overflow-x-auto scrollbar-none px-2">
                {([
                  { key: 'garment', label: 'Garment' }, { key: 'design', label: 'Design' },
                  { key: 'placement', label: 'Placement' }, { key: 'order', label: 'Order' },
                ] as const).map(tab => (
                  <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === tab.key ? 'border-[#E6321C] text-[#171717]' : 'border-transparent text-[#6f6a63]'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                {activeTab === 'garment'   && <GarmentTab />}
                {activeTab === 'design'    && <DesignTab />}
                {activeTab === 'placement' && <PlacementTab />}
                {activeTab === 'order'     && <OrderTab />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE STICKY BAR ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F5]/96 backdrop-blur-md border-t border-[#ddd3c5] px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#6f6a63] truncate">{selectedGarment.name} · {selectedSize || '—'} · {selectedColor.name}</div>
          <div className="text-[20px] font-extrabold text-[#171717] leading-none mt-0.5">₹{selectedGarment.price.toLocaleString('en-IN')}</div>
        </div>
        <button type="button" onClick={handleAddToCart} disabled={isAdding}
          className="flex-shrink-0 min-h-[46px] px-5 rounded-xl bg-[#E6321C] text-white text-[11px] font-bold uppercase hover:bg-[#b91f12] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50">
          {isAddedFeedback ? (<><span>Added!</span><Check className="w-4 h-4" /></>) : (<><span>Add to Cart</span><ArrowRight className="w-4 h-4" /></>)}
        </button>
      </div>

      {/* ── SIZE MODAL ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSizeModalOpen && (
          <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSizeModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
              className="w-[min(700px,100%)] max-h-[90vh] overflow-y-auto bg-[#f7eedb] rounded-3xl p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[24px] font-extrabold tracking-[-0.04em] uppercase">Size Guide</h2>
                <button type="button" onClick={() => setIsSizeModalOpen(false)} className="w-9 h-9 border border-[#ddd3c5] rounded-xl bg-white text-lg flex items-center justify-center hover:bg-[#171717] hover:text-white cursor-pointer transition-colors">×</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse">
                  <thead><tr>{['Size', 'Chest', 'Shoulder', 'Length'].map(h => <th key={h} className="p-3.5 border border-[#ddd3c5] bg-[#171717] text-white text-left text-[11px] font-bold uppercase">{h}</th>)}</tr></thead>
                  <tbody>
                    {[['XS','96cm','42cm','66cm'],['S','102cm','44cm','68cm'],['M','108cm','46cm','70cm'],['L','114cm','48cm','72cm'],['XL','120cm','50cm','74cm'],['XXL','126cm','52cm','76cm']].map(([sz, ...vals]) => (
                      <tr key={sz} className={sz === selectedSize ? 'bg-[#e8ddc8]' : ''}>
                        <td className="p-3.5 border border-[#ddd3c5] text-[11px] font-bold">{sz}{sz === selectedSize && <span className="ml-1.5 text-[8px] text-[#E6321C] font-bold uppercase">selected</span>}</td>
                        {vals.map((v, i) => <td key={i} className="p-3.5 border border-[#ddd3c5] text-[11px]">{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default CustomizerPage;
