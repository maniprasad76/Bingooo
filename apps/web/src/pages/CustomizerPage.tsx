import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  Trash2,
  ShoppingBag,
  Check,
  RotateCw,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';
import { GarmentMockup } from '../components/garment/GarmentMockup';
import type { GarmentType, GarmentView, PrintFinish } from '../components/garment/GarmentMockup';
import { InteractiveTilt } from '../components/ui/InteractiveTilt';

const GARMENT_COLORS = [
  { name: 'Obsidian Black', hex: '#121318', textColor: '#FFFFFF' },
  { name: 'Pure Snow White', hex: '#FFFFFF', textColor: '#121318' },
  { name: 'Vintage Washed Sand', hex: '#D4C4A8', textColor: '#121318' },
  { name: 'Charcoal Shadow', hex: '#2A2B32', textColor: '#FFFFFF' },
  { name: 'Forest Pine', hex: '#1C3326', textColor: '#FFFFFF' },
  { name: 'Bingooo Crimson', hex: '#FE260A', textColor: '#FFFFFF' },
];

const FONTS = [
  { name: 'Syne (Editorial Display)', family: 'Syne, sans-serif' },
  { name: 'Plus Jakarta Sans (Modern)', family: '"Plus Jakarta Sans", sans-serif' },
  { name: 'Space Grotesk (Tech Monospace)', family: '"Space Grotesk", monospace' },
  { name: 'Impact (Heavy Gothic)', family: 'Impact, sans-serif' },
  { name: 'Playfair Display (Luxury Serif)', family: 'serif' },
];

const PRESET_GRAPHICS = [
  { name: 'Bingooo Signature Red', url: '/logo.png', category: 'Official Brand' },
  { name: 'Bingooo White Luxe', url: '/logo-white.png', category: 'Official Brand' },
  { name: 'Bingooo Monogram B', url: '/icon-192.png', category: 'Official Brand' },
  { name: 'Bingooo Dark Mark', url: '/logo-dark.png', category: 'Official Brand' },
];

interface TextLayer {
  id: string;
  type: 'text';
  view: GarmentView;
  text: string;
  font: string;
  color: string;
  size: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

interface ImageLayer {
  id: string;
  type: 'image';
  view: GarmentView;
  url: string;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

type Layer = TextLayer | ImageLayer;

export function CustomizerPage() {
  const { productSlug } = useParams<{ productSlug?: string }>();
  const { toast } = useToast();
  const { addItem, isAdding } = useCart();

  const { data: specificProduct } = useProduct(productSlug);
  const { data: allProducts } = useProducts({ customizable: true });
  const product = specificProduct || allProducts?.data?.[0];

  // Studio State
  const [garmentType, setGarmentType] = useState<GarmentType>(
    productSlug?.includes('hoodie')
      ? 'hoodie'
      : productSlug?.includes('jacket')
      ? 'jacket'
      : productSlug?.includes('tote')
      ? 'tote'
      : 'tshirt'
  );
  const [currentView, setCurrentView] = useState<GarmentView>('front');
  const [selectedColor, setSelectedColor] = useState(GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [finish, setFinish] = useState<PrintFinish>('dtg');

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'initial_logo',
      type: 'image',
      view: 'front',
      url: '/logo.png',
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>('initial_logo');
  const [activeTab, setActiveTab] = useState<'presets' | 'text' | 'upload' | 'finish' | 'layers'>('presets');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter layers for current view (front vs back)
  const currentViewLayers = layers.filter((l) => l.view === currentView);
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // Add Graphic Preset
  const handleAddPreset = (url: string, name: string) => {
    const newLayer: ImageLayer = {
      id: `preset_${Date.now()}`,
      type: 'image',
      view: currentView,
      url,
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setActiveTab('layers');
    toast({
      title: 'Graphic Added',
      description: `Added "${name}" to ${currentView.toUpperCase()} print zone`,
      variant: 'success',
    });
  };

  // Add New Text Layer
  const handleAddText = () => {
    const newLayer: TextLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      view: currentView,
      text: 'TOKYO ARCHIVE',
      font: 'Syne, sans-serif',
      color: selectedColor.hex === '#FFFFFF' || selectedColor.hex === '#D4C4A8' ? '#121318' : '#FE260A',
      size: 24,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setActiveTab('text');
  };

  // File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast({ title: 'Image too large', description: 'Maximum file size is 15MB', variant: 'danger' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newLayer: ImageLayer = {
          id: `custom_art_${Date.now()}`,
          type: 'image',
          view: currentView,
          url,
          scale: 1,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
        };
        setLayers((prev) => [...prev, newLayer]);
        setActiveLayerId(newLayer.id);
        setActiveTab('layers');
        toast({
          title: 'Artwork Uploaded',
          description: `Placed on ${currentView.toUpperCase()} print zone`,
          variant: 'success',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateActiveLayer = (updates: Partial<Layer>) => {
    if (!activeLayerId) return;
    setLayers(layers.map((l) => (l.id === activeLayerId ? ({ ...l, ...updates } as Layer) : l)));
  };

  const handleRemoveLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(null);
    }
  };

  // Pricing Calculation
  const basePrice = product?.base_price || 1499;
  const finishFees: Record<PrintFinish, number> = {
    dtg: 300,
    puff: 450,
    embroidery: 550,
    distressed: 350,
  };
  const customizationFee = finishFees[finish];
  const totalPrice = basePrice + customizationFee;

  // Add Custom Project to Bag
  const handleAddToCart = async () => {
    if (!product) return;
    setIsSaving(true);
    try {
      const customization = await api.post<any>('/customizations', {
        productId: product.id,
        designJson: {
          garmentType,
          garmentColor: selectedColor.name,
          garmentColorHex: selectedColor.hex,
          size: selectedSize,
          finish,
          layers,
        },
      });

      const matchingVariant =
        product.variants?.find(
          (v: any) =>
            (v.color?.toLowerCase() === selectedColor.name.toLowerCase() || v.colorHex === selectedColor.hex) &&
            v.size === selectedSize
        ) || product.variants?.[0];

      if (matchingVariant) {
        addItem(matchingVariant.id, 1, customization.id);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FE260A', '#D4AF37', '#121318', '#FFFFFF'],
          });
        } catch {
          // ignore
        }

        toast({
          title: 'Custom Silhouette Added to Bag!',
          description: `Custom ${garmentType.toUpperCase()} (${finish.toUpperCase()} finish, size ${selectedSize})`,
          variant: 'success',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Could not save design',
        description: err.message || 'Please check connection',
        variant: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-paper min-h-screen py-8 sm:py-12">
      <div className="container-wide">
        {/* Studio Top Navbar / Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent" size="sm">
                <Sparkles size={12} className="mr-1" />
                LIVE 2D/3D STUDIO
              </Badge>
              <span className="text-caption font-mono text-muted uppercase">
                BINGOOO ATELIER // 2026
              </span>
            </div>
            <h1 className="text-display-lg font-black text-ink font-display">
              Design Your Custom {garmentType.toUpperCase()}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] font-mono text-muted uppercase block">
                Total Price (Item + {finish.toUpperCase()} Print)
              </span>
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-2xl sm:text-3xl font-black text-ink font-mono">
                  ₹{totalPrice}
                </span>
                <span className="text-caption text-brand-red font-mono font-bold">
                  (incl. ₹{customizationFee} custom finish)
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={isSaving || isAdding}
              onClick={handleAddToCart}
              className="bg-brand-red hover:bg-brand-red-hover text-white shadow-glow px-8 py-4 font-mono font-bold text-sm tracking-wider"
            >
              <ShoppingBag size={18} />
              ADD CUSTOM PIECE TO BAG
            </Button>
          </div>
        </div>

        {/* Studio Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: Interactive Studio Canvas & Real-Time Mockup */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Silhouette Selector Strip */}
            <div className="w-full flex items-center justify-between gap-2 p-2 bg-white rounded-2xl border border-border mb-6 shadow-sm">
              <div className="flex gap-1.5 overflow-x-auto py-1">
                {[
                  { type: 'tshirt', label: 'Heavy Tee', gsm: '220 GSM' },
                  { type: 'hoodie', label: 'Terry Hoodie', gsm: '450 GSM' },
                  { type: 'jacket', label: 'Varsity Bomber', gsm: 'Wool/Leather' },
                  { type: 'tote', label: 'Canvas Tote', gsm: 'Heavy Twill' },
                ].map((s) => (
                  <button
                    key={s.type}
                    onClick={() => setGarmentType(s.type as GarmentType)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      garmentType === s.type
                        ? 'bg-ink text-white shadow-md'
                        : 'bg-paper text-ink hover:bg-paper/80 border border-transparent'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="text-[9px] opacity-70">[{s.gsm}]</span>
                  </button>
                ))}
              </div>

              {/* View Flip Button */}
              <button
                onClick={() => setCurrentView(currentView === 'front' ? 'back' : 'front')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red-hover transition-all shadow-sm shrink-0"
              >
                <RotateCw size={14} />
                <span>FLIP TO {currentView === 'front' ? 'BACK' : 'FRONT'}</span>
              </button>
            </div>

            {/* Interactive Canvas Board */}
            <div className="relative aspect-[4/5] w-full max-w-lg rounded-3xl bg-gradient-to-b from-white to-paper border border-border p-8 flex items-center justify-center shadow-card overflow-hidden">
              <InteractiveTilt maxTilt={6} className="w-full h-full flex items-center justify-center">
                <GarmentMockup
                  type={garmentType}
                  view={currentView}
                  colorHex={selectedColor.hex}
                  finish={finish}
                  showPrintBoundary={true}
                  className="w-full h-full max-h-[440px]"
                >
                  {/* Dynamic Layers Render */}
                  {currentViewLayers.map((layer) => {
                    const isSelected = activeLayerId === layer.id;

                    if (layer.type === 'text') {
                      return (
                        <div
                          key={layer.id}
                          onClick={() => {
                            setActiveLayerId(layer.id);
                            setActiveTab('text');
                          }}
                          className={`cursor-pointer p-1.5 transition-all select-none absolute transform -translate-x-1/2 -translate-y-1/2 ${
                            isSelected
                              ? 'ring-2 ring-brand-red rounded border border-dashed border-brand-red bg-white/10'
                              : 'hover:ring-1 hover:ring-brand-red/50'
                          }`}
                          style={{
                            left: `calc(50% + ${layer.offsetX}px)`,
                            top: `calc(50% + ${layer.offsetY}px)`,
                            fontFamily: layer.font,
                            color: layer.color,
                            fontSize: `${layer.size}px`,
                            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                          }}
                        >
                          {layer.text}
                        </div>
                      );
                    }

                    if (layer.type === 'image') {
                      return (
                        <div
                          key={layer.id}
                          onClick={() => {
                            setActiveLayerId(layer.id);
                            setActiveTab('layers');
                          }}
                          className={`cursor-pointer p-1 transition-all absolute transform -translate-x-1/2 -translate-y-1/2 ${
                            isSelected
                              ? 'ring-2 ring-brand-red rounded border border-dashed border-brand-red bg-white/10'
                              : 'hover:ring-1 hover:ring-brand-red/50'
                          }`}
                          style={{
                            left: `calc(50% + ${layer.offsetX}px)`,
                            top: `calc(50% + ${layer.offsetY}px)`,
                            transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                          }}
                        >
                          <img
                            src={layer.url}
                            alt="Custom layer"
                            className="max-h-28 max-w-44 object-contain rounded drop-shadow"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </GarmentMockup>
              </InteractiveTilt>
            </div>

            {/* Quick Garment Colorway Swatches */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 bg-white p-3.5 rounded-full border border-border shadow-sm">
              <span className="text-caption font-mono font-bold text-ink px-2 uppercase">
                Colorway:
              </span>
              {GARMENT_COLORS.map((col) => {
                const isSelected = selectedColor.name === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    className={`relative h-9 w-9 rounded-full border-2 transition-transform ${
                      isSelected
                        ? 'border-brand-red scale-110 shadow-glow ring-2 ring-brand-red/40'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && (
                      <Check
                        size={14}
                        className={`mx-auto ${
                          col.hex === '#FFFFFF' || col.hex === '#D4C4A8' ? 'text-ink' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT 5 COLS: High-End Creative Suite Toolbox */}
          <div className="lg:col-span-5 bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            {/* Tool Selector Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-paper rounded-2xl border border-border text-[11px] font-mono font-bold">
              <button
                onClick={() => setActiveTab('presets')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'presets' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                Decals
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'text' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'upload' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('finish')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'finish' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                Finish
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`py-2.5 rounded-xl transition-all ${
                  activeTab === 'layers' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                Layers ({layers.length})
              </button>
            </div>

            {/* TAB 1: OFFICIAL PRESETS & DECALS */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-body font-bold text-ink font-display">
                    Official Bingooo Brand Graphics
                  </h3>
                  <p className="text-caption text-muted font-sans mt-0.5">
                    Select authentic Bingooo signature typography & emblem badges.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PRESET_GRAPHICS.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddPreset(g.url, g.name)}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-paper/50 hover:bg-white hover:border-brand-red hover:shadow-md transition-all group"
                    >
                      <div className="h-14 w-full flex items-center justify-center p-2">
                        <img src={g.url} alt={g.name} className="max-h-12 object-contain" />
                      </div>
                      <span className="mt-2 text-xs font-mono font-bold text-ink group-hover:text-brand-red transition-colors text-center">
                        {g.name}
                      </span>
                      <span className="text-[10px] text-brand-red font-mono uppercase mt-1 flex items-center gap-1">
                        <Plus size={10} /> Add to {currentView}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY STUDIO */}
            {activeTab === 'text' && (
              <div className="space-y-5">
                <Button variant="primary" fullWidth size="md" onClick={handleAddText} className="bg-ink hover:bg-brand-red text-white font-mono font-bold">
                  <Type size={16} />
                  + ADD NEW TEXT LAYER TO {currentView.toUpperCase()}
                </Button>

                {activeLayer && activeLayer.type === 'text' ? (
                  <div className="space-y-4 pt-3 border-t border-border">
                    <div>
                      <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-1 font-mono">
                        Lettering Text
                      </label>
                      <input
                        type="text"
                        value={activeLayer.text}
                        onChange={(e) => updateActiveLayer({ text: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl border border-border bg-paper text-body font-bold text-ink focus:border-brand-red focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-1 font-mono">
                        Font Silhouette
                      </label>
                      <select
                        value={activeLayer.font}
                        onChange={(e) => updateActiveLayer({ font: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-paper text-caption font-semibold text-ink focus:border-brand-red focus:outline-none cursor-pointer"
                      >
                        {FONTS.map((f) => (
                          <option key={f.family} value={f.family}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-caption font-mono font-bold text-ink mb-1">
                        <span>Font Size</span>
                        <span>{activeLayer.size}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="56"
                        value={activeLayer.size}
                        onChange={(e) => updateActiveLayer({ size: Number(e.target.value) })}
                        className="w-full accent-brand-red cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-2 font-mono">
                        Text Colorway
                      </label>
                      <div className="flex items-center gap-2">
                        {['#FE260A', '#FFFFFF', '#121318', '#D4AF37', '#10B981', '#3B82F6'].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => updateActiveLayer({ color: hex })}
                            className={`h-8 w-8 rounded-full border-2 transition-all ${
                              activeLayer.color === hex
                                ? 'border-brand-red scale-110 shadow-md ring-2 ring-brand-red/50'
                                : 'border-border hover:scale-105'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[11px] font-mono text-muted uppercase block mb-1">Horizontal Offset</span>
                        <input
                          type="range"
                          min="-80"
                          max="80"
                          value={activeLayer.offsetX}
                          onChange={(e) => updateActiveLayer({ offsetX: Number(e.target.value) })}
                          className="w-full accent-brand-red cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-muted uppercase block mb-1">Vertical Offset</span>
                        <input
                          type="range"
                          min="-80"
                          max="80"
                          value={activeLayer.offsetY}
                          onChange={(e) => updateActiveLayer({ offsetY: Number(e.target.value) })}
                          className="w-full accent-brand-red cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-caption text-muted text-center py-6 font-mono">
                    Select a text layer or click "+ ADD NEW TEXT LAYER" above.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOM ARTWORK UPLOAD */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-brand-red hover:bg-paper transition-all group"
                >
                  <div className="h-12 w-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <h4 className="text-body font-bold text-ink font-display">Upload High-Res File</h4>
                  <p className="text-caption text-muted mt-1 font-sans">
                    PNG with transparent background, SVG, JPG or WEBP up to 15MB
                  </p>
                  <Button variant="secondary" size="sm" className="mt-4 pointer-events-none font-mono font-bold">
                    SELECT FROM DEVICE
                  </Button>
                </div>

                {activeLayer && activeLayer.type === 'image' && (
                  <div className="space-y-4 pt-3 border-t border-border">
                    <div>
                      <div className="flex justify-between text-caption font-mono font-bold text-ink mb-1">
                        <span>Artwork Scale</span>
                        <span>{Math.round(activeLayer.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="2.0"
                        step="0.05"
                        value={activeLayer.scale}
                        onChange={(e) => updateActiveLayer({ scale: Number(e.target.value) })}
                        className="w-full accent-brand-red cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-mono text-muted uppercase block mb-1">Position X</span>
                        <input
                          type="range"
                          min="-80"
                          max="80"
                          value={activeLayer.offsetX}
                          onChange={(e) => updateActiveLayer({ offsetX: Number(e.target.value) })}
                          className="w-full accent-brand-red cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-muted uppercase block mb-1">Position Y</span>
                        <input
                          type="range"
                          min="-80"
                          max="80"
                          value={activeLayer.offsetY}
                          onChange={(e) => updateActiveLayer({ offsetY: Number(e.target.value) })}
                          className="w-full accent-brand-red cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PRINT TECHNOLOGY FINISH */}
            {activeTab === 'finish' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-body font-bold text-ink font-display">
                    Select Textile Print Finish
                  </h3>
                  <p className="text-caption text-muted font-sans mt-0.5">
                    Our atelier provides 4 specialized industrial tactile finishes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      id: 'dtg',
                      title: 'Direct-To-Garment (DTG)',
                      tag: '1200 DPI',
                      price: '+₹300',
                      desc: 'Full-color photographic gamut with breathable soft touch.',
                    },
                    {
                      id: 'puff',
                      title: '3D Puff Lettering',
                      tag: 'RAISED 2MM',
                      price: '+₹450',
                      desc: 'Dimensional foam effect that rises from the garment.',
                    },
                    {
                      id: 'embroidery',
                      title: 'Precision Embroidery',
                      tag: '15K STITCHES',
                      price: '+₹550',
                      desc: 'Japanese Madeira threads for luxury archival crests.',
                    },
                    {
                      id: 'distressed',
                      title: 'Vintage Acid Wash',
                      tag: 'CRACKED EFFECT',
                      price: '+₹350',
                      desc: '90s archival wash with authentic micro-wear patina.',
                    },
                  ].map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setFinish(f.id as PrintFinish)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        finish === f.id
                          ? 'border-brand-red bg-brand-red/5 shadow-sm'
                          : 'border-border bg-paper hover:border-ink/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            finish === f.id ? 'border-brand-red' : 'border-muted'
                          }`}>
                            {finish === f.id && <span className="h-2 w-2 rounded-full bg-brand-red" />}
                          </span>
                          <span className="text-caption font-mono font-bold text-ink">
                            {f.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-red">
                          {f.price}
                        </span>
                      </div>
                      <p className="text-caption text-muted mt-1.5 ml-6 font-sans">
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: LAYERS MANAGER */}
            {activeTab === 'layers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption font-mono font-bold text-ink uppercase">
                    All Active Layers ({layers.length})
                  </span>
                </div>

                {layers.map((l, i) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setActiveLayerId(l.id);
                      setCurrentView(l.view);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      activeLayerId === l.id
                        ? 'border-brand-red bg-brand-red/5 shadow-sm'
                        : 'border-border bg-white hover:border-ink/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-paper flex items-center justify-center text-ink">
                        {l.type === 'text' ? <Type size={16} /> : <ImageIcon size={16} />}
                      </div>
                      <div>
                        <span className="text-caption font-mono font-bold text-ink block">
                          {l.type === 'text' ? `"${l.text}"` : `Artwork ${i + 1}`}
                        </span>
                        <span className="text-[10px] font-mono text-muted uppercase">
                          Placed on: {l.view.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLayer(l.id);
                      }}
                      className="text-muted hover:text-danger p-1.5 rounded-lg hover:bg-danger-light transition-colors"
                      title="Delete layer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* GARMENT SIZE SELECTION */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-caption font-mono font-bold text-ink uppercase tracking-wider">
                  Select Size
                </label>
                <span className="text-[11px] font-mono text-muted">
                  Relaxed Oversized Fit
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-11 rounded-xl text-caption font-mono font-bold transition-all ${
                      selectedSize === sz
                        ? 'bg-ink text-white shadow-md'
                        : 'bg-paper text-ink border border-border hover:border-ink'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
