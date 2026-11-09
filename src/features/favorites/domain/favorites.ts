export interface FavoritesRepository {
  list(userId: string): Promise<string[]>;
  add(userId: string, productId: string): Promise<void>;
  remove(userId: string, productId: string): Promise<void>;
}

export function missingFavorites(guest: readonly string[], account: readonly string[]): string[] {
  const saved = new Set(account);
  return [...new Set(guest)].filter((productId) => !saved.has(productId));
}
