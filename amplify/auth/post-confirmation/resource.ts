import { defineFunction } from '@aws-amplify/backend';
import { ADMIN_EMAILS, ADMIN_GROUP } from '../../shared/constants';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  resourceGroupName: 'auth',
  environment: {
    ADMIN_GROUP,
    ADMIN_EMAILS: ADMIN_EMAILS.join(','),
  },
});
