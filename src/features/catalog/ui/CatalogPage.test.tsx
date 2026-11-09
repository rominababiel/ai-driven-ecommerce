import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RootLayout } from '@/app/layout/RootLayout';
import { CartPage } from '@/features/cart/ui/CartPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CatalogPage } from './CatalogPage';

const routes = [
  {
    element: <RootLayout />,
    children: [
      { path: '/catalogo', element: <CatalogPage /> },
      { path: '/cart', element: <CartPage /> },
    ],
  },
];

describe('CatalogPage', () => {
  it('filters the catalog by search query from the URL', async () => {
    renderWithProviders({ routes, initialPath: '/catalogo?q=rompeviento' });

    expect(await screen.findByText('1 productos')).toBeInTheDocument();
    expect(screen.getAllByText('Rompeviento Faro').length).toBeGreaterThan(0);
  });

  it('filters by category chip', async () => {
    const user = userEvent.setup();
    renderWithProviders({ routes, initialPath: '/catalogo' });

    await screen.findByText('10 productos');
    await user.click(screen.getByRole('button', { name: 'Buzos y camperas' }));

    expect(await screen.findByText('2 productos')).toBeInTheDocument();
  });

  it('shows only discounted products in Sale', async () => {
    renderWithProviders({ routes, initialPath: '/catalogo?cat=Sale' });
    expect(await screen.findByText('2 productos')).toBeInTheDocument();
  });

  it('adds products to the cart with quick add', async () => {
    const user = userEvent.setup();
    const { router } = renderWithProviders({ routes, initialPath: '/catalogo' });

    await screen.findByText('10 productos');
    const [quickAdd] = screen.getAllByRole('button', { name: 'Agregar rápido' });
    await user.click(quickAdd);
    expect(await screen.findByText('¡Agregado al carrito!')).toBeInTheDocument();

    await router.navigate('/cart');
    expect(await screen.findByRole('button', { name: 'Finalizar compra' })).toBeInTheDocument();
  });
});
