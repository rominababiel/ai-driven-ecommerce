import { NavLink, Outlet } from 'react-router';
import { cn } from '@/shared/lib/cn';

const tabs = [
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/orders', label: 'Pedidos' },
];

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-violet-600">Administración</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Panel de control</h1>
        </div>
        <nav className="flex gap-1 rounded-lg bg-zinc-100 p-1" aria-label="Secciones de administración">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn('rounded-md px-4 py-1.5 text-sm font-medium', isActive ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900')
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
