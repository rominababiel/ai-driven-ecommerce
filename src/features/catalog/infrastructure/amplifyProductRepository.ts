import { getDataClient, type Schema } from '@/infrastructure/amplify/dataClient';
import { assertNoErrors, collectPages, unwrap } from '@/infrastructure/amplify/results';
import type { Product, ProductRepository } from '../domain/product';

type ProductRecord = Schema['Product']['type'];

function toProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    price: record.price,
    category: record.category,
    imageUrl: record.imageUrl ?? '',
    stock: record.stock,
    rating: record.rating ?? 0,
  };
}

export function createAmplifyProductRepository(): ProductRepository {
  const products = () => getDataClient().models.Product;

  return {
    async list() {
      const records = await collectPages((nextToken) => products().list({ authMode: 'apiKey', limit: 100, nextToken }));
      return records.map(toProduct);
    },
    async getById(id) {
      const { data, errors } = await products().get({ id }, { authMode: 'apiKey' });
      assertNoErrors(errors);
      return data ? toProduct(data) : null;
    },
    async create(input) {
      return toProduct(unwrap(await products().create(input)));
    },
    async update(id, input) {
      return toProduct(unwrap(await products().update({ id, ...input })));
    },
    async remove(id) {
      unwrap(await products().delete({ id }));
    },
  };
}
