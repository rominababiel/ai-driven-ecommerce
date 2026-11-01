import { DEFAULT_FILTERS, type ProductFilters, type SortOption } from '../domain/filters';

export type FiltersAction =
  | { type: 'setQuery'; query: string }
  | { type: 'setCategory'; category: string | null }
  | { type: 'setPriceRange'; minPrice: number | null; maxPrice: number | null }
  | { type: 'setInStockOnly'; value: boolean }
  | { type: 'setSort'; sort: SortOption }
  | { type: 'reset' };

export function filtersReducer(state: ProductFilters, action: FiltersAction): ProductFilters {
  switch (action.type) {
    case 'setQuery':
      return { ...state, query: action.query };
    case 'setCategory':
      return { ...state, category: action.category };
    case 'setPriceRange':
      return { ...state, minPrice: action.minPrice, maxPrice: action.maxPrice };
    case 'setInStockOnly':
      return { ...state, inStockOnly: action.value };
    case 'setSort':
      return { ...state, sort: action.sort };
    case 'reset':
      return DEFAULT_FILTERS;
  }
}
