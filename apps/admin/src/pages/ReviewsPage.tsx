import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  ThumbsUp,
  Image as ImageIcon,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';

interface ReviewItem {
  id: string;
  customerName: string;
  productTitle: string;
  rating: number;
  title: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedBuyer: boolean;
  created_at: string;
  imageUrl?: string;
}

const mockReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    customerName: 'Aman Deep',
    productTitle: 'Heavyweight Boxy Tee - Washed Black',
    rating: 5,
    title: 'Incredible heavyweight drape and fit',
    body: 'The 240 GSM weight is real. Thick ribbed collar does not bacon after wash. Very high quality streetwear silhouette.',
    status: 'approved',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
  },
  {
    id: 'rev-2',
    customerName: 'Varun Joshi',
    productTitle: 'Oversized Minimal Hoodie - Bone White',
    rating: 4,
    title: 'Custom DTG print came out very crisp',
    body: 'Designed my own artwork in the Bingooo Studio. Colors on fabric matched my monitor very closely. Soft fleece lining.',
    status: 'approved',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev-3',
    customerName: 'Pooja Sethi',
    productTitle: 'Signature Relaxed Sweatshirt',
    rating: 2,
    title: 'Sizing runs much larger than standard',
    body: 'Bought size M for my boyfriend but it fits like an XL. Mention sizing notes more prominently on the product page.',
    status: 'pending',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
];

export function ReviewsPage() {
  const { toast } = useToast();

  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');

  const updateStatus = (id: string, newStatus: ReviewItem['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast({
      title: 'Review moderation updated',
      description: `Review is now ${newStatus}.`,
      variant: 'success',
    });
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Review removed from store', variant: 'success' });
  };

  const filtered = reviews.filter((r) => {
    const matchesStatus = statusTab === 'all' || r.status === statusTab;
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Star size={14} /> Shopper Feedback
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Customer Reviews & Ratings Moderation
          </h2>
          <p className="text-xs text-muted">
            Inspect customer testimonials, star ratings, and garment photo uploads before publishing to product pages.
          </p>
        </div>

        <div className="relative min-w-0 flex-1 sm:min-w-[260px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or product..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: 'all', label: 'All Reviews' },
          { key: 'pending', label: 'Pending Moderation' },
          { key: 'approved', label: 'Approved (Live on Store)' },
          { key: 'rejected', label: 'Rejected' },
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

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((rev) => (
          <div key={rev.id} className="card-admin p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-ink text-sm">{rev.customerName}</span>
                  {rev.verifiedBuyer && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                      <UserCheck size={12} /> Verified Buyer
                    </span>
                  )}
                  <StatusBadge status={rev.status} />
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Reviewed <strong>{rev.productTitle}</strong> on {formatDate(rev.created_at)}
                </p>
              </div>

              {/* Moderation Controls */}
              <div className="flex items-center gap-2">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(rev.id, 'approved')}
                    className="btn-primary text-xs"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                {rev.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(rev.id, 'rejected')}
                    className="btn-secondary text-xs"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-muted hover:text-danger rounded-lg border border-border"
                  title="Delete Review"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Stars & Review Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= rev.rating
                        ? 'fill-[#E6321C] text-[#E6321C]'
                        : 'text-border fill-border/30'
                    }
                  />
                ))}
                <span className="text-xs font-bold text-ink ml-1.5">{rev.rating}.0 / 5</span>
              </div>

              <h4 className="font-bold text-ink text-sm">{rev.title}</h4>
              <p className="text-xs text-muted leading-relaxed">{rev.body}</p>

              {rev.imageUrl && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-muted block mb-1">Attached Customer Photo:</span>
                  <img
                    src={rev.imageUrl}
                    alt="Customer garment"
                    className="h-20 w-20 rounded-xl border border-border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
