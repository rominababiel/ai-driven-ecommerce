import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalProductRepository } from '@/features/catalog/infrastructure/localProductRepository';
import type { OrderRepository } from '@/features/orders/domain/order';
import { createLocalOrderRepository } from '@/features/orders/infrastructure/localOrderRepository';
import { buildProduct } from '@/test/fixtures';
import { placeOrder } from './placeOrder';

const shipping = {
  fullName: 'Ana Pérez',
  email: 'ana@example.com',
  address: 'Av. Siempre Viva 123',
  city: 'Santiago',
  postalCode: '8320000',
  country: 'Chile',
};

const cartItem = (overrides: { price?: number; quantity?: number } = {}) => ({
  productId: 'p1',
  name: 'Jean',
  price: 45,
  imageUrl: '',
  quantity: 2,
  stock: 5,
  ...overrides,
});

describe('placeOrder', () => {
  let orders: OrderRepository;
  let products: ReturnType<typeof createLocalProductRepository>;

  beforeEach(() => {
    products = createLocalProductRepository([buildProduct({ id: 'p1', name: 'Jean', price: 45, stock: 5 })]);
    orders = createLocalOrderRepository(products);
  });

  it('persists a paid order priced from the catalog', async () => {
    const order = await placeOrder(orders, { customerId: 'user-1', items: [cartItem()], shipping });

    expect(order).toMatchObject({ customerId: 'user-1', status: 'PAID', total: 99.99 });
    expect(order.items).toEqual([{ productId: 'p1', name: 'Jean', price: 45, quantity: 2 }]);
    expect(await orders.listByCustomer('user-1')).toHaveLength(1);
  });

  it('ignores prices sent by the client', async () => {
    const order = await placeOrder(orders, { customerId: 'u', items: [cartItem({ price: 0.01 })], shipping });
    expect(order.total).toBe(99.99);
  });

  it('decrements stock and rejects overselling', async () => {
    await placeOrder(orders, { customerId: 'u', items: [cartItem({ quantity: 4 })], shipping });
    expect((await products.getById('p1'))?.stock).toBe(1);
    await expect(placeOrder(orders, { customerId: 'u', items: [cartItem({ quantity: 2 })], shipping })).rejects.toThrow('Stock insuficiente');
  });

  it('rejects an empty cart', async () => {
    await expect(placeOrder(orders, { customerId: 'u', items: [], shipping })).rejects.toThrow('vacío');
  });

  it('rejects an invalid address', async () => {
    const command = { customerId: 'u', items: [cartItem()], shipping: { ...shipping, city: '' } };
    await expect(placeOrder(orders, command)).rejects.toThrow('inválida');
  });
});
