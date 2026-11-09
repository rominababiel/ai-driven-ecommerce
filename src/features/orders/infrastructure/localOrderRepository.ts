import type { ProductRepository } from '@/features/catalog/domain/product';
import { createPersistentStore } from '@/shared/lib/persistentStore';
import { computeOrderAmounts, INITIAL_ORDER_STATUS } from '../../../../amplify/shared/pricing';
import { sortByNewest, type Order, type OrderRepository } from '../domain/order';

export function createLocalOrderRepository(products: ProductRepository): OrderRepository {
  const store = createPersistentStore<Order[]>('outfit.orders', []);

  return {
    async place({ customerId, lines, shipping, delivery, payment }) {
      if (lines.length === 0) throw new Error('El carrito está vacío');

      const resolved = await Promise.all(
        lines.map(async ({ productId, quantity, size }) => {
          const product = await products.getById(productId);
          if (!product) throw new Error('Producto no disponible');
          if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Cantidad inválida');
          if (product.stock < quantity) throw new Error(`Stock insuficiente para ${product.name}`);
          return { product, quantity, size: size ?? null };
        }),
      );

      await Promise.all(
        resolved.map(({ product, quantity }) => {
          const { id, ...input } = product;
          return products.update(id, { ...input, stock: product.stock - quantity });
        }),
      );

      const items = resolved.map(({ product, quantity, size }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        size,
      }));
      const amounts = computeOrderAmounts(items, { delivery, payment });

      const order: Order = {
        id: crypto.randomUUID(),
        customerId,
        items,
        shipping,
        total: amounts.total,
        discount: amounts.discount,
        delivery,
        payment,
        status: INITIAL_ORDER_STATUS,
        createdAt: new Date().toISOString(),
      };
      store.write([...store.read(), order]);
      return order;
    },
    async listByCustomer(customerId) {
      return sortByNewest(store.read().filter((order) => order.customerId === customerId));
    },
    async listAll() {
      return sortByNewest(store.read());
    },
    async updateStatus(id, status) {
      const current = store.read().find((order) => order.id === id);
      if (!current) throw new Error('Pedido no encontrado');
      const updated: Order = { ...current, status };
      store.write(store.read().map((order) => (order.id === id ? updated : order)));
      return updated;
    },
  };
}
