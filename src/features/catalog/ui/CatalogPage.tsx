import { useCallback, useMemo, useReducer } from 'react';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageSpinner } from '@/shared/ui/Spinner';
import { DEFAULT_FILTERS, filterProducts, getCategories } from '../domain/filters';
import { filtersReducer } from '../state/filtersReducer';
import { ProductCard } from './ProductCard';
import { ProductFiltersPanel } from './ProductFiltersPanel';

export function CatalogPage() {
  const { products } = useServices();
  const loadProducts = useCallback(() => products.list(), [products]);
  const { status, data, error, reload } = useAsync(loadProducts);
  const [filters, dispatch] = useReducer(filtersReducer, DEFAULT_FILTERS);

  const catalog = useMemo(() => data ?? [], [data]);
  const categories = useMemo(() => getCategories(catalog), [catalog]);
  const visible = useMemo(() => filterProducts(catalog, filters), [catalog, filters]);

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-zinc-900 px-8 py-12 text-white">
        <p className="text-sm font-medium uppercase tracking-widest text-yellow-300">Nueva temporada</p>
        <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Moda urbana y básicos esenciales para todos los días.</h1>
        <p className="mt-3 max-w-xl text-zinc-300">Filtra por prenda y precio, o pídele al asistente IA que te arme un outfit.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <ProductFiltersPanel filters={filters} categories={categories} dispatch={dispatch} />

        <section aria-live="polite" className="flex flex-col gap-4">
          {status === 'loading' && <PageSpinner />}
          {status === 'error' && (
            <Alert tone="error">
              {error}{' '}
              <Button variant="ghost" size="sm" onClick={reload}>
                Reintentar
              </Button>
            </Alert>
          )}
          {status === 'success' && (
            <>
              <p className="text-sm text-zinc-500">
                {visible.length} {visible.length === 1 ? 'producto' : 'productos'}
              </p>
              {visible.length === 0 ? (
                <EmptyState
                  title="Sin resultados"
                  description="No hay productos que coincidan con los filtros seleccionados."
                  action={<Button variant="secondary" onClick={() => dispatch({ type: 'reset' })}>Limpiar filtros</Button>}
                />
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
