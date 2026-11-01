import type { Product } from '@/features/catalog/domain/product';

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Producto de prueba',
    description: 'Descripción del producto de prueba',
    price: 10,
    category: 'General',
    imageUrl: 'https://example.com/image.png',
    stock: 5,
    rating: 4,
    ...overrides,
  };
}
