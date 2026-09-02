import React from 'react';

export type GarmentType = 'tshirt' | 'hoodie' | 'jacket' | 'tote';
export type GarmentView = 'front' | 'back';
export type PrintFinish = 'dtg' | 'puff' | 'embroidery' | 'distressed';

export interface GarmentMockupProps {
  type?: GarmentType;
  view?: GarmentView;
  colorHex?: string;
  finish?: PrintFinish;
  className?: string;
  children?: React.ReactNode;
  showPrintBoundary?: boolean;
}

export function GarmentMockup({
  type = 'tshirt',
  view = 'front',
  colorHex = '#121318',
  finish = 'dtg',
  className = '',
  children,
  showPrintBoundary = false,
}: GarmentMockupProps) {
  const isLight = isColorLight(colorHex);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Garment SVG Vector Silhouette & Shading */}
      <svg
        viewBox="0 0 500 560"
        className="w-full h-full filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition-all duration-500 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dynamic Light Gradient for realistic cloth volume */}
          <radialGradient id="fabricLight" cx="45%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLight ? '0.25' : '0.12'} />
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity={isLight ? '0.15' : '0.4'} />
          </radialGradient>

          {/* Crease & Fold Shadow */}
          <linearGradient id="foldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Heather / Canvas Grain Texture */}
          <pattern id="clothTexture" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 0 3 L 6 3 M 3 0 L 3 6" stroke={isLight ? '#000' : '#FFF'} strokeWidth="0.5" strokeOpacity="0.04" />
          </pattern>
        </defs>

        {/* ─── T-SHIRT (Oversized Drop-Shoulder 220 GSM) ─── */}
        {type === 'tshirt' && (
          <g>
            {/* Main Body Path */}
            <path
              d="M 170 85 
                 C 210 100, 290 100, 330 85 
                 L 435 145 
                 C 455 160, 430 225, 385 205 
                 L 370 200 
                 L 375 490 
                 C 375 505, 125 505, 125 490 
                 L 130 200 
                 L 115 205 
                 C 70 225, 45 160, 65 145 
                 Z"
              fill={colorHex}
              stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'}
              strokeWidth="2"
            />

            {/* Fabric Volume & Lighting Overlay */}
            <path
              d="M 170 85 C 210 100, 290 100, 330 85 L 435 145 C 455 160, 430 225, 385 205 L 370 200 L 375 490 C 375 505, 125 505, 125 490 L 130 200 L 115 205 C 70 225, 45 160, 65 145 Z"
              fill="url(#fabricLight)"
            />
            <path
              d="M 170 85 C 210 100, 290 100, 330 85 L 435 145 C 455 160, 430 225, 385 205 L 370 200 L 375 490 C 375 505, 125 505, 125 490 L 130 200 L 115 205 C 70 225, 45 160, 65 145 Z"
              fill="url(#clothTexture)"
            />

            {/* Sleeve Seam Details */}
            <path d="M 370 200 C 360 170, 345 125, 330 85" stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
            <path d="M 130 200 C 140 170, 155 125, 170 85" stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

            {/* Collar Ribbing (Front vs Back) */}
            {view === 'front' ? (
              <g>
                <path
                  d="M 170 85 C 210 120, 290 120, 330 85 C 290 100, 210 100, 170 85 Z"
                  fill={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.35)'}
                  stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="1.5"
                />
                {/* Woven inner neck label glimpse */}
                <rect x="235" y="88" width="30" height="12" rx="2" fill="#FE260A" opacity="0.85" />
              </g>
            ) : (
              <path
                d="M 170 85 C 210 92, 290 92, 330 85 C 290 80, 210 80, 170 85 Z"
                fill={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.3)'}
                stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.5"
              />
            )}

            {/* Bottom Hem & Subtle Folds */}
            <path d="M 128 480 C 250 488, 372 480, 372 480" stroke={isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'} strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
            <path d="M 135 340 Q 180 370 200 420" stroke="url(#foldShadow)" strokeWidth="8" fill="none" opacity="0.5" />
            <path d="M 365 310 Q 320 350 300 410" stroke="url(#foldShadow)" strokeWidth="8" fill="none" opacity="0.5" />
          </g>
        )}

        {/* ─── HOODIE (Heavy French Terry 450 GSM) ─── */}
        {type === 'hoodie' && (
          <g>
            {/* Main Body & Cuffs */}
            <path
              d="M 160 100 
                 C 210 115, 290 115, 340 100 
                 L 445 160 
                 C 470 185, 435 255, 390 230 
                 L 375 220 
                 L 380 500 
                 C 380 515, 120 515, 120 500 
                 L 125 220 
                 L 110 230 
                 C 65 255, 30 185, 55 160 
                 Z"
              fill={colorHex}
              stroke={isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)'}
              strokeWidth="2"
            />
            <path
              d="M 160 100 C 210 115, 290 115, 340 100 L 445 160 C 470 185, 435 255, 390 230 L 375 220 L 380 500 C 380 515, 120 515, 120 500 L 125 220 L 110 230 C 65 255, 30 185, 55 160 Z"
              fill="url(#fabricLight)"
            />

            {/* Hood Silhouette */}
            {view === 'front' ? (
              <g>
                <path
                  d="M 160 100 C 150 25, 350 25, 340 100 C 310 135, 190 135, 160 100 Z"
                  fill={colorHex}
                  stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth="2"
                />
                <path d="M 190 70 C 250 110, 250 110, 310 70" fill={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'} />
                
                {/* Drawstrings with metal aglets */}
                <path d="M 225 105 Q 220 160 222 180" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
                <rect x="220" y="180" width="4" height="10" rx="1" fill="#D4AF37" />
                <path d="M 275 105 Q 280 155 278 180" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
                <rect x="276" y="180" width="4" height="10" rx="1" fill="#D4AF37" />

                {/* Kangaroo Pocket */}
                <path
                  d="M 170 360 L 330 360 L 350 450 L 150 450 Z"
                  fill={colorHex}
                  stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'}
                  strokeWidth="1.5"
                />
                <path d="M 170 360 L 150 450" stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M 330 360 L 350 450" stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeDasharray="3 2" />
              </g>
            ) : (
              <g>
                <path
                  d="M 160 100 C 140 20, 360 20, 340 100 C 330 180, 170 180, 160 100 Z"
                  fill={colorHex}
                  stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth="2"
                />
                <path d="M 250 30 L 250 170" stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'} strokeWidth="2" fill="none" />
              </g>
            )}

            {/* Ribbed Bottom Band */}
            <rect x="120" y="475" width="260" height="25" fill={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.25)'} stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'} rx="2" />
          </g>
        )}

        {/* ─── VARSITY JACKET ─── */}
        {type === 'jacket' && (
          <g>
            <path
              d="M 170 85 L 330 85 L 435 145 C 455 160, 430 225, 385 205 L 370 200 L 375 490 C 375 505, 125 505, 125 490 L 130 200 L 115 205 C 70 225, 45 160, 65 145 Z"
              fill={colorHex}
              stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'}
              strokeWidth="2"
            />
            {/* Contrast Leather Sleeves */}
            <path d="M 330 85 L 435 145 C 455 160, 430 225, 385 205 L 370 200 Z" fill={isLight ? '#E8E3DC' : '#FAF8F5'} opacity="0.9" />
            <path d="M 170 85 L 65 145 C 45 160, 70 225, 115 205 L 130 200 Z" fill={isLight ? '#E8E3DC' : '#FAF8F5'} opacity="0.9" />

            {/* Striped Rib Collar */}
            <path d="M 170 85 C 210 110, 290 110, 330 85" stroke="#FE260A" strokeWidth="8" fill="none" />
            <path d="M 170 85 C 210 110, 290 110, 330 85" stroke="#FFF" strokeWidth="2" fill="none" />

            {/* Center Snap Button Placket */}
            <line x1="250" y1="95" x2="250" y2="480" stroke={isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {[140, 200, 260, 320, 380, 440].map((y) => (
              <circle key={y} cx="250" cy={y} r="5" fill="#E5D4B3" stroke="#998055" strokeWidth="1" />
            ))}
          </g>
        )}

        {/* ─── CANVAS TOTE BAG ─── */}
        {type === 'tote' && (
          <g>
            {/* Handles */}
            <path d="M 190 200 C 190 60, 310 60, 310 200" stroke={colorHex} strokeWidth="24" fill="none" strokeLinecap="round" />
            <path d="M 190 200 C 190 60, 310 60, 310 200" stroke="url(#fabricLight)" strokeWidth="24" fill="none" strokeLinecap="round" />

            {/* Main Bag Canvas */}
            <rect x="130" y="180" width="240" height="320" rx="8" fill={colorHex} stroke={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'} strokeWidth="2" />
            <rect x="130" y="180" width="240" height="320" rx="8" fill="url(#fabricLight)" />
            <rect x="130" y="180" width="240" height="320" rx="8" fill="url(#clothTexture)" />

            {/* Handle Box Stitch Reinforcements */}
            <rect x="180" y="185" width="20" height="28" fill="none" stroke={isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'} strokeWidth="1" strokeDasharray="3 1" />
            <rect x="300" y="185" width="20" height="28" fill="none" stroke={isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'} strokeWidth="1" strokeDasharray="3 1" />
          </g>
        )}
      </svg>

      {/* ─── Print Zone Placement Layer (Overlay for children/graphics) ─── */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
          type === 'hoodie' && view === 'front' ? 'pt-8' : type === 'tote' ? 'pt-20' : 'pt-4'
        }`}
      >
        <div
          className={`relative pointer-events-auto transition-all duration-300 ${
            type === 'tote'
              ? 'w-[45%] h-[50%]'
              : 'w-[48%] h-[54%]'
          } ${
            showPrintBoundary
              ? 'border-2 border-dashed border-brand-red/80 bg-brand-red/5 rounded-lg'
              : ''
          } ${
            finish === 'puff'
              ? 'texture-puff'
              : finish === 'embroidery'
              ? 'texture-embroidery'
              : finish === 'distressed'
              ? 'texture-distressed'
              : 'texture-dtg'
          }`}
        >
          {showPrintBoundary && (
            <span className="absolute -top-3 left-2 px-1.5 py-0.5 bg-brand-red text-[8px] font-mono font-bold tracking-widest text-white uppercase rounded">
              PRINT ZONE [{view.toUpperCase()}]
            </span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function isColorLight(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return true;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
