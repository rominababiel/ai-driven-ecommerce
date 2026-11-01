import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import type { Services } from '@/services/services';
import { AppProviders } from './AppProviders';
import { routes } from './routes';

export function App({ services }: { services: Services }) {
  const [router] = useState(() => createBrowserRouter(routes));

  return (
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
