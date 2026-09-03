import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { ProductQueryParams } from '../../hooks/useProducts';

interface FilterSidebarProps {
  filters: ProductQueryParams;
  onChange: (newFilters: ProductQueryParams) => void;
  categories?: Array<{ name: string; slug?: string }>;
  availableSizes?: string[];
  availableColors?: Array<{ name: string; hex: string }>;
  priceRange?: { min: number; max: number };
}

const DEFAULT_CATEGORIES = [
  { name: 'All Products', slug: undefined },
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Hoodies', slug: 'hoodies' },
  { name: 'Jeans', slug: 'jeans' },
  { name: 'Shirts', slug: 'shirts' },
  { name: 'Shorts', slug: 'shorts' },
  { name: 'Accessories', slug: 'accessories' },
];

const DEFAULT_COLORS = [
  { name: 'Black', hex: '#171717' },
  { name: 'Cream', hex: '#F7EEDB' },
  { name: 'Khaki', hex: '#B29A78' },
  { name: 'Olive', hex: '#354837' },
  { name: 'Navy', hex: '#252E38' },
  { name: 'Light Blue', hex: '#597692' },
];

export function FilterSidebar({
  filters,
  onChange,
  categories = DEFAULT_CATEGORIES,
  availableSizes = ['S', 'M', 'L', 'XL', 'XXL'],
  availableColors = DEFAULT_COLORS,
  priceRange,
}: FilterSidebarProps) {
  const [sizeOpen, setSizeOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const selectedSizes = filters.sizes ? filters.sizes.split(',') : [];
  const selectedColors = filters.colors ? filters.colors.split(',') : [];

  const handleCategorySelect = (slug?: string) => {
    onChange({ ...filters, categorySlug: slug, page: 1 });
  };

  const handleSizeToggle = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onChange({ ...filters, sizes: next.length ? next.join(',') : undefined, page: 1 });
  };

  const handleColorToggle = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    onChange({ ...filters, colors: next.length ? next.join(',') : undefined, page: 1 });
  };

  return (
    <aside className="w-full space-y-6 text-left select-none">
      {/* ─── CATEGORIES ─── */}
      <div>
        <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E6321C] mb-3">
          CATEGORIES
        </h3>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const isActive = filters.categorySlug === cat.slug;
            return (
              <li key={cat.name}>
                <button
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-sans transition-colors ${
                    isActive
                      ? 'bg-[#F7EEDB] text-[#E6321C] font-bold'
                      : 'text-[#171717] hover:bg-[#F7EEDB]/60 hover:text-[#E6321C] font-medium'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ─── FILTER BY ─── */}
      <div className="pt-4 border-t border-[#DDD3C5]">
        <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#E6321C] mb-4">
          FILTER BY
        </h3>

        {/* Size Section */}
        <div className="border-b border-[#DDD3C5]/60 pb-4">
          <button
            type="button"
            onClick={() => setSizeOpen(!sizeOpen)}
            className="flex items-center justify-between w-full text-xs font-heading font-bold uppercase tracking-wider text-[#171717] mb-2.5"
          >
            <span>SIZE</span>
            {sizeOpen ? <Minus size={14} /> : <Plus size={14} />}
          </button>

          {sizeOpen && (
            <div className="space-y-2 pt-1">
              {availableSizes.map((size) => {
                const checked = selectedSizes.includes(size);
                return (
                  <label
                    key={size}
                    className="flex items-center gap-2.5 text-xs font-sans text-[#171717] cursor-pointer hover:text-[#E6321C]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleSizeToggle(size)}
                      className="h-4 w-4 rounded border-[#DDD3C5] text-[#E6321C] focus:ring-[#E6321C] accent-[#E6321C]"
                    />
                    <span>{size}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Color Section */}
        <div className="border-b border-[#DDD3C5]/60 py-4">
          <button
            type="button"
            onClick={() => setColorOpen(!colorOpen)}
            className="flex items-center justify-between w-full text-xs font-heading font-bold uppercase tracking-wider text-[#171717] mb-2.5"
          >
            <span>COLOR</span>
            {colorOpen ? <Minus size={14} /> : <Plus size={14} />}
          </button>

          {colorOpen && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {availableColors.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => handleColorToggle(color.name)}
                    className={`h-5 w-5 rounded-full border transition-all ${
                      isSelected
                        ? 'border-[#E6321C] scale-110 ring-2 ring-[#E6321C]'
                        : 'border-black/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={color.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setPriceOpen(!priceOpen)}
            className="flex items-center justify-between w-full text-xs font-heading font-bold uppercase tracking-wider text-[#171717] mb-2.5"
          >
            <span>PRICE</span>
            {priceOpen ? <Minus size={14} /> : <Plus size={14} />}
          </button>

          {priceOpen && (
            <div className="space-y-3 pt-1">
              <div className="flex justify-between text-xs font-sans font-bold text-[#171717]">
                <span>₹{priceRange?.min ?? 299}</span>
                <span>₹{filters.maxPrice || priceRange?.max || 1999}</span>
              </div>
              <input
                type="range"
                min={priceRange?.min ?? 299}
                max={priceRange?.max ?? 1999}
                step="50"
                value={filters.maxPrice || priceRange?.max || 1999}
                onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value), page: 1 })}
                className="w-full accent-[#E6321C] cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

