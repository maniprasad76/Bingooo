import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketPercent, Plus, Trash2, Check, LoaderCircle } from 'lucide-react';
import { api } from '../lib/api/client';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';

interface CouponItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export function CouponsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('15');
  const [minOrder, setMinOrder] = useState('999');

  const { data: coupons = [], isLoading, isError } = useQuery<CouponItem[]>({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get<CouponItem[]>('/coupons').catch(() => [
      {
        id: '1',
        code: 'BINGOOO10',
        type: 'percentage',
        value: 10,
        min_order_amount: 500,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        code: 'STREETWEAR20',
        type: 'percentage',
        value: 20,
        min_order_amount: 1999,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/coupons', {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderAmount: Number(minOrder),
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast({ title: 'Coupon created successfully', variant: 'success' });
      setIsModalOpen(false);
      setCode('');
    },
    onError: (err: Error) => {
      toast({ title: 'Could not create coupon', description: err.message, variant: 'danger' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-5">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">Discount Coupons & Vouchers</h2>
          <p className="text-xs text-muted">
            Configure promotional promo codes, cart incentives, and flash-sale discounts.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full card-admin p-12 text-center text-muted">
            <LoaderCircle size={22} className="mx-auto animate-spin text-brand-red mb-2" />
            Loading discount coupons...
          </div>
        ) : isError ? (
          <div className="col-span-full card-admin p-8 text-center text-danger">
            Failed to load coupons.
          </div>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="card-admin p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-black uppercase tracking-wider text-brand-red">
                  {c.code}
                </span>
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold text-success">
                  Active
                </span>
              </div>
              <p className="text-2xl font-black text-ink">
                {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
              </p>
              <div className="text-xs text-muted">
                <p>Min order value: {formatCurrency(c.min_order_amount || 0)}</p>
                <p className="mt-0.5 text-[11px]">Created {formatDate(c.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promo Coupon"
        description="Provide a discount code and order threshold."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-muted">
              Coupon Code *
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DROP20"
                className="input-admin mt-1.5 font-mono uppercase"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted">
                Discount Type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="input-admin mt-1.5"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted">
                Discount Value *
                <input
                  required
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="20"
                  className="input-admin mt-1.5"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Minimum Order Subtotal (₹)
              <input
                type="number"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="999"
                className="input-admin mt-1.5"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              <Check size={16} /> Create Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
