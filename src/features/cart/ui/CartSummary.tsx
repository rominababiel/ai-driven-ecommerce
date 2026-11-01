import type { ReactNode } from 'react';
import { formatPrice } from '@/shared/lib/money';
import { FREE_SHIPPING_THRESHOLD, type CartTotals } from '../domain/pricing';

export function CartSummary({ totals, children }: { totals: CartTotals; children?: ReactNode }) {
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - totals.subtotal;

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200" aria-label="Resumen del pedido">
      <h2 className="text-lg font-semibold text-zinc-900">Resumen</h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-zinc-600">
          <dt>Subtotal ({totals.itemCount} artículos)</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-zinc-600">
          <dt>Envío</dt>
          <dd>{totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {totals.subtotal > 0 && remainingForFreeShipping > 0 && (
        <p className="text-xs text-zinc-500">Agrega {formatPrice(remainingForFreeShipping)} más para envío gratis.</p>
      )}
      {children}
    </section>
  );
}
