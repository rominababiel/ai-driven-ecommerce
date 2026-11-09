import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalAuthGateway } from './localAuthGateway';

describe('local password reset', () => {
  beforeEach(() => localStorage.clear());

  it('replaces the password after a valid code', async () => {
    const auth = createLocalAuthGateway();
    await auth.signUp({ email: 'ana@mail.com', password: 'Vieja123' });
    await auth.requestPasswordReset('ana@mail.com');
    await auth.confirmPasswordReset('ana@mail.com', '123456', 'Nueva123');

    await expect(auth.signIn({ email: 'ana@mail.com', password: 'Vieja123' })).rejects.toThrow();
    await expect(auth.signIn({ email: 'ana@mail.com', password: 'Nueva123' })).resolves.toMatchObject({ email: 'ana@mail.com' });
  });

  it('rejects malformed codes', async () => {
    const auth = createLocalAuthGateway();
    await expect(auth.confirmPasswordReset('cliente@shop.dev', '12', 'Nueva123')).rejects.toThrow('El código no es válido');
  });
});
