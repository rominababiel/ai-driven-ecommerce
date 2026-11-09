import { Link } from 'react-router';
import { catalogPath } from '@/app/layout/navigation';
import { useShopUI } from '@/app/shop/ShopUIContext';
import { Alert } from '@/shared/ui/Alert';
import { Icon } from '@/shared/ui/Icon';
import { GridSkeleton } from '@/shared/ui/StatusBlock';
import { CATEGORY_IMAGES, HERO_IMAGE } from '../data/demoProducts';
import { CATEGORY_ORDER } from '../domain/filters';
import type { Product } from '../domain/product';
import { useCatalog } from '../state/useCatalog';
import { ProductGrid } from './ProductCard';

const HERO_SUGGESTIONS = ['Armame un look para salir a correr', '¿Qué me pongo para andar en bici?', 'Algo cómodo para caminar por la ciudad'];
const ROW_SIZE = 4;
const ROW_COLUMNS = 'grid-cols-2 lg:grid-cols-4';

interface ProductSectionProps {
  title: string;
  products: readonly Product[];
  status: ReturnType<typeof useCatalog>['status'];
  error: ReturnType<typeof useCatalog>['error'];
}

function ProductSection({ title, products, status, error }: ProductSectionProps) {
  if (status === 'success' && products.length === 0) return null;
  return (
    <section className="page flex flex-col gap-5 pt-12">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="heading text-[32px] lg:text-5xl">{title}</h2>
        <Link to="/catalogo" className="text-[13px] font-semibold text-foreground underline underline-offset-2">
          Ver todo
        </Link>
      </div>
      {status === 'loading' && <GridSkeleton count={ROW_SIZE} className={ROW_COLUMNS} />}
      {status === 'error' && <Alert tone="error">{error}</Alert>}
      {status === 'success' && <ProductGrid products={products} className={ROW_COLUMNS} />}
    </section>
  );
}

export function HomePage() {
  const { openChat } = useShopUI();
  const { status, data, error } = useCatalog();
  const products = data ?? [];
  const newArrivals = products.filter((product) => product.isNew).slice(0, ROW_SIZE);
  const bestSellers = [...products]
    .filter((product) => product.stock > 0 && !product.isNew)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, ROW_SIZE);
  const categories = CATEGORY_ORDER.map((category) => ({
    category,
    image: CATEGORY_IMAGES[category] ?? products.find((product) => product.category === category)?.imageUrl,
  }));

  return (
    <>
      <section className="relative aspect-[4/5] overflow-hidden bg-photo lg:aspect-[16/7]">
        <img src={HERO_IMAGE.src} srcSet={HERO_IMAGE.srcSet} sizes={HERO_IMAGE.sizes} alt="" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.01_60/0.62)] to-transparent to-60%" />
        <div className="page absolute inset-x-0 bottom-0 flex flex-col gap-4 pb-6 text-primary-foreground lg:pb-12">
          <span className="font-mono text-xs font-medium tracking-[0.08em] uppercase">Drop 04 — Primavera / Verano 26</span>
          <h1 className="display max-w-[10ch] font-[850] text-[64px] leading-[0.86] lg:text-[120px]">Ciudad en movimiento</h1>
          <div className="flex flex-wrap gap-2">
            <Link to="/catalogo" className="btn h-12 rounded-xs bg-surface px-5.5 text-sm text-foreground no-underline">
              Ver colección
            </Link>
            <button type="button" onClick={() => openChat()} className="btn-ai pr-4.5 pl-3.5">
              <Icon name="sparkle" fill className="text-[17px]" />
              Armame un look
            </button>
          </div>
        </div>
      </section>

      <section className="page flex flex-col gap-4 pt-10">
        <h2 className="heading text-[32px] lg:text-5xl">Categorías</h2>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {categories.map(({ category, image }) => (
            <Link key={category} to={catalogPath(category)} className="flex w-32 flex-none snap-start flex-col gap-2 text-foreground no-underline lg:w-auto lg:flex-1">
              <div className="aspect-[4/5] w-full bg-photo">{image && <img src={image} alt="" loading="lazy" className="size-full object-cover" />}</div>
              <span className="text-xs leading-tight font-semibold tracking-[0.03em] uppercase">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Lo nuevo" products={newArrivals} status={status} error={error} />
      <ProductSection title="Los más elegidos" products={bestSellers} status={status} error={error} />

      <section className="page pt-14 pb-16">
        <div className="grid items-end gap-6 bg-ai p-6 text-ai-foreground md:grid-cols-2 lg:p-12">
          <div className="flex flex-col gap-3.5">
            <span className="flex items-center gap-1.5 font-mono text-xs font-medium tracking-[0.08em] uppercase">
              <Icon name="sparkle" fill />
              Asistente Outfit
            </span>
            <h2 className="display text-[40px] lg:text-[64px]">Contanos a dónde vas. Te armamos el look.</h2>
            <p className="max-w-[42ch] text-[15px] leading-normal">Respuestas al toque, con productos que hay en stock en tu talle.</p>
          </div>
          <div className="flex flex-col gap-2">
            {HERO_SUGGESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => openChat(question)}
                className="flex min-h-12 cursor-pointer items-center justify-between gap-2 rounded-full border border-ai-foreground/35 bg-ai-soft px-4 text-left text-sm font-medium"
              >
                {question}
                <Icon name="arrow-up-right" className="text-base" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
