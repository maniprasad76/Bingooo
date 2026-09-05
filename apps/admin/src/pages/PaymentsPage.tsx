import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Search,
  RotateCcw,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  LoaderCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export interface PaymentRecord {
  id: string;
  orderId?: string;
  razorpayPaymentId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
  created_at: string;
}

export function PaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState('Customer size exchange / cancellation');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin', 'payments', statusFilter, search],
    queryFn: () => api.get<PaymentRecord[]>('/payments', { status: statusFilter, search }),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/payments/${id}/refund`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast({
        title: 'Refund Processed',
        description: `Successfully initiated refund of ${formatCurrency(selectedPayment?.amount || 0)}.`,
        variant: 'success',
      });
      setRefundModalOpen(false);
      setSelectedPayment(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Refund Failed',
        description: err.message || 'Could not process refund.',
        variant: 'danger',
      });
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard', description: text, variant: 'default' });
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    refundMutation.mutate({ id: selectedPayment.id, reason: refundReason });
  };

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <CreditCard size={14} /> Financial Gateway
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Payments Ledger & Settlements
          </h2>
          <p className="text-xs text-muted">
            Track Razorpay gateway settlements, Partial COD advance deposits, and execute instant reversals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="rounded-xl border border-border bg-white px-4 py-2 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-muted block">Net Inflow (Settled)</span>
            <span className="text-base font-black text-ink">{formatCurrency(totalCollected)}</span>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-2 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-muted block">Reversals & Refunds</span>
            <span className="text-base font-black text-brand-red">{formatCurrency(totalRefunded)}</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-admin p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Razorpay ID, Order #, or customer email..."
            className="w-full rounded-xl border border-border bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-ink focus:border-brand-red focus:outline-none"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Captured & Settled</option>
            <option value="pending">Pending Auth</option>
            <option value="refunded">Refunded / Reversed</option>
            <option value="failed">Failed / Dropped</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card-admin overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
            <LoaderCircle size={22} className="animate-spin text-brand-red" />
            <span className="text-xs font-bold uppercase tracking-wider">Syncing payments ledger...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
            <AlertCircle size={32} className="text-border mb-2" />
            <p className="text-sm font-bold text-ink">No transactions found</p>
            <p className="text-xs text-muted">No transactions matched your search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-[#F5F0EB] text-[11px] font-black uppercase text-ink">
                <tr>
                  <th className="px-6 py-3.5">Gateway Reference</th>
                  <th className="px-6 py-3.5">Order #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs">
                      {p.razorpayPaymentId ? (
                        <div className="flex items-center gap-1.5 font-bold text-ink">
                          <span>{p.razorpayPaymentId}</span>
                          <button
                            onClick={() => handleCopy(p.razorpayPaymentId!)}
                            className="text-muted hover:text-ink"
                            title="Copy Gateway ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted italic">Manual COD Invoice</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 font-bold text-ink font-mono">
                      {p.orderNumber}
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="font-bold text-ink">{p.customerName}</div>
                      <div className="text-[11px] text-muted">{p.customerEmail}</div>
                    </td>

                    <td className="px-6 py-3.5 font-medium text-ink">
                      {p.method}
                    </td>

                    <td className="px-6 py-3.5 font-black text-ink text-sm">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="px-6 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="px-6 py-3.5 text-muted text-[11px] whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {p.status === 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setRefundModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-brand-red hover:bg-[#FDF0EE] transition-colors"
                        >
                          <RotateCcw size={12} /> Issue Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Confirmation Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Authorize Gateway Refund"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4">
          <div className="rounded-xl border border-brand-red/20 bg-[#FDF0EE] p-4 text-xs text-[#90170B]">
            <p className="font-bold">Are you sure you want to reverse this charge?</p>
            <p className="mt-1">
              Refunding will send an API payload to Razorpay, update the order status to "refunded", and trigger an audit entry.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border py-2">
              <span className="text-muted">Order Number</span>
              <span className="font-bold text-ink font-mono">{selectedPayment?.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2">
              <span className="text-muted">Payment ID</span>
              <span className="font-bold text-ink font-mono">{selectedPayment?.razorpayPaymentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2">
              <span className="text-muted">Refund Amount</span>
              <span className="font-black text-brand-red text-sm">
                {formatCurrency(selectedPayment?.amount || 0)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Reason for Refund
            </label>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-xs font-bold text-ink focus:border-brand-red focus:outline-none"
            >
              <option value="Customer size exchange / cancellation">Customer size exchange / cancellation</option>
              <option value="Defective garment / print flaw">Defective garment / print flaw</option>
              <option value="Package lost in transit by courier">Package lost in transit by courier</option>
              <option value="Customer duplicate transaction">Customer duplicate transaction</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setRefundModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={refundMutation.isPending}
              className="rounded-xl bg-brand-red px-4 py-2 text-xs font-bold text-white hover:bg-brand-red/90 disabled:opacity-50"
            >
              {refundMutation.isPending ? 'Processing...' : 'Authorize Refund'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
