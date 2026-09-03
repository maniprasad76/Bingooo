import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LoaderCircle,
  Image as ImageIcon,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { titleToSlug } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  productCount?: number;
}

const fallbackCategories: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Oversized T-Shirts',
    slug: 't-shirts',
    description: 'Heavyweight combed cotton boxy streetwear silhouettes (240-280 GSM).',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
    displayOrder: 1,
    isActive: true,
    productCount: 8,
  },
  {
    id: 'cat-2',
    name: 'Hoodies & Fleece',
    slug: 'hoodies',
    description: 'Double-layered fleece hoodies, drop shoulders, and relaxed pullovers.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
    displayOrder: 2,
    isActive: true,
    productCount: 5,
  },
  {
    id: 'cat-3',
    name: 'Sweatshirts & Knits',
    slug: 'sweatshirts',
    description: 'Minimal relaxed crewnecks crafted for winter layering.',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
    displayOrder: 3,
    isActive: true,
    productCount: 4,
  },
  {
    id: 'cat-4',
    name: 'Bottoms & Cargo Pants',
    slug: 'pants',
    description: 'Wide-leg streetwear trousers, tactical cargo pockets and relaxed track bottoms.',
    imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600',
    displayOrder: 4,
    isActive: true,
    productCount: 3,
  },
];

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);

  const { data: categories = fallbackCategories, isLoading, isError } = useQuery<CategoryItem[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.get<CategoryItem[]>('/categories');
        if (res && res.length > 0) return res;
      } catch {
        // Return fallback
      }
      return fallbackCategories;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        slug,
        description,
        imageUrl,
        displayOrder: Number(displayOrder),
        isActive,
      };
      if (editingCat) {
        return api.patch(`/categories/${editingCat.id}`, payload);
      } else {
        return api.post('/categories', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: editingCat ? 'Category updated' : 'Category created',
        variant: 'success',
      });
      setIsModalOpen(false);
      setEditingCat(null);
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to save category', description: err.message, variant: 'danger' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category removed', variant: 'success' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not delete category', description: err.message, variant: 'danger' });
    },
  });

  const openCreate = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setDisplayOrder(String(categories.length + 1));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setDisplayOrder(String(cat.displayOrder ?? 1));
    setIsActive(cat.isActive ?? true);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Layers size={14} /> Catalog Taxonomy
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Menswear Categories & Navigation
          </h2>
          <p className="text-xs text-muted">
            Configure storefront category tiles, URL routing slugs, editorial descriptions, and ordering priority.
          </p>
        </div>

        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full card-admin p-12 text-center text-muted">
            <LoaderCircle size={22} className="mx-auto animate-spin text-brand-red mb-2" />
            Loading categories...
          </div>
        ) : isError ? (
          <div className="col-span-full card-admin p-8 text-center text-danger">
            Failed to load categories.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="card-admin overflow-hidden border border-border flex flex-col justify-between"
            >
              <div>
                {/* Category Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EDE0CC]">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                    Order #{cat.displayOrder ?? 1}
                  </span>
                  <span
                    className={`absolute top-2.5 right-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm ${
                      cat.isActive !== false ? 'bg-success/80 text-white' : 'bg-muted/80 text-white'
                    }`}
                  >
                    {cat.isActive !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-ink text-base">{cat.name}</h3>
                    <span className="font-mono text-xs text-muted">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                  <p className="text-[11px] font-semibold text-brand-red pt-1">
                    {cat.productCount ?? 0} Garments in Collection
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-border p-4 bg-[#FDF9F4]">
                <button
                  onClick={() => openEdit(cat)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete category "${cat.name}"?`)) {
                      deleteMutation.mutate(cat.id);
                    }
                  }}
                  className="p-1.5 text-muted hover:text-danger rounded-lg border border-border hover:border-danger transition-colors"
                  title="Delete category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? 'Edit Category' : 'Create Menswear Category'}
        description="Configure taxonomy classification, editorial image, and storefront menu placement."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-muted">
                Category Name *
                <input
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCat) setSlug(titleToSlug(e.target.value));
                  }}
                  placeholder="Oversized T-Shirts"
                  className="input-admin mt-1 font-bold"
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
                  placeholder="t-shirts"
                  className="input-admin mt-1 font-mono text-xs"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Header / Lookbook Image URL
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="input-admin mt-1 text-xs"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Editorial Description
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Heavyweight combed cotton boxy streetwear silhouettes..."
                className="input-admin mt-1 text-xs"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-muted">
                Display Order Priority
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="input-admin mt-1 text-xs"
                />
              </label>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-brand-red"
                />
                Visible in storefront navigation
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn-primary"
            >
              {saveMutation.isPending ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
