import { Link } from 'react-router';
import { Icon } from '@/shared/ui/Icon';
import { Logo } from './Header';

export function CheckoutHeader() {
  return (
    <div className="border-b border-border bg-background">
      <div className="page flex h-15 items-center justify-between">
        <Link to="/cart" className="flex h-11 items-center gap-1.5 text-[13px] font-medium text-foreground no-underline">
          <Icon name="arrow-left" className="text-lg" />
          Carrito
        </Link>
        <Logo className="text-xl" />
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="lock-simple" className="text-base" />
          Compra segura
        </span>
      </div>
    </div>
  );
}
