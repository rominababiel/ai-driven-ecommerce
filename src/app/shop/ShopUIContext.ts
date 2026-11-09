import { createContext, useContext } from 'react';

export type Panel = 'menu' | 'filters' | 'miniCart' | null;

export interface Toast {
  id: number;
  text: string;
  icon?: string;
  action?: { label: string; run: () => void };
}

export interface ShopUIContextValue {
  panel: Panel;
  openPanel(panel: Exclude<Panel, null>): void;
  closePanel(): void;
  chatOpen: boolean;
  openChat(question?: string): void;
  closeChat(): void;
  registerAsker(asker: ((question: string) => void) | null): void;
  toast: Toast | null;
  showToast(toast: Omit<Toast, 'id'>): void;
  dismissToast(): void;
  favorites: ReadonlySet<string>;
  favoritesAreGuest: boolean;
  toggleFavorite(productId: string): boolean;
  justAddedId: string | null;
  notifyAdded(productId: string): void;
}

export const ShopUIContext = createContext<ShopUIContextValue | null>(null);

export function useShopUI(): ShopUIContextValue {
  const context = useContext(ShopUIContext);
  if (!context) throw new Error('useShopUI debe usarse dentro de ShopUIProvider');
  return context;
}
