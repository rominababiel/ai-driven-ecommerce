import { cn } from '@/shared/lib/cn';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../domain/order';

const tones: Record<OrderStatus, string> = {
  PENDING: 'bg-zinc-100 text-zinc-700',
  PAID: 'bg-violet-100 text-violet-700',
  SHIPPED: 'bg-sky-100 text-sky-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', tones[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
