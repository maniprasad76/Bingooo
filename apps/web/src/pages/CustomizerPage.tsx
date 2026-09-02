import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Type, Image as ImageIcon, Trash2, ShoppingBag, Check, Layers } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';

const GARMENT_COLORS = [
  { name: 'Black', hex: '#111111', textColor: '#FFFFFF' },
  { name: 'White', hex: '#FFFFFF', textColor: '#111111' },
  { name: 'Sandstone', hex: '#D4C4A8', textColor: '#111111' },
  { name: 'Charcoal', hex: '#333333', textColor: '#FFFFFF' },
  { name: 'Oatmeal', hex: '#E8DCC8', textColor: '#111111' },
];

const FONTS = [
  { name: 'Inter (Clean Sans)', family: 'sans-serif' },
  { name: 'Playfair (Bold Serif)', family: 'serif' },
  { name: 'Impact (Heavy Gothic)', family: 'Impact, sans-serif' },
  { name: 'Brush Script', family: 'cursive' },
];

interface TextLayer {
  id: string;
  type: 'text';
  text: string;
  font: string;
  color: string;
  size: number;
  rotation: number;
}

interface ImageLayer {
  id: string;
  type: 'image';
  url: string;
  scale: number;
  rotation: number;
}

type Layer = TextLayer | ImageLayer;

export function CustomizerPage() {
  const { productSlug } = useParams<{ productSlug?: string }>();
  const { toast } = useToast();
  const { addItem, isAdding } = useCart();

  // Load product if slug provided, otherwise fallback to first customizable product
  const { data: specificProduct } = useProduct(productSlug);
  const { data: allProducts } = useProducts({ customizable: true });

  const product = specificProduct || allProducts?.data?.[0];

  const [selectedColor, setSelectedColor] = useState(GARMENT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      type: 'image',
      url: '/logo.png',
      scale: 1,
      rotation: 0,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>('1');
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'layers'>('image');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOfficialLogo = (variant: 'red' | 'white' | 'icon') => {
    const url = variant === 'white' ? '/logo-white.png' : variant === 'icon' ? '/icon-192.png' : '/logo.png';
    const newLayer: ImageLayer = {
      id: `logo_${Date.now()}`,
      type: 'image',
      url,
      scale: 1,
      rotation: 0,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setActiveTab('layers');
    toast({ title: 'Bingooo Brand Added', description: 'Reposition or scale the official logo graphic', variant: 'success' });
  };

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // Add new text layer
  const handleAddText = () => {
    const newLayer: TextLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: 'YOUR TEXT',
      font: 'sans-serif',
      color: selectedColor.name === 'White' || selectedColor.name === 'Sandstone' || selectedColor.name === 'Oatmeal' ? '#111111' : '#FFFFFF',
      size: 24,
      rotation: 0,
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  // Upload image handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Image too large', description: 'Maximum file size is 10MB', variant: 'danger' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newLayer: ImageLayer = {
          id: `img_${Date.now()}`,
          type: 'image',
          url,
          scale: 1,
          rotation: 0,
        };
        setLayers([...layers, newLayer]);
        setActiveLayerId(newLayer.id);
        setActiveTab('layers');
        toast({ title: 'Artwork added', description: 'Position and scale your graphic on the garment', variant: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Update layer properties
  const updateActiveLayer = (updates: Partial<Layer>) => {
    if (!activeLayerId) return;
    setLayers(layers.map((l) => (l.id === activeLayerId ? ({ ...l, ...updates } as Layer) : l)));
  };

  // Remove layer
  const handleRemoveLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(null);
    }
  };

  // Base price + customization fee
  const basePrice = product?.base_price || 1299;
  const customizationFee = 300;
  const totalPrice = basePrice + customizationFee;

  // Save customization and add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    setIsSaving(true);
    try {
      // 1. Save design project to backend
      const customization = await api.post<any>('/customizations', {
        productId: product.id,
        designJson: {
          garmentColor: selectedColor.name,
          size: selectedSize,
          layers,
        },
      });

      // 2. Find or match variant
      const matchingVariant = product.variants?.find(
        (v: any) => v.color?.toLowerCase() === selectedColor.name.toLowerCase() && v.size === selectedSize,
      ) || product.variants?.[0];

      if (matchingVariant) {
        // 3. Add to cart with customization ID attached
        addItem(matchingVariant.id, 1, customization.id);
      }
    } catch (err: any) {
      toast({ title: 'Failed to add custom item', description: err.message, variant: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-10">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">
              <Sparkles size={13} className="mr-1" />
              Design Studio
            </Badge>
            <span className="text-caption text-muted">2D Print Customizer</span>
          </div>
          <h1 className="text-display-lg font-bold text-ink mt-1">
            Customise {product?.title || 'Apparel'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-caption text-muted block">Total (with print)</span>
            <span className="text-2xl font-extrabold text-ink">₹{totalPrice}</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            loading={isSaving || isAdding}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} />
            Add Custom Item to Bag
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative aspect-[4/5] w-full max-w-lg rounded-2xl bg-paper border border-border flex items-center justify-center overflow-hidden shadow-inner p-6">
            {/* T-Shirt / Hoodie Mockup Frame */}
            <div
              className="relative h-96 w-80 rounded-2xl border flex flex-col items-center justify-center shadow-xl transition-colors duration-300"
              style={{
                backgroundColor: selectedColor.hex,
                borderColor: selectedColor.name === 'White' ? '#E8E3DC' : 'transparent',
              }}
            >
              {/* Collar detail */}
              <div className="absolute top-0 w-24 h-6 rounded-b-full border-b border-white/20 bg-black/5" />

              {/* Printable Area Box */}
              <div className="relative h-60 w-52 border border-dashed border-accent/80 rounded-lg flex flex-col items-center justify-center overflow-hidden p-2 bg-accent/5">
                <span className="absolute top-1 left-2 text-[9px] font-bold text-accent tracking-widest uppercase opacity-70">
                  Print Zone
                </span>

                {/* Render Layers */}
                {layers.map((layer) => {
                  const isSelected = activeLayerId === layer.id;
                  if (layer.type === 'text') {
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`cursor-pointer p-1 transition-all select-none ${
                          isSelected ? 'ring-2 ring-accent rounded border border-dashed border-accent' : ''
                        }`}
                        style={{
                          fontFamily: layer.font,
                          color: layer.color,
                          fontSize: `${layer.size}px`,
                          transform: `rotate(${layer.rotation}deg)`,
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
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`cursor-pointer p-1 transition-all ${
                          isSelected ? 'ring-2 ring-accent rounded' : ''
                        }`}
                        style={{
                          transform: `scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                        }}
                      >
                        <img
                          src={layer.url}
                          alt="Custom upload"
                          className="max-h-32 max-w-48 object-contain rounded"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

          {/* Quick Garment Color Palette */}
          <div className="mt-6 flex items-center gap-3 bg-white p-3 rounded-full border border-border shadow-sm">
            <span className="text-caption font-semibold text-ink px-2">Garment:</span>
            {GARMENT_COLORS.map((color) => {
              const isSelected = selectedColor.name === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`relative h-8 w-8 rounded-full border-2 transition-transform ${
                    isSelected ? 'border-ink scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      className={`mx-auto ${color.name === 'White' || color.name === 'Sandstone' || color.name === 'Oatmeal' ? 'text-ink' : 'text-white'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Design Controls Toolbox (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
          {/* Tool Selector Tabs */}
          <div className="flex border-b border-border text-caption font-bold">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 border-b-2 transition-colors ${
                activeTab === 'text' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Type size={16} />
              Add Text
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 border-b-2 transition-colors ${
                activeTab === 'image' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <ImageIcon size={16} />
              Upload Art
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 border-b-2 transition-colors ${
                activeTab === 'layers' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Layers size={16} />
              Layers ({layers.length})
            </button>
          </div>

          {/* Tab 1: Text Tool */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <Button variant="outline" fullWidth size="md" onClick={handleAddText}>
                <Type size={16} />
                + Add New Text Layer
              </Button>

              {activeLayer && activeLayer.type === 'text' ? (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div>
                    <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-1">
                      Text Content
                    </label>
                    <input
                      type="text"
                      value={activeLayer.text}
                      onChange={(e) => updateActiveLayer({ text: e.target.value })}
                      className="w-full h-11 px-3 rounded-md border border-border bg-paper text-body font-medium text-ink focus:border-ink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-1">
                      Typography Font
                    </label>
                    <select
                      value={activeLayer.font}
                      onChange={(e) => updateActiveLayer({ font: e.target.value })}
                      className="w-full h-11 px-3 rounded-md border border-border bg-paper text-caption font-medium text-ink focus:border-ink focus:outline-none cursor-pointer"
                    >
                      {FONTS.map((font) => (
                        <option key={font.family} value={font.family}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-caption font-bold text-ink mb-1">
                      <span>Font Size</span>
                      <span>{activeLayer.size}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="48"
                      value={activeLayer.size}
                      onChange={(e) => updateActiveLayer({ size: Number(e.target.value) })}
                      className="w-full accent-ink"
                    />
                  </div>

                  <div>
                    <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      {['#111111', '#FFFFFF', '#D9A441', '#E63946', '#2A9D8F', '#457B9D'].map((hex) => (
                        <button
                          key={hex}
                          onClick={() => updateActiveLayer({ color: hex })}
                          className={`h-8 w-8 rounded-full border border-border shadow-sm ${
                            activeLayer.color === hex ? 'ring-2 ring-ink ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-caption text-muted text-center py-4">
                  Select a text layer or click "+ Add New Text" to customize.
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Artwork Upload */}
          {activeTab === 'image' && (
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
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-ink hover:bg-paper/50 transition-all"
              >
                <ImageIcon size={28} className="mx-auto text-muted mb-2" />
                <h4 className="text-body font-bold text-ink">Upload Custom Artwork</h4>
                <p className="text-caption text-muted mt-1">PNG, JPG, SVG or WEBP up to 10MB</p>
                <Button variant="secondary" size="sm" className="mt-3 pointer-events-none">
                  Choose File
                </Button>
              </div>

              {/* Official Bingooo Brand Graphics */}
              <div className="pt-3 border-t border-border">
                <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-2">
                  Official Bingooo Brand Graphics
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddOfficialLogo('red')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border bg-white hover:border-ink hover:bg-paper transition-all"
                  >
                    <img src="/logo.png" alt="Bingooo Red Logo" className="h-4 object-contain mb-1" />
                    <span className="text-[10px] font-semibold text-muted">Red Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddOfficialLogo('white')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border bg-ink hover:bg-ink/90 transition-all"
                  >
                    <img src="/logo-white.png" alt="Bingooo White Logo" className="h-4 object-contain mb-1" />
                    <span className="text-[10px] font-semibold text-white/80">White Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddOfficialLogo('icon')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border bg-white hover:border-ink hover:bg-paper transition-all"
                  >
                    <img src="/icon-192.png" alt="Bingooo Icon Badge" className="h-5 w-5 object-contain mb-1" />
                    <span className="text-[10px] font-semibold text-muted">B Mark</span>
                  </button>
                </div>
              </div>

              {activeLayer && activeLayer.type === 'image' && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div>
                    <div className="flex justify-between text-caption font-bold text-ink mb-1">
                      <span>Artwork Scale</span>
                      <span>{Math.round(activeLayer.scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={activeLayer.scale}
                      onChange={(e) => updateActiveLayer({ scale: Number(e.target.value) })}
                      className="w-full accent-ink"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Layers Manager */}
          {activeTab === 'layers' && (
            <div className="space-y-2">
              {layers.map((l, i) => (
                <div
                  key={l.id}
                  onClick={() => setActiveLayerId(l.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    activeLayerId === l.id
                      ? 'border-ink bg-paper shadow-sm'
                      : 'border-border bg-white hover:border-ink/40'
                  }`}
                >
                  <div className="flex items-center gap-2 text-caption font-semibold text-ink">
                    {l.type === 'text' ? <Type size={15} /> : <ImageIcon size={15} />}
                    <span>
                      {l.type === 'text' ? `Text: "${l.text}"` : `Image Artwork ${i + 1}`}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLayer(l.id);
                    }}
                    className="text-muted hover:text-danger p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Garment Size Selection */}
          <div className="pt-4 border-t border-border space-y-2">
            <label className="text-caption font-bold text-ink uppercase tracking-wider block">
              Choose Apparel Size
            </label>
            <div className="grid grid-cols-5 gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-10 rounded border text-caption font-bold transition-all ${
                    selectedSize === size
                      ? 'border-ink bg-ink text-white shadow-sm'
                      : 'border-border bg-white text-ink hover:border-ink/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
