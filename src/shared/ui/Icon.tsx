import { cn } from '@/shared/lib/cn';

interface IconProps {
  name: string;
  fill?: boolean;
  className?: string;
}

export function Icon({ name, fill = false, className }: IconProps) {
  return <i aria-hidden="true" className={cn(fill ? 'ph-fill' : 'ph', `ph-${name}`, className)} />;
}
