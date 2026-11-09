import { useNavigate } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { formatPrice } from '@/shared/lib/money';
import { Drawer } from '@/shared/ui/Drawer';
import { Icon } from '@/shared/ui/Icon';
import { useCart } from '../state/CartContext';
import { CartLineItem } from './CartLineItem';
import { FreeShippingProgress } from './FreeShippingProgress';
import { useRemoveWithUndo } from './useRemoveWithUndo';

export function MiniCart() {
  const { panel, closePanel, justAddedId } = useShopUI();
  const { items, totals, setQuantity } = useCart();
  const removeWithUndo = useRemoveWithUndo();
  const navigate = useNavigate();

  const title = justAddedId ? (
    <span className="flex items-center gap-2 text-[15px] font-bold">
      <Icon name="check-circle" className="text-xl text-success" />
      ¡Agregado al carrito!
    </span>
  ) : (
    <span className="flex items-center gap-2 text-[15px] font-bold">
      <Icon name="handbag" className="text-xl" />
      Tu carrito ({totals.itemCount})
    </span>
  );

  return (
    <Drawer open={panel === 'miniCart'} side="right" label="Carrito" onClose={closePanel} title={title} className="w-full sm:w-[420px]">
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-muted">
            <Icon name="handbag" className="text-2xl" />
          </span>
          <span className="heading text-2xl">Tu carrito está vacío</span>
          <button type="button" onClick={() => navigate('/catalogo')} className="btn-primary h-11 text-sm">
            Ver lo nuevo
          </button>
        </div>
      ) : (
        <>
          <FreeShippingProgress subtotal={totals.subtotal} compact />
          <div className="flex-1 overflow-y-auto px-4">
            {items.map((item) => (
              <CartLineItem
                key={item.productId}
                item={item}
                variant="drawer"
                highlighted={justAddedId === item.productId}
                onQuantity={(quantity) => setQuantity(item.productId, quantity)}
                onRemove={() => removeWithUndo(item)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2.5 border-t border-border bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">Subtotal</span>
              <span className="font-mono text-[17px] font-medium">{formatPrice(totals.subtotal)}</span>
            </div>
            <button type="button" onClick={() => navigate('/checkout')} className="btn-primary">
              Finalizar compra
            </button>
            <button type="button" onClick={() => navigate('/cart')} className="btn-outline h-12">
              Ver carrito
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
