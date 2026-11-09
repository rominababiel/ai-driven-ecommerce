import { useCallback } from 'react';
import { useCart } from '@/features/cart/state/CartContext';
import type { Product } from '@/features/catalog/domain/product';
import { useShopUI } from './ShopUIContext';

export function useAddToCart() {
  const cart = useCart();
  const ui = useShopUI();

  return useCallback(
    (product: Product, options: { quantity?: number; size?: string | null; reveal?: 'drawer' | 'toast' } = {}) => {
      if (product.stock === 0) return;
      cart.add(product, options.quantity ?? 1, options.size ?? null);
      ui.notifyAdded(product.id);
      if (options.reveal === 'toast') ui.showToast({ text: `${product.name} al carrito`, icon: 'check' });
      else ui.openPanel('miniCart');
    },
    [cart, ui],
  );
}
