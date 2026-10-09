import { useId } from 'react';

export interface GarmentSilhouetteProps {
  style?: 'tshirt' | 'polo' | 'hoodie';
  side?: 'FRONT' | 'BACK';
  colorHex?: string;
  className?: string;
}

/**
 * High-fidelity vector garment silhouette for custom apparel visualization.
 * Rendered whenever real photos haven't been uploaded yet, or as an instant
 * responsive fallback. Accurately simulates drape, seams, collars, and hems
 * in the chosen hex color.
 */
export function GarmentSilhouette({
  style = 'tshirt',
  side = 'FRONT',
  colorHex = '#171717',
  className = 'w-full h-full object-contain filter drop-shadow-[0_24px_38px_rgba(0,0,0,0.45)]',
}: GarmentSilhouetteProps) {
  const uid = useId().replace(/:/g, '');

  const clean = (colorHex || '#171717').replace('#', '');
  const r = parseInt(clean.substring(0, 2) || '17', 16);
  const g = parseInt(clean.substring(2, 4) || '17', 16);
  const b = parseInt(clean.substring(4, 6) || '17', 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  const isDark = luminance < 140;

  const seamColor = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.22)';

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${style} ${side.toLowerCase()} view silhouette`}
    >
      <defs>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? '0.12' : '0.28'} />
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity={isDark ? '0.35' : '0.12'} />
        </radialGradient>
        <linearGradient id={`side-shade-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity={isDark ? '0.3' : '0.1'} />
          <stop offset="15%" stopColor="#000000" stopOpacity="0" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity={isDark ? '0.3' : '0.1'} />
        </linearGradient>
        <linearGradient id={`collar-depth-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {style === 'tshirt' && (
        <g>
          <path
            d={
              side === 'FRONT'
                ? 'M 205 68 C 220 88 280 88 295 68 L 385 102 C 392 105 440 188 448 208 C 450 214 430 238 412 248 C 398 232 376 210 365 196 L 362 435 C 362 444 354 450 345 450 L 155 450 C 146 450 138 444 138 435 L 135 196 C 124 210 102 232 88 248 C 70 238 50 214 52 208 C 60 188 108 105 115 102 Z'
                : 'M 205 68 C 224 74 276 74 295 68 L 385 102 C 392 105 440 188 448 208 C 450 214 430 238 412 248 C 398 232 376 210 365 196 L 362 435 C 362 444 354 450 345 450 L 155 450 C 146 450 138 444 138 435 L 135 196 C 124 210 102 232 88 248 C 70 238 50 214 52 208 C 60 188 108 105 115 102 Z'
            }
            fill={colorHex}
            stroke={seamColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 135 196 L 155 450 L 345 450 L 365 196 Z" fill={`url(#side-shade-${uid})`} pointerEvents="none" />
          <path d="M 138 100 L 362 100 L 362 448 L 138 448 Z" fill={`url(#glow-${uid})`} pointerEvents="none" />
          <path d="M 175 80 L 148 160" stroke={seamColor} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M 325 80 L 352 160" stroke={seamColor} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M 374 204 L 420 238" stroke={seamColor} strokeWidth="1.2" />
          <path d="M 126 204 L 80 238" stroke={seamColor} strokeWidth="1.2" />
          <line x1="140" y1="438" x2="360" y2="438" stroke={seamColor} strokeWidth="1.2" />
          <line x1="140" y1="442" x2="360" y2="442" stroke={seamColor} strokeWidth="1.2" strokeDasharray="4 2" />
          {side === 'FRONT' ? (
            <g>
              <path d="M 205 68 C 220 58 280 58 295 68 C 280 88 220 88 205 68 Z" fill={`url(#collar-depth-${uid})`} />
              <path d="M 205 68 C 222 96 278 96 295 68 C 298 73 294 80 288 88 C 265 106 235 106 212 88 C 206 80 202 73 205 68 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 212 88 C 235 106 265 106 288 88" stroke={seamColor} strokeWidth="1.2" strokeDasharray="2 2" />
            </g>
          ) : (
            <g>
              <path d="M 205 68 C 224 74 276 74 295 68 C 292 78 285 82 278 84 C 255 88 245 88 222 84 C 215 82 208 78 205 68 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 220 90 C 235 98 265 98 280 90" stroke={seamColor} strokeWidth="1" strokeDasharray="2 2" />
            </g>
          )}
        </g>
      )}

      {style === 'polo' && (
        <g>
          <path
            d="M 208 72 L 292 72 L 378 100 C 386 104 430 175 438 196 C 440 202 422 222 405 230 C 392 216 372 196 362 184 L 358 438 C 358 444 350 448 342 448 L 158 448 C 150 448 142 444 142 438 L 138 184 C 128 196 108 216 95 230 C 78 222 60 202 62 196 C 70 175 114 104 122 100 Z"
            fill={colorHex}
            stroke={seamColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 138 184 L 158 448 L 342 448 L 358 184 Z" fill={`url(#side-shade-${uid})`} pointerEvents="none" />
          <path d="M 140 100 L 360 100 L 360 448 L 140 448 Z" fill={`url(#glow-${uid})`} pointerEvents="none" />
          <path d="M 368 192 L 412 222" stroke={seamColor} strokeWidth="2.5" />
          <path d="M 132 192 L 88 222" stroke={seamColor} strokeWidth="2.5" />
          <line x1="142" y1="422" x2="142" y2="448" stroke={seamColor} strokeWidth="2" />
          <line x1="358" y1="422" x2="358" y2="448" stroke={seamColor} strokeWidth="2" />
          <line x1="144" y1="442" x2="356" y2="442" stroke={seamColor} strokeWidth="1.2" />

          {side === 'FRONT' ? (
            <g>
              <rect x="238" y="90" width="24" height="82" rx="2" fill={colorHex} stroke={seamColor} strokeWidth="1.4" />
              <line x1="250" y1="90" x2="250" y2="168" stroke={seamColor} strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="250" cy="112" r="3.5" fill="#FFFFFF" stroke="#888888" strokeWidth="0.8" />
              <circle cx="250" cy="144" r="3.5" fill="#FFFFFF" stroke="#888888" strokeWidth="0.8" />
              <path d="M 240 76 L 198 120 C 196 122 202 125 210 120 L 244 94 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 260 76 L 302 120 C 304 122 298 125 290 120 L 256 94 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 206 74 C 225 66 275 66 294 74" stroke={seamColor} strokeWidth="1.5" fill="none" />
            </g>
          ) : (
            <g>
              <path d="M 200 70 C 224 82 276 82 300 70 C 308 86 288 94 250 94 C 212 94 192 86 200 70 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <line x1="175" y1="110" x2="325" y2="110" stroke={seamColor} strokeWidth="1.2" strokeDasharray="3 2" />
            </g>
          )}
        </g>
      )}

      {style === 'hoodie' && (
        <g>
          <path
            d="M 195 90 C 220 110 280 110 305 90 L 398 120 C 408 124 445 220 452 245 C 454 252 432 270 415 278 C 400 258 376 226 365 208 L 362 438 C 362 446 354 450 344 450 L 156 450 C 146 450 138 446 138 438 L 135 208 C 124 226 100 258 85 278 C 68 270 46 252 48 245 C 55 220 92 124 102 120 Z"
            fill={colorHex}
            stroke={seamColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 135 208 L 156 450 L 344 450 L 365 208 Z" fill={`url(#side-shade-${uid})`} pointerEvents="none" />
          <path d="M 140 110 L 360 110 L 360 448 L 140 448 Z" fill={`url(#glow-${uid})`} pointerEvents="none" />
          <path d="M 374 216 L 424 266" stroke={seamColor} strokeWidth="3" />
          <path d="M 126 216 L 76 266" stroke={seamColor} strokeWidth="3" />
          <rect x="146" y="418" width="208" height="32" fill={colorHex} stroke={seamColor} strokeWidth="1.4" />
          <line x1="146" y1="418" x2="354" y2="418" stroke={seamColor} strokeWidth="1.5" />
          <line x1="146" y1="426" x2="354" y2="426" stroke={seamColor} strokeWidth="0.8" strokeDasharray="3 3" />

          {side === 'FRONT' ? (
            <g>
              <path d="M 172 320 L 328 320 L 344 414 L 156 414 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 172 320 L 156 414" stroke={seamColor} strokeWidth="2.5" />
              <path d="M 328 320 L 344 414" stroke={seamColor} strokeWidth="2.5" />
              <line x1="174" y1="324" x2="326" y2="324" stroke={seamColor} strokeWidth="1" strokeDasharray="3 2" />
              <g stroke={isDark ? '#E5E5E5' : '#444444'} strokeWidth="2.2" strokeLinecap="round">
                <path d="M 226 122 C 224 165 220 185 224 212" fill="none" />
                <rect x="222" y="212" width="4" height="10" rx="1" fill="#C0C0C0" stroke="#777777" strokeWidth="0.5" />
                <path d="M 274 122 C 276 165 280 185 276 212" fill="none" />
                <rect x="274" y="212" width="4" height="10" rx="1" fill="#C0C0C0" stroke="#777777" strokeWidth="0.5" />
              </g>
              <path d="M 188 85 C 195 48 305 48 312 85 C 290 125 210 125 188 85 Z" fill={`url(#collar-depth-${uid})`} />
              <path d="M 185 85 C 195 46 250 46 256 82 C 250 115 198 120 185 85 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 315 85 C 305 46 250 46 244 82 C 250 115 302 120 315 85 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.5" />
              <path d="M 218 116 C 250 126 282 116 282 116" stroke={seamColor} strokeWidth="1.2" fill="none" />
            </g>
          ) : (
            <g>
              <path d="M 185 70 C 205 38 295 38 315 70 C 325 110 320 160 250 166 C 180 160 175 110 185 70 Z" fill={colorHex} stroke={seamColor} strokeWidth="1.6" />
              <path d="M 250 44 L 250 164" stroke={seamColor} strokeWidth="1.2" strokeDasharray="3 2" />
              <path d="M 205 110 C 230 145 270 145 295 110" stroke={seamColor} strokeWidth="1.2" fill="none" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
