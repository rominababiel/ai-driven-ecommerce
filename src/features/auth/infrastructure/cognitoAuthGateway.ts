import {
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { ADMIN_GROUP } from '../../../../amplify/shared/constants';
import type { AuthGateway, User } from '../domain/user';

const SIGN_IN_STEP_MESSAGES: Record<string, string> = {
  CONFIRM_SIGN_UP: 'Debes confirmar tu cuenta con el código enviado a tu correo',
  RESET_PASSWORD: 'Debes restablecer tu contraseña antes de continuar',
};

async function resolveUser(): Promise<User> {
  const [{ userId }, session, attributes] = await Promise.all([
    getCurrentUser(),
    fetchAuthSession(),
    fetchUserAttributes(),
  ]);
  const groups = session.tokens?.accessToken.payload['cognito:groups'];
  const isAdmin = Array.isArray(groups) && groups.includes(ADMIN_GROUP);
  return { id: userId, email: attributes.email ?? '', role: isAdmin ? 'admin' : 'customer' };
}

export function createCognitoAuthGateway(): AuthGateway {
  return {
    async currentUser() {
      try {
        return await resolveUser();
      } catch {
        return null;
      }
    },
    async signIn({ email, password }) {
      const result = await signIn({ username: email.trim(), password });
      if (!result.isSignedIn) {
        throw new Error(SIGN_IN_STEP_MESSAGES[result.nextStep.signInStep] ?? 'No fue posible iniciar sesión');
      }
      return resolveUser();
    },
    async signUp({ email, password }) {
      const result = await signUp({
        username: email.trim(),
        password,
        options: { userAttributes: { email: email.trim() } },
      });
      return { needsConfirmation: result.nextStep.signUpStep === 'CONFIRM_SIGN_UP' };
    },
    async confirmSignUp(email, code) {
      await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
    },
    async signOut() {
      await signOut();
    },
  };
}
