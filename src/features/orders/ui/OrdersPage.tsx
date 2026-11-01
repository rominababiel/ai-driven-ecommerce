import { useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { formatPrice } from '@/shared/lib/money';
import { Alert } from '@/shared/ui/Alert';
import { buttonStyles } from '@/shared/ui/buttonStyles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageSpinner } from '@/shared/ui/Spinner';
import { formatOrderDate, shortOrderId } from './formatDate';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrdersPage() {
  const { user } = useAuth();
  const { orders } = useServices();
  const location = useLocation();
  const placedOrderId = (location.state as { placedOrderId?: string } | null)?.placedOrderId;
  const userId = user?.id ?? '';

  const loadOrders = useCallback(() => orders.listByCustomer(userId), [orders, userId]);
  const { status, data, error } = useAsync(loadOrders);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Mis pedidos</h1>
      {placedOrderId && <Alert tone="success">¡Gracias por tu compra! Pedido #{shortOrderId(placedOrderId)} confirmado.</Alert>}
      {status === 'loading' && <PageSpinner />}
      {status === 'error' && <Alert tone="error">{error}</Alert>}
      {status === 'success' && data?.length === 0 && (
        <EmptyState title="Aún no tienes pedidos" action={<Link to="/" className={buttonStyles()}>Explorar catálogo</Link>} />
      )}
      {data && data.length > 0 && (
        <ul className="flex flex-col gap-4">
          {data.map((order) => (
            <li key={order.id} className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900">Pedido #{shortOrderId(order.id)}</p>
                  <p className="text-xs text-zinc-500">{formatOrderDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <ul className="mt-4 flex flex-col gap-1 text-sm text-zinc-600">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex justify-between">
                    <span>{item.quantity} × {item.name}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-zinc-100 pt-3 text-right font-semibold text-zinc-900">Total {formatPrice(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
