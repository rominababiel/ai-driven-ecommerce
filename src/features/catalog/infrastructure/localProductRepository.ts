import { createPersistentStore } from '@/shared/lib/persistentStore';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import type { Product, ProductRepository } from '../domain/product';

export function createLocalProductRepository(seed: readonly Product[] = DEMO_PRODUCTS): ProductRepository {
  const store = createPersistentStore<Product[]>('outfit.products.v2', [...seed]);

  const findOrThrow = (id: string) => {
    const product = store.read().find((item) => item.id === id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  };

  return {
    async list() {
      return store.read();
    },
    async getById(id) {
      return store.read().find((item) => item.id === id) ?? null;
    },
    async create(input) {
      const product: Product = { ...input, id: crypto.randomUUID() };
      store.write([...store.read(), product]);
      return product;
    },
    async update(id, input) {
      const updated: Product = { ...findOrThrow(id), ...input };
      store.write(store.read().map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    async remove(id) {
      store.write(store.read().filter((item) => item.id !== id));
    },
  };
}
