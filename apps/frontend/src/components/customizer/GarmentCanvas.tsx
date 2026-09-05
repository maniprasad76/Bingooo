import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  X,
  Move,
  Scan,
} from 'lucide-react';

export interface ArtworkLayer {
  url: string | null;
  scale: number;
  rotation: number;
  x: number;
  y: number;
  opacity?: number;
}

export interface TypographyLayer {
  text: string;
  font: string;
  color: string;
  size: number;
  isBold: boolean;
  isItalic: boolean;
  isUppercase: boolean;
  textAlign: 'left' | 'center' | 'right';
  x: number;
  y: number;
}

interface GarmentCanvasProps {
  productType?: 'tee' | 'hoodie';
  garmentColorHex: string;
  garmentColorName: string;
  view: 'front' | 'back';
  onToggleView: (view: 'front' | 'back') => void;
  artwork: ArtworkLayer | null;
  onUpdateArtwork: (updates: Partial<ArtworkLayer>) => void;
  onRemoveArtwork: () => void;
  typography: TypographyLayer | null;
  onUpdateTypography: (updates: Partial<TypographyLayer>) => void;
  onRemoveTypography: () => void;
  selectedLayer: 'artwork' | 'text' | null;
  onSelectLayer: (layer: 'artwork' | 'text' | null) => void;
  showSafeZone: boolean;
  onToggleSafeZone: () => void;
  zoomLevel: number;
  onToggleZoom: () => void;
  onResetPosition: () => void;
  onSnapPosition: (position: 'center' | 'pocket' | 'upper') => void;
}

export function GarmentCanvas({
  productType = 'tee',
  garmentColorHex,
  garmentColorName,
  view,
  onToggleView,
  artwork,
  onUpdateArtwork,
  onRemoveArtwork,
  typography,
  onUpdateTypography,
  onRemoveTypography,
  selectedLayer,
  onSelectLayer,
  showSafeZone,
  onToggleSafeZone,
  zoomLevel,
  onToggleZoom,
  onResetPosition,
  onSnapPosition,
}: GarmentCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const hasLayers = Boolean(artwork?.url || typography?.text.trim());
  const isLightColor = ['#FFFFFF', '#FAF6EE', '#D4C4A8', '#E8DCC8', '#F7EEDB'].includes(
    garmentColorHex.toUpperCase()
  ) || garmentColorName.toLowerCase().includes('cream') || garmentColorName.toLowerCase().includes('sand') || garmentColorName.toLowerCase().includes('white');

  // Photorealistic Garment Image selection based on selected color & product
  const getGarmentImage = () => {
    const nameLower = garmentColorName.toLowerCase();
    if (productType === 'hoodie') {
      return '/custom/tshirt-step-2.png';
    }
    if (nameLower.includes('black') || nameLower.includes('charcoal') || garmentColorHex === '#111111' || garmentColorHex === '#333333') {
      return '/custom/tshirt-step-3-black.png';
    }
    if (nameLower.includes('sand') || nameLower.includes('beige')) {
      return '/custom/tshirt-step-1-beige.png';
    }
    return '/custom/tshirt-step-1.png';
  };

  const garmentImageSrc = getGarmentImage();

  return (
    <div className="relative w-full rounded-3xl border border-[#DDD3C5] bg-[#FAF8F5] p-4 sm:p-7 flex flex-col items-center justify-between select-none shadow-sm overflow-hidden">
      {/* Subtle Studio Backdrop Ambient Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(255,255,255,0.9)_0%,_rgba(247,238,219,0.35)_60%,_rgba(237,224,204,0.5)_100%)] pointer-events-none" />

      {/* ─── Top Studio Navigation Bar ─── */}
      <div className="w-full flex items-center justify-between gap-3 pb-3 border-b border-[#DDD3C5]/70 relative z-20">
        {/* Floating Perspective Toggle Pill */}
        <div className="flex items-center rounded-2xl bg-white/90 backdrop-blur-md border border-[#DDD3C5] p-1 shadow-xs">
          <button
            type="button"
            onClick={() => onToggleView('front')}
            className={`relative px-4 sm:px-5 py-1.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all ${
              view === 'front' ? 'text-white' : 'text-[#171717] hover:text-[#E6321C]'
            }`}
          >
            {view === 'front' && (
              <motion.div
                layoutId="canvasPerspectivePill"
                className="absolute inset-0 bg-[#171717] rounded-xl -z-0 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>FRONT</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onToggleView('back')}
            className={`relative px-4 sm:px-5 py-1.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all ${
              view === 'back' ? 'text-white' : 'text-[#171717] hover:text-[#E6321C]'
            }`}
          >
            {view === 'back' && (
              <motion.div
                layoutId="canvasPerspectivePill"
                className="absolute inset-0 bg-[#171717] rounded-xl -z-0 shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>BACK</span>
            </span>
          </button>
        </div>

        {/* 240 GSM Fabric Spec Tag & Canvas Controls */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#DDD3C5] text-[11px] font-mono font-bold text-[#171717]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E6321C]" />
            240 GSM HEAVYWEIGHT
          </span>

          <button
            type="button"
            onClick={onToggleSafeZone}
            title={showSafeZone ? 'Hide print boundary' : 'Show print boundary'}
            className={`h-8 px-2.5 rounded-xl border text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors ${
              showSafeZone
                ? 'border-[#E6321C] bg-[#FDF0EE] text-[#E6321C]'
                : 'border-[#DDD3C5] bg-white text-[#6F6A63] hover:text-[#171717]'
            }`}
          >
            <Scan size={14} />
            <span className="hidden md:inline">Guides</span>
          </button>

          <button
            type="button"
            onClick={onToggleZoom}
            title={zoomLevel > 1 ? 'Reset zoom' : 'Zoom view'}
            className="h-8 w-8 rounded-xl border border-[#DDD3C5] bg-white text-[#6F6A63] hover:text-[#171717] flex items-center justify-center transition-colors"
          >
            {zoomLevel > 1 ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
          </button>
        </div>
      </div>

      {/* ─── Main Garment Showcase Stage ─── */}
      <div className="relative w-full max-w-[480px] aspect-[4/5] flex items-center justify-center my-3 sm:my-5 z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: zoomLevel,
            rotateY: view === 'back' ? 180 : 0,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 240, damping: 24 }
          }
          className="relative w-full h-full flex items-center justify-center transform-gpu"
        >
          {/* Photorealistic Apparel Mockup Image with realistic fabric drop shadow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={garmentImageSrc}
              alt={`${garmentColorName} 240 GSM Garment Mockup`}
              className="w-full h-full max-h-[520px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.14)] select-none transition-all duration-300"
            />

            {/* Back Neck Inner Seam Styling (when in back view) */}
            {view === 'back' && (
              <div className="absolute top-[16%] inset-x-0 mx-auto w-16 h-5 rounded-b-full border-b border-black/30 bg-black/10 flex items-center justify-center">
                <span className="text-[7px] font-mono uppercase font-bold text-white/70 tracking-widest">
                  240 GSM
                </span>
              </div>
            )}
          </div>

          {/* ─── Active Print Area & Direct Drag Zone ─── */}
          {/* Note: rotateY(180deg) is applied to back view container so user graphic/text is never flipped backwards */}
          <div
            ref={printAreaRef}
            style={{ transform: view === 'back' ? 'rotateY(180deg)' : undefined }}
            className={`relative z-20 w-[210px] sm:w-[240px] h-[250px] sm:h-[280px] -translate-y-2 flex flex-col items-center justify-center transition-all ${
              showSafeZone
                ? 'border border-dashed border-[#171717]/35 rounded-2xl bg-black/[0.01]'
                : 'border border-transparent'
            }`}
          >
            {/* Fashion Viewfinder Corner Crop Marks (Atelier style) */}
            {showSafeZone && (
              <>
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E6321C] rounded-tl" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E6321C] rounded-tr" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E6321C] rounded-bl" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E6321C] rounded-br" />

                {/* Print area specification label */}
                <div className="absolute top-1.5 left-2 flex items-center gap-1 text-[8px] font-mono font-bold uppercase tracking-wider text-[#171717]/70 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                  <span>300 DPI DTG • {view.toUpperCase()}</span>
                </div>
              </>
            )}

            {/* Empty Canvas Callout */}
            {!hasLayers && (
              <div className="flex flex-col items-center justify-center text-center p-4 pointer-events-none opacity-40">
                <Sparkles size={26} className="mb-1.5 text-[#171717] stroke-[1.8]" />
                <span className="text-[11px] font-sans font-extrabold uppercase tracking-wider text-[#171717]">
                  {view.toUpperCase()} PRINT ZONE
                </span>
                <span className="text-[10px] font-sans text-[#171717] mt-0.5">
                  Drag & position artwork here
                </span>
              </div>
            )}

            {/* ─── Draggable Artwork Layer ─── */}
            {artwork?.url && (
              <motion.div
                drag
                dragConstraints={printAreaRef}
                dragElastic={0.08}
                dragMomentum={false}
                onDrag={(_, info) => {
                  onUpdateArtwork({
                    x: (artwork.x || 0) + info.delta.x,
                    y: (artwork.y || 0) + info.delta.y,
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer('artwork');
                }}
                style={{
                  x: artwork.x || 0,
                  y: artwork.y || 0,
                  scale: artwork.scale || 1,
                  rotate: artwork.rotation || 0,
                  opacity: artwork.opacity ?? 1,
                  mixBlendMode: isLightColor ? 'multiply' : 'normal',
                }}
                whileDrag={{ scale: (artwork.scale || 1) * 1.05, cursor: 'grabbing' }}
                className={`absolute cursor-grab p-1 touch-none ${
                  selectedLayer === 'artwork'
                    ? 'ring-2 ring-[#E6321C] ring-offset-2 ring-offset-transparent rounded-xl'
                    : 'hover:ring-1 hover:ring-black/40 rounded-xl'
                }`}
              >
                {/* Active Selection Toolbar */}
                {selectedLayer === 'artwork' && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#171717] text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono shadow-md z-30 whitespace-nowrap pointer-events-auto">
                    <Move size={9} className="text-[#E6321C]" />
                    <span>Drag</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveArtwork();
                      }}
                      className="ml-1 text-white/70 hover:text-white"
                      title="Remove artwork"
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}

                <img
                  src={artwork.url}
                  alt="Custom artwork layer"
                  draggable={false}
                  className="max-h-36 max-w-[150px] object-contain drop-shadow-sm select-none pointer-events-none"
                />
              </motion.div>
            )}

            {/* ─── Draggable Typography Layer ─── */}
            {typography?.text.trim() && (
              <motion.div
                drag
                dragConstraints={printAreaRef}
                dragElastic={0.08}
                dragMomentum={false}
                onDrag={(_, info) => {
                  onUpdateTypography({
                    x: (typography.x || 0) + info.delta.x,
                    y: (typography.y || 0) + info.delta.y,
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer('text');
                }}
                style={{
                  x: typography.x || 0,
                  y: typography.y || 0,
                }}
                whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
                className={`absolute cursor-grab p-1 touch-none max-w-[200px] break-words ${
                  selectedLayer === 'text'
                    ? 'ring-2 ring-[#E6321C] ring-offset-2 ring-offset-transparent rounded-lg'
                    : 'hover:ring-1 hover:ring-black/30 rounded-lg'
                }`}
              >
                {/* Active Selection Toolbar */}
                {selectedLayer === 'text' && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#171717] text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono shadow-md z-30 whitespace-nowrap pointer-events-auto">
                    <Move size={9} className="text-[#E6321C]" />
                    <span>Drag</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTypography();
                      }}
                      className="ml-1 text-white/70 hover:text-white"
                      title="Remove text"
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}

                <p
                  style={{
                    fontFamily: typography.font,
                    color: typography.color,
                    fontSize: `${typography.size}px`,
                    textAlign: typography.textAlign,
                    fontWeight: typography.isBold ? 700 : 400,
                    fontStyle: typography.isItalic ? 'italic' : 'normal',
                    textTransform: typography.isUppercase ? 'uppercase' : 'none',
                    lineHeight: 1.15,
                  }}
                  className="select-none pointer-events-none drop-shadow-sm"
                >
                  {typography.text}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Bottom Canvas Quick Dock ─── */}
      <div className="w-full flex items-center justify-between gap-2 pt-3 border-t border-[#DDD3C5]/70 relative z-20">
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border border-black/20 shadow-2xs"
            style={{ backgroundColor: garmentColorHex }}
          />
          <span className="font-sans font-bold text-xs text-[#171717]">
            {garmentColorName}
          </span>
        </div>

        {/* Quick Snapping Shortcuts */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSnapPosition('center')}
            className="px-2.5 py-1 rounded-lg border border-[#DDD3C5] bg-white text-[11px] font-sans font-semibold text-[#171717] hover:border-[#171717] transition-colors"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => onSnapPosition('pocket')}
            className="px-2.5 py-1 rounded-lg border border-[#DDD3C5] bg-white text-[11px] font-sans font-semibold text-[#171717] hover:border-[#171717] transition-colors"
          >
            Pocket
          </button>
          <button
            type="button"
            onClick={onResetPosition}
            disabled={!hasLayers}
            title="Reset position"
            className="p-1 rounded-lg border border-[#DDD3C5] bg-white text-[#6F6A63] hover:text-[#171717] disabled:opacity-40 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
