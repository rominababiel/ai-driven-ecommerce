import { Link, useNavigate } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { formatPrice } from '@/shared/lib/money';
import { Icon } from '@/shared/ui/Icon';
import { StatusBlock } from '@/shared/ui/StatusBlock';
import { calculateTotals } from '../domain/pricing';
import { useCart } from '../state/CartContext';
import { CartLineItem } from './CartLineItem';
import { FreeShippingProgress } from './FreeShippingProgress';
import { useRemoveWithUndo } from './useRemoveWithUndo';

export function CartPage() {
  const { items, totals, setQuantity } = useCart();
  const { openChat, justAddedId } = useShopUI();
  const removeWithUndo = useRemoveWithUndo();
  const navigate = useNavigate();
  const transferTotal = calculateTotals(items, { delivery: 'HOME', payment: 'TRANSFER' }).total;

  return (
    <section className="page flex flex-col gap-6 pt-7 pb-16">
      <h1 className="display text-[44px] lg:text-7xl">
        Carrito <span className="font-mono text-base font-medium tracking-normal text-muted-foreground normal-case">({totals.itemCount})</span>
      </h1>
      {items.length === 0 ? (
        <StatusBlock icon="handbag" title="Tu carrito está vacío" description="Arrancá por lo nuevo o pedile al asistente que te arme un look.">
          <Link to="/catalogo" className="btn-primary h-11 text-sm no-underline">
            Ver lo nuevo
          </Link>
          <button type="button" onClick={() => openChat()} className="btn-ai h-11">
            <Icon name="sparkle" fill />
            Armame un look
          </button>
        </StatusBlock>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-5">
            <FreeShippingProgress subtotal={totals.subtotal} />
            <div>
              {items.map((item) => (
                <CartLineItem
                  key={item.productId}
                  item={item}
                  highlighted={justAddedId === item.productId}
                  onQuantity={(quantity) => setQuantity(item.productId, quantity)}
                  onRemove={() => removeWithUndo(item)}
                />
              ))}
            </div>
          </div>
          <aside className="flex flex-col gap-3.5 border border-border bg-surface p-5 lg:sticky lg:top-24">
            <span className="heading text-2xl">Resumen</span>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-mono">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span className="font-mono">{totals.shipping ? formatPrice(totals.shipping) : 'Gratis'}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3.5">
              <span className="text-[15px] font-bold">Total</span>
              <span className="font-mono text-xl font-medium">{formatPrice(totals.total)}</span>
            </div>
            <span className="text-xs text-muted-foreground">o {formatPrice(transferTotal)} con transferencia (15% off)</span>
            <button type="button" onClick={() => navigate('/checkout')} className="btn-primary h-[54px]">
              Finalizar compra
            </button>
            <Link to="/catalogo" className="btn-link h-11 text-foreground">
              Seguir comprando
            </Link>
            <span className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <Icon name="lock-simple" />
              Mercado Pago · Visa · Master · Amex
            </span>
          </aside>
        </div>
      )}
    </section>
  );
}
