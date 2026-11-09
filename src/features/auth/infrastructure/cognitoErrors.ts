import { AccountNotConfirmedError } from '../domain/user';

const COGNITO_ERROR_MESSAGES: Record<string, string> = {
  UsernameExistsException: 'Ya existe una cuenta con ese email. Probá ingresar.',
  InvalidPasswordException: 'La contraseña necesita 8 caracteres, mayúscula, minúscula, número y símbolo.',
  NotAuthorizedException: 'Email o contraseña incorrectos.',
  UserNotFoundException: 'Email o contraseña incorrectos.',
  CodeMismatchException: 'El código no es correcto. Revisalo e intentá de nuevo.',
  ExpiredCodeException: 'El código venció. Pedí uno nuevo.',
  LimitExceededException: 'Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.',
  TooManyRequestsException: 'Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.',
  TooManyFailedAttemptsException: 'Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.',
  CodeDeliveryFailureException: 'No pudimos enviarte el código. Revisá el email e intentá de nuevo.',
  InvalidParameterException: 'Revisá los datos ingresados.',
  UserAlreadyAuthenticatedException: 'Ya tenés una sesión iniciada.',
  NetworkError: 'No hay conexión. Revisá tu internet e intentá de nuevo.',
};

const FALLBACK_MESSAGE = 'No pudimos completar la operación. Intentá de nuevo.';

export function translateCognitoError(error: unknown): Error {
  const name = error instanceof Error ? error.name : '';
  if (name === 'UserNotConfirmedException') return new AccountNotConfirmedError();
  return new Error(COGNITO_ERROR_MESSAGES[name] ?? FALLBACK_MESSAGE, { cause: error });
}

export async function withCognitoErrors<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw translateCognitoError(error);
  }
}
