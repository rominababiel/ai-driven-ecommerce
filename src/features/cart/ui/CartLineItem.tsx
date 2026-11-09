import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { Icon } from '@/shared/ui/Icon';
import { describeItem, type CartItem } from '../domain/cart';
import { QuantityStepper } from './QuantityStepper';

interface CartLineItemProps {
  item: CartItem;
  onQuantity(quantity: number): void;
  onRemove(): void;
  variant?: 'page' | 'drawer';
  highlighted?: boolean;
}

export function CartLineItem({ item, onQuantity, onRemove, variant = 'page', highlighted = false }: CartLineItemProps) {
  const drawer = variant === 'drawer';
  return (
    <div className={cn('grid gap-4 border-b border-border transition-colors duration-500', drawer ? 'grid-cols-[72px_1fr] gap-3 py-3.5' : 'grid-cols-[88px_1fr] py-4 lg:grid-cols-[112px_1fr]', highlighted && 'bg-ai-soft/50')}>
      <Link to={`/products/${item.productId}`} className="block aspect-[4/5] bg-photo">
        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex justify-between gap-2">
          <span className={cn('leading-tight font-semibold uppercase', drawer ? 'text-xs' : 'text-[13px]')}>{item.name}</span>
          <button type="button" onClick={onRemove} aria-label={`Eliminar ${item.name}`} className="-mt-2 -mr-2 grid size-9 flex-none cursor-pointer place-items-center">
            <Icon name="trash" className={drawer ? 'text-base' : 'text-lg'} />
          </button>
        </div>
        <span className={cn('text-muted-foreground', drawer ? 'text-[11px]' : 'text-xs')}>{describeItem(item)}</span>
        <div className="mt-auto flex items-end justify-between gap-2">
          <QuantityStepper value={item.quantity} max={item.stock} onChange={onQuantity} size={drawer ? 'sm' : 'md'} bordered={drawer ? 'soft' : 'strong'} />
          <span className={cn('font-mono font-medium', drawer ? 'text-sm' : 'text-[15px]')}>{formatPrice(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
