import { describe, expect, it } from 'vitest';
import { passwordError } from './password';

describe('passwordError', () => {
  it('acepta una contraseña que cumple la política', () => {
    expect(passwordError('Correr.2026')).toBeNull();
  });

  it('enumera lo que falta', () => {
    expect(passwordError('correr2026')).toBe('A la contraseña le falta una mayúscula y un símbolo.');
  });
});
