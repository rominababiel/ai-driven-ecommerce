import { Link } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useAuth } from '@/features/auth/state/AuthContext';
import { hasRole } from '@/features/auth/domain/user';
import { cn } from '@/shared/lib/cn';
import { Drawer } from '@/shared/ui/Drawer';
import { Icon } from '@/shared/ui/Icon';
import { MOBILE_NAV } from './navigation';

export function MobileMenu() {
  const { panel, closePanel, openChat } = useShopUI();
  const { user } = useAuth();

  return (
    <Drawer
      open={panel === 'menu'}
      side="left"
      label="Menú"
      onClose={closePanel}
      className="w-[86%] max-w-[360px]"
      title={<span className="font-display text-lg font-extrabold tracking-[0.14em] stretch-expanded">OUTFIT</span>}
    >
      <nav aria-label="Categorías" className="flex flex-col overflow-y-auto px-4 py-2">
        {MOBILE_NAV.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={cn('heading flex h-14 items-center justify-between border-b border-border text-[26px] no-underline', link.highlight ? 'text-sale' : 'text-foreground')}
          >
            {link.label}
            <Icon name="caret-right" className="text-base" />
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
        <Link to={user ? '/orders' : '/login'} className="flex h-12 items-center gap-2.5 text-[15px] font-medium text-foreground no-underline">
          <Icon name="user" className="text-xl" />
          {user ? `Mi cuenta · ${user.email}` : 'Ingresar o crear cuenta'}
        </Link>
        <Link to="/orders" className="flex h-12 items-center gap-2.5 text-[15px] font-medium text-foreground no-underline">
          <Icon name="package" className="text-xl" />
          Mis pedidos
        </Link>
        {hasRole(user, 'admin') && (
          <Link to="/admin" className="flex h-12 items-center gap-2.5 text-[15px] font-medium text-foreground no-underline">
            <Icon name="gear-six" className="text-xl" />
            Panel admin
          </Link>
        )}
        <button type="button" onClick={() => openChat()} className="btn-ai w-full">
          <Icon name="sparkle" fill />
          Asistente de moda
        </button>
      </div>
    </Drawer>
  );
}
