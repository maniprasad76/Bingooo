import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertTriangle,
  Sliders,
  Plus,
  Minus,
  History,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#E6321C] bg-[#171717] text-white px-2 py-0.5">
              WAREHOUSE CONTROL
            </span>
            <span className="text-[#171717]/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717]/70">
              {items.length} SKUS • {totalUnits.toLocaleString('en-IN')} TOTAL UNITS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171717] font-sans mt-1">
            Inventory & Warehouse Telemetry
          </h1>
          <p className="text-xs text-[#171717]/70 mt-0.5 font-medium">
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

      {/* Bauhaus Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Total SKUs Tracked</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-[#F7EEDB] flex items-center justify-center text-[#171717] shadow-[2px_2px_0px_#171717]">
              <Layers size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#171717] mt-2">{items.length}</p>
          <span className="text-[10px] font-mono text-[#171717]/60 mt-1 block uppercase">Active garment variants</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Physical Units</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-emerald-100 flex items-center justify-center text-emerald-900 shadow-[2px_2px_0px_#171717]">
              <Boxes size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-800 mt-2">{totalUnits.toLocaleString('en-IN')}</p>
          <span className="text-[10px] font-mono text-emerald-800 font-bold mt-1 block uppercase">Units across all racks</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Low Stock Warnings</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-amber-100 flex items-center justify-center text-amber-900 shadow-[2px_2px_0px_#171717]">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-amber-700 mt-2">{lowStockCount}</p>
          <span className="text-[10px] font-mono text-amber-800 font-bold mt-1 block uppercase">&lt; 5 units available</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Depleted / Stockouts</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-[#E6321C] flex items-center justify-center text-white shadow-[2px_2px_0px_#171717]">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#E6321C] mt-2">{outOfStockCount}</p>
          <span className="text-[10px] font-mono text-[#E6321C] font-bold mt-1 block uppercase">Needs urgent factory reorder</span>
        </div>
      </div>

      {/* Bauhaus Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
        <div className="flex gap-2">
          <button
            onClick={() => setLowStockOnly(false)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-[#171717] transition-all ${
              !lowStockOnly
                ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                : 'bg-white text-[#171717] hover:bg-[#F7EEDB]'
            }`}
          >
            All Variants ({items.length})
          </button>
          <button
            onClick={() => setLowStockOnly(true)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-[#171717] transition-all flex items-center gap-1.5 ${
              lowStockOnly
                ? 'bg-amber-400 text-[#171717] font-black shadow-[2px_2px_0px_#171717]'
                : 'bg-white text-[#171717] hover:bg-[#F7EEDB]'
            }`}
          >
            <AlertTriangle size={12} />
            Low Stock Only ({lowStockCount})
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/60" />
            <input
              type="text"
              placeholder="Search SKU, Product, Size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-full sm:w-[280px] py-1.5 text-xs font-mono font-semibold"
            />
          </div>
        </form>
      </div>

      {/* Bauhaus Inventory Table */}
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
                  <td colSpan={8} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={22} className="animate-spin text-[#E6321C]" />
                      <span className="font-mono text-xs uppercase tracking-widest font-bold">
                        Loading Inventory Racks…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes size={32} className="text-[#171717]/40" />
                      <span className="font-bold text-[#171717] text-sm uppercase font-mono">No inventory records found</span>
                      <p className="text-xs text-[#171717]/70 max-w-sm">
                        Create products and variants in Products Studio to start tracking stock.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td>
                      <div>
                        <strong className="text-xs font-black uppercase text-[#171717] block">
                          {item.product?.title || 'Garment Variant'}
                        </strong>
                        <span className="font-mono text-[10px] text-[#171717]/60 font-semibold">{item.sku}</span>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 border-2 border-[#171717] shrink-0 shadow-[1px_1px_0px_#171717]"
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
                        <span className="text-xs font-bold text-[#171717]">{item.color || 'Standard'}</span>
                      </div>
                    </td>

                    <td>
                      <span className="px-2 py-0.5 border border-[#171717] bg-[#F7EEDB] text-[10px] font-black text-[#171717] font-mono shadow-[1px_1px_0px_#171717]">
                        {item.size}
                      </span>
                    </td>

                    <td className="font-mono text-xs font-bold text-[#171717]">
                      {item.stockQuantity} pcs
                    </td>

                    <td className="font-mono text-xs text-[#171717]/60 font-semibold">
                      {item.reservedQuantity} pcs
                    </td>

                    <td className="font-mono text-xs font-black">
                      <span
                        className={
                          item.availableStock <= 0
                            ? 'text-[#E6321C]'
                            : item.availableStock < 10
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }
                      >
                        {item.availableStock} pcs
                      </span>
                    </td>

                    <td>
                      {item.availableStock <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] bg-[#E6321C] text-white text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717]">
                          <span className="w-1.5 h-1.5 bg-white" />
                          Out of Stock
                        </span>
                      ) : item.availableStock < 10 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] bg-amber-300 text-[#171717] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717]">
                          <span className="w-1.5 h-1.5 bg-[#171717]" />
                          Low ({item.availableStock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717]">
                          <span className="w-1.5 h-1.5 bg-emerald-700" />
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openHistory(item)}
                          className="p-1.5 border-2 border-[#171717] bg-white hover:bg-[#F7EEDB] text-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
                          title="View Stock Movement Audit Logs"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={() => openAdjust(item)}
                          className="btn-secondary py-1 px-2.5 text-[10px] font-bold gap-1"
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

      {/* Bauhaus Stock Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#F7EEDB] border-2 border-[#171717] max-w-md w-full p-6 shadow-[8px_8px_0px_#171717] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-[#171717] font-sans">
                  Adjust Physical Stock
                </h3>
                <span className="text-xs text-[#171717]/70 font-mono font-bold">{adjustItem.sku}</span>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="w-7 h-7 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white flex items-center justify-center text-[#171717] font-bold transition-colors shadow-[2px_2px_0px_#171717]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#171717]/70 font-bold">Garment Title:</span>
                <span className="font-black text-[#171717] truncate max-w-[200px]">{adjustItem.product?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#171717]/70 font-bold">Color & Size:</span>
                <span className="font-bold text-[#171717]">{adjustItem.color} / {adjustItem.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#171717]/70 font-bold">Current Physical Stock:</span>
                <span className="font-mono font-black text-[#171717]">{adjustItem.stockQuantity} units</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-[#171717]">
                <span className="text-[#171717] font-black uppercase">Resulting Stock:</span>
                <span className="font-mono font-black text-[#E6321C] text-sm">
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
                    className="p-2 border-2 border-[#171717] bg-white hover:bg-[#FAF7F2] text-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
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
                    className="p-2 border-2 border-[#171717] bg-white hover:bg-[#FAF7F2] text-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-[#171717]/70 mt-1 block font-mono font-bold">
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
                  className="admin-select w-full text-xs font-mono font-semibold"
                >
                  <option value="Restock Batch">Restock Batch / Atelier Factory Delivery</option>
                  <option value="Inventory Audit Count">Physical Inventory Audit Count Correction</option>
                  <option value="Damaged / Quality Rejection">Damaged in Transit / Fabric Quality Rejection</option>
                  <option value="Sample / Showroom Allocation">Atelier Showroom / Marketing Sample</option>
                  <option value="Customer Return Restock">Inspected Customer Return Restock</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#171717]">
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

      {/* Bauhaus Stock History Modal */}
      {historyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#F7EEDB] border-2 border-[#171717] max-w-lg w-full p-6 shadow-[8px_8px_0px_#171717] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-[#171717] font-sans">
                  Stock Movement Logs
                </h3>
                <span className="text-xs text-[#171717]/70 font-mono font-bold">{historyItem.sku}</span>
              </div>
              <button
                onClick={() => setHistoryItem(null)}
                className="w-7 h-7 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white flex items-center justify-center text-[#171717] font-bold transition-colors shadow-[2px_2px_0px_#171717]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {loadingHistory ? (
                <p className="text-center py-8 text-xs text-[#171717]/60 font-mono">Loading audit movements...</p>
              ) : historyLogs.length === 0 ? (
                <p className="text-center py-8 text-xs text-[#171717]/60 font-mono">No historical adjustments recorded for this variant.</p>
              ) : (
                historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white border-2 border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-[#171717] block font-black uppercase text-[11px]">
                        {log.reference_type || 'Stock Adjustment'}
                      </strong>
                      <span className="text-[10px] text-[#171717]/60 font-mono font-bold">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-black flex items-center gap-0.5 px-2 py-0.5 border border-[#171717] ${
                        log.quantity > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-[#E6321C]'
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

            <div className="pt-3 text-right border-t-2 border-[#171717]">
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
