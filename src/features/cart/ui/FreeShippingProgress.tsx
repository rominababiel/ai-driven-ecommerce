import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { Icon } from '@/shared/ui/Icon';
import { FREE_SHIPPING_THRESHOLD } from '../domain/pricing';

export function FreeShippingProgress({ subtotal, compact = false }: { subtotal: number; compact?: boolean }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className={cn('flex flex-col bg-muted', compact ? 'gap-2 px-4 py-3.5' : 'gap-2.5 p-4')}>
      <span className={cn('flex items-center gap-2 leading-snug font-medium', compact ? 'text-[13px]' : 'text-sm')}>
        {!compact && <Icon name={remaining ? 'truck' : 'confetti'} className="text-xl" />}
        {remaining ? `Te faltan ${formatPrice(remaining)} para el envío gratis` : '¡Tenés envío gratis!'}
      </span>
      <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso hacia el envío gratis" className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', remaining ? 'bg-primary' : 'bg-success')} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
