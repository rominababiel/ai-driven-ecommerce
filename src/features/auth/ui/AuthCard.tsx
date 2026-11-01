import type { ReactNode } from 'react';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
