import { useCallback, useState } from 'react';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/features/orders/domain/order';
import { formatOrderDate } from '@/features/orders/ui/formatDate';
import { shortOrderId } from '@/features/orders/domain/order';
import { OrderStatusBadge } from '@/features/orders/ui/OrderStatusBadge';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { toErrorMessage } from '@/shared/lib/errors';
import { formatPrice } from '@/shared/lib/money';
import { Alert } from '@/shared/ui/Alert';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageSpinner } from '@/shared/ui/Spinner';

export function AdminOrdersPage() {
  const { orders } = useServices();
  const loadOrders = useCallback(() => orders.listAll(), [orders]);
  const { status, data, error, reload } = useAsync(loadOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const changeStatus = async (order: Order, next: OrderStatus) => {
    setUpdatingId(order.id);
    setActionError(null);
    try {
      await orders.updateStatus(order.id, next);
      reload();
    } catch (cause) {
      setActionError(toErrorMessage(cause));
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === 'loading' && !data) return <PageSpinner />;
  if (status === 'error') return <Alert tone="error">{error}</Alert>;
  if (!data || data.length === 0) return <EmptyState title="Todavía no hay pedidos" />;

  return (
    <div className="flex flex-col gap-4">
      {actionError && <Alert tone="error">{actionError}</Alert>}
      <div className="overflow-x-auto rounded-md bg-surface ring-1 ring-border">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-mono text-xs">#{shortOrderId(order.id)}</td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{order.shipping.fullName}</p>
                  <p className="text-xs text-muted-foreground">{order.shipping.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatOrderDate(order.createdAt)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <select
                      aria-label={`Cambiar estado del pedido ${shortOrderId(order.id)}`}
                      className="h-8 rounded-md border border-border bg-surface px-2 text-xs"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                    >
                      {ORDER_STATUSES.map((value) => (
                        <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
