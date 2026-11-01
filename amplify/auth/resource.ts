import { defineAuth } from '@aws-amplify/backend';
import { ADMIN_GROUP } from '../shared/constants';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: [ADMIN_GROUP],
});
