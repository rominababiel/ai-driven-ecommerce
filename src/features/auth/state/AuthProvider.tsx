import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { useServices } from '@/services/ServicesContext';
import type { Credentials } from '../domain/user';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { authReducer, initialAuthState } from './authReducer';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useServices();
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    let active = true;
    auth.currentUser().then((user) => {
      if (active) dispatch({ type: 'resolved', user });
    });
    const unsubscribe = auth.subscribe((user) => {
      if (active) dispatch({ type: 'resolved', user });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      async signIn(credentials: Credentials) {
        const user = await auth.signIn(credentials);
        dispatch({ type: 'resolved', user });
        return user;
      },
      signUp: (credentials: Credentials) => auth.signUp(credentials),
      confirmSignUp: (email: string, code: string) => auth.confirmSignUp(email, code),
      requestPasswordReset: (email: string) => auth.requestPasswordReset(email),
      confirmPasswordReset: (email: string, code: string, newPassword: string) => auth.confirmPasswordReset(email, code, newPassword),
      signInWithGoogle: () => auth.signInWithGoogle(),
      async signOut() {
        await auth.signOut();
        dispatch({ type: 'signedOut' });
      },
    }),
    [auth, state],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
