import { createContext, useContext } from 'react';
import type { Product } from '@/features/catalog/domain/product';
import type { CartItem } from '../domain/cart';
import type { CartTotals } from '../domain/pricing';

export interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  add(product: Product, quantity?: number): void;
  remove(productId: string): void;
  setQuantity(productId: string, quantity: number): void;
  clear(): void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
