import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useServices } from '@/services/ServicesContext';
import { createPersistentStore } from '@/shared/lib/persistentStore';
import { missingFavorites } from '../domain/favorites';

const guestStore = createPersistentStore<string[]>('outfit.favorites', []);

interface AccountFavorites {
  userId: string;
  ids: ReadonlySet<string>;
}

export interface FavoritesState {
  favorites: ReadonlySet<string>;
  isGuest: boolean;
  toggle(productId: string): boolean;
}

function toggled(set: ReadonlySet<string>, productId: string): Set<string> {
  const next = new Set(set);
  if (next.has(productId)) next.delete(productId);
  else next.add(productId);
  return next;
}

export function useFavorites(): FavoritesState {
  const { user } = useAuth();
  const { favorites: repository } = useServices();
  const [guest, setGuest] = useState<ReadonlySet<string>>(() => new Set(guestStore.read()));
  const [account, setAccount] = useState<AccountFavorites | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const pending = guestStore.read();
    repository
      .list(userId)
      .then(async (saved) => {
        const toMove = missingFavorites(pending, saved);
        await Promise.all(toMove.map((productId) => repository.add(userId, productId)));
        guestStore.write([]);
        if (!active) return;
        setGuest(new Set());
        setAccount({ userId, ids: new Set([...saved, ...toMove]) });
      })
      .catch(() => {
        if (active) setAccount({ userId, ids: new Set(pending) });
      });
    return () => {
      active = false;
    };
  }, [userId, repository]);

  const accountIds = userId && account?.userId === userId ? account.ids : null;
  const favorites = useMemo(() => accountIds ?? guest, [accountIds, guest]);

  const toggle = useCallback(
    (productId: string) => {
      const adding = !favorites.has(productId);
      if (!userId || !accountIds) {
        setGuest((current) => {
          const next = toggled(current, productId);
          guestStore.write([...next]);
          return next;
        });
        return adding;
      }
      setAccount({ userId, ids: toggled(accountIds, productId) });
      const request = adding ? repository.add(userId, productId) : repository.remove(userId, productId);
      request.catch(() => setAccount((current) => (current?.userId === userId ? { userId, ids: toggled(current.ids, productId) } : current)));
      return adding;
    },
    [favorites, userId, accountIds, repository],
  );

  return { favorites, isGuest: !userId, toggle };
}
