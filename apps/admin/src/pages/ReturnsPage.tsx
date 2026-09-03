import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';

interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  garmentTitle: string;
  size: string;
  reason: 'size_fit' | 'print_defect' | 'wrong_item' | 'fabric_feel';
  comments: string;
  refundAmount: number;
  status: 'requested' | 'reviewing' | 'pickup_scheduled' | 'inspected' | 'refunded' | 'rejected';
  created_at: string;
}

const mockReturns: ReturnRequest[] = [
  {
    id: 'ret-101',
    orderNumber: 'BING-89410',
    customerName: 'Kunal Singhania',
    customerPhone: '+91 98111 22334',
    garmentTitle: 'Heavyweight Drop-Shoulder Tee',
    size: 'XL',
    reason: 'size_fit',
    comments: 'Need size L instead. The oversized boxy cut is larger than expected.',
    refundAmount: 1199,
    status: 'requested',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'ret-102',
    orderNumber: 'BING-89395',
    customerName: 'Megha Nair',
    customerPhone: '+91 99200 44556',
    garmentTitle: 'Oversized Minimal Hoodie - Bone White',
    size: 'M',
    reason: 'print_defect',
    comments: 'Custom studio backprint has a slight smudge on the bottom left corner.',
    refundAmount: 1899,
    status: 'pickup_scheduled',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ret-103',
    orderNumber: 'BING-89350',
    customerName: 'Dhruv Chawla',
    customerPhone: '+91 97110 33445',
    garmentTitle: 'Signature Relaxed Sweatshirt',
    size: 'L',
    reason: 'wrong_item',
    comments: 'Received Charcoal instead of Olive Green color variant.',
    refundAmount: 1499,
    status: 'inspected',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export function ReturnsPage() {
  const { toast } = useToast();

  const [returns, setReturns] = useState<ReturnRequest[]>(mockReturns);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');

  const updateStatus = (id: string, newStatus: ReturnRequest['status']) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast({
      title: 'Return lifecycle updated',
      description: `Return request moved to ${newStatus.replace('_', ' ')}.`,
      variant: 'success',
    });
  };

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
        return 'General Return';
    }
  };

  const filtered = returns.filter((r) => {
    const matchesStatus = statusTab === 'all' || r.status === statusTab;
    const matchesSearch =
      r.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.garmentTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <RotateCcw size={14} /> Reverse Logistics
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Returns, Exchanges & Inspection Pipeline
          </h2>
          <p className="text-xs text-muted">
            Track reverse courier pickups, physical garment quality checks, and customer refunds.
          </p>
        </div>

        <div className="relative min-w-0 flex-1 sm:min-w-[260px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or customer..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'requested', label: 'New Requests' },
          { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
          { key: 'inspected', label: 'Inspected in Warehouse' },
          { key: 'refunded', label: 'Refunded / Closed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              statusTab === tab.key
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-white text-muted border border-border hover:border-brand-red hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filtered.map((ret) => (
          <div key={ret.id} className="card-admin p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-ink text-base">Return #{ret.id}</span>
                  <span className="text-xs text-muted">for Order #{ret.orderNumber}</span>
                  <StatusBadge status={ret.status} />
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Requested by <strong>{ret.customerName}</strong> ({ret.customerPhone}) on {formatDate(ret.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ret.status}
                  onChange={(e) => updateStatus(ret.id, e.target.value as any)}
                  className="input-admin w-auto text-xs font-bold"
                >
                  <option value="requested">New Request</option>
                  <option value="reviewing">Under Review</option>
                  <option value="pickup_scheduled">Pickup Scheduled (Delhivery)</option>
                  <option value="inspected">Warehouse Inspected (Passed)</option>
                  <option value="refunded">Refund Issued</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Garment & Reason */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-border bg-[#F7EEDB]/30 p-3 space-y-1">
                <span className="text-muted block text-[11px] uppercase font-semibold">Garment</span>
                <p className="font-bold text-ink">{ret.garmentTitle}</p>
                <p className="text-muted">Size: <strong>{ret.size}</strong></p>
              </div>

              <div className="rounded-xl border border-border bg-[#F7EEDB]/30 p-3 space-y-1">
                <span className="text-muted block text-[11px] uppercase font-semibold">Return Reason</span>
                <p className="font-bold text-brand-red">{getReasonLabel(ret.reason)}</p>
                <p className="text-muted truncate">{ret.comments}</p>
              </div>

              <div className="rounded-xl border border-border bg-[#F7EEDB]/30 p-3 space-y-1">
                <span className="text-muted block text-[11px] uppercase font-semibold">Refund Value</span>
                <p className="font-bold text-ink text-sm">{formatCurrency(ret.refundAmount)}</p>
                <p className="text-muted">Reverse via Razorpay UPI</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <span className="text-muted">
                Comments: <em className="text-ink">"{ret.comments}"</em>
              </span>

              <div className="flex items-center gap-2">
                {ret.status === 'requested' && (
                  <button
                    onClick={() => updateStatus(ret.id, 'pickup_scheduled')}
                    className="btn-secondary text-xs"
                  >
                    <Truck size={14} /> Schedule Courier Pickup
                  </button>
                )}
                {ret.status === 'pickup_scheduled' && (
                  <button
                    onClick={() => updateStatus(ret.id, 'inspected')}
                    className="btn-secondary text-xs"
                  >
                    <PackageCheck size={14} /> Mark Warehouse Inspected
                  </button>
                )}
                {ret.status === 'inspected' && (
                  <button
                    onClick={() => updateStatus(ret.id, 'refunded')}
                    className="btn-primary text-xs"
                  >
                    <CheckCircle2 size={14} /> Approve & Issue Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
