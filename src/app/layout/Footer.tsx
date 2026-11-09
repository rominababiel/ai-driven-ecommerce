import { Link } from 'react-router';
import { Icon } from '@/shared/ui/Icon';

export function Footer() {
  return (
    <footer className="bg-inverse text-inverse-foreground">
      <div className="page flex flex-col gap-10 pt-12 pb-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-3.5 md:col-span-2">
            <span className="display text-4xl">Sumate. 10% off en tu primera compra.</span>
            <form onSubmit={(event) => event.preventDefault()} className="flex border-b border-inverse-border">
              <input placeholder="Tu email" aria-label="Email" type="email" className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-inverse-muted" />
              <button type="submit" className="flex h-12 cursor-pointer items-center gap-1.5 text-sm font-semibold">
                Suscribirme
                <Icon name="arrow-right" />
              </button>
            </form>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-inverse-muted uppercase">Ayuda</span>
            <span>Envíos</span>
            <span>Cambios y devoluciones</span>
            <Link to="/orders" className="text-inherit no-underline hover:underline">Mis pedidos</Link>
            <span>Botón de arrepentimiento</span>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-inverse-muted uppercase">Outfit</span>
            <span>Quiénes somos</span>
            <span>Locales</span>
            <span>Instagram</span>
            <span>TikTok</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-inverse-border pt-5 font-mono text-[11px] text-inverse-muted">
          <span>© 2026 Outfit · Defensa de las y los consumidores</span>
          <span>Mercado Pago · Visa · Mastercard · Amex</span>
        </div>
      </div>
    </footer>
  );
}
