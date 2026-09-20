import React from 'react';

interface ProductPlaceholderProps {
  name?: string;
  category?: string;
  className?: string;
  aspectRatio?: string;
  showText?: boolean;
}

export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({
  name: _name = '',
  category: _category = '',
  className = '',
  aspectRatio = 'aspect-[4/5]',
  showText = true,
}) => {
  return (
    <div
      className={`relative w-full h-full ${aspectRatio} bg-[#EDE0CC] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none ${className}`}
    >
      {/* Subtle corner architectural cross-hairs / registration marks */}
      <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-[#A89E90] leading-none select-none">+</span>
      <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-[#A89E90] leading-none select-none">+</span>
      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono text-[#A89E90] leading-none select-none">+</span>
      <span className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-[#A89E90] leading-none select-none">+</span>

      {/* Central Bingooo Typography & Monogram */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center transition-transform duration-500 ease-out group-hover:scale-105">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#DDD3C5] bg-white/50 backdrop-blur-xs flex items-center justify-center shadow-xs mb-3">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-[#171717] select-none font-heading">
            B<span className="text-[#E6321C]">.</span>
          </span>
        </div>

        {showText && (
          <div className="flex flex-col items-center gap-1.5 text-center mt-1">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#171717] font-bold">
              BINGOOO ATELIER
            </span>
            <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-[0.14em] text-[#7A7165] bg-[#E3D5C0]/90 px-2.5 py-0.5 rounded-full border border-[#DDD3C5]/80">
              STUDIO SHOT PENDING
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
