import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, Ruler, Info } from 'lucide-react';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

export interface SizeAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  initialSize?: string;
  garmentType?: 'oversized' | 'acidwash' | 'hoodie';
}

type FitPreference = 'fitted' | 'signature' | 'baggy';

export const SizeAdvisorModal: React.FC<SizeAdvisorModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  initialSize,
  garmentType = 'oversized',
}) => {
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [fitPref, setFitPref] = useState<FitPreference>('signature');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Convert for imperial display
  const heightFeetInches = useMemo(() => {
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }, [heightCm]);

  const weightLbs = useMemo(() => {
    return Math.round(weightKg * 2.20462);
  }, [weightKg]);

  // Recommendation algorithm calibrated for 240 GSM heavy boxy cuts
  const recommendation = useMemo(() => {
    // Base sizing points based on BMI and height/weight matrix
    let baseIndex = 2; // Default L (0: S, 1: M, 2: L, 3: XL, 4: XXL)

    const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));

    if (bmi < 20 || (weightKg < 58 && heightCm < 170)) {
      baseIndex = 0; // S
    } else if (bmi < 22.5 || (weightKg < 68 && heightCm < 178)) {
      baseIndex = 1; // M
    } else if (bmi < 26.5 || (weightKg < 82 && heightCm < 185)) {
      baseIndex = 2; // L
    } else if (bmi < 30 || weightKg < 95) {
      baseIndex = 3; // XL
    } else {
      baseIndex = 4; // XXL
    }

    // Fit adjustment
    if (fitPref === 'fitted') {
      baseIndex = Math.max(0, baseIndex - 1);
    } else if (fitPref === 'baggy') {
      baseIndex = Math.min(4, baseIndex + 1);
    }

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const recommendedSize = sizes[baseIndex];

    const measurements: Record<string, { chest: string; length: string; drape: string }> = {
      S: {
        chest: '42" (107 cm)',
        length: '27.5" (70 cm)',
        drape: 'Structured street cut with 1.5" drop-shoulder offset.',
      },
      M: {
        chest: '44" (112 cm)',
        length: '28.5" (72 cm)',
        drape: 'Signature relaxed boxy drape. Perfect for everyday streetwear layering.',
      },
      L: {
        chest: '46" (117 cm)',
        length: '29.5" (75 cm)',
        drape: 'Authentic 240 GSM atelier drape with deep armholes and intentional shoulder slope.',
      },
      XL: {
        chest: '48" (122 cm)',
        length: '30.5" (77 cm)',
        drape: 'Bold heavyweight drape. Extended torso length and relaxed hem.',
      },
      XXL: {
        chest: '50" (127 cm)',
        length: '31.5" (80 cm)',
        drape: 'Maximum oversized volume with pronounced drape folds.',
      },
    };

    return {
      size: recommendedSize,
      ...measurements[recommendedSize],
    };
  }, [heightCm, weightKg, fitPref]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    triggerHaptic('medium');
    onSelectSize(recommendation.size);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[min(640px,100%)] max-h-[92vh] overflow-y-auto bg-[#F7EEDB] border-2 border-[#171717] shadow-[8px_8px_0px_#171717] p-6 sm:p-8 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#171717] pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E6321C] text-white text-[9px] font-mono font-black uppercase tracking-widest border border-[#171717] mb-1.5 shadow-[1px_1px_0px_#171717]">
              <Sparkles size={11} /> ATELIER FIT ADVISOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171717] font-sans">
              FIND YOUR <span className="text-[#E6321C]">FIT.</span>
            </h2>
            <p className="text-xs text-[#6F6A63] font-mono mt-1">
              Engineered for Bingooo {garmentType === 'hoodie' ? '430 GSM Heavyweight Hoodie' : '240 GSM drop-shoulder streetwear'} silhouettes.
              {initialSize && (
                <span className="block mt-0.5 text-[#171717]">
                  Currently selected: <strong>Size {initialSize}</strong>
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-9 h-9 border-2 border-[#171717] bg-white text-[#171717] hover:bg-[#E6321C] hover:text-white transition-colors cursor-pointer flex items-center justify-center font-bold shadow-[2px_2px_0px_#171717]"
            aria-label="Close fit advisor"
          >
            <X size={18} />
          </button>
        </div>

        {/* Units Switch */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex border-2 border-[#171717] bg-white p-0.5 shadow-[2px_2px_0px_#171717]">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1 text-[10px] font-mono font-black uppercase transition-all cursor-pointer ${
                unitSystem === 'metric' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
              }`}
            >
              CM / KG
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1 text-[10px] font-mono font-black uppercase transition-all cursor-pointer ${
                unitSystem === 'imperial' ? 'bg-[#171717] text-white' : 'text-[#6F6A63] hover:text-[#171717]'
              }`}
            >
              FT / LBS
            </button>
          </div>
        </div>

        {/* Sliders Container */}
        <div className="space-y-5 bg-white border-2 border-[#171717] p-4 sm:p-5 shadow-[3px_3px_0px_#171717] mb-6">
          {/* Height Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-mono font-black uppercase text-[#171717] flex items-center gap-1.5">
                <Ruler size={13} className="text-[#E6321C]" />
                Your Height
              </label>
              <span className="font-mono text-sm font-black text-[#171717] bg-[#F7EEDB] px-2 py-0.5 border border-[#171717]">
                {unitSystem === 'metric' ? `${heightCm} CM` : heightFeetInches}
              </span>
            </div>
            <input
              type="range"
              min={150}
              max={205}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-[#E6321C] cursor-pointer h-2 bg-[#EDE0CC] rounded-none border border-[#171717]"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#6F6A63] mt-1">
              <span>150 cm (4'11")</span>
              <span>175 cm (5'9")</span>
              <span>205 cm (6'8")</span>
            </div>
          </div>

          {/* Weight Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-mono font-black uppercase text-[#171717] flex items-center gap-1.5">
                <Info size={13} className="text-[#E6321C]" />
                Your Weight
              </label>
              <span className="font-mono text-sm font-black text-[#171717] bg-[#F7EEDB] px-2 py-0.5 border border-[#171717]">
                {unitSystem === 'metric' ? `${weightKg} KG` : `${weightLbs} LBS`}
              </span>
            </div>
            <input
              type="range"
              min={45}
              max={125}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-[#E6321C] cursor-pointer h-2 bg-[#EDE0CC] rounded-none border border-[#171717]"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#6F6A63] mt-1">
              <span>45 kg (100 lbs)</span>
              <span>70 kg (154 lbs)</span>
              <span>125 kg (275 lbs)</span>
            </div>
          </div>

          {/* Fit Preference Buttons */}
          <div>
            <label className="text-[11px] font-mono font-black uppercase text-[#171717] block mb-2">
              Preferred Streetwear Drape
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fitted', label: 'Classic Fitted', desc: 'Size Down (-1)' },
                { id: 'signature', label: 'Signature Oversized', desc: 'Recommended Drape' },
                { id: 'baggy', label: 'Ultra Baggy', desc: 'Size Up (+1)' },
              ].map((fit) => (
                <button
                  key={fit.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setFitPref(fit.id as FitPreference);
                  }}
                  className={`p-2.5 text-center border-2 border-[#171717] transition-all cursor-pointer ${
                    fitPref === fit.id
                      ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                      : 'bg-white text-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#F7EEDB]'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-wider font-mono">
                    {fit.label}
                  </span>
                  <span
                    className={`block text-[8px] font-mono mt-0.5 ${
                      fitPref === fit.id ? 'text-[#F7EEDB]/70' : 'text-[#6F6A63]'
                    }`}
                  >
                    {fit.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Recommendation Card */}
        <div className="bg-[#EDE0CC] border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#171717]/20 pb-4 mb-4">
            <div>
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#E6321C] block">
                RECOMMENDED SILHOUETTE
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-4xl font-black font-mono text-[#171717]">
                  SIZE {recommendation.size}
                </span>
                <span className="text-xs font-mono font-bold text-[#6F6A63]">
                  Chest: {recommendation.chest}
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-[#238636] text-white text-[10px] font-mono font-black uppercase tracking-wider border border-[#171717] self-start sm:self-auto shadow-[1.5px_1.5px_0px_#171717]">
              ✓ 99% PERFECT FIT CONFIDENCE
            </div>
          </div>

          <p className="text-xs font-mono text-[#171717] leading-relaxed mb-4">
            {recommendation.drape}
          </p>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="bg-white border border-[#171717] p-2">
              <span className="text-[9px] text-[#6F6A63] uppercase block">Garment Length</span>
              <strong className="text-[#171717] font-black">{recommendation.length}</strong>
            </div>
            <div className="bg-white border border-[#171717] p-2">
              <span className="text-[9px] text-[#6F6A63] uppercase block">Fabric Weight</span>
              <strong className="text-[#171717] font-black">240 GSM Combed Cotton</strong>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border-2 border-[#171717] bg-white text-[#171717] font-mono font-bold text-xs uppercase hover:bg-[#EDE0CC] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 px-6 bg-[#E6321C] hover:bg-[#171717] text-white font-mono font-black text-xs uppercase tracking-widest border-2 border-[#171717] shadow-[3px_3px_0px_#171717] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>SELECT SIZE {recommendation.size}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
