import { describe, expect, it } from 'vitest';
import { translateCognitoError } from './cognitoErrors';

function cognitoError(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

describe('translateCognitoError', () => {
  it('traduce errores conocidos de Cognito', () => {
    const error = translateCognitoError(cognitoError('InvalidPasswordException', 'Password did not conform with policy'));
    expect(error.message).toBe('La contraseña necesita 8 caracteres, mayúscula, minúscula, número y símbolo.');
  });

  it('no expone mensajes en inglés de errores desconocidos', () => {
    expect(translateCognitoError(cognitoError('SomethingElse', 'Internal')).message).toBe('No pudimos completar la operación. Intentá de nuevo.');
  });
});
