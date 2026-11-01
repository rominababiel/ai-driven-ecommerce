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
  signOut(): Promise<void>;
}

export function hasRole(user: User | null, role: Role): boolean {
  return user?.role === role;
}
