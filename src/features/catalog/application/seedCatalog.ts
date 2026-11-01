import type { Product, ProductRepository } from '../domain/product';

export async function seedCatalog(repository: ProductRepository, products: readonly Product[]): Promise<number> {
  const created = await Promise.all(products.map(({ id: _id, ...input }) => repository.create(input)));
  return created.length;
}
