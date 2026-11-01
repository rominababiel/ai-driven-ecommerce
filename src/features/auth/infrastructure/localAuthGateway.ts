import { createPersistentStore } from '@/shared/lib/persistentStore';
import type { AuthGateway, User } from '../domain/user';

interface StoredUser extends User {
  password: string;
}

export const DEMO_ACCOUNTS = [
  { id: 'demo-admin', email: 'admin@shop.dev', password: 'Admin123!', role: 'admin' },
  { id: 'demo-customer', email: 'cliente@shop.dev', password: 'Cliente123!', role: 'customer' },
] as const satisfies readonly StoredUser[];

const toUser = ({ id, email, role }: StoredUser): User => ({ id, email, role });

export function createLocalAuthGateway(): AuthGateway {
  const users = createPersistentStore<StoredUser[]>('shop.users', [...DEMO_ACCOUNTS]);
  const session = createPersistentStore<string | null>('shop.session', null);

  const findByEmail = (email: string) => users.read().find((user) => user.email === email.trim().toLowerCase());

  return {
    async currentUser() {
      const userId = session.read();
      const user = users.read().find((candidate) => candidate.id === userId);
      return user ? toUser(user) : null;
    },
    async signIn({ email, password }) {
      const user = findByEmail(email);
      if (!user || user.password !== password) throw new Error('Correo o contraseña incorrectos');
      session.write(user.id);
      return toUser(user);
    },
    async signUp({ email, password }) {
      if (findByEmail(email)) throw new Error('Ya existe una cuenta con ese correo');
      const user: StoredUser = { id: crypto.randomUUID(), email: email.trim().toLowerCase(), password, role: 'customer' };
      users.write([...users.read(), user]);
      return { needsConfirmation: false };
    },
    async confirmSignUp() {
      return;
    },
    async signOut() {
      session.write(null);
    },
  };
}
