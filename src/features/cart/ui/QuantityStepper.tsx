import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/Icon';

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange(value: number): void;
  size?: 'sm' | 'md' | 'lg';
  bordered?: 'strong' | 'soft';
}

const SIZES = { sm: 'size-[34px] text-xs', md: 'size-10 text-sm', lg: 'h-[52px] w-11 text-base' };

export function QuantityStepper({ value, max, onChange, size = 'md', bordered = 'strong' }: QuantityStepperProps) {
  return (
    <div className={cn('flex flex-none items-center rounded-xs border', bordered === 'strong' ? 'border-border-strong' : 'border-border')}>
      <button type="button" aria-label="Restar" disabled={value <= 1} onClick={() => onChange(value - 1)} className={cn('grid cursor-pointer place-items-center disabled:cursor-default disabled:text-border-strong', SIZES[size])}>
        <Icon name="minus" />
      </button>
      <span aria-live="polite" className="w-7 text-center font-mono text-sm font-medium">
        {value}
      </span>
      <button type="button" aria-label="Sumar" disabled={value >= max} onClick={() => onChange(value + 1)} className={cn('grid cursor-pointer place-items-center disabled:cursor-default disabled:text-border-strong', SIZES[size])}>
        <Icon name="plus" />
      </button>
    </div>
  );
}
