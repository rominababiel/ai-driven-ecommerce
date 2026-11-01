export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 9.99;
export const INITIAL_ORDER_STATUS = 'PAID';

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function computeOrderAmounts(lines: ReadonlyArray<{ price: number; quantity: number }>) {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const shipping = shippingFor(subtotal);
  return { subtotal, shipping, total: roundMoney(subtotal + shipping) };
}
