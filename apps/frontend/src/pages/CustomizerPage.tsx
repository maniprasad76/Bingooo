import { useState, useRef, useMemo, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { SEO } from '../components/common/SEO';
import { getWhatsAppUrl, WhatsAppIcon } from '../components/ui/SocialIcons';

interface GarmentType {
  id: 'tshirt' | 'oversized' | 'hoodie';
  name: string;
  price: number;
  description: string;
}

const GARMENTS: GarmentType[] = [
  {
    id: 'tshirt',
    name: 'T-SHIRT',
    price: 999,
    description: '100% Combed Cotton Classic Crewneck',
  },
  {
    id: 'oversized',
    name: 'OVERSIZED',
    price: 1299,
    description: '240 GSM Heavyweight Drop-Shoulder Fit',
  },
  {
    id: 'hoodie',
    name: 'HOODIE',
    price: 2499,
    description: '350 GSM Brushed Fleece Pullover Hoodie',
  },
];

interface ColorOption {
  name: string;
  hex: string;
  textContrast: string;
}

const COLORS: ColorOption[] = [
  { name: 'Black', hex: '#171717', textContrast: '#FFFFFF' },
  { name: 'White', hex: '#FFFFFF', textContrast: '#171717' },
  { name: 'Beige', hex: '#D8C8B1', textContrast: '#171717' },
  { name: 'Red', hex: '#E6321C', textContrast: '#FFFFFF' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

type Position = 'CENTER' | 'LEFT CHEST' | 'BACK';

export function CustomizerPage() {
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();

  // Customizer State
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>(GARMENTS[1]); // Default Oversized
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLORS[0]); // Default Black
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [selectedPosition, setSelectedPosition] = useState<Position>('CENTER');
  const [viewSide, setViewSide] = useState<'FRONT' | 'BACK'>('FRONT');

  // Artwork & text state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('BINGOOO');
  const [isSizeModalOpen, setIsSizeModalOpen] = useState<boolean>(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // When position is set to BACK, auto-switch preview to BACK view
  useEffect(() => {
    if (selectedPosition === 'BACK') {
      setViewSide('BACK');
    } else {
      setViewSide('FRONT');
    }
  }, [selectedPosition]);

  // Handle File Upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'File must be smaller than 10MB.',
        variant: 'danger',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      triggerHaptic('light');
      toast({
        title: 'Artwork uploaded',
        description: `${file.name} placed on your garment canvas.`,
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearArtwork = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  // Dynamic positioning styling for design-area
  const designAreaStyle = useMemo(() => {
    if (selectedPosition === 'LEFT CHEST') {
      return {
        top: '28%',
        left: '40%',
        transform: 'scale(0.65)',
        maxWidth: '30%',
      };
    }
    // CENTER & BACK
    return {
      top: '34%',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '36%',
    };
  }, [selectedPosition]);

  return (
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased">
      <SEO
        title="Custom Studio — BINGOOO"
        description="Design your custom T-shirt, oversized tee or hoodie with high-definition DTF printing. Choose colors, sizes, and upload your artwork."
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

        <p className="max-w-[520px] mx-auto text-[#6f6a63] text-[13px] leading-[1.7]">
          Start with a blank canvas. Upload your design, choose your fit and create something that's completely yours.
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

          <div className={`flex items-center gap-[9px] text-[9px] font-bold uppercase whitespace-nowrap ${uploadedImage ? 'text-[#171717]' : 'text-[#6f6a63]'}`}>
            <span className={`w-7 h-7 rounded-full grid place-items-center text-[10px] ${uploadedImage ? 'bg-[#171717] text-white' : 'bg-[#ede0cc] text-[#171717]'}`}>
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
      <section className="container-bingooo grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-[30px] items-start pb-[100px]">

        {/* ── PREVIEW PANEL ── */}
        <div className="min-h-[460px] sm:min-h-[580px] lg:min-h-[690px] p-5 sm:p-[35px] bg-[#ede0cc] border border-[#ddd3c5] relative flex items-center justify-center overflow-hidden">
          <div className="absolute top-[18px] left-5 text-[9px] font-bold tracking-[0.16em] uppercase">
            LIVE PREVIEW
          </div>

          <div className="absolute top-[18px] right-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewSide(viewSide === 'FRONT' ? 'BACK' : 'FRONT');
              }}
              className="text-[9px] font-bold tracking-[0.1em] text-[#6f6a63] hover:text-[#171717] transition-colors border-b border-dashed border-[#6f6a63]"
            >
              {viewSide} VIEW ↻
            </button>
          </div>

          {/* Realistic Garment Mockup Vector */}
          <div className="relative w-[min(85%,540px)] aspect-[0.86] flex items-center justify-center select-none">
            {/* Sleeves */}
            <div
              className="absolute w-[28%] h-[28%] top-[16%] left-[4%] transition-colors duration-300"
              style={{
                backgroundColor: selectedColor.hex,
                transform: 'rotate(22deg) skewY(-8deg)',
                boxShadow: selectedColor.hex === '#FFFFFF' ? 'inset 0 0 0 1px #ddd3c5' : undefined,
              }}
            />
            <div
              className="absolute w-[28%] h-[28%] top-[16%] right-[4%] transition-colors duration-300"
              style={{
                backgroundColor: selectedColor.hex,
                transform: 'rotate(-22deg) skewY(8deg)',
                boxShadow: selectedColor.hex === '#FFFFFF' ? 'inset 0 0 0 1px #ddd3c5' : undefined,
              }}
            />

            {/* Torso Body */}
            <div
              className="absolute w-[63%] h-[70%] top-[15%] rounded-t-[7px] rounded-b-[18px] transition-colors duration-300"
              style={{
                backgroundColor: selectedColor.hex,
                boxShadow: selectedColor.hex === '#FFFFFF'
                  ? '0 25px 40px rgba(0,0,0,0.08), inset 0 0 0 1px #ddd3c5'
                  : '0 25px 40px rgba(0,0,0,0.13)',
              }}
            >
              {/* Collar Notch */}
              <div
                className="absolute w-[35%] h-[15%] left-[32.5%] -top-[6%] rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: selectedColor.hex,
                  boxShadow: selectedColor.hex === '#FFFFFF' ? 'inset 0 0 0 1px #ddd3c5' : undefined,
                }}
              />

              {/* Hoodie Pocket Simulation if Hoodie selected */}
              {selectedGarment.id === 'hoodie' && viewSide === 'FRONT' && (
                <div
                  className="absolute bottom-[8%] left-[16%] right-[16%] h-[24%] rounded-[6px] border border-black/10 opacity-70"
                  style={{
                    backgroundColor: selectedColor.hex,
                    filter: 'brightness(0.96)',
                  }}
                />
              )}
            </div>

            {/* Design Printable Area */}
            <div
              className="absolute z-10 flex flex-col justify-center items-center text-center transition-all duration-300"
              style={{
                ...designAreaStyle,
                color: selectedColor.textContrast,
              }}
            >
              {uploadedImage ? (
                <div className="relative group">
                  <img
                    src={uploadedImage}
                    alt="Uploaded custom artwork"
                    className="max-w-full max-h-[140px] sm:max-h-[180px] object-contain drop-shadow-md"
                  />
                  <button
                    type="button"
                    onClick={handleClearArtwork}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#171717] text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove artwork"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-[18px] sm:text-[22px] font-extrabold tracking-[-0.05em] uppercase px-2 py-1 select-none">
                  {customText || 'BINGOOO'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTROLS PANEL ── */}
        <aside className="bg-white border border-[#ddd3c5] rounded-[12px] p-5 sm:p-[25px]">

          {/* 01 / Choose Product */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>01 / Choose Product</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {GARMENTS.map((garment) => (
                <button
                  key={garment.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedGarment(garment);
                  }}
                  className={`border bg-[#f7eedb] p-2 sm:p-2.5 text-center transition-all cursor-pointer ${
                    selectedGarment.id === garment.id
                      ? 'border-2 border-[#171717]'
                      : 'border-[#ddd3c5] hover:border-[#171717]'
                  }`}
                >
                  <div className="h-[70px] sm:h-[90px] flex justify-center items-center">
                    {garment.id === 'tshirt' && (
                      <div className="mini-shirt bg-[#181818] before:bg-[#181818]" />
                    )}
                    {garment.id === 'oversized' && (
                      <div className="mini-shirt bg-[#e7dcc9] before:bg-[#e7dcc9]" />
                    )}
                    {garment.id === 'hoodie' && (
                      <div className="mini-hoodie" />
                    )}
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.05em] uppercase mt-1">
                    {garment.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 02 / Add Your Design */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>02 / Add Your Design</span>
              <span className="text-[#6f6a63] text-[10px]">PNG / JPG</span>
            </div>

            <div className="border border-dashed border-[#bdb3a4] bg-[#faf7f0] p-5 sm:p-[25px_15px] text-center transition-colors hover:border-[#171717]">
              <div className="text-[25px] mb-[9px] leading-none">
                ↑
              </div>
              <strong className="block mb-[5px] text-[11px] font-bold">
                {uploadedImage ? 'Artwork loaded on canvas' : 'Upload your artwork'}
              </strong>
              <span className="text-[#6f6a63] text-[9px]">
                PNG, JPG or WEBP · Max 10MB
              </span>
              <br />

              <div className="flex items-center justify-center gap-2 mt-[14px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[40px] px-[18px] border-0 bg-[#171717] text-white text-[9px] font-bold uppercase hover:bg-black transition-colors"
                >
                  {uploadedImage ? 'REPLACE FILE' : 'CHOOSE FILE'}
                </button>

                {uploadedImage && (
                  <button
                    type="button"
                    onClick={handleClearArtwork}
                    className="min-h-[40px] px-3 border border-[#ddd3c5] bg-white text-[#171717] text-[9px] font-bold uppercase hover:border-[#171717] transition-colors"
                  >
                    REMOVE
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {!uploadedImage && (
                <div className="mt-3 pt-3 border-t border-[#ddd3c5]/60 text-left">
                  <label className="block text-[9px] font-bold text-[#6f6a63] uppercase mb-1">
                    Or Enter Text:
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                    placeholder="E.G. BINGOOO"
                    maxLength={15}
                    className="w-full h-8 px-2.5 bg-white border border-[#ddd3c5] text-[10px] font-bold uppercase outline-none focus:border-[#171717]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 03 / Garment Color */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>03 / Garment Color</span>
              <span className="text-[#6f6a63] text-[10px] font-normal">{selectedColor.name}</span>
            </div>

            <div className="flex gap-[10px]">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedColor(color);
                  }}
                  className={`w-8 h-8 rounded-full border-2 border-transparent transition-all cursor-pointer ${
                    selectedColor.name === color.name
                      ? 'shadow-[0_0_0_2px_#f7eedb,0_0_0_3px_#171717]'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    border: color.hex === '#FFFFFF' ? '1px solid #cfc7bb' : 'none',
                  }}
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

          {/* 05 / Design Position */}
          <div className="pb-[25px] mb-[25px] border-b border-[#ddd3c5]">
            <div className="flex justify-between items-center mb-[13px] text-[11px] font-bold uppercase">
              <span>05 / Design Position</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(['CENTER', 'LEFT CHEST', 'BACK'] as Position[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedPosition(pos);
                  }}
                  className={`min-h-[38px] border text-[9px] font-semibold uppercase transition-all cursor-pointer ${
                    selectedPosition === pos
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'border-[#ddd3c5] bg-transparent hover:border-[#171717]'
                  }`}
                >
                  {pos}
                </button>
              ))}
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
                  Includes custom printing
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
            className="w-full min-h-[54px] border-0 rounded-[7px] bg-[#e6321c] text-white text-[11px] font-bold uppercase hover:bg-[#b91f12] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isAddedFeedback ? 'ADDED TO CART ✓' : 'ADD CUSTOM DESIGN TO CART →'}
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
                Make it yours.
              </h3>
              <p className="m-0 text-[#aaaaaa] text-[11px] leading-[1.7]">
                Upload your artwork and decide exactly where you want your design printed.
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
                Check your design, select your size and add your custom piece to the cart.
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
    </main>
  );
}

export default CustomizerPage;
