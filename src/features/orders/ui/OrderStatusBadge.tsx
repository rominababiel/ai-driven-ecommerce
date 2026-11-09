import { cn } from '@/shared/lib/cn';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../domain/order';

const STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-info-soft text-info',
  PAID: 'bg-info-soft text-info',
  SHIPPED: 'bg-warning-soft text-warning',
  DELIVERED: 'bg-success-soft text-success',
  CANCELLED: 'bg-danger-soft text-danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs leading-none font-medium', STYLES[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
