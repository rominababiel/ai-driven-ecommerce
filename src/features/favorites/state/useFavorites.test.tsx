import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/AppProviders';
import { useAuth } from '@/features/auth/state/AuthContext';
import { createLocalServices } from '@/services/createServices';
import { missingFavorites } from '../domain/favorites';
import { useFavorites } from './useFavorites';

function setup() {
  const services = createLocalServices();
  const wrapper = ({ children }: { children: ReactNode }) => <AppProviders services={services}>{children}</AppProviders>;
  const hook = renderHook(() => ({ favorites: useFavorites(), auth: useAuth() }), { wrapper });
  return { ...hook, services };
}

describe('favorites', () => {
  beforeEach(() => localStorage.clear());

  it('only moves favorites the account does not have yet', () => {
    expect(missingFavorites(['a', 'b', 'b'], ['b'])).toEqual(['a']);
  });

  it('keeps guest favorites on the device', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'));

    act(() => {
      result.current.favorites.toggle('p-01');
    });

    expect(result.current.favorites.isGuest).toBe(true);
    expect([...result.current.favorites.favorites]).toEqual(['p-01']);
  });

  it('moves guest favorites to the account on sign in', async () => {
    const { result, services } = setup();
    await waitFor(() => expect(result.current.auth.status).toBe('anonymous'));
    act(() => {
      result.current.favorites.toggle('p-02');
    });

    await act(() => result.current.auth.signIn({ email: 'cliente@shop.dev', password: 'Cliente123!' }));

    await waitFor(() => expect(result.current.favorites.isGuest).toBe(false));
    await waitFor(() => expect([...result.current.favorites.favorites]).toEqual(['p-02']));
    expect(await services.favorites.list('demo-customer')).toEqual(['p-02']);
  });
});
