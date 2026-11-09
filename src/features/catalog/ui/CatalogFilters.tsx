import type { Dispatch } from 'react';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import type { ProductFilters } from '../domain/filters';
import type { FiltersAction } from '../state/filtersReducer';

const SWATCHES: Record<string, string> = {
  Negro: 'oklch(0.25 0.01 60)',
  Crudo: 'oklch(0.92 0.02 85)',
  Salvia: 'oklch(0.78 0.04 145)',
  Tostado: 'oklch(0.74 0.045 65)',
  Bordó: 'oklch(0.42 0.1 25)',
  Arena: 'oklch(0.86 0.02 80)',
  Grafito: 'oklch(0.3 0.01 60)',
  Hormigón: 'oklch(0.62 0.006 250)',
};

interface CatalogFiltersProps {
  filters: ProductFilters;
  dispatch: Dispatch<FiltersAction>;
  colors: string[];
  priceBounds: { min: number; max: number };
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange(value: boolean): void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-11 cursor-pointer items-center justify-between text-[15px] font-medium lg:text-sm">
      {label}
      <span className={cn('flex h-6 w-10 rounded-full p-[3px] transition-colors', checked ? 'justify-end bg-primary' : 'justify-start bg-border-strong')}>
        <span className="size-[18px] rounded-full bg-white" />
      </span>
    </button>
  );
}

export function CatalogFilters({ filters, dispatch, colors, priceBounds }: CatalogFiltersProps) {
  const max = filters.maxPrice ?? priceBounds.max;
  return (
    <div className="flex flex-col gap-7">
      {colors.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xs font-bold tracking-[0.06em] uppercase">Color</legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const selected = filters.colors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  aria-pressed={selected}
                  title={color}
                  onClick={() => dispatch({ type: 'toggleColor', color })}
                  className={cn('size-9 cursor-pointer rounded-full border border-black/10 lg:size-[30px]', selected && 'shadow-[0_0_0_2px_var(--background),0_0_0_3.5px_var(--foreground)]')}
                  style={{ background: SWATCHES[color] ?? 'var(--photo)' }}
                />
              );
            })}
          </div>
        </fieldset>
      )}
      {priceBounds.max > priceBounds.min && (
        <label className="flex flex-col gap-3">
          <span className="text-xs font-bold tracking-[0.06em] uppercase">Precio máximo</span>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={500}
            value={max}
            onChange={(event) => {
              const value = Number(event.target.value);
              dispatch({ type: 'setPriceRange', minPrice: null, maxPrice: value >= priceBounds.max ? null : value });
            }}
            className="accent-[var(--foreground)]"
          />
          <span className="flex justify-between font-mono text-xs font-medium">
            <span>{formatPrice(priceBounds.min)}</span>
            <span>{formatPrice(max)}</span>
          </span>
        </label>
      )}
      <Switch checked={filters.inStockOnly} label="Solo con stock" onChange={(value) => dispatch({ type: 'setInStockOnly', value })} />
      <Switch checked={filters.onSaleOnly} label="Solo en oferta" onChange={(value) => dispatch({ type: 'setOnSaleOnly', value })} />
    </div>
  );
}
