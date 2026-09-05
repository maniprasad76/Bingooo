import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  ThumbsUp,
  Image as ImageIcon,
  UserCheck,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export interface ReviewItem {
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

export function ReviewsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin', 'reviews', statusTab, search],
    queryFn: () => api.get<ReviewItem[]>('/reviews/admin/all', { status: statusTab, search }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: ReviewItem['status'] }) =>
      api.patch(`/reviews/${id}/status`, { status: newStatus }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast({
        title: 'Review moderation updated',
        description: `Review is now ${variables.newStatus}.`,
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update review status.',
        variant: 'danger',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast({ title: 'Review removed from store', variant: 'success' });
    },
    onError: (err: any) => {
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete review.',
        variant: 'danger',
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Star size={14} /> Social Proof & Sentiment
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Customer Reviews & Product Ratings
          </h2>
          <p className="text-xs text-muted">
            Moderate verified customer garment reviews, photographic submissions, and manage public visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-xs">
            {reviews.length} Reviews in Database
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-admin p-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'pending', label: 'Pending Moderation' },
            { id: 'approved', label: 'Approved & Live' },
            { id: 'rejected', label: 'Rejected' },
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
            placeholder="Search by customer, garment, or feedback content..."
            className="w-full rounded-xl border border-border bg-[#FAF8F5] pl-9 pr-4 py-1.5 text-xs text-ink placeholder:text-muted focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
          <LoaderCircle size={22} className="animate-spin text-brand-red" />
          <span className="text-xs font-bold uppercase tracking-wider">Syncing customer feedback...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="card-admin flex flex-col items-center justify-center p-12 text-center text-muted">
          <AlertCircle size={32} className="text-border mb-2" />
          <p className="text-sm font-bold text-ink">No reviews found</p>
          <p className="text-xs text-muted">No reviews match the active criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="card-admin p-6 space-y-4 hover:border-brand-red/30 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">{rev.customerName}</span>
                    {rev.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#EAF7EE] px-2 py-0.5 text-[10px] font-bold text-success">
                        <UserCheck size={11} /> Verified Order
                      </span>
                    )}
                    <StatusBadge status={rev.status} />
                  </div>
                  <p className="text-xs text-brand-red font-bold mt-0.5">{rev.productTitle}</p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}
                      />
                    ))}
                    <span className="ml-1 font-bold text-ink">{rev.rating}.0</span>
                  </div>
                  <span className="text-muted">{formatDate(rev.created_at)}</span>
                </div>
              </div>

              {/* Review content */}
              <div className="space-y-2 text-xs">
                {rev.title && <h4 className="font-bold text-ink text-sm">{rev.title}</h4>}
                <p className="text-ink leading-relaxed font-sans">{rev.body}</p>

                {rev.imageUrl && (
                  <div className="pt-2">
                    <div className="relative inline-block overflow-hidden rounded-xl border border-border">
                      <img
                        src={rev.imageUrl}
                        alt="Customer look"
                        className="h-24 w-24 object-cover hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                        <ImageIcon size={10} className="inline mr-0.5" /> Customer photo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                <span className="text-[11px] text-muted">
                  Review ID: <strong className="font-mono text-ink">{rev.id}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: rev.id, newStatus: 'approved' })}
                      className="inline-flex items-center gap-1 rounded-xl bg-success px-3 py-1.5 text-xs font-bold text-white hover:bg-success/90 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve & Publish
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: rev.id, newStatus: 'rejected' })}
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted hover:text-ink transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}

                  <button
                    onClick={() => deleteMutation.mutate(rev.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-white p-2 text-xs text-muted hover:text-brand-red transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
