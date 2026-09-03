import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shirt,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  ExternalLink,
  LoaderCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import {
  ProductEditorModal,
  type ProductFormValues,
} from '../components/products/ProductEditorModal';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: 'draft' | 'active' | 'archived';
  base_price: number;
  compare_at_price?: number | null;
  customization_enabled: boolean;
  category?: { id: string; name: string; slug: string } | null;
  variants: Array<{
    id: string;
    sku: string;
    size?: string;
    color?: string;
    colorHex?: string;
    inStock: boolean;
    stockQuantity: number;
  }>;
  updated_at: string;
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Queries
  const { data: products = [], isLoading, isError } = useQuery<ProductItem[]>({
    queryKey: ['admin', 'products'],
    queryFn: () => api.get<ProductItem[]>('/products/admin/catalog'),
  });

  const { data: categories = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['categories'],
    queryFn: () => api.get<Array<{ id: string; name: string }>>('/categories'),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/products/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast({ title: 'Status updated', variant: 'success' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not update status', description: err.message, variant: 'danger' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({ title: 'Product removed', variant: 'success' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not delete product', description: err.message, variant: 'danger' });
    },
  });

  // Save product from modal
  const handleSaveProduct = async (values: ProductFormValues) => {
    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, {
          title: values.title.trim(),
          slug: values.slug.trim(),
          description: values.description.trim() || undefined,
          categoryId: values.categoryId || undefined,
          basePrice: Number(values.basePrice),
          compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
          status: values.status,
          customizationEnabled: values.customizationEnabled,
        });
        toast({ title: 'Product updated successfully', variant: 'success' });
      } else {
        const created = await api.post<ProductItem>('/products', {
          title: values.title.trim(),
          slug: values.slug.trim(),
          description: values.description.trim() || undefined,
          categoryId: values.categoryId || undefined,
          basePrice: Number(values.basePrice),
          compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
          status: values.status,
          customizationEnabled: values.customizationEnabled,
        });

        await api.post(`/products/${created.id}/variants`, {
          sku: values.sku.trim(),
          size: values.size.trim() || undefined,
          color: values.color.trim() || undefined,
          colorHex: values.colorHex.trim() || undefined,
          price: Number(values.basePrice),
          stockQuantity: Number(values.stockQuantity),
        });

        toast({
          title: 'Product created',
          description: 'Garment and initial SKU are active in inventory.',
          variant: 'success',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      setIsEditorOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast({
        title: 'Error saving product',
        description: err.message || 'Please check the required inputs.',
        variant: 'danger',
      });
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setIsEditorOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || p.category?.id === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const initialFormValues: ProductFormValues | null = editingProduct
    ? {
        title: editingProduct.title,
        slug: editingProduct.slug,
        description: editingProduct.description || '',
        categoryId: editingProduct.category?.id || '',
        basePrice: String(editingProduct.base_price),
        compareAtPrice: editingProduct.compare_at_price
          ? String(editingProduct.compare_at_price)
          : '',
        status: editingProduct.status === 'archived' ? 'draft' : editingProduct.status,
        customizationEnabled: editingProduct.customization_enabled,
        sku: editingProduct.variants[0]?.sku || '',
        size: editingProduct.variants[0]?.size || 'M',
        color: editingProduct.variants[0]?.color || 'Black',
        colorHex: editingProduct.variants[0]?.colorHex || '#171717',
        stockQuantity: String(editingProduct.variants[0]?.stockQuantity || 10),
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, slug or SKU..."
              className="input-admin pl-10 text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-admin w-auto min-w-[150px] text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-admin w-auto min-w-[130px] text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/products/new" className="btn-primary">
            <Plus size={16} /> New Garment Page
          </Link>
          <button onClick={openCreateModal} className="btn-secondary">
            Quick Modal
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="overflow-hidden card-admin">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-xs">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">SKU / Variants</th>
                <th className="p-4">Custom Studio</th>
                <th className="p-4">Status</th>
                <th className="p-4">Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted">
                    <LoaderCircle size={24} className="mx-auto animate-spin text-brand-red mb-2" />
                    Loading catalog items...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-danger">
                    Failed to load product catalog.
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted">
                    No products matched the current search and filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FDF9F4] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7EEDB] text-brand-red font-bold">
                          <Shirt size={20} />
                        </span>
                        <div>
                          <p className="font-bold text-ink text-sm">{product.title}</p>
                          <p className="font-mono text-[11px] text-muted">/{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-muted">
                      {product.category?.name || 'Uncategorised'}
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-ink">{formatCurrency(product.base_price)}</p>
                      {product.compare_at_price && (
                        <p className="text-[11px] text-muted line-through">
                          {formatCurrency(product.compare_at_price)}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-muted">
                      {product.variants.length > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-ink">
                            {product.variants[0].sku}
                          </span>
                          {product.variants.length > 1 && (
                            <span className="ml-1 text-[10px] text-brand-red font-bold">
                              +{product.variants.length - 1} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="italic text-muted">No variants</span>
                      )}
                    </td>

                    <td className="p-4">
                      {product.customization_enabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF0EE] px-2.5 py-1 text-[11px] font-bold text-brand-red">
                          <Sparkles size={12} /> Studio Enabled
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted">Disabled</span>
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={product.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: product.id,
                            status: e.target.value,
                          })
                        }
                        className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-ink focus:border-brand-red focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    <td className="p-4 text-[11px] text-muted">
                      {formatDate(product.updated_at)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-[#F7EEDB] hover:text-brand-red"
                          title="Full Page Editor"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-[#F7EEDB] hover:text-ink text-xs font-bold"
                          title="Quick Modal Edit"
                        >
                          Quick
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialData={initialFormValues}
        categories={categories}
        isEditing={Boolean(editingProduct)}
        isLoading={false}
      />
    </div>
  );
}
