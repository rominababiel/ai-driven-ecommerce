import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

export type DataClient = ReturnType<typeof generateClient<Schema>>;
export type { Schema };

let client: DataClient | null = null;

export function getDataClient(): DataClient {
  client ??= generateClient<Schema>();
  return client;
}
