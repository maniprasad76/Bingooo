import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import {
  Check,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Type,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Move,
  Maximize2,
  Crosshair,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { SEO } from '../components/common/SEO';
import { getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';

interface ColorOption {
  id?: string;
  name: string;
  hex: string;
  textContrast: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  isActive?: boolean;
}

interface GarmentType {
  id: string;
  name: string;
  price: number;
  description: string;
  isActive?: boolean;
  colors?: ColorOption[];
}

const COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '' },
  { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '' },
  { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '' },
  { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '' },
];

const GARMENTS: GarmentType[] = [
  {
    id: 'tshirt',
    name: 'T-SHIRT',
    price: 999,
    description: '100% Combed Cotton Classic Crewneck',
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '' },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '' },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '' },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '' },
    ],
  },
  {
    id: 'oversized',
    name: 'OVERSIZED',
    price: 1299,
    description: '240 GSM Heavyweight Drop-Shoulder Fit',
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '' },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '' },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '' },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '' },
    ],
  },
  {
    id: 'hoodie',
    name: 'HOODIE',
    price: 2499,
    description: '350 GSM Brushed Fleece Pullover Hoodie',
    colors: [
      { id: 'black', name: 'Black', hex: '#171717', textContrast: '#FFFFFF', frontImageUrl: '' },
      { id: 'white', name: 'White', hex: '#FFFFFF', textContrast: '#171717', frontImageUrl: '' },
      { id: 'beige', name: 'Beige', hex: '#D8C8B1', textContrast: '#171717', frontImageUrl: '' },
      { id: 'red', name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF', frontImageUrl: '' },
    ],
  },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

// ─── 17 Curated Font Styles Across 3 Design Aesthetics ───────────────────────
interface FontOption {
  id: string;
  name: string;
  label: string;
  family: string;
  category: 'street' | 'luxury' | 'creative';
  preview: string;
}

const FONT_CATEGORIES = [
  { id: 'all', label: 'All Styles (17)' },
  { id: 'street', label: 'Street & Cyber' },
  { id: 'luxury', label: 'Luxury & Serif' },
  { id: 'creative', label: 'Creative & Retro' },
];

const FONT_OPTIONS: FontOption[] = [
  // Street & Cyber
  { id: 'manrope', name: 'Manrope', label: 'Clean Modern', family: "'Manrope', sans-serif", category: 'street', preview: 'BINGOOO' },
  { id: 'outfit', name: 'Outfit', label: 'High-End Street', family: "'Outfit', sans-serif", category: 'street', preview: 'STREET' },
  { id: 'anton', name: 'Anton', label: 'Ultra Heavy', family: "'Anton', sans-serif", category: 'street', preview: 'HEAVY' },
  { id: 'bebas', name: 'Bebas Neue', label: 'Bold Headline', family: "'Bebas Neue', sans-serif", category: 'street', preview: 'HEADLINE' },
  { id: 'space', name: 'Space Grotesk', label: 'Brutalist Tech', family: "'Space Grotesk', sans-serif", category: 'street', preview: 'BRUTAL' },
  { id: 'russo', name: 'Russo One', label: 'Impact Block', family: "'Russo One', sans-serif", category: 'street', preview: 'IMPACT' },
  { id: 'bungee', name: 'Bungee', label: 'Cyber Arcade', family: "'Bungee', cursive", category: 'street', preview: 'ARCADE' },

  // Luxury & Serif
  { id: 'playfair', name: 'Playfair', label: 'Vogue Editorial', family: "'Playfair Display', serif", category: 'luxury', preview: 'Atelier' },
  { id: 'cinzel', name: 'Cinzel', label: 'Royal Roman', family: "'Cinzel', serif", category: 'luxury', preview: 'IMPERIAL' },
  { id: 'prata', name: 'Prata', label: 'Haute Couture', family: "'Prata', serif", category: 'luxury', preview: 'Elegance' },
  { id: 'cormorant', name: 'Cormorant', label: 'Archival Serif', family: "'Cormorant Garamond', serif", category: 'luxury', preview: 'Archival' },
  { id: 'syne', name: 'Syne', label: 'Avant-Garde', family: "'Syne', sans-serif", category: 'luxury', preview: 'AVANT' },

  // Creative & Retro
  { id: 'marker', name: 'Permanent Marker', label: 'Graffiti Tag', family: "'Permanent Marker', cursive", category: 'creative', preview: 'GRAFFITI' },
  { id: 'caveat', name: 'Caveat', label: 'Artisan Script', family: "'Caveat', cursive", category: 'creative', preview: 'Handwritten' },
  { id: 'righteous', name: 'Righteous', label: 'Retro 80s', family: "'Righteous', cursive", category: 'creative', preview: 'SYNTHWAVE' },
  { id: 'mono', name: 'Plex Mono', label: 'Technical Spec', family: "'IBM Plex Mono', monospace", category: 'creative', preview: '240_GSM' },
  { id: 'majormono', name: 'Major Mono', label: 'Glitch Monospace', family: "'Major Mono Display', monospace", category: 'creative', preview: '001//BIO' },
];

const TEXT_COLORS = [
  { name: 'Auto', hex: '' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Charcoal', hex: '#171717' },
  { name: 'Cream', hex: '#F7EEDB' },
  { name: 'Sand', hex: '#D8C8B1' },
  { name: 'Brand Red', hex: '#E6321C' },
  { name: 'Gold', hex: '#B7791F' },
  { name: 'Royal Navy', hex: '#1D3557' },
];

const SPACING_OPTIONS = [
  { label: 'Normal', value: '0.02em' },
  { label: 'Wide', value: '0.12em' },
  { label: 'Ultra', value: '0.28em' },
];

export function CustomizerPage() {
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();

  // Garment Customizer State — Synced dynamically with Admin Panel
  const [garmentsList, setGarmentsList] = useState<GarmentType[]>(GARMENTS);
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>(GARMENTS[1]); // Default Oversized
  const [selectedColor, setSelectedColor] = useState<ColorOption>(GARMENTS[1].colors?.[0] || COLORS[0]); // Default Black

  // Dynamically load customizer configuration (garments, custom colors & uploaded mockups from Admin)
  useEffect(() => {
    fetch('/api/v1/customizations/studio/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const config = data?.data || data;
        if (config && Array.isArray(config.garments) && config.garments.length > 0) {
          setGarmentsList(config.garments);
          const currentG =
            config.garments.find((g: any) => g.id === selectedGarment.id) || config.garments[0];
          setSelectedGarment(currentG);
          if (currentG.colors && currentG.colors.length > 0) {
            const matched =
              currentG.colors.find((c: any) => c.name.toLowerCase() === selectedColor.name.toLowerCase()) ||
              currentG.colors[0];
            setSelectedColor(matched);
          }
        }
      })
      .catch(() => {});
  }, []);

  const getGarmentImageSrc = (garmentId: string, colorName: string, view: 'FRONT' | 'BACK' = 'FRONT'): string => {
    const garment = garmentsList.find((g) => g.id === garmentId);
    if (garment?.colors && garment.colors.length > 0) {
      const match = garment.colors.find(
        (c) =>
          c.name.toLowerCase() === colorName.toLowerCase() ||
          (c.id && c.id.toLowerCase() === colorName.toLowerCase())
      );
      if (match) {
        if (view === 'BACK' && match.backImageUrl) {
          return match.backImageUrl;
        }
        if (match.frontImageUrl) {
          return match.frontImageUrl;
        }
      }
    }
    return '';
  };

  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [viewSide, setViewSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [activePlacementTag, setActivePlacementTag] = useState<string>('CENTER');

  // Design Mode & Content State: Upload from Gallery or Custom Text
  const [designMode, setDesignMode] = useState<'upload' | 'text'>('upload');
  const [customText, setCustomText] = useState<string>('BINGOOO');
  const [selectedFont, setSelectedFont] = useState<string>('manrope');
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('all');

  const [isBold, setIsBold] = useState<boolean>(true);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>('');
  const [letterSpacing, setLetterSpacing] = useState<string>('0.05em');

  // Interactive Zoom & Scale State (from 0.4x to 2.5x)
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Artwork State (Uploaded by user from Gallery / Photos)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [isSizeModalOpen, setIsSizeModalOpen] = useState<boolean>(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);

  // Motion drag coordinates for free element placement anywhere
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const mockupRef = useRef<HTMLDivElement | null>(null);

  // Active Font Reference
  const activeFont = FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];

  // Filtered fonts
  const filteredFonts = FONT_OPTIONS.filter((f) =>
    selectedFontCategory === 'all' ? true : f.category === selectedFontCategory
  );

  // ── Two-Finger Touch Pinch Zoom Handlers with non-passive native support ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let startDistance = 0;
    let baseZoom = 1.0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        baseZoom = zoomScale;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && startDistance > 0) {
        // Prevent native browser viewport zoom on 2 fingers
        if (e.cancelable) e.preventDefault();

        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = (currentDist / startDistance) * baseZoom;
        const clampedScale = Math.min(2.5, Math.max(0.4, +scale.toFixed(2)));
        setZoomScale(clampedScale);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        startDistance = 0;
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [zoomScale]);

  // ── Mouse Wheel / Trackpad Zoom ──
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      setZoomScale((prev) => Math.min(2.5, Math.max(0.4, +(prev + delta).toFixed(2))));
    }
  };

  // Discrete micro-zoom actions for fast one-tap adjustment
  const handleZoomIn = () => {
    triggerHaptic('light');
    setZoomScale((z) => Math.min(2.5, +(z + 0.1).toFixed(1)));
  };

  const handleZoomOut = () => {
    triggerHaptic('light');
    setZoomScale((z) => Math.max(0.4, +(z - 0.1).toFixed(1)));
  };

  const handleZoomReset = () => {
    triggerHaptic('light');
    setZoomScale(1.0);
  };

  // ── Placement Snap Presets ──
  const applyPresetPlacement = (placement: 'CENTER' | 'LEFT_CHEST' | 'BACK' | 'LOWER_HEM') => {
    triggerHaptic('light');
    setActivePlacementTag(placement);

    if (placement === 'CENTER') {
      dragX.set(0);
      dragY.set(0);
      if (viewSide === 'BACK') setViewSide('FRONT');
    } else if (placement === 'LEFT_CHEST') {
      dragX.set(-48);
      dragY.set(-38);
      if (viewSide === 'BACK') setViewSide('FRONT');
    } else if (placement === 'BACK') {
      dragX.set(0);
      dragY.set(-20);
      setViewSide('BACK');
    } else if (placement === 'LOWER_HEM') {
      dragX.set(45);
      dragY.set(85);
      if (viewSide === 'BACK') setViewSide('FRONT');
    }
  };

  const handleResetPosition = () => {
    triggerHaptic('light');
    dragX.set(0);
    dragY.set(0);
    setActivePlacementTag('CENTER');
    toast({
      title: 'Centered on garment',
      description: 'You can drag it anywhere on the shirt anytime.',
      variant: 'default',
    });
  };

  // Handle File Upload from Device / Phone Gallery
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please pick an image under 15MB.',
        variant: 'danger',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setDesignMode('upload');
      triggerHaptic('medium');
      toast({
        title: 'Artwork loaded from gallery!',
        description: 'Drag anywhere to position • 2 fingers to zoom.',
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearArtwork = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({
      title: 'Artwork removed',
      description: 'Upload another design from gallery or type custom text.',
      variant: 'default',
    });
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Select a size',
        description: 'Please pick your desired size before adding to cart.',
        variant: 'danger',
      });
      return;
    }

    triggerHaptic('medium');
    const variantId = `custom-${selectedGarment.id}-${selectedColor.name.toLowerCase()}-${selectedSize.toLowerCase()}`;
    const customId = `custom-${Date.now()}`;

    addItem(variantId, 1, customId);
    setIsAddedFeedback(true);

    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 1800);
  };

  // Close size modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSizeModalOpen(false);
    };
    if (isSizeModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSizeModalOpen]);

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased pb-28 lg:pb-0">
      <SEO
        title="Custom Studio — BINGOOO"
        description="Design your custom T-shirt, oversized tee or hoodie with high-definition DTF printing. Upload whatever you want from your gallery or choose custom typography with 17 fonts."
        canonical="https://bingooo.in/customize"
      />

      {/* =======================================================
           PAGE INTRO
      ======================================================= */}
      <section className="text-center pt-[clamp(50px,7vw,90px)] px-5 pb-[45px]">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#171717] mb-2.5">
          BINGOOO CUSTOM STUDIO
        </div>

        <h1 className="my-2.5 sm:mb-[15px] text-[clamp(45px,7vw,88px)] leading-[0.88] font-extrabold tracking-[-0.07em] uppercase">
          CREATE.<br />
          CUSTOMIZE.<br />
          WEAR.
        </h1>

        <p className="max-w-[560px] mx-auto text-[#6f6a63] text-[13px] leading-[1.7]">
          Upload any design, photo, or logo from your gallery, or write custom text. Drag anywhere on the shirt, and use two fingers to zoom in or out.
        </p>
      </section>

      {/* =======================================================
           PROGRESS STEPS
      ======================================================= */}
      <div className="container-bingooo">
        <div className="max-w-[700px] mx-auto mb-[45px] flex justify-center items-center overflow-x-auto pb-1">
          <div className="flex items-center gap-[9px] text-[9px] font-bold uppercase whitespace-nowrap">
            <span className="w-7 h-7 rounded-full grid place-items-center bg-[#171717] text-white text-[10px]">
              01
            </span>
            CHOOSE
          </div>

          <div className="w-[30px] sm:w-[65px] h-[1px] mx-2 sm:mx-3 bg-[#ddd3c5]" />

          <div className={`flex items-center gap-[9px] text-[9px] font-bold uppercase whitespace-nowrap ${uploadedImage || customText ? 'text-[#171717]' : 'text-[#6f6a63]'}`}>
            <span className={`w-7 h-7 rounded-full grid place-items-center text-[10px] ${uploadedImage || customText ? 'bg-[#171717] text-white' : 'bg-[#ede0cc] text-[#171717]'}`}>
              02
            </span>
            CUSTOMIZE
          </div>

          <div className="w-[30px] sm:w-[65px] h-[1px] mx-2 sm:mx-3 bg-[#ddd3c5]" />

          <div className="flex items-center gap-[9px] text-[9px] font-bold uppercase text-[#6f6a63] whitespace-nowrap">
            <span className="w-7 h-7 rounded-full grid place-items-center bg-[#ede0cc] text-[#171717] text-[10px]">
              03
            </span>
            PREVIEW
          </div>
        </div>
      </div>

      {/* =======================================================
           CUSTOM BUILDER
      ======================================================= */}
      <section className="container-bingooo grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-[30px] items-start pb-[80px]">

        {/* ── PREVIEW PANEL WITH PINCH-TO-ZOOM & DRAG-ANYWHERE CANVAS ── */}
        <div className="flex flex-col gap-2.5">
          <div
            ref={canvasRef}
            onWheel={handleWheel}
            className="min-h-[360px] sm:min-h-[520px] lg:min-h-[690px] p-4 sm:p-[35px] bg-[#ede0cc] border border-[#ddd3c5] relative flex items-center justify-center overflow-hidden rounded-xl shadow-xs touch-pan-y select-none"
          >
            {/* Top Indicators */}
            <div className="absolute top-[16px] left-4 sm:left-5 flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold tracking-[0.16em] uppercase text-[#171717]">
                LIVE CANVAS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#171717] text-[#f7eedb] text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Move size={9} />
                Drag to place
              </span>
            </div>

            <div className="absolute top-[16px] right-4 sm:right-5 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewSide(viewSide === 'FRONT' ? 'BACK' : 'FRONT');
                }}
                className="px-2.5 py-1 rounded bg-[#FAF8F5]/90 border border-[#ddd3c5] text-[9px] font-bold tracking-[0.1em] text-[#171717] hover:bg-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>{viewSide} VIEW</span>
                <span>↻</span>
              </button>
            </div>

            {/* Floating Gesture Hint Pill */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-[#171717]/85 text-[#f7eedb] backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wide shadow-md border border-white/10 whitespace-nowrap">
                <span>✋ Drag anywhere</span>
                <span className="text-[#E6321C]">•</span>
                <span>✌️ 2 fingers zoom</span>
              </div>
            </div>

            {/* Floating On-Canvas Discrete Zoom Controls (Desktop / Tablet) */}
            <div className="hidden sm:flex absolute bottom-4 right-4 z-20 items-center bg-[#FAF8F5]/94 backdrop-blur-md rounded-lg shadow-md border border-[#ddd3c5] p-1 gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 0.4}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#ede0cc] text-[#171717] disabled:opacity-40 transition-colors cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-mono font-bold text-[#171717] px-1.5 min-w-[42px] text-center select-none">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 2.5}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#ede0cc] text-[#171717] disabled:opacity-40 transition-colors cursor-pointer"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <div className="h-4 w-[1px] bg-[#ddd3c5] mx-0.5" />
              <button
                type="button"
                onClick={handleZoomReset}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#ede0cc] text-[#6f6a63] hover:text-[#171717] transition-colors cursor-pointer"
                title="Reset Zoom (100%)"
                aria-label="Reset Zoom"
              >
                <RotateCcw size={12} />
              </button>
              <button
                type="button"
                onClick={handleResetPosition}
                className="px-2 h-7 rounded text-[9px] font-bold text-[#171717] hover:bg-[#ede0cc] transition-colors cursor-pointer flex items-center gap-1"
                title="Center Design"
              >
                <Crosshair size={11} />
                <span>Center</span>
              </button>
            </div>

            {/* Real-Life Photorealistic Apparel Mockup Container */}
            <div
              ref={mockupRef}
              className="relative w-[min(90%,500px)] aspect-square flex items-center justify-center select-none"
            >
              {/* Real-Life Studio Garment Photo Mockup OR Clean Vector Silhouette */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {getGarmentImageSrc(selectedGarment.id, selectedColor.name, viewSide) ? (
                  <img
                    src={getGarmentImageSrc(selectedGarment.id, selectedColor.name, viewSide)}
                    alt={`Real-life ${selectedColor.name} ${selectedGarment.name} Mockup`}
                    className={`w-full h-full max-h-[500px] object-contain select-none transition-all duration-300 drop-shadow-[0_16px_36px_rgba(0,0,0,0.12)] ${
                      viewSide === 'BACK' && !selectedColor.backImageUrl ? 'scale-x-[-1]' : ''
                    }`}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full max-h-[500px]" />
                )}
                {/* Authentic back neckline detail when viewed from back */}
                {viewSide === 'BACK' && getGarmentImageSrc(selectedGarment.id, selectedColor.name, viewSide) && (
                  <div className="absolute top-[16%] inset-x-0 mx-auto w-16 h-4 rounded-b-full bg-black/10 border-b border-black/25 flex items-center justify-center pointer-events-none z-0">
                    <span className="text-[7px] font-mono font-bold text-black/60 tracking-wider">
                      {selectedGarment.id === 'hoodie' ? '350 GSM' : '240 GSM'}
                    </span>
                  </div>
                )}
              </div>

              {/* ── DRAGGABLE & PINCH-ZOOMABLE DESIGN ELEMENT ── */}
              <motion.div
                drag
                dragConstraints={mockupRef}
                dragElastic={0.06}
                dragMomentum={false}
                onDragStart={() => {
                  triggerHaptic('light');
                  setActivePlacementTag('CUSTOM');
                }}
                style={{
                  x: dragX,
                  y: dragY,
                  scale: zoomScale,
                }}
                className="absolute z-10 flex flex-col justify-center items-center text-center origin-center cursor-grab active:cursor-grabbing group p-2 touch-none select-none"
              >
                {/* Subtle hover/drag guide border */}
                <div className="absolute -inset-1.5 border border-dashed border-[#E6321C]/50 rounded-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E6321C] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs">
                    Drag to Move
                  </div>
                </div>

                {uploadedImage ? (
                  <div className="relative flex items-center justify-center">
                    <img
                      src={uploadedImage}
                      alt="Uploaded artwork from gallery"
                      className="max-w-[220px] max-h-[170px] sm:max-h-[210px] object-contain drop-shadow-md select-none pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearArtwork();
                      }}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-[#171717] hover:bg-[#E6321C] text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer"
                      title="Remove design"
                    >
                      ×
                    </button>
                  </div>
                ) : designMode === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 rounded-lg border-2 border-dashed border-[#171717]/40 bg-white/50 hover:bg-white/80 transition-colors cursor-pointer flex flex-col items-center justify-center text-center shadow-xs select-none backdrop-blur-xs"
                  >
                    <Upload size={18} className="text-[#E6321C] mb-1" />
                    <span className="text-[10px] font-bold uppercase text-[#171717]">
                      Choose From Gallery
                    </span>
                    <span className="text-[8px] text-[#6f6a63]">
                      Tap to upload artwork
                    </span>
                  </div>
                ) : (
                  <div
                    className="px-3 py-1 select-none leading-tight break-words text-center"
                    style={{
                      fontFamily: activeFont.family,
                      fontWeight: isBold ? 800 : 500,
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textTransform: isUppercase ? 'uppercase' : 'none',
                      letterSpacing: letterSpacing,
                      color: textColor || selectedColor.textContrast,
                      fontSize: 'clamp(20px, 2.8vw, 32px)',
                      textShadow: (textColor === '#FFFFFF' || (!textColor && selectedColor.textContrast === '#FFFFFF'))
                        ? '0 1px 3px rgba(0,0,0,0.35)'
                        : undefined,
                    }}
                  >
                    {customText || 'BINGOOO'}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Mobile Quick Action Strip (Easy 1-thumb touch controls on phone) */}
          <div className="sm:hidden flex items-center justify-between gap-1.5 p-2 bg-[#FAF8F5] border border-[#ddd3c5] rounded-lg shadow-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 0.4}
                className="w-8 h-8 rounded border border-[#ddd3c5] bg-white flex items-center justify-center text-[#171717] active:bg-[#ede0cc] disabled:opacity-40 cursor-pointer shadow-xs"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="font-mono text-[10px] font-bold text-center min-w-[38px] select-none">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 2.5}
                className="w-8 h-8 rounded border border-[#ddd3c5] bg-white flex items-center justify-center text-[#171717] active:bg-[#ede0cc] disabled:opacity-40 cursor-pointer shadow-xs"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="h-8 px-2 rounded border border-[#ddd3c5] bg-white text-[9px] font-bold text-[#6f6a63] active:text-[#171717] cursor-pointer shadow-xs"
              >
                100%
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetPosition}
                className="h-8 px-2 rounded border border-[#ddd3c5] bg-white text-[9px] font-bold text-[#171717] flex items-center gap-1 active:bg-[#ede0cc] cursor-pointer shadow-xs"
                title="Center Design"
              >
                <Crosshair size={11} />
                <span>Center</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewSide(viewSide === 'FRONT' ? 'BACK' : 'FRONT');
                }}
                className="h-8 px-2.5 rounded bg-[#171717] text-white text-[9px] font-bold flex items-center gap-1 active:bg-black cursor-pointer shadow-xs"
              >
                <span>{viewSide === 'FRONT' ? 'Back ↻' : 'Front ↻'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTROLS PANEL ── */}
        <aside className="bg-white border border-[#ddd3c5] rounded-[12px] p-5 sm:p-[25px] shadow-xs">

          {/* 01 / Choose Product */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>01 / Choose Product</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {garmentsList.map((garment) => (
                <button
                  key={garment.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedGarment(garment);
                    const garmentColors = garment.colors && garment.colors.length > 0 ? garment.colors : COLORS;
                    const matched =
                      garmentColors.find((c) => c.name.toLowerCase() === selectedColor.name.toLowerCase()) ||
                      garmentColors[0];
                    if (matched) setSelectedColor(matched);
                  }}
                  className={`border bg-[#f7eedb] p-2 sm:p-2.5 text-center transition-all cursor-pointer ${
                    selectedGarment.id === garment.id
                      ? 'border-2 border-[#171717]'
                      : 'border-[#ddd3c5] hover:border-[#171717]'
                  }`}
                >
                  <div className="h-[70px] sm:h-[90px] flex justify-center items-center p-1">
                    {getGarmentImageSrc(garment.id, selectedColor.name) ? (
                      <img
                        src={getGarmentImageSrc(garment.id, selectedColor.name)}
                        alt={garment.name}
                        className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-200"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.05em] uppercase mt-1">
                    {garment.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 02 / Design & Artwork (Upload From Gallery or Custom Text) */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-3 text-[11px] font-bold uppercase">
              <span>02 / Design & Artwork</span>
              <span className="text-[#e6321c] font-mono text-[10px]">
                {designMode === 'upload' ? (uploadedImage ? 'GALLERY ARTWORK LOADED' : 'UPLOAD FROM GALLERY') : 'CUSTOM TEXT'}
              </span>
            </div>

            {/* Design Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#ede0cc] rounded-lg mb-4 text-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setDesignMode('upload');
                }}
                className={`py-2 px-2 text-[10px] font-bold uppercase rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  designMode === 'upload'
                    ? 'bg-white text-[#171717] shadow-xs'
                    : 'text-[#6f6a63] hover:text-[#171717]'
                }`}
              >
                <Upload size={13} />
                <span>Upload From Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setDesignMode('text');
                }}
                className={`py-2 px-2 text-[10px] font-bold uppercase rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  designMode === 'text'
                    ? 'bg-white text-[#171717] shadow-xs'
                    : 'text-[#6f6a63] hover:text-[#171717]'
                }`}
              >
                <Type size={13} />
                <span>Custom Text / Font</span>
              </button>
            </div>

            {/* ── SUB-PANEL: UPLOAD FROM GALLERY ── */}
            {designMode === 'upload' && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                    uploadedImage
                      ? 'border-[#171717] bg-[#FAF8F5]'
                      : 'border-[#bdb3a4] bg-[#faf7f0] hover:border-[#171717] hover:bg-white'
                  }`}
                >
                  {uploadedImage ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-lg border border-[#ddd3c5] bg-white p-1 mb-2.5 flex items-center justify-center overflow-hidden shadow-xs">
                        <img
                          src={uploadedImage}
                          alt="Uploaded artwork"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[#171717] uppercase tracking-wide mb-1">
                        Artwork Placed on Garment
                      </span>
                      <p className="text-[9px] text-[#6f6a63] max-w-[280px] mb-3">
                        Drag anywhere on the shirt to adjust placement • Pinch with 2 fingers to zoom
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-3.5 py-1.5 rounded bg-[#171717] text-white text-[9px] font-bold uppercase hover:bg-black transition-colors cursor-pointer shadow-xs"
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearArtwork();
                          }}
                          className="px-3.5 py-1.5 rounded border border-[#ddd3c5] bg-white text-[#171717] text-[9px] font-bold uppercase hover:border-[#E6321C] hover:text-[#E6321C] transition-colors cursor-pointer shadow-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#ede0cc] flex items-center justify-center text-[#171717] mb-2.5">
                        <ImageIcon size={22} className="text-[#E6321C]" />
                      </div>
                      <strong className="block text-[12px] font-extrabold uppercase tracking-wide text-[#171717] mb-1">
                        Upload Your Own Design
                      </strong>
                      <p className="text-[#6f6a63] text-[10px] max-w-[300px] mb-3 leading-relaxed">
                        Pick any artwork, photo, anime graphic, or logo from your phone gallery or computer.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-5 py-2.5 rounded-lg bg-[#E6321C] text-white text-[10px] font-bold uppercase hover:bg-[#b91f12] active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Choose From Gallery / Photos</span>
                      </button>
                      <span className="text-[8px] font-mono text-[#8a847b] mt-2.5">
                        PNG (transparent recommended), JPG, WEBP, SVG • Max 15MB
                      </span>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="p-2.5 bg-[#f7eedb] rounded-lg border border-[#ddd3c5] text-[9px] text-[#6f6a63] flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span><strong>High-Definition DTF Printing:</strong> Your artwork will be printed with vivid, durable direct-to-film colors directly onto the garment.</span>
                </div>
              </div>
            )}

            {/* ── SUB-PANEL: TYPE CUSTOM TEXT & EXPANDED 17 FONT STYLES ── */}
            {designMode === 'text' && (
              <div className="space-y-4">
                {/* Text Input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6f6a63] mb-1.5">
                    Your Text / Slogan
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(isUppercase ? e.target.value.toUpperCase() : e.target.value)}
                    placeholder="E.G. BINGOOO"
                    maxLength={24}
                    className="w-full h-9 px-3 bg-[#faf7f0] border border-[#ddd3c5] rounded-md text-xs font-bold outline-none focus:border-[#171717] transition-colors"
                  />
                </div>

                {/* Font Category Filter Pills */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6f6a63]">
                      Select Font Style
                    </label>
                    <span className="text-[9px] font-mono text-[#E6321C]">
                      {filteredFonts.length} FONTS
                    </span>
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1.5 mb-2 scrollbar-none">
                    {FONT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedFontCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                          selectedFontCategory === cat.id
                            ? 'bg-[#171717] text-white'
                            : 'bg-[#ede0cc] text-[#6f6a63] hover:text-[#171717]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Font Style Grid */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {filteredFonts.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedFont(font.id);
                        }}
                        className={`p-2 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedFont === font.id
                            ? 'border-2 border-[#171717] bg-[#f7eedb]'
                            : 'border-[#ddd3c5] bg-white hover:border-[#171717]'
                        }`}
                      >
                        <span
                          className="text-sm truncate select-none block"
                          style={{ fontFamily: font.family }}
                        >
                          {font.preview}
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#171717]">
                            {font.name}
                          </span>
                          <span className="text-[8px] text-[#6f6a63]">
                            {font.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Controls (Bold, Italic, All-Caps, Spacing) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-[#6f6a63] mb-1">Style</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setIsBold(!isBold)}
                        className={`w-8 h-7 rounded text-xs font-black border transition-all cursor-pointer flex items-center justify-center ${
                          isBold ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#171717]'
                        }`}
                        title="Bold"
                      >
                        <Bold size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsItalic(!isItalic)}
                        className={`w-8 h-7 rounded text-xs font-serif italic border transition-all cursor-pointer flex items-center justify-center ${
                          isItalic ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#171717]'
                        }`}
                        title="Italic"
                      >
                        <Italic size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isUppercase;
                          setIsUppercase(next);
                          if (next) setCustomText((t) => t.toUpperCase());
                        }}
                        className={`px-2 h-7 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                          isUppercase ? 'bg-[#171717] text-white border-[#171717]' : 'border-[#ddd3c5] text-[#171717]'
                        }`}
                        title="Uppercase"
                      >
                        AA
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold uppercase text-[#6f6a63] mb-1">Letter Spacing</span>
                    <div className="flex gap-1">
                      {SPACING_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setLetterSpacing(opt.value)}
                          className={`flex-1 h-7 rounded text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                            letterSpacing === opt.value
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'border-[#ddd3c5] text-[#6f6a63]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div>
                  <span className="block text-[9px] font-bold uppercase text-[#6f6a63] mb-1.5">Print Color</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TEXT_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setTextColor(col.hex);
                        }}
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all cursor-pointer flex items-center gap-1 ${
                          textColor === col.hex
                            ? 'border-2 border-[#171717] bg-[#f7eedb] text-[#171717]'
                            : 'border-[#ddd3c5] bg-white text-[#6f6a63]'
                        }`}
                      >
                        {col.hex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: col.hex }}
                          />
                        )}
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 03 / Garment Color */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>03 / Garment Color</span>
              <span className="text-[#6f6a63] text-[10px] font-normal">{selectedColor.name}</span>
            </div>

            <div className="flex flex-wrap gap-[10px]">
              {(selectedGarment.colors && selectedGarment.colors.length > 0 ? selectedGarment.colors : COLORS).map((color) => (
                <button
                  key={color.id || color.name}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedColor(color);
                  }}
                  className={`w-8 h-8 rounded-full border-2 border-transparent transition-all cursor-pointer ${
                    selectedColor.name.toLowerCase() === color.name.toLowerCase()
                      ? 'shadow-[0_0_0_2px_#f7eedb,0_0_0_3px_#171717]'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    border: color.hex.toLowerCase() === '#ffffff' ? '1px solid #cfc7bb' : 'none',
                  }}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {/* 04 / Size */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>04 / Size</span>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(true)}
                className="text-[9px] font-bold underline underline-offset-2 hover:text-[#e6321c] transition-colors"
              >
                SIZE GUIDE
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedSize(size);
                  }}
                  className={`min-h-[42px] border text-[10px] font-semibold transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'border-[#ddd3c5] bg-transparent hover:border-[#171717]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 05 / Free Placement & Quick Snaps */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[10px] text-[11px] font-bold uppercase">
              <span>05 / Garment Placement</span>
              <span className="text-[9px] font-mono text-[#E6321C]">
                {activePlacementTag}
              </span>
            </div>

            <p className="text-[10px] text-[#6f6a63] mb-2.5">
              Drag directly on the shirt to place anywhere, or pick a quick snap:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetPlacement('CENTER')}
                className={`min-h-[36px] px-2 border text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activePlacementTag === 'CENTER'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'border-[#ddd3c5] bg-white hover:border-[#171717]'
                }`}
              >
                <Crosshair size={11} />
                <span>Center</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetPlacement('LEFT_CHEST')}
                className={`min-h-[36px] px-2 border text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activePlacementTag === 'LEFT_CHEST'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'border-[#ddd3c5] bg-white hover:border-[#171717]'
                }`}
              >
                <Move size={11} />
                <span>Left Chest</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetPlacement('BACK')}
                className={`min-h-[36px] px-2 border text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activePlacementTag === 'BACK'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'border-[#ddd3c5] bg-white hover:border-[#171717]'
                }`}
              >
                <Maximize2 size={11} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetPlacement('LOWER_HEM')}
                className={`min-h-[36px] px-2 border text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activePlacementTag === 'LOWER_HEM'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'border-[#ddd3c5] bg-white hover:border-[#171717]'
                }`}
              >
                <span>Lower Hem</span>
              </button>
            </div>
          </div>

          {/* Price Box */}
          <div className="pb-[25px] mb-[25px] border-b-0">
            <div className="p-[15px] bg-[#f7eedb] flex justify-between items-center">
              <div>
                <div className="text-[10px] font-semibold uppercase">
                  YOUR CUSTOM {selectedGarment.name}
                </div>
                <div className="text-[#6f6a63] text-[9px] mt-1">
                  Includes HD DTF custom printing
                </div>
              </div>
              <div className="text-[21px] font-extrabold">
                ₹{selectedGarment.price.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full min-h-[56px] border-0 rounded-[10px] text-white text-[12px] font-extrabold uppercase tracking-[0.06em] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 group ${
              isAddedFeedback
                ? 'bg-[#238636] shadow-[0_6px_20px_rgba(35,134,54,0.35)]'
                : 'bg-[#E6321C] hover:bg-[#B91F12] shadow-[0_6px_22px_rgba(230,50,28,0.35)] hover:shadow-[0_8px_28px_rgba(230,50,28,0.45)]'
            }`}
          >
            {isAddedFeedback ? (
              <>
                <Check className="w-5 h-5" strokeWidth={2.5} />
                <span>ADDED TO CART</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>ADD CUSTOM DESIGN TO CART</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Bulk Orders WhatsApp Typography Callout */}
          <div className="mt-4 pt-4 border-t border-[#ddd3c5] text-center">
            <p className="text-[10px] font-semibold text-[#6f6a63] uppercase tracking-wider mb-1">
              Ordering for college, team or brand?
            </p>
            <a
              href={getWhatsAppUrl('Hi Bingooo, I would like to inquire about a bulk/wholesale order for custom apparel.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-extrabold uppercase tracking-wide text-[#171717] hover:text-[#e6321c] inline-flex items-center gap-1.5 transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Need Bulk Quantities? Chat on WhatsApp →</span>
            </a>
          </div>
        </aside>
      </section>

      {/* =======================================================
           HOW IT WORKS SECTION
      ======================================================= */}
      <section className="py-20 bg-[#171717] text-white">
        <div className="container-bingooo">
          <div className="text-center mb-[45px]">
            <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6f6a63] mb-2.5">
              HOW IT WORKS
            </div>
            <h2 className="mt-2.5 text-[clamp(36px,5vw,60px)] leading-[0.9] font-extrabold tracking-[-0.065em] uppercase text-white">
              YOUR IDEA.<br />
              YOUR CLOTHES.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#333333]">
            <article className="p-[35px] bg-[#171717]">
              <div className="text-[#e6321c] font-mono text-[12px] font-bold">
                01
              </div>
              <h3 className="my-4 mb-2 text-[17px] font-bold text-white uppercase">
                Choose your canvas.
              </h3>
              <p className="m-0 text-[#aaaaaa] text-[11px] leading-[1.7]">
                Pick your T-shirt, oversized tee or hoodie and choose your preferred color.
              </p>
            </article>

            <article className="p-[35px] bg-[#171717]">
              <div className="text-[#e6321c] font-mono text-[12px] font-bold">
                02
              </div>
              <h3 className="my-4 mb-2 text-[17px] font-bold text-white uppercase">
                Upload from Gallery.
              </h3>
              <p className="m-0 text-[#aaaaaa] text-[11px] leading-[1.7]">
                Upload any artwork, photo, or logo from your phone or device. Drag and pinch to size it.
              </p>
            </article>

            <article className="p-[35px] bg-[#171717]">
              <div className="text-[#e6321c] font-mono text-[12px] font-bold">
                03
              </div>
              <h3 className="my-4 mb-2 text-[17px] font-bold text-white uppercase">
                Preview & wear.
              </h3>
              <p className="m-0 text-[#aaaaaa] text-[11px] leading-[1.7]">
                Check your custom piece, select your size, and add to cart for HD DTF printing.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =======================================================
           SIZE CHART MODAL
      ======================================================= */}
      {isSizeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsSizeModalOpen(false)}
        >
          <div
            className="w-[min(760px,100%)] max-h-[90vh] overflow-y-auto bg-[#f7eedb] p-[30px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-[25px]">
              <h2 className="m-0 text-[28px] font-extrabold tracking-[-0.04em] uppercase">
                Size Chart
              </h2>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="w-[35px] h-[35px] border border-[#ddd3c5] bg-transparent text-[18px] flex items-center justify-center hover:bg-[#171717] hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] border-collapse bg-[#f7eedb]">
                <thead>
                  <tr>
                    <th className="p-3.5 border border-[#ddd3c5] bg-[#171717] text-white text-left text-[11px] font-bold uppercase">
                      Size
                    </th>
                    <th className="p-3.5 border border-[#ddd3c5] bg-[#171717] text-white text-left text-[11px] font-bold uppercase">
                      Chest
                    </th>
                    <th className="p-3.5 border border-[#ddd3c5] bg-[#171717] text-white text-left text-[11px] font-bold uppercase">
                      Shoulder
                    </th>
                    <th className="p-3.5 border border-[#ddd3c5] bg-[#171717] text-white text-left text-[11px] font-bold uppercase">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px] font-semibold">XS</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">96 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">42 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">66 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px] font-semibold">S</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">102 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">44 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">68 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px] font-semibold">M</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">108 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">46 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">70 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px] font-semibold">L</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">114 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">48 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">72 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px] font-semibold">XL</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">120 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">50 cm</td>
                    <td className="p-3.5 border border-[#ddd3c5] text-[11px]">74 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
           MOBILE STICKY ACTION BAR (1-Tap Checkout on Mobile)
      ======================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/96 backdrop-blur-md border-t border-[#ddd3c5] p-3 px-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#6f6a63]">
            {selectedGarment.name} • {selectedSize} • {selectedColor.name}
          </div>
          <div className="text-[19px] font-extrabold text-[#171717] leading-none mt-1">
            ₹{selectedGarment.price.toLocaleString('en-IN')}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="min-h-[46px] px-5 rounded-lg bg-[#e6321c] text-white text-[11px] font-bold uppercase hover:bg-[#b91f12] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {isAddedFeedback ? (
            <>
              <span>ADDED!</span>
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>ADD TO CART</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </main>
  );
}

export default CustomizerPage;
