import { useCallback, useState } from 'react';
import { seedCatalog } from '@/features/catalog/application/seedCatalog';
import { DEMO_PRODUCTS } from '@/features/catalog/data/demoProducts';
import type { Product, ProductInput } from '@/features/catalog/domain/product';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { toErrorMessage } from '@/shared/lib/errors';
import { formatPrice } from '@/shared/lib/money';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageSpinner } from '@/shared/ui/Spinner';
import { ProductForm } from './ProductForm';

type Editor = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; product: Product };

export function AdminProductsPage() {
  const { products } = useServices();
  const loadProducts = useCallback(() => products.list(), [products]);
  const { status, data, error, reload } = useAsync(loadProducts);

  const [editor, setEditor] = useState<Editor>({ mode: 'closed' });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const runAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      setEditor({ mode: 'closed' });
      reload();
    } catch (cause) {
      setActionError(toErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (input: ProductInput) =>
    runAction(() => (editor.mode === 'edit' ? products.update(editor.product.id, input) : products.create(input)));

  const handleDelete = (product: Product) => {
    if (window.confirm(`¿Eliminar "${product.name}"?`)) void runAction(() => products.remove(product.id));
  };

  if (status === 'loading' && !data) return <PageSpinner />;
  if (status === 'error') return <Alert tone="error">{error}</Alert>;

  const catalog = data ?? [];

  return (
    <div className="flex flex-col gap-4">
      {actionError && <Alert tone="error">{actionError}</Alert>}

      {editor.mode === 'closed' ? (
        <div className="flex justify-end">
          <Button onClick={() => setEditor({ mode: 'create' })}>Nuevo producto</Button>
        </div>
      ) : (
        <ProductForm
          key={editor.mode === 'edit' ? editor.product.id : 'new'}
          product={editor.mode === 'edit' ? editor.product : undefined}
          submitting={busy}
          onSubmit={handleSave}
          onCancel={() => setEditor({ mode: 'closed' })}
        />
      )}

      {catalog.length === 0 ? (
        <EmptyState
          title="No hay productos"
          description="Crea tu primer producto o carga el catálogo de demostración."
          action={
            <Button variant="secondary" loading={busy} onClick={() => runAction(() => seedCatalog(products, DEMO_PRODUCTS))}>
              Cargar catálogo demo
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-zinc-200">
          <table className="w-full min-w-xl text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 text-right font-medium">Precio</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {catalog.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt="" className="size-10 rounded-lg bg-zinc-100 object-cover" />
                      <span className="font-medium text-zinc-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{product.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditor({ mode: 'edit', product })}>Editar</Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(product)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
