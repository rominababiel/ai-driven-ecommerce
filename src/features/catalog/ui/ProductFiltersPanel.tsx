import type { Dispatch } from 'react';
import { Button } from '@/shared/ui/Button';
import { SelectField, TextField } from '@/shared/ui/fields';
import { SORT_OPTIONS, countActiveFilters, type ProductFilters, type SortOption } from '../domain/filters';
import type { FiltersAction } from '../state/filtersReducer';

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Destacados',
  'price-asc': 'Precio: menor a mayor',
  'price-desc': 'Precio: mayor a menor',
  rating: 'Mejor valorados',
};

const parsePrice = (value: string) => (value === '' ? null : Math.max(0, Number(value)));

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  categories: readonly string[];
  dispatch: Dispatch<FiltersAction>;
}

export function ProductFiltersPanel({ filters, categories, dispatch }: ProductFiltersPanelProps) {
  const activeCount = countActiveFilters(filters);

  return (
    <aside className="flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-zinc-200" aria-label="Filtros">
      <TextField
        label="Buscar"
        type="search"
        placeholder="Nombre, categoría…"
        value={filters.query}
        onChange={(e) => dispatch({ type: 'setQuery', query: e.target.value })}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-700">Categoría</legend>
        {[null, ...categories].map((category) => (
          <label key={category ?? 'all'} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
              type="radio"
              name="category"
              className="accent-violet-600"
              checked={filters.category === category}
              onChange={() => dispatch({ type: 'setCategory', category })}
            />
            {category ?? 'Todas'}
          </label>
        ))}
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Precio mín."
          type="number"
          min={0}
          inputMode="decimal"
          value={filters.minPrice ?? ''}
          onChange={(e) => dispatch({ type: 'setPriceRange', minPrice: parsePrice(e.target.value), maxPrice: filters.maxPrice })}
        />
        <TextField
          label="Precio máx."
          type="number"
          min={0}
          inputMode="decimal"
          value={filters.maxPrice ?? ''}
          onChange={(e) => dispatch({ type: 'setPriceRange', minPrice: filters.minPrice, maxPrice: parsePrice(e.target.value) })}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          className="accent-violet-600"
          checked={filters.inStockOnly}
          onChange={(e) => dispatch({ type: 'setInStockOnly', value: e.target.checked })}
        />
        Solo con stock
      </label>

      <SelectField
        label="Ordenar por"
        value={filters.sort}
        options={SORT_OPTIONS.map((value) => ({ value, label: SORT_LABELS[value] }))}
        onChange={(e) => dispatch({ type: 'setSort', sort: e.target.value as SortOption })}
      />

      {activeCount > 0 && (
        <Button variant="ghost" onClick={() => dispatch({ type: 'reset' })}>
          Limpiar filtros ({activeCount})
        </Button>
      )}
    </aside>
  );
}
