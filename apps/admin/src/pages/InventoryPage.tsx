import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  AlertTriangle,
  Check,
  X,
  SlidersHorizontal,
  Search,
  LoaderCircle,
} from 'lucide-react';
import { api } from '../lib/api/client';
import { useToast } from '../components/ui/Toast';

interface InventoryItem {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableStock: number;
  lowStock: boolean;
  product?: {
    id: string;
    title: string;
  };
}

export function InventoryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustDelta, setAdjustDelta] = useState('');

  const { data: inventory = [], isLoading, isError } = useQuery<InventoryItem[]>({
    queryKey: ['admin', 'inventory'],
    queryFn: () => api.get<InventoryItem[]>('/inventory'),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.patch(`/inventory/${id}/adjust`, {
        quantity,
        reason: 'Admin panel stock adjustment',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({ title: 'Inventory adjusted successfully', variant: 'success' });
      setAdjustingId(null);
      setAdjustDelta('');
    },
    onError: (err: Error) => {
      toast({
        title: 'Adjustment failed',
        description: err.message || 'Please check the adjustment number.',
        variant: 'danger',
      });
    },
  });

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.product?.title || '').toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = filterLowStockOnly ? item.lowStock : true;
    return matchesSearch && matchesLowStock;
  });

  const totalOnHand = inventory.reduce((sum, i) => sum + (i.stockQuantity || 0), 0);
  const lowStockCount = inventory.filter((i) => i.lowStock).length;

  return (
    <div className="space-y-6">
      {/* Metrics Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total SKUs</p>
          <p className="mt-2 text-2xl font-black text-ink">{inventory.length}</p>
          <p className="text-[11px] text-muted">Across all menswear categories</p>
        </div>
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Units On Hand</p>
          <p className="mt-2 text-2xl font-black text-ink">{totalOnHand}</p>
          <p className="text-[11px] text-muted">Physical warehouse inventory</p>
        </div>
        <div className="rounded-2xl border border-danger/25 bg-[#FEF2F2] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-danger">Low Stock Items</p>
          <p className="mt-2 text-2xl font-black text-danger">{lowStockCount}</p>
          <p className="text-[11px] text-danger/80">Threshold below 5 units</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="relative min-w-0 flex-1 sm:min-w-[260px]">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variant SKU or product title..."
            className="input-admin pl-10 text-xs"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-ink hover:border-brand-red">
          <input
            type="checkbox"
            checked={filterLowStockOnly}
            onChange={(e) => setFilterLowStockOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-red"
          />
          <span>Show low stock only</span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden card-admin">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-xs">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Variant & Garment</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Size / Color</th>
                <th className="p-4">On Hand</th>
                <th className="p-4">Reserved</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted">
                    <LoaderCircle size={24} className="mx-auto animate-spin text-brand-red mb-2" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-danger">
                    Failed to fetch warehouse inventory.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted">
                    No variant inventory records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDF9F4] transition-colors">
                    <td className="p-4 font-bold text-ink">
                      <div className="flex items-center gap-2.5">
                        <Box size={16} className="text-brand-red shrink-0" />
                        <span>{item.product?.title || 'Unknown Garment'}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-muted">{item.sku}</td>

                    <td className="p-4 text-muted">
                      <span className="font-semibold text-ink">{item.size || '—'}</span>
                      {item.color && (
                        <span className="ml-1.5 text-xs text-muted font-normal">
                          • {item.color}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-ink">{item.stockQuantity}</td>

                    <td className="p-4 text-muted">{item.reservedQuantity}</td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.lowStock
                            ? 'bg-danger/10 text-danger border border-danger/20'
                            : 'bg-success/10 text-success border border-success/20'
                        }`}
                      >
                        {item.lowStock && <AlertTriangle size={12} />}
                        {item.availableStock}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {adjustingId === item.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            adjustMutation.mutate({
                              id: item.id,
                              quantity: Number(adjustDelta),
                            });
                          }}
                          className="flex items-center justify-end gap-1.5"
                        >
                          <input
                            autoFocus
                            type="number"
                            step="1"
                            required
                            placeholder="+/-"
                            value={adjustDelta}
                            onChange={(e) => setAdjustDelta(e.target.value)}
                            className="h-8 w-20 rounded-lg border border-border px-2 text-xs font-bold focus:border-brand-red focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={adjustMutation.isPending}
                            className="rounded-lg bg-brand-red p-1.5 text-white hover:bg-[#B91F12]"
                            title="Confirm adjustment"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingId(null);
                              setAdjustDelta('');
                            }}
                            className="rounded-lg border border-border p-1.5 text-muted hover:bg-[#F7EEDB]"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setAdjustingId(item.id);
                            setAdjustDelta('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink hover:border-brand-red hover:text-brand-red transition-colors"
                        >
                          <SlidersHorizontal size={13} /> Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
