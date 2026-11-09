export interface PasswordRule {
  label: string;
  test(password: string): boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: '8 caracteres', test: (password) => password.length >= 8 },
  { label: 'una mayúscula', test: (password) => /[A-Z]/.test(password) },
  { label: 'una minúscula', test: (password) => /[a-z]/.test(password) },
  { label: 'un número', test: (password) => /\d/.test(password) },
  { label: 'un símbolo', test: (password) => /[^A-Za-z0-9\s]/.test(password) },
];

export function missingPasswordRules(password: string): string[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
}

export function passwordError(password: string): string | null {
  const missing = missingPasswordRules(password);
  if (missing.length === 0) return null;
  const list = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(', ')} y ${missing.at(-1)}`;
  return `A la contraseña le falta ${list}.`;
}
