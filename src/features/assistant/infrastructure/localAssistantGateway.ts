import { getCategories } from '@/features/catalog/domain/filters';
import type { ProductRepository } from '@/features/catalog/domain/product';
import type { AssistantGateway } from '../domain/assistant';
import { composeReply } from './shoppingIntent';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createLocalAssistantGateway(products: ProductRepository, chunkDelayMs = 25): AssistantGateway {
  return {
    requiresAuth: false,
    async createSession() {
      return {
        async send(text, onDelta) {
          const catalog = await products.list();
          const reply = composeReply(text, catalog, getCategories(catalog));
          for (const chunk of reply.match(/\S+\s*/g) ?? []) {
            onDelta(chunk);
            if (chunkDelayMs > 0) await wait(chunkDelayMs);
          }
        },
        dispose() {
          return;
        },
      };
    },
  };
}
