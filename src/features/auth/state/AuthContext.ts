import { createContext, useContext } from 'react';
import type { Credentials, SignUpResult, User } from '../domain/user';
import type { AuthState } from './authReducer';

export type AuthContextValue = AuthState & {
  signIn(credentials: Credentials): Promise<User>;
  signUp(credentials: Credentials): Promise<SignUpResult>;
  confirmSignUp(email: string, code: string): Promise<void>;
  signOut(): Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
