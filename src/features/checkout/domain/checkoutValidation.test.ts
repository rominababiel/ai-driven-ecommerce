import { describe, expect, it } from 'vitest';
import { isExpiryValid, passesLuhn, validatePayment, validateShipping } from './checkoutValidation';

const validAddress = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  address: 'Av. Siempre Viva 123',
  city: 'Santiago',
  postalCode: '8320000',
  country: 'Chile',
};

describe('validateShipping', () => {
  it('accepts a complete address', () => {
    expect(validateShipping(validAddress)).toEqual({});
  });

  it('flags missing fields and invalid email', () => {
    const errors = validateShipping({ ...validAddress, city: ' ', email: 'ana@' });
    expect(errors).toEqual({ city: 'Campo obligatorio', email: 'Correo inválido' });
  });
});

describe('payment validation', () => {
  const now = new Date(2026, 9, 31);

  it('validates card numbers with the Luhn algorithm', () => {
    expect(passesLuhn('4242 4242 4242 4242')).toBe(true);
    expect(passesLuhn('4242 4242 4242 4241')).toBe(false);
  });

  it('accepts expiry dates through the end of the month', () => {
    expect(isExpiryValid('10/26', now)).toBe(true);
    expect(isExpiryValid('09/26', now)).toBe(false);
    expect(isExpiryValid('13/30', now)).toBe(false);
  });

  it('returns errors per invalid field', () => {
    const errors = validatePayment({ cardNumber: '1234', expiry: '12/30', cvc: '1' }, now);
    expect(Object.keys(errors).sort()).toEqual(['cardNumber', 'cvc']);
  });
});
