import { useState } from 'react';
import {
  Instagram,
  Play,
  Heart,
  MessageCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { BINGOOO_INSTAGRAM_URL } from '../ui/SocialIcons';

interface InstagramPost {
  id: string;
  type: 'reel' | 'post';
  image: string;
  views?: string;
  likes: string;
  comments: string;
  caption: string;
  tag: string;
}

const INSTAGRAM_ITEMS: InstagramPost[] = [
  {
    id: 'reel-1',
    type: 'reel',
    image: '/hero-banner.png',
    views: '142K',
    likes: '12.8K',
    comments: '342',
    caption: 'Behind the seams: Custom 240 GSM heavy combed cotton boxy cut drape test',
    tag: '#StreetwearIndia',
  },
  {
    id: 'reel-2',
    type: 'reel',
    image: '/hero-banner-2.jpg',
    views: '98.5K',
    likes: '9.4K',
    comments: '218',
    caption: 'Tokyo Cyber Vector Drop: Precision 1200 DPI DTF heatpress process in atelier',
    tag: '#CustomApparel',
  },
  {
    id: 'reel-3',
    type: 'reel',
    image: '/hero-banner-3.jpg',
    views: '215K',
    likes: '19.6K',
    comments: '584',
    caption: 'How to style oversized tees: 3 minimalist street fits with relaxed silhouettes',
    tag: '#OOTDMen',
  },
  {
    id: 'post-4',
    type: 'post',
    image: '/hero-banner-4.jpg',
    likes: '8.2K',
    comments: '195',
    caption: 'Atelier Drop 04: Pure natural linen and heavyweight fleece lookbook',
    tag: '#BingoooAtelier',
  },
  {
    id: 'reel-5',
    type: 'reel',
    image: '/hero-banner-5.jpg',
    views: '178K',
    likes: '15.1K',
    comments: '412',
    caption: 'Wash & durability test: 30 washes, zero cracking, zero color fade guarantee',
    tag: '#HeavyweightCotton',
  },
  {
    id: 'post-6',
    type: 'post',
    image: '/custom/tshirt-step-3-black.png',
    likes: '6.7K',
    comments: '164',
    caption: 'Worn by the community: Bespoke graphic print designed via 3D Customizer',
    tag: '#CustomStreetwear',
  },
];

export function InstagramCommunity() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const instagramUrl = BINGOOO_INSTAGRAM_URL;

  return (
    <section className="mx-auto max-w-[1360px] px-4 sm:px-8 py-10 sm:py-14">
      <div className="bg-[#FAF7F2] border border-[#DDD3C5]/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DDD3C5]/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6321C]/10 border border-[#E6321C]/20 text-[#E6321C] text-[11px] font-extrabold uppercase tracking-widest mb-3">
              <Instagram className="w-3.5 h-3.5" />
              <span>COMMUNITY ATELIER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6321C] animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#171717]">
              Join Our Instagram Community
            </h2>

            <p className="text-sm sm:text-base text-[#6F6A63] mt-2 max-w-xl font-medium leading-relaxed">
              Explore styling reels, fabric drops & behind-the-scenes bespoke printing. Follow{' '}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E6321C] font-extrabold hover:underline inline-flex items-center gap-1"
              >
                @bingooo.co
                <CheckCircle2 className="w-3.5 h-3.5 inline text-[#E6321C]" />
              </a>{' '}
              for daily streetwear inspiration.
            </p>
          </div>

          {/* Follow CTA Button */}
          <div className="shrink-0">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#E6321C] hover:bg-[#B91F12] text-white font-semibold text-xs tracking-wide uppercase shadow-xs active:scale-[0.98] transition-all duration-200 group"
              aria-label="Follow Bingooo on Instagram"
            >
              <Instagram className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              <span>Follow @bingooo.co</span>
              <ExternalLink className="w-3 h-3 opacity-80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* ── Reels & Posts Grid (At least 5 items, showing 6 editorial cards) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-8 sm:mt-10">
          {INSTAGRAM_ITEMS.map((item) => (
            <a
              key={item.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative aspect-[9/13] sm:aspect-[4/5] lg:aspect-[9/14] rounded-xl sm:rounded-2xl overflow-hidden bg-[#EAE2D5] border border-[#DDD3C5] shadow-2xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
              aria-label={`View Instagram ${item.type} on @bingooo.co`}
            >
              {/* Media Image */}
              <img
                src={item.image}
                alt={item.caption}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                loading="lazy"
              />

              {/* Subtle Base Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Top Badge (Reel / Post) */}
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex items-center gap-1.5">
                {item.type === 'reel' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>Reel</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-2.5 h-2.5 text-[#E6321C]" />
                    <span>Post</span>
                  </span>
                )}

                {item.views && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-bold">
                    {item.views}
                  </span>
                )}
              </div>

              {/* Instagram Handle Watermark in corner */}
              <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
                <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bottom Info Preview (Always visible subtle details) */}
              <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 z-10">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#E6321C] mb-1">
                  {item.tag}
                </span>
                <p className="text-[11px] sm:text-xs text-white/90 font-semibold line-clamp-2 leading-snug drop-shadow-xs">
                  {item.caption}
                </p>

                {/* Social Counters */}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-white/80 font-bold">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3 h-3 text-[#E6321C] fill-[#E6321C]" />
                    {item.likes}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-white" />
                    {item.comments}
                  </span>
                </div>
              </div>

              {/* Hover Full Overlay Action */}
              <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ${
                  hoveredId === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#E6321C] text-white flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 mb-2.5">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-white text-xs font-black uppercase tracking-wider">
                  Watch on Instagram
                </span>
                <span className="text-[#F7EEDB]/80 text-[10px] font-bold mt-0.5">
                  @bingooo.co
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* ── Bottom Tag Banner ── */}
        <div className="mt-8 pt-6 border-t border-[#DDD3C5]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#171717]">
            <span className="w-2 h-2 rounded-full bg-[#E6321C]" />
            <span>
              Tag <strong className="text-[#E6321C]">@bingooo.co</strong> or use{' '}
              <strong className="text-[#E6321C]">#WearBingooo</strong> on Instagram to get featured!
            </span>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-extrabold text-[#171717] hover:text-[#E6321C] transition-colors inline-flex items-center gap-1.5"
          >
            <span>View all reels & drops</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
