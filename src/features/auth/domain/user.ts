export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpResult {
  needsConfirmation: boolean;
}

export interface AuthGateway {
  currentUser(): Promise<User | null>;
  signIn(credentials: Credentials): Promise<User>;
  signUp(credentials: Credentials): Promise<SignUpResult>;
  confirmSignUp(email: string, code: string): Promise<void>;
  resendSignUpCode(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  subscribe(listener: (user: User | null) => void): () => void;
}

export class AccountNotConfirmedError extends Error {
  constructor() {
    super('Tenés que confirmar tu cuenta con el código que te mandamos por mail.');
    this.name = 'AccountNotConfirmedError';
  }
}

export function hasRole(user: User | null, role: Role): boolean {
  return user?.role === role;
}
