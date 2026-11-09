import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { AuthRedirectState } from '@/features/auth/ui/AuthPage';
import { useShopUI } from './ShopUIContext';

export const GUEST_FAVORITES_NOTICE = 'Guardado en este dispositivo. Ingresá para no perderlos';

export function useToggleFavorite() {
  const { toggleFavorite, favoritesAreGuest, showToast } = useShopUI();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  return useCallback(
    (productId: string) => {
      const added = toggleFavorite(productId);
      if (!added) return showToast({ text: 'Quitado de favoritos', icon: 'heart-break' });
      if (!favoritesAreGuest) return showToast({ text: 'Guardado en favoritos', icon: 'heart' });
      const state: AuthRedirectState = { from: pathname + search };
      showToast({ text: GUEST_FAVORITES_NOTICE, icon: 'heart', action: { label: 'Ingresar', run: () => navigate('/login', { state }) } });
    },
    [toggleFavorite, favoritesAreGuest, showToast, navigate, pathname, search],
  );
}
