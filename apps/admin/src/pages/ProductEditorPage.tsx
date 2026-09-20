import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Layers,
  Tag,
  Eye,
  RefreshCw,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Star,
  Zap,
  Info,
  Flame,
  Percent,
} from 'lucide-react';
import { api } from '../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariantForm {
  id?: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  stockQuantity: number;
}

const PRESET_COLORS = [
  { name: 'Charcoal Black', hex: '#171717' },
  { name: 'Vintage Cream', hex: '#F7EEDB' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Atelier Crimson', hex: '#E6321C' },
  { name: 'Heather Grey', hex: '#77736D' },
  { name: 'Midnight Navy', hex: '#1E293B' },
  { name: 'Olive Drab', hex: '#4A553E' },
  { name: 'Sand Dune', hex: '#D8C8B1' },
];

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const IMAGE_SLOT_LABELS = [
  { label: 'Image 1: Primary Front (Hero)', hint: 'Main display image across catalog and hero header' },
  { label: 'Image 2: Back View', hint: 'Shows rear silhouette and back print details' },
  { label: 'Image 3: Angle / Side Profile', hint: 'Highlights drape, shoulder drop, and fit' },
  { label: 'Image 4: Fabric & Detail Close-Up', hint: 'Demonstrates weave, stitching, and texture' },
  { label: 'Image 5: Model / Lifestyle', hint: 'Real-world styling on model in natural light' },
];

const FABRIC_PRESETS = [
  '100% Combed Cotton Jersey',
  '380 GSM Heavyweight Brushed Fleece',
  '240 GSM Premium Combed Cotton',
  'French Terry Loopback Cotton',
  '100% Supima Luxury Cotton',
  'Vintage Washed Cotton Denim',
];

const FIT_PRESETS = [
  'Boxy Drop Shoulder',
  'Relaxed Streetwear Fit',
  'Classic Oversized Silhouette',
  'Tailored Regular Fit',
  'Loose Athletic Fit',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Loading states
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeUploadSlot, setActiveUploadSlot] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // ── 1. BASIC INFORMATION ──
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');

  // ── 2. PRICING & MERCHANDISING BADGES ──
  const [basePrice, setBasePrice] = useState<number>(999);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(1499);
  const [isSale, setIsSale] = useState(true);
  const [saleTag, setSaleTag] = useState('');
  const [isBestseller, setIsBestseller] = useState(false);
  const [badgeText, setBadgeText] = useState('NEW DROP');
  const [customizationEnabled, setCustomizationEnabled] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // ── 3. 5 PRODUCT IMAGES ──
  const [slotImages, setSlotImages] = useState<string[]>([
    '/custom/tshirt-step-1.png',
    '/custom/tshirt-step-1.png',
    '/custom/tshirt-step-2.png',
    '',
    '',
  ]);

  // ── 4. GARMENT & FABRIC SPECIFICATIONS ("THE DETAILS" SECTION) ──
  const [fabric, setFabric] = useState('240 GSM Combed Cotton Jersey');
  const [gsm, setGsm] = useState('240');
  const [fit, setFit] = useState('Boxy Drop Shoulder');
  const [designDetails, setDesignDetails] = useState(
    'Signature Bingooo atelier branding with clean minimal chest and collar detailing.'
  );
  const [careInstructions, setCareInstructions] = useState(
    'Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low.'
  );

  // ── 5. COLORS WHAT WE HAVE ──
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Charcoal Black', hex: '#171717' },
    { name: 'Vintage Cream', hex: '#F7EEDB' },
    { name: 'Atelier Crimson', hex: '#E6321C' },
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#2563EB');

  // ── 6. SIZES WHAT WE HAVE ──
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  // ── 7. VARIANT MATRIX TABLE ──
  const [variants, setVariants] = useState<ProductVariantForm[]>([]);
  const [bulkStockValue, setBulkStockValue] = useState<number>(25);

  // ── 8. TAGS & SEO ──
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['streetwear', 'oversized', 'bestseller']);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // ── LIVE PREVIEW STATE ──
  const [previewTab, setPreviewTab] = useState<'card' | 'details'>('card');
  const [previewActiveImage, setPreviewActiveImage] = useState(0);
  const [previewColorIdx, setPreviewColorIdx] = useState(0);

  // Calculate discount percentage
  const discountPercent = useMemo(() => {
    if (compareAtPrice > basePrice && compareAtPrice > 0) {
      return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
    }
    return 0;
  }, [basePrice, compareAtPrice]);

  // Derived effective sale tag
  const effectiveSaleTag = useMemo(() => {
    if (saleTag.trim()) return saleTag.trim();
    if (discountPercent > 0) return `SALE • ${discountPercent}% OFF`;
    return 'ON SALE';
  }, [saleTag, discountPercent]);

  // Handle Title input
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual && !isEditing) {
      setSlug(slugify(val));
    }
  };

  // Fetch categories
  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then((cats) => {
        setCategories(cats || []);
        if (cats && cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
      })
      .catch(() => {
        setCategories([
          { id: 'cat-tshirts', name: 'T-Shirts', slug: 't-shirts' },
          { id: 'cat-hoodies', name: 'Hoodies', slug: 'hoodies' },
          { id: 'cat-sweatshirts', name: 'Sweatshirts', slug: 'sweatshirts' },
          { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
        ]);
      });
  }, []);

  // Load existing product if editing
  useEffect(() => {
    if (!id) return;
    setInitialLoading(true);
    api
      .get<any>(`/products/${id}`)
      .then((p) => {
        if (!p) return;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setIsSlugManual(true);
        setDescription(p.description || '');
        setCategoryId(p.category_id || p.category?.id || '');
        setStatus(p.status || 'active');
        setBasePrice(Number(p.base_price) || 999);
        setCompareAtPrice(Number(p.compare_at_price) || Math.round(Number(p.base_price || 999) * 1.3));
        setIsSale(p.is_sale ?? (Number(p.compare_at_price) > Number(p.base_price)));
        setSaleTag(p.sale_tag || '');
        setIsBestseller(Boolean(p.bestseller));
        setBadgeText(p.badge_text || 'NEW DROP');
        setCustomizationEnabled(p.customization_enabled !== false);
        setIsFeatured(Boolean(p.featured));

        // Details
        setFabric(p.fabric || '240 GSM Combed Cotton Jersey');
        setGsm(p.gsm || '240');
        setFit(p.fit || 'Boxy Drop Shoulder');
        setDesignDetails(
          p.design_details ||
            p.designDetails ||
            'Signature Bingooo atelier branding with clean minimal chest and collar detailing.'
        );
        setCareInstructions(p.care_instructions || 'Machine wash cold inside out with similar colors.');
        setTags(Array.isArray(p.tags) ? p.tags : ['streetwear']);
        setSeoTitle(p.seo_title || '');
        setSeoDescription(p.seo_description || '');

        // 5 Image slots
        if (Array.isArray(p.images) && p.images.length > 0) {
          const loadedSlots = ['', '', '', '', ''];
          p.images.slice(0, 5).forEach((img: any, idx: number) => {
            loadedSlots[idx] = typeof img === 'string' ? img : img.url || '';
          });
          setSlotImages(loadedSlots);
        }

        // Variants
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          setVariants(
            p.variants.map((v: any) => ({
              id: v.id,
              sku: v.sku,
              size: v.size || 'M',
              color: v.color || 'Standard',
              colorHex: v.colorHex || v.color_hex || '#171717',
              price: Number(v.price) || p.base_price,
              stockQuantity: Number(v.stockQuantity ?? v.stock_quantity ?? 10),
            }))
          );

          // Extract colors and sizes
          const colorMap = new Map<string, string>();
          const sizeSet = new Set<string>();
          p.variants.forEach((v: any) => {
            if (v.color) colorMap.set(v.color, v.colorHex || v.color_hex || '#171717');
            if (v.size) sizeSet.add(v.size);
          });
          if (colorMap.size > 0) {
            setSelectedColors(Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })));
          }
          if (sizeSet.size > 0) {
            setSelectedSizes(Array.from(sizeSet));
          }
        }
      })
      .catch((err) => {
        setNotification({ type: 'error', message: err.message || 'Failed to load product' });
      })
      .finally(() => setInitialLoading(false));
  }, [id]);

  // Initial variant matrix generation for new product
  useEffect(() => {
    if (!isEditing && variants.length === 0 && selectedColors.length > 0 && selectedSizes.length > 0) {
      generateVariantMatrix();
    }
  }, [selectedColors, selectedSizes]);

  // Re-generate Cartesian variant matrix (Colors × Sizes)
  const generateVariantMatrix = () => {
    const productSlug = slug || slugify(title) || 'PROD';
    const newVariants: ProductVariantForm[] = [];

    selectedColors.forEach((c) => {
      selectedSizes.forEach((s) => {
        const colorCode = c.name.slice(0, 3).toUpperCase().replace(/\s+/g, '');
        const sku = `${productSlug}-${s}-${colorCode}`.toUpperCase();
        const existing = variants.find((v) => v.size === s && v.color === c.name);
        newVariants.push({
          id: existing?.id,
          sku: existing?.sku || sku,
          size: s,
          color: c.name,
          colorHex: c.hex,
          price: existing?.price || basePrice,
          stockQuantity: existing?.stockQuantity !== undefined ? existing.stockQuantity : 25,
        });
      });
    });

    setVariants(newVariants);
  };

  // Color selection
  const toggleColorPreset = (c: { name: string; hex: string }) => {
    const exists = selectedColors.some((x) => x.name === c.name);
    if (exists) {
      if (selectedColors.length <= 1) {
        setNotification({ type: 'error', message: 'At least one color is required' });
        return;
      }
      setSelectedColors(selectedColors.filter((x) => x.name !== c.name));
    } else {
      setSelectedColors([...selectedColors, c]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    if (selectedColors.some((c) => c.name.toLowerCase() === customColorName.trim().toLowerCase())) {
      setNotification({ type: 'error', message: 'Color already added' });
      return;
    }
    setSelectedColors([...selectedColors, { name: customColorName.trim(), hex: customColorHex }]);
    setCustomColorName('');
  };

  // Size selection
  const toggleSize = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      if (selectedSizes.length <= 1) {
        setNotification({ type: 'error', message: 'At least one size is required' });
        return;
      }
      setSelectedSizes(selectedSizes.filter((s) => s !== sz));
    } else {
      const order = PRESET_SIZES;
      const next = [...selectedSizes, sz].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      setSelectedSizes(next);
    }
  };

  // Image slot upload handler
  const handleSlotUpload = async (slotIndex: number, file: File) => {
    setActiveUploadSlot(slotIndex);
    try {
      const res = await api.upload(file, 'products');
      const url = res.url || (res as any).filePath;
      if (url) {
        setSlotImages((prev) => {
          const next = [...prev];
          next[slotIndex] = url;
          return next;
        });
        setNotification({ type: 'success', message: `Image ${slotIndex + 1} uploaded successfully` });
        toast.success('Image Uploaded', `Slot ${slotIndex + 1} updated.`);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Image upload failed' });
      toast.error('Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setActiveUploadSlot(null);
    }
  };

  const clearSlotImage = (slotIndex: number) => {
    setSlotImages((prev) => {
      const next = [...prev];
      next[slotIndex] = '';
      return next;
    });
    toast.info('Image Cleared', `Slot ${slotIndex + 1} removed.`);
  };

  // Bulk stock update
  const applyBulkStock = () => {
    setVariants((prev) => prev.map((v) => ({ ...v, stockQuantity: bulkStockValue })));
    setNotification({ type: 'success', message: `All variant stocks set to ${bulkStockValue}` });
    toast.success('Bulk Stock Updated', `All variants set to ${bulkStockValue} units.`);
  };

  // Tags
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,+|,+$/g, '');
      if (val && !tags.includes(val.toLowerCase())) {
        setTags([...tags, val.toLowerCase()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  // Submit product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setNotification({ type: 'error', message: 'Product title is required' });
      return;
    }
    if (!slug.trim()) {
      setNotification({ type: 'error', message: 'Product slug is required' });
      return;
    }
    if (basePrice <= 0) {
      setNotification({ type: 'error', message: 'Price must be greater than 0' });
      return;
    }

    const filteredImages = slotImages
      .filter((url) => Boolean(url && url.trim()))
      .map((url, idx) => ({
        url: url.trim(),
        alt_text: `${title} - Angle ${idx + 1}`,
        is_primary: idx === 0,
      }));

    if (filteredImages.length === 0) {
      setNotification({ type: 'error', message: 'Please provide at least 1 image (Primary Front)' });
      toast.error('Validation Error', 'Please provide at least 1 image (Primary Front).');
      return;
    }

    setSaving(true);
    setNotification(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      categoryId: categoryId || undefined,
      status,
      basePrice: Number(basePrice),
      compareAtPrice: Number(compareAtPrice) || undefined,
      isSale,
      saleTag: isSale ? effectiveSaleTag : undefined,
      bestseller: isBestseller,
      badgeText: badgeText.trim() || undefined,
      customizationEnabled,
      featured: isFeatured,
      fabric,
      gsm,
      fit,
      designDetails,
      careInstructions,
      tags,
      seoTitle: seoTitle || `${title.toUpperCase()} — BINGOOO`,
      seoDescription: seoDescription || description || undefined,
      images: filteredImages,
      imageUrl: filteredImages[0]?.url,
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        price: Number(v.price),
        stockQuantity: Number(v.stockQuantity),
      })),
    };

    try {
      if (isEditing) {
        await api.patch(`/products/${id}`, payload);
        setNotification({ type: 'success', message: 'Product updated successfully!' });
        toast.success('Product Updated', `"${title}" has been saved successfully.`);
      } else {
        await api.post('/products', payload);
        setNotification({ type: 'success', message: 'Product created and published successfully!' });
        toast.success('Product Created', `"${title}" has been added to the catalog.`);
      }
      setTimeout(() => {
        navigate('/products');
      }, 700);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save product' });
      toast.error('Failed to save product', err.message || 'Check form inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  // Preview data
  const validImages = useMemo(() => {
    const list = slotImages.filter((s) => Boolean(s && s.trim()));
    return list.length > 0 ? list : ['/custom/tshirt-step-1.png'];
  }, [slotImages]);

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => c.id === categoryId)?.name || 'T-SHIRTS';
  }, [categories, categoryId]);

  const totalInventory = useMemo(() => {
    return variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  }, [variants]);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoaderCircle size={32} className="animate-spin text-brand-red" />
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Loading product studio…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24">
      {/* ─────────────────────────────────────────────────────────
          STICKY TOP ACTION BAR
      ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper/95 backdrop-blur-md py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-ink hover:bg-beige transition-colors"
            title="Back to products"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                Studio / {isEditing ? 'Edit' : 'Create'}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'draft'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {status}
              </span>
              {isBestseller && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#171717] text-white">
                  <Flame size={10} /> Bestseller
                </span>
              )}
              {isSale && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-brand-red text-white">
                  <Percent size={10} /> Sale Tag Active
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-ink truncate max-w-xl">
              {title || (isEditing ? 'Edit Product' : 'Add New Product')}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="admin-select text-xs py-1.5 font-semibold"
          >
            <option value="active">Active (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>

          <Link to="/products" className="btn-secondary py-1.5 px-3 text-xs">
            Cancel
          </Link>

          <button type="submit" disabled={saving} className="btn-primary py-1.5 px-4 text-xs">
            {saving ? (
              <>
                <LoaderCircle size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={14} /> {isEditing ? 'Update Product' : 'Publish Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          2-COLUMN STUDIO LAYOUT
      ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =======================================================
            LEFT COLUMN (7 cols): PRODUCT CONTROLS & MANAGEMENT
        ======================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. BASIC INFORMATION */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">1. Basic Information</h3>
              </div>
              <span className="text-[10px] text-muted">Title, Slug, Category & Narrative</span>
            </div>

            <div>
              <label className="admin-label">
                Product Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                className="admin-input font-bold text-sm"
                placeholder="e.g. Classic Heavyweight Oversized Tee"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="admin-label mb-0">
                    URL Slug <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSlugManual(false);
                      setSlug(slugify(title));
                    }}
                    className="text-[10px] text-brand-red font-semibold hover:underline"
                  >
                    Auto-generate
                  </button>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 h-9 rounded-l-md border border-r-0 border-border bg-beige text-xs text-muted font-mono">
                    /product/
                  </span>
                  <input
                    type="text"
                    required
                    className="admin-input rounded-l-none font-mono text-xs"
                    placeholder="classic-oversized-tee"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(slugify(e.target.value));
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Category</label>
                <select
                  className="admin-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="admin-label">Description (Shown on Product Page & Story)</label>
              <textarea
                className="admin-input min-h-[90px] text-xs leading-relaxed resize-y"
                placeholder="Constructed from premium 240 GSM combed cotton with dropped shoulders and double-needle ribbed collar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* 2. 5 PRODUCT IMAGES (EXPLICIT SLOTS) */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  2. Product Gallery (5 Multi-Angle Images)
                </h3>
              </div>
              <span className="text-[10px] text-muted">
                {slotImages.filter(Boolean).length}/5 slots filled
              </span>
            </div>

            <p className="text-[11px] text-muted">
              The customer product page showcases up to 5 visual angles with an interactive thumbnail gallery.
              Upload a file or enter an image URL for each view:
            </p>

            <div className="space-y-3">
              {IMAGE_SLOT_LABELS.map((slot, idx) => {
                const currentImg = slotImages[idx];
                const isUploading = activeUploadSlot === idx;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                      currentImg
                        ? 'border-border bg-white'
                        : 'border-dashed border-border/80 bg-beige/20'
                    }`}
                  >
                    {/* Thumbnail + Slot Title */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#EDE0CC] border border-border shrink-0 flex items-center justify-center">
                        {currentImg ? (
                          <img
                            src={currentImg}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon size={20} className="text-muted/60" />
                        )}
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-brand-red text-white text-[7px] font-black uppercase text-center py-0.5">
                            Primary
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <span>{slot.label}</span>
                          {currentImg && <CheckCircle2 size={13} className="text-emerald-600" />}
                        </p>
                        <p className="text-[10px] text-muted">{slot.hint}</p>
                      </div>
                    </div>

                    {/* Controls: Upload & URL */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={currentImg}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSlotImages((prev) => {
                            const next = [...prev];
                            next[idx] = val;
                            return next;
                          });
                        }}
                        className="admin-input text-[11px] font-mono py-1 px-2.5 w-44 sm:w-56"
                      />

                      <label className="btn-secondary text-xs py-1 px-2.5 cursor-pointer shrink-0">
                        {isUploading ? (
                          <LoaderCircle size={13} className="animate-spin" />
                        ) : (
                          <Upload size={13} />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSlotUpload(idx, file);
                          }}
                        />
                      </label>

                      {currentImg && (
                        <button
                          type="button"
                          onClick={() => clearSlotImage(idx)}
                          className="p-1.5 text-muted hover:text-danger rounded hover:bg-danger/10"
                          title="Clear image"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PRICING, SALE TAG & MERCHANDISING BADGES */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  3. Pricing & Merchandising Tags
                </h3>
              </div>
              <span className="text-[10px] text-muted">Sale tags, Bestseller tags & 3D Atelier</span>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">
                  Selling Base Price (₹) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    required
                    className="admin-input pl-7 font-bold text-ink"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Compare-At MSRP (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min={0}
                    className="admin-input pl-7 text-muted"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(Math.max(0, Number(e.target.value)))}
                  />
                </div>
                {discountPercent > 0 && (
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">
                    Calculated Customer Savings: {discountPercent}% OFF
                  </p>
                )}
              </div>
            </div>

            {/* Badges & Tags Matrix */}
            <div className="p-3.5 rounded-lg border border-border bg-beige/20 space-y-3">
              <p className="text-xs font-bold text-ink">Storefront Badges & Flags</p>

              {/* Sale Tag Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSale}
                    onChange={(e) => setIsSale(e.target.checked)}
                    className="rounded border-border text-brand-red focus:ring-brand-red"
                  />
                  <div>
                    <span className="text-xs font-bold text-ink block">Enable Sale Tag</span>
                    <span className="text-[10px] text-muted">Displays red discount badge on card & page</span>
                  </div>
                </label>

                {isSale && (
                  <input
                    type="text"
                    placeholder={`e.g. SALE • ${discountPercent || 30}% OFF`}
                    value={saleTag}
                    onChange={(e) => setSaleTag(e.target.value)}
                    className="admin-input text-xs py-1.5"
                  />
                )}
              </div>

              {/* Bestseller & Custom Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2 border-t border-border">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded border-border text-brand-red focus:ring-brand-red"
                  />
                  <div>
                    <span className="text-xs font-bold text-ink block">Bestseller Tag</span>
                    <span className="text-[10px] text-muted">Displays black "BESTSELLER" banner</span>
                  </div>
                </label>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase block mb-1">
                    Custom Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW DROP, LIMITED EDITION"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="admin-input text-xs py-1.5 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Customizer & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customizationEnabled}
                    onChange={(e) => setCustomizationEnabled(e.target.checked)}
                    className="rounded border-border text-brand-red focus:ring-brand-red"
                  />
                  <div>
                    <span className="text-xs font-bold text-ink block">3D Customizer / Atelier</span>
                    <span className="text-[10px] text-muted">Customers can customize in 3D studio</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-border text-brand-red focus:ring-brand-red"
                  />
                  <div>
                    <span className="text-xs font-bold text-ink block">Featured on Homepage</span>
                    <span className="text-[10px] text-muted">Pin to curated storefront collections</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 4. GARMENT & FABRIC SPECIFICATIONS (DIRECTLY FEEDS "THE DETAILS") */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  4. Garment & Fabric Specifications ("THE DETAILS")
                </h3>
              </div>
              <span className="text-[10px] text-muted">Renders in the 4-box grid on product page</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Fabric Composition</label>
                <input
                  type="text"
                  className="admin-input text-xs"
                  placeholder="240 GSM Combed Cotton Jersey"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {FABRIC_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFabric(p)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-beige text-muted hover:text-ink"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="admin-label">Fabric Weight (GSM)</label>
                <input
                  type="text"
                  className="admin-input text-xs font-mono"
                  placeholder="240"
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                />
                <p className="text-[10px] text-muted mt-1">e.g. 180 (Light), 240 (Heavyweight Tee), 380 (Hoodie)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Fit & Silhouette</label>
                <input
                  type="text"
                  className="admin-input text-xs"
                  placeholder="Boxy Drop Shoulder"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {FIT_PRESETS.slice(0, 3).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-beige text-muted hover:text-ink"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="admin-label">Design & Graphic Details</label>
                <input
                  type="text"
                  className="admin-input text-xs"
                  placeholder="Signature minimal chest print & reinforced collar"
                  value={designDetails}
                  onChange={(e) => setDesignDetails(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Care & Laundry Instructions</label>
              <textarea
                className="admin-input text-xs min-h-[60px] resize-y"
                placeholder="Machine wash cold inside out with similar colors. Do not iron directly on print. Tumble dry low."
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* 5. COLORS WHAT WE HAVE */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  5. Colors What We Have ({selectedColors.length})
                </h3>
              </div>
              <span className="text-[10px] text-muted">Generates customer color swatches</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColors.some((x) => x.name === c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleColorPreset(c)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'border-brand-red bg-brand-red/5 text-ink shadow-2xs'
                        : 'border-border bg-white text-muted hover:border-ink'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    {isSelected ? <Check size={12} className="text-brand-red" /> : <Plus size={12} />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Adder */}
            <div className="flex items-center gap-2 max-w-sm pt-2 border-t border-border">
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5 bg-white"
                title="Choose custom hex"
              />
              <input
                type="text"
                placeholder="Custom color name (e.g. Sage Green)"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="admin-input text-xs py-1.5 flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                disabled={!customColorName.trim()}
                className="btn-secondary text-xs py-1.5 px-3 shrink-0"
              >
                <Plus size={13} /> Add Color
              </button>
            </div>
          </div>

          {/* 6. SIZES WHAT WE HAVE */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  6. Sizes What We Have ({selectedSizes.length})
                </h3>
              </div>
              <span className="text-[10px] text-muted">Generates customer size selector pills</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`w-11 h-11 rounded-lg text-xs font-extrabold border transition-all ${
                      isSelected
                        ? 'border-ink bg-ink text-white shadow-xs'
                        : 'border-border bg-white text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. VARIANT MATRIX TABLE & STOCK MANAGEMENT */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  7. Variant Matrix ({variants.length} Combinations)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted">{totalInventory} total units</span>
            </div>

            {/* Matrix generator & Bulk Stock toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-beige/40 p-3 rounded-lg border border-border">
              <button
                type="button"
                onClick={generateVariantMatrix}
                className="btn-secondary text-xs py-1.5 gap-1.5 font-bold"
              >
                <RefreshCw size={13} /> Re-Generate Combinations ({selectedColors.length} × {selectedSizes.length})
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted font-medium">Bulk Stock:</span>
                <input
                  type="number"
                  min={0}
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(Number(e.target.value))}
                  className="admin-input w-16 py-1 text-center text-xs"
                />
                <button
                  type="button"
                  onClick={applyBulkStock}
                  className="btn-ghost text-xs py-1 px-2.5 border border-border"
                >
                  Apply All
                </button>
              </div>
            </div>

            {/* Table */}
            {variants.length > 0 && (
              <div className="overflow-x-auto border border-border rounded-lg max-h-80 overflow-y-auto">
                <table className="admin-table text-xs">
                  <thead className="sticky top-0 bg-beige/95 backdrop-blur-xs z-10">
                    <tr>
                      <th>Color</th>
                      <th>Size</th>
                      <th>SKU</th>
                      <th>Price (₹)</th>
                      <th>Stock Qty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-beige/30">
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                            />
                            <span className="font-semibold text-ink">{v.color}</span>
                          </div>
                        </td>
                        <td className="font-bold">{v.size}</td>
                        <td className="font-mono text-[11px] text-muted">{v.sku}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={v.price}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                              );
                            }}
                            className="admin-input w-20 py-1 text-xs font-semibold"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={v.stockQuantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setVariants((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, stockQuantity: val } : item))
                              );
                            }}
                            className={`admin-input w-20 py-1 text-xs font-semibold ${
                              v.stockQuantity <= 5 ? 'border-amber-500 bg-amber-50/50' : ''
                            }`}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-muted hover:text-danger p-1"
                            title="Remove variant"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 8. CATALOG TAGS & SEO */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">8. Search Tags & Google SEO</h3>
              </div>
              <span className="text-[10px] text-muted">Discovery & organic search</span>
            </div>

            <div>
              <label className="admin-label">Search Tags (Press Enter or Comma)</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-border bg-white min-h-[42px]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-beige text-xs font-medium text-ink"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-muted hover:text-danger"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add search tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[90px] border-none outline-none text-xs bg-transparent p-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <div>
                <label className="admin-label">SEO Meta Title</label>
                <input
                  type="text"
                  className="admin-input text-xs"
                  placeholder={`${(title || 'PRODUCT').toUpperCase()} — BINGOOO`}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="admin-label">SEO Meta Description</label>
                <textarea
                  className="admin-input text-xs min-h-[60px] resize-y"
                  placeholder="Engineered streetwear crafted with premium cotton..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Google SERP card */}
            <div className="p-3 rounded-lg border border-border bg-white space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Search Engine Snippet</span>
              <p className="text-xs text-blue-700 font-medium hover:underline cursor-pointer truncate">
                {seoTitle || `${(title || 'Product Title').toUpperCase()} — BINGOOO`}
              </p>
              <p className="text-[11px] text-emerald-700 font-mono truncate">
                https://bingooo.in/product/{slug || 'classic-oversized-tee'}
              </p>
              <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                {seoDescription || description || 'BINGOOO luxury streetwear fashion, custom drops and clothing culture.'}
              </p>
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT COLUMN (5 cols): STICKY LIVE FRONTEND PREVIEW
        ======================================================= */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center justify-between bg-beige/60 p-1 rounded-lg border border-border">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewTab('card')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  previewTab === 'card' ? 'bg-white text-ink shadow-2xs' : 'text-muted hover:text-ink'
                }`}
              >
                Storefront Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('details')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  previewTab === 'details' ? 'bg-white text-ink shadow-2xs' : 'text-muted hover:text-ink'
                }`}
              >
                Product Page (Full)
              </button>
            </div>
            <span className="text-[10px] font-mono uppercase text-muted pr-2 flex items-center gap-1">
              <Eye size={12} /> Live Preview
            </span>
          </div>

          {/* PREVIEW TAB 1: STOREFRONT CATALOG CARD */}
          {previewTab === 'card' && (
            <div className="bg-[#F7EEDB] border border-[#DDD3C5] rounded-xl p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#6F6A63] mb-2 flex items-center justify-between">
                <span>CATALOG GRID CARD PREVIEW</span>
                <span>/shop</span>
              </div>

              <div className="bg-[#F7EEDB] border border-[#DDD3C5] overflow-hidden rounded-lg max-w-sm mx-auto shadow-2xs">
                {/* Image */}
                <div className="relative aspect-[4/5] bg-[#EDE0CC] overflow-hidden">
                  <img
                    src={validImages[0]}
                    alt={title || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 select-none">
                    {isBestseller && (
                      <span className="px-2 py-0.5 bg-[#171717] text-white text-[8px] font-black tracking-widest uppercase">
                        BESTSELLER
                      </span>
                    )}
                    {(isSale || compareAtPrice > basePrice) && (
                      <span className="px-2 py-0.5 bg-[#E6321C] text-white text-[8px] font-black tracking-widest uppercase">
                        {effectiveSaleTag}
                      </span>
                    )}
                    {badgeText && !isBestseller && (
                      <span className="px-2 py-0.5 bg-[#171717] text-white text-[8px] font-black tracking-widest uppercase">
                        {badgeText}
                      </span>
                    )}
                  </div>

                  {customizationEnabled && (
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[#171717] text-[8px] font-extrabold uppercase tracking-wider rounded border border-[#DDD3C5]">
                      3D Customizer
                    </span>
                  )}
                </div>

                {/* Card details */}
                <div className="p-3.5 space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6F6A63]">
                    BINGOOO / {selectedCategoryName.toUpperCase()}
                  </p>
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-[#171717] leading-tight truncate">
                    {title || 'CLASSIC OVERSIZED TEE'}
                  </h4>

                  {/* Colors */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {selectedColors.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setPreviewColorIdx(i)}
                        className={`w-3.5 h-3.5 rounded-full border ${
                          previewColorIdx === i ? 'ring-2 ring-[#171717] ring-offset-1' : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 pt-1 border-t border-[#DDD3C5]/60 mt-2">
                    <span className="text-sm font-black text-[#171717]">₹{basePrice}</span>
                    {compareAtPrice > basePrice && (
                      <span className="text-xs text-[#6F6A63] line-through">₹{compareAtPrice}</span>
                    )}
                    <span className="text-[9px] text-emerald-700 font-bold ml-auto">
                      5% off prepaid
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW TAB 2: FULL PRODUCT PAGE (GALLERY + DETAILS) */}
          {previewTab === 'details' && (
            <div className="bg-[#F7EEDB] border border-[#DDD3C5] rounded-xl p-4 shadow-sm space-y-4 max-h-[82vh] overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#6F6A63] flex items-center justify-between pb-2 border-b border-[#DDD3C5]">
                <span>PRODUCT PAGE PREVIEW</span>
                <span>/product/{slug || 'preview'}</span>
              </div>

              {/* 5-Image Gallery Simulation */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#6F6A63] block">
                  Gallery ({validImages.length} images)
                </span>
                <div className="flex gap-2 items-center">
                  {/* Thumbnails */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {validImages.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewActiveImage(i)}
                        className={`w-10 h-10 rounded border overflow-hidden bg-[#EDE0CC] ${
                          previewActiveImage === i ? 'border-2 border-[#171717]' : 'border-[#DDD3C5]'
                        }`}
                      >
                        <img src={src} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Main Preview Image */}
                  <div className="relative aspect-[4/5] flex-1 bg-[#EDE0CC] rounded-lg overflow-hidden border border-[#DDD3C5]">
                    <img
                      src={validImages[previewActiveImage] || validImages[0]}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 select-none">
                      {isBestseller && (
                        <span className="px-2 py-0.5 bg-[#171717] text-white text-[8px] font-black uppercase">
                          BESTSELLER
                        </span>
                      )}
                      {(isSale || compareAtPrice > basePrice) && (
                        <span className="px-2 py-0.5 bg-[#E6321C] text-white text-[8px] font-black uppercase">
                          {effectiveSaleTag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Price Header */}
              <div className="space-y-1.5 pt-2 border-t border-[#DDD3C5]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F6A63]">
                  BINGOOO / {selectedCategoryName.toUpperCase()}
                </p>
                <h3 className="text-base font-black uppercase tracking-tight text-[#171717]">
                  {(title || 'CLASSIC LOGO TEE').toUpperCase()}
                </h3>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-black text-[#171717]">₹{basePrice}</span>
                  {compareAtPrice > basePrice && (
                    <span className="text-xs text-[#6F6A63] line-through">₹{compareAtPrice}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#E6321C] text-white text-[8px] font-black uppercase">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Colors & Sizes What We Have */}
              <div className="space-y-2 pt-2 border-t border-[#DDD3C5]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#171717] block mb-1">
                    Colors: {selectedColors.map((c) => c.name).join(', ')}
                  </span>
                  <div className="flex gap-1.5">
                    {selectedColors.map((c) => (
                      <span
                        key={c.name}
                        className="w-4 h-4 rounded-full border border-black/25"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-[#171717] block mb-1">
                    Sizes What We Have
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSizes.map((sz) => (
                      <span
                        key={sz}
                        className="px-2 py-0.5 rounded text-[10px] font-bold border border-[#DDD3C5] bg-white text-[#171717]"
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* "THE DETAILS" 4-Box Section Preview */}
              <div className="space-y-2 pt-2 border-t border-[#DDD3C5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block">
                  THE DETAILS (Product Page Grid)
                </span>
                <p className="text-[11px] text-[#6F6A63] leading-relaxed italic">
                  "{description || 'Designed for everyday movement and built around effortless styling...'}"
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-2 bg-white/80 rounded border border-[#DDD3C5]">
                    <span className="font-bold text-[9px] uppercase text-[#6F6A63] block">Fabric</span>
                    <span className="font-semibold text-[#171717]">{fabric || '240 GSM Combed Cotton'}</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded border border-[#DDD3C5]">
                    <span className="font-bold text-[9px] uppercase text-[#6F6A63] block">Fit</span>
                    <span className="font-semibold text-[#171717]">{fit || 'Boxy Drop Shoulder'}</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded border border-[#DDD3C5]">
                    <span className="font-bold text-[9px] uppercase text-[#6F6A63] block">Design</span>
                    <span className="font-semibold text-[#171717]">{designDetails || 'Signature minimal print'}</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded border border-[#DDD3C5]">
                    <span className="font-bold text-[9px] uppercase text-[#6F6A63] block">Care</span>
                    <span className="font-semibold text-[#171717]">{careInstructions || 'Machine wash cold'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catalog Summary Stats */}
          <div className="admin-card p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Catalog Summary</h4>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-beige/40 rounded-lg">
                <span className="text-[10px] text-muted uppercase block">Active Colors</span>
                <span className="text-sm font-black text-ink">{selectedColors.length} Colors</span>
              </div>
              <div className="p-2.5 bg-beige/40 rounded-lg">
                <span className="text-[10px] text-muted uppercase block">Active Sizes</span>
                <span className="text-sm font-black text-ink">{selectedSizes.length} Sizes</span>
              </div>
              <div className="p-2.5 bg-beige/40 rounded-lg">
                <span className="text-[10px] text-muted uppercase block">Total SKUs</span>
                <span className="text-sm font-black text-ink">{variants.length}</span>
              </div>
              <div className="p-2.5 bg-beige/40 rounded-lg">
                <span className="text-[10px] text-muted uppercase block">Total Units</span>
                <span className="text-sm font-black text-ink">{totalInventory}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
