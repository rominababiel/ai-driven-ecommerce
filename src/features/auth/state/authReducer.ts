import type { User } from '../domain/user';

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'anonymous'; user: null }
  | { status: 'authenticated'; user: User };

export type AuthAction = { type: 'resolved'; user: User | null } | { type: 'signedOut' };

export const initialAuthState: AuthState = { status: 'loading', user: null };

export function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'resolved':
      return action.user ? { status: 'authenticated', user: action.user } : { status: 'anonymous', user: null };
    case 'signedOut':
      return { status: 'anonymous', user: null };
  }
}
