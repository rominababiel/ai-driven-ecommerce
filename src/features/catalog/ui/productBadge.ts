import { discountPercent, isLowStock, type Product } from '../domain/product';

export interface Badge {
  label: string;
  className: string;
}

export function productBadge(product: Product, short = false): Badge | null {
  if (product.stock === 0) return { label: 'Sin stock', className: 'bg-primary text-primary-foreground border-primary' };
  if (isLowStock(product)) return { label: short ? 'Últimas' : 'Últimas unidades', className: 'bg-warning-soft text-warning border-warning-soft' };
  const discount = discountPercent(product);
  if (discount) return { label: `−${discount}%`, className: 'bg-sale text-white border-sale' };
  if (product.isNew) return { label: 'Nuevo', className: 'bg-surface text-foreground border-border' };
  return null;
}
