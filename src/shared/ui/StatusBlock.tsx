import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';
import { PRODUCT_GRID_COLUMNS } from './gridColumns';

interface StatusBlockProps {
  icon: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function StatusBlock({ icon, title, description, children }: StatusBlockProps) {
  return (
    <div className="flex flex-col items-center gap-3.5 border border-border px-6 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-muted">
        <Icon name={icon} className="text-[28px]" />
      </span>
      <span className="heading text-[28px]">{title}</span>
      {description && <span className="max-w-[300px] text-sm leading-normal text-muted-foreground">{description}</span>}
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function GridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div aria-label="Cargando productos" className={cn('grid gap-x-3 gap-y-6', className ?? PRODUCT_GRID_COLUMNS)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-2.5">
          <div className="aspect-[4/5] animate-pulse bg-muted" />
          <div className="h-3 w-3/4 animate-pulse bg-muted" />
          <div className="h-3 w-1/3 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}
