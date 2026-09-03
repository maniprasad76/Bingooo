import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface PaymentRecord {
  id: string;
  razorpayPaymentId?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';
  created_at: string;
}

const mockPayments: PaymentRecord[] = [
  {
    id: 'pay-901',
    razorpayPaymentId: 'pay_Nz82Lk19J0asQ2',
    orderNumber: 'BING-89421',
    customerName: 'Akash Verma',
    customerEmail: 'akash.verma@example.com',
    amount: 2498,
    method: 'Razorpay UPI (Google Pay)',
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pay-902',
    razorpayPaymentId: 'pay_Nz75Kl02Aa34W1',
    orderNumber: 'BING-89419',
    customerName: 'Devika Pillai',
    customerEmail: 'devika.pillai@outlook.com',
    amount: 1199,
    method: 'HDFC Credit Card (Visa)',
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'pay-903',
    razorpayPaymentId: 'pay_Nz61Mn99Zq00P9',
    orderNumber: 'BING-89412',
    customerName: 'Rohan Deshmukh',
    customerEmail: 'rohan.d@gmail.com',
    amount: 3499,
    method: 'Partial COD (₹150 Advance Paid)',
    status: 'paid',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'pay-904',
    razorpayPaymentId: 'pay_Nz50Po88Lk11X4',
    orderNumber: 'BING-89390',
    customerName: 'Tanvi Saxena',
    customerEmail: 'tanvi.saxena@yahoo.com',
    amount: 1899,
    method: 'ICICI NetBanking',
    status: 'refunded',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'pay-905',
    razorpayPaymentId: 'pay_Nz42Bb77Vv66Y8',
    orderNumber: 'BING-89381',
    customerName: 'Manish Rawat',
    customerEmail: 'manish.rawat@hotmail.com',
    amount: 999,
    method: 'Paytm UPI',
    status: 'failed',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export function PaymentsPage() {
  const { toast } = useToast();

  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState('Customer size exchange / cancellation');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Payment ID copied', variant: 'success' });
  };

  const openRefundModal = (p: PaymentRecord) => {
    setSelectedPayment(p);
    setRefundModalOpen(true);
  };

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setPayments((prev) =>
      prev.map((p) =>
        p.id === selectedPayment.id ? { ...p, status: 'refunded' as const } : p
      )
    );
    toast({
      title: 'Refund processed via Razorpay',
      description: `Refund of ${formatCurrency(selectedPayment.amount)} initiated to ${selectedPayment.customerName}.`,
      variant: 'success',
    });
    setRefundModalOpen(false);
  };

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (p.razorpayPaymentId || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCaptured = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Settled Volume</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatCurrency(totalCaptured)}</p>
          <p className="text-[11px] text-muted">Captured via Razorpay Gateway</p>
        </div>
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Refunds Processed</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatCurrency(totalRefunded)}</p>
          <p className="text-[11px] text-muted">Processed returns & order cancellations</p>
        </div>
        <div className="card-admin p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Gateway Success Rate</p>
          <p className="mt-2 text-2xl font-black text-success">96.8%</p>
          <p className="text-[11px] text-muted">UPI Intent & Card 3DS verified</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="relative min-w-0 flex-1 sm:min-w-[260px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer, or Razorpay ID..."
            className="input-admin pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-admin w-auto text-xs"
          >
            <option value="all">All Transactions</option>
            <option value="paid">Captured / Paid</option>
            <option value="pending">Pending Settlement</option>
            <option value="failed">Failed / Dropped</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-admin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Transaction & Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#FDF9F4]">
                  <td className="p-4">
                    <span className="font-bold text-ink">#{pay.orderNumber}</span>
                    {pay.razorpayPaymentId && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-muted truncate max-w-[140px]">
                          {pay.razorpayPaymentId}
                        </span>
                        <button
                          onClick={() => handleCopy(pay.razorpayPaymentId!)}
                          className="text-muted hover:text-brand-red"
                          title="Copy ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-ink">{pay.customerName}</p>
                    <p className="text-[11px] text-muted">{pay.customerEmail}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-ink">{pay.method}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-ink">{formatCurrency(pay.amount)}</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={pay.status} />
                  </td>
                  <td className="p-4 text-muted">{formatDate(pay.created_at)}</td>
                  <td className="p-4 text-right">
                    {pay.status === 'paid' && (
                      <button
                        onClick={() => openRefundModal(pay)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
                      >
                        <RotateCcw size={13} /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {selectedPayment && (
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title={`Initiate Refund for Order #${selectedPayment.orderNumber}`}
          description={`Amount: ${formatCurrency(selectedPayment.amount)} • Customer: ${selectedPayment.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleProcessRefund} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted">
                Razorpay Payment Reference
                <input
                  disabled
                  value={selectedPayment.razorpayPaymentId || 'N/A'}
                  className="input-admin mt-1 font-mono text-xs opacity-80"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Refund Reason / Audit Note *
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="input-admin mt-1 text-xs"
                >
                  <option value="Customer size exchange / cancellation">Customer size exchange / cancellation</option>
                  <option value="Defective / incorrect print quality">Defective / incorrect print quality</option>
                  <option value="Customer changed mind before dispatch">Customer changed mind before dispatch</option>
                  <option value="Item out of physical stock">Item out of physical stock</option>
                </select>
              </label>
            </div>

            <div className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
              ⚠️ Initiating this refund will instruct Razorpay to reverse {formatCurrency(selectedPayment.amount)} directly to the customer's source bank/UPI account.
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary bg-danger hover:bg-danger/90">
                Confirm & Reverse Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
