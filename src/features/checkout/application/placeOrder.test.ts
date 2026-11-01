import { describe, expect, it } from 'vitest';
import { createLocalOrderRepository } from '@/features/orders/infrastructure/localOrderRepository';
import { placeOrder } from './placeOrder';

const shipping = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  address: 'Av. Siempre Viva 123',
  city: 'Santiago',
  postalCode: '8320000',
  country: 'Chile',
};

const items = [{ productId: 'p1', name: 'Teclado', price: 45, imageUrl: '', quantity: 2, stock: 5 }];

describe('placeOrder', () => {
  it('persists a paid order with the computed total', async () => {
    const orders = createLocalOrderRepository();
    const order = await placeOrder(orders, { customerId: 'user-1', items, shipping });

    expect(order).toMatchObject({ customerId: 'user-1', status: 'PAID', total: 99.99 });
    expect(order.items).toEqual([{ productId: 'p1', name: 'Teclado', price: 45, quantity: 2 }]);
    expect(await orders.listByCustomer('user-1')).toHaveLength(1);
  });

  it('rejects an empty cart', async () => {
    await expect(placeOrder(createLocalOrderRepository(), { customerId: 'u', items: [], shipping })).rejects.toThrow('vacío');
  });

  it('rejects an invalid address', async () => {
    const command = { customerId: 'u', items, shipping: { ...shipping, city: '' } };
    await expect(placeOrder(createLocalOrderRepository(), command)).rejects.toThrow('inválida');
  });
});
