import { useEffect, useMemo, useReducer } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SALE_CATEGORY } from '@/app/layout/navigation';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/Alert';
import { Drawer } from '@/shared/ui/Drawer';
import { Icon } from '@/shared/ui/Icon';
import { GridSkeleton, StatusBlock } from '@/shared/ui/StatusBlock';
import { countActiveFilters, DEFAULT_FILTERS, filterProducts, getCategories, getColors, getPriceBounds, type SortOption } from '../domain/filters';
import { filtersReducer } from '../state/filtersReducer';
import { useCatalog } from '../state/useCatalog';
import { CatalogFilters } from './CatalogFilters';
import { ProductGrid } from './ProductCard';

const ALL = 'Todo';
const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Destacados',
  'price-asc': 'Menor precio',
  'price-desc': 'Mayor precio',
  rating: 'Mejor valorados',
};

export function CatalogPage() {
  const { status, data, error, reload } = useCatalog();
  const [params, setParams] = useSearchParams();
  const { panel, openPanel, closePanel, favorites, favoritesAreGuest, openChat } = useShopUI();
  const [filters, dispatch] = useReducer(filtersReducer, DEFAULT_FILTERS);

  const categoryParam = params.get('cat');
  const favoritesOnly = params.get('fav') === '1';
  const activeCategory = categoryParam ?? (favoritesOnly ? 'Favoritos' : ALL);

  useEffect(() => {
    dispatch({
      type: 'hydrate',
      filters: {
        query: params.get('q') ?? '',
        category: categoryParam && categoryParam !== SALE_CATEGORY ? categoryParam : null,
        onSaleOnly: categoryParam === SALE_CATEGORY,
      },
    });
  }, [params, categoryParam]);

  const catalog = useMemo(() => data ?? [], [data]);
  const categories = useMemo(() => getCategories(catalog), [catalog]);
  const colors = useMemo(() => getColors(catalog), [catalog]);
  const priceBounds = useMemo(() => getPriceBounds(catalog), [catalog]);
  const visible = useMemo(() => {
    const result = filterProducts(catalog, filters);
    return favoritesOnly ? result.filter((product) => favorites.has(product.id)) : result;
  }, [catalog, filters, favoritesOnly, favorites]);

  const selectCategory = (category: string) => setParams(category === ALL ? {} : { cat: category });
  const extraFilters = countActiveFilters(filters) - (filters.category ? 1 : 0) - (categoryParam === SALE_CATEGORY ? 1 : 0) - (filters.query ? 1 : 0);
  const clearAll = () => {
    dispatch({ type: 'reset' });
    setParams({});
  };

  const chips = [
    ...(filters.query ? [{ label: `“${filters.query}”`, remove: () => setParams(categoryParam ? { cat: categoryParam } : {}) }] : []),
    ...filters.colors.map((color) => ({ label: color, remove: () => dispatch({ type: 'toggleColor', color }) })),
    ...(filters.inStockOnly ? [{ label: 'Con stock', remove: () => dispatch({ type: 'setInStockOnly', value: false }) }] : []),
    ...(filters.maxPrice !== null ? [{ label: 'Precio', remove: () => dispatch({ type: 'setPriceRange', minPrice: null, maxPrice: null }) }] : []),
  ];

  const filterControls = <CatalogFilters filters={filters} dispatch={dispatch} colors={colors} priceBounds={priceBounds} />;

  return (
    <section className="page flex flex-col gap-4 pt-6 pb-16">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">Tienda / {activeCategory}</span>
        <div className="flex items-baseline gap-3">
          <h1 className="display text-[44px] lg:text-7xl">{activeCategory}</h1>
          <span aria-live="polite" className="font-mono text-[13px] font-medium text-muted-foreground">
            {visible.length} productos
          </span>
        </div>
      </div>

      {favoritesOnly && favoritesAreGuest && (
        <Alert tone="info">
          Tus favoritos están guardados solo en este dispositivo.{' '}
          <Link to="/login" state={{ from: '/catalogo?fav=1' }} className="font-semibold text-current underline underline-offset-2">
            Ingresá para no perderlos
          </Link>
        </Alert>
      )}

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {[ALL, ...categories, SALE_CATEGORY].map((category) => {
          const selected = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => selectCategory(category)}
              className={cn('h-10 flex-none cursor-pointer rounded-full border px-3.5 text-[13px] font-medium', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground', category === SALE_CATEGORY && !selected && 'text-sale')}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-y border-border py-2">
        <div className="no-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto">
          <button type="button" onClick={() => openPanel('filters')} className="btn h-10 flex-none rounded-xs border border-foreground px-3.5 text-[13px] lg:hidden">
            <Icon name="sliders-horizontal" className="text-[17px]" />
            Filtrar{extraFilters > 0 ? ` (${extraFilters})` : ''}
          </button>
          {chips.map((chip) => (
            <button key={chip.label} type="button" onClick={chip.remove} className="flex h-8 flex-none cursor-pointer items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-medium">
              {chip.label}
              <Icon name="x" className="text-xs" />
            </button>
          ))}
        </div>
        <label className="flex flex-none items-center gap-1.5 text-[13px] font-medium">
          <span className="hidden text-muted-foreground lg:inline">Ordenar:</span>
          <select value={filters.sort} onChange={(event) => dispatch({ type: 'setSort', sort: event.target.value as SortOption })} aria-label="Ordenar" className="h-10 cursor-pointer bg-transparent text-[13px] font-semibold">
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label="Filtros" className="sticky top-24 hidden lg:block">
          {filterControls}
        </aside>
        <div aria-live="polite">
          {status === 'loading' && <GridSkeleton count={6} />}
          {status === 'error' && (
            <Alert tone="error">
              {error}{' '}
              <button type="button" onClick={reload} className="font-semibold underline">
                Reintentar
              </button>
            </Alert>
          )}
          {status === 'success' && visible.length > 0 && <ProductGrid products={visible} />}
          {status === 'success' && visible.length === 0 && (
            <StatusBlock icon="funnel-simple" title={catalog.length === 0 ? 'Todavía no hay productos' : 'Nada con estos filtros'} description="Probá sacar alguno o pedile al asistente algo parecido.">
              <button type="button" onClick={clearAll} className="btn-primary h-11 text-sm">
                Limpiar filtros
              </button>
              <button type="button" onClick={() => openChat()} className="btn-ai h-11">
                <Icon name="sparkle" fill />
                Preguntar
              </button>
            </StatusBlock>
          )}
        </div>
      </div>

      <Drawer open={panel === 'filters'} side="left" label="Filtros" onClose={closePanel} className="w-[88%] max-w-[380px]" title={<span className="heading text-2xl">Filtrar</span>}>
        <div className="flex-1 overflow-y-auto px-4 py-5">{filterControls}</div>
        <div className="flex gap-2 border-t border-border px-4 py-3">
          <button type="button" onClick={clearAll} className="btn-link h-13 px-4">
            Limpiar
          </button>
          <button type="button" onClick={closePanel} className="btn-primary flex-1">
            Ver {visible.length} productos
          </button>
        </div>
      </Drawer>
    </section>
  );
}
