import { createPersistentStore } from '@/shared/lib/persistentStore';
import { sortByNewest, type Order, type OrderRepository } from '../domain/order';

export function createLocalOrderRepository(): OrderRepository {
  const store = createPersistentStore<Order[]>('shop.orders', []);

  return {
    async create(input) {
      const order: Order = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
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
