import { useState, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  UploadCloud,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
  Image as ImageIcon,
  Shirt,
  Palette,
  CheckCircle2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Sparkles,
  LoaderCircle,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

const FALLBACK_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Sandstone', hex: '#D4C4A8' },
  { name: 'Charcoal', hex: '#333333' },
  { name: 'Oatmeal', hex: '#E8DCC8' },
];

const FALLBACK_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const FONTS = [
  { name: 'Poppins', family: 'sans-serif' },
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Oswald', family: 'Oswald, sans-serif' },
  { name: 'Playfair', family: 'serif' },
  { name: 'Caveat (Cursive)', family: 'Caveat, cursive' },
];

export function CustomizerPage() {
  const { productSlug } = useParams<{ productSlug?: string }>();
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch live customizable products from catalog
  const { data: customizableData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'customizable'],
    queryFn: () => api.get<{ data: any[] }>('/products', { customizable: 'true', limit: 20 }),
  });

  const products = customizableData?.data ?? [];

  // Active product selection (URL slug takes priority)
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

  // Derive available colors from the product variants
  const availableColors = useMemo(() => {
    if (!currentProduct?.variants || currentProduct.variants.length === 0) {
      return FALLBACK_COLORS;
    }
    const map = new Map<string, { name: string; hex: string }>();
    currentProduct.variants.forEach((v: any) => {
      if (v.color && !map.has(v.color.toLowerCase())) {
        map.set(v.color.toLowerCase(), { name: v.color, hex: v.colorHex || '#171717' });
      }
    });
    return map.size > 0 ? Array.from(map.values()) : FALLBACK_COLORS;
  }, [currentProduct]);

  // Derive available sizes from the product variants
  const availableSizes = useMemo(() => {
    if (!currentProduct?.variants || currentProduct.variants.length === 0) {
      return FALLBACK_SIZES;
    }
    const set = new Set<string>();
    currentProduct.variants.forEach((v: any) => {
      if (v.size) set.add(v.size.toUpperCase());
    });
    return set.size > 0 ? Array.from(set) : FALLBACK_SIZES;
  }, [currentProduct]);

  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
  const [view, setView] = useState<'front' | 'back'>('back');
  const [quantity, setQuantity] = useState(1);

  // Custom design states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONTS[0].name);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isSavingDesign, setIsSavingDesign] = useState(false);

  const activePrice = currentProduct?.base_price || 1299;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setUploadedImage(reader.result as string);
      toast({
        title: 'Design uploaded successfully!',
        description: 'Your graphic has been placed onto the mockup stage.',
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = async () => {
    if (!currentProduct) {
      toast({ title: 'Please select a garment', variant: 'danger' });
      return;
    }

    // 1. Find matching variant from currentProduct
    const variant = currentProduct.variants?.find((v: any) => {
      const matchColor = !v.color || v.color.toLowerCase() === selectedColor.name.toLowerCase();
      const matchSize = !v.size || v.size.toUpperCase() === selectedSize.toUpperCase();
      return matchColor && matchSize;
    }) || currentProduct.variants?.[0];

    if (!variant) {
      toast({
        title: 'Variant unavailable',
        description: 'Selected color and size combination is not in stock.',
        variant: 'danger',
      });
      return;
    }

    setIsSavingDesign(true);

    try {
      // 2. Persist custom design project in backend
      const designPayload = {
        productId: currentProduct.id,
        designJson: {
          text: customText.trim() || undefined,
          font: selectedFont,
          isBold,
          isItalic,
          isUnderline,
          textAlign,
          garmentColor: selectedColor.name,
          garmentColorHex: selectedColor.hex,
          selectedSize,
          view,
          hasArtwork: Boolean(uploadedImage),
          layers: [
            ...(uploadedImage ? [{ type: 'image', view }] : []),
            ...(customText.trim() ? [{ type: 'text', content: customText.trim(), font: selectedFont }] : []),
          ],
        },
        previewKey: uploadedImage || undefined,
      };

      const savedCustomization = await api.post<any>('/customizations', designPayload);

      // 3. Add to cart with variant ID and customization reference
      addItem(variant.id, quantity, savedCustomization.id);

      toast({
        title: 'Custom piece added to cart!',
        description: `${currentProduct.title} (${selectedColor.name}, ${selectedSize})`,
        variant: 'success',
      });

      navigate('/cart');
    } catch (err: any) {
      toast({
        title: 'Could not save custom item',
        description: err.message || 'Please try again.',
        variant: 'danger',
      });
    } finally {
      setIsSavingDesign(false);
    }
  };

  if (isProductsLoading && products.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#FAF8F5] text-muted">
        <LoaderCircle size={28} className="animate-spin text-[#E6321C]" />
        <p className="font-sans text-sm font-semibold text-[#171717]">Loading Design Atelier Studio...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">Custom Design Studio</span>
        </nav>

        {/* ─── Hero Header & Mockup Rack ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-[#DDD3C5]">
          {/* Left Column: Heading & 4 Steps */}
          <div className="lg:col-span-6 text-left space-y-4">
            <h1 className="font-heading font-black text-4xl sm:text-5xl text-[#171717] uppercase tracking-tight leading-none">
              CREATE YOUR OWN<br />
              <span className="text-[#E6321C]">MAKE IT YOURS.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A63] font-sans max-w-lg leading-relaxed">
              Upload your design and we'll bring it to life with premium heavy-weight fabric & vibrant print quality.
            </p>

            {/* 4 Process Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">Upload Artwork</span>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <Shirt size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">Pick Base Garment</span>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <Palette size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">Style Placement</span>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">We Print & Ship</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clothing Rack Mockup Frame */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl bg-[#EDE0CC]/40 border border-[#DDD3C5] p-6 flex items-center justify-center gap-6 overflow-hidden shadow-xs">
              <div className="absolute top-3 inset-x-8 h-1.5 bg-[#8E8B85] rounded-full" />

              <div className="relative w-1/2 flex flex-col items-center">
                <div className="w-8 h-4 border-t-2 border-l-2 border-[#555] rounded-tl-full mb-0.5" />
                <div
                  className="w-full aspect-[4/5] rounded-xl border border-[#DDD3C5] shadow-sm flex flex-col items-center justify-center p-3 relative transition-colors"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <div className="w-12 h-6 border-b-2 border-[#DDD3C5] rounded-b-full mb-3" />
                  <div className="border border-dashed border-[#E6321C]/60 rounded p-1.5 text-center">
                    <Sparkles size={16} className="text-[#E6321C] mx-auto mb-1" />
                    <span className="text-[9px] font-mono font-bold uppercase text-[#171717]">
                      {view.toUpperCase()} PRINT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Workbench Studio Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3 Customization Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* 1. CHOOSE PRODUCT */}
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#DDD3C5]">
                <span className="h-6 w-6 rounded-full bg-[#E6321C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171717]">
                  CHOOSE BASE GARMENT
                </h2>
              </div>

              {/* Product Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.length > 0 ? (
                  products.map((p) => {
                    const active = currentProduct?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(p.id);
                          // reset color and size to first available
                          if (p.variants?.[0]?.color) {
                            setSelectedColor({
                              name: p.variants[0].color,
                              hex: p.variants[0].colorHex || '#171717',
                            });
                          }
                          if (p.variants?.[0]?.size) {
                            setSelectedSize(p.variants[0].size);
                          }
                        }}
                        className={`py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-sans font-bold transition-all text-left ${
                          active
                            ? 'border-[#E6321C] bg-[#FDF0EE] text-[#E6321C]'
                            : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Shirt size={18} />
                          <span className="line-clamp-1">{p.title}</span>
                        </div>
                        <span className="font-mono text-xs">₹{p.base_price}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-3 px-4 rounded-xl border border-[#E6321C] bg-[#FDF0EE] text-[#E6321C] text-xs font-bold flex items-center gap-2">
                    <Shirt size={16} />
                    <span>Classic Oversized Tee (₹1299)</span>
                  </div>
                )}
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <label className="text-xs font-sans text-[#6F6A63] block">
                  Garment Color: <strong className="text-[#171717]">{selectedColor.name}</strong>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {availableColors.map((c) => {
                    const isSelected = selectedColor.name.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        aria-label={`Select color ${c.name}`}
                        className={`h-8 w-8 rounded-full border transition-all ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-[#E6321C] border-[#171717]/20 scale-110'
                            : 'border-[#DDD3C5] hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2 pt-2 border-t border-[#DDD3C5]/60">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-[#6F6A63]">Fit / Size: <strong className="text-[#171717]">{selectedSize}</strong></span>
                  <span className="text-[11px] text-[#E6321C] font-semibold">Standard Indian Sizing</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {availableSizes.map((sz) => {
                    const active = selectedSize.toUpperCase() === sz.toUpperCase();
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`h-11 w-12 rounded-xl border text-xs font-sans font-bold uppercase transition-all ${
                          active
                            ? 'border-[#E6321C] text-[#E6321C] bg-[#FDF0EE]'
                            : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. UPLOAD YOUR DESIGN */}
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#DDD3C5]">
                <span className="h-6 w-6 rounded-full bg-[#E6321C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171717]">
                  UPLOAD GRAPHIC OR LOGO
                </h2>
              </div>

              {/* Dashed Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#DDD3C5] hover:border-[#E6321C] bg-white p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.ai,.psd,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="h-12 w-12 rounded-full bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center mb-3">
                  <UploadCloud size={24} className="stroke-[1.8]" />
                </div>
                <p className="text-xs font-sans text-[#171717] font-semibold mb-3">
                  {uploadedImage ? 'Click to replace graphic' : 'Drag & drop your artwork here or'}
                </p>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  {uploadedImage ? 'CHANGE FILE' : 'UPLOAD IMAGE'}
                </button>
                <p className="mt-3 text-[10px] text-[#6F6A63] font-sans">
                  Supports: PNG, JPG, JPEG, AI, PSD, PDF | Max size: 25MB
                </p>
              </div>
            </div>

            {/* 3. ADD TEXT (OPTIONAL) */}
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#DDD3C5]">
                <span className="h-6 w-6 rounded-full bg-[#E6321C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171717]">
                  ADD CUSTOM TEXT
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter slogan, name, or quote"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="flex-1 h-11 rounded-xl border border-[#DDD3C5] bg-white px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                />

                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="h-11 rounded-xl border border-[#DDD3C5] bg-white px-3 text-xs font-sans text-[#171717] focus:border-[#E6321C] focus:outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Text formatting toolbar */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={`h-9 w-9 flex items-center justify-center ${isBold ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                    aria-label="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsItalic(!isItalic)}
                    className={`h-9 w-9 flex items-center justify-center ${isItalic ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                    aria-label="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUnderline(!isUnderline)}
                    className={`h-9 w-9 flex items-center justify-center ${isUnderline ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                    aria-label="Underline"
                  >
                    <Underline size={14} />
                  </button>
                </div>

                <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTextAlign('left')}
                    className={`h-9 w-9 flex items-center justify-center ${textAlign === 'left' ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                    aria-label="Align left"
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('center')}
                    className={`h-9 w-9 flex items-center justify-center ${textAlign === 'center' ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                    aria-label="Align center"
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('right')}
                    className={`h-9 w-9 flex items-center justify-center ${textAlign === 'right' ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                    aria-label="Align right"
                  >
                    <AlignRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: DESIGN PREVIEW & Product Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#171717] pb-3 border-b border-[#DDD3C5]">
                DESIGN PREVIEW
              </h2>

              {/* Garment Canvas Frame with Bounding Box */}
              <div
                className="relative aspect-square w-full rounded-2xl border border-[#DDD3C5] flex items-center justify-center p-6 overflow-hidden transition-colors shadow-inner"
                style={{ backgroundColor: selectedColor.hex }}
              >
                {/* SVG/CSS Garment Shape */}
                <div className="relative w-4/5 h-4/5 flex items-center justify-center">
                  {/* Collar */}
                  <div className="absolute top-2 inset-x-0 mx-auto w-16 h-8 rounded-b-full border-2 border-black/15 bg-black/5" />

                  {/* Active Print Area Bounding Box */}
                  <div className="relative w-3/4 h-3/4 border-2 border-dashed border-[#E6321C] rounded-lg p-3 flex flex-col items-center justify-center">
                    {/* Live Graphic Mockup Placement */}
                    {uploadedImage ? (
                      <div className="max-h-36 max-w-[160px] overflow-hidden rounded mb-2">
                        <img src={uploadedImage} alt="Uploaded graphic" className="max-h-36 max-w-[160px] object-contain" />
                      </div>
                    ) : (
                      <div className="text-center p-2 text-black/30">
                        <Shirt size={48} className="mx-auto mb-1" />
                        <span className="text-[10px] font-mono font-bold uppercase block">
                          Print Area
                        </span>
                      </div>
                    )}

                    {/* Live Custom Text Placement */}
                    {customText && (
                      <p
                        className={`text-sm tracking-wide text-black break-words max-w-full mt-1 ${
                          isBold ? 'font-bold' : 'font-normal'
                        } ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`}
                        style={{
                          textAlign,
                          fontFamily: FONTS.find((f) => f.name === selectedFont)?.family,
                        }}
                      >
                        {customText}
                      </p>
                    )}
                  </div>
                </div>

                {/* Front / Back Toggle Buttons */}
                <div className="absolute bottom-4 inset-x-0 mx-auto flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setView('front')}
                    className={`px-5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                      view === 'front'
                        ? 'bg-[#E6321C] text-white'
                        : 'bg-white text-[#171717] border border-[#DDD3C5] hover:border-[#171717]'
                    }`}
                  >
                    FRONT
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('back')}
                    className={`px-5 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all ${
                      view === 'back'
                        ? 'bg-[#E6321C] text-white'
                        : 'bg-white text-[#171717] border border-[#DDD3C5] hover:border-[#171717]'
                    }`}
                  >
                    BACK
                  </button>
                </div>
              </div>

              {/* PRODUCT INFO 4 Badges */}
              <div className="pt-2">
                <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#6F6A63] mb-3">
                  GARMENT CRAFT DETAILS
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="flex items-center gap-2 text-[#171717]">
                    <ShieldCheck size={16} className="text-[#E6321C] shrink-0" />
                    <span>220+ GSM Cotton</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <Shirt size={16} className="text-[#E6321C] shrink-0" />
                    <span>Tailored Streetwear Cut</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <Palette size={16} className="text-[#E6321C] shrink-0" />
                    <span>Direct-To-Garment HD</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <RotateCcw size={16} className="text-[#E6321C] shrink-0" />
                    <span>Quality Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sticky Bottom Summary Bar ─── */}
        <div className="rounded-2xl border border-[#DDD3C5] bg-white p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          {/* Left: Thumbnail & Details */}
          <div className="flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-xl border border-[#DDD3C5] flex items-center justify-center shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <Shirt size={24} className="text-black/40" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-[#171717]">
                {currentProduct?.title || 'Custom Garment'}
              </h4>
              <p className="text-xs text-[#6F6A63] font-sans">
                {selectedColor.name} • {selectedSize} • {view.toUpperCase()} Print
              </p>
            </div>
          </div>

          {/* Middle: Price & Quantity */}
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-[#6F6A63] block font-sans">Price (1 Piece)</span>
              <span className="font-heading font-black text-xl text-[#171717]">
                ₹{activePrice}
              </span>
            </div>

            <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white px-1 py-0.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-7 text-center text-xs font-sans font-bold text-[#171717]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Right: ADD TO CART Button */}
          <div className="text-center sm:text-right">
            <button
              type="button"
              disabled={isSavingDesign || isAdding}
              onClick={handleAddToCart}
              className="px-8 py-3.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 justify-center disabled:opacity-60"
            >
              <ShoppingBag size={15} />
              <span>{isSavingDesign ? 'SAVING ARTWORK...' : 'ADD TO BAG'}</span>
            </button>
            <span className="text-[10px] text-[#6F6A63] font-sans block mt-1">
              Your customized garment moves directly into checkout
            </span>
          </div>
        </div>

        {/* ─── Bottom Trust Strip ─── */}
        <div className="pt-8 border-t border-[#DDD3C5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
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
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Secure Payment</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">100% safe & encrypted</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Print Review</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">Checked before print run</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Fast Dispatch</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">3 - 5 days production</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
