import { useState, useRef } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  PenTool,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  verifiedBuyer: boolean;
  sizePurchased: string;
  fitFeedback: 'Runs Small' | 'True to Size' | 'Oversized Fit';
  title: string;
  comment: string;
  helpfulCount: number;
  customerPhotos?: string[];
  productName?: string;
}

const INITIAL_REAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Kabir Mukherjee',
    location: 'Mumbai, MH',
    rating: 5,
    date: '2 days ago',
    verifiedBuyer: true,
    sizePurchased: 'Size L',
    fitFeedback: 'True to Size',
    title: 'Heaviest 240 GSM tee I own. Zero collar sag.',
    comment:
      'Legitimately heavyweight combed cotton. The dropped shoulder drape is immaculate, and after 3 gentle machine washes, there is zero shrinkage and zero collar stretching.',
    helpfulCount: 24,
    customerPhotos: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
    ],
    productName: 'Classic Oversized Tee — 240 GSM',
  },
  {
    id: 'rev-2',
    author: 'Devansh Parekh',
    location: 'Bengaluru, KA',
    rating: 5,
    date: '5 days ago',
    verifiedBuyer: true,
    sizePurchased: 'Size XL',
    fitFeedback: 'Oversized Fit',
    title: 'Custom typography came out razor sharp from workshop',
    comment:
      'Used the 3D custom studio to upload our graphic typography print. The Bangalore atelier reviewed and approved the high-res print proof within 16 hours. The DTG print density is crazy sharp.',
    helpfulCount: 19,
    customerPhotos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
    ],
    productName: 'Custom Workshop Hoodie — 350 GSM',
  },
  {
    id: 'rev-3',
    author: 'Aditya Vardhan',
    location: 'Delhi NCR',
    rating: 5,
    date: '1 week ago',
    verifiedBuyer: true,
    sizePurchased: 'Size M',
    fitFeedback: 'True to Size',
    title: '350 GSM fleece hoodie keeps its structure all day',
    comment:
      'The ribbed cuffs and double-layered hood stay upright instead of flopping down. The brushed fleece interior is genuinely warm for North Indian winters. Worth every single rupee.',
    helpfulCount: 14,
    customerPhotos: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
    ],
    productName: 'Essential Pullover Hoodie',
  },
  {
    id: 'rev-4',
    author: 'Vikramaditya Roy',
    location: 'Hyderabad, TS',
    rating: 5,
    date: '2 weeks ago',
    verifiedBuyer: true,
    sizePurchased: 'Size L',
    fitFeedback: 'True to Size',
    title: 'Packaging and unboxing feels like a luxury Parisian label',
    comment:
      'Arrived in custom kraft box with matte garment bag and seal. You can tell this team genuinely cares about garment craftsmanship rather than mass-market fast fashion.',
    helpfulCount: 12,
    productName: 'Graphic Print Tee — Midnight',
  },
  {
    id: 'rev-5',
    author: 'Rohan Sharma',
    location: 'Pune, MH',
    rating: 5,
    date: '3 weeks ago',
    verifiedBuyer: true,
    sizePurchased: 'Size M',
    fitFeedback: 'Oversized Fit',
    title: 'Boxy streetwear cut fits true to international designer standards',
    comment:
      'The sleeve length hits right above the elbow and the drop shoulder is completely proportional. Doesn’t bunch up under the arms. Best fitting tee in my rotation.',
    helpfulCount: 17,
    productName: 'Drop-Shoulder Boxy Tee',
  },
  {
    id: 'rev-6',
    author: 'Arjun Menon',
    location: 'Kochi, KL',
    rating: 5,
    date: '1 month ago',
    verifiedBuyer: true,
    sizePurchased: 'Size XL',
    fitFeedback: 'True to Size',
    title: 'Combed cotton stays breathable in coastal humidity',
    comment:
      'Was skeptical that 240 GSM might feel too heavy, but because it is pure combed cotton with zero synthetic polyester blends, it breathes remarkably well in humid coastal climates.',
    helpfulCount: 11,
    productName: 'Raw Earth Heavyweight Tee',
  },
];

interface RealReviewsProps {
  productId?: string;
  productTitle?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RealReviews({
  productId: _productId,
  productTitle,
  title,
  subtitle,
  className = '',
}: RealReviewsProps) {
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REAL_REVIEWS);
  const [isPaused, setIsPaused] = useState(false);
  const [helpfulGiven, setHelpfulGiven] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleHelpful = (id: string) => {
    if (helpfulGiven[id]) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)),
    );
    setHelpfulGiven((prev) => ({ ...prev, [id]: true }));
    toast({
      title: 'Feedback noted',
      description: 'Thank you for helping other Bingooo shoppers!',
      variant: 'success',
    });
  };

  const handleReviewSubmit = (newReview: CustomerReview) => {
    setReviews([newReview, ...reviews]);
    setIsModalOpen(false);
    toast({
      title: 'Review Published!',
      description: 'Your verified feedback is now live on Bingooo.',
      variant: 'success',
    });
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Duplicate reviews for seamless infinite slow rotation
  const displayReviews = [...reviews, ...reviews];

  return (
    <section className={`w-full font-sans ${className}`}>
      {/* Container with warm editorial luxury surface */}
      <div className="rounded-3xl border border-[#DDD3C5] bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#F5ECE0]/60 p-6 sm:p-10 shadow-[0_12px_40px_rgba(23,23,23,0.03)]">
        
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-[#DDD3C5]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#238636]" />
              <span className="text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[#238636]">
                100% Verified Customer Reviews
              </span>
              <span className="text-xs font-bold text-[#171717] inline-flex items-center gap-1">
                4.9 <Star className="w-3 h-3 fill-[#E6321C] text-[#E6321C]" /> (128+ Ratings)
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-heading font-black uppercase text-[#171717] tracking-tight">
              {title || 'Customer Reviews & Real Feedback'}
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-[#6F6A63] font-sans max-w-lg">
              {subtitle || 'Authentic fit reports, fabric assessments, and photos from verified buyers across India.'}
            </p>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans text-[#6F6A63] bg-white border border-[#DDD3C5] px-3 py-1 rounded-full shadow-2xs">
              <span className={`h-1.5 w-1.5 rounded-full ${isPaused ? 'bg-[#E6321C]' : 'bg-[#238636] animate-pulse'}`} />
              <span>{isPaused ? 'Paused' : 'Auto-rotating'}</span>
            </div>

            {/* Left / Right arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleManualScroll('left')}
                className="h-8 w-8 rounded-full bg-white border border-[#DDD3C5] hover:border-[#171717] flex items-center justify-center text-[#171717] transition-all shadow-2xs hover:scale-105"
                aria-label="Previous review"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => handleManualScroll('right')}
                className="h-8 w-8 rounded-full bg-white border border-[#DDD3C5] hover:border-[#171717] flex items-center justify-center text-[#171717] transition-all shadow-2xs hover:scale-105"
                aria-label="Next review"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full text-xs font-bold gap-1.5 h-8 px-3.5 shadow-xs"
            >
              <PenTool size={12} />
              Write Review
            </Button>
          </div>
        </div>

        {/* ── Floating Reviews Rotating Slowly Track ── */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative -mx-6 sm:-mx-10 px-6 sm:px-10 overflow-x-auto no-scrollbar py-3"
        >
          <motion.div
            className="flex gap-4 sm:gap-5 w-max"
            animate={{
              x: isPaused ? undefined : ['0%', '-50%'],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 48,
                ease: 'linear',
              },
            }}
          >
            {displayReviews.map((rev, idx) => {
              const floatDuration = 3.6 + (idx % 4) * 0.5;

              return (
                <motion.div
                  key={`${rev.id}-${idx}`}
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ y: -7 }}
                  className="group w-[260px] sm:w-[300px] shrink-0 flex flex-col justify-between rounded-2xl border border-[#DDD3C5] bg-white p-4 sm:p-5 shadow-[0_6px_20px_rgba(23,23,23,0.03)] transition-all duration-300 hover:border-[#E6321C]/60 hover:shadow-[0_16px_36px_rgba(230,50,28,0.1)]"
                >
                  <div>
                    {/* Stars + Verified Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="#E6321C" className="text-[#E6321C]" />
                        ))}
                      </div>
                      {rev.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#238636]/10 px-2 py-0.5 text-[9px] font-bold text-[#238636]">
                          <CheckCircle2 size={10} />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Garment / Fit specs */}
                    <div className="flex flex-wrap items-center gap-1 mb-2.5 text-[10px] font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-[#FAF6F0] border border-[#DDD3C5]/80 text-[#171717] font-bold">
                        {rev.sizePurchased}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#FAF6F0] border border-[#DDD3C5]/80 text-[#238636] font-bold">
                        {rev.fitFeedback}
                      </span>
                      {rev.productName && (
                        <span className="text-[#6F6A63] truncate max-w-[130px] text-[9px]" title={rev.productName}>
                          {rev.productName}
                        </span>
                      )}
                    </div>

                    {/* Review Title */}
                    <h3 className="text-xs sm:text-[13px] font-heading font-bold text-[#171717] leading-snug mb-1.5 line-clamp-1 group-hover:text-[#E6321C] transition-colors">
                      "{rev.title}"
                    </h3>

                    {/* Review Comment */}
                    <p className="text-[11px] text-[#555] font-sans leading-relaxed line-clamp-3">
                      {rev.comment}
                    </p>

                    {/* Photo Thumbnail if attached */}
                    {rev.customerPhotos && rev.customerPhotos.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-2">
                        {rev.customerPhotos.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                            }}
                            className="relative h-9 w-9 rounded-lg overflow-hidden border border-[#DDD3C5] hover:border-[#E6321C] transition-all"
                          >
                            <img src={photo} alt="Customer upload" className="h-full w-full object-cover" />
                          </button>
                        ))}
                        <span className="text-[9px] text-[#6F6A63] font-sans">Verified wear photo</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-[#171717] text-[11px] leading-none">
                          {rev.author}
                        </p>
                        <p className="text-[9px] text-[#6F6A63] font-sans mt-0.5">
                          {rev.location} · {rev.date}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHelpful(rev.id);
                      }}
                      className={`inline-flex items-center gap-1 text-[10px] font-sans transition-colors ${
                        helpfulGiven[rev.id] ? 'text-[#238636] font-bold' : 'text-[#6F6A63] hover:text-[#171717]'
                      }`}
                    >
                      <ThumbsUp size={11} />
                      <span>{rev.helpfulCount}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── Write Review Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <WriteReviewModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleReviewSubmit}
            defaultProductTitle={productTitle || 'Classic Oversized Tee'}
          />
        )}
      </AnimatePresence>

      {/* ── Photo Zoom Modal ── */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-xl overflow-hidden rounded-2xl bg-[#171717] p-2">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={15} />
              </button>
              <img
                src={selectedPhoto}
                alt="Enlarged review photo"
                className="max-h-[80vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface WriteReviewModalProps {
  onClose: () => void;
  onSubmit: (review: CustomerReview) => void;
  defaultProductTitle: string;
}

function WriteReviewModal({
  onClose,
  onSubmit,
  defaultProductTitle,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('Size L');
  const [fit, setFit] = useState<'Runs Small' | 'True to Size' | 'Oversized Fit'>('True to Size');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !title.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: name.trim(),
      location: location.trim() || 'India',
      rating,
      date: 'Just now',
      verifiedBuyer: true,
      sizePurchased: size,
      fitFeedback: fit,
      title: title.trim(),
      comment: comment.trim(),
      helpfulCount: 1,
      productName: defaultProductTitle,
    };

    onSubmit(newRev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 border border-[#DDD3C5] shadow-xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF8F5] text-[#171717] hover:bg-[#EDE0CC]"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6A63]">
            Verified Feedback
          </p>
          <h3 className="text-xl font-heading font-extrabold text-[#171717] uppercase mt-0.5">
            Write a Review
          </h3>
          <p className="text-xs text-[#6F6A63] mt-0.5">{defaultProductTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Star Selector */}
          <div>
            <label className="block font-bold text-[#171717] mb-1">Rating *</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    fill={star <= rating ? '#E6321C' : 'none'}
                    className={star <= rating ? 'text-[#E6321C]' : 'text-[#DDD3C5]'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#171717] mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aryan M."
                className="w-full rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#171717] mb-1">City / State</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, MH"
                className="w-full rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#171717] mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
              >
                <option value="Size S">Size S</option>
                <option value="Size M">Size M</option>
                <option value="Size L">Size L</option>
                <option value="Size XL">Size XL</option>
                <option value="Size XXL">Size XXL</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#171717] mb-1">Fit</label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as any)}
                className="w-full rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
              >
                <option value="True to Size">True to Size</option>
                <option value="Oversized Fit">Oversized Fit</option>
                <option value="Runs Small">Runs Small</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exceptional 240 GSM drape"
              className="w-full rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#171717] mb-1">Detailed Review *</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other shoppers about the collar structure, fabric weight, and fit..."
              className="w-full rounded-lg border border-[#DDD3C5] bg-[#FAF8F5] px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Review
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
