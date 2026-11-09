import { createPersistentStore } from '@/shared/lib/persistentStore';
import type { FavoritesRepository } from '../domain/favorites';

export function createLocalFavoritesRepository(): FavoritesRepository {
  const store = (userId: string) => createPersistentStore<string[]>(`outfit.favorites.${userId}`, []);

  return {
    async list(userId) {
      return store(userId).read();
    },
    async add(userId, productId) {
      const current = store(userId).read();
      if (!current.includes(productId)) store(userId).write([...current, productId]);
    },
    async remove(userId, productId) {
      store(userId).write(store(userId).read().filter((id) => id !== productId));
    },
  };
}
