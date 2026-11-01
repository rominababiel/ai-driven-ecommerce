import { hasErrors, type FieldErrors } from '@/shared/lib/validation';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
}

export type ProductInput = Omit<Product, 'id'>;

export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product>;
  remove(id: string): Promise<void>;
}

export function isInStock(product: Pick<Product, 'stock'>): boolean {
  return product.stock > 0;
}

export function validateProductInput(input: ProductInput): FieldErrors<ProductInput> {
  const errors: FieldErrors<ProductInput> = {};
  if (input.name.trim().length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres';
  if (input.description.trim().length < 10) errors.description = 'La descripción debe tener al menos 10 caracteres';
  if (!input.category.trim()) errors.category = 'La categoría es obligatoria';
  if (!Number.isFinite(input.price) || input.price <= 0) errors.price = 'El precio debe ser mayor a 0';
  if (!Number.isInteger(input.stock) || input.stock < 0) errors.stock = 'El stock debe ser un entero mayor o igual a 0';
  if (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5) errors.rating = 'La valoración debe estar entre 0 y 5';
  return errors;
}

export function isValidProductInput(input: ProductInput): boolean {
  return !hasErrors(validateProductInput(input));
}
