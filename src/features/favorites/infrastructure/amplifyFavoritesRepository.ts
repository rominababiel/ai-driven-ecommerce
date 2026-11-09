import { getDataClient } from '@/infrastructure/amplify/dataClient';
import { assertNoErrors, collectPages } from '@/infrastructure/amplify/results';
import type { FavoritesRepository } from '../domain/favorites';

export function createAmplifyFavoritesRepository(): FavoritesRepository {
  const client = () => getDataClient().models.Favorite;
  const listRecords = () => collectPages((nextToken) => client().list({ limit: 100, nextToken }));

  return {
    async list() {
      return (await listRecords()).map((record) => record.productId);
    },
    async add(_userId, productId) {
      const { errors } = await client().create({ productId });
      assertNoErrors(errors);
    },
    async remove(_userId, productId) {
      const matches = (await listRecords()).filter((record) => record.productId === productId);
      for (const record of matches) {
        const { errors } = await client().delete({ id: record.id });
        assertNoErrors(errors);
      }
    },
  };
}
