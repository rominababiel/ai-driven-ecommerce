import { Link } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { Icon } from '@/shared/ui/Icon';

export function NotFoundPage() {
  const { openChat } = useShopUI();
  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-start gap-4.5 px-4 pt-16 pb-24 lg:px-10">
      <span className="font-display text-[160px] leading-[0.8] font-extrabold tracking-[-0.02em] [font-stretch:62%] lg:text-[260px]">404</span>
      <h1 className="display text-[32px] leading-[0.92] lg:text-5xl">Esta página salió a correr y no volvió</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">El link puede estar roto o el producto ya no está. Lo que buscás seguro sigue por acá.</p>
      <div className="flex flex-wrap gap-2">
        <Link to="/" className="btn-primary h-12 text-sm no-underline">
          Volver al inicio
        </Link>
        <button type="button" onClick={() => openChat()} className="btn-ai">
          <Icon name="sparkle" fill />
          Decime qué buscás
        </button>
      </div>
    </section>
  );
}
