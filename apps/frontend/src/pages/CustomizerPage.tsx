import { useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Shirt,
  Sparkles,
  LoaderCircle,
  Bookmark,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';
import { useAuthStore } from '../store/auth';
import {
  GarmentCanvas,
  type ArtworkLayer,
  type TypographyLayer,
} from '../components/customizer/GarmentCanvas';
import {
  DesignControls,
  PRESET_ARTWORKS,
  type GarmentProduct,
  type ColorOption,
} from '../components/customizer/DesignControls';

const FALLBACK_COLORS: ColorOption[] = [
  { name: 'Obsidian Black', hex: '#111111' },
  { name: 'Off-White Cream', hex: '#FAF6EE' },
  { name: 'Vintage Sand', hex: '#D4C4A8' },
  { name: 'Washed Charcoal', hex: '#333333' },
  { name: 'Oatmeal Beige', hex: '#E8DCC8' },
];

const FALLBACK_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

interface SideDesign {
  artwork: ArtworkLayer | null;
  typography: TypographyLayer | null;
}

export function CustomizerPage() {
  const shouldReduceMotion = useReducedMotion();
  const { productSlug } = useParams<{ productSlug?: string }>();
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  // 1. Fetch customizable catalog products
  const { data: customizableData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'customizable'],
    queryFn: () => api.get<{ data: any[] }>('/products', { customizable: 'true', limit: 20 }),
  });

  const products: GarmentProduct[] = useMemo(() => {
    const raw = customizableData?.data ?? [];
    if (raw.length > 0) return raw;
    return [
      {
        id: 'prod-custom-tee',
        title: '240 GSM Heavyweight Oversized Tee',
        slug: 'classic-oversized-tee',
        base_price: 1299,
        description: '240 GSM 100% Combed Cotton with dense 1.25" ribbed collar & drop shoulders.',
        variants: [
          { id: 'var-tee-black-m', color: 'Obsidian Black', colorHex: '#111111', size: 'M' },
          { id: 'var-tee-black-l', color: 'Obsidian Black', colorHex: '#111111', size: 'L' },
          { id: 'var-tee-cream-m', color: 'Off-White Cream', colorHex: '#FAF6EE', size: 'M' },
          { id: 'var-tee-sand-m', color: 'Vintage Sand', colorHex: '#D4C4A8', size: 'M' },
        ],
      },
      {
        id: 'prod-custom-hoodie',
        title: '350 GSM Essential Pullover Hoodie',
        slug: 'essential-pullover-hoodie',
        base_price: 2499,
        description: '350 GSM Heavyweight French Terry Fleece with kangaroo pocket.',
        variants: [
          { id: 'var-hoodie-black-l', color: 'Obsidian Black', colorHex: '#111111', size: 'L' },
          { id: 'var-hoodie-charcoal-l', color: 'Washed Charcoal', colorHex: '#333333', size: 'L' },
          { id: 'var-hoodie-sand-l', color: 'Vintage Sand', colorHex: '#D4C4A8', size: 'L' },
        ],
      },
    ];
  }, [customizableData]);

  // Selected product
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const currentProduct = useMemo(() => {
    if (products.length === 0) return null;
    if (productSlug) {
      const match = products.find((p) => p.slug === productSlug);
      if (match) return match;
    }
    if (selectedProductId) {
      const match = products.find((p) => p.id === selectedProductId);
      if (match) return match;
    }
    return products[0];
  }, [products, productSlug, selectedProductId]);

  const productType: 'tee' | 'hoodie' =
    currentProduct?.slug.includes('hoodie') || currentProduct?.title.toLowerCase().includes('hoodie')
      ? 'hoodie'
      : 'tee';

  // Available colors
  const availableColors: ColorOption[] = useMemo(() => {
    if (!currentProduct?.variants || currentProduct.variants.length === 0) {
      return FALLBACK_COLORS;
    }
    const map = new Map<string, ColorOption>();
    currentProduct.variants.forEach((v: any) => {
      if (v.color && !map.has(v.color.toLowerCase())) {
        map.set(v.color.toLowerCase(), {
          name: v.color,
          hex: v.colorHex || (v.color.toLowerCase().includes('cream') ? '#FAF6EE' : '#111111'),
        });
      }
    });
    return map.size > 0 ? Array.from(map.values()) : FALLBACK_COLORS;
  }, [currentProduct]);

  // Available sizes
  const availableSizes: string[] = useMemo(() => {
    if (!currentProduct?.variants || currentProduct.variants.length === 0) {
      return FALLBACK_SIZES;
    }
    const set = new Set<string>();
    currentProduct.variants.forEach((v: any) => {
      if (v.size) set.add(v.size.toUpperCase());
    });
    return set.size > 0 ? Array.from(set) : FALLBACK_SIZES;
  }, [currentProduct]);

  const [selectedColor, setSelectedColor] = useState<ColorOption>(availableColors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'L');
  const [quantity, setQuantity] = useState(1);

  // Canvas View & Options
  const [view, setView] = useState<'front' | 'back'>('front');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedLayer, setSelectedLayer] = useState<'artwork' | 'text' | null>(null);

  // Independent Front & Back designs
  const [frontDesign, setFrontDesign] = useState<SideDesign>({
    artwork: {
      url: PRESET_ARTWORKS[0].dataUrl,
      scale: 1,
      rotation: 0,
      x: 0,
      y: -25,
    },
    typography: null,
  });

  const [backDesign, setBackDesign] = useState<SideDesign>({
    artwork: null,
    typography: null,
  });

  const [customerNotes, setCustomerNotes] = useState('');
  const [isSavingDesign, setIsSavingDesign] = useState(false);

  // Active side accessor
  const activeSideDesign = view === 'front' ? frontDesign : backDesign;
  const setActiveSideDesign = (updater: (prev: SideDesign) => SideDesign) => {
    if (view === 'front') {
      setFrontDesign(updater);
    } else {
      setBackDesign(updater);
    }
  };

  // Layer manipulations
  const handleUpdateArtwork = (updates: Partial<ArtworkLayer>) => {
    setActiveSideDesign((prev) => ({
      ...prev,
      artwork: prev.artwork
        ? { ...prev.artwork, ...updates }
        : ({ url: null, scale: 1, rotation: 0, x: 0, y: 0, ...updates } as ArtworkLayer),
    }));
  };

  const handleRemoveArtwork = () => {
    setActiveSideDesign((prev) => ({ ...prev, artwork: null }));
    if (selectedLayer === 'artwork') setSelectedLayer(null);
    toast({ title: 'Artwork removed', variant: 'default' });
  };

  const handleUploadFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum upload file size is 25MB.',
        variant: 'danger',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleUpdateArtwork({
        url: reader.result as string,
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
      });
      setSelectedLayer('artwork');
      toast({
        title: 'Artwork uploaded successfully!',
        description: `Placed on ${view.toUpperCase()} print area.`,
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateTypography = (updates: Partial<TypographyLayer>) => {
    setActiveSideDesign((prev) => ({
      ...prev,
      typography: prev.typography
        ? { ...prev.typography, ...updates }
        : ({
            text: '',
            font: 'Manrope, sans-serif',
            color: '#171717',
            size: 22,
            isBold: false,
            isItalic: false,
            isUppercase: true,
            textAlign: 'center',
            x: 0,
            y: 50,
            ...updates,
          } as TypographyLayer),
    }));
  };

  const handleRemoveTypography = () => {
    setActiveSideDesign((prev) => ({ ...prev, typography: null }));
    if (selectedLayer === 'text') setSelectedLayer(null);
    toast({ title: 'Text cleared', variant: 'default' });
  };

  const handleResetPosition = () => {
    handleUpdateArtwork({ x: 0, y: 0, scale: 1, rotation: 0 });
    handleUpdateTypography({ x: 0, y: 50 });
    toast({ title: 'Aligned to center', variant: 'default' });
  };

  const handleSnapPosition = (position: 'center' | 'pocket' | 'upper') => {
    if (position === 'center') {
      handleUpdateArtwork({ x: 0, y: 0, scale: 1 });
    } else if (position === 'pocket') {
      handleUpdateArtwork({ x: -45, y: -45, scale: 0.65 });
    } else if (position === 'upper') {
      handleUpdateArtwork({ x: 0, y: -55 });
    }
  };

  // Pricing calculations
  const hasFrontArtwork = Boolean(frontDesign.artwork?.url || frontDesign.typography?.text.trim());
  const hasBackArtwork = Boolean(backDesign.artwork?.url || backDesign.typography?.text.trim());
  const isDualSided = hasFrontArtwork && hasBackArtwork;
  const dualSideAddon = isDualSided ? 199 : 0;
  const basePrice = currentProduct?.base_price || 1299;
  const unitPrice = basePrice + dualSideAddon;
  const totalPrice = unitPrice * quantity;

  // Build customization payload
  const buildCustomizationPayload = () => {
    return {
      productId: currentProduct?.id,
      productSlug: currentProduct?.slug,
      userId: userId || undefined,
      customerNotes: customerNotes.trim() || undefined,
      designJson: {
        garment: {
          id: currentProduct?.id,
          title: currentProduct?.title,
          gsm: productType === 'hoodie' ? 350 : 240,
          color: selectedColor.name,
          colorHex: selectedColor.hex,
          size: selectedSize,
        },
        front: {
          hasDesign: hasFrontArtwork,
          artwork: frontDesign.artwork,
          typography: frontDesign.typography,
        },
        back: {
          hasDesign: hasBackArtwork,
          artwork: backDesign.artwork,
          typography: backDesign.typography,
        },
        isDualSided,
        totalUnitCost: unitPrice,
      },
      previewKey: frontDesign.artwork?.url || backDesign.artwork?.url || undefined,
      printSpec: {
        method: 'DTG (Direct-to-Garment)',
        placement: isDualSided ? 'Front & Back Dual Print' : hasBackArtwork ? 'Back Print Only' : 'Front Chest Print',
        resolutionDPI: 300,
        garmentGSM: productType === 'hoodie' ? 350 : 240,
        fabric: '100% Bio-Washed Combed Cotton',
      },
    };
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSavingDesign(true);
    try {
      const payload = buildCustomizationPayload();
      await api.post('/customizations', payload);
      toast({
        title: '240 GSM Design Draft Saved!',
        description: 'You can review and re-open this in My Account > Custom Designs.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Could not save draft',
        description: err.message || 'Please try again.',
        variant: 'danger',
      });
    } finally {
      setIsSavingDesign(false);
    }
  };

  // Add to Bag
  const handleAddToCart = async () => {
    if (!currentProduct) {
      toast({ title: 'Please select a garment', variant: 'danger' });
      return;
    }

    const variant =
      currentProduct.variants?.find((v: any) => {
        const matchColor = !v.color || v.color.toLowerCase() === selectedColor.name.toLowerCase();
        const matchSize = !v.size || v.size.toUpperCase() === selectedSize.toUpperCase();
        return matchColor && matchSize;
      }) || currentProduct.variants?.[0];

    if (!variant) {
      toast({
        title: 'Variant unavailable',
        description: 'Selected color and size combination is out of stock.',
        variant: 'danger',
      });
      return;
    }

    setIsSavingDesign(true);

    try {
      const payload = buildCustomizationPayload();
      const savedCustomization = await api.post<any>('/customizations', payload);

      addItem(variant.id, quantity, savedCustomization.id);

      toast({
        title: 'Added to your bag!',
        description: `240 GSM Heavyweight Tee (${selectedColor.name}, ${selectedSize})`,
        variant: 'success',
      });

      navigate('/cart');
    } catch (err: any) {
      toast({
        title: 'Could not add to bag',
        description: err.message || 'Please try again.',
        variant: 'danger',
      });
    } finally {
      setIsSavingDesign(false);
    }
  };

  if (isProductsLoading && products.length === 0) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 bg-[#FAF8F5] text-[#6F6A63]">
        <LoaderCircle size={32} className="animate-spin text-[#E6321C]" />
        <p className="font-sans text-sm font-semibold text-[#171717]">
          Loading 240 GSM Atelier Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen pb-28 sm:pb-32">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* ─── Breadcrumbs & Header Strip ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDD3C5]">
          <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63]">
            <Link to="/" className="hover:text-[#E6321C]">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-[#E6321C]">Catalog</Link>
            <ChevronRight size={12} />
            <span className="text-[#171717] font-semibold">240 GSM Atelier Customizer</span>
          </nav>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
              <Flame size={13} className="text-[#E6321C]" />
              240 GSM HEAVYWEIGHT BESPOKE
            </span>
          </div>
        </div>

        {/* ─── Studio Title & Intro Strip ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E6321C]">
                PREMIUM ATELIER STUDIO
              </span>
              <div className="h-[2px] w-8 bg-[#E6321C]" />
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#171717] uppercase tracking-tight leading-none">
              CUSTOMIZE YOUR <span className="text-[#E6321C]">240 GSM PIECE</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A63] font-sans max-w-xl leading-relaxed">
              Custom-milled 240 GSM heavy combed cotton. Drop-shoulder relaxed streetwear drape with an anti-sag dense collar. Drag artwork and text directly onto the garment.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-[#6F6A63] bg-white border border-[#DDD3C5] px-4 py-2.5 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 text-[#171717]">
              <Shirt size={15} className="text-[#E6321C]" />
              <span className="font-bold">{productType === 'hoodie' ? '350 GSM Fleece' : '240 GSM Cotton'}</span>
            </div>
            <div className="h-3.5 w-[1px] bg-[#DDD3C5]" />
            <div className="flex items-center gap-1.5 text-[#171717]">
              <Sparkles size={15} className="text-[#E6321C]" />
              <span className="font-bold">
                {isDualSided ? 'Dual-Sided Print' : hasBackArtwork ? 'Back Print' : 'Front Chest Print'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Main Atelier Studio Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Photorealistic Garment Canvas Stage (Sticky on Desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 w-full lg:sticky lg:top-24 space-y-4">
            <GarmentCanvas
              productType={productType}
              garmentColorHex={selectedColor.hex}
              garmentColorName={selectedColor.name}
              view={view}
              onToggleView={setView}
              artwork={activeSideDesign.artwork}
              onUpdateArtwork={handleUpdateArtwork}
              onRemoveArtwork={handleRemoveArtwork}
              typography={activeSideDesign.typography}
              onUpdateTypography={handleUpdateTypography}
              onRemoveTypography={handleRemoveTypography}
              selectedLayer={selectedLayer}
              onSelectLayer={setSelectedLayer}
              showSafeZone={showSafeZone}
              onToggleSafeZone={() => setShowSafeZone(!showSafeZone)}
              zoomLevel={zoomLevel}
              onToggleZoom={() => setZoomLevel(zoomLevel > 1 ? 1 : 1.2)}
              onResetPosition={handleResetPosition}
              onSnapPosition={handleSnapPosition}
            />

            {/* Canvas Hint */}
            <div className="flex items-center justify-between text-[11px] font-sans text-[#6F6A63] px-3.5 py-2.5 rounded-2xl bg-white border border-[#DDD3C5]">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#E6321C]" />
                <span>Drag your artwork or text anywhere on the 240 GSM canvas.</span>
              </div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#171717]">
                300 DPI DTG
              </span>
            </div>
          </div>

          {/* Right Column: Studio Workbench Controls */}
          <div className="lg:col-span-6 xl:col-span-6 w-full space-y-6">
            <DesignControls
              products={products}
              currentProduct={currentProduct}
              onSelectProduct={(p) => {
                setSelectedProductId(p.id);
                if (p.variants?.[0]?.color) {
                  setSelectedColor({
                    name: p.variants[0].color,
                    hex: p.variants[0].colorHex || '#111111',
                  });
                }
                if (p.variants?.[0]?.size) {
                  setSelectedSize(p.variants[0].size);
                }
              }}
              availableColors={availableColors}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              availableSizes={availableSizes}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              activeView={view}
              artwork={activeSideDesign.artwork}
              onUpdateArtwork={handleUpdateArtwork}
              onRemoveArtwork={handleRemoveArtwork}
              onUploadFile={handleUploadFile}
              typography={activeSideDesign.typography}
              onUpdateTypography={handleUpdateTypography}
              onRemoveTypography={handleRemoveTypography}
              customerNotes={customerNotes}
              onChangeCustomerNotes={setCustomerNotes}
            />
          </div>
        </div>

        {/* ─── Bottom Trust Strip ─── */}
        <div className="pt-8 border-t border-[#DDD3C5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <Truck size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Free Shipping</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">On orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">240 GSM Tested</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">Heavyweight & anti-sag collar</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Defect Guarantee</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">100% free reprint if flawed</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Fast Dispatch</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">Crafted & shipped in 3-5 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Bottom Atelier Summary Bar ─── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#DDD3C5] shadow-lg z-40 py-3 sm:py-4 px-4 sm:px-8">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left: Garment Specs Preview */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start">
            <div
              className="h-11 w-11 rounded-2xl border border-[#DDD3C5] flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <Shirt
                size={20}
                className={
                  ['white', 'oatmeal', 'sandstone', 'cream', 'off-white cream', 'vintage sand'].includes(
                    selectedColor.name.toLowerCase()
                  )
                    ? 'text-black/50'
                    : 'text-white/60'
                }
              />
            </div>
            <div className="text-left">
              <h4 className="font-sans font-bold text-xs sm:text-sm text-[#171717] line-clamp-1">
                {currentProduct?.title || '240 GSM Heavyweight Oversized Tee'}
              </h4>
              <p className="text-[11px] text-[#6F6A63] font-sans">
                {selectedColor.name} • {selectedSize} •{' '}
                <span className="text-[#E6321C] font-semibold">
                  {isDualSided ? 'Front & Back (+₹199)' : hasBackArtwork ? 'Back Print' : 'Front Print'}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Pricing, Stepper & Action CTAs */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto">
            {/* Price Display */}
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#6F6A63] block font-sans uppercase tracking-wider">
                Total Price
              </span>
              <span className="font-heading font-black text-lg sm:text-xl text-[#171717]">
                ₹{totalPrice}
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center rounded-xl border border-[#DDD3C5] bg-white px-1 py-0.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717] font-bold text-sm"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-sans font-bold text-[#171717]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717] font-bold text-sm"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Save Draft Action */}
            <button
              type="button"
              disabled={isSavingDesign}
              onClick={handleSaveDraft}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#171717] text-[#171717] font-sans font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <Bookmark size={14} />
              <span>Save Draft</span>
            </button>

            {/* Primary ADD TO BAG Action */}
            <motion.button
              type="button"
              disabled={isSavingDesign || isAdding}
              onClick={handleAddToCart}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSavingDesign ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <ShoppingBag size={15} />
              )}
              <span>{isSavingDesign ? 'SAVING ARTWORK...' : 'ADD TO BAG'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
