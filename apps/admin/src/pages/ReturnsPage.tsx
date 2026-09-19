import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  RotateCcw,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Package,
  IndianRupee,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  X,
} from 'lucide-react';

interface ReturnRequest {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  garment_title: string;
  size: string;
  reason: string;
  comments: string;
  refund_amount: number;
  status: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

const STATUS_FILTERS = ['all', 'requested', 'approved', 'received', 'refunded', 'rejected'];

const STATUS_BADGES: Record<string, string> = {
  requested: 'badge-neutral',
  approved: 'badge-info',
  received: 'badge-warning',
  refunded: 'badge-success',
  rejected: 'badge-danger',
};

const REASON_LABELS: Record<string, string> = {
  size_fit: 'Size & Fit Issue',
  print_defect: 'Print or Color Discrepancy',
  wrong_item: 'Wrong Garment Received',
  fabric_feel: 'Fabric or GSM Quality Concern',
};

export function ReturnsPage() {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Status update modal
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReturns = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    api
      .get<ReturnRequest[]>('/returns/admin/all', params)
      .then(setReturns)
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReturns();
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReturns();
  };

  const openStatusModal = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status);
    setAdminNotes(ret.admin_notes || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setUpdating(true);

    try {
      await api.patch(`/returns/${selectedReturn.id}/status`, {
        status: newStatus,
        notes: adminNotes,
      });
      toast.success(
        'Return Status Updated',
        `Order #${selectedReturn.order_number} return marked as ${newStatus.toUpperCase()}.`
      );
      setSelectedReturn(null);
      fetchReturns();
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Failed to update return status.');
    } finally {
      setUpdating(false);
    }
  };

  const totalRefundValue = returns
    .filter((r) => r.status === 'refunded')
    .reduce((sum, r) => sum + (r.refund_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              POST-PURCHASE OPS
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {returns.length} REVERSE LOGISTICS TICKETS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Returns & Exchanges Desk
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Inspect customer return requests, quality issues, approve pick-ups, and process store refunds.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          className="btn-outline gap-2"
          disabled={loading}
          title="Refresh returns"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Return Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-beige/60 border border-border/60 flex items-center justify-center text-ink">
              <RotateCcw size={16} />
            </div>
          </div>
          <p className="stat-value">{returns.length}</p>
          <span className="text-[10px] font-mono text-muted mt-1 block">Lifetime customer tickets</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Awaiting Decision</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock size={16} />
            </div>
          </div>
          <p className="stat-value text-amber-700">
            {returns.filter((r) => r.status === 'requested').length}
          </p>
          <span className="text-[10px] font-mono text-amber-700 mt-1 block">Pending triage review</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">In Transit / Received</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Package size={16} />
            </div>
          </div>
          <p className="stat-value text-sky-700">
            {returns.filter((r) => r.status === 'approved' || r.status === 'received').length}
          </p>
          <span className="text-[10px] font-mono text-sky-700 mt-1 block">Under inspection at hub</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Refund Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="stat-value text-emerald-700">
            ₹{totalRefundValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] font-mono text-emerald-700 mt-1 block">Processed refunds to date</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <div className="flex flex-wrap items-center gap-1 bg-beige/40 p-1 rounded-xl border border-border/60">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                filter === s
                  ? 'bg-ink text-white shadow-2xs'
                  : 'text-muted hover:text-ink hover:bg-white/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9.5 w-full sm:w-[260px] py-1.5 text-xs"
            />
          </div>
        </form>
      </div>

      {/* Returns Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Garment & Spec</th>
                <th>Return Reason</th>
                <th>Refund Claim</th>
                <th>Status</th>
                <th>Logged Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-brand-red" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        Loading Return Tickets…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RotateCcw size={28} className="text-muted/50" />
                      <span className="font-bold text-ink text-sm">No return requests found</span>
                      <p className="text-xs text-muted max-w-sm">
                        Customer return submissions and exchange claims will populate here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="group">
                    <td>
                      <span className="font-mono text-xs font-bold text-ink bg-beige/60 px-2 py-0.5 rounded border border-border/60">
                        #{ret.order_number}
                      </span>
                    </td>

                    <td>
                      <div>
                        <strong className="text-xs font-bold text-ink block">
                          {ret.customer_name}
                        </strong>
                        {ret.customer_phone && (
                          <span className="text-[10px] text-muted font-mono">
                            {ret.customer_phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="text-xs space-y-0.5">
                        <strong className="font-semibold text-ink block">
                          {ret.garment_title}
                        </strong>
                        <span className="text-[10px] font-mono text-muted">
                          Size: {ret.size}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className="text-[11px] font-bold text-ink block">
                          {REASON_LABELS[ret.reason] || ret.reason}
                        </span>
                        {ret.comments && (
                          <p className="text-[10px] text-muted line-clamp-1 italic max-w-xs">
                            "{ret.comments}"
                          </p>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs font-black text-ink">
                        ₹{Number(ret.refund_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${STATUS_BADGES[ret.status] || 'badge-neutral'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ret.status}
                      </span>
                    </td>

                    <td className="text-[11px] text-muted whitespace-nowrap font-mono">
                      {new Date(ret.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => openStatusModal(ret)}
                        className="btn-secondary py-1 px-2.5 text-[10px] font-bold gap-1 rounded-lg"
                      >
                        <Sliders size={12} />
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-border/80 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-ink font-sans">
                  Manage Return Ticket
                </h3>
                <span className="text-xs text-muted font-mono">
                  Order #{selectedReturn.order_number}
                </span>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="w-7 h-7 rounded-full bg-beige/60 hover:bg-beige flex items-center justify-center text-muted hover:text-ink font-bold"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-border/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Item:</span>
                <span className="font-bold text-ink">{selectedReturn.garment_title} ({selectedReturn.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Customer:</span>
                <span className="font-bold text-ink">{selectedReturn.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Reason:</span>
                <span className="font-semibold text-ink">{REASON_LABELS[selectedReturn.reason] || selectedReturn.reason}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/80 font-bold">
                <span className="text-muted">Refund Amount:</span>
                <span className="font-mono text-brand-red">₹{Number(selectedReturn.refund_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="admin-label">Update Return Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-select w-full text-xs"
                >
                  <option value="requested">Requested (Under Review)</option>
                  <option value="approved">Approved (Courier Pick-up Scheduled)</option>
                  <option value="received">Received at Warehouse (Inspection)</option>
                  <option value="refunded">Refunded (Amount Credited to Source)</option>
                  <option value="rejected">Rejected (Not Eligible / Quality Passed)</option>
                </select>
              </div>

              <div>
                <label className="admin-label">Internal Staff Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Courier reverse AWB #781920 generated. Verified fabric tag intact."
                  className="admin-input w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="btn-primary">
                  {updating ? 'Saving…' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
