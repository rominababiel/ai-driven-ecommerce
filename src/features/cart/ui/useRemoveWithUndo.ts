import { useCallback } from 'react';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useCart } from '../state/CartContext';
import type { CartItem } from '../domain/cart';

export function useRemoveWithUndo() {
  const cart = useCart();
  const { showToast } = useShopUI();

  return useCallback(
    (item: CartItem) => {
      cart.remove(item.productId);
      showToast({
        text: 'Producto eliminado',
        icon: 'trash',
        action: {
          label: 'Deshacer',
          run: () =>
            cart.add(
              { id: item.productId, name: item.name, price: item.price, imageUrl: item.imageUrl, stock: item.stock, color: item.color, description: '', category: '', rating: 0 },
              item.quantity,
              item.size,
            ),
        },
      });
    },
    [cart, showToast],
  );
}
