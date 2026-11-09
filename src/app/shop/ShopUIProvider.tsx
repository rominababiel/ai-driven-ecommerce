import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useFavorites } from '@/features/favorites/state/useFavorites';
import { ShopUIContext, type Panel, type ShopUIContextValue, type Toast } from './ShopUIContext';

const TOAST_MS = 3600;
const ADDED_FLASH_MS = 2400;

export function ShopUIProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [panelState, setPanelState] = useState<{ panel: Panel; pathname: string }>({ panel: null, pathname });
  const panel = panelState.pathname === pathname ? panelState.panel : null;
  const setPanel = useCallback((next: Panel) => setPanelState({ panel: next, pathname }), [pathname]);
  const [chatOpen, setChatOpen] = useState(false);
  const askerRef = useRef<((question: string) => void) | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const { favorites, isGuest: favoritesAreGuest, toggle: toggleFavorite } = useFavorites();
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const addedTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      window.clearTimeout(addedTimer.current);
    },
    [],
  );

  const showToast = useCallback((next: Omit<Toast, 'id'>) => {
    window.clearTimeout(toastTimer.current);
    setToast({ ...next, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const notifyAdded = useCallback((productId: string) => {
    window.clearTimeout(addedTimer.current);
    setJustAddedId(productId);
    addedTimer.current = window.setTimeout(() => setJustAddedId(null), ADDED_FLASH_MS);
  }, []);

  const value = useMemo<ShopUIContextValue>(
    () => ({
      panel,
      openPanel: (next) => {
        setChatOpen(false);
        setPanel(next);
      },
      closePanel: () => setPanel(null),
      chatOpen,
      openChat: (question) => {
        setPanel(null);
        setChatOpen(true);
        if (question) askerRef.current?.(question);
      },
      closeChat: () => setChatOpen(false),
      registerAsker: (asker) => {
        askerRef.current = asker;
      },
      toast,
      showToast,
      dismissToast: () => setToast(null),
      favorites,
      favoritesAreGuest,
      toggleFavorite,
      justAddedId,
      notifyAdded,
    }),
    [panel, setPanel, chatOpen, toast, showToast, favorites, favoritesAreGuest, toggleFavorite, justAddedId, notifyAdded],
  );

  return <ShopUIContext value={value}>{children}</ShopUIContext>;
}
