import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/features/auth/state/AuthContext';
import { describeItem } from '@/features/cart/domain/cart';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { Alert } from '@/shared/ui/Alert';
import { Icon } from '@/shared/ui/Icon';
import { StatusBlock } from '@/shared/ui/StatusBlock';
import { PAYMENT_LABELS, shortOrderId, type Order, type OrderStatus } from '../domain/order';
import { formatOrderDate } from './formatDate';
import { OrderStatusBadge } from './OrderStatusBadge';

const TRACKING: Array<{ label: string; reachedBy: OrderStatus[] }> = [
  { label: 'Confirmado', reachedBy: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'] },
  { label: 'Preparando', reachedBy: ['PAID', 'SHIPPED', 'DELIVERED'] },
  { label: 'En camino', reachedBy: ['SHIPPED', 'DELIVERED'] },
  { label: 'Entregado', reachedBy: ['DELIVERED'] },
];

function OrderCard({ order, open, onToggle }: { order: Order; open: boolean; onToggle(): void }) {
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const cancelled = order.status === 'CANCELLED';

  return (
    <div className="border border-border bg-surface">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex w-full cursor-pointer flex-wrap items-center gap-3.5 p-4 text-left">
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-medium">#{shortOrderId(order.id)}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatOrderDate(order.createdAt)} · {units} productos · <span className="font-mono text-foreground">{formatPrice(order.total)}</span>
          </span>
        </div>
        <Icon name={open ? 'caret-up' : 'caret-down'} className="text-lg" />
      </button>
      {open && (
        <div className="flex animate-rise flex-col gap-5 border-t border-border px-4 py-4.5">
          {cancelled ? (
            <div className="flex gap-2.5 bg-danger-soft px-3.5 py-3 text-[13px] text-danger">
              <Icon name="info" fill className="flex-none text-lg" />
              Este pedido fue cancelado.
            </div>
          ) : (
            <ol className="grid grid-cols-4 gap-1">
              {TRACKING.map((step) => {
                const reached = step.reachedBy.includes(order.status);
                return (
                  <li key={step.label} className="flex flex-col gap-2">
                    <div className={cn('h-[3px]', reached ? 'bg-foreground' : 'bg-border')} />
                    <span className={cn('text-[11px] leading-tight font-semibold', reached ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <div className="flex flex-col gap-2.5">
            {order.items.map((item) => (
              <div key={item.productId} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold uppercase">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{describeItem({ size: item.size, color: null })}</span>
                </div>
                <span className="font-mono text-[13px] font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-4 text-[13px] leading-normal sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Entrega</span>
              {order.delivery === 'PICKUP' ? 'Retiro en local' : `${order.shipping.address}, ${order.shipping.city}`}
            </div>
            <div className="flex flex-col gap-1">
              <span className="eyebrow">Pago</span>
              {order.payment ? PAYMENT_LABELS[order.payment] : 'Tarjeta'}
              {order.discount ? ` · ahorraste ${formatPrice(order.discount)}` : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  const { user, signOut } = useAuth();
  const { orders } = useServices();
  const userId = user?.id ?? '';
  const load = useCallback(() => orders.listByCustomer(userId), [orders, userId]);
  const { status, data, error } = useAsync(load);
  const [openId, setOpenId] = useState<string | null>(null);
  const firstId = data?.[0]?.id ?? null;
  const expanded = openId ?? firstId;

  return (
    <section className="mx-auto flex max-w-[880px] flex-col gap-5 px-4 pt-7 pb-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="display text-[44px] lg:text-7xl">Mis pedidos</h1>
        <button type="button" onClick={() => void signOut()} className="flex h-10 cursor-pointer items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
          <Icon name="sign-out" />
          Salir
        </button>
      </div>
      {status === 'loading' && <div className="h-24 animate-pulse bg-muted" />}
      {status === 'error' && <Alert tone="error">{error}</Alert>}
      {status === 'success' && data?.length === 0 && (
        <StatusBlock icon="package" title="Todavía no tenés pedidos" description="Cuando compres algo, lo vas a poder seguir desde acá.">
          <Link to="/catalogo" className="btn-primary h-11 text-sm no-underline">Ver lo nuevo</Link>
        </StatusBlock>
      )}
      <div className="flex flex-col gap-3">
        {data?.map((order) => (
          <OrderCard key={order.id} order={order} open={expanded === order.id} onToggle={() => setOpenId(expanded === order.id ? '' : order.id)} />
        ))}
      </div>
    </section>
  );
}
