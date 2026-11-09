import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { env } from '$amplify/env/post-confirmation';
import { isAdminEmail } from '../../shared/admins';

const cognito = new CognitoIdentityProviderClient();
const adminEmails = env.ADMIN_EMAILS.split(',');

export const handler: PostConfirmationTriggerHandler = async (event) => {
  if (isAdminEmail(event.request.userAttributes.email, adminEmails)) {
    await cognito.send(
      new AdminAddUserToGroupCommand({
        GroupName: env.ADMIN_GROUP,
        Username: event.userName,
        UserPoolId: event.userPoolId,
      }),
    );
  }
  return event;
};
