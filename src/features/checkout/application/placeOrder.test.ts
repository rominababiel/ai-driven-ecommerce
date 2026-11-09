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
  price: 30000,
  imageUrl: '',
  quantity: 2,
  stock: 5,
  ...overrides,
});

describe('placeOrder', () => {
  let orders: OrderRepository;
  let products: ReturnType<typeof createLocalProductRepository>;

  beforeEach(() => {
    products = createLocalProductRepository([buildProduct({ id: 'p1', name: 'Jean', price: 30000, stock: 5, color: 'Negro' })]);
    orders = createLocalOrderRepository(products);
  });

  it('persists a paid order priced from the catalog', async () => {
    const order = await placeOrder(orders, { customerId: 'user-1', items: [cartItem()], shipping });

    expect(order).toMatchObject({ customerId: 'user-1', status: 'PAID', total: 64500, delivery: 'HOME', payment: 'MERCADO_PAGO' });
    expect(order.items).toEqual([{ productId: 'p1', name: 'Jean', price: 30000, quantity: 2, size: null }]);
    expect(await orders.listByCustomer('user-1')).toHaveLength(1);
  });

  it('ignores prices sent by the client', async () => {
    const order = await placeOrder(orders, { customerId: 'u', items: [cartItem({ price: 1 })], shipping });
    expect(order.total).toBe(64500);
  });

  it('applies pickup and transfer discount on the server side total', async () => {
    const order = await placeOrder(orders, { customerId: 'u', items: [cartItem()], shipping, delivery: 'PICKUP', payment: 'TRANSFER' });
    expect(order).toMatchObject({ total: 51000, discount: 9000, delivery: 'PICKUP', payment: 'TRANSFER' });
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
