import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon } from './Icon';

const tones = {
  error: { className: 'bg-danger-soft text-danger', icon: 'x-circle' },
  success: { className: 'bg-success-soft text-success', icon: 'check-circle' },
  info: { className: 'bg-ai-soft text-ai-soft-foreground', icon: 'sparkle' },
};

export function Alert({ tone = 'info', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-2.5 px-3.5 py-3 text-sm leading-snug', tones[tone].className)}>
      <Icon name={tones[tone].icon} fill className="flex-none text-xl" />
      <div>{children}</div>
    </div>
  );
}
