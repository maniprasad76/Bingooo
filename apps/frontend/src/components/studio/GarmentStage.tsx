import { useState, type CSSProperties, type ReactNode } from 'react';
import { ImageOff, RotateCcw } from 'lucide-react';
import type { PrintAreas, PrintSpot } from './printAreas';

export interface StageArtwork {
  previewUrl: string;
  scale: number;
  /** Nudge up/down, in 1/100 of the photo height. */
  offsetY: number;
}

interface GarmentStageProps {
  /** The admin-uploaded PNG for this colour and side ('' when not uploaded). */
  photoUrl: string;
  alt: string;
  side: 'FRONT' | 'BACK';
  printAreas: PrintAreas;
  /** Ink colour for contrast if needed. */
  inkColor?: string;
  front: StageArtwork | null;
  chest: StageArtwork | null;
  back: StageArtwork | null;
}

// A print box is slightly taller than wide, like a typical DTF transfer.
const PRINT_ASPECT = 16 / 17;

/**
 * The garment photo with the customer's prints placed on it. Only real photos
 * uploaded in the admin studio are shown — never a drawn stand-in. Prints are
 * positioned against the photo itself (not the frame), so they stay on the
 * chest whatever the PNG's shape or the screen size.
 */
export function GarmentStage({ photoUrl, alt, side, printAreas, front, chest, back }: GarmentStageProps) {
  // Load state per URL, so switching colour or side never shows a stale state.
  const [loaded, setLoaded] = useState<Record<string, { w: number; h: number }>>({});
  const [failed, setFailed] = useState<Record<string, true>>({});
  const [attempt, setAttempt] = useState(0);

  if (!photoUrl) {
    const isBack = side === 'BACK';
    return (
      <Notice
        title={isBack ? 'Back photo in preparation' : 'Garment photo in preparation'}
        body={
          isBack
            ? (back ? 'Your back design is saved and will be printed centred on the back.' : 'You can still add a back print; upload garment photo in Admin Studio to preview.')
            : 'Garment photograph will appear once uploaded in the Admin Studio.'
        }
        artwork={isBack ? back?.previewUrl : front?.previewUrl}
      />
    );
  }

  const src = attempt ? `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}retry=${attempt}` : photoUrl;
  const size = loaded[src];
  if (failed[src]) {
    return (
      <Notice title="Photo unavailable" body="We couldn't load this garment photo." icon>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#171717] bg-white text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717] hover:bg-[#EDE0CC]"
        >
          <RotateCcw size={12} /> Try again
        </button>
      </Notice>
    );
  }

  // The photo's own box inside the square frame (object-contain maths).
  const ratio = size ? size.w / size.h : 1;
  const box: CSSProperties = ratio >= 1
    ? { width: '100%', height: `${100 / ratio}%`, left: 0, top: `${(100 - 100 / ratio) / 2}%` }
    : { width: `${ratio * 100}%`, height: '100%', left: `${(100 - ratio * 100) / 2}%`, top: 0 };

  const place = (spot: PrintSpot, art: StageArtwork | null, square = false): CSSProperties => ({
    left: `${spot.x}%`,
    top: `${spot.y + (art?.offsetY || 0)}%`,
    width: `${spot.w * (art?.scale || 1)}%`,
    aspectRatio: square ? '1' : `${PRINT_ASPECT}`,
    transform: 'translate(-50%, -50%)',
  });

  return (
    <div className="absolute" style={box}>
      {!size && <div className="absolute inset-[8%] bg-white/15 animate-pulse" aria-hidden="true" />}
      <img
        key={src}
        src={src}
        alt={alt}
        decoding="async"
        onLoad={(e) => {
          const img = e.currentTarget;
          setLoaded((prev) => ({ ...prev, [src]: { w: img.naturalWidth || 1, h: img.naturalHeight || 1 } }));
        }}
        onError={() => setFailed((prev) => ({ ...prev, [src]: true }))}
        className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_24px_38px_rgba(0,0,0,0.45)] pointer-events-none transition-opacity duration-300 ${size ? 'opacity-100' : 'opacity-0'}`}
      />

      {size && side === 'FRONT' && (
        <>
          {front && (
            <div className="absolute z-20 pointer-events-none flex items-center justify-center text-center" style={place(printAreas.front, front)}>
              <img src={front.previewUrl} alt="Front design" className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
            </div>
          )}
          {chest && (
            <div className="absolute z-20 pointer-events-none flex items-center justify-center" style={place(printAreas.chest, chest, true)}>
              <img src={chest.previewUrl} alt="Left chest design" className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            </div>
          )}
        </>
      )}

      {size && side === 'BACK' && back && (
        <div className="absolute z-20 pointer-events-none flex items-center justify-center text-center" style={place(printAreas.back, back)}>
          <img src={back.previewUrl} alt="Back design" className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
        </div>
      )}
    </div>
  );
}

function Notice({ title, body, artwork, icon, children }: { title: string; body: string; artwork?: string; icon?: boolean; children?: ReactNode }) {
  return (
    <div className="absolute inset-[9%] bg-[#F7EEDB] border-[3px] border-[#171717] shadow-[6px_6px_0px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center text-center gap-2 px-6">
      {artwork ? (
        <div className="w-24 h-24 border-2 border-dashed border-[#171717]/40 bg-white flex items-center justify-center p-2">
          <img src={artwork} alt="Your back design" className="max-w-full max-h-full object-contain" />
        </div>
      ) : (
        icon && <ImageOff size={28} className="text-[#171717]/50" />
      )}
      <span className="mt-1 text-xs font-mono font-bold uppercase tracking-widest text-[#171717]">{title}</span>
      <span className="text-[11px] leading-relaxed text-[#171717]/65 max-w-[260px]">{body}</span>
      {children}
    </div>
  );
}
