import { cn } from '@/shared/lib/cn';

const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-10 border-3' };

export function Spinner({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn('inline-block animate-spin rounded-full border-current border-t-transparent', sizes[size], className)}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-64 items-center justify-center text-violet-600">
      <Spinner size="lg" />
    </div>
  );
}
