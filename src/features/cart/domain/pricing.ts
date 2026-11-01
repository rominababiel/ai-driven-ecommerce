import { computeOrderAmounts } from '../../../../amplify/shared/pricing';
import type { CartItem } from './cart';

export { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../../../../amplify/shared/pricing';

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export function calculateTotals(items: readonly Pick<CartItem, 'price' | 'quantity'>[]): CartTotals {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return { itemCount, ...computeOrderAmounts(items) };
}
