import { computeOrderAmounts, DEFAULT_CHECKOUT_OPTIONS, type CheckoutOptions } from '../../../../amplify/shared/pricing';
import type { CartItem } from './cart';

export {
  FREE_SHIPPING_THRESHOLD,
  INSTALLMENTS,
  SHIPPING_FEE,
  TRANSFER_DISCOUNT_RATE,
  type CheckoutOptions,
} from '../../../../amplify/shared/pricing';

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export function calculateTotals(
  items: readonly Pick<CartItem, 'price' | 'quantity'>[],
  options: CheckoutOptions = DEFAULT_CHECKOUT_OPTIONS,
): CartTotals {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return { itemCount, ...computeOrderAmounts(items, options) };
}
