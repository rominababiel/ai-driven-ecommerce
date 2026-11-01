import { normalizeText } from '@/shared/lib/text';
import type { Product } from './product';

export const SORT_OPTIONS = ['featured', 'price-asc', 'price-desc', 'rating'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface ProductFilters {
  query: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTERS: ProductFilters = {
  query: '',
  category: null,
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sort: 'featured',
};

type Comparator = (a: Product, b: Product) => number;

const comparators: Record<SortOption, Comparator | null> = {
  featured: null,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
};

function matchesQuery(product: Product, query: string): boolean {
  if (!query) return true;
  return normalizeText(`${product.name} ${product.description} ${product.category}`).includes(query);
}

export function filterProducts(products: readonly Product[], filters: ProductFilters): Product[] {
  const query = normalizeText(filters.query);
  const result = products.filter(
    (product) =>
      matchesQuery(product, query) &&
      (filters.category === null || product.category === filters.category) &&
      (filters.minPrice === null || product.price >= filters.minPrice) &&
      (filters.maxPrice === null || product.price <= filters.maxPrice) &&
      (!filters.inStockOnly || product.stock > 0),
  );
  const comparator = comparators[filters.sort];
  return comparator ? result.sort(comparator) : result;
}

export function getCategories(products: readonly Product[]): string[] {
  return [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b, 'es'));
}

export function countActiveFilters(filters: ProductFilters): number {
  return [
    filters.query.trim() !== '',
    filters.category !== null,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.inStockOnly,
  ].filter(Boolean).length;
}
