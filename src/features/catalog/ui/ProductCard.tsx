import { useState } from 'react';
import { Link } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useAddToCart } from '@/app/shop/useAddToCart';
import { useToggleFavorite } from '@/app/shop/useToggleFavorite';
import { TRANSFER_DISCOUNT_RATE } from '@/features/cart/domain/pricing';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { PRODUCT_GRID_COLUMNS } from '@/shared/ui/gridColumns';
import { Icon } from '@/shared/ui/Icon';
import { isLowStock, type Product } from '../domain/product';
import { productBadge } from './productBadge';

export function ProductCard({ product }: { product: Product }) {
  const { favorites } = useShopUI();
  const toggleFavorite = useToggleFavorite();
  const addToCart = useAddToCart();
  const [pop, setPop] = useState(false);
  const out = product.stock === 0;
  const low = isLowStock(product);
  const badge = productBadge(product);
  const isFavorite = favorites.has(product.id);
  const href = `/products/${product.id}`;

  const onFavorite = () => {
    toggleFavorite(product.id);
    setPop(true);
    window.setTimeout(() => setPop(false), 160);
  };

  return (
    <article className="group flex min-w-0 flex-col gap-2.5">
      <div className="relative aspect-[4/5] overflow-hidden bg-photo">
        <Link to={href} aria-label={product.name} className="absolute inset-0">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} loading="lazy" className={cn('absolute inset-0 size-full object-cover transition-opacity duration-300', product.hoverImageUrl && !out && 'group-hover:opacity-0')} />
          )}
          {product.hoverImageUrl && !out && (
            <img src={product.hoverImageUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
          {out && <span className="absolute inset-0 bg-background/45" />}
        </Link>
        {badge && <span className={cn('pointer-events-none absolute top-2 left-2 border px-[7px] py-[5px] text-[10px] leading-none font-semibold tracking-[0.06em] uppercase', badge.className)}>{badge.label}</span>}
        <button
          type="button"
          onClick={onFavorite}
          aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
          aria-pressed={isFavorite}
          className="absolute top-1 right-1 grid size-10 cursor-pointer place-items-center rounded-full bg-surface/90 text-foreground"
        >
          <Icon name="heart" fill={isFavorite} className={cn('text-lg transition-transform duration-150 ease-spring', pop && 'scale-125')} />
        </button>
        {!out && (
          <button
            type="button"
            onClick={() => addToCart(product, { size: 'M' })}
            className="btn absolute inset-x-2 bottom-2 hidden h-10 rounded-xs bg-primary text-[13px] text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 lg:flex"
          >
            <Icon name="plus" />
            Agregar rápido
          </button>
        )}
      </div>
      <Link to={href} className="flex flex-col gap-1 text-foreground no-underline">
        <span className="text-xs leading-tight font-semibold tracking-[0.02em] uppercase">{product.name}</span>
        <span className="flex flex-wrap items-baseline gap-2">
          <span className={cn('font-mono text-sm leading-none font-medium', product.compareAtPrice ? 'text-sale' : 'text-foreground')}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="font-mono text-xs leading-none text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>}
        </span>
        <span className={cn('text-[11px] leading-snug', low ? 'text-warning' : 'text-muted-foreground')}>
          {out ? 'Avisame cuando vuelva' : low ? `Quedan ${product.stock}` : `${formatPrice(product.price * (1 - TRANSFER_DISCOUNT_RATE))} con transferencia`}
        </span>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, className }: { products: readonly Product[]; className?: string }) {
  return (
    <div className={cn('grid gap-x-3 gap-y-6', className ?? PRODUCT_GRID_COLUMNS)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
