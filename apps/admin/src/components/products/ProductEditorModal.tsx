import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { titleToSlug } from '../../lib/utils';
import { Check, Sparkles } from 'lucide-react';

export interface ProductFormValues {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: string;
  compareAtPrice: string;
  status: 'draft' | 'active';
  customizationEnabled: boolean;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stockQuantity: string;
}

export const defaultProductValues: ProductFormValues = {
  title: '',
  slug: '',
  description: '',
  categoryId: '',
  basePrice: '',
  compareAtPrice: '',
  status: 'draft',
  customizationEnabled: false,
  sku: '',
  size: 'M',
  color: 'Black',
  colorHex: '#171717',
  stockQuantity: '15',
};

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  initialData?: ProductFormValues | null;
  categories: Array<{ id: string; name: string }>;
  isEditing: boolean;
  isLoading: boolean;
}

export function ProductEditorModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isEditing,
  isLoading,
}: ProductEditorModalProps) {
  const [form, setForm] = useState<ProductFormValues>(defaultProductValues);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(defaultProductValues);
    }
  }, [initialData, isOpen]);

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (val: string) => {
    update('title', val);
    if (!isEditing) {
      update('slug', titleToSlug(val));
      if (!form.sku) {
        update('sku', `BING-${titleToSlug(val).slice(0, 6).toUpperCase()}-M`);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Create New Garment'}
      description={
        isEditing
          ? 'Update catalog specifications, launch status, and pricing.'
          : 'Define garment basics and create the initial variant SKU.'
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-muted">
              Product Title *
              <input
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Heavyweight Boxy Tee"
                className="input-admin mt-1.5"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              URL Slug *
              <input
                required
                value={form.slug}
                onChange={(e) => update('slug', titleToSlug(e.target.value))}
                placeholder="heavyweight-boxy-tee"
                className="input-admin mt-1.5 font-mono text-xs"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Category
              <select
                value={form.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
                className="input-admin mt-1.5"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Launch Status
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as 'draft' | 'active')}
                className="input-admin mt-1.5"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="active">Active (Visible in Store)</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Selling Price (INR) *
              <input
                required
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(e) => update('basePrice', e.target.value)}
                placeholder="999"
                className="input-admin mt-1.5"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Compare-at Price (INR)
              <input
                type="number"
                min="0"
                value={form.compareAtPrice}
                onChange={(e) => update('compareAtPrice', e.target.value)}
                placeholder="1499"
                className="input-admin mt-1.5"
              />
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-muted">
            Product Editorial Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="100% combed cotton, 240 GSM heavy jersey, oversized boxy streetwear fit."
              className="input-admin mt-1.5"
            />
          </label>
        </div>

        {/* Customization Feature Switch */}
        <label className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-border bg-[#FDF9F4] p-4 transition-colors hover:border-brand-red/40">
          <input
            type="checkbox"
            checked={form.customizationEnabled}
            onChange={(e) => update('customizationEnabled', e.target.checked)}
            className="h-4 w-4 accent-brand-red"
          />
          <div className="flex-1">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Sparkles size={16} className="text-brand-red" />
              Enable Bingooo Custom Design Studio
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Allows customers to upload custom graphics and print positions on this piece.
            </p>
          </div>
        </label>

        {/* First Variant Configuration (when creating new) */}
        {!isEditing && (
          <div className="rounded-2xl border border-border bg-[#F7EEDB]/50 p-4 space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Initial Sellable Variant (SKU)
              </p>
              <p className="text-[11px] text-muted">
                Each product requires at least one initial variant for stock tracking.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-bold text-muted">
                  SKU *
                  <input
                    required
                    value={form.sku}
                    onChange={(e) => update('sku', e.target.value)}
                    placeholder="BING-TEE-BLK-M"
                    className="input-admin mt-1 font-mono text-xs"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted">
                  Size
                  <select
                    value={form.size}
                    onChange={(e) => update('size', e.target.value)}
                    className="input-admin mt-1 text-xs"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted">
                  Initial Stock Qty *
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => update('stockQuantity', e.target.value)}
                    placeholder="25"
                    className="input-admin mt-1 text-xs"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted">
                  Color Name
                  <input
                    value={form.color}
                    onChange={(e) => update('color', e.target.value)}
                    placeholder="Washed Black"
                    className="input-admin mt-1 text-xs"
                  />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-muted">
                  Color Hex Code
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={form.colorHex || '#171717'}
                      onChange={(e) => update('colorHex', e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-white p-1"
                    />
                    <input
                      value={form.colorHex}
                      onChange={(e) => update('colorHex', e.target.value)}
                      placeholder="#171717"
                      className="input-admin font-mono text-xs"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            <Check size={16} />
            {isEditing ? 'Save Changes' : 'Publish Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
