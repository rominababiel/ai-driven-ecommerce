import { useEffect, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';

interface DrawerProps {
  open: boolean;
  side: 'left' | 'right';
  label: string;
  title: ReactNode;
  onClose(): void;
  className?: string;
  children: ReactNode;
}

export function Drawer({ open, side, label, title, onClose, className, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn('fixed inset-0 z-40 bg-overlay transition-opacity duration-300 ease-out', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />
      <aside
        aria-label={label}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col bg-background transition-transform duration-300 ease-out',
          side === 'left' ? 'left-0' : 'right-0 shadow-3',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-[105%]' : 'translate-x-[105%]',
          className,
        )}
      >
        <div className="flex min-h-14 items-center justify-between border-b border-border py-1 pr-1.5 pl-4">
          {title}
          <button type="button" onClick={onClose} aria-label="Cerrar" className="icon-btn">
            <Icon name="x" className="text-[22px]" />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
