import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowUpRight,
  Box,
  Check,
  ChevronRight,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { signOut } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';

type Section = 'overview' | 'products' | 'inventory' | 'orders' | 'customizations';

interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status: 'draft' | 'active' | 'archived';
  base_price: number;
  compare_at_price?: number | null;
  customization_enabled: boolean;
  category?: { id: string; name: string; slug: string } | null;
  variants: Array<{ id: string; sku: string; size?: string; color?: string; colorHex?: string; inStock: boolean; stockQuantity: number }>;
  updated_at: string;
}

interface ProductForm {
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

const emptyProductForm: ProductForm = {
  title: '', slug: '', description: '', categoryId: '', basePrice: '', compareAtPrice: '',
  status: 'draft', customizationEnabled: false, sku: '', size: 'M', color: 'Black', colorHex: '#171717', stockQuantity: '10',
};

const sections: Array<{ id: Section; label: string; href: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { id: 'products', label: 'Products', href: '/admin/products', icon: Shirt },
  { id: 'inventory', label: 'Inventory', href: '/admin/inventory', icon: Box },
  { id: 'orders', label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { id: 'customizations', label: 'Custom prints', href: '/admin/custom-orders', icon: Sparkles },
];

function titleToSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function getSection(pathname: string): Section {
  if (pathname.includes('/products')) return 'products';
  if (pathname.includes('/inventory')) return 'inventory';
  if (pathname.includes('/orders')) return 'orders';
  if (pathname.includes('/custom')) return 'customizations';
  return 'overview';
}

function StatusPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20', delivered: 'bg-success/10 text-success border-success/20',
    processing: 'bg-[#FDF0EE] text-[#B91F12] border-[#E6321C]/20', shipped: 'bg-info/10 text-info border-info/20',
    draft: 'bg-[#F7EEDB] text-[#6F6A63] border-[#DDD3C5]', archived: 'bg-black/5 text-[#6F6A63] border-black/10',
    uploaded: 'bg-warning/10 text-warning border-warning/20', approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-danger/10 text-danger border-danger/20',
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${styles[value] ?? styles.draft}`}>{value.replaceAll('_', ' ')}</span>;
}

function AdminLoading({ label = 'Loading workspace' }: { label?: string }) {
  return <div className="flex min-h-60 items-center justify-center gap-2 text-sm font-medium text-muted"><LoaderCircle size={18} className="animate-spin" />{label}</div>;
}

export function AdminDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const activeSection = getSection(location.pathname);
  const [navOpen, setNavOpen] = useState(false);
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [adjustingVariantId, setAdjustingVariantId] = useState<string | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');

  const dashboardQuery = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => api.get<any>('/admin/dashboard'), enabled: activeSection === 'overview', retry: false });
  const productsQuery = useQuery({ queryKey: ['admin', 'products'], queryFn: () => api.get<AdminProduct[]>('/products/admin/catalog'), enabled: activeSection === 'products', retry: false });
  const inventoryQuery = useQuery({ queryKey: ['admin', 'inventory'], queryFn: () => api.get<any[]>('/inventory'), enabled: activeSection === 'inventory', retry: false });
  const ordersQuery = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => api.get<any[]>('/orders/admin/all'), enabled: activeSection === 'orders', retry: false });
  const customizationsQuery = useQuery({ queryKey: ['admin', 'customizations'], queryFn: () => api.get<any[]>('/customizations'), enabled: activeSection === 'customizations', retry: false });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: () => api.get<Array<{ id: string; name: string }>>('/categories'), enabled: productEditorOpen });

  const invalidate = (...keys: string[][]) => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { invalidate(['admin', 'orders'], ['admin', 'dashboard']); toast({ title: 'Order status saved', variant: 'success' }); },
    onError: (error: Error) => toast({ title: 'Could not update order', description: error.message, variant: 'danger' }),
  });
  const customizationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/customizations/${id}/status`, { status }),
    onSuccess: () => { invalidate(['admin', 'customizations'], ['admin', 'dashboard']); toast({ title: 'Print review saved', variant: 'success' }); },
    onError: (error: Error) => toast({ title: 'Could not update print review', description: error.message, variant: 'danger' }),
  });
  const inventoryMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => api.patch(`/inventory/${id}/adjust`, { quantity, reason: 'Admin dashboard adjustment' }),
    onSuccess: () => { invalidate(['admin', 'inventory'], ['admin', 'dashboard']); setAdjustingVariantId(null); setAdjustmentQuantity(''); toast({ title: 'Stock adjusted', variant: 'success' }); },
    onError: (error: Error) => toast({ title: 'Could not adjust stock', description: error.message, variant: 'danger' }),
  });
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { invalidate(['admin', 'products'], ['admin', 'dashboard']); toast({ title: 'Product removed', variant: 'success' }); },
    onError: (error: Error) => toast({ title: 'Could not remove product', description: error.message, variant: 'danger' }),
  });
  const productStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/products/${id}`, { status }),
    onSuccess: () => invalidate(['admin', 'products']),
    onError: (error: Error) => toast({ title: 'Could not update product', description: error.message, variant: 'danger' }),
  });

  const products = productsQuery.data ?? [];
  const inventory = inventoryQuery.data ?? [];
  const lowStockCount = useMemo(() => inventory.filter((item) => item.lowStock).length, [inventory]);

  const openProductEditor = (product?: AdminProduct) => {
    setEditingProduct(product ?? null);
    setProductForm(product ? {
      title: product.title, slug: product.slug, description: product.description ?? '', categoryId: product.category?.id ?? '',
      basePrice: String(product.base_price), compareAtPrice: product.compare_at_price ? String(product.compare_at_price) : '',
      status: product.status === 'archived' ? 'draft' : product.status, customizationEnabled: product.customization_enabled,
      sku: product.variants[0]?.sku ?? '', size: product.variants[0]?.size ?? 'M', color: product.variants[0]?.color ?? 'Black', colorHex: product.variants[0]?.colorHex ?? '#171717', stockQuantity: String(product.variants[0]?.stockQuantity ?? 10),
    } : emptyProductForm);
    setProductEditorOpen(true);
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      title: productForm.title.trim(), slug: productForm.slug.trim(), description: productForm.description.trim() || undefined,
      categoryId: productForm.categoryId || undefined, basePrice: Number(productForm.basePrice),
      compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : undefined,
      status: productForm.status, customizationEnabled: productForm.customizationEnabled,
    };
    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
        toast({ title: 'Product updated', variant: 'success' });
      } else {
        const created = await api.post<AdminProduct>('/products', payload);
        await api.post(`/products/${created.id}/variants`, {
          sku: productForm.sku.trim(), size: productForm.size.trim() || undefined, color: productForm.color.trim() || undefined,
          colorHex: productForm.colorHex.trim() || undefined, price: Number(productForm.basePrice), stockQuantity: Number(productForm.stockQuantity),
        });
        toast({ title: 'Product created', description: 'The first sellable variant was added to inventory.', variant: 'success' });
      }
      invalidate(['admin', 'products'], ['admin', 'dashboard'], ['admin', 'inventory']);
      setProductEditorOpen(false);
    } catch (error) {
      toast({ title: 'Could not save product', description: error instanceof Error ? error.message : 'Please review the product fields.', variant: 'danger' });
    }
  };

  let body: React.ReactNode;
  if (activeSection === 'overview') {
    if (dashboardQuery.isLoading) body = <AdminLoading />;
    else if (dashboardQuery.isError) body = <AccessMessage error={dashboardQuery.error} />;
    else {
      const metrics = dashboardQuery.data;
      const cards = [
        { label: 'Revenue', value: formatCurrency(metrics?.totalRevenue), detail: 'Collected orders', icon: TrendingUp },
        { label: 'Orders', value: metrics?.totalOrders ?? 0, detail: `${metrics?.pendingOrders ?? 0} need attention`, icon: ShoppingBag },
        { label: 'Custom prints', value: metrics?.totalCustomizations ?? 0, detail: `${metrics?.pendingCustomizations ?? 0} awaiting review`, icon: Sparkles },
        { label: 'Catalog', value: metrics?.totalProducts ?? 0, detail: 'Active and draft products', icon: Shirt },
      ];
      body = <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-border bg-white p-5 shadow-card"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-muted">{card.label}</p><span className="rounded-xl bg-[#FDF0EE] p-2 text-brand-red"><Icon size={18} /></span></div><p className="mt-5 text-3xl font-extrabold tracking-tight text-ink">{card.value}</p><p className="mt-1 text-xs text-muted">{card.detail}</p></div>; })}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section className="rounded-2xl border border-border bg-white p-6 shadow-card"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-ink">Recent orders</p><p className="mt-1 text-xs text-muted">The latest checkout activity in your store.</p></div><Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:text-[#B91F12]">See all <ChevronRight size={14} /></Link></div><div className="mt-5 divide-y divide-border">{(metrics?.recentOrders ?? []).length === 0 ? <EmptyRow message="Orders will appear here as customers check out." /> : metrics.recentOrders.map((order: any) => <div key={order.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-mono text-sm font-bold text-ink">{order.orderNumber}</p><p className="mt-1 text-xs text-muted">{order.itemCount} item{order.itemCount === 1 ? '' : 's'} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p></div><div className="text-right"><p className="text-sm font-bold text-ink">{formatCurrency(order.total)}</p><div className="mt-1"><StatusPill value={order.status} /></div></div></div>)}</div></section><section className="rounded-2xl border border-[#E6321C]/20 bg-[#FDF0EE] p-6"><div className="flex items-center gap-2 text-[#B91F12]"><AlertTriangle size={18} /><p className="font-bold text-[#B91F12]">Low stock watch</p></div><p className="mt-2 text-sm text-[#6F6A63]">Make sure your most popular sizes stay available.</p><div className="mt-5 space-y-3">{(metrics?.lowStockVariants ?? []).length === 0 ? <p className="rounded-xl border border-[#E6321C]/15 bg-white/70 p-4 text-sm text-muted">Everything is comfortably stocked.</p> : metrics.lowStockVariants.slice(0, 4).map((item: any) => <div key={item.id} className="rounded-xl border border-[#E6321C]/15 bg-white/80 p-3"><p className="text-sm font-bold text-ink">{item.productTitle}</p><p className="mt-1 text-xs text-muted">{item.sku} · {item.size} · {item.color}</p><p className="mt-2 text-xs font-bold text-danger">{item.availableStock} available</p></div>)}</div><Link to="/admin/inventory" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#B91F12]">Manage inventory <ArrowUpRight size={14} /></Link></section></div></>;
    }
  } else if (activeSection === 'products') {
    if (productsQuery.isLoading) body = <AdminLoading label="Loading catalog" />;
    else if (productsQuery.isError) body = <AccessMessage error={productsQuery.error} />;
    else body = <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5"><div><p className="font-bold text-ink">Product catalog</p><p className="mt-1 text-xs text-muted">Create a product, set its launch state, and keep variants clear.</p></div><button onClick={() => openProductEditor()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-red px-4 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#B91F12]"><Plus size={16} /> New product</button></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#F7EEDB]/70 text-[11px] uppercase tracking-wider text-muted"><tr><th className="p-4 font-bold">Product</th><th className="p-4 font-bold">SKU / variants</th><th className="p-4 font-bold">Price</th><th className="p-4 font-bold">Status</th><th className="p-4 font-bold">Updated</th><th className="p-4 font-bold text-right">Actions</th></tr></thead><tbody className="divide-y divide-border">{products.length === 0 ? <tr><td colSpan={6}><EmptyRow message="Start your catalog by creating the first Bingooo product." /></td></tr> : products.map((product) => <tr key={product.id} className="hover:bg-[#FDF9F4]"><td className="p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEDB] text-brand-red"><Shirt size={19} /></span><div><p className="text-sm font-bold text-ink">{product.title}</p><p className="mt-1 text-xs text-muted">{product.category?.name ?? 'Uncategorised'} · /{product.slug}</p></div></div></td><td className="p-4 text-xs text-muted">{product.variants.length ? product.variants.map((variant) => variant.sku).join(', ') : 'No sellable variant'}</td><td className="p-4"><p className="text-sm font-bold text-ink">{formatCurrency(product.base_price)}</p>{product.compare_at_price ? <p className="mt-1 text-xs text-muted line-through">{formatCurrency(product.compare_at_price)}</p> : null}</td><td className="p-4"><select value={product.status} onChange={(event) => productStatusMutation.mutate({ id: product.id, status: event.target.value })} className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-brand-red focus:outline-none"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></td><td className="p-4 text-xs text-muted">{new Date(product.updated_at).toLocaleDateString('en-IN')}</td><td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => openProductEditor(product)} className="rounded-lg p-2 text-muted transition-colors hover:bg-[#F7EEDB] hover:text-brand-red" aria-label={`Edit ${product.title}`}><Pencil size={16} /></button><button onClick={() => { if (window.confirm(`Remove ${product.title}? This cannot be undone.`)) deleteProductMutation.mutate(product.id); }} className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${product.title}`}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div></section>;
  } else if (activeSection === 'inventory') {
    if (inventoryQuery.isLoading) body = <AdminLoading label="Loading inventory" />;
    else if (inventoryQuery.isError) body = <AccessMessage error={inventoryQuery.error} />;
    else body = <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><p className="font-bold text-ink">Variant inventory</p><p className="mt-1 text-xs text-muted">{lowStockCount} item{lowStockCount === 1 ? '' : 's'} currently below the low-stock threshold.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#FDF0EE] px-3 py-1.5 text-xs font-bold text-[#B91F12]"><AlertTriangle size={14} /> Alert below 5</span></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead className="bg-[#F7EEDB]/70 text-[11px] uppercase tracking-wider text-muted"><tr><th className="p-4 font-bold">Variant</th><th className="p-4 font-bold">SKU</th><th className="p-4 font-bold">On hand</th><th className="p-4 font-bold">Reserved</th><th className="p-4 font-bold">Available</th><th className="p-4 font-bold text-right">Adjust</th></tr></thead><tbody className="divide-y divide-border">{inventory.map((item) => <tr key={item.id} className="hover:bg-[#FDF9F4]"><td className="p-4"><p className="text-sm font-bold text-ink">{item.product?.title ?? 'Unknown product'}</p><p className="mt-1 text-xs text-muted">{[item.size, item.color].filter(Boolean).join(' · ') || 'Default variant'}</p></td><td className="p-4 font-mono text-xs text-muted">{item.sku}</td><td className="p-4 text-sm font-semibold text-ink">{item.stockQuantity}</td><td className="p-4 text-sm text-muted">{item.reservedQuantity}</td><td className="p-4"><span className={item.lowStock ? 'font-bold text-danger' : 'font-bold text-success'}>{item.availableStock}</span></td><td className="p-4"><div className="flex justify-end">{adjustingVariantId === item.id ? <form onSubmit={(event) => { event.preventDefault(); inventoryMutation.mutate({ id: item.id, quantity: Number(adjustmentQuantity) }); }} className="flex items-center gap-2"><input autoFocus aria-label={`Adjustment for ${item.sku}`} value={adjustmentQuantity} onChange={(event) => setAdjustmentQuantity(event.target.value)} type="number" step="1" required placeholder="+/-" className="h-9 w-20 rounded-lg border border-border px-2 text-sm focus:border-brand-red focus:outline-none" /><button disabled={inventoryMutation.isPending} className="rounded-lg bg-brand-red p-2 text-white hover:bg-[#B91F12]" aria-label="Save stock adjustment"><Check size={15} /></button><button type="button" onClick={() => setAdjustingVariantId(null)} className="rounded-lg p-2 text-muted hover:bg-[#F7EEDB]" aria-label="Cancel"><X size={15} /></button></form> : <button onClick={() => { setAdjustingVariantId(item.id); setAdjustmentQuantity(''); }} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-ink hover:border-brand-red hover:text-brand-red"><SlidersHorizontal size={14} /> Adjust</button>}</div></td></tr>)}</tbody></table></div></section>;
  } else if (activeSection === 'orders') {
    if (ordersQuery.isLoading) body = <AdminLoading label="Loading orders" />;
    else if (ordersQuery.isError) body = <AccessMessage error={ordersQuery.error} />;
    else { const orders = ordersQuery.data ?? []; body = <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card"><div className="border-b border-border p-5"><p className="font-bold text-ink">Order management</p><p className="mt-1 text-xs text-muted">Move every order through a clear fulfillment state.</p></div><div className="overflow-x-auto"><table className="min-w-[780px] w-full text-left"><thead className="bg-[#F7EEDB]/70 text-[11px] uppercase tracking-wider text-muted"><tr><th className="p-4 font-bold">Order</th><th className="p-4 font-bold">Customer</th><th className="p-4 font-bold">Items</th><th className="p-4 font-bold">Total</th><th className="p-4 font-bold">Payment</th><th className="p-4 font-bold">Fulfillment</th></tr></thead><tbody className="divide-y divide-border">{orders.length === 0 ? <tr><td colSpan={6}><EmptyRow message="New orders will appear here after checkout." /></td></tr> : orders.map((order) => <tr key={order.id} className="hover:bg-[#FDF9F4]"><td className="p-4"><p className="font-mono text-sm font-bold text-ink">{order.order_number}</p><p className="mt-1 text-xs text-muted">{new Date(order.created_at).toLocaleDateString('en-IN')}</p></td><td className="p-4 text-sm text-ink">{order.address_snapshot_json?.name ?? 'Guest customer'}</td><td className="p-4 text-xs text-muted">{order.items?.length ?? 0} item{order.items?.length === 1 ? '' : 's'}</td><td className="p-4 text-sm font-bold text-ink">{formatCurrency(order.total)}</td><td className="p-4"><StatusPill value={order.payment_status} /></td><td className="p-4"><select value={order.status} disabled={statusMutation.isPending} onChange={(event) => statusMutation.mutate({ id: order.id, status: event.target.value })} className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-brand-red focus:outline-none"><option value="pending_payment">Pending payment</option><option value="paid">Paid</option><option value="processing">Processing</option><option value="packed">Packed</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div></section>; }
  } else {
    if (customizationsQuery.isLoading) body = <AdminLoading label="Loading custom print jobs" />;
    else if (customizationsQuery.isError) body = <AccessMessage error={customizationsQuery.error} />;
    else {
      const customizations = customizationsQuery.data ?? [];
      body = (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="font-bold text-ink">Custom print queue</p>
              <p className="mt-1 text-xs text-muted">Review customer artwork and approve or route to print production.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F7EEDB] px-3 py-1.5 text-xs font-bold text-ink">
              <Sparkles size={14} className="text-brand-red" /> {customizations.length} job{customizations.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customizations.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyRow message="Custom artwork submitted by customers will appear here." />
              </div>
            ) : (
              customizations.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-[#FDF9F4] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <StatusPill value={item.status} />
                    <span className="text-xs text-muted font-mono">{new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-[#DDD3C5] bg-white overflow-hidden p-2">
                    {item.preview_key ? (
                      <img src={item.preview_key} alt="Print artwork" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <Sparkles className="mx-auto text-brand-red" size={24} />
                        <p className="mt-1.5 text-xs font-bold text-ink">{item.product?.title ?? 'Custom garment'}</p>
                        <p className="text-[11px] text-muted">{item.design_json?.garmentColor || 'Natural'} Apparel</p>
                        {item.design_json?.text && (
                          <p className="mt-1 text-[11px] font-semibold text-brand-red truncate max-w-[200px]">"{item.design_json.text}"</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs space-y-1 text-muted">
                    <p><strong className="text-ink">Garment:</strong> {item.product?.title ?? 'Custom Piece'}</p>
                    <p><strong className="text-ink">Color:</strong> {item.design_json?.garmentColor || 'Standard'} • <strong className="text-ink">Print:</strong> {(item.design_json?.view || 'front').toUpperCase()}</p>
                    {item.design_json?.text && <p><strong className="text-ink">Text:</strong> "{item.design_json.text}" ({item.design_json.font || 'Default'})</p>}
                  </div>
                  <label className="block text-xs font-bold text-muted pt-1 border-t border-border">
                    Production decision
                    <select
                      value={item.status}
                      disabled={customizationMutation.isPending}
                      onChange={(event) => customizationMutation.mutate({ id: item.id, status: event.target.value })}
                      className="mt-1.5 block w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-brand-red focus:outline-none"
                    >
                      <option value="uploaded">New Submission</option>
                      <option value="needs_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="ready_for_print">Ready for Print</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>
                </article>
              ))
            )}
          </div>
        </section>
      );
    }
  }

  return <div className="min-h-screen bg-[#F7EEDB] text-ink"><aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#2B2825] bg-[#171717] p-5 text-white transition-transform duration-200 lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between"><Link to="/" className="font-display text-2xl font-extrabold tracking-tight">BINGOOO<span className="text-brand-red">.</span></Link><button onClick={() => setNavOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Close admin navigation"><X size={18} /></button></div><div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red"><Crown size={17} /></span><div><p className="text-xs font-bold text-white">Store operations</p><p className="mt-0.5 text-[11px] text-white/55">Bingooo admin workspace</p></div></div></div><nav className="mt-8 space-y-1">{sections.map((section) => { const Icon = section.icon; const selected = activeSection === section.id; return <Link key={section.id} to={section.href} onClick={() => setNavOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${selected ? 'bg-brand-red text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{section.label}</Link>; })}</nav><div className="mt-auto border-t border-white/10 pt-5"><button onClick={() => void signOut().then(() => navigate('/'))} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 hover:bg-white/10 hover:text-white"><LogOut size={18} /> Sign out</button><Link to="/" className="mt-2 flex items-center gap-2 px-3 text-xs font-semibold text-white/50 hover:text-white">View storefront <ArrowUpRight size={13} /></Link></div></aside>{navOpen ? <button onClick={() => setNavOpen(false)} aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-black/40 lg:hidden" /> : null}<main className="min-h-screen lg:pl-72"><header className="flex min-h-20 items-center justify-between border-b border-border bg-[#F7EEDB] px-4 sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setNavOpen(true)} className="rounded-lg border border-border bg-white p-2 text-ink lg:hidden" aria-label="Open admin navigation"><Menu size={19} /></button><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-red">Bingooo operations</p><h1 className="mt-1 text-2xl font-extrabold capitalize text-ink">{sections.find((section) => section.id === activeSection)?.label}</h1></div></div><Link to="/" className="hidden rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-ink transition-colors hover:border-brand-red hover:text-brand-red sm:inline-flex">Open store <ArrowUpRight size={14} className="ml-1" /></Link></header><div className="mx-auto max-w-[1600px] p-4 sm:p-8">{body}</div></main>{productEditorOpen ? <ProductEditor form={productForm} setForm={setProductForm} categories={categoriesQuery.data ?? []} editing={Boolean(editingProduct)} onClose={() => setProductEditorOpen(false)} onSubmit={saveProduct} /> : null}</div>;
}

function EmptyRow({ message }: { message: string }) {
  return <div className="p-8 text-center text-sm text-muted">{message}</div>;
}

function AccessMessage({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'This operation needs an authorised administrator account.';
  return <div className="rounded-2xl border border-[#E6321C]/20 bg-[#FDF0EE] p-6"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 text-brand-red" size={20} /><div><p className="font-bold text-ink">Admin access required</p><p className="mt-1 text-sm text-muted">{message}</p><p className="mt-3 text-xs text-muted">Sign in with a Supabase user that has the required Bingooo role, then return to this workspace.</p></div></div></div>;
}

function ProductEditor({ form, setForm, categories, editing, onClose, onSubmit }: { form: ProductForm; setForm: (value: ProductForm) => void; categories: Array<{ id: string; name: string }>; editing: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm({ ...form, [key]: value });
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"><div role="dialog" aria-modal="true" aria-labelledby="product-editor-title" className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white p-5"><div><p id="product-editor-title" className="font-bold text-ink">{editing ? 'Edit product' : 'Create product'}</p><p className="mt-1 text-xs text-muted">{editing ? 'Update catalog details and launch state.' : 'The first SKU is created with this product.'}</p></div><button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-[#F7EEDB] hover:text-ink" aria-label="Close product editor"><X size={18} /></button></div><form onSubmit={onSubmit} className="space-y-6 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Product name"><input required value={form.title} onChange={(event) => { update('title', event.target.value); if (!editing) update('slug', titleToSlug(event.target.value)); }} className="input-admin" placeholder="Classic oversized tee" /></Field><Field label="URL slug"><input required value={form.slug} onChange={(event) => update('slug', titleToSlug(event.target.value))} className="input-admin" placeholder="classic-oversized-tee" /></Field><Field label="Category"><select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} className="input-admin"><option value="">Uncategorised</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Launch status"><select value={form.status} onChange={(event) => update('status', event.target.value as ProductForm['status'])} className="input-admin"><option value="draft">Draft</option><option value="active">Active</option></select></Field><Field label="Selling price (INR)"><input required min="0" type="number" value={form.basePrice} onChange={(event) => update('basePrice', event.target.value)} className="input-admin" placeholder="999" /></Field><Field label="Compare-at price (optional)"><input min="0" type="number" value={form.compareAtPrice} onChange={(event) => update('compareAtPrice', event.target.value)} className="input-admin" placeholder="1299" /></Field></div><Field label="Product description"><textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="input-admin min-h-24 resize-y" placeholder="Fabric, fit, care, and what makes this product special." /></Field><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-[#FDF9F4] p-4"><input checked={form.customizationEnabled} onChange={(event) => update('customizationEnabled', event.target.checked)} type="checkbox" className="h-4 w-4 accent-[#E6321C]" /><span><span className="block text-sm font-bold text-ink">Enable custom design studio</span><span className="mt-1 block text-xs text-muted">Allow shoppers to personalise this product before checkout.</span></span></label>{!editing ? <div className="rounded-xl border border-border p-4"><p className="text-sm font-bold text-ink">First sellable variant</p><p className="mt-1 text-xs text-muted">A product needs a SKU before it can be added to a customer cart.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="SKU"><input required value={form.sku} onChange={(event) => update('sku', event.target.value)} className="input-admin" placeholder="BING-TEE-BLK-M" /></Field><Field label="Opening stock"><input required min="0" type="number" value={form.stockQuantity} onChange={(event) => update('stockQuantity', event.target.value)} className="input-admin" /></Field><Field label="Size"><input value={form.size} onChange={(event) => update('size', event.target.value)} className="input-admin" placeholder="M" /></Field><Field label="Colour"><input value={form.color} onChange={(event) => update('color', event.target.value)} className="input-admin" placeholder="Black" /></Field><Field label="Colour hex"><input value={form.colorHex} onChange={(event) => update('colorHex', event.target.value)} className="input-admin" placeholder="#171717" /></Field></div></div> : null}<div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-5 sm:flex-row"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-border px-4 text-xs font-bold uppercase tracking-wide text-ink hover:border-brand-red hover:text-brand-red">Cancel</button><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-red px-5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#B91F12]"><Check size={16} /> {editing ? 'Save product' : 'Create product'}</button></div></form></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-muted">{label}<span className="mt-2 block">{children}</span></label>;
}
