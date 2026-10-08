import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Upload,
  X,
  Ruler,
  Check,
  MessageCircle,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { BINGOOO_PHONE_RAW } from '../components/ui/SocialIcons';
import { SEO } from '../components/common/SEO';

// ─── TYPES ──────────────────────────────────────────────────────────────────
export type GarmentType = 'oversized' | 'polo' | 'hoodie';
export type GarmentView = 'FRONT' | 'BACK';
export type DesignPlacement = 'center' | 'left_chest' | 'back';

export interface MeasurementRow {
  size: string;
  chest: string;
  length?: string;
  height?: string;
  shoulder?: string;
  sleeve?: string;
}

export interface GarmentColor {
  id: string;
  name: string;
  hex: string;
  textContrast: string;
  frontImageUrl: string;
  backImageUrl?: string;
  isActive: boolean;
}

export interface GarmentConfig {
  id: GarmentType;
  name: string;
  price: number;
  compareAtPrice: number;
  description: string;
  isActive: boolean;
  sizes: string[];
  activeSizes: string[];
  sizeMeasurements: {
    in: MeasurementRow[];
    cm?: MeasurementRow[];
  };
  colors: GarmentColor[];
}

export interface UploadedArtwork {
  file: File;
  previewUrl: string;
  name: string;
  sizeKb: number;
  scale: number; // 0.6 to 1.4, default 1.0
  offsetY: number; // -30 to 30 px offset
}

// ─── CANONICAL BAUHAUS DEFAULTS ─────────────────────────────────────────────
const DEFAULT_GARMENTS: Record<GarmentType, GarmentConfig> = {
  oversized: {
    id: 'oversized',
    name: 'Drop-Shoulder / Oversized T-Shirt',
    price: 649,
    compareAtPrice: 1499,
    description: '240 GSM Combed Cotton · Drop-Shoulder Relaxed Streetwear Fit',
    isActive: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    activeSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: {
      in: [
        { size: 'S', chest: '42', length: '27.5', shoulder: '20', sleeve: '8.5' },
        { size: 'M', chest: '44', length: '28', shoulder: '21', sleeve: '9' },
        { size: 'L', chest: '46', length: '28.5', shoulder: '22', sleeve: '9.5' },
        { size: 'XL', chest: '48', length: '29', shoulder: '23', sleeve: '10' },
        { size: 'XXL', chest: '50', length: '29.5', shoulder: '24', sleeve: '10.5' },
      ],
      cm: [
        { size: 'S', chest: '107', length: '70', shoulder: '51', sleeve: '22' },
        { size: 'M', chest: '112', length: '71', shoulder: '53', sleeve: '23' },
        { size: 'L', chest: '117', length: '72', shoulder: '56', sleeve: '24' },
        { size: 'XL', chest: '122', length: '74', shoulder: '58', sleeve: '25' },
        { size: 'XXL', chest: '127', length: '75', shoulder: '61', sleeve: '27' },
      ],
    },
    colors: [
      { id: 'black', name: 'Obsidian Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png', isActive: true },
      { id: 'white', name: 'Pure White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png', isActive: true },
      { id: 'beige', name: 'Washed Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Signal Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
  polo: {
    id: 'polo',
    name: 'Regular Fit Round Neck / Polo',
    price: 699,
    compareAtPrice: 1499,
    description: '220 GSM Honeycomb Matty · Premium Combed Cotton Polo Fit',
    isActive: true,
    sizes: ['36', '38', '40', '42', '44', '46'],
    activeSizes: ['36', '38', '40', '42', '44', '46'],
    sizeMeasurements: {
      in: [
        { size: '36', chest: '36', length: '26', shoulder: '16', sleeve: '8' },
        { size: '38', chest: '38', length: '27', shoulder: '17', sleeve: '8.5' },
        { size: '40', chest: '40', length: '28', shoulder: '17.5', sleeve: '9' },
        { size: '42', chest: '42', length: '29', shoulder: '18', sleeve: '9.5' },
        { size: '44', chest: '44', length: '30', shoulder: '18.5', sleeve: '10' },
        { size: '46', chest: '46', length: '31', shoulder: '19', sleeve: '10.5' },
      ],
      cm: [
        { size: '36', chest: '91', length: '66', shoulder: '41', sleeve: '20' },
        { size: '38', chest: '97', length: '68', shoulder: '43', sleeve: '22' },
        { size: '40', chest: '102', length: '71', shoulder: '44', sleeve: '23' },
        { size: '42', chest: '107', length: '74', shoulder: '46', sleeve: '24' },
        { size: '44', chest: '112', length: '76', shoulder: '47', sleeve: '25' },
        { size: '46', chest: '117', length: '79', shoulder: '48', sleeve: '27' },
      ],
    },
    colors: [
      { id: 'black', name: 'Obsidian Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/black-front.png', backImageUrl: '/custom/black-back.png', isActive: true },
      { id: 'white', name: 'Pure White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/white-front.png', backImageUrl: '/custom/white-back.png', isActive: true },
      { id: 'beige', name: 'Washed Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Signal Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
  hoodie: {
    id: 'hoodie',
    name: 'Drop Shoulder Hoodie (430gsm)',
    price: 799,
    compareAtPrice: 1799,
    description: '430 GSM Heavyweight Brushed Fleece · Structured Streetwear Pullover Hoodie',
    isActive: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    activeSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeMeasurements: {
      in: [
        { size: 'S', chest: '42', height: '25' },
        { size: 'M', chest: '44', height: '26' },
        { size: 'L', chest: '46', height: '27' },
        { size: 'XL', chest: '48', height: '28' },
        { size: 'XXL', chest: '50', height: '29' },
      ],
      cm: [
        { size: 'S', chest: '107', height: '64' },
        { size: 'M', chest: '112', height: '66' },
        { size: 'L', chest: '117', height: '69' },
        { size: 'XL', chest: '122', height: '71' },
        { size: 'XXL', chest: '127', height: '74' },
      ],
    },
    colors: [
      { id: 'black', name: 'Obsidian Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '/custom/hoodie-black-front.png', backImageUrl: '/custom/hoodie-black-back.png', isActive: true },
      { id: 'white', name: 'Pure White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '/custom/hoodie-white-front.png', backImageUrl: '/custom/hoodie-white-back.png', isActive: true },
      { id: 'beige', name: 'Washed Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '/custom/beige-front.png', backImageUrl: '/custom/beige-back.png', isActive: true },
      { id: 'red', name: 'Signal Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '/custom/red-front.png', backImageUrl: '/custom/red-back.png', isActive: true },
    ],
  },
};

export function CustomizerPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── STATE ────────────────────────────────────────────────────────────────
  const [garmentsConfig, setGarmentsConfig] = useState<Record<GarmentType, GarmentConfig>>(DEFAULT_GARMENTS);
  const [selectedFit, setSelectedFit] = useState<GarmentType>('oversized');
  const [selectedColorId, setSelectedColorId] = useState<string>('black');
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [currentView, setCurrentView] = useState<GarmentView>('FRONT');
  const [activePlacement, setActivePlacement] = useState<DesignPlacement>('center');
  const [artworks, setArtworks] = useState<Record<DesignPlacement, UploadedArtwork | null>>({
    center: null,
    left_chest: null,
    back: null,
  });
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);
  const [sizeUnit, setSizeUnit] = useState<'in' | 'cm'>('in');
  const [quoteSuccessModal, setQuoteSuccessModal] = useState<boolean>(false);

  // ─── SYNC WITH ADMIN PANEL VIA BACKEND ────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    api
      .get<{ garments?: any[] }>('/customizations/studio/config')
      .then((res) => {
        if (!mounted || !res || !Array.isArray(res.garments)) return;
        const updated = { ...DEFAULT_GARMENTS };
        res.garments.forEach((g: any) => {
          if (g.id === 'oversized' || g.id === 'polo' || g.id === 'hoodie') {
            const key = g.id as GarmentType;
            updated[key] = {
              ...updated[key],
              ...g,
              price: Number(g.price) || updated[key].price,
              compareAtPrice: Number(g.compareAtPrice) || updated[key].compareAtPrice,
            };
          }
        });
        setGarmentsConfig(updated);
      })
      .catch(() => {
        // Fall back gracefully to canonical defaults
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Handle URL param ?fit=polo or ?fit=hoodie (adjusted during render)
  const fitParam = searchParams.get('fit')?.toLowerCase() || '';
  const [syncedFitParam, setSyncedFitParam] = useState('');
  if (fitParam !== syncedFitParam) {
    setSyncedFitParam(fitParam);
    if (fitParam === 'polo' || fitParam === 'hoodie' || fitParam === 'oversized') {
      setSelectedFit(fitParam as GarmentType);
      if (fitParam === 'polo') setSelectedSize('40');
    }
  }

  // Ensure selected size matches current fit's available sizes
  const fitGarment = garmentsConfig[selectedFit] || DEFAULT_GARMENTS[selectedFit];
  const fitSizes = fitGarment.activeSizes?.length ? fitGarment.activeSizes : fitGarment.sizes;
  const fallbackSize = fitSizes[0] || (selectedFit === 'polo' ? '40' : 'L');
  if (!fitSizes.includes(selectedSize) && selectedSize !== fallbackSize) {
    setSelectedSize(fallbackSize);
  }

  // Current garment config
  const currentGarment = useMemo(() => {
    return garmentsConfig[selectedFit] || DEFAULT_GARMENTS[selectedFit];
  }, [garmentsConfig, selectedFit]);

  // Active colors (only show active ones)
  const availableColors = useMemo(() => {
    const cols = currentGarment.colors.filter((c) => c.isActive !== false);
    return cols.length > 0 ? cols : DEFAULT_GARMENTS[selectedFit].colors;
  }, [currentGarment, selectedFit]);

  // Selected color object
  const activeColor = useMemo(() => {
    return availableColors.find((c) => c.id === selectedColorId) || availableColors[0] || DEFAULT_GARMENTS[selectedFit].colors[0];
  }, [availableColors, selectedColorId, selectedFit]);

  // Mockup image URL based on fit, color, and view
  const mockupImageUrl = useMemo(() => {
    if (selectedFit === 'hoodie') {
      if (activeColor.id === 'black') {
        return currentView === 'FRONT' ? '/custom/hoodie-black-front.png' : '/custom/hoodie-black-back.png';
      }
      if (activeColor.id === 'white') {
        return currentView === 'FRONT' ? '/custom/hoodie-white-front.png' : '/custom/hoodie-white-back.png';
      }
      // Fallback for beige/red hoodie: use high-contrast base
      return currentView === 'FRONT' ? '/custom/hoodie-black-front.png' : '/custom/hoodie-black-back.png';
    }

    // Oversized & Polo
    if (currentView === 'FRONT') {
      return activeColor.frontImageUrl || `/custom/${activeColor.id}-front.png`;
    }
    return activeColor.backImageUrl || `/custom/${activeColor.id}-back.png`;
  }, [selectedFit, activeColor, currentView]);

  // ─── FILE UPLOAD HANDLER (PNG ONLY) ───────────────────────────────────────
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // STRICT PNG ONLY CHECK
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (!isPng) {
      toast({
        title: 'Only PNG Files Accepted',
        description: 'Please upload a transparent .png file to ensure crisp high-resolution printing.',
        variant: 'error',
      });
      return;
    }

    // Size limit check (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum artwork file size is 20MB.',
        variant: 'error',
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const sizeKb = Math.round(file.size / 1024);

    setArtworks((prev) => ({
      ...prev,
      [activePlacement]: {
        file,
        previewUrl,
        name: file.name,
        sizeKb,
        scale: 1.0,
        offsetY: 0,
      },
    }));

    toast({
      title: 'Artwork Uploaded',
      description: `Applied ${file.name} to ${activePlacement.replace('_', ' ').toUpperCase()} preview.`,
      variant: 'success',
    });
  };

  const removeArtwork = (placement: DesignPlacement) => {
    setArtworks((prev) => {
      const existing = prev[placement];
      if (existing) {
        URL.revokeObjectURL(existing.previewUrl);
      }
      return { ...prev, [placement]: null };
    });
  };

  const updateArtworkScale = (placement: DesignPlacement, scale: number) => {
    setArtworks((prev) => {
      const item = prev[placement];
      if (!item) return prev;
      return {
        ...prev,
        [placement]: { ...item, scale },
      };
    });
  };

  // Switch placement and auto-toggle front/back view
  const handleSelectPlacement = (placement: DesignPlacement) => {
    setActivePlacement(placement);
    if (placement === 'back') {
      setCurrentView('BACK');
    } else {
      setCurrentView('FRONT');
    }
  };

  // ─── WHATSAPP QUOTATION GENERATOR ─────────────────────────────────────────
  const handleWhatsAppQuote = () => {
    const garmentName = currentGarment.name;
    const price = currentGarment.price;
    const colorName = activeColor.name;

    // Measurement spec for chosen size
    const measurementsInches = currentGarment.sizeMeasurements?.in?.find((m) => m.size === selectedSize);
    let sizeDetails = `Size: ${selectedSize}`;
    if (measurementsInches) {
      if (measurementsInches.height) {
        sizeDetails += ` (Chest: ${measurementsInches.chest}", Height: ${measurementsInches.height}")`;
      } else {
        sizeDetails += ` (Chest: ${measurementsInches.chest}", Length: ${measurementsInches.length}")`;
      }
    }

    const centerArt = artworks.center ? `✓ Yes (${artworks.center.name})` : 'None';
    const leftChestArt = artworks.left_chest ? `✓ Yes (${artworks.left_chest.name})` : 'None';
    const backArt = artworks.back ? `✓ Yes (${artworks.back.name})` : 'None';

    const message = [
      `*BINGOOO BESPOKE CUSTOM STUDIO QUOTE*`,
      `---------------------------------`,
      `*Garment:* ${garmentName}`,
      `*Color:* ${colorName} (${activeColor.hex})`,
      `*${sizeDetails}*`,
      ``,
      `*Print Placements Configured:*`,
      `• Front Center: ${centerArt}`,
      `• Left Chest: ${leftChestArt}`,
      `• Back Print: ${backArt}`,
      ``,
      `*Estimated Price:* ₹${price}`,
      `---------------------------------`,
      `Hi Bingooo team, I have customized this garment in your studio. I am ready to share my PNG design artwork files for printing and order confirmation!`,
    ].join('\n');

    const waUrl = `https://wa.me/${BINGOOO_PHONE_RAW}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setQuoteSuccessModal(true);
  };

  // Count active artworks
  const uploadedCount = useMemo(() => {
    return Object.values(artworks).filter(Boolean).length;
  }, [artworks]);

  return (
    <>
      <SEO
        title="Bauhaus Custom Studio · Bingooo"
        description="Design your custom oversized t-shirt, hoodie, or polo with direct live PNG preview, premium 240+ GSM cotton, and instant WhatsApp quotation."
      />

      <div className="min-h-screen bg-[#F7EEDB] text-[#171717] pt-20 pb-28 md:py-24 px-3 sm:px-6 lg:px-12 flex flex-col justify-center">
        {/* Outer Bauhaus Framed Container */}
        <div className="max-w-[1360px] w-full mx-auto bg-white border-[3px] border-[#171717] shadow-[8px_8px_0px_#171717] overflow-hidden flex flex-col lg:flex-row">
          
          {/* ═══════════════════════════════════════════════════════════════════
              LEFT PANEL: SIGNAL RED LIVE VISUALIZER
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[52%] bg-[#E6321C] relative flex flex-col justify-between p-6 sm:p-10 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#171717] min-h-[520px] sm:min-h-[640px] select-none overflow-hidden">
            
            {/* Bauhaus Massive Typographic Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <span className="text-white/[0.14] font-black tracking-tighter text-[130px] sm:text-[200px] md:text-[260px] leading-none uppercase select-none">
                YOU
              </span>
            </div>

            {/* Top Bar: LIVE PREVIEW Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-xs uppercase font-mono tracking-widest text-white/90 font-bold">
                  BINGOOO. STUDIO
                </span>
              </div>
              <div className="bg-[#171717] text-white px-3.5 py-1 text-xs font-mono font-bold tracking-widest uppercase border border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                LIVE PREVIEW
              </div>
            </div>

            {/* Garment Mockup & Artwork Projection Layer */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-6">
              <div className="relative w-full max-w-[400px] sm:max-w-[460px] aspect-square flex items-center justify-center">
                
                {/* Realistic Garment Base Mockup */}
                <img
                  src={mockupImageUrl}
                  alt={`${currentGarment.name} - ${activeColor.name}`}
                  className="w-full h-full object-contain filter drop-shadow-[0_24px_38px_rgba(0,0,0,0.45)] transition-all duration-300 pointer-events-none"
                  onError={(e) => {
                    // Fallback if specific color mockup fails
                    (e.target as HTMLImageElement).src = '/custom/black-front.png';
                  }}
                />

                {/* ─── FRONT VIEW PROJECTION ─────────────────────────────── */}
                {currentView === 'FRONT' && (
                  <>
                    {/* CENTER / FRONT ARTWORK */}
                    <div
                      className="absolute z-20 pointer-events-none flex items-center justify-center text-center overflow-hidden transition-all duration-200"
                      style={{
                        top: selectedFit === 'hoodie' ? '42%' : '38%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translateY(${artworks.center?.offsetY || 0}px)`,
                        width: `${(artworks.center?.scale || 1.0) * (selectedFit === 'hoodie' ? 140 : 160)}px`,
                        height: `${(artworks.center?.scale || 1.0) * (selectedFit === 'hoodie' ? 150 : 170)}px`,
                      }}
                    >
                      {artworks.center ? (
                        <img
                          src={artworks.center.previewUrl}
                          alt="Front Design"
                          className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                        />
                      ) : (
                        // Default Placeholder matching the Bauhaus Reference Image: "YOUR LINE HERE"
                        <div className="flex flex-col items-center justify-center text-center select-none opacity-90 px-2">
                          <span
                            className="font-extrabold tracking-widest uppercase text-base sm:text-lg leading-tight"
                            style={{
                              color: activeColor.textContrast,
                              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                            }}
                          >
                            YOUR
                            <br />
                            LINE HERE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* LEFT CHEST ARTWORK (if uploaded) */}
                    {artworks.left_chest && (
                      <div
                        className="absolute z-20 pointer-events-none flex items-center justify-center overflow-hidden"
                        style={{
                          top: selectedFit === 'hoodie' ? '34%' : '32%',
                          left: '60%', // Garment's wearer left side (viewer right)
                          width: `${(artworks.left_chest.scale || 1.0) * 58}px`,
                          height: `${(artworks.left_chest.scale || 1.0) * 58}px`,
                        }}
                      >
                        <img
                          src={artworks.left_chest.previewUrl}
                          alt="Left Chest Design"
                          className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ─── BACK VIEW PROJECTION ──────────────────────────────── */}
                {currentView === 'BACK' && (
                  <div
                    className="absolute z-20 pointer-events-none flex items-center justify-center text-center overflow-hidden transition-all duration-200"
                    style={{
                      top: selectedFit === 'hoodie' ? '44%' : '40%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translateY(${artworks.back?.offsetY || 0}px)`,
                      width: `${(artworks.back?.scale || 1.0) * (selectedFit === 'hoodie' ? 150 : 170)}px`,
                      height: `${(artworks.back?.scale || 1.0) * (selectedFit === 'hoodie' ? 160 : 180)}px`,
                    }}
                  >
                    {artworks.back ? (
                      <img
                        src={artworks.back.previewUrl}
                        alt="Back Design"
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center select-none opacity-80 px-2">
                        <span
                          className="font-extrabold tracking-widest uppercase text-sm sm:text-base leading-tight border-2 border-dashed p-3 rounded"
                          style={{
                            color: activeColor.textContrast,
                            borderColor: activeColor.textContrast === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                          }}
                        >
                          BACK PRINT
                          <br />
                          ARTWORK
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Left: View Controls (FRONT / BACK) */}
            <div className="relative z-10 flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 bg-white p-1 border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
                <button
                  type="button"
                  onClick={() => setCurrentView('FRONT')}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    currentView === 'FRONT'
                      ? 'bg-[#171717] text-white'
                      : 'bg-transparent text-[#171717] hover:bg-black/5'
                  }`}
                >
                  FRONT
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('BACK')}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    currentView === 'BACK'
                      ? 'bg-[#171717] text-white'
                      : 'bg-transparent text-[#171717] hover:bg-black/5'
                  }`}
                >
                  BACK
                </button>
              </div>

              {/* Quick Status */}
              <div className="text-white text-xs font-mono font-medium tracking-tight bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded">
                {uploadedCount > 0 ? `${uploadedCount} Artworks Applied` : 'Ready for Design'}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT PANEL: BAUHAUS CONFIGURATION DECK (WARM CREAM)
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[48%] bg-[#F7EEDB] flex flex-col justify-between p-6 sm:p-10">
            <div>
              {/* Header: BUILD YOURS. */}
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#171717] uppercase flex items-baseline">
                  BUILD YOURS
                  <span className="text-[#E6321C] text-4xl sm:text-5xl md:text-6xl leading-none">.</span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#171717]/70 uppercase mt-1">
                  Bespoke DTF & Screen Printing · 100% Combed Heavy Cotton
                </p>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 01: PICK A FIT
                 ───────────────────────────────────────────────────────────── */}
              <div className="pt-5 border-t-[2px] border-[#171717]">
                <div className="flex items-center gap-3 mb-3.5">
                  <span className="w-7 h-7 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    01
                  </span>
                  <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
                    PICK A FIT
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {(['oversized', 'polo', 'hoodie'] as GarmentType[]).map((fitKey) => {
                    const g = garmentsConfig[fitKey];
                    const isSelected = selectedFit === fitKey;
                    const fitLabel =
                      fitKey === 'oversized'
                        ? 'OVERSIZED'
                        : fitKey === 'polo'
                        ? 'POLO SHIRT'
                        : 'HOODIE';

                    return (
                      <button
                        key={fitKey}
                        type="button"
                        onClick={() => setSelectedFit(fitKey)}
                        className={`py-3 px-2 border-2 border-[#171717] text-center transition-all ${
                          isSelected
                            ? 'bg-[#171717] text-white shadow-[3px_3px_0px_#171717]'
                            : 'bg-white text-[#171717] hover:bg-black/5 hover:translate-y-[-1px]'
                        }`}
                      >
                        <div className="font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                          {fitLabel}
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-0.5 flex items-center justify-center gap-1.5 ${
                            isSelected ? 'text-[#E6321C] font-bold' : 'text-[#171717]/70'
                          }`}
                        >
                          <span>₹{g?.price || DEFAULT_GARMENTS[fitKey].price}</span>
                          {(g?.compareAtPrice || DEFAULT_GARMENTS[fitKey].compareAtPrice) && (
                            <span className={`line-through text-[10px] ${isSelected ? 'text-white/60' : 'text-[#171717]/40'}`}>
                              ₹{g?.compareAtPrice || DEFAULT_GARMENTS[fitKey].compareAtPrice}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 02: COLOUR & SIZE
                 ───────────────────────────────────────────────────────────── */}
              <div className="pt-6 mt-6 border-t-[2px] border-[#171717]">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      02
                    </span>
                    <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
                      COLOUR & SIZE
                    </span>
                  </div>
                  
                  {/* Size Guide Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#171717] hover:text-[#E6321C] underline underline-offset-2 transition-colors"
                  >
                    <Ruler size={14} />
                    <span>SIZE CHART</span>
                  </button>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-4 mb-4">
                  {availableColors.map((color) => {
                    const isSelected = activeColor.id === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColorId(color.id)}
                        title={color.name}
                        className={`relative w-9 h-9 rounded-full border border-black/30 transition-transform ${
                          isSelected
                            ? 'scale-110 ring-[3px] ring-offset-2 ring-[#E6321C] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <span
                            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                            style={{ color: color.textContrast }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold uppercase tracking-wider text-[#171717]/80 ml-1">
                    {activeColor.name}
                  </span>
                </div>

                {/* Size Boxes */}
                <div className="flex flex-wrap items-center gap-2">
                  {(currentGarment.activeSizes?.length ? currentGarment.activeSizes : currentGarment.sizes).map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`w-11 h-11 border-2 border-[#171717] font-bold text-xs sm:text-sm uppercase flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#171717]'
                            : 'bg-white text-[#171717] hover:bg-black/5 hover:translate-y-[-1px]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 03: ADD YOUR DESIGN (PNG ONLY)
                 ───────────────────────────────────────────────────────────── */}
              <div className="pt-6 mt-6 border-t-[2px] border-[#171717]">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#171717] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      03
                    </span>
                    <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#171717]">
                      ADD YOUR DESIGN
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-[#E6321C]/15 text-[#E6321C] px-2 py-0.5 border border-[#E6321C]/30">
                    PNG ONLY
                  </span>
                </div>

                {/* Placement Selector Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { id: 'center', label: 'CENTER' },
                    { id: 'left_chest', label: 'LEFT CHEST' },
                    { id: 'back', label: 'BACK' },
                  ].map((tab) => {
                    const isTabActive = activePlacement === tab.id;
                    const hasArt = !!artworks[tab.id as DesignPlacement];

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleSelectPlacement(tab.id as DesignPlacement)}
                        className={`py-2 px-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-wider relative transition-all ${
                          isTabActive
                            ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#171717]'
                            : 'bg-white text-[#171717] hover:bg-black/5'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {hasArt && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#E6321C] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* File Upload Zone for Active Placement */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".png,image/png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

                {artworks[activePlacement] ? (
                  // Active Artwork Controls
                  <div className="bg-white border-2 border-[#171717] p-3.5 shadow-[3px_3px_0px_#171717]">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-black/20 bg-black/5 flex items-center justify-center p-1 overflow-hidden">
                          <img
                            src={artworks[activePlacement]!.previewUrl}
                            alt="Uploaded artwork"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171717] truncate max-w-[170px] sm:max-w-[220px]">
                            {artworks[activePlacement]!.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#171717]/60">
                            {artworks[activePlacement]!.sizeKb} KB · Transparent PNG
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArtwork(activePlacement)}
                        className="p-1.5 text-[#171717]/60 hover:text-[#E6321C] transition-colors"
                        title="Remove artwork"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Scale Slider */}
                    <div className="flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="text-[#171717]/70 text-[11px] uppercase tracking-wider">
                        PRINT SCALE:
                      </span>
                      <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                        <input
                          type="range"
                          min="0.6"
                          max="1.4"
                          step="0.05"
                          value={artworks[activePlacement]!.scale}
                          onChange={(e) =>
                            updateArtworkScale(activePlacement, parseFloat(e.target.value))
                          }
                          className="w-full accent-[#171717] cursor-pointer"
                        />
                        <span className="text-[11px] font-mono w-9 text-right">
                          {Math.round(artworks[activePlacement]!.scale * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#171717] hover:text-[#E6321C] underline underline-offset-2"
                      >
                        Replace Artwork
                      </button>
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check size={12} /> Projected On Garment
                      </span>
                    </div>
                  </div>
                ) : (
                  // Empty Dropzone
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-[#171717] bg-white/70 hover:bg-white p-6 text-center cursor-pointer transition-all hover:shadow-[3px_3px_0px_#171717] group"
                  >
                    <Upload
                      size={24}
                      className="mx-auto text-[#171717] group-hover:scale-110 group-hover:text-[#E6321C] transition-all mb-2"
                    />
                    <p className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                      UPLOAD {activePlacement.replace('_', ' ').toUpperCase()} ARTWORK
                    </p>
                    <p className="text-[11px] font-mono text-[#171717]/60 mt-1">
                      Drag & drop transparent PNG only (Max 20MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                STICKY BAUHAUS ACTION BAR (PRICE + WHATSAPP QUOTATION)
               ───────────────────────────────────────────────────────────── */}
            <div className="mt-8 bg-[#171717] text-white p-4 sm:p-5 border-2 border-[#171717] shadow-[4px_4px_0px_#171717] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                    ₹{currentGarment.price}
                  </span>
                  {currentGarment.compareAtPrice && currentGarment.compareAtPrice > currentGarment.price && (
                    <>
                      <span className="text-sm font-mono text-white/40 line-through">
                        ₹{currentGarment.compareAtPrice}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#E6321C] bg-[#E6321C]/15 border border-[#E6321C]/30 px-2 py-0.5">
                        {Math.round(((currentGarment.compareAtPrice - currentGarment.price) / currentGarment.compareAtPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[10px] font-mono text-white/70 uppercase tracking-widest mt-0.5">
                  DIRECT FACTORY PRICE · INCL. ALL TAXES
                </p>
              </div>

              {/* WHATSAPP QUOTATION BUTTON */}
              <button
                type="button"
                onClick={handleWhatsAppQuote}
                className="w-full sm:w-auto bg-[#E6321C] hover:bg-[#ff3b20] text-white px-6 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-[3px_3px_0px_rgba(255,255,255,0.2)]"
              >
                <MessageCircle size={18} className="fill-current" />
                <span>GET WHATSAPP QUOTE →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          SIZE SPECIFICATIONS CHART MODAL (BAUHAUS STYLE)
         ═════════════════════════════════════════════════════════════════════ */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F7EEDB] border-[3px] border-[#171717] shadow-[8px_8px_0px_#171717] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-[#171717] mb-6">
              <div>
                <h3 className="text-2xl font-black uppercase text-[#171717]">
                  {currentGarment.name}
                </h3>
                <p className="text-xs font-mono text-[#171717]/70 uppercase tracking-wider mt-0.5">
                  OFFICIAL FACTORY SIZE CHART & TOLERANCE SPECS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="w-8 h-8 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Unit Toggle: INCHES vs CM */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase text-[#171717]">
                MEASUREMENT UNIT:
              </span>
              <div className="flex items-center border-2 border-[#171717] bg-white">
                <button
                  type="button"
                  onClick={() => setSizeUnit('in')}
                  className={`px-3 py-1 text-xs font-bold uppercase ${
                    sizeUnit === 'in' ? 'bg-[#171717] text-white' : 'text-[#171717]'
                  }`}
                >
                  INCHES (IN)
                </button>
                <button
                  type="button"
                  onClick={() => setSizeUnit('cm')}
                  className={`px-3 py-1 text-xs font-bold uppercase ${
                    sizeUnit === 'cm' ? 'bg-[#171717] text-white' : 'text-[#171717]'
                  }`}
                >
                  CENTIMETERS (CM)
                </button>
              </div>
            </div>

            {/* Measurement Table */}
            <div className="overflow-x-auto border-2 border-[#171717] bg-white mb-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#171717] text-white font-mono uppercase">
                    <th className="p-3 border-r border-white/20">SIZE</th>
                    <th className="p-3 border-r border-white/20">CHEST</th>
                    {selectedFit !== 'hoodie' && <th className="p-3 border-r border-white/20">LENGTH</th>}
                    {selectedFit === 'hoodie' && <th className="p-3 border-r border-white/20">HEIGHT</th>}
                    {selectedFit !== 'hoodie' && <th className="p-3 border-r border-white/20">SHOULDER</th>}
                    {selectedFit !== 'hoodie' && <th className="p-3">SLEEVE</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 font-medium">
                  {(sizeUnit === 'cm' && currentGarment.sizeMeasurements?.cm
                    ? currentGarment.sizeMeasurements.cm
                    : currentGarment.sizeMeasurements?.in || []
                  ).map((row) => {
                    const isSelected = selectedSize === row.size;
                    return (
                      <tr
                        key={row.size}
                        className={`transition-colors ${
                          isSelected ? 'bg-[#E6321C]/15 font-bold' : 'hover:bg-black/5'
                        }`}
                      >
                        <td className="p-3 border-r border-black/10 font-mono font-bold text-[#171717] flex items-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#E6321C]" />}
                          {row.size}
                        </td>
                        <td className="p-3 border-r border-black/10 font-mono">{row.chest}</td>
                        {row.length && <td className="p-3 border-r border-black/10 font-mono">{row.length}</td>}
                        {row.height && <td className="p-3 border-r border-black/10 font-mono">{row.height}</td>}
                        {row.shoulder && <td className="p-3 border-r border-black/10 font-mono">{row.shoulder}</td>}
                        {row.sleeve && <td className="p-3 font-mono">{row.sleeve}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Note */}
            <div className="bg-white p-4 border-2 border-[#171717] text-xs space-y-1">
              <p className="font-bold uppercase text-[#171717]">FITTING ADVICE:</p>
              <p className="text-[#171717]/70">
                • Drop-Shoulder Oversized tees have a relaxed streetwear drape with extended sleeve drops.
              </p>
              <p className="text-[#171717]/70">
                • Hoodie measurements represent total chest circumference and back neck-to-hem height.
              </p>
              <p className="text-[#171717]/70">
                • Standard ±0.5 inch tailoring tolerance applies across all batches.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="bg-[#171717] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider border-2 border-[#171717]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          WHATSAPP QUOTE SUCCESS REMINDER MODAL
         ═════════════════════════════════════════════════════════════════════ */}
      {quoteSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F7EEDB] border-[3px] border-[#171717] shadow-[8px_8px_0px_#171717] max-w-md w-full p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E6321C] text-white flex items-center justify-center mx-auto mb-4 border-2 border-[#171717] shadow-[2px_2px_0px_#171717]">
              <MessageCircle size={28} className="fill-current" />
            </div>

            <h3 className="text-2xl font-black uppercase text-[#171717] mb-2">
              WHATSAPP OPENED!
            </h3>

            <p className="text-xs sm:text-sm font-medium text-[#171717]/80 mb-4 leading-relaxed">
              We pre-filled your custom specs in WhatsApp. Please send your high-resolution PNG artwork files in the chat so our production team can review and begin printing your order.
            </p>

            <div className="bg-white border-2 border-[#171717] p-3 text-left mb-6 text-xs font-mono">
              <p className="font-bold text-[#171717]">Quotation Summary:</p>
              <p>• Garment: {currentGarment.name}</p>
              <p>• Size: {selectedSize} · Color: {activeColor.name}</p>
              <p>• Estimated Price: ₹{currentGarment.price}</p>
            </div>

            <button
              type="button"
              onClick={() => setQuoteSuccessModal(false)}
              className="w-full bg-[#171717] text-white py-3 text-xs font-bold uppercase tracking-widest border-2 border-[#171717]"
            >
              GOT IT, RETURN TO STUDIO
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CustomizerPage;
