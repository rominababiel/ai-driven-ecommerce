import { Link, NavLink, useNavigate } from 'react-router';
import { hasRole } from '@/features/auth/domain/user';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useCart } from '@/features/cart/state/CartContext';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/buttonStyles';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-md px-3 py-2 text-sm font-medium', isActive ? 'text-violet-700' : 'text-zinc-600 hover:text-zinc-900');

export function Header() {
  const { status, user, signOut } = useAuth();
  const { totals } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900">
          <span className="rounded-md bg-yellow-300 px-1.5 py-0.5 text-sm">M5</span>
          Moda
        </Link>

        <nav className="flex flex-1 items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={navLinkClass}>Catálogo</NavLink>
          {user && <NavLink to="/orders" className={navLinkClass}>Pedidos</NavLink>}
          {hasRole(user, 'admin') && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>

        <Link to="/cart" className={buttonStyles({ variant: 'ghost', className: 'relative' })} aria-label={`Carrito, ${totals.itemCount} artículos`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden>
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="17" cy="20" r="1" />
          </svg>
          {totals.itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-xs font-semibold text-white">
              {totals.itemCount}
            </span>
          )}
        </Link>

        {status === 'authenticated' ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-zinc-500 md:inline">{user.email}</span>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>Salir</Button>
          </div>
        ) : (
          status === 'anonymous' && <Link to="/login" className={buttonStyles({ size: 'sm' })}>Entrar</Link>
        )}
      </div>
    </header>
  );
}
