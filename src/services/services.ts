import type { AssistantGateway } from '@/features/assistant/domain/assistant';
import type { AuthGateway } from '@/features/auth/domain/user';
import type { ProductRepository } from '@/features/catalog/domain/product';
import type { FavoritesRepository } from '@/features/favorites/domain/favorites';
import type { OrderRepository } from '@/features/orders/domain/order';

export type DataSource = 'amplify' | 'local';

export interface Services {
  dataSource: DataSource;
  auth: AuthGateway;
  products: ProductRepository;
  orders: OrderRepository;
  assistant: AssistantGateway;
  favorites: FavoritesRepository;
}
