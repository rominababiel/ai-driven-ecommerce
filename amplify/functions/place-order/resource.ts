import { defineFunction } from '@aws-amplify/backend';

export const placeOrderFunction = defineFunction({
  name: 'place-order',
  entry: './handler.ts',
  timeoutSeconds: 15,
  resourceGroupName: 'data',
});
