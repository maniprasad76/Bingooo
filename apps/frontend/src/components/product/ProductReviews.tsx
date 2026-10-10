import { useState, useRef, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Camera,
  X,
  Sparkles,
  ShieldCheck,
  LoaderCircle,
  Lock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../lib/api/client';
import { useToast } from '../ui/Toast';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  customerName: string;
  verifiedBuyer: boolean;
  fitFeedback?: 'runs_small' | 'true_to_size' | 'runs_large';
  imageUrl?: string | null;
  created_at: string;
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
  distribution?: Record<number, number>;
  fitBreakdown?: {
    runsSmallPct: number;
    trueToSizePct: number;
    runsLargePct: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  productThumbnail?: string;
}

/** Client-side image compression using offscreen HTML5 canvas */
function compressImage(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductReviews({ productId, productTitle, productThumbnail }: ProductReviewsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const sectionRef = useRef<HTMLElement>(null);
  // Links from the post-delivery review email carry ?review=1.
  const reviewRequested = new URLSearchParams(location.search).get('review') === '1';

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [fitFeedback, setFitFeedback] = useState<'runs_small' | 'true_to_size' | 'runs_large'>('true_to_size');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real reviews
  const { data: reviewsData, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await api.get<ReviewsResponse>(`/reviews/product/${productId}`);
      return res;
    },
    enabled: !!productId,
  });

  // Check customer review eligibility
  const {
    data: eligibility,
    isLoading: isCheckingEligibility,
    refetch: checkEligibility,
  } = useQuery({
    queryKey: ['reviews-eligibility', productId],
    queryFn: async () => {
      try {
        return await api.get<{
          eligible: boolean;
          hasPurchased: boolean;
          hasReviewedAlready?: boolean;
          orderId?: string;
          reason?: string;
        }>('/reviews/eligibility', {
          params: { productId },
        });
      } catch (err: any) {
        // Signed-out visitors (e.g. arriving from the review email) get the sign-in prompt, not the form.
        if (err?.status === 401) return { eligible: false, hasPurchased: false, reason: 'AUTHENTICATION_REQUIRED' };
        throw err;
      }
    },
    enabled: isDrawerOpen,
  });

  const reviews = reviewsData?.reviews || [];
  const total = reviewsData?.total || 0;
  const averageRating = reviewsData?.averageRating || 0;
  const distribution = reviewsData?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const fitBreakdown = reviewsData?.fitBreakdown || {
    runsSmallPct: 0,
    trueToSizePct: 100,
    runsLargePct: 0,
  };

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (payload: {
      productId: string;
      rating: number;
      title: string;
      body: string;
      customerName?: string;
      fitFeedback: 'runs_small' | 'true_to_size' | 'runs_large';
      imageUrl?: string;
    }) => {
      return await api.post('/reviews', payload);
    },
    onSuccess: () => {
      triggerHaptic('medium');
      toast({
        title: 'Review Published',
        description: 'Thank you! Your verified purchase feedback is now live.',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews-eligibility', productId] });
      setIsDrawerOpen(false);
      // Reset form
      setRating(5);
      setTitle('');
      setBody('');
      setCustomerName('');
      setPreviewImage(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Could Not Submit Review',
        description: err?.message || 'Only verified purchasers can submit a review for this item.',
        variant: 'danger',
      });
    },
  });

  const handleOpenDrawer = () => {
    triggerHaptic('light');
    setIsDrawerOpen(true);
    checkEligibility();
  };

  // Arriving from the review email: bring the reviews into view and open the form.
  // Delayed so it runs after the page's own scroll-to-top on navigation.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (!reviewRequested || !productId || autoOpened.current) return;
    autoOpened.current = true;
    const timer = setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsDrawerOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [reviewRequested, productId]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please select a valid image (JPEG/PNG/WebP).', variant: 'danger' });
      return;
    }

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file, 1000, 0.82);
      setPreviewImage(compressedDataUrl);
      triggerHaptic('light');
    } catch {
      toast({ title: 'Compression Failed', description: 'Could not process photo. Please try a different image.', variant: 'danger' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast({ title: 'Required Fields', description: 'Please enter a review headline and body.', variant: 'danger' });
      return;
    }

    submitReviewMutation.mutate({
      productId,
      rating,
      title: title.trim(),
      body: body.trim(),
      customerName: customerName.trim() || undefined,
      fitFeedback,
      imageUrl: previewImage || undefined,
    });
  };

  // Close drawer on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <section ref={sectionRef} className="py-[65px] sm:py-[100px] border-t border-[#ddd3c5]" id="reviews">
      <div className="container-bingooo">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 mb-[45px]">
          <div>
            <div className="eyebrow text-[#171717]">VERIFIED FEEDBACK</div>
            <h2 className="m-0 mt-2 text-[clamp(36px,5vw,60px)] font-extrabold leading-[0.9] tracking-[-0.06em] uppercase text-[#171717]">
              REAL REVIEWS.
              <br />
              REAL BUYERS.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {total > 0 && (
              <div className="flex items-center gap-[15px] bg-[#FAF8F5] border border-[#DDD3C5] px-4 py-2.5 rounded-[4px]">
                <div className="text-[38px] font-extrabold leading-none text-[#171717]">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-[#171717]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= Math.round(averageRating) ? 'fill-[#171717] text-[#171717]' : 'text-[#DDD3C5]'}
                      />
                    ))}
                  </div>
                  <div className="text-[#6F6A63] text-[10px] font-mono mt-0.5">
                    {total} {total === 1 ? 'verified review' : 'verified reviews'}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenDrawer}
              className="inline-flex items-center justify-center gap-2 h-[48px] px-6 rounded-[4px] bg-[#171717] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-black active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Sparkles size={14} className="text-[#E6321C]" />
              <span>WRITE A REVIEW</span>
            </button>
          </div>
        </div>

        {/* Real Metrics Summary if reviews exist */}
        {total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-[#FAF8F5] border border-[#DDD3C5] rounded-[4px] mb-[45px]">
            {/* Real Rating Distribution */}
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#171717] mb-3">
                Rating Breakdown
              </div>
              <div className="space-y-1.5 max-w-[380px]">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={stars} className="grid grid-cols-[45px_1fr_40px] items-center gap-2 text-[10px] text-[#171717]">
                      <span className="inline-flex items-center gap-1 font-mono font-medium">
                        {stars} <Star size={10} className="fill-[#171717] text-[#171717]" />
                      </span>
                      <div className="h-[6px] bg-[#DDD3C5]/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#171717] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#6F6A63] text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fit Feedback Indicator */}
            <div className="border-t md:border-t-0 md:border-l border-[#DDD3C5] pt-4 md:pt-0 md:pl-8 flex flex-col justify-center">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#171717] mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#238636]" />
                <span>Verified Fit Telemetry</span>
              </div>
              <p className="text-[11px] text-[#6F6A63] leading-relaxed mb-4">
                Fit ratings submitted strictly by customers who have purchased and received this garment:
              </p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-white border border-[#DDD3C5] rounded-[2px]">
                  <div className="text-base font-extrabold text-[#171717] font-mono">
                    {fitBreakdown.runsSmallPct}%
                  </div>
                  <div className="text-[9px] uppercase font-bold text-[#6F6A63] mt-0.5">Runs Small</div>
                </div>

                <div className="p-3 bg-white border border-[#238636] rounded-[2px] shadow-2xs">
                  <div className="text-base font-extrabold text-[#238636] font-mono">
                    {fitBreakdown.trueToSizePct}%
                  </div>
                  <div className="text-[9px] uppercase font-extrabold text-[#238636] mt-0.5">True To Size</div>
                </div>

                <div className="p-3 bg-white border border-[#DDD3C5] rounded-[2px]">
                  <div className="text-base font-extrabold text-[#171717] font-mono">
                    {fitBreakdown.runsLargePct}%
                  </div>
                  <div className="text-[9px] uppercase font-bold text-[#6F6A63] mt-0.5">Runs Large</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Listing or Honest Zero State */}
        {isLoading ? (
          <div className="py-16 text-center text-[#6F6A63] flex flex-col items-center gap-2">
            <LoaderCircle size={22} className="animate-spin text-[#E6321C]" />
            <span className="text-xs uppercase tracking-wider font-mono">Verifying review records…</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 sm:p-14 border border-dashed border-[#DDD3C5] bg-[#FAF8F5] text-center max-w-xl mx-auto rounded-[4px] space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F7EEDB] border border-[#DDD3C5] grid place-items-center mx-auto text-[#171717]">
              <Sparkles size={20} className="text-[#E6321C]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#171717]">
                No Reviews Yet
              </h3>
              <p className="text-xs text-[#6F6A63] leading-relaxed mt-1.5 max-w-md mx-auto">
                We believe in genuine, unfiltered authenticity. Only customers who have ordered and received this piece can review it.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleOpenDrawer}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#171717] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-all cursor-pointer"
              >
                <span>BE THE FIRST VERIFIED REVIEWER</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((rev) => (
              <article
                key={rev.id}
                className="p-6 bg-[#FAF8F5] border border-[#DDD3C5] rounded-[4px] flex flex-col justify-between shadow-2xs hover:border-[#171717] transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[12px] font-extrabold text-[#171717] uppercase tracking-wide">
                        {rev.customerName}
                      </div>
                      <div className="text-[9px] text-[#6F6A63] font-mono mt-0.5">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {rev.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-[#238636] bg-[#238636]/10 px-2 py-0.5 rounded-[2px] border border-[#238636]/20">
                        <CheckCircle2 size={10} />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mb-2.5 text-[#171717]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= rev.rating ? 'fill-[#171717] text-[#171717]' : 'text-[#DDD3C5]'}
                      />
                    ))}
                    {rev.fitFeedback && (
                      <span className="ml-2 text-[9px] font-mono uppercase bg-[#F7EEDB] text-[#6F6A63] px-1.5 py-0.5 rounded-[2px]">
                        Fit:{' '}
                        <strong className="text-[#171717]">
                          {rev.fitFeedback === 'runs_small'
                            ? 'Runs Small'
                            : rev.fitFeedback === 'runs_large'
                            ? 'Runs Large'
                            : 'True to Size'}
                        </strong>
                      </span>
                    )}
                  </div>

                  <h4 className="m-0 mb-1.5 text-[13px] font-extrabold text-[#171717]">
                    {rev.title}
                  </h4>

                  <p className="m-0 text-[#6F6A63] text-[11px] leading-[1.7]">
                    {rev.body}
                  </p>
                </div>

                {/* Attached Customer Photo */}
                {rev.imageUrl && (
                  <div className="mt-4 pt-3 border-t border-[#DDD3C5]">
                    <button
                      type="button"
                      onClick={() => setLightboxImage(rev.imageUrl!)}
                      className="group relative block w-16 h-16 rounded-[2px] overflow-hidden border border-[#DDD3C5] bg-white cursor-pointer"
                      title="Click to view full photo"
                    >
                      <img loading="lazy" decoding="async"
                        src={rev.imageUrl}
                        alt="Customer photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-[10px] font-bold">
                        ZOOM
                      </div>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Slide-Out Review Submission Drawer ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#DDD3C5] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#DDD3C5] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  {productThumbnail && (
                    <img loading="lazy" decoding="async"
                      src={productThumbnail}
                      alt={productTitle}
                      className="w-10 h-10 object-cover rounded-[2px] border border-[#DDD3C5]"
                    />
                  )}
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#E6321C] block">
                      VERIFIED REVIEW
                    </span>
                    <h3 className="text-xs font-extrabold uppercase text-[#171717] line-clamp-1">
                      {productTitle}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#DDD3C5] grid place-items-center text-[#6F6A63] hover:text-[#171717] hover:border-[#171717] transition-colors cursor-pointer"
                  aria-label="Close review drawer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isCheckingEligibility ? (
                  <div className="py-12 text-center text-[#6F6A63] flex flex-col items-center gap-2">
                    <LoaderCircle size={20} className="animate-spin text-[#E6321C]" />
                    <span className="text-xs font-mono">Verifying purchase eligibility…</span>
                  </div>
                ) : eligibility && !eligibility.eligible ? (
                  <div className="p-5 rounded-[4px] bg-[#FFF8EB] border border-[#F3DBB1] space-y-3">
                    <div className="flex items-center gap-2 text-[#9A6700] font-bold text-xs uppercase tracking-wide">
                      <Lock size={15} />
                      <span>Verified Purchase Required</span>
                    </div>
                    <p className="text-xs text-[#6F6A63] leading-relaxed">
                      {eligibility.hasReviewedAlready
                        ? 'You have already submitted a review for this garment. Thank you for your feedback!'
                        : eligibility.reason === 'AUTHENTICATION_REQUIRED'
                        ? 'Please sign in with your customer account to submit a review for garments you have purchased.'
                        : 'Our platform strictly displays 100% authentic buyer reviews. Only customers who have placed an order for this piece can submit a review.'}
                    </p>
                    {eligibility.reason === 'AUTHENTICATION_REQUIRED' && (
                      <Link
                        to="/login"
                        state={{ from: { pathname: location.pathname, search: '?review=1' } }}
                        className="inline-block mt-2 px-4 py-2 bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px] no-underline"
                      >
                        Sign In To Review →
                      </Link>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] rounded-[2px] flex items-center gap-2 text-[#137333] text-xs font-semibold">
                      <ShieldCheck size={16} className="shrink-0" />
                      <span>Verified Purchase Confirmed. Share your honest impressions.</span>
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block mb-2">
                        Overall Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => {
                              triggerHaptic('light');
                              setRating(star);
                            }}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                            aria-label={`Rate ${star} star`}
                          >
                            <Star
                              size={24}
                              className={
                                (hoverRating || rating) >= star
                                  ? 'fill-[#171717] text-[#171717]'
                                  : 'text-[#DDD3C5]'
                              }
                            />
                          </button>
                        ))}
                        <span className="text-[11px] font-mono font-bold text-[#6F6A63] ml-2">
                          {rating === 5
                            ? '5/5 — Exceptional'
                            : rating === 4
                            ? '4/5 — Great Quality'
                            : rating === 3
                            ? '3/5 — Average'
                            : rating === 2
                            ? '2/5 — Below Expectation'
                            : '1/5 — Unsatisfactory'}
                        </span>
                      </div>
                    </div>

                    {/* Fit Feedback */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block mb-2">
                        How Did It Fit You?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'runs_small', label: 'Runs Small' },
                          { id: 'true_to_size', label: 'True To Size' },
                          { id: 'runs_large', label: 'Runs Large' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setFitFeedback(option.id as any);
                            }}
                            className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider border rounded-[2px] transition-all cursor-pointer ${
                              fitFeedback === option.id
                                ? 'bg-[#171717] text-white border-[#171717]'
                                : 'bg-white text-[#6F6A63] border-[#DDD3C5] hover:border-[#171717]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Name */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block mb-1.5">
                        Your Name / Display Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Vikramaditya R."
                        maxLength={50}
                        className="w-full h-11 px-3 bg-white border border-[#DDD3C5] text-xs text-[#171717] outline-none focus:border-[#171717] rounded-[2px]"
                      />
                    </div>

                    {/* Headline */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block mb-1.5">
                        Headline / Summary
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Incredible 240 GSM drop and finish"
                        maxLength={100}
                        className="w-full h-11 px-3 bg-white border border-[#DDD3C5] text-xs text-[#171717] outline-none focus:border-[#171717] rounded-[2px]"
                      />
                    </div>

                    {/* Review Body */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block mb-1.5">
                        Written Review
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share details on the fabric texture, collar ribbing, sizing, and post-wash drape…"
                        maxLength={1500}
                        className="w-full p-3 bg-white border border-[#DDD3C5] text-xs text-[#171717] outline-none focus:border-[#171717] rounded-[2px] leading-relaxed resize-none"
                      />
                    </div>

                    {/* Photo Upload with Client-Side Canvas Compression */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block mb-1.5">
                        Attach Product Photo (Optional)
                      </label>

                      {previewImage ? (
                        <div className="relative inline-block border border-[#DDD3C5] rounded-[2px] overflow-hidden">
                          <img
                            src={previewImage}
                            alt="Uploaded preview"
                            className="w-24 h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-black text-white rounded-full grid place-items-center cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="review-photo-upload"
                          />
                          <label
                            htmlFor="review-photo-upload"
                            className="flex items-center justify-center gap-2 p-4 border border-dashed border-[#DDD3C5] bg-white rounded-[2px] hover:border-[#171717] cursor-pointer transition-colors text-xs text-[#6F6A63]"
                          >
                            {isCompressing ? (
                              <>
                                <LoaderCircle size={16} className="animate-spin text-[#E6321C]" />
                                <span>Optimizing photo…</span>
                              </>
                            ) : (
                              <>
                                <Camera size={16} className="text-[#171717]" />
                                <span className="font-semibold text-[#171717]">Upload a photo</span>
                                <span>(JPEG, PNG, WebP)</span>
                              </>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitReviewMutation.isPending || isCompressing}
                        className="w-full h-12 rounded-[4px] bg-[#E6321C] hover:bg-[#B91F12] text-white text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                      >
                        {submitReviewMutation.isPending ? (
                          <>
                            <LoaderCircle size={16} className="animate-spin" />
                            <span>POSTING VERIFIED REVIEW…</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            <span>SUBMIT VERIFIED REVIEW</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Lightbox Modal ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm grid place-items-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img
              src={lightboxImage}
              alt="Enlarged review photo"
              className="max-w-full max-h-[85vh] object-contain rounded-[4px] border border-white/20 shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#E6321C] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
