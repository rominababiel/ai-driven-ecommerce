import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50',
  secondary: 'bg-surface text-foreground ring-1 ring-inset ring-border hover:bg-muted disabled:text-muted-foreground',
  ghost: 'text-muted-foreground hover:bg-muted disabled:text-muted-foreground',
  danger: 'bg-danger text-primary-foreground hover:opacity-90 disabled:opacity-50',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  );
}
