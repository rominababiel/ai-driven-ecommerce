import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/state/AuthProvider';
import { CartProvider } from '@/features/cart/state/CartProvider';
import { ServicesContext } from '@/services/ServicesContext';
import type { Services } from '@/services/services';

export function AppProviders({ services, children }: { services: Services; children: ReactNode }) {
  return (
    <ServicesContext value={services}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ServicesContext>
  );
}
