import { Link } from 'react-router';
import { formatPrice } from '@/shared/lib/money';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/buttonStyles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useCart } from '../state/CartContext';
import { CartSummary } from './CartSummary';
import { QuantityStepper } from './QuantityStepper';

export function CartPage() {
  const { items, totals, setQuantity, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Tu carrito está vacío"
        description="Explora el catálogo y agrega productos."
        action={<Link to="/" className={buttonStyles()}>Ir al catálogo</Link>}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Carrito</h1>
          <Button variant="ghost" size="sm" onClick={clear}>
            Vaciar carrito
          </Button>
        </div>
        <ul className="divide-y divide-zinc-200 rounded-2xl bg-white ring-1 ring-zinc-200">
          {items.map((item) => (
            <li key={item.productId} className="flex flex-wrap items-center gap-4 p-4">
              <img src={item.imageUrl} alt="" className="size-20 rounded-xl bg-zinc-100 object-cover" />
              <div className="min-w-40 flex-1">
                <Link to={`/products/${item.productId}`} className="font-medium text-zinc-900 hover:text-violet-700">
                  {item.name}
                </Link>
                <p className="text-sm text-zinc-500">{formatPrice(item.price)} c/u</p>
              </div>
              <QuantityStepper
                label={`Cantidad de ${item.name}`}
                value={item.quantity}
                max={item.stock}
                onChange={(quantity) => setQuantity(item.productId, quantity)}
              />
              <p className="w-24 text-right font-semibold text-zinc-900">{formatPrice(item.price * item.quantity)}</p>
              <Button variant="ghost" size="sm" onClick={() => remove(item.productId)} aria-label={`Quitar ${item.name}`}>
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <CartSummary totals={totals}>
        <Link to="/checkout" className={buttonStyles({ size: 'lg' })}>
          Ir a pagar
        </Link>
      </CartSummary>
    </div>
  );
}
