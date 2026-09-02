import { Sparkles, RotateCcw } from 'lucide-react';
import type { ProductQueryParams } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useProducts';

interface FilterSidebarProps {
  filters: ProductQueryParams;
  onChange: (newFilters: ProductQueryParams) => void;
  availableSizes?: string[];
  availableColors?: string[];
}

export function FilterSidebar({
  filters,
  onChange,
  availableSizes = ['S', 'M', 'L', 'XL', 'XXL'],
  availableColors = ['Black', 'White', 'Sandstone', 'Charcoal', 'Oatmeal'],
}: FilterSidebarProps) {
  const { data: categories = [] } = useCategories();

  const handleCategorySelect = (slug?: string) => {
    onChange({ ...filters, categorySlug: slug, page: 1 });
  };

  const handleSizeToggle = (size: string) => {
    const current = filters.sizes ? filters.sizes.split(',') : [];
    const next = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    onChange({ ...filters, sizes: next.length ? next.join(',') : undefined, page: 1 });
  };

  const handleColorToggle = (color: string) => {
    const current = filters.colors ? filters.colors.split(',') : [];
    const next = current.includes(color) ? current.filter((c) => c !== color) : [...current, color];
    onChange({ ...filters, colors: next.length ? next.join(',') : undefined, page: 1 });
  };

  const handleReset = () => {
    onChange({ sort: 'newest', page: 1 });
  };

  const selectedSizes = filters.sizes ? filters.sizes.split(',') : [];
  const selectedColors = filters.colors ? filters.colors.split(',') : [];

  return (
    <aside className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-body font-bold text-ink uppercase tracking-wider">Filters</h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors"
        >
          <RotateCcw size={13} />
          Reset All
        </button>
      </div>

      {/* Customizable Switch */}
      <div className="rounded-lg bg-accent-light/50 border border-accent/20 p-3.5">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="flex items-center gap-2 text-caption font-semibold text-ink">
            <Sparkles size={16} className="text-accent" />
            Customizable Only
          </span>
          <input
            type="checkbox"
            checked={!!filters.customizable}
            onChange={(e) => onChange({ ...filters, customizable: e.target.checked || undefined, page: 1 })}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
        </label>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-caption font-bold text-ink uppercase tracking-wider">Categories</h4>
        <div className="space-y-1">
          <button
            onClick={() => handleCategorySelect(undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded text-caption font-medium transition-colors ${
              !filters.categorySlug ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded text-caption font-medium transition-colors ${
                filters.categorySlug === cat.slug ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] opacity-70">({cat.productCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2.5">
        <h4 className="text-caption font-bold text-ink uppercase tracking-wider">Size</h4>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`flex h-9 min-w-[36px] px-2.5 items-center justify-center rounded border text-caption font-semibold transition-all ${
                  isSelected
                    ? 'border-ink bg-ink text-white shadow-sm'
                    : 'border-border bg-white text-ink hover:border-ink/50'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2.5">
        <h4 className="text-caption font-bold text-ink uppercase tracking-wider">Color</h4>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const isSelected = selectedColors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => handleColorToggle(color)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-ink bg-ink text-white'
                    : 'border-border bg-white text-muted hover:border-ink/40 hover:text-ink'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5">
        <h4 className="text-caption font-bold text-ink uppercase tracking-wider">Max Price</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="500"
            max="4000"
            step="100"
            value={filters.maxPrice || 4000}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value), page: 1 })}
            className="w-full accent-ink"
          />
          <div className="flex justify-between text-caption text-muted">
            <span>₹500</span>
            <span className="font-bold text-ink">₹{filters.maxPrice || 4000}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
