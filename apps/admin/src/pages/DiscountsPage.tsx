import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Plus,
  Trash2,
  Check,
  Calendar,
  Layers,
  Percent,
  TrendingDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  appliesTo: 'all' | 'category' | 'products';
  targetCategoryName?: string;
  minQuantity?: number;
  priority: number;
  stackable: boolean;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

const initialDiscounts: DiscountRule[] = [
  {
    id: 'disc-1',
    name: 'Summer Heavyweight Drop - 15% Off',
    type: 'percentage',
    value: 15,
    appliesTo: 'category',
    targetCategoryName: 'Oversized Tees',
    minQuantity: 1,
    priority: 1,
    stackable: false,
    isActive: true,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  },
  {
    id: 'disc-2',
    name: 'Multi-Garment Bundle Deal',
    type: 'percentage',
    value: 10,
    appliesTo: 'all',
    minQuantity: 2,
    priority: 2,
    stackable: true,
    isActive: true,
    startDate: '2026-08-15',
  },
  {
    id: 'disc-3',
    name: 'Fleece Hoodies Early Bird Flat ₹300 Off',
    type: 'fixed_amount',
    value: 300,
    appliesTo: 'category',
    targetCategoryName: 'Hoodies',
    minQuantity: 1,
    priority: 3,
    stackable: false,
    isActive: false,
    startDate: '2026-10-01',
    endDate: '2026-11-15',
  },
];

export function DiscountsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [discounts, setDiscounts] = useState<DiscountRule[]>(initialDiscounts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [value, setValue] = useState('15');
  const [appliesTo, setAppliesTo] = useState<'all' | 'category' | 'products'>('all');
  const [targetCategory, setTargetCategory] = useState('Oversized Tees');
  const [minQuantity, setMinQuantity] = useState('1');
  const [stackable, setStackable] = useState(false);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('');

  const handleOpenCreate = () => {
    setName('');
    setType('percentage');
    setValue('15');
    setAppliesTo('all');
    setMinQuantity('1');
    setStackable(false);
    setStartDate('2026-09-01');
    setEndDate('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: DiscountRule = {
      id: `disc-${Date.now()}`,
      name,
      type,
      value: Number(value),
      appliesTo,
      targetCategoryName: appliesTo === 'category' ? targetCategory : undefined,
      minQuantity: Number(minQuantity),
      priority: discounts.length + 1,
      stackable,
      isActive: true,
      startDate,
      endDate: endDate || undefined,
    };
    setDiscounts((prev) => [newRule, ...prev]);
    toast({ title: 'Promotional discount rule activated', variant: 'success' });
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
    toast({ title: 'Discount status updated', variant: 'success' });
  };

  const handleDelete = (id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
    toast({ title: 'Discount rule removed', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Tag size={14} /> Automated Campaigns
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Promotional & Category Discounts
          </h2>
          <p className="text-xs text-muted">
            Configure automatic catalog price reductions, volume purchase tiers, and seasonal promotions without coupon codes.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={16} /> New Discount Rule
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="card-admin p-5 space-y-4 flex flex-col justify-between border border-border"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red font-black">
                    {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                  </span>
                  <div>
                    <h3 className="font-bold text-ink text-sm leading-snug">{discount.name}</h3>
                    <p className="text-[11px] text-muted">Priority #{discount.priority}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(discount.id)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                    discount.isActive ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'
                  }`}
                >
                  {discount.isActive ? 'Active' : 'Paused'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-muted">
                <p>
                  Scope:{' '}
                  <strong className="text-ink capitalize">
                    {discount.appliesTo === 'category'
                      ? `Category (${discount.targetCategoryName})`
                      : discount.appliesTo === 'all'
                      ? 'Entire Storefront'
                      : 'Selected Items'}
                  </strong>
                </p>
                {discount.minQuantity && discount.minQuantity > 1 && (
                  <p>Min Quantity: <strong className="text-ink">{discount.minQuantity} garments</strong></p>
                )}
                <p>Stackable: <strong className="text-ink">{discount.stackable ? 'Yes' : 'No'}</strong></p>
                <p className="text-[11px] text-muted/80">
                  Starts {discount.startDate} {discount.endDate ? `• Ends ${discount.endDate}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-[11px] text-muted font-mono">ID: {discount.id}</span>
              <button
                onClick={() => handleDelete(discount.id)}
                className="text-muted hover:text-danger p-1 rounded"
                title="Delete Discount"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Discount Rule"
        description="Set automatic price reductions applied in the cart and catalog."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted">
              Campaign Name *
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="End of Season 20% Off Tees"
                className="input-admin mt-1"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-muted">
                Discount Type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="input-admin mt-1 text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount (₹ INR)</option>
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
                  className="input-admin mt-1 text-xs font-bold"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Applies To
                <select
                  value={appliesTo}
                  onChange={(e) => setAppliesTo(e.target.value as any)}
                  className="input-admin mt-1 text-xs"
                >
                  <option value="all">All Products (Storewide)</option>
                  <option value="category">Specific Category</option>
                </select>
              </label>
            </div>

            {appliesTo === 'category' && (
              <div>
                <label className="block text-xs font-bold text-muted">
                  Category
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="input-admin mt-1 text-xs"
                  >
                    <option value="Oversized Tees">Oversized Tees</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants & Cargo">Pants & Cargo</option>
                  </select>
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-muted">
                Min Garment Quantity
                <input
                  type="number"
                  min="1"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                  className="input-admin mt-1 text-xs"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-admin mt-1 text-xs"
                />
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={stackable}
                onChange={(e) => setStackable(e.target.checked)}
                className="h-4 w-4 accent-brand-red"
              />
              Allow stacking with promotional coupons
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Create Discount
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
