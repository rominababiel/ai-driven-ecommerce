import { describe, expect, it } from 'vitest';
import { buildProduct } from '@/test/fixtures';
import { composeReply, findMatchingProducts, parseShoppingIntent } from './shoppingIntent';

const categories = ['Audio', 'Computación', 'Deporte'];

const catalog = [
  buildProduct({ id: '1', name: 'Auriculares Pulse', category: 'Audio', price: 129, rating: 4.7 }),
  buildProduct({ id: '2', name: 'Parlante Orbit', category: 'Audio', price: 49, rating: 4.3 }),
  buildProduct({ id: '3', name: 'Zapatillas Stride', description: 'Zapatillas de running', category: 'Deporte', price: 119, rating: 4.6 }),
  buildProduct({ id: '4', name: 'Monitor Lumen', category: 'Computación', price: 289, rating: 4.6, stock: 0 }),
];

describe('parseShoppingIntent', () => {
  it('extracts category and price ceiling', () => {
    const intent = parseShoppingIntent('Busco algo de audio por menos de 100 dólares', categories);
    expect(intent).toMatchObject({ category: 'Audio', maxPrice: 100, minPrice: null });
  });

  it('detects categories in plural or without accents', () => {
    expect(parseShoppingIntent('busco una remera', ['Remeras']).category).toBe('Remeras');
    expect(parseShoppingIntent('lo mejor en computacion', categories).category).toBe('Computación');
    expect(parseShoppingIntent('cosas de deportes', categories).category).toBe('Deporte');
  });

  it('keeps meaningful keywords', () => {
    expect(parseShoppingIntent('quiero zapatillas para running', categories).keywords).toEqual(['zapatillas', 'running']);
  });
});

describe('findMatchingProducts', () => {
  it('filters by intent and excludes products without stock', () => {
    const matches = findMatchingProducts(catalog, parseShoppingIntent('computación', categories));
    expect(matches).toEqual([]);
  });

  it('sorts by price when the user asks for cheap options', () => {
    const matches = findMatchingProducts(catalog, parseShoppingIntent('audio barato', categories));
    expect(matches.map((product) => product.id)).toEqual(['2', '1']);
  });
});

describe('composeReply', () => {
  it('lists matching products', () => {
    expect(composeReply('zapatillas para correr', catalog, categories)).toContain('Zapatillas Stride');
  });

  it('greets when there is no search intent', () => {
    expect(composeReply('hola', catalog, categories)).toContain('Puedo ayudarte');
  });
});
