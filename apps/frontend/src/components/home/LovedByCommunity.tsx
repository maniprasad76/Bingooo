import { Link } from 'react-router-dom';
import { Star, User, Shirt } from 'lucide-react';

export interface CommunityReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatarUrl?: string;
  productImageUrl?: string;
  productTitle?: string;
}

const DEFAULT_REVIEWS: CommunityReview[] = [
  {
    id: 'rev-1',
    name: 'Rohit Sharma',
    rating: 5,
    comment: 'The quality is top-notch and the print came out exactly how I imagined!',
    avatarUrl: '',
    productImageUrl: '/custom/tshirt-step-3-black.png',
    productTitle: 'Custom Graphic Tee',
  },
  {
    id: 'rev-2',
    name: 'Arjun Patel',
    rating: 5,
    comment: 'Finally a brand that lets me wear my creativity. Love Bingooo!',
    avatarUrl: '',
    productImageUrl: '/custom/tshirt-step-2.png',
    productTitle: 'Create Your Own Hoodie',
  },
  {
    id: 'rev-3',
    name: 'Karthik Reddy',
    rating: 5,
    comment: 'Fast delivery, great fabric and awesome fit.',
    avatarUrl: '',
    productImageUrl: '/hero-banner-5.jpg',
    productTitle: 'Crimson Minimal Tee',
  },
];

export function LovedByCommunity() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-10 sm:py-14">
      {/* ── Header: Title & View All Reviews Link ── */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-[0.08em] text-[#171717]">
          Loved By Our Community
        </h2>
        <Link
          to="/shop"
          className="text-xs sm:text-sm font-bold text-[#E6321C] hover:text-[#B91F12] tracking-wide transition-colors"
        >
          View All Reviews
        </Link>
      </div>

      {/* ── 3 Review Cards in Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {DEFAULT_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl bg-[#F7F2EB] border border-[#DDD3C5]/50 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-card transition-all duration-300 group"
          >
            {/* Left Content: Avatar, Name, Rating, Quote */}
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[#171717] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#DDD3C5]/80">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-[#F7EEDB]" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#171717]">
                    {review.name}
                  </h3>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-[#E6321C] text-[#E6321C]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <p className="text-xs sm:text-[13px] text-[#171717]/80 leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>

            {/* Right Content: Product Thumbnail Preview */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-[#EDE0CC]/50 border border-[#DDD3C5]/40 flex items-center justify-center p-1.5 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300">
              {review.productImageUrl ? (
                <img
                  src={review.productImageUrl}
                  alt={review.productTitle || 'Product'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Shirt size={28} className="text-[#171717]/30" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
