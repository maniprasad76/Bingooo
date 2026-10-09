import { useState, type CSSProperties } from 'react';
import { ImageOff } from 'lucide-react';

/** Centre point and width of a print, as percentages of the garment photo. */
export interface PrintSpot {
  x: number;
  y: number;
  w: number;
}

export interface PrintAreas {
  front: PrintSpot;
  chest: PrintSpot;
  back: PrintSpot;
}

export type GarmentStyle = 'tshirt' | 'polo' | 'hoodie';

/**
 * Must match DEFAULT_PRINT_AREAS in the backend (customizations/studio-config.ts)
 * and the storefront (components/studio/GarmentStage.tsx).
 */
export const DEFAULT_PRINT_AREAS: Record<GarmentStyle, PrintAreas> = {
  tshirt: { front: { x: 50, y: 38, w: 35 }, chest: { x: 66, y: 36, w: 13 }, back: { x: 50, y: 40, w: 37 } },
  polo: { front: { x: 50, y: 40, w: 33 }, chest: { x: 66, y: 36, w: 12 }, back: { x: 50, y: 40, w: 37 } },
  hoodie: { front: { x: 50, y: 42, w: 30 }, chest: { x: 66, y: 38, w: 12 }, back: { x: 50, y: 44, w: 33 } },
};

export const printAreasFor = (style: GarmentStyle, saved?: PrintAreas | null): PrintAreas =>
  saved || DEFAULT_PRINT_AREAS[style] || DEFAULT_PRINT_AREAS.tshirt;

/** Checkerboard behind photos, so a transparent background is visible. */
export const CHECKERBOARD: CSSProperties = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'linear-gradient(45deg, #e8e1d4 25%, transparent 25%), linear-gradient(-45deg, #e8e1d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e1d4 75%), linear-gradient(-45deg, transparent 75%, #e8e1d4 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
};

// Same print box shape as the storefront.
const PRINT_ASPECT = 16 / 17;

interface PrintAreaPreviewProps {
  photoUrl: string;
  side: 'FRONT' | 'BACK';
  areas: PrintAreas;
  /** Spot currently being adjusted; drawn highlighted. */
  focus?: keyof PrintAreas | null;
}

/**
 * The garment photo with the print areas customers' designs will fill,
 * laid out exactly as on the storefront's custom page.
 */
export function PrintAreaPreview({ photoUrl, side, areas, focus }: PrintAreaPreviewProps) {
  const [size, setSize] = useState<{ url: string; w: number; h: number } | null>(null);
  const [failedUrl, setFailedUrl] = useState('');

  if (!photoUrl || failedUrl === photoUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 bg-white border-2 border-dashed border-[#171717]/40">
        <ImageOff size={28} className="text-[#171717]/45" />
        <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#171717]">
          {failedUrl === photoUrl && photoUrl ? 'Photo could not be loaded' : `No ${side.toLowerCase()} photo yet`}
        </span>
        <span className="text-[11px] text-[#6F6A63] max-w-[240px]">
          {side === 'FRONT'
            ? 'Customers only see this colour once it has a front photo.'
            : 'Customers see a “back photo coming soon” note until you add one.'}
        </span>
      </div>
    );
  }

  const known = size?.url === photoUrl ? size : null;
  const ratio = known ? known.w / known.h : 1;
  const box: CSSProperties = ratio >= 1
    ? { width: '100%', height: `${100 / ratio}%`, left: 0, top: `${(100 - 100 / ratio) / 2}%` }
    : { width: `${ratio * 100}%`, height: '100%', left: `${(100 - ratio * 100) / 2}%`, top: 0 };

  const spots: { key: keyof PrintAreas; label: string; square?: boolean }[] =
    side === 'FRONT' ? [{ key: 'front', label: 'Front print' }, { key: 'chest', label: 'Left chest', square: true }] : [{ key: 'back', label: 'Back print' }];

  return (
    <div className="absolute inset-0" style={CHECKERBOARD}>
      <div className="absolute" style={box}>
        <img
          key={photoUrl}
          src={photoUrl}
          alt=""
          onLoad={(e) => setSize({ url: photoUrl, w: e.currentTarget.naturalWidth || 1, h: e.currentTarget.naturalHeight || 1 })}
          onError={() => setFailedUrl(photoUrl)}
          className="absolute inset-0 w-full h-full object-contain"
        />
        {known &&
          spots.map(({ key, label, square }) => {
            const spot = areas[key];
            const active = !focus || focus === key;
            return (
              <div
                key={key}
                className={`absolute flex items-start justify-start border-2 border-dashed transition-opacity ${active ? 'border-[#E6321C] bg-[#E6321C]/10' : 'border-[#171717]/50 opacity-60'}`}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: `${spot.w}%`,
                  aspectRatio: square ? '1' : `${PRINT_ASPECT}`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span className={`m-0.5 px-1 py-px text-[8px] font-mono font-black uppercase tracking-wider text-white whitespace-nowrap ${active ? 'bg-[#E6321C]' : 'bg-[#171717]/70'}`}>
                  {label}
                </span>
              </div>
            );
          })}
      </div>
      {known && (
        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-[#171717] text-white text-[9px] font-mono font-bold">
          {known.w}×{known.h}px
        </span>
      )}
    </div>
  );
}

export interface PhotoCheck {
  /** Reason the file can't be used (upload is stopped). */
  error?: string;
  /** Problems that make it look worse on the storefront (upload continues). */
  warnings: string[];
}

/**
 * Checks a garment photo before upload: PNG/WebP, a transparent background
 * (the storefront shows garments on its own coloured backdrop), big enough
 * to stay sharp, and roughly square so front and back line up.
 */
export async function checkGarmentPhoto(file: File): Promise<PhotoCheck> {
  const isPngOrWebp =
    file.type === 'image/png' ||
    file.type === 'image/webp' ||
    file.type === 'image/x-png' ||
    file.name.toLowerCase().endsWith('.png') ||
    file.name.toLowerCase().endsWith('.webp');

  if (!isPngOrWebp) {
    return {
      error: 'Please upload a transparent .png or .webp file so the garment renders cleanly on the storefront backdrop.',
      warnings: [],
    };
  }
  const warnings: string[] = [];
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    if (Math.max(width, height) < 800) {
      warnings.push(`Resolution is ${width}×${height}px — recommend 1200px or higher for high-res screens.`);
    }
    bitmap.close();
  } catch {
    // Unreadable bitmap here; server validates upload.
  }
  return { warnings };
}
