import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  ShoppingBag,
  Ruler,
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
  RotateCw,
  X,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';

const PRODUCT_TYPES = [
  { id: 'tshirt', name: 'T-Shirt', price: 699, icon: Shirt },
  { id: 'hoodie', name: 'Hoodie', price: 1199, icon: Shirt },
  { id: 'oversized', name: 'Oversized T-Shirt', price: 799, icon: Shirt },
];

const COLORS = [
  { name: 'Off White', hex: '#F5EFEB', border: true },
  { name: 'Black', hex: '#171717' },
  { name: 'Khaki', hex: '#C8B89E' },
  { name: 'Grey', hex: '#8E9297' },
  { name: 'Navy', hex: '#1E2A38' },
  { name: 'Burgundy', hex: '#5B1E28' },
  { name: 'Dark Green', hex: '#1E3A2B' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const FONTS = [
  { name: 'Poppins', family: 'sans-serif' },
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Oswald', family: 'Oswald, sans-serif' },
  { name: 'Playfair', family: 'serif' },
  { name: 'Caveat (Cursive)', family: 'Caveat, cursive' },
];

export function CustomizerPage() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productType, setProductType] = useState('tshirt');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
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
  const [isArtworkVisible, setIsArtworkVisible] = useState(true);

  const currentProduct = PRODUCT_TYPES.find((p) => p.id === productType) || PRODUCT_TYPES[0];

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
      setIsArtworkVisible(true);
      toast({
        title: 'Design uploaded successfully!',
        description: 'Your graphic has been placed onto the mockup.',
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    addItem(currentProduct.id, quantity);
    toast({
      title: 'Custom item added to cart!',
      description: `${currentProduct.name} (${selectedColor.name}, ${selectedSize}, ${view.toUpperCase()} Print)`,
      variant: 'success',
    });
    navigate('/cart');
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">Custom</span>
        </nav>

        {/* ─── Hero Header & Mockup Rack (Exact Image 2) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-[#DDD3C5]">
          {/* Left Column: Heading & 4 Steps */}
          <div className="lg:col-span-6 text-left space-y-4">
            <h1 className="font-heading font-black text-4xl sm:text-5xl text-[#171717] uppercase tracking-tight leading-none">
              CREATE YOUR OWN<br />
              <span className="text-[#E6321C]">MAKE IT YOURS.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A63] font-sans max-w-lg leading-relaxed">
              Upload your design and we'll bring it to life with premium quality & perfect fit.
            </p>

            {/* 4 Process Badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">Upload Your Design</span>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <Shirt size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">Choose Product</span>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <Palette size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">Customize It</span>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <div className="h-10 w-10 rounded-xl bg-[#FDF0EE] text-[#E6321C] flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <span className="font-sans font-bold text-xs text-[#171717]">We Print & Deliver</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clothing Rack Mockup Frame */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl bg-[#EDE0CC]/40 border border-[#DDD3C5] p-6 flex items-center justify-center gap-6 overflow-hidden shadow-xs">
              {/* Clothes Rack Top Bar */}
              <div className="absolute top-3 inset-x-8 h-1.5 bg-[#8E8B85] rounded-full" />

              {/* T-Shirt Front on Hanger */}
              <div className="relative w-1/2 flex flex-col items-center">
                <div className="w-8 h-4 border-t-2 border-l-2 border-[#555] rounded-tl-full mb-0.5" />
                <div className="w-full aspect-[4/5] rounded-xl bg-[#F5EFEB] border border-[#DDD3C5] shadow-sm flex flex-col items-center justify-center p-3 relative">
                  <div className="w-12 h-6 border-b-2 border-[#DDD3C5] rounded-b-full mb-3" />
                  <div className="border border-dashed border-[#E6321C]/60 rounded p-1.5 text-center">
                    <span className="text-[9px] font-sans font-bold text-[#E6321C] block leading-tight">
                      Your<br />Design<br />Here
                    </span>
                  </div>
                </div>
              </div>

              {/* T-Shirt Back on Hanger */}
              <div className="relative w-1/2 flex flex-col items-center">
                <div className="w-8 h-4 border-t-2 border-l-2 border-[#555] rounded-tl-full mb-0.5" />
                <div className="w-full aspect-[4/5] rounded-xl bg-[#F5EFEB] border border-[#DDD3C5] shadow-sm flex flex-col items-center justify-center p-4 relative">
                  <div className="w-14 h-3 bg-[#EAE2D5] rounded-full mb-4" />
                  <div className="w-full h-3/5 border-2 border-dashed border-[#171717]/40 rounded-lg p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-heading font-black text-[#171717] uppercase tracking-wider block">
                      Your<br /><span className="text-[#E6321C]">Design</span><br />Here
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Workbench Studio Grid (Exact Image 2) ─── */}
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
                  CHOOSE PRODUCT
                </h2>
              </div>

              {/* 3 Product Type Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {PRODUCT_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  const active = productType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setProductType(pt.id)}
                      className={`py-3 px-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-sans font-bold transition-all ${
                        active
                          ? 'border-[#E6321C] bg-[#FDF0EE] text-[#E6321C]'
                          : 'border-[#DDD3C5] bg-white text-[#171717] hover:border-[#171717]'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{pt.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <label className="text-xs font-sans text-[#6F6A63] block">
                  Color: <strong className="text-[#171717]">{selectedColor.name}</strong>
                </label>
                <div className="flex items-center gap-3">
                  {COLORS.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        aria-label={`Select ${c.name}`}
                        className={`h-8 w-8 rounded-full border transition-all ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-[#E6321C] border-[#171717]/20 scale-105'
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
                  <span className="text-[#6F6A63]">Size</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[#E6321C] font-semibold hover:underline"
                  >
                    <Ruler size={13} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  {SIZES.map((sz) => {
                    const active = selectedSize === sz;
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
                  UPLOAD YOUR DESIGN
                </h2>
              </div>

              {/* Dashed Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#DDD3C5] hover:border-[#E6321C] bg-[#FAF8F5] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
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
                  Drag & drop your image here or
                </p>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  UPLOAD IMAGE
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
                  ADD TEXT (OPTIONAL)
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="flex-1 h-11 rounded-xl border border-[#DDD3C5] bg-[#FAF8F5] px-4 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
                />

                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="h-11 rounded-xl border border-[#DDD3C5] bg-[#FAF8F5] px-3 text-xs font-sans text-[#171717] focus:border-[#E6321C] focus:outline-none"
                >
                  {FONTS.map((f) => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>

                <div className="h-11 w-11 rounded-xl border border-[#DDD3C5] bg-[#171717] shrink-0" />
              </div>

              {/* Text formatting toolbar */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsBold(!isBold)}
                    className={`h-9 w-9 flex items-center justify-center ${isBold ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsItalic(!isItalic)}
                    className={`h-9 w-9 flex items-center justify-center ${isItalic ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUnderline(!isUnderline)}
                    className={`h-9 w-9 flex items-center justify-center ${isUnderline ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                  >
                    <Underline size={14} />
                  </button>
                </div>

                <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTextAlign('left')}
                    className={`h-9 w-9 flex items-center justify-center ${textAlign === 'left' ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('center')}
                    className={`h-9 w-9 flex items-center justify-center ${textAlign === 'center' ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('right')}
                    className={`h-9 w-9 flex items-center justify-center ${textAlign === 'right' ? 'bg-[#FDF0EE] text-[#E6321C]' : 'text-[#6F6A63] hover:text-[#171717]'}`}
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
                className="relative aspect-square w-full rounded-2xl border border-[#DDD3C5] flex items-center justify-center p-6 overflow-hidden transition-colors"
                style={{ backgroundColor: selectedColor.hex }}
              >
                {/* SVG/CSS Garment Shape */}
                <div className="relative w-4/5 h-4/5 flex items-center justify-center">
                  {/* T-Shirt Collar */}
                  <div className="absolute top-2 inset-x-0 mx-auto w-16 h-8 rounded-b-full border-2 border-black/15 bg-black/5" />

                  {/* Active Print Area Bounding Box (Exact Image 2) */}
                  <div className="relative w-3/4 h-3/4 border-2 border-dashed border-[#E6321C] rounded-lg p-3 flex flex-col items-center justify-center">
                    {/* Top-Right Close Handle */}
                    <button
                      type="button"
                      onClick={() => setIsArtworkVisible(false)}
                      className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-[#E6321C] text-white flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                    >
                      <X size={13} />
                    </button>

                    {/* Bottom-Right Rotate Handle */}
                    <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-white border border-[#DDD3C5] text-[#171717] flex items-center justify-center shadow-xs">
                      <RotateCw size={12} />
                    </div>

                    {/* Artwork Inside */}
                    {isArtworkVisible && (
                      <div className="text-center select-none">
                        {uploadedImage ? (
                          <img
                            src={uploadedImage}
                            alt="Custom upload"
                            className="max-h-36 max-w-full object-contain mx-auto"
                          />
                        ) : (
                          <div className="space-y-1">
                            <span className="text-xl sm:text-2xl font-heading font-black tracking-tight text-[#171717] uppercase block">
                              CREATE
                            </span>
                            <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#E6321C] uppercase block">
                              YOUR
                            </span>
                            <span className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#171717] uppercase block">
                              OWN
                            </span>
                          </div>
                        )}

                        {customText && (
                          <p
                            className={`mt-2 text-sm text-[#171717] ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`}
                            style={{ textAlign }}
                          >
                            {customText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* View Toggles: FRONT & BACK */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
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
                  PRODUCT INFO
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="flex items-center gap-2 text-[#171717]">
                    <ShieldCheck size={16} className="text-[#E6321C] shrink-0" />
                    <span>240 GSM Premium Fabric</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <Shirt size={16} className="text-[#E6321C] shrink-0" />
                    <span>Regular Fit</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <Palette size={16} className="text-[#E6321C] shrink-0" />
                    <span>High Quality Print</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717]">
                    <RotateCcw size={16} className="text-[#E6321C] shrink-0" />
                    <span>7 Days Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sticky Bottom Summary Bar (Exact Image 2) ─── */}
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
                Custom {currentProduct.name}
              </h4>
              <p className="text-xs text-[#6F6A63] font-sans">
                {selectedColor.name} • {selectedSize} • {view.toUpperCase()} Print
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                className="text-[11px] text-[#E6321C] font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          {/* Middle: Price & Quantity */}
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-[#6F6A63] block font-sans">Price (1 Piece)</span>
              <span className="font-heading font-black text-xl text-[#171717]">
                ₹{currentProduct.price}
              </span>
            </div>

            <div className="flex items-center rounded-lg border border-[#DDD3C5] bg-white px-1 py-0.5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-7 w-7 flex items-center justify-center text-[#6F6A63] hover:text-[#171717]"
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
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Right: ADD TO CART Button */}
          <div className="text-center sm:text-right">
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-8 py-3.5 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 justify-center"
            >
              <ShoppingBag size={15} />
              <span>ADD TO CART</span>
            </button>
            <span className="text-[10px] text-[#6F6A63] font-sans block mt-1">
              You can review your design in the cart
            </span>
          </div>
        </div>

        {/* ─── Bottom Trust Strip (Exact Image 2) ─── */}
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
              <div className="text-[11px] text-[#6F6A63] font-sans">100% safe & secure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Easy Returns</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">7 days easy return</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Express Delivery</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">3 - 7 working days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
