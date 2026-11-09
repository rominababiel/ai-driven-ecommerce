import { describe, expect, it } from 'vitest';
import { isAdminEmail } from '../../../../amplify/shared/admins';

describe('isAdminEmail', () => {
  it('matches ignoring case and spaces', () => {
    expect(isAdminEmail(' Rominababiel@Hotmail.com ', ['rominababiel@hotmail.com'])).toBe(true);
  });

  it('rejects other or missing emails', () => {
    expect(isAdminEmail('otra@mail.com', ['rominababiel@hotmail.com'])).toBe(false);
    expect(isAdminEmail(undefined, ['rominababiel@hotmail.com'])).toBe(false);
  });
});
