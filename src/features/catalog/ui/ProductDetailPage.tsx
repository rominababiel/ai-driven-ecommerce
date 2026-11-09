import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { useAddToCart } from '@/app/shop/useAddToCart';
import { FREE_SHIPPING_THRESHOLD, INSTALLMENTS, TRANSFER_DISCOUNT_RATE } from '@/features/cart/domain/pricing';
import { QuantityStepper } from '@/features/cart/ui/QuantityStepper';
import { useServices } from '@/services/ServicesContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { cn } from '@/shared/lib/cn';
import { formatPrice } from '@/shared/lib/money';
import { Icon } from '@/shared/ui/Icon';
import { StatusBlock } from '@/shared/ui/StatusBlock';
import { isLowStock, type Product } from '../domain/product';
import { useCatalog } from '../state/useCatalog';
import { productBadge } from './productBadge';
import { ProductGrid } from './ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const MAX_PER_ORDER = 5;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-px text-sm" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon key={star} name={rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star'} fill={rating >= star - 0.5} />
      ))}
    </span>
  );
}

function Accordion({ items }: { items: Array<{ title: string; body: string }> }) {
  const [open, setOpen] = useState<string | null>(items[0]?.title ?? null);
  return (
    <div className="border-t border-border">
      {items.map(({ title, body }) => {
        const expanded = open === title;
        return (
          <div key={title} className="border-b border-border">
            <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : title)} className="flex h-14 w-full cursor-pointer items-center justify-between text-[13px] font-semibold tracking-[0.04em] uppercase">
              {title}
              <Icon name={expanded ? 'minus' : 'plus'} className="text-base" />
            </button>
            {expanded && <p className="mb-4.5 text-sm leading-relaxed text-muted-foreground">{body}</p>}
          </div>
        );
      })}
    </div>
  );
}

function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const addToCart = useAddToCart();
  const { openChat, showToast } = useShopUI();
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [slide, setSlide] = useState(1);
  const out = product.stock === 0;
  const low = isLowStock(product);
  const badge = productBadge(product);
  const gallery = [product.imageUrl, product.hoverImageUrl ?? product.imageUrl].filter(Boolean);
  const maxQuantity = Math.max(1, Math.min(MAX_PER_ORDER, product.stock));

  const add = () => {
    if (out) {
      showToast({ text: 'Te avisamos cuando vuelva', icon: 'bell' });
      return;
    }
    const chosen = size ?? 'M';
    setSize(chosen);
    setAdding(true);
    window.setTimeout(() => {
      setAdding(false);
      addToCart(product, { quantity, size: chosen });
    }, 400);
  };

  const addLabel = out ? 'Sin stock · Avisame' : adding ? 'Agregando' : 'Agregar al carrito';
  const addClass = out ? 'bg-border text-muted-foreground hover:bg-border' : '';

  return (
    <>
      <section className="mx-auto flex max-w-(--container-page) flex-col gap-4 lg:px-10 lg:pt-5">
        <span className="eyebrow hidden lg:block">
          <Link to="/catalogo" className="text-inherit no-underline">Tienda</Link> / {product.category} / {product.name}
        </span>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <div className="relative">
            <div
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible"
              onScroll={(event) => setSlide(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth) + 1)}
            >
              {gallery.map((src, index) => (
                <div key={`${src}-${index}`} className="aspect-[4/5] flex-[0_0_100%] snap-start bg-photo">
                  <img src={src} alt={index === 0 ? product.name : `${product.name}, vista ${index + 1}`} className="size-full object-cover" />
                </div>
              ))}
            </div>
            <span className="absolute right-3 bottom-3 bg-surface/90 px-2 py-1.5 font-mono text-[11px] leading-none lg:hidden">
              {slide} / {gallery.length}
            </span>
            {badge && <span className={cn('absolute top-3 left-3 border px-2 py-1.5 text-[11px] leading-none font-semibold tracking-[0.06em] uppercase', badge.className)}>{badge.label}</span>}
          </div>

          <div className="flex flex-col gap-5 px-4 lg:sticky lg:top-24 lg:px-0">
            <div className="flex flex-col gap-2.5">
              <span className="eyebrow">{product.category}</span>
              <h1 className="display text-[40px] leading-[0.9] lg:text-[56px]">{product.name}</h1>
              {product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={product.rating} />
                  <span className="font-mono text-xs font-medium">{product.rating.toFixed(1).replace('.', ',')}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2.5">
                <span className={cn('font-mono text-2xl leading-none font-medium', product.compareAtPrice ? 'text-sale' : 'text-foreground')}>{formatPrice(product.price)}</span>
                {product.compareAtPrice && <span className="font-mono text-[15px] text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>}
              </div>
              <span className="text-[13px] text-muted-foreground">
                {INSTALLMENTS} cuotas sin interés de {formatPrice(product.price / INSTALLMENTS)} · <b className="text-foreground">{formatPrice(product.price * (1 - TRANSFER_DISCOUNT_RATE))}</b> con transferencia
              </span>
            </div>
            {low && (
              <div className="flex items-center gap-2 bg-warning-soft px-3 py-2.5 text-[13px] font-medium text-warning">
                <Icon name="warning" fill className="text-lg" />
                Últimas unidades: quedan {product.stock}
              </div>
            )}
            {product.color && (
              <div className="flex flex-col gap-2.5 border-t border-border pt-4.5">
                <span className="text-[13px] font-semibold">
                  Color: <span className="font-normal">{product.color}</span>
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold">Talle{size ? `: ${size}` : ''}</span>
                <span className="flex items-center gap-1 text-xs font-medium">
                  <Icon name="ruler" />
                  Guía de talles
                </span>
              </div>
              <div role="radiogroup" aria-label="Talle" className="grid grid-cols-5 gap-1.5">
                {SIZES.map((option) => {
                  const selected = size === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={out}
                      onClick={() => setSize(option)}
                      className={cn('h-12 cursor-pointer border text-sm font-medium disabled:cursor-not-allowed disabled:text-border-strong disabled:line-through', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} size="lg" />
              <button type="button" onClick={add} className={cn('btn-primary h-[54px] flex-1', addClass)}>
                {adding && <Icon name="circle-notch" className="animate-spin text-lg" />}
                {addLabel}
              </button>
            </div>
            <button type="button" onClick={() => openChat(`¿Con qué combino el ${product.name}?`)} className="btn h-13 rounded-full border-[1.5px] border-foreground text-sm hover:bg-ai-soft">
              <Icon name="sparkle" fill className="text-lg text-ai-soft-foreground" />
              Preguntale al asistente
            </button>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <span className="flex items-center gap-2.5">
                <Icon name="truck" className="text-xl" />
                Envío gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </span>
              <span className="flex items-center gap-2.5">
                <Icon name="arrows-clockwise" className="text-xl" />
                Primer cambio sin cargo · 30 días
              </span>
            </div>
            <Accordion
              items={[
                { title: 'Descripción', body: product.description },
                { title: 'Talles y calce', body: 'Calce relajado. Si dudás entre dos talles, elegí el más chico para un calce más al cuerpo.' },
                { title: 'Envíos y cambios', body: `Envío gratis desde ${formatPrice(FREE_SHIPPING_THRESHOLD)} a todo el país. Primer cambio sin cargo dentro de los 30 días.` },
              ]}
            />
          </div>
        </div>
        {related.length > 0 && (
          <div className="flex flex-col gap-5 px-4 pt-12 pb-14 lg:px-0">
            <h2 className="heading text-[32px] lg:text-5xl">Completá el look</h2>
            <ProductGrid products={related} />
          </div>
        )}
      </section>
      <div className="sticky bottom-0 z-20 flex items-center gap-3 border-t border-border bg-surface px-4 py-2.5 lg:hidden">
        <div className="flex flex-none flex-col gap-1">
          <span className={cn('font-mono text-base leading-none font-medium', product.compareAtPrice ? 'text-sale' : 'text-foreground')}>{formatPrice(product.price)}</span>
          <span className="text-[11px] text-muted-foreground">{size ? `Talle ${size}` : 'Elegí tu talle'}</span>
        </div>
        <button type="button" onClick={add} className={cn('btn-primary h-12 flex-1 text-sm', addClass)}>
          {addLabel}
        </button>
      </div>
    </>
  );
}

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const { products } = useServices();
  const load = useCallback(() => products.getById(id), [products, id]);
  const { status, data } = useAsync(load);
  const catalog = useCatalog();

  const related = useMemo(() => {
    if (!data || !catalog.data) return [];
    const others = catalog.data.filter((product) => product.id !== data.id && product.stock > 0);
    const sameCategory = others.filter((product) => product.category !== data.category);
    return [...sameCategory, ...others].filter((product, index, list) => list.indexOf(product) === index).slice(0, 4);
  }, [data, catalog.data]);

  if (status === 'loading') return <div className="page py-16"><div className="aspect-[4/5] max-w-md animate-pulse bg-muted" /></div>;
  if (!data) {
    return (
      <div className="page py-16">
        <StatusBlock icon="question" title="Producto no encontrado" description="El link puede estar roto o el producto ya no está.">
          <Link to="/catalogo" className="btn-primary h-11 text-sm no-underline">
            Ver catálogo
          </Link>
        </StatusBlock>
      </div>
    );
  }
  return <ProductDetail key={data.id} product={data} related={related} />;
}
