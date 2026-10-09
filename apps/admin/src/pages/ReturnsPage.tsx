import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  RotateCcw,
  Search,
  RefreshCw,
  Package,
  IndianRupee,
  Clock,
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
      // Refunds move real money through Razorpay and need the refund permission,
      // so they use their own endpoint; other statuses are workflow updates.
      if (newStatus === 'refunded') {
        await api.post(`/returns/${selectedReturn.id}/refund`, { notes: adminNotes });
      } else {
        await api.patch(`/returns/${selectedReturn.id}/status`, {
          status: newStatus,
          notes: adminNotes,
        });
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#171717] text-white px-2 py-0.5">
              POST-PURCHASE OPS
            </span>
            <span className="text-[#171717]/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717]/70">
              {returns.length} REVERSE LOGISTICS TICKETS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171717] font-sans mt-1">
            Returns & Exchanges Desk
          </h1>
          <p className="text-xs text-[#171717]/70 mt-0.5 font-medium">
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

      {/* Bauhaus Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Total Return Tickets</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-[#F7EEDB] flex items-center justify-center text-[#171717] shadow-[2px_2px_0px_#171717]">
              <RotateCcw size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#171717] mt-2">{returns.length}</p>
          <span className="text-[10px] font-mono text-[#171717]/60 mt-1 block uppercase">Lifetime customer tickets</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Awaiting Decision</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-amber-100 flex items-center justify-center text-amber-900 shadow-[2px_2px_0px_#171717]">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-amber-700 mt-2">
            {returns.filter((r) => r.status === 'requested').length}
          </p>
          <span className="text-[10px] font-mono text-amber-800 font-bold mt-1 block uppercase">Pending triage review</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">In Transit / Received</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-sky-100 flex items-center justify-center text-sky-900 shadow-[2px_2px_0px_#171717]">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-sky-800 mt-2">
            {returns.filter((r) => r.status === 'approved' || r.status === 'received').length}
          </p>
          <span className="text-[10px] font-mono text-sky-800 font-bold mt-1 block uppercase">Under inspection at hub</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Total Refund Value</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-emerald-100 flex items-center justify-center text-emerald-900 shadow-[2px_2px_0px_#171717]">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-800 mt-2">
            ₹{totalRefundValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] font-mono text-emerald-800 font-bold mt-1 block uppercase">Processed refunds to date</span>
        </div>
      </div>

      {/* Bauhaus Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-[#171717] transition-all ${
                filter === s
                  ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                  : 'bg-white text-[#171717] hover:bg-[#F7EEDB]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/60" />
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-full sm:w-[260px] py-1.5 text-xs font-mono font-semibold"
            />
          </div>
        </form>
      </div>

      {/* Bauhaus Returns Table */}
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
                  <td colSpan={8} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={22} className="animate-spin text-[#E6321C]" />
                      <span className="font-mono text-xs uppercase tracking-widest font-bold">
                        Loading Return Tickets…
                      </span>
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#171717]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RotateCcw size={32} className="text-[#171717]/40" />
                      <span className="font-bold text-[#171717] text-sm uppercase font-mono">No return requests found</span>
                      <p className="text-xs text-[#171717]/70 max-w-sm">
                        Customer return submissions and exchange claims will populate here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td>
                      <span className="font-mono text-xs font-bold text-[#171717] bg-[#F7EEDB] px-2 py-0.5 border border-[#171717] shadow-[1px_1px_0px_#171717]">
                        #{ret.order_number}
                      </span>
                    </td>

                    <td>
                      <div>
                        <strong className="text-xs font-black uppercase text-[#171717] block">
                          {ret.customer_name}
                        </strong>
                        {ret.customer_phone && (
                          <span className="text-[10px] text-[#171717]/60 font-mono font-semibold">
                            {ret.customer_phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="text-xs space-y-0.5">
                        <strong className="font-bold text-[#171717] uppercase block">
                          {ret.garment_title}
                        </strong>
                        <span className="text-[10px] font-mono text-[#171717]/60 font-bold">
                          Size: {ret.size}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className="text-[11px] font-bold text-[#171717] block">
                          {REASON_LABELS[ret.reason] || ret.reason}
                        </span>
                        {ret.comments && (
                          <p className="text-[10px] text-[#171717]/70 line-clamp-1 italic max-w-xs">
                            "{ret.comments}"
                          </p>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="font-mono text-xs font-black text-[#171717]">
                        ₹{Number(ret.refund_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717] ${
                          ret.status === 'refunded'
                            ? 'bg-emerald-100 text-emerald-900'
                            : ret.status === 'rejected'
                            ? 'bg-[#E6321C] text-white'
                            : ret.status === 'approved'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-amber-300 text-[#171717]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-current" />
                        {ret.status}
                      </span>
                    </td>

                    <td className="text-[11px] text-[#171717]/70 whitespace-nowrap font-mono font-semibold">
                      {new Date(ret.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => openStatusModal(ret)}
                        className="btn-secondary py-1 px-2.5 text-[10px] font-bold gap-1"
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

      {/* Bauhaus Status Update Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#F7EEDB] border-2 border-[#171717] max-w-md w-full p-6 shadow-[8px_8px_0px_#171717] space-y-5">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-[#171717] font-sans">
                  Manage Return Ticket
                </h3>
                <span className="text-xs text-[#171717]/70 font-mono font-bold">
                  Order #{selectedReturn.order_number}
                </span>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="w-7 h-7 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white flex items-center justify-center text-[#171717] font-bold transition-colors shadow-[2px_2px_0px_#171717]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#171717]/70 font-bold">Item:</span>
                <span className="font-black text-[#171717]">{selectedReturn.garment_title} ({selectedReturn.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#171717]/70 font-bold">Customer:</span>
                <span className="font-bold text-[#171717]">{selectedReturn.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#171717]/70 font-bold">Reason:</span>
                <span className="font-bold text-[#171717]">{REASON_LABELS[selectedReturn.reason] || selectedReturn.reason}</span>
              </div>
              <div className="flex justify-between pt-1 border-t-2 border-[#171717] font-bold">
                <span className="text-[#171717] font-black uppercase">Refund Amount:</span>
                <span className="font-mono font-black text-[#E6321C]">₹{Number(selectedReturn.refund_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="admin-label">Update Return Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="admin-select w-full text-xs font-mono font-semibold"
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
                  className="admin-input w-full text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#171717]">
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
