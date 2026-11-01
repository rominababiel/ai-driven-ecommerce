import { Link } from 'react-router';
import { useCart } from '@/features/cart/state/CartContext';
import { formatPrice } from '@/shared/lib/money';
import { Button } from '@/shared/ui/Button';
import { isInStock, type Product } from '../domain/product';
import { Rating } from './Rating';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const available = isInStock(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!available && (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-white">Agotado</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-violet-600">{product.category}</span>
          <Rating value={product.rating} />
        </div>
        <Link to={`/products/${product.id}`} className="font-medium text-zinc-900 hover:text-violet-700">
          <h3>{product.name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-zinc-900">{formatPrice(product.price)}</span>
          <Button size="sm" disabled={!available} onClick={() => add(product)} aria-label={`Agregar ${product.name} al carrito`}>
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
