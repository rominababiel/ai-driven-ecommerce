import { describe, expect, it } from 'vitest';
import { buildProduct } from '@/test/fixtures';
import { cartReducer } from './cart';
import { calculateTotals, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from './pricing';

describe('cartReducer', () => {
  const product = buildProduct({ id: 'a', price: 20, stock: 3 });

  it('adds a new product', () => {
    const items = cartReducer([], { type: 'add', product, quantity: 2 });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ productId: 'a', quantity: 2 });
  });

  it('accumulates quantity without exceeding stock', () => {
    const once = cartReducer([], { type: 'add', product, quantity: 2 });
    const twice = cartReducer(once, { type: 'add', product, quantity: 5 });
    expect(twice[0].quantity).toBe(3);
  });

  it('ignores products without stock', () => {
    const items = cartReducer([], { type: 'add', product: buildProduct({ stock: 0 }), quantity: 1 });
    expect(items).toEqual([]);
  });

  it('removes the item when quantity is set to zero', () => {
    const items = cartReducer([], { type: 'add', product, quantity: 1 });
    expect(cartReducer(items, { type: 'setQuantity', productId: 'a', quantity: 0 })).toEqual([]);
  });

  it('clears the cart', () => {
    const items = cartReducer([], { type: 'add', product, quantity: 1 });
    expect(cartReducer(items, { type: 'clear' })).toEqual([]);
  });
});

describe('calculateTotals', () => {
  it('charges shipping below the free shipping threshold', () => {
    const totals = calculateTotals([{ price: 30000, quantity: 2 }]);
    expect(totals).toEqual({ itemCount: 2, subtotal: 60000, shipping: SHIPPING_FEE, discount: 0, total: 60000 + SHIPPING_FEE });
  });

  it('grants free shipping above the threshold', () => {
    expect(calculateTotals([{ price: FREE_SHIPPING_THRESHOLD / 2, quantity: 2 }]).shipping).toBe(0);
  });

  it('returns zero totals for an empty cart', () => {
    expect(calculateTotals([])).toEqual({ itemCount: 0, subtotal: 0, shipping: 0, discount: 0, total: 0 });
  });

  it('skips shipping for store pickup', () => {
    expect(calculateTotals([{ price: 10000, quantity: 1 }], { delivery: 'PICKUP', payment: 'CARD' }).shipping).toBe(0);
  });

  it('applies the transfer discount to the subtotal', () => {
    const totals = calculateTotals([{ price: 100000, quantity: 1 }], { delivery: 'HOME', payment: 'TRANSFER' });
    expect(totals).toMatchObject({ discount: 15000, shipping: SHIPPING_FEE, total: 85000 + SHIPPING_FEE });
  });
});
