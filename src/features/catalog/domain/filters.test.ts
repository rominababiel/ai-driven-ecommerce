import { describe, expect, it } from 'vitest';
import { buildProduct } from '@/test/fixtures';
import { DEFAULT_FILTERS, filterProducts, getCategories } from './filters';

const products = [
  buildProduct({ id: '1', name: 'Auriculares Pulse', category: 'Audio', price: 120, rating: 4.7, stock: 4 }),
  buildProduct({ id: '2', name: 'Parlante Orbit', category: 'Audio', price: 50, rating: 4.1, stock: 0 }),
  buildProduct({ id: '3', name: 'Teclado Kite', category: 'Computación', price: 90, rating: 4.9, stock: 2 }),
];

const ids = (list: { id: string }[]) => list.map((product) => product.id);

describe('filterProducts', () => {
  it('returns every product with default filters', () => {
    expect(ids(filterProducts(products, DEFAULT_FILTERS))).toEqual(['1', '2', '3']);
  });

  it('matches queries ignoring accents and case', () => {
    expect(ids(filterProducts(products, { ...DEFAULT_FILTERS, query: 'COMPUTACION' }))).toEqual(['3']);
  });

  it('combines category, price range and stock filters', () => {
    const result = filterProducts(products, { ...DEFAULT_FILTERS, category: 'Audio', minPrice: 40, maxPrice: 150, inStockOnly: true });
    expect(ids(result)).toEqual(['1']);
  });

  it('sorts by price and rating', () => {
    expect(ids(filterProducts(products, { ...DEFAULT_FILTERS, sort: 'price-asc' }))).toEqual(['2', '3', '1']);
    expect(ids(filterProducts(products, { ...DEFAULT_FILTERS, sort: 'rating' }))).toEqual(['3', '1', '2']);
  });

  it('does not mutate the input', () => {
    filterProducts(products, { ...DEFAULT_FILTERS, sort: 'price-desc' });
    expect(ids(products)).toEqual(['1', '2', '3']);
  });
});

describe('getCategories', () => {
  it('returns unique sorted categories', () => {
    expect(getCategories(products)).toEqual(['Audio', 'Computación']);
  });
});
