import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  Shirt,
  ChevronRight,
} from 'lucide-react';

import { useUIStore } from '../../store/ui';
import { useProducts } from '../../hooks/useProducts';
import { resolveImageUrl } from '../../lib/utils';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

const RECENT_SEARCHES_KEY = 'bingooo_recent_searches';
const MAX_RECENT = 6;

const TRENDING_TAGS = [
  { label: '240 GSM Heavyweight', query: '240' },
  { label: 'Oversized Tees', query: 'oversized' },
  { label: 'Hoodies & Fleece', query: 'hoodie' },
  { label: 'Boxy Drop Shoulder', query: 'boxy' },
  { label: 'Vintage Acid Wash', query: 'wash' },
  { label: 'Custom Design Lab', query: 'custom' },
];

const CATEGORY_QUICK_LINKS = [
  { name: 'Oversized Tees', slug: 'oversized-tees', gsm: '240 GSM' },
  { name: 'Hoodies & Fleece', slug: 'hoodies', gsm: '380 GSM' },
  { name: 'Pants & Cargos', slug: 'cargos', gsm: 'Heavy Twill' },
  { name: 'Design Studio', slug: 'customize', isCustomizer: true },
];

export function SmartSearchModal() {
  const navigate = useNavigate();
  const searchModalOpen = useUIStore((s) => s.searchModalOpen);
  const closeSearchModal = useUIStore((s) => s.closeSearchModal);

  const [inputQuery, setInputQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, [searchModalOpen]);

  // Save query to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    try {
      const filtered = recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT);
      setRecentSearches(next);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // LocalStorage might fail in private mode
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const next = recentSearches.filter((s) => s !== term);
      setRecentSearches(next);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {}
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery.trim());
      setSelectedIndex(-1);
    }, 180);
    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Focus input when modal opens & reset
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(-1);
    } else {
      setInputQuery('');
      setDebouncedQuery('');
    }
  }, [searchModalOpen]);

  // Global keyboard shortcut: Cmd/Ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useUIStore.getState().toggleSearchModal();
      }
      if (e.key === 'Escape' && useUIStore.getState().searchModalOpen) {
        e.preventDefault();
        useUIStore.getState().closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch product search results
  const productsQuery = useProducts({
    search: debouncedQuery || undefined,
    limit: 8,
  });

  const isSearching = Boolean(debouncedQuery);
  const products = isSearching ? productsQuery.data?.data || [] : [];
  const isLoading = isSearching && productsQuery.isLoading;

  // Handle keyboard navigation inside results
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (products.length > 0) {
        setSelectedIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (products.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && products[selectedIndex]) {
        const selected = products[selectedIndex];
        saveRecentSearch(inputQuery || selected.title);
        closeSearchModal();
        navigate(`/product/${selected.slug}`);
      } else if (inputQuery.trim()) {
        saveRecentSearch(inputQuery);
        closeSearchModal();
        navigate(`/shop?q=${encodeURIComponent(inputQuery.trim())}`);
      }
    }
  };

  const handleSelectProduct = (product: any) => {
    saveRecentSearch(inputQuery || product.title);
    triggerHaptic('light');
    closeSearchModal();
    navigate(`/product/${product.slug}`);
  };

  const handleSearchTagClick = (tag: string) => {
    setInputQuery(tag);
    inputRef.current?.focus();
  };

  const handleViewAllInShop = () => {
    if (inputQuery.trim()) {
      saveRecentSearch(inputQuery);
    }
    triggerHaptic('light');
    closeSearchModal();
    navigate(
      inputQuery.trim()
        ? `/shop?q=${encodeURIComponent(inputQuery.trim())}`
        : '/shop'
    );
  };

  // Helper for matching substring highlight
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-[#E6321C] font-extrabold bg-[#E6321C]/10 px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-14 md:pt-20">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearchModal}
            className="fixed inset-0 bg-[#171717]/65 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Search Palette Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full max-w-2xl bg-[#F7EEDB] border border-[#DDD3C5] rounded-[3px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Smart Search"
          >
            {/* Top Search Input Row */}
            <div className="relative flex items-center px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#DDD3C5] bg-[#F7EEDB]">
              <Search
                size={20}
                className={`mr-3 shrink-0 transition-colors ${
                  isLoading ? 'text-[#E6321C] animate-pulse' : 'text-[#171717]'
                }`}
              />
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search heavyweight tees, 240 GSM, hoodies, fits..."
                className="search-palette-input no-focus-outline w-full bg-transparent text-sm sm:text-base font-bold text-[#171717] placeholder-[#8C867E] outline-none border-none shadow-none focus:outline-none focus:ring-0 font-sans"
              />

              {/* Clear button */}
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setInputQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-[2px] text-[#6F6A63] hover:text-[#171717] hover:bg-[#EDE0CC] transition-colors mr-1 sm:mr-2"
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}

              {/* Close / ESC key indicator */}
              <button
                type="button"
                onClick={closeSearchModal}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#EDE0CC] border border-[#DDD3C5] text-[10px] font-mono font-bold text-[#171717] hover:bg-[#171717] hover:text-white transition-colors"
                title="Press Escape to close"
              >
                <span>ESC</span>
              </button>

              <button
                type="button"
                onClick={closeSearchModal}
                className="sm:hidden p-1 text-[#171717] hover:text-[#E6321C]"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area: Results or Trending / Suggestions */}
            <div
              ref={resultsContainerRef}
              className="flex-1 overflow-y-auto divide-y divide-[#DDD3C5]/40 p-0 text-left custom-scrollbar"
            >
              {/* If user is typing and results are loading */}
              {isLoading && (
                <div className="p-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#E6321C] border-t-transparent mb-2" />
                  <p className="text-xs font-medium text-[#6F6A63]">
                    Searching Atelier archives for "{debouncedQuery}"...
                  </p>
                </div>
              )}

              {/* Live Matched Products */}
              {!isLoading && isSearching && products.length > 0 && (
                <div className="p-3 sm:p-4 space-y-1">
                  <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-heading font-bold uppercase tracking-wider text-[#6F6A63]">
                    <span>Garments ({products.length})</span>
                    <span className="text-[10px] text-[#6F6A63]/80 lowercase font-mono">
                      use ↑ ↓ to navigate
                    </span>
                  </div>

                  {products.map((product: any, idx: number) => {
                    const isSelected = selectedIndex === idx;
                    const mainImage =
                      product.images?.[0]?.url ||
                      product.images?.[0]?.object_key ||
                      (typeof product.images?.[0] === 'string' ? product.images[0] : null) ||
                      '/custom/tshirt-step-1.png';
                    const resolvedImage = resolveImageUrl(mainImage);
                    const basePrice = product.base_price ?? product.basePrice ?? 699;
                    const compareAt = product.compare_at_price ?? product.compareAtPrice;
                    const categoryName = product.category?.name || 'Streetwear';
                    const gsm = product.fabric_gsm || product.fabric || '240 GSM';

                    return (
                      <motion.div
                        key={product.id || product.slug}
                        whileHover={{ scale: 1.008 }}
                        onClick={() => handleSelectProduct(product)}
                        className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#F7EEDB] border border-[#DDD3C5] shadow-xs'
                            : 'hover:bg-white border border-transparent hover:border-[#DDD3C5]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          {/* Image Thumbnail */}
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-[#EDE0CC] p-1 shrink-0 overflow-hidden flex items-center justify-center border border-[#DDD3C5]/60">
                            <img
                              src={resolvedImage}
                              alt={product.title}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A63] truncate">
                                {categoryName}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#EDE0CC] text-[#171717] font-semibold">
                                {gsm}
                              </span>
                              {(product.customization_enabled ?? product.customizationEnabled) && (
                                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold text-[#E6321C]">
                                  <Sparkles size={10} />
                                  Studio
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-[#171717] group-hover:text-[#E6321C] transition-colors truncate">
                              {highlightMatch(product.title, debouncedQuery)}
                            </h4>

                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-xs font-bold text-[#171717]">
                                ₹{basePrice}
                              </span>
                              {compareAt && compareAt > basePrice && (
                                <span className="text-[10px] text-[#6F6A63] line-through">
                                  ₹{compareAt}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pl-2 shrink-0">
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#E6321C] opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ArrowRight size={12} />
                          </span>
                          <ChevronRight
                            size={16}
                            className="text-[#6F6A63] group-hover:text-[#E6321C] transition-colors sm:hidden"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* No Results Fallback */}
              {!isLoading && isSearching && products.length === 0 && (
                <div className="p-8 sm:p-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-[#EDE0CC] flex items-center justify-center mx-auto mb-3 text-[#E6321C]">
                    <Shirt size={24} />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[#171717]">
                    No garments found for "{debouncedQuery}"
                  </h3>
                  <p className="mt-1.5 text-xs text-[#6F6A63] max-w-sm mx-auto">
                    We couldn't find a direct match in our ready-to-wear archive, but you can build your own custom heavyweight piece in our Studio.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => {
                        closeSearchModal();
                        navigate('/customize');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#B91F12] transition-colors shadow-xs"
                    >
                      <Sparkles size={13} />
                      Open Design Studio
                    </button>
                    <button
                      onClick={() => {
                        closeSearchModal();
                        navigate('/shop');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:border-[#171717] transition-colors"
                    >
                      Browse All Garments
                    </button>
                  </div>
                </div>
              )}

              {/* Default State: Recent Searches & Trending Streetwear tags */}
              {!isSearching && (
                <div className="p-4 sm:p-6 space-y-6 bg-[#F7EEDB]">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#171717]">
                        <span className="flex items-center gap-1.5 before:content-[''] before:w-2.5 before:h-[2px] before:bg-[#E6321C]">
                          Recent Searches
                        </span>
                        <button
                          onClick={clearAllRecent}
                          className="text-[10px] text-[#6F6A63] hover:text-[#E6321C] underline uppercase font-mono transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            onClick={() => handleSearchTagClick(term)}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-white border border-[#DDD3C5] text-[10px] font-bold uppercase tracking-wider text-[#171717] hover:border-[#171717] hover:bg-[#171717] hover:text-white cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>{term}</span>
                            <button
                              onClick={(e) => removeRecentSearch(term, e)}
                              className="text-[#6F6A63] group-hover:text-white p-0.5"
                              aria-label={`Remove ${term}`}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Atelier Searches */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#171717] before:content-[''] before:w-2.5 before:h-[2px] before:bg-[#E6321C]">
                      Trending Cuts & Fabrics
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {TRENDING_TAGS.map((tag) => (
                        <button
                          key={tag.label}
                          type="button"
                          onClick={() => handleSearchTagClick(tag.query)}
                          className="px-3.5 py-1.5 rounded-[2px] bg-white border border-[#DDD3C5] text-[10px] font-extrabold uppercase tracking-wider text-[#171717] hover:bg-[#171717] hover:border-[#171717] hover:text-white transition-all shadow-2xs cursor-pointer"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Category Shortcuts */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#171717] before:content-[''] before:w-2.5 before:h-[2px] before:bg-[#E6321C]">
                      Browse by Category
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORY_QUICK_LINKS.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => {
                            closeSearchModal();
                            if (cat.isCustomizer) {
                              navigate('/customize');
                            } else {
                              navigate(`/category/${cat.slug}`);
                            }
                          }}
                          className="flex flex-col items-start p-3.5 rounded-[2px] bg-[#EDE0CC] border border-[#DDD3C5] hover:bg-[#171717] hover:border-[#171717] transition-all text-left shadow-2xs group cursor-pointer"
                        >
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#171717] group-hover:text-white transition-colors">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-[#6F6A63] group-hover:text-[#CCCCCC] transition-colors mt-0.5">
                            {cat.gsm || 'Explore catalog'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#EDE0CC] border-t border-[#DDD3C5] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleViewAllInShop}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#171717] hover:text-[#E6321C] transition-colors cursor-pointer"
              >
                <span>
                  {inputQuery.trim()
                    ? `View all results for "${inputQuery}" in Catalog →`
                    : 'Explore all garments in Shop →'}
                </span>
              </button>

              <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#6F6A63] font-mono">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-[2px] bg-white border border-[#DDD3C5] text-[9px] font-bold text-[#171717]">
                    ↵
                  </kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-[2px] bg-white border border-[#DDD3C5] text-[9px] font-bold text-[#171717]">
                    esc
                  </kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
