import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CartPage } from '@/features/cart/ui/CartPage';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CatalogPage } from './CatalogPage';

const routes = [
  { path: '/', element: <CatalogPage /> },
  { path: '/cart', element: <CartPage /> },
];

describe('CatalogPage', () => {
  it('filters the catalog by search query', async () => {
    const user = userEvent.setup();
    renderWithProviders({ routes });

    expect(await screen.findByText('12 productos')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Buscar'), 'botas');

    expect(screen.getByText('1 producto')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Botas Chelsea de Cuero' })).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    renderWithProviders({ routes });

    await screen.findByText('12 productos');
    await user.click(within(screen.getByRole('group', { name: 'Categoría' })).getByLabelText('Abrigos'));

    expect(screen.getByText('3 productos')).toBeInTheDocument();
  });

  it('adds products to the cart', async () => {
    const user = userEvent.setup();
    const { router } = renderWithProviders({ routes });

    await user.click(await screen.findByRole('button', { name: 'Agregar Botas Chelsea de Cuero al carrito' }));
    await router.navigate('/cart');

    expect(await screen.findByRole('link', { name: 'Botas Chelsea de Cuero' })).toBeInTheDocument();
  });
});
