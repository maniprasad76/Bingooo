import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shirt,
  Sparkles,
  Type,
  ShoppingBag,
  X,
  Check,
  Upload,
} from 'lucide-react';
import { PRESET_ARTWORKS, type GarmentProduct, type ColorOption } from './DesignControls';
import type { ArtworkLayer, TypographyLayer } from './GarmentCanvas';

type MobileTab = 'garment' | 'artwork' | 'text' | 'summary' | null;

interface MobileCustomizerBarProps {
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
  basePrice: number;
  dualSidedFee: number;
  totalPrice: number;
  isDualSided: boolean;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

const FONT_OPTIONS = [
  { name: 'Outfit (Modern)', value: 'Outfit, sans-serif' },
  { name: 'Manrope (Clean)', value: 'Manrope, sans-serif' },
  { name: 'Playfair (Editorial)', value: 'Playfair Display, serif' },
  { name: 'Plus Jakarta (Tech)', value: 'Plus Jakarta Sans, sans-serif' },
];

export function MobileCustomizerBar({
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
  basePrice,
  dualSidedFee,
  totalPrice,
  isDualSided,
  onAddToCart,
  isAddingToCart,
}: MobileCustomizerBarProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>(null);

  const toggleTab = (tab: MobileTab) => {
    setActiveTab((current) => (current === tab ? null : tab));
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
      {/* ─── Backdrop (when sheet is open) ─── */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTab(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs -z-10"
          />
        )}
      </AnimatePresence>

      {/* ─── Slide-Up Bottom Sheet Panel ─── */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full bg-[#FAF8F5] border-t border-[#DDD3C5] rounded-t-3xl shadow-2xl overflow-hidden max-h-[72vh] flex flex-col"
          >
            {/* Sheet Header with drag bar and title */}
            <div className="flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b border-[#DDD3C5]/60 bg-white/70 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E6321C]" />
                <h3 className="text-xs font-heading uppercase font-black text-[#171717] tracking-wider">
                  {activeTab === 'garment' && 'Garment Silhouette & Color'}
                  {activeTab === 'artwork' && 'Upload Artwork & Presets'}
                  {activeTab === 'text' && 'Typography & Custom Slogan'}
                  {activeTab === 'summary' && 'Print Summary & Checkout'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="h-7 w-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#171717] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sheet Body Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-left pb-6">
              {/* 1. GARMENT TAB */}
              {activeTab === 'garment' && (
                <div className="space-y-4">
                  {/* Silhouette Switcher */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-2">
                      Silhouette
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {products.map((p) => {
                        const isSelected = p.id === currentProduct?.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => onSelectProduct(p)}
                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-[#E6321C] bg-[#FDF0EE] text-[#171717] shadow-xs'
                                : 'border-[#DDD3C5] bg-white text-[#6F6A63]'
                            }`}
                          >
                            <span className="text-xs font-heading font-extrabold uppercase line-clamp-1">
                              {p.title.replace('Heavyweight ', '')}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#E6321C] mt-1">
                              ₹{p.base_price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-2">
                      Atelier Color: <strong className="text-[#171717]">{selectedColor.name}</strong>
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {availableColors.map((color) => {
                        const isSelected = selectedColor.name === color.name;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => onSelectColor(color)}
                            className={`relative h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'ring-2 ring-[#E6321C] ring-offset-2 ring-offset-[#FAF8F5] scale-105'
                                : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {isSelected && (
                              <Check
                                size={14}
                                className={color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#faf6ee' ? 'text-black' : 'text-white'}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-2">
                      Fit Size: <strong className="text-[#171717]">{selectedSize} (Relaxed Drop-Shoulder)</strong>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => onSelectSize(size)}
                          className={`h-9 min-w-9 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                            selectedSize === size
                              ? 'border-[#171717] bg-[#171717] text-white shadow-xs'
                              : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ARTWORK TAB */}
              {activeTab === 'artwork' && (
                <div className="space-y-4">
                  {/* File Upload Trigger */}
                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-[#DDD3C5] bg-white text-xs font-sans font-bold text-[#171717] cursor-pointer hover:border-[#E6321C] hover:text-[#E6321C] transition-all">
                    <Upload size={16} />
                    <span>Upload Custom Image / Vector</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onUploadFile(file);
                          setActiveTab(null);
                        }
                      }}
                    />
                  </label>

                  {/* Studio Presets */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-2">
                      Studio Curated Graphics ({activeView.toUpperCase()})
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_ARTWORKS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onUpdateArtwork({ url: preset.dataUrl, scale: 1, rotation: 0, x: 0, y: 0 });
                            setActiveTab(null);
                          }}
                          className="flex flex-col items-center p-2 rounded-2xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] transition-all group"
                        >
                          <img
                            src={preset.dataUrl}
                            alt={preset.name}
                            className="h-16 w-16 object-contain drop-shadow-2xs group-hover:scale-105 transition-transform"
                          />
                          <span className="text-[10px] font-sans font-bold text-[#171717] mt-1.5 truncate max-w-full">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {artwork?.url && (
                    <button
                      type="button"
                      onClick={onRemoveArtwork}
                      className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-xs font-sans font-bold text-[#E6321C] hover:bg-red-100 transition-colors"
                    >
                      Remove Artwork from {activeView.toUpperCase()}
                    </button>
                  )}
                </div>
              )}

              {/* 3. TEXT TAB */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  {/* Custom Slogan Input */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-1.5">
                      Your Slogan or Typography
                    </span>
                    <input
                      type="text"
                      value={typography?.text || ''}
                      onChange={(e) => onUpdateTypography({ text: e.target.value })}
                      placeholder="e.g. TOKYO RUNNER / 1994"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-white text-xs font-sans text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#E6321C]"
                    />
                  </div>

                  {/* Streetwear Fonts */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-1.5">
                      Font Family
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => onUpdateTypography({ font: f.value })}
                          className={`px-3 py-2 rounded-xl border text-xs text-left transition-all ${
                            typography?.font === f.value
                              ? 'border-[#E6321C] bg-[#FDF0EE] text-[#171717] font-bold'
                              : 'border-[#DDD3C5] bg-white text-[#6F6A63]'
                          }`}
                          style={{ fontFamily: f.value }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6F6A63] block mb-1.5">
                      Color
                    </span>
                    <div className="flex gap-2">
                      {['#111111', '#FFFFFF', '#E6321C', '#D4C4A8', '#E8DCC8'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => onUpdateTypography({ color: c })}
                          className={`h-8 w-8 rounded-xl border transition-all ${
                            typography?.color === c
                              ? 'ring-2 ring-[#E6321C] ring-offset-2 scale-105'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {typography?.text && (
                    <button
                      type="button"
                      onClick={onRemoveTypography}
                      className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-xs font-sans font-bold text-[#E6321C] hover:bg-red-100 transition-colors"
                    >
                      Remove Typography from {activeView.toUpperCase()}
                    </button>
                  )}
                </div>
              )}

              {/* 4. SUMMARY & CHECKOUT TAB */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#DDD3C5] bg-white p-4 space-y-2">
                    <div className="flex justify-between text-xs font-sans text-[#6F6A63]">
                      <span>{currentProduct?.title} ({selectedSize})</span>
                      <span className="font-mono font-bold text-[#171717]">₹{basePrice}</span>
                    </div>
                    {isDualSided && (
                      <div className="flex justify-between text-xs font-sans text-[#E6321C]">
                        <span>Dual-Sided 300 DPI Print Fee</span>
                        <span className="font-mono font-bold">+₹{dualSidedFee}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#DDD3C5] flex justify-between text-sm font-sans font-bold text-[#171717]">
                      <span>Total Atelier Piece</span>
                      <span className="font-mono text-base font-extrabold text-[#E6321C]">₹{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart();
                      setActiveTab(null);
                    }}
                    disabled={isAddingToCart}
                    className="w-full py-3.5 rounded-2xl bg-[#E6321C] text-white font-heading font-extrabold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#E6321C]/25 hover:bg-[#C42815] transition-all disabled:opacity-50"
                  >
                    <ShoppingBag size={16} />
                    <span>{isAddingToCart ? 'ADDING TO BAG...' : `ADD TO BAG • ₹${totalPrice}`}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Docked Bottom Bar (Always Accessible) ─── */}
      <nav
        className="w-full bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#DDD3C5] shadow-[0_-4px_25px_rgba(23,23,23,0.08)] px-2 py-1.5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
        aria-label="Mobile Customizer Bar"
      >
        <div className="grid grid-cols-4 gap-1 items-center">
          {/* 1. Garment */}
          <button
            type="button"
            onClick={() => toggleTab('garment')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'garment'
                ? 'text-[#E6321C] bg-[#FDF0EE]'
                : 'text-[#6F6A63] hover:text-[#171717]'
            }`}
          >
            <div className="flex items-center gap-1">
              <Shirt size={17} />
              <div
                className="h-2 w-2 rounded-full border border-black/20"
                style={{ backgroundColor: selectedColor.hex }}
              />
            </div>
            <span className="text-[10px] font-heading uppercase font-bold tracking-wider mt-0.5">
              Garment
            </span>
          </button>

          {/* 2. Artwork */}
          <button
            type="button"
            onClick={() => toggleTab('artwork')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
              activeTab === 'artwork'
                ? 'text-[#E6321C] bg-[#FDF0EE]'
                : 'text-[#6F6A63] hover:text-[#171717]'
            }`}
          >
            <Sparkles size={17} />
            {artwork?.url && (
              <span className="absolute top-1 right-6 h-1.5 w-1.5 rounded-full bg-[#E6321C]" />
            )}
            <span className="text-[10px] font-heading uppercase font-bold tracking-wider mt-0.5">
              Artwork
            </span>
          </button>

          {/* 3. Text */}
          <button
            type="button"
            onClick={() => toggleTab('text')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
              activeTab === 'text'
                ? 'text-[#E6321C] bg-[#FDF0EE]'
                : 'text-[#6F6A63] hover:text-[#171717]'
            }`}
          >
            <Type size={17} />
            {typography?.text && (
              <span className="absolute top-1 right-6 h-1.5 w-1.5 rounded-full bg-[#E6321C]" />
            )}
            <span className="text-[10px] font-heading uppercase font-bold tracking-wider mt-0.5">
              Text
            </span>
          </button>

          {/* 4. Instant Add / Summary */}
          <button
            type="button"
            onClick={() => toggleTab('summary')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'summary'
                ? 'text-white bg-[#E6321C] shadow-xs'
                : 'text-white bg-[#171717] hover:bg-[#E6321C]'
            }`}
          >
            <div className="flex items-center gap-1">
              <ShoppingBag size={15} />
              <span className="text-[11px] font-mono font-bold">₹{totalPrice}</span>
            </div>
            <span className="text-[9px] font-heading uppercase font-extrabold tracking-wider mt-0.5">
              Review & Buy
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
