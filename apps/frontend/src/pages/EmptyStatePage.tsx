import { useState } from 'react';
import { SEO } from '../components/common/SEO';
import { EmptyState, type EmptyStateProps } from '../components/common/EmptyState';

type StateType = 'default' | 'cart' | 'wishlist' | 'orders' | 'search';

const STATES: Record<StateType, Partial<EmptyStateProps> & { tabLabel: string }> = {
  default: {
    tabLabel: 'General Atelier',
    icon: 'shirt',
    title: 'ATELIER RACK IS EMPTY',
    subtitle: 'NO GARMENTS AVAILABLE',
    description: 'Our craftsmen in Srikakulam are currently cutting fresh 240 GSM drops. Check out our signature oversized collections or request a custom piece.',
    actionText: 'EXPLORE THE CATALOG',
    actionTo: '/shop',
    secondaryActionText: 'CUSTOM DESIGN LAB',
    secondaryActionTo: '/customize',
  },
  cart: {
    tabLabel: 'Shopping Bag',
    icon: 'bag',
    title: 'YOUR SHOPPING BAG IS EMPTY',
    subtitle: 'NO ITEMS IN CART',
    description: 'Looks like you haven\'t added any heavyweight pieces yet. Discover our curated streetwear essentials made with luxury 240 GSM combed cotton.',
    actionText: 'START SHOPPING',
    actionTo: '/shop',
    secondaryActionText: 'VIEW LOOKBOOK',
    secondaryActionTo: '/about',
  },
  wishlist: {
    tabLabel: 'Wishlist',
    icon: 'heart',
    title: 'YOUR WISHLIST IS WAITING',
    subtitle: 'ZERO SAVED GARMENTS',
    description: 'Save your favorite oversized tees, boxy hoodies, and custom artworks here to keep track of seasonal drops and exclusive restocks.',
    actionText: 'BROWSE NEW DROPS',
    actionTo: '/shop?sort=newest',
    secondaryActionText: 'CUSTOMIZE A TEE',
    secondaryActionTo: '/customize',
  },
  orders: {
    tabLabel: 'Orders',
    icon: 'package',
    title: 'NO ORDERS PLACED YET',
    subtitle: 'ORDER HISTORY EMPTY',
    description: 'When you order bespoke menswear or oversized tees from Bingooo, you will be able to track every stage of stitching and dispatch right here.',
    actionText: 'DISCOVER BESTSELLERS',
    actionTo: '/shop',
    secondaryActionText: 'CONTACT ATELIER',
    secondaryActionTo: '/contact',
  },
  search: {
    tabLabel: 'Search',
    icon: 'search',
    title: 'NO MATCHING RESULTS FOUND',
    subtitle: 'TRY REFINING QUERY',
    description: 'We couldn\'t find any garments matching your exact search keywords. Try searching for "oversized", "hoodie", "acid wash", or explore our all garments.',
    actionText: 'VIEW ALL CLOTHING',
    actionTo: '/shop',
    secondaryActionText: 'EXPLORE CATEGORIES',
    secondaryActionTo: '/shop',
  },
};

export function EmptyStatePage() {
  const [activeType, setActiveType] = useState<StateType>('default');
  const activeConfig = STATES[activeType];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#171717] py-8 sm:py-12">
      <SEO
        title="Empty State — Bingooo Men's Wear"
        description="Our craftsmen in Srikakulam are preparing new 240 GSM drops. Explore our signature collection or design your own bespoke streetwear."
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Interactive Mode Switcher */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {(Object.keys(STATES) as StateType[]).map((key) => {
            const isSelected = activeType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveType(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all whitespace-nowrap min-h-[36px] ${
                  isSelected
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'bg-white border border-[#DDD3C5] text-[#6F6A63] hover:text-[#171717] hover:border-[#171717]/40'
                }`}
              >
                {STATES[key].tabLabel}
              </button>
            );
          })}
        </div>

        {/* Dynamic Empty State Card */}
        <div className="bg-white rounded-2xl border border-[#DDD3C5] p-6 sm:p-12 shadow-xs">
          <EmptyState
            icon={activeConfig.icon}
            title={activeConfig.title}
            subtitle={activeConfig.subtitle}
            description={activeConfig.description}
            actionText={activeConfig.actionText}
            actionTo={activeConfig.actionTo}
            secondaryActionText={activeConfig.secondaryActionText}
            secondaryActionTo={activeConfig.secondaryActionTo}
            showSuggestions={true}
          />
        </div>
      </div>
    </div>
  );
}
export default EmptyStatePage;
