import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Star,
  Search,
  CheckCircle2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ShieldCheck,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-[#171717] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#171717] text-white px-2 py-0.5">
              PATRON FEEDBACK
            </span>
            <span className="text-[#171717]/40 font-mono">•</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717]/70">
              {reviews.length} TOTAL TESTIMONIALS
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171717] font-sans mt-1">
            Reviews Moderation
          </h1>
          <p className="text-xs text-[#171717]/70 mt-0.5 font-medium">
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

      {/* Bauhaus Bento Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Store Score</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-amber-100 flex items-center justify-center text-amber-700 shadow-[2px_2px_0px_#171717]">
              <Star size={16} className="fill-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#171717] mt-2">{avgRating} <span className="text-sm font-normal text-[#171717]/50">/ 5.0</span></p>
          <span className="text-[10px] font-mono text-[#171717]/60 mt-1 block uppercase">Customer satisfaction index</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Submissions</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-[#F7EEDB] flex items-center justify-center text-[#171717] shadow-[2px_2px_0px_#171717]">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#171717] mt-2">{reviews.length}</p>
          <span className="text-[10px] font-mono text-[#171717]/60 mt-1 block uppercase">Submitted garment ratings</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Approved & Public</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-emerald-100 flex items-center justify-center text-emerald-900 shadow-[2px_2px_0px_#171717]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-800 mt-2">
            {reviews.filter((r) => r.status === 'approved').length}
          </p>
          <span className="text-[10px] font-mono text-emerald-800 font-bold mt-1 block uppercase">Visible on product pages</span>
        </div>

        <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 tracking-wider">Verified Buyers</span>
            <div className="w-8 h-8 border-2 border-[#171717] bg-sky-100 flex items-center justify-center text-sky-900 shadow-[2px_2px_0px_#171717]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-sky-800 mt-2">
            {reviews.filter((r) => r.verifiedBuyer).length}
          </p>
          <span className="text-[10px] font-mono text-sky-800 font-bold mt-1 block uppercase">Verified order transactions</span>
        </div>
      </div>

      {/* Bauhaus Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border-2 border-[#171717] shadow-[3px_3px_0px_#171717]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-[#171717] transition-all ${
                  statusFilter === s
                    ? 'bg-[#171717] text-white shadow-[2px_2px_0px_#E6321C]'
                    : 'bg-white text-[#171717] hover:bg-[#F7EEDB]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-1 items-center ml-1">
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                className={`px-2 py-1 text-[10px] font-mono font-bold border-2 border-[#171717] flex items-center gap-0.5 transition-all ${
                  ratingFilter === stars
                    ? 'bg-amber-400 text-[#171717] font-black shadow-[2px_2px_0px_#171717]'
                    : 'bg-white text-[#171717] hover:bg-[#F7EEDB]'
                }`}
              >
                <span>{stars}★</span>
              </button>
            ))}
            {ratingFilter !== null && (
              <button
                onClick={() => setRatingFilter(null)}
                className="text-[10px] font-mono text-[#E6321C] font-bold underline hover:opacity-80 ml-1 uppercase"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/60" />
            <input
              type="text"
              placeholder="Search reviewer or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-9 w-full sm:w-[240px] py-1.5 text-xs font-mono font-semibold"
            />
          </div>
        </form>
      </div>

      {/* Bauhaus Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border-2 border-[#171717] p-16 text-center text-[#171717]/60 text-xs shadow-[4px_4px_0px_#171717]">
            <RefreshCw size={22} className="animate-spin mx-auto text-[#E6321C] mb-2" />
            <span className="font-mono uppercase tracking-widest font-bold">Loading Reviews…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-[#171717] p-16 text-center text-[#171717]/60 text-xs shadow-[4px_4px_0px_#171717]">
            <MessageSquare size={32} className="mx-auto text-[#171717]/40 mb-2" />
            <span className="font-bold text-[#171717] text-sm block font-mono uppercase">No reviews match your filters</span>
            <p className="text-[#171717]/70 mt-0.5">Try clearing rating filters or searching a different keyword.</p>
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border-2 border-[#171717] p-5 space-y-3 shadow-[4px_4px_0px_#171717] hover:shadow-[6px_6px_0px_#171717] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#171717] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#171717] bg-[#171717] text-white text-xs font-black grid place-items-center font-mono shadow-[2px_2px_0px_#171717]">
                    {r.customerName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-black uppercase text-[#171717]">{r.customerName}</strong>
                      {r.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717]">
                          <ShieldCheck size={10} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#171717]/70 font-medium">
                      Garment:{' '}
                      <span className="font-black text-[#171717] uppercase">{r.productTitle}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < r.rating ? 'fill-amber-500' : 'text-[#DDD3C5]'}
                      />
                    ))}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 border border-[#171717] text-[10px] font-mono font-bold uppercase shadow-[1px_1px_0px_#171717] ${
                      r.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : r.status === 'rejected'
                        ? 'bg-[#E6321C] text-white'
                        : 'bg-amber-300 text-[#171717]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 bg-current" />
                    {r.status}
                  </span>

                  <span className="text-[10px] text-[#171717]/60 font-mono font-bold">
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
                  <h4 className="text-xs font-black uppercase text-[#171717] tracking-tight font-sans">
                    {r.title}
                  </h4>
                )}
                <p className="text-xs text-[#171717]/80 leading-relaxed font-sans">{r.body}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t-2 border-[#171717]">
                <span className="text-[10px] text-[#171717]/60 font-mono font-bold">REF: {r.id.slice(0, 8)}</span>

                <div className="flex items-center gap-2">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'approved')}
                      disabled={processingId === r.id}
                      className="px-3 py-1 border-2 border-[#171717] bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <ThumbsUp size={12} />
                      Approve
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'rejected')}
                      disabled={processingId === r.id}
                      className="px-3 py-1 border-2 border-[#171717] bg-[#F7EEDB] hover:bg-white text-[#171717] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <ThumbsDown size={12} />
                      Reject
                    </button>
                  )}

                  <button
                    onClick={() => setReviewToDelete(r.id)}
                    disabled={processingId === r.id}
                    className="p-1 border-2 border-[#171717] bg-white hover:bg-[#E6321C] hover:text-white text-[#171717] shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px]"
                    title="Delete Review"
                  >
                    <Trash2 size={13} />
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
