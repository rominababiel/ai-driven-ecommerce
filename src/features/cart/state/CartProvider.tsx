import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createPersistentStore } from '@/shared/lib/persistentStore';
import { cartReducer, type CartItem } from '../domain/cart';
import { calculateTotals } from '../domain/pricing';
import { CartContext, type CartContextValue } from './CartContext';

const cartStore = createPersistentStore<CartItem[]>('outfit.cart', []);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, () => cartStore.read());

  useEffect(() => cartStore.write(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totals: calculateTotals(items),
      add: (product, quantity = 1, size = null) => dispatch({ type: 'add', product, quantity, size }),
      remove: (productId) => dispatch({ type: 'remove', productId }),
      setQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
