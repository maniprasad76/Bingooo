import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Plus,
  Minus,
  History,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  X,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  size: string;
  color?: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableStock: number;
  lowStock: boolean;
  product?: { id: string; title: string; slug: string } | null;
  updatedAt?: string;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reference_type?: string;
  created_at: string;
}

export function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Restock Batch');
  const [saving, setSaving] = useState(false);

  // History Drawer
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<StockMovement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (lowStockOnly) params.lowStock = 'true';

    api
      .get<InventoryItem[]>('/inventory', params)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const openAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    setAdjustDelta(10);
    setAdjustReason('Restock Batch');
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || adjustDelta === 0) return;
    setSaving(true);

    try {
      await api.patch(`/inventory/${adjustItem.id}/adjust`, {
        quantity: Number(adjustDelta),
        reason: adjustReason,
      });
      toast.success(
        'Stock Adjusted',
        `SKU ${adjustItem.sku} changed by ${Number(adjustDelta) > 0 ? `+${adjustDelta}` : adjustDelta} units.`
      );
      setAdjustItem(null);
      fetchInventory();
    } catch (err: any) {
      toast.error('Adjustment Failed', err?.message || 'Failed to adjust stock level.');
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (item: InventoryItem) => {
    setHistoryItem(item);
    setLoadingHistory(true);
    try {
      const logs = await api.get<StockMovement[]>(`/inventory/${item.id}/history`);
      setHistoryLogs(logs || []);
    } catch {
      setHistoryLogs([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const totalUnits = items.reduce((sum, i) => sum + i.stockQuantity, 0);
  const lowStockCount = items.filter((i) => i.lowStock || i.availableStock < 5).length;
  const outOfStockCount = items.filter((i) => i.availableStock <= 0).length;

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              WAREHOUSE CONTROL
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {items.length} SKUS • {totalUnits.toLocaleString('en-IN')} TOTAL UNITS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Inventory & Warehouse Telemetry
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time stock monitoring across sizes and colors, low-stock threshold alerts, and stock adjustments.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="btn-outline gap-2"
          disabled={loading}
          title="Refresh inventory"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total SKUs Tracked</span>
            <div className="w-9 h-9 rounded-xl bg-beige/60 border border-border/60 flex items-center justify-center text-ink">
              <Layers size={16} />
            </div>
          </div>
          <p className="stat-value">{items.length}</p>
          <span className="text-[10px] font-mono text-muted mt-1 block">Active garment variants</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Physical Warehouse Units</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Boxes size={16} />
            </div>
          </div>
          <p className="stat-value">{totalUnits.toLocaleString('en-IN')}</p>
          <span className="text-[10px] font-mono text-emerald-700 mt-1 block">Units across all racks</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Low Stock Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="stat-value text-amber-700">{lowStockCount}</p>
          <span className="text-[10px] font-mono text-amber-700 mt-1 block">&lt; 5 units available</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Depleted / Stockouts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="stat-value text-rose-700">{outOfStockCount}</p>
          <span className="text-[10px] font-mono text-rose-700 mt-1 block">Needs urgent factory order</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <div className="flex gap-1 bg-beige/40 p-1 rounded-xl border border-border/60">
          <button
            onClick={() => setLowStockOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
              !lowStockOnly
                ? 'bg-ink text-white shadow-2xs'
                : 'text-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            All Variants ({items.length})
          </button>
          <button
            onClick={() => setLowStockOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              lowStockOnly
                ? 'bg-amber-500 text-black font-extrabold shadow-2xs'
                : 'text-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            <AlertTriangle size={12} />
            Low Stock Only ({lowStockCount})
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by SKU, Product or Size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9.5 w-full sm:w-[280px] py-1.5 text-xs"
            />
          </div>
        </form>
      </div>

      {/* Inventory Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Color Swatch</th>
                <th>Size</th>
                <th>Physical Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Inventory Health</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-brand-red" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Loading Inventory Racks…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No inventory records found</span>
                      <p className="text-xs text-muted max-w-sm">
                        Create products and variants in Products Studio to start tracking stock.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="group">
                    <td>
                      <div>
                        <strong className="text-xs font-bold text-ink block">
                          {item.product?.title || 'Garment Variant'}
                        </strong>
                        <span className="font-mono text-[10px] text-muted">{item.sku}</span>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                          style={{
                            backgroundColor:
                              item.color?.startsWith('#')
                                ? item.color
                                : item.color === 'Black'
                                ? '#171717'
                                : item.color === 'White'
                                ? '#FFFFFF'
                                : item.color === 'Grey'
                                ? '#77736D'
                                : '#171717',
                          }}
                        />
                        <span className="text-xs font-semibold text-ink">{item.color || 'Standard'}</span>
                      </div>
                    </td>

                    <td>
                      <span className="px-2.5 py-0.5 rounded-lg bg-beige/60 border border-border/60 text-[10px] font-bold text-ink font-mono">
                        {item.size}
                      </span>
                    </td>

                    <td className="font-mono text-xs font-bold text-ink">
                      {item.stockQuantity} pcs
                    </td>

                    <td className="font-mono text-xs text-muted">
                      {item.reservedQuantity} pcs
                    </td>

                    <td className="font-mono text-xs font-black">
                      <span
                        className={
                          item.availableStock <= 0
                            ? 'text-rose-600'
                            : item.availableStock < 10
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {item.availableStock} pcs
                      </span>
                    </td>

                    <td>
                      {item.availableStock <= 0 ? (
                        <span className="badge badge-danger">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Out of Stock
                        </span>
                      ) : item.availableStock < 10 ? (
                        <span className="badge badge-warning">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Low ({item.availableStock})
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openHistory(item)}
                          className="btn-ghost p-1.5 rounded-lg text-muted hover:text-ink hover:bg-beige"
                          title="View Stock Movement Audit Logs"
                        >
                          <History size={15} />
                        </button>
                        <button
                          onClick={() => openAdjust(item)}
                          className="btn-secondary py-1.5 px-3 text-[10px] font-bold gap-1 rounded-lg"
                        >
                          <Sliders size={12} />
                          Adjust
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

      {/* Stock Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-ink font-sans">
                  Adjust Physical Stock
                </h3>
                <span className="text-xs text-muted font-mono">{adjustItem.sku}</span>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-border/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Garment Title:</span>
                <span className="font-bold text-ink truncate max-w-[200px]">{adjustItem.product?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Color & Size:</span>
                <span className="font-bold text-ink">{adjustItem.color} / {adjustItem.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Current Physical Stock:</span>
                <span className="font-mono font-bold text-ink">{adjustItem.stockQuantity} units</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/80">
                <span className="text-muted font-semibold">Resulting Stock:</span>
                <span className="font-mono font-black text-brand-red text-sm">
                  {adjustItem.stockQuantity + Number(adjustDelta || 0)} units
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="admin-label">
                  Adjustment Delta (Units) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev - 5)}
                    className="p-2.5 rounded-xl border border-border bg-beige/40 hover:bg-beige text-ink transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    className="admin-input flex-1 text-center font-mono font-bold text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev + 5)}
                    className="p-2.5 rounded-xl border border-border bg-beige/40 hover:bg-beige text-ink transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-muted mt-1 block font-mono">
                  Enter positive (+) to restock, or negative (-) to write off.
                </span>
              </div>

              <div>
                <label className="admin-label">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="admin-select w-full text-xs"
                >
                  <option value="Restock Batch">Restock Batch / Atelier Factory Delivery</option>
                  <option value="Inventory Audit Count">Physical Inventory Audit Count Correction</option>
                  <option value="Damaged / Quality Rejection">Damaged in Transit / Fabric Quality Rejection</option>
                  <option value="Sample / Showroom Allocation">Atelier Showroom / Marketing Sample</option>
                  <option value="Customer Return Restock">Inspected Customer Return Restock</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Applying...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Drawer */}
      {historyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-ink font-sans">
                  Stock Movement Logs
                </h3>
                <span className="text-xs text-muted font-mono">{historyItem.sku}</span>
              </div>
              <button
                onClick={() => setHistoryItem(null)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
              >
                <X size={15} />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2">
              {loadingHistory ? (
                <p className="text-center py-8 text-xs text-muted">Loading audit movements...</p>
              ) : historyLogs.length === 0 ? (
                <p className="text-center py-8 text-xs text-muted">No historical adjustments recorded for this variant.</p>
              ) : (
                historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-border/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-ink block font-bold">
                        {log.reference_type || 'Stock Adjustment'}
                      </strong>
                      <span className="text-[10px] text-muted font-mono">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold flex items-center gap-0.5 ${
                        log.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {log.quantity > 0 ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity} units
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 text-right border-t border-border/70">
              <button onClick={() => setHistoryItem(null)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
