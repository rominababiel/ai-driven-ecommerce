import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {description && <p className="max-w-sm text-sm text-zinc-500">{description}</p>}
      {action}
    </div>
  );
}
