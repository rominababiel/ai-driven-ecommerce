import { defineAuth, secret } from '@aws-amplify/backend';
import { ADMIN_GROUP } from '../shared/constants';

const APP_URLS = ['http://localhost:5173/', 'https://main.d1hdx6f49r2alg.amplifyapp.com/'];

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['openid', 'email', 'profile'],
        attributeMapping: { email: 'email' },
      },
      callbackUrls: APP_URLS,
      logoutUrls: APP_URLS,
    },
  },
  groups: [ADMIN_GROUP],
});
