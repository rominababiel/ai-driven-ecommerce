import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { AppProviders } from '@/app/AppProviders';
import { createLocalServices } from '@/services/createServices';
import type { Services } from '@/services/services';

interface RenderOptions {
  routes: RouteObject[];
  initialPath?: string;
  services?: Partial<Services>;
}

export function renderWithProviders({ routes, initialPath = '/', services }: RenderOptions) {
  const resolvedServices: Services = { ...createLocalServices(), ...services };
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const utils = render(
    <AppProviders services={resolvedServices}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...utils, router, services: resolvedServices };
}
