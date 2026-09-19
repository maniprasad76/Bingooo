import React from 'react';

interface ProductPlaceholderProps {
  name?: string;
  category?: string;
  className?: string;
  aspectRatio?: string;
  showText?: boolean;
}

export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({
  name = '',
  category = '',
  className = '',
  aspectRatio = 'aspect-[4/5]',
  showText = true,
}) => {
  const isHoodie =
    category.toLowerCase().includes('hoodie') ||
    category.toLowerCase().includes('fleece') ||
    name.toLowerCase().includes('hoodie');

  const isPants =
    category.toLowerCase().includes('pant') ||
    category.toLowerCase().includes('cargo') ||
    category.toLowerCase().includes('jean') ||
    name.toLowerCase().includes('pant') ||
    name.toLowerCase().includes('cargo') ||
    name.toLowerCase().includes('denim');

  return (
    <div
      className={`relative w-full h-full ${aspectRatio} bg-[#EDE0CC] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none ${className}`}
    >
      {/* Subtle corner architectural cross-hairs / registration marks */}
      <span className="absolute top-2 left-2 text-[10px] font-mono text-[#B8AFA2] leading-none">+</span>
      <span className="absolute top-2 right-2 text-[10px] font-mono text-[#B8AFA2] leading-none">+</span>
      <span className="absolute bottom-2 left-2 text-[10px] font-mono text-[#B8AFA2] leading-none">+</span>
      <span className="absolute bottom-2 right-2 text-[10px] font-mono text-[#B8AFA2] leading-none">+</span>

      {/* Subtle background monogram watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <span className="text-[120px] font-black tracking-tighter text-[#171717]">B</span>
      </div>

      {/* Central Garment Silhouette */}
      <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center text-[#7A7165] transition-transform duration-500 ease-out group-hover:scale-105">
        {isHoodie ? (
          /* Clean Hoodie Silhouette SVG */
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full drop-shadow-2xs opacity-85"
          >
            {/* Hood */}
            <path d="M35 32 C35 15, 65 15, 65 32" strokeWidth="2" />
            <path d="M42 22 C42 16, 58 16, 58 22" strokeWidth="1.4" opacity="0.6" />
            {/* Shoulders & Sleeves */}
            <path d="M35 32 L15 45 L22 62 L32 55 L32 85 L68 85 L68 55 L78 62 L85 45 L65 32 Z" />
            {/* Kangaroo pocket */}
            <path d="M40 68 L60 68 L64 78 L36 78 Z" strokeWidth="1.8" opacity="0.75" />
            {/* Ribbed hem */}
            <line x1="32" y1="82" x2="68" y2="82" strokeWidth="1.4" opacity="0.5" />
            {/* Subtle B on chest */}
            <text
              x="50"
              y="48"
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize="8"
              fontWeight="800"
              letterSpacing="0.05em"
              opacity="0.65"
            >
              B
            </text>
          </svg>
        ) : isPants ? (
          /* Clean Trousers / Cargo Silhouette SVG */
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full drop-shadow-2xs opacity-85"
          >
            {/* Waistband */}
            <rect x="34" y="20" width="32" height="6" rx="2" strokeWidth="1.8" />
            {/* Legs */}
            <path d="M34 26 L30 84 L45 84 L50 48 L55 84 L70 84 L66 26 Z" />
            {/* Cargo pockets */}
            <rect x="29" y="45" width="8" height="12" rx="1.5" strokeWidth="1.6" opacity="0.75" />
            <rect x="63" y="45" width="8" height="12" rx="1.5" strokeWidth="1.6" opacity="0.75" />
          </svg>
        ) : (
          /* Clean Boxy Oversized Tee Silhouette SVG */
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full drop-shadow-2xs opacity-85"
          >
            {/* Collar Ribbing */}
            <path d="M42 22 C44 26, 56 26, 58 22" strokeWidth="2.2" />
            <path d="M41 20 C44 24, 56 24, 59 20" strokeWidth="1.4" opacity="0.6" />
            {/* Drop shoulder boxy body & sleeves */}
            <path d="M41 20 L18 32 L26 50 L34 45 L34 84 L66 84 L66 45 L74 50 L82 32 L59 20 Z" />
            {/* Bottom hemline */}
            <line x1="34" y1="80" x2="66" y2="80" strokeWidth="1.4" opacity="0.5" />
            {/* Subtle Atelier B mark on chest */}
            <text
              x="50"
              y="44"
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize="9"
              fontWeight="900"
              letterSpacing="0.05em"
              opacity="0.6"
            >
              B
            </text>
          </svg>
        )}
      </div>

      {/* Clean Luxury Studio Label */}
      {showText && (
        <div className="relative z-10 mt-3 flex flex-col items-center gap-1 text-center">
          <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-[#7A7165] font-semibold">
            BINGOOO ATELIER
          </span>
          <span className="text-[7px] sm:text-[8px] font-sans uppercase tracking-[0.14em] text-[#9E9588] bg-[#E3D5C0]/60 px-2 py-0.5 rounded-full">
            STUDIO SHOT PENDING
          </span>
        </div>
      )}
    </div>
  );
};
