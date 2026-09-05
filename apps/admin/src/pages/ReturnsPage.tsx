import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  AlertCircle,
  Calendar,
  User,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export interface ReturnRequest {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  garment_title: string;
  size: string;
  reason: 'size_fit' | 'print_defect' | 'wrong_item' | 'fabric_feel';
  comments: string;
  refund_amount: number;
  status: 'requested' | 'reviewing' | 'pickup_scheduled' | 'inspected' | 'refunded' | 'rejected';
  created_at: string;
}

export function ReturnsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['admin', 'returns', statusTab, search],
    queryFn: () => api.get<ReturnRequest[]>('/returns', { status: statusTab, search }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: ReturnRequest['status'] }) =>
      api.patch(`/returns/${id}/status`, { status: newStatus }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'returns'] });
      toast({
        title: 'Return lifecycle updated',
        description: `Return request moved to ${variables.newStatus.replace('_', ' ')}.`,
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update status.',
        variant: 'danger',
      });
    },
  });

  const getReasonLabel = (reason: ReturnRequest['reason']) => {
    switch (reason) {
      case 'size_fit':
        return 'Size & Fit Issue';
      case 'print_defect':
        return 'Defective Artwork / Print';
      case 'wrong_item':
        return 'Incorrect Color / SKU Sent';
      case 'fabric_feel':
        return 'Fabric / Quality Expectation';
      default:
        return reason;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <RotateCcw size={14} /> Reverse Logistics
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Returns, Exchanges & Quality Inspections
          </h2>
          <p className="text-xs text-muted">
            Manage customer exchange tickets, courier reverse pickups, garment inspection outcomes, and refund settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-xs">
            {returns.length} Return Tickets Active
          </span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-admin p-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'requested', label: 'Requested' },
            { id: 'pickup_scheduled', label: 'Pickup Active' },
            { id: 'inspected', label: 'Under Inspection' },
            { id: 'refunded', label: 'Resolved / Refunded' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusTab === tab.id
                  ? 'bg-brand-red text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer, or Garment..."
            className="w-full rounded-xl border border-border bg-[#FAF8F5] pl-9 pr-4 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>

      {/* Returns List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
          <LoaderCircle size={22} className="animate-spin text-brand-red" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading returns pipeline...</span>
        </div>
      ) : returns.length === 0 ? (
        <div className="card-admin flex flex-col items-center justify-center p-12 text-center text-muted">
          <AlertCircle size={32} className="text-border mb-2" />
          <p className="text-sm font-bold text-ink">No return tickets found</p>
          <p className="text-xs text-muted">No tickets matched the current filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret.id} className="card-admin p-6 space-y-4 hover:border-brand-red/40 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-ink">{ret.order_number}</span>
                  <StatusBadge status={ret.status} />
                  <span className="rounded-md bg-[#EDE0CC] px-2 py-0.5 text-[10px] font-bold text-ink">
                    {getReasonLabel(ret.reason)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted">{formatDate(ret.created_at)}</span>
                  <span className="font-black text-ink text-sm">{formatCurrency(ret.refund_amount)}</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Customer Contact</span>
                  <div className="font-bold text-ink mt-0.5">{ret.customer_name}</div>
                  <div className="text-muted">{ret.customer_phone || 'Phone on file'}</div>
                </div>

                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Item & Size</span>
                  <div className="font-bold text-ink mt-0.5">{ret.garment_title}</div>
                  <div className="text-muted">Size: {ret.size}</div>
                </div>

                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Customer Explanation</span>
                  <p className="text-ink italic mt-0.5 leading-relaxed bg-[#FAF8F5] p-2 rounded-lg border border-border">
                    "{ret.comments}"
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span>Current stage:</span>
                  <strong className="text-ink capitalize">{ret.status.replace('_', ' ')}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ret.status === 'requested' && (
                    <>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: ret.id, newStatus: 'pickup_scheduled' })}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-red px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-red/90"
                      >
                        <Truck size={13} /> Dispatch Courier Pickup
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: ret.id, newStatus: 'rejected' })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted hover:text-ink"
                      >
                        <XCircle size={13} /> Reject Ticket
                      </button>
                    </>
                  )}

                  {ret.status === 'pickup_scheduled' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: ret.id, newStatus: 'inspected' })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#171717] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#333]"
                    >
                      <PackageCheck size={13} /> Mark Received & Inspected
                    </button>
                  )}

                  {ret.status === 'inspected' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: ret.id, newStatus: 'refunded' })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-success px-3 py-1.5 text-xs font-bold text-white hover:bg-success/90"
                    >
                      <CheckCircle2 size={13} /> Settle Refund ({formatCurrency(ret.refund_amount)})
                    </button>
                  )}

                  {ret.status === 'refunded' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle2 size={14} /> Refund Settled via Gateway
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
