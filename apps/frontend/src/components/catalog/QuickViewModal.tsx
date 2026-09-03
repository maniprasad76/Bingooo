import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShoppingBag, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';

export interface QuickViewProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  customizationEnabled?: boolean;
  category?: { name: string; slug: string } | null;
  variants?: Array<{ id: string; color?: string; colorHex?: string; size?: string; inStock?: boolean }>;
  images?: Array<{ url?: string; object_key?: string }>;
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem, isAdding } = useCart();
  const { toast } = useToast();

  const [selectedColorHex, setSelectedColorHex] = useState('#121318');
  const [selectedSize, setSelectedSize] = useState('L');

  if (!product) return null;

  // Derive colors and sizes
  const colors = product.variants?.filter((v) => v.colorHex) || [
    { id: '1', color: 'Obsidian Black', colorHex: '#121318' },
    { id: '2', color: 'Snow White', colorHex: '#FFFFFF' },
    { id: '3', color: 'Sandstone Wash', colorHex: '#D4C4A8' },
  ];

  const uniqueColors = Array.from(new Map(colors.map((c) => [c.colorHex, c])).values());

  const mainImage =
    product.images?.[0]?.url ||
    product.images?.[0]?.object_key ||
    (product.slug?.includes('graphic')
      ? '/custom/tshirt-step-3-black.png'
      : product.slug?.includes('classic')
      ? '/custom/tshirt-step-1.png'
      : product.slug?.includes('hoodie')
      ? '/custom/tshirt-step-2.png'
      : '/custom/tshirt-step-1.png');

  const handleAdd = () => {
    const matched = product.variants?.find(
      (v) => (v.colorHex === selectedColorHex || !v.colorHex) && v.size === selectedSize
    ) || product.variants?.[0];

    if (matched) {
      addItem(matched.id, 1);
      toast({
        title: 'Added to Bag',
        description: `${product.title} (${selectedSize}) is in your cart`,
        variant: 'success',
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white border border-border shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink transition-transform hover:scale-110 active:scale-95"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: 3D Interactive Garment Preview (7 cols) */}
              <div className="md:col-span-7 bg-paper/60 p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-border">
                {/* Product Image Showcase */}
                <div className="w-full max-w-sm aspect-[4/5] flex items-center justify-center p-4">
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="h-full w-full object-contain p-2 transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="mt-4 flex items-center gap-4 text-caption text-muted font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-brand-red" /> 220 GSM HEAVYWEIGHT
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck size={14} className="text-brand-red" /> FREE SHIPPING &gt; ₹999
                  </span>
                </div>
              </div>

              {/* Right Column: Details & Customizer Actions (5 cols) */}
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {product.category && (
                      <span className="text-[11px] font-mono uppercase tracking-widest text-brand-red font-bold">
                        {product.category.name}
                      </span>
                    )}
                    {product.customizationEnabled && (
                      <Badge variant="accent" size="sm">
                        <Sparkles size={11} className="mr-1" />
                        Studio Ready
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-heading font-extrabold text-ink leading-tight font-display">
                    {product.title}
                  </h2>

                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-ink font-mono">
                      ₹{product.basePrice}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                      <span className="text-body text-muted line-through">
                        ₹{product.compareAtPrice}
                      </span>
                    )}
                  </div>

                  {/* Color Selector */}
                  <div className="mt-6">
                    <label className="text-caption font-bold text-ink uppercase tracking-wider block mb-2 font-mono">
                      Colorway
                    </label>
                    <div className="flex items-center gap-2.5">
                      {uniqueColors.map((col: any, idx) => {
                        const hex = col.colorHex || '#121318';
                        const isSelected = selectedColorHex === hex;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedColorHex(hex)}
                            className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                              isSelected ? 'border-brand-red scale-110 shadow-md' : 'border-border hover:scale-105'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={col.color || 'Color'}
                          >
                            {isSelected && (
                              <Check
                                size={14}
                                className={`mx-auto ${
                                  hex === '#FFFFFF' || hex === '#D4C4A8' ? 'text-ink' : 'text-white'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-caption font-bold text-ink uppercase tracking-wider font-mono">
                        Select Size
                      </label>
                      <span className="text-[11px] text-muted underline cursor-pointer hover:text-ink">
                        Size Guide
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`h-10 rounded-lg text-caption font-bold font-mono transition-all ${
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

                {/* Actions */}
                <div className="mt-8 space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isAdding}
                    onClick={handleAdd}
                    className="bg-brand-red hover:bg-brand-red-hover text-white shadow-glow"
                  >
                    <ShoppingBag size={18} />
                    Add to Bag — ₹{product.basePrice}
                  </Button>

                  {product.customizationEnabled && (
                    <Link to={`/customize/${product.slug}`} onClick={onClose} className="block w-full">
                      <Button variant="outline" size="lg" fullWidth className="border-ink text-ink hover:bg-ink hover:text-white">
                        <Sparkles size={16} />
                        Open in 2D Design Studio
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
