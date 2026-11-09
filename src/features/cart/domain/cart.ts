import type { Product } from '@/features/catalog/domain/product';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
  size?: string | null;
  color?: string | null;
}

export type CartAction =
  | { type: 'add'; product: Product; quantity: number; size?: string | null }
  | { type: 'remove'; productId: string }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'clear' };

export function describeItem(item: Pick<CartItem, 'size' | 'color'>): string {
  return [item.size ? `Talle ${item.size}` : 'Talle único', item.color].filter(Boolean).join(' · ');
}

function clampQuantity(quantity: number, stock: number): number {
  return Math.max(0, Math.min(Math.floor(quantity), stock));
}

function addProduct(items: CartItem[], product: Product, quantity: number, size: string | null = null): CartItem[] {
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, price: product.price, stock: product.stock, size: size ?? item.size ?? null, quantity: clampQuantity(item.quantity + quantity, product.stock) }
        : item,
    );
  }
  const initialQuantity = clampQuantity(quantity, product.stock);
  if (initialQuantity === 0) return items;
  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: initialQuantity,
      stock: product.stock,
      size,
      color: product.color ?? null,
    },
  ];
}

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add':
      return addProduct(items, action.product, action.quantity, action.size);
    case 'remove':
      return items.filter((item) => item.productId !== action.productId);
    case 'setQuantity':
      return items.flatMap((item) => {
        if (item.productId !== action.productId) return [item];
        const quantity = clampQuantity(action.quantity, item.stock);
        return quantity > 0 ? [{ ...item, quantity }] : [];
      });
    case 'clear':
      return [];
  }
}
