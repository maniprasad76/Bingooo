import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shirt,
  UploadCloud,
  Type,
  Sliders,
  Trash2,
  Sparkles,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ShieldCheck,
  Zap,
  Info,
  Palette,
  Check,
  Flame,
} from 'lucide-react';
import type { ArtworkLayer, TypographyLayer } from './GarmentCanvas';

export interface GarmentProduct {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  description?: string;
  variants?: any[];
}

export interface ColorOption {
  name: string;
  hex: string;
}

// 5 Curated Offline Streetwear Graphic Presets
export const PRESET_ARTWORKS = [
  {
    id: 'bingooo-box',
    name: 'Bingooo Atelier Box',
    category: 'Brand Signature',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><rect width="300" height="120" rx="14" fill="%23E6321C"/><text x="150" y="68" font-family="system-ui,sans-serif" font-weight="900" font-size="34" fill="white" text-anchor="middle" letter-spacing="4">BINGOOO</text><text x="150" y="94" font-family="system-ui,sans-serif" font-weight="700" font-size="12" fill="%23F7EEDB" text-anchor="middle" letter-spacing="6">240 GSM ATELIER</text></svg>',
  },
  {
    id: 'tokyo-vintage',
    name: 'Tokyo Underground',
    category: 'Streetwear Graphic',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260"><circle cx="130" cy="130" r="110" fill="none" stroke="%23171717" stroke-width="4.5"/><circle cx="130" cy="130" r="95" fill="%23E6321C" fill-opacity="0.12"/><text x="130" y="112" font-family="system-ui,sans-serif" font-weight="900" font-size="30" fill="%23171717" text-anchor="middle" letter-spacing="3">TOKYO</text><text x="130" y="145" font-family="system-ui,sans-serif" font-weight="800" font-size="14" fill="%23E6321C" text-anchor="middle" letter-spacing="5">OVERSIZED</text><text x="130" y="174" font-family="system-ui,sans-serif" font-weight="700" font-size="11" fill="%236F6A63" text-anchor="middle" letter-spacing="3">240 GSM HEAVYWEIGHT</text></svg>',
  },
  {
    id: 'kanji-freedom',
    name: 'Kanji Freedom (自由)',
    category: 'Minimalist Kanji',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect x="25" y="25" width="170" height="170" rx="10" fill="none" stroke="%23E6321C" stroke-width="5" stroke-dasharray="6 6"/><text x="110" y="125" font-family="serif" font-weight="900" font-size="70" fill="%23171717" text-anchor="middle">自由</text><text x="110" y="165" font-family="system-ui,sans-serif" font-weight="800" font-size="12" fill="%23E6321C" text-anchor="middle" letter-spacing="5">FREEDOM • 240G</text></svg>',
  },
  {
    id: 'vintage-crest',
    name: 'Heritage Archival Crest',
    category: 'Heritage Crest',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><polygon points="120,20 210,65 210,165 120,220 30,165 30,65" fill="none" stroke="%23171717" stroke-width="4.5"/><polygon points="120,35 195,73 195,157 120,205 45,157 45,73" fill="%23F7EEDB" stroke="%23DDD3C5" stroke-width="2"/><text x="120" y="115" font-family="serif" font-weight="900" font-size="44" fill="%23E6321C" text-anchor="middle">B</text><text x="120" y="152" font-family="system-ui,sans-serif" font-weight="800" font-size="12" fill="%23171717" text-anchor="middle" letter-spacing="4">HEAVYWEIGHT</text></svg>',
  },
  {
    id: 'geometric-wave',
    name: 'Parallel Waveform',
    category: 'Abstract Vector',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="180" viewBox="0 0 260 180"><path d="M 20 90 Q 70 30, 130 90 T 240 90" fill="none" stroke="%23E6321C" stroke-width="6"/><path d="M 20 110 Q 70 50, 130 110 T 240 110" fill="none" stroke="%23171717" stroke-width="4"/><text x="130" y="155" font-family="system-ui,sans-serif" font-weight="800" font-size="12" fill="%23171717" text-anchor="middle" letter-spacing="4">240 GSM ATELIER</text></svg>',
  },
];

export const TEXT_PALETTES = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Obsidian', hex: '#171717' },
  { name: 'Cream', hex: '#FAF6EE' },
  { name: 'Sand', hex: '#C8B99D' },
  { name: 'Brand Red', hex: '#E6321C' },
  { name: 'Antique Gold', hex: '#D4AF37' },
  { name: 'Royal Navy', hex: '#1D3557' },
];

export const FONTS_LIST = [
  { name: 'Manrope', label: 'Clean Modern', family: 'Manrope, sans-serif' },
  { name: 'Oswald', label: 'Bold Condensed', family: 'Oswald, sans-serif' },
  { name: 'Playfair', label: 'Editorial Serif', family: 'Playfair Display, serif' },
  { name: 'Caveat', label: 'Handwritten', family: 'Caveat, cursive' },
  { name: 'Space Mono', label: 'Brutalist Code', family: 'monospace' },
];

interface DesignControlsProps {
  products: GarmentProduct[];
  currentProduct: GarmentProduct | null;
  onSelectProduct: (product: GarmentProduct) => void;
  availableColors: ColorOption[];
  selectedColor: ColorOption;
  onSelectColor: (color: ColorOption) => void;
  availableSizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  activeView: 'front' | 'back';
  artwork: ArtworkLayer | null;
  onUpdateArtwork: (updates: Partial<ArtworkLayer>) => void;
  onRemoveArtwork: () => void;
  onUploadFile: (file: File) => void;
  typography: TypographyLayer | null;
  onUpdateTypography: (updates: Partial<TypographyLayer>) => void;
  onRemoveTypography: () => void;
  customerNotes: string;
  onChangeCustomerNotes: (notes: string) => void;
}

export function DesignControls({
  products,
  currentProduct,
  onSelectProduct,
  availableColors,
  selectedColor,
  onSelectColor,
  availableSizes,
  selectedSize,
  onSelectSize,
  activeView,
  artwork,
  onUpdateArtwork,
  onRemoveArtwork,
  onUploadFile,
  typography,
  onUpdateTypography,
  onRemoveTypography,
  customerNotes,
  onChangeCustomerNotes,
}: DesignControlsProps) {
  const [activeTab, setActiveTab] = useState<'garment' | 'artwork' | 'typography' | 'specs'>('garment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div className="rounded-3xl border border-[#DDD3C5] bg-white shadow-sm overflow-hidden flex flex-col text-left">
      {/* ─── Studio Workbench Header Bar ─── */}
      <div className="p-4 sm:p-5 border-b border-[#DDD3C5] bg-[#FAF8F5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#E6321C] animate-pulse" />
          <span className="font-heading font-black text-xs sm:text-sm uppercase tracking-wider text-[#171717]">
            240 GSM CUSTOM WORKBENCH
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#E6321C] bg-[#FDF0EE] px-2.5 py-1 rounded-full">
          <Flame size={12} />
          <span>EDITING {activeView.toUpperCase()}</span>
        </div>
      </div>

      {/* ─── Studio Navigation Pill Tabs ─── */}
      <div className="grid grid-cols-4 border-b border-[#DDD3C5] bg-white text-center">
        <button
          type="button"
          onClick={() => setActiveTab('garment')}
          className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'garment'
              ? 'border-[#E6321C] text-[#E6321C] bg-[#FAF8F5]'
              : 'border-transparent text-[#6F6A63] hover:text-[#171717]'
          }`}
        >
          <Shirt size={15} />
          <span>Garment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('artwork')}
          className={`relative py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'artwork'
              ? 'border-[#E6321C] text-[#E6321C] bg-[#FAF8F5]'
              : 'border-transparent text-[#6F6A63] hover:text-[#171717]'
          }`}
        >
          <UploadCloud size={15} />
          <span>Graphics</span>
          {artwork?.url && (
            <span className="h-2 w-2 rounded-full bg-[#E6321C] absolute top-2 right-2 sm:static sm:top-auto sm:right-auto" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          className={`relative py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'typography'
              ? 'border-[#E6321C] text-[#E6321C] bg-[#FAF8F5]'
              : 'border-transparent text-[#6F6A63] hover:text-[#171717]'
          }`}
        >
          <Type size={15} />
          <span>Text</span>
          {typography?.text && (
            <span className="h-2 w-2 rounded-full bg-[#E6321C] absolute top-2 right-2 sm:static sm:top-auto sm:right-auto" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`py-3.5 px-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'specs'
              ? 'border-[#E6321C] text-[#E6321C] bg-[#FAF8F5]'
              : 'border-transparent text-[#6F6A63] hover:text-[#171717]'
          }`}
        >
          <Sliders size={15} />
          <span>240 GSM</span>
        </button>
      </div>

      {/* ─── Tab Content Panels ─── */}
      <div className="p-5 sm:p-6 space-y-6">
        <AnimatePresence mode="wait">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 1: GARMENT & 240 GSM SPEC */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'garment' && (
            <motion.div
              key="tab-garment"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Garment Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#171717]">
                    1. Apparel Canvas
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#E6321C] bg-[#FDF0EE] px-2 py-0.5 rounded">
                    240 GSM COMBED COTTON
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p) => {
                    const isSelected = currentProduct?.id === p.id;
                    const isHoodie = p.slug.includes('hoodie') || p.title.toLowerCase().includes('hoodie');
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectProduct(p)}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between text-left transition-all ${
                          isSelected
                            ? 'border-[#E6321C] bg-[#FDF0EE] text-[#E6321C] shadow-xs'
                            : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shirt size={16} />
                            <span className="font-bold text-xs">
                              {isHoodie ? '350 GSM Heavy Pullover' : '240 GSM Heavy Oversized Tee'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#6F6A63] line-clamp-1 block">
                            {isHoodie ? '350 GSM French Terry Fleece' : '240 GSM Bio-Washed Combed Cotton'}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold shrink-0 ml-2">
                          ₹{p.base_price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-3 pt-4 border-t border-[#DDD3C5]/70">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-bold uppercase tracking-wider text-[#171717]">
                    2. Fabric Shade: <span className="text-[#E6321C]">{selectedColor.name}</span>
                  </span>
                  <span className="text-[#6F6A63] text-[11px]">Reactive Dyed • Colorfast</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {availableColors.map((c) => {
                    const isSelected = selectedColor.name.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => onSelectColor(c)}
                        aria-label={`Select color ${c.name}`}
                        className={`group relative h-10 w-10 rounded-full border transition-all flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-[#E6321C] border-[#171717]/40 scale-110 shadow-sm'
                            : 'border-[#DDD3C5] hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <Check
                            size={14}
                            className={
                              ['white', 'oatmeal', 'sandstone', 'cream', 'off-white cream', 'vintage sand'].includes(c.name.toLowerCase())
                                ? 'text-black'
                                : 'text-white'
                            }
                            strokeWidth={3}
                          />
                        )}
                        <span className="absolute -bottom-6 scale-0 group-hover:scale-100 transition-all text-[10px] bg-[#171717] text-white px-2 py-0.5 rounded-md whitespace-nowrap z-30 shadow-sm">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizing Chips */}
              <div className="space-y-3 pt-4 border-t border-[#DDD3C5]/70">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-bold uppercase tracking-wider text-[#171717]">
                    3. Garment Size: <span className="text-[#E6321C]">{selectedSize}</span>
                  </span>
                  <span className="text-[#6F6A63] text-[11px]">Drop-Shoulder Boxy Silhouette</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSize.toUpperCase() === sz.toUpperCase();
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onSelectSize(sz)}
                        className={`h-11 w-12 rounded-xl border text-xs font-sans font-bold uppercase transition-all ${
                          isSelected
                            ? 'border-[#E6321C] text-[#E6321C] bg-[#FDF0EE] shadow-xs scale-105'
                            : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 2: ARTWORK & GRAPHIC UPLOADS */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'artwork' && (
            <motion.div
              key="tab-artwork"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Drag and Drop Uploader */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#DDD3C5] hover:border-[#E6321C] bg-[#FAF8F5]/80 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="h-11 w-11 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mb-2.5 shadow-2xs">
                  <UploadCloud size={22} />
                </div>
                <p className="text-xs font-sans text-[#171717] font-bold mb-1">
                  {artwork?.url ? 'Click to replace graphic' : 'Drop your artwork file here or click to browse'}
                </p>
                <span className="text-[11px] text-[#6F6A63] font-sans">
                  PNG with transparent background recommended (Up to 25MB • 300 DPI)
                </span>
              </div>

              {/* Curated Streetwear Presets */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#E6321C]" />
                    Or Pick Streetwear Presets
                  </span>
                  <span className="text-[10px] font-mono text-[#6F6A63]">Instant 1-Click</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_ARTWORKS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onUpdateArtwork({
                          url: preset.dataUrl,
                          scale: 1,
                          rotation: 0,
                          x: 0,
                          y: 0,
                        })
                      }
                      className="p-2.5 rounded-2xl border border-[#DDD3C5] hover:border-[#E6321C] bg-[#FAF8F5] text-left transition-all hover:-translate-y-0.5 shadow-2xs"
                    >
                      <div className="aspect-[3/2] w-full rounded-xl bg-white border border-[#DDD3C5]/60 flex items-center justify-center p-1.5 overflow-hidden mb-2">
                        <img src={preset.dataUrl} alt={preset.name} className="h-full w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-sans font-bold text-[#171717] block truncate">
                        {preset.name}
                      </span>
                      <span className="text-[9px] text-[#6F6A63] block font-mono">{preset.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Graphic Transform Sliders */}
              {artwork?.url && (
                <div className="rounded-2xl border border-[#DDD3C5] bg-[#FAF8F5] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DDD3C5]/70 pb-2.5">
                    <span className="text-xs font-sans font-bold text-[#171717] uppercase tracking-wider">
                      Adjust Graphic Placement
                    </span>
                    <button
                      type="button"
                      onClick={onRemoveArtwork}
                      className="text-xs text-[#E6321C] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>

                  {/* Scale Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-sans text-[#171717]">
                      <span>Scale / Size</span>
                      <span className="font-mono font-bold">{Math.round((artwork.scale || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={artwork.scale || 1}
                      onChange={(e) => onUpdateArtwork({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-[#E6321C] h-1.5 bg-[#DDD3C5] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Rotate Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-sans text-[#171717]">
                      <span>Rotation Angle</span>
                      <span className="font-mono font-bold">{artwork.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={artwork.rotation || 0}
                      onChange={(e) => onUpdateArtwork({ rotation: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#E6321C] h-1.5 bg-[#DDD3C5] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 3: TYPOGRAPHY & TEXT */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'typography' && (
            <motion.div
              key="tab-typography"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-[#171717] block">
                  Bespoke Slogan / Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WEAR WHAT FEELS LIKE YOU..."
                    value={typography?.text || ''}
                    onChange={(e) =>
                      onUpdateTypography({
                        text: e.target.value,
                        font: typography?.font || FONTS_LIST[0].family,
                        color: typography?.color || '#171717',
                        size: typography?.size || 22,
                        isBold: typography?.isBold || false,
                        isItalic: typography?.isItalic || false,
                        isUppercase: typography?.isUppercase || true,
                        textAlign: typography?.textAlign || 'center',
                        x: typography?.x || 0,
                        y: typography?.y || 50,
                      })
                    }
                    className="flex-1 h-11 rounded-xl border border-[#DDD3C5] bg-white px-3.5 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                  />
                  {typography?.text && (
                    <button
                      type="button"
                      onClick={onRemoveTypography}
                      className="h-11 w-11 rounded-xl border border-[#DDD3C5] text-[#E6321C] hover:bg-[#FDF0EE] flex items-center justify-center transition-colors"
                      title="Clear text"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-[#171717] block">
                  Typeface Style
                </label>
                <select
                  value={typography?.font || FONTS_LIST[0].family}
                  onChange={(e) => onUpdateTypography({ font: e.target.value })}
                  className="w-full h-11 rounded-xl border border-[#DDD3C5] bg-white px-3 text-xs font-sans font-bold text-[#171717] focus:border-[#E6321C] focus:outline-none"
                >
                  {FONTS_LIST.map((f) => (
                    <option key={f.name} value={f.family}>
                      {f.name} — {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Ink Color */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-[#171717] block">
                  Text Ink Palette
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {TEXT_PALETTES.map((tp) => {
                    const isSelected = typography?.color === tp.hex;
                    return (
                      <button
                        key={tp.name}
                        type="button"
                        onClick={() => onUpdateTypography({ color: tp.hex })}
                        className={`h-8 w-8 rounded-full border transition-all flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-[#E6321C] scale-110 shadow-xs'
                            : 'border-[#DDD3C5] hover:scale-105'
                        }`}
                        style={{ backgroundColor: tp.hex }}
                        title={tp.name}
                      >
                        {isSelected && (
                          <Check
                            size={13}
                            className={['#FFFFFF', '#FAF6EE', '#C8B99D'].includes(tp.hex) ? 'text-black' : 'text-white'}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size & Styles */}
              <div className="space-y-3 pt-3 border-t border-[#DDD3C5]/70">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans text-[#171717]">
                    <span>Font Size</span>
                    <span className="font-mono font-bold">{typography?.size || 22}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="44"
                    step="1"
                    value={typography?.size || 22}
                    onChange={(e) => onUpdateTypography({ size: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#E6321C] h-1.5 bg-[#DDD3C5] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ isBold: !typography?.isBold })}
                      className={`h-9 w-9 flex items-center justify-center ${
                        typography?.isBold ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                      title="Bold"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ isItalic: !typography?.isItalic })}
                      className={`h-9 w-9 flex items-center justify-center ${
                        typography?.isItalic ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                      title="Italic"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ isUppercase: !typography?.isUppercase })}
                      className={`h-9 w-9 text-xs font-mono font-bold flex items-center justify-center ${
                        typography?.isUppercase ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                      title="All-Caps"
                    >
                      AA
                    </button>
                  </div>

                  <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ textAlign: 'left' })}
                      className={`h-9 w-9 flex items-center justify-center ${
                        typography?.textAlign === 'left'
                          ? 'bg-[#FDF0EE] text-[#E6321C]'
                          : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ textAlign: 'center' })}
                      className={`h-9 w-9 flex items-center justify-center ${
                        typography?.textAlign === 'center'
                          ? 'bg-[#FDF0EE] text-[#E6321C]'
                          : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateTypography({ textAlign: 'right' })}
                      className={`h-9 w-9 flex items-center justify-center ${
                        typography?.textAlign === 'right'
                          ? 'bg-[#FDF0EE] text-[#E6321C]'
                          : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 4: 240 GSM CRAFT & ATELIER STANDARDS */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === 'specs' && (
            <motion.div
              key="tab-specs"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* 240 GSM Core Pillar */}
              <div className="rounded-2xl border border-[#DDD3C5] bg-[#FAF8F5] p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#171717]">
                  <Flame size={18} className="text-[#E6321C]" />
                  <h4 className="font-heading font-extrabold text-sm uppercase tracking-wider">
                    Why 240 GSM Heavyweight?
                  </h4>
                </div>
                <p className="text-xs text-[#6F6A63] font-sans leading-relaxed">
                  240 GSM is the sweet spot for modern streetwear. It creates a structured, architectural drape that doesn&apos;t cling, holds its shape through hundreds of wash cycles, and features an anti-sag dense ribbed collar.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-sans">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#171717]">240 GSM Single Jersey</strong>
                      <span className="text-[#6F6A63] text-[11px]">100% Combed Cotton</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap size={16} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#171717]">300 DPI HD Color</strong>
                      <span className="text-[#6F6A63] text-[11px]">Direct-to-Garment DTG</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Palette size={16} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#171717]">OEKO-TEX Certified</strong>
                      <span className="text-[#6F6A63] text-[11px]">Toxin-free, skin-safe</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-[#E6321C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#171717]">Pre-Shrunk</strong>
                      <span className="text-[#6F6A63] text-[11px]">Zero post-wash shrink</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-[#171717] block">
                  Atelier Print Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customerNotes}
                  onChange={(e) => onChangeCustomerNotes(e.target.value)}
                  placeholder="Special instructions: e.g. Print graphic 2 inches below neckline, ensure bold opacity..."
                  className="w-full rounded-2xl border border-[#DDD3C5] bg-white p-3 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
