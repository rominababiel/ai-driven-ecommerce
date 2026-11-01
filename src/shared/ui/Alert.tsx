import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const tones = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  info: 'bg-violet-50 text-violet-800 ring-violet-200',
};

export function Alert({ tone = 'info', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-lg px-4 py-3 text-sm ring-1 ring-inset', tones[tone])}>
      {children}
    </div>
  );
}
