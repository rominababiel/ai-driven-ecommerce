import type { ShippingAddress } from '@/features/orders/domain/order';
import { EMAIL_PATTERN, type FieldErrors } from '@/shared/lib/validation';

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const REQUIRED_MESSAGE = 'Campo obligatorio';

export function validateShipping(address: ShippingAddress): FieldErrors<ShippingAddress> {
  const errors: FieldErrors<ShippingAddress> = {};
  for (const key of Object.keys(address) as Array<keyof ShippingAddress>) {
    if (!address[key].trim()) errors[key] = REQUIRED_MESSAGE;
  }
  if (!errors.email && !EMAIL_PATTERN.test(address.email.trim())) errors.email = 'Correo inválido';
  if (!errors.postalCode && !/^[A-Za-z0-9\s-]{3,10}$/.test(address.postalCode.trim())) errors.postalCode = 'Código postal inválido';
  return errors;
}

export function passesLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s+/g, '');
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function isExpiryValid(expiry: string, now: Date = new Date()): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const lastValidDay = new Date(year, month, 0, 23, 59, 59);
  return lastValidDay >= now;
}

export function validatePayment(payment: PaymentDetails, now: Date = new Date()): FieldErrors<PaymentDetails> {
  const errors: FieldErrors<PaymentDetails> = {};
  if (!passesLuhn(payment.cardNumber)) errors.cardNumber = 'Número de tarjeta inválido';
  if (!isExpiryValid(payment.expiry, now)) errors.expiry = 'Usa el formato MM/AA con una fecha futura';
  if (!/^\d{3,4}$/.test(payment.cvc.trim())) errors.cvc = 'CVC inválido';
  return errors;
}
