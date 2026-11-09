export const FREE_SHIPPING_THRESHOLD = 120000;
export const SHIPPING_FEE = 4500;
export const TRANSFER_DISCOUNT_RATE = 0.15;
export const INSTALLMENTS = 3;
export const INITIAL_ORDER_STATUS = 'PAID';

export const DELIVERY_METHODS = ['HOME', 'PICKUP'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const PAYMENT_METHODS = ['MERCADO_PAGO', 'CARD', 'TRANSFER'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface CheckoutOptions {
  delivery: DeliveryMethod;
  payment: PaymentMethod;
}

export const DEFAULT_CHECKOUT_OPTIONS: CheckoutOptions = { delivery: 'HOME', payment: 'MERCADO_PAGO' };

export function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return DELIVERY_METHODS.includes(value as DeliveryMethod);
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function shippingFor(subtotal: number, delivery: DeliveryMethod = 'HOME'): number {
  if (delivery === 'PICKUP' || subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEE;
}

export function discountFor(subtotal: number, payment: PaymentMethod): number {
  return payment === 'TRANSFER' ? Math.round(subtotal * TRANSFER_DISCOUNT_RATE) : 0;
}

export function computeOrderAmounts(
  lines: ReadonlyArray<{ price: number; quantity: number }>,
  options: CheckoutOptions = DEFAULT_CHECKOUT_OPTIONS,
) {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const shipping = shippingFor(subtotal, options.delivery);
  const discount = discountFor(subtotal, options.payment);
  return { subtotal, shipping, discount, total: roundMoney(subtotal + shipping - discount) };
}
