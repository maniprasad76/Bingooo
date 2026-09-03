import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Sparkles,
  Shirt,
  Upload,
  Layers,
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  LoaderCircle,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { titleToSlug, formatCurrency } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export function ProductEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('1199');
  const [compareAtPrice, setCompareAtPrice] = useState('1699');
  const [costPrice, setCostPrice] = useState('450');
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('active');
  const [customizationEnabled, setCustomizationEnabled] = useState(false);
  const [fabric, setFabric] = useState('100% Combed Compact Cotton');
  const [gsm, setGsm] = useState('240 GSM');
  const [fit, setFit] = useState('Oversized Boxy Fit');
  const [tags, setTags] = useState('streetwear, heavyweight, oversized, summer26');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Variants matrix state
  const [variants, setVariants] = useState<
    Array<{ size: string; color: string; colorHex: string; sku: string; stock: number }>
  >([
    { size: 'S', color: 'Washed Black', colorHex: '#171717', sku: 'BING-TEE-BLK-S', stock: 20 },
    { size: 'M', color: 'Washed Black', colorHex: '#171717', sku: 'BING-TEE-BLK-M', stock: 35 },
    { size: 'L', color: 'Washed Black', colorHex: '#171717', sku: 'BING-TEE-BLK-L', stock: 30 },
    { size: 'XL', color: 'Washed Black', colorHex: '#171717', sku: 'BING-TEE-BLK-XL', stock: 15 },
  ]);

  // Fetch categories
  const { data: categories = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['categories'],
    queryFn: () => api.get<Array<{ id: string; name: string }>>('/categories'),
  });

  // If editing, load product details
  const { data: existingProduct, isLoading: isFetchingProduct } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const catalog = await api.get<any[]>('/products/admin/catalog');
        return catalog.find((p) => p.id === id) || null;
      } catch {
        return null;
      }
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingProduct) {
      setTitle(existingProduct.title || '');
      setSlug(existingProduct.slug || '');
      setDescription(existingProduct.description || '');
      setCategoryId(existingProduct.category?.id || existingProduct.category_id || '');
      setBasePrice(String(existingProduct.base_price || '1199'));
      setCompareAtPrice(String(existingProduct.compare_at_price || ''));
      setStatus(existingProduct.status || 'active');
      setCustomizationEnabled(Boolean(existingProduct.customization_enabled));
      if (existingProduct.variants && existingProduct.variants.length > 0) {
        setVariants(
          existingProduct.variants.map((v: any) => ({
            size: v.size || 'M',
            color: v.color || 'Standard',
            colorHex: v.colorHex || '#171717',
            sku: v.sku,
            stock: v.stockQuantity ?? 15,
          }))
        );
      }
    }
  }, [existingProduct]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = titleToSlug(val);
      setSlug(generated);
      setSeoTitle(`${val} | Bingooo Men's Wear`);
      setSeoDescription(`Buy the ${val} in premium ${fabric} (${gsm}). Streetwear inspired luxury fits.`);
    }
  };

  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: 'L',
        color: 'Off White',
        colorHex: '#EDE0CC',
        sku: `BING-${titleToSlug(title).slice(0, 4).toUpperCase()}-WHT-L`,
        stock: 20,
      },
    ]);
  };

  const handleRemoveVariantRow = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        categoryId: categoryId || undefined,
        basePrice: Number(basePrice),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        status,
        customizationEnabled,
        fabric,
        gsm,
        fit,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: isFeatured,
        bestseller: isBestSeller,
        seoTitle,
        seoDescription,
        initialSku: variants[0]?.sku || `BING-${slug.slice(0, 6).toUpperCase()}-M`,
        initialSize: variants[0]?.size || 'M',
        initialColor: variants[0]?.color || 'Black',
        initialColorHex: variants[0]?.colorHex || '#171717',
        stockQuantity: variants[0]?.stock || 25,
      };

      if (isEditing && id) {
        return api.patch(`/products/${id}`, payload);
      } else {
        return api.post('/products', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({
        title: isEditing ? 'Product specifications saved' : 'New garment published to catalog',
        variant: 'success',
      });
      navigate('/products');
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to save product', description: err.message, variant: 'danger' });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (isFetchingProduct) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3 text-muted">
        <LoaderCircle size={22} className="animate-spin text-brand-red" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading product data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-sm hover:border-brand-red hover:text-brand-red"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-black text-ink">
              {isEditing ? `Edit: ${title || 'Garment'}` : 'Create New Menswear Piece'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Configure catalog taxonomy, price tier, fabrics, GSM weight and variant SKUs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/products" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {isEditing ? 'Update Garment' : 'Publish to Store'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Identity */}
          <div className="card-admin p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Garment Identity & Copy
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted">
                  Product Title *
                  <input
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Heavyweight Drop-Shoulder Boxy Tee"
                    className="input-admin mt-1.5 font-bold"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  URL Slug *
                  <input
                    required
                    value={slug}
                    onChange={(e) => setSlug(titleToSlug(e.target.value))}
                    placeholder="heavyweight-drop-shoulder-tee"
                    className="input-admin mt-1.5 font-mono text-xs"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Menswear Category *
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-admin mt-1.5"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Product Description & Editorial Styling Notes
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Engineered with 100% compact combed cotton for maximum drape. Ribbed 1.25-inch crew collar, reinforced shoulder seams."
                  className="input-admin mt-1.5"
                />
              </label>
            </div>
          </div>

          {/* Fabric & Technical Specs (Section 41) */}
          <div className="card-admin p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Shirt size={18} className="text-brand-red" />
              <h3 className="font-bold text-ink">Material & Technical Specifications</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Fabric Composition
                  <input
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="100% Combed Cotton"
                    className="input-admin mt-1.5"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted">
                  Fabric Weight (GSM)
                  <input
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value)}
                    placeholder="240 GSM"
                    className="input-admin mt-1.5"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted">
                  Silhouette / Fit
                  <input
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    placeholder="Oversized Boxy"
                    className="input-admin mt-1.5"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Pricing & Margins */}
          <div className="card-admin p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Pricing & Retail Economics (INR)
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-muted">
                  Selling Price (INR) *
                  <input
                    required
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="input-admin mt-1.5 font-bold"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Compare-At / MRP (INR)
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="1699"
                    className="input-admin mt-1.5"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted">
                  Production Cost (INR)
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="450"
                    className="input-admin mt-1.5"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-[#F7EEDB]/40 p-3 text-xs flex justify-between items-center text-muted">
              <span>Gross Margin Estimate:</span>
              <span className="font-bold text-ink">
                {Number(basePrice) > Number(costPrice)
                  ? `${Math.round(((Number(basePrice) - Number(costPrice)) / Number(basePrice)) * 100)}% (${formatCurrency(
                      Number(basePrice) - Number(costPrice)
                    )})`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Variant SKU Matrix */}
          <div className="card-admin p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-ink">Variant Stock & Size Matrix</h3>
                <p className="text-xs text-muted">Assign SKUs, sizes, colors and inventory levels</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="btn-secondary text-xs"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-[#F7EEDB]/60 text-muted uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Color</th>
                    <th className="p-2.5">Hex</th>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Stock</th>
                    <th className="p-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {variants.map((v, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <select
                          value={v.size}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].size = e.target.value;
                            setVariants(updated);
                          }}
                          className="input-admin py-1 px-2 text-xs"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          value={v.color}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].color = e.target.value;
                            setVariants(updated);
                          }}
                          className="input-admin py-1 px-2 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={v.colorHex}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].colorHex = e.target.value;
                              setVariants(updated);
                            }}
                            className="h-7 w-7 rounded border border-border cursor-pointer p-0.5"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].sku = e.target.value;
                            setVariants(updated);
                          }}
                          className="input-admin py-1 px-2 font-mono text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].stock = Number(e.target.value);
                            setVariants(updated);
                          }}
                          className="input-admin py-1 px-2 text-xs w-20"
                        />
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="p-1 text-muted hover:text-danger rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Controls (1 col) */}
        <div className="space-y-6">
          {/* Launch Status */}
          <div className="card-admin p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Visibility & Publishing
            </h3>

            <div>
              <label className="block text-xs font-bold text-muted">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="input-admin mt-1.5"
                >
                  <option value="active">Active (Visible in Storefront)</option>
                  <option value="draft">Draft (Admin Only)</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-[#FDF9F4] p-3.5 hover:border-brand-red/40 transition-colors">
              <input
                type="checkbox"
                checked={customizationEnabled}
                onChange={(e) => setCustomizationEnabled(e.target.checked)}
                className="h-4 w-4 accent-brand-red"
              />
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Sparkles size={14} className="text-brand-red" />
                  Custom Design Studio
                </p>
                <p className="text-[11px] text-muted">Allow customers to upload artwork</p>
              </div>
            </label>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-xs text-ink font-semibold">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-brand-red"
                />
                Feature on Homepage Carousel
              </label>

              <label className="flex items-center gap-2 text-xs text-ink font-semibold">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="accent-brand-red"
                />
                Mark as "Best Seller" Badge
              </label>
            </div>
          </div>

          {/* Product Image URL / Mock Upload */}
          <div className="card-admin p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Hero Garment Photography
            </h3>

            <div>
              <label className="block text-xs font-bold text-muted">
                Primary Image URL
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input-admin mt-1.5 text-xs"
                />
              </label>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-[#F7EEDB]/30 p-6 text-center text-muted">
              <ImageIcon size={28} className="mx-auto mb-2 text-muted/60" />
              <p className="text-xs font-bold text-ink">Drag image or paste URL</p>
              <p className="text-[10px] text-muted mt-1">Recommended: 1200x1600px editorial portrait</p>
            </div>
          </div>

          {/* SEO & Meta */}
          <div className="card-admin p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Search Engine Optimization (SEO)
            </h3>

            <div>
              <label className="block text-xs font-bold text-muted">
                Page Meta Title
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Heavyweight Tee | Bingooo"
                  className="input-admin mt-1.5 text-xs"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Meta Description
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Premium 240 GSM oversized streetwear t-shirt crafted for modern drape."
                  className="input-admin mt-1.5 text-xs"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
