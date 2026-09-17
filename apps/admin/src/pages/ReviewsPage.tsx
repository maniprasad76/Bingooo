import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ShieldCheck,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  productTitle: string;
  rating: number;
  title: string;
  body: string;
  status: 'approved' | 'rejected' | 'pending';
  verifiedBuyer: boolean;
  imageUrl?: string | null;
  created_at: string;
}

const STATUS_FILTERS = ['all', 'approved', 'pending', 'rejected'];

export function ReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const fetchReviews = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search) params.search = search;

    api
      .get<Review[]>('/reviews/admin/all', params)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await api.patch(`/reviews/${id}/status`, { status: newStatus });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(
        'Review Moderated',
        `Review marked as ${newStatus.toUpperCase()}.`
      );
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Failed to update review status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    const id = reviewToDelete;
    setProcessingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review Deleted', 'The review has been permanently removed.');
      setReviewToDelete(null);
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Failed to delete review.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (ratingFilter !== null && r.rating !== ratingFilter) return false;
    return true;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red">
              PATRON FEEDBACK
            </span>
            <span className="text-muted/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              {reviews.length} TOTAL TESTIMONIALS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink font-sans mt-0.5">
            Reviews Moderation
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Moderate buyer feedback, verify purchases, and showcase verified customer testimonials.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="btn-outline gap-2"
          disabled={loading}
          title="Refresh reviews"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Reviews</span>
        </button>
      </div>

      {/* Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Store Score</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
              <Star size={16} className="fill-amber-500" />
            </div>
          </div>
          <p className="stat-value">{avgRating} <span className="text-sm font-normal text-muted">/ 5.0</span></p>
          <span className="text-[10px] font-mono text-muted mt-1 block">Customer satisfaction index</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Submissions</span>
            <div className="w-9 h-9 rounded-xl bg-beige/60 border border-border/60 flex items-center justify-center text-ink">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="stat-value">{reviews.length}</p>
          <span className="text-[10px] font-mono text-muted mt-1 block">Submitted garment ratings</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Approved & Public</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="stat-value text-emerald-700">
            {reviews.filter((r) => r.status === 'approved').length}
          </p>
          <span className="text-[10px] font-mono text-emerald-700 mt-1 block">Visible on product pages</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Verified Buyers</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="stat-value text-sky-700">
            {reviews.filter((r) => r.verifiedBuyer).length}
          </p>
          <span className="text-[10px] font-mono text-sky-700 mt-1 block">Verified order transactions</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-card">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex gap-1 bg-beige/40 p-1 rounded-xl border border-border/60">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                  statusFilter === s
                    ? 'bg-ink text-white shadow-2xs'
                    : 'text-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-1 items-center ml-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                  ratingFilter === stars
                    ? 'bg-amber-500 text-black font-extrabold shadow-2xs'
                    : 'bg-beige/40 text-muted hover:text-ink border border-border/60'
                }`}
              >
                <span>{stars}★</span>
              </button>
            ))}
            {ratingFilter !== null && (
              <button
                onClick={() => setRatingFilter(null)}
                className="text-[10px] font-mono text-muted underline hover:text-brand-red ml-1 uppercase"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search reviewer or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9.5 w-full sm:w-[240px] py-1.5 text-xs"
            />
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="admin-card p-16 text-center text-muted text-xs">
            <RefreshCw size={20} className="animate-spin mx-auto text-brand-red mb-2" />
            <span className="font-mono uppercase tracking-widest">Loading Reviews…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card p-16 text-center text-muted text-xs">
            <MessageSquare size={28} className="mx-auto text-muted/40 mb-2" />
            <span className="font-bold text-ink text-sm block">No reviews match your filters</span>
            <p className="text-muted mt-0.5">Try clearing rating filters or searching a different keyword.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="admin-card p-5 space-y-3 hover:border-ink/30 transition-all shadow-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ink text-white text-xs font-black grid place-items-center font-mono shadow-2xs">
                    {r.customerName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-ink">{r.customerName}</strong>
                      {r.verifiedBuyer && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-bold uppercase">
                          <ShieldCheck size={10} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted">
                      Garment:{' '}
                      <span className="font-semibold text-ink">{r.productTitle}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < r.rating ? 'fill-amber-500' : 'text-border'}
                      />
                    ))}
                  </div>

                  <span
                    className={`badge ${
                      r.status === 'approved'
                        ? 'badge-success'
                        : r.status === 'rejected'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {r.status}
                  </span>

                  <span className="text-[10px] text-muted font-mono">
                    {new Date(r.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Review Body */}
              <div className="space-y-1">
                {r.title && (
                  <h4 className="text-xs font-black uppercase text-ink tracking-tight font-sans">
                    {r.title}
                  </h4>
                )}
                <p className="text-xs text-muted leading-relaxed font-sans">{r.body}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-[10px] text-muted font-mono">REF: {r.id.slice(0, 8)}</span>

                <div className="flex items-center gap-2">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'approved')}
                      disabled={processingId === r.id}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <ThumbsUp size={12} />
                      Approve
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'rejected')}
                      disabled={processingId === r.id}
                      className="px-3 py-1 rounded-xl bg-beige/60 hover:bg-beige text-ink text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border border-border/60"
                    >
                      <ThumbsDown size={12} />
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => setReviewToDelete(r.id)}
                    disabled={processingId === r.id}
                    className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Review Modal */}
      <ConfirmModal
        isOpen={reviewToDelete !== null}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review? This action cannot be undone."
        confirmText="Delete Review"
        cancelText="Cancel"
        isDestructive={true}
        loading={processingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
}
