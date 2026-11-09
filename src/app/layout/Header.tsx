import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useAuth } from '@/features/auth/state/AuthContext';
import { hasRole } from '@/features/auth/domain/user';
import { useCart } from '@/features/cart/state/CartContext';
import { FREE_SHIPPING_THRESHOLD, INSTALLMENTS } from '@/features/cart/domain/pricing';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { Icon } from '@/shared/ui/Icon';
import { DESKTOP_NAV } from './navigation';

function CartButton() {
  const { totals } = useCart();
  const { openPanel } = useShopUI();
  return (
    <button type="button" onClick={() => openPanel('miniCart')} aria-label={`Carrito, ${totals.itemCount} productos`} className="icon-btn relative">
      <Icon name="handbag" className="text-[23px]" />
      {totals.itemCount > 0 && (
        <span className="absolute top-1.5 right-1 h-[17px] min-w-[17px] rounded-full bg-primary px-1 text-center font-mono text-[10px] leading-[17px] font-semibold text-primary-foreground">
          {totals.itemCount}
        </span>
      )}
    </button>
  );
}

function SearchField() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/catalogo?q=${encodeURIComponent(query.trim())}` : '/catalogo');
  };
  return (
    <form role="search" onSubmit={submit} className="mr-2 flex h-10 w-[220px] items-center gap-2 rounded-full border border-border px-3.5 focus-within:border-foreground">
      <Icon name="magnifying-glass" className="text-[17px]" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar"
        aria-label="Buscar productos"
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}

export function PromoBar() {
  return (
    <div className="bg-inverse px-3 py-2.5 text-center font-mono text-[11px] leading-none font-medium tracking-[0.04em] text-inverse-foreground uppercase">
      Envío gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)} · {INSTALLMENTS} cuotas sin interés
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('font-display font-extrabold tracking-[0.14em] stretch-expanded text-foreground no-underline', className)}>
      OUTFIT
    </Link>
  );
}

export function Header() {
  const { user } = useAuth();
  const { openPanel } = useShopUI();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-1.5 lg:hidden">
        <button type="button" onClick={() => openPanel('menu')} aria-label="Menú" className="icon-btn">
          <Icon name="list" className="text-2xl" />
        </button>
        <Logo className="text-xl" />
        <div className="flex justify-end">
          <button type="button" onClick={() => navigate('/catalogo')} aria-label="Buscar" className="icon-btn">
            <Icon name="magnifying-glass" className="text-[22px]" />
          </button>
          <CartButton />
        </div>
      </div>

      <div className="page hidden h-[72px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 lg:grid">
        <nav aria-label="Principal" className="flex gap-7 overflow-hidden text-[13px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase">
          {DESKTOP_NAV.map((link) => (
            <Link key={link.label} to={link.to} className={cn('no-underline hover:underline', link.highlight ? 'text-sale' : 'text-foreground')}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Logo className="text-2xl tracking-[0.16em]" />
        <div className="flex items-center justify-end gap-1">
          <SearchField />
          {hasRole(user, 'admin') && (
            <Link to="/admin" aria-label="Panel admin" className="icon-btn">
              <Icon name="gear-six" className="text-[22px]" />
            </Link>
          )}
          <Link to={user ? '/orders' : '/login'} aria-label="Mi cuenta" className="icon-btn">
            <Icon name="user" className="text-[22px]" />
          </Link>
          <Link to={`/catalogo?fav=1`} aria-label="Favoritos" className="icon-btn">
            <Icon name="heart" className="text-[22px]" />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
