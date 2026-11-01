import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useCart } from '@/features/cart/state/CartContext';
import { QuantityStepper } from '@/features/cart/ui/QuantityStepper';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { formatPrice } from '@/shared/lib/money';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/buttonStyles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageSpinner } from '@/shared/ui/Spinner';
import { isInStock } from '../domain/product';
import { Rating } from './Rating';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  return <ProductDetail key={id} id={id} />;
}

function ProductDetail({ id }: { id: string }) {
  const { products } = useServices();
  const { add } = useCart();
  const loadProduct = useCallback(() => products.getById(id), [products, id]);
  const { status, data: product, error } = useAsync(loadProduct);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (status === 'loading') return <PageSpinner />;
  if (status === 'error') return <Alert tone="error">{error}</Alert>;
  if (!product) {
    return (
      <EmptyState
        title="Producto no encontrado"
        action={<Link to="/" className={buttonStyles({ variant: 'secondary' })}>Volver al catálogo</Link>}
      />
    );
  }

  const available = isInStock(product);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <img src={product.imageUrl} alt={product.name} className="aspect-square w-full rounded-3xl bg-zinc-100 object-cover" />
      <div className="flex flex-col gap-5">
        <Link to="/" className="text-sm text-zinc-500 hover:text-violet-700">← Catálogo</Link>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-violet-600">{product.category}</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">{product.name}</h1>
          <div className="mt-2"><Rating value={product.rating} /></div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900">{formatPrice(product.price)}</p>
        <p className="leading-relaxed text-zinc-600">{product.description}</p>
        <p className="text-sm text-zinc-500">{available ? `${product.stock} unidades disponibles` : 'Sin stock'}</p>
        {available && (
          <div className="flex flex-wrap items-center gap-4">
            <QuantityStepper label="Cantidad" value={quantity} max={product.stock} onChange={setQuantity} />
            <Button
              size="lg"
              onClick={() => {
                add(product, quantity);
                setAdded(true);
              }}
            >
              Agregar al carrito
            </Button>
          </div>
        )}
        {added && (
          <Alert tone="success">
            Producto agregado. <Link to="/cart" className="font-medium underline">Ver carrito</Link>
          </Alert>
        )}
      </div>
    </div>
  );
}
