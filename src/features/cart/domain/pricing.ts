import { roundMoney } from '@/shared/lib/money';
import type { CartItem } from './cart';

export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 9.99;

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export function calculateTotals(items: readonly Pick<CartItem, 'price' | 'quantity'>[]): CartTotals {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { itemCount, subtotal, shipping, total: roundMoney(subtotal + shipping) };
}
