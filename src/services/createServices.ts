import { createBedrockAssistantGateway } from '@/features/assistant/infrastructure/bedrockAssistantGateway';
import { createLocalAssistantGateway } from '@/features/assistant/infrastructure/localAssistantGateway';
import { createCognitoAuthGateway } from '@/features/auth/infrastructure/cognitoAuthGateway';
import { createLocalAuthGateway } from '@/features/auth/infrastructure/localAuthGateway';
import { createAmplifyProductRepository } from '@/features/catalog/infrastructure/amplifyProductRepository';
import { createLocalProductRepository } from '@/features/catalog/infrastructure/localProductRepository';
import { createAmplifyOrderRepository } from '@/features/orders/infrastructure/amplifyOrderRepository';
import { createLocalOrderRepository } from '@/features/orders/infrastructure/localOrderRepository';
import type { DataSource, Services } from './services';

export function createAmplifyServices(): Services {
  return {
    dataSource: 'amplify',
    auth: createCognitoAuthGateway(),
    products: createAmplifyProductRepository(),
    orders: createAmplifyOrderRepository(),
    assistant: createBedrockAssistantGateway(),
  };
}

export function createLocalServices(): Services {
  const products = createLocalProductRepository();
  return {
    dataSource: 'local',
    auth: createLocalAuthGateway(),
    products,
    orders: createLocalOrderRepository(products),
    assistant: createLocalAssistantGateway(products),
  };
}

export function createServices(dataSource: DataSource): Services {
  return dataSource === 'amplify' ? createAmplifyServices() : createLocalServices();
}
