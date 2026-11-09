export const SALE_CATEGORY = 'Sale';

export interface NavLink {
  label: string;
  to: string;
  highlight?: boolean;
}

export function catalogPath(category?: string): string {
  return category ? `/catalogo?cat=${encodeURIComponent(category)}` : '/catalogo';
}

export const DESKTOP_NAV: NavLink[] = [
  { label: 'Lo nuevo', to: catalogPath() },
  { label: 'Buzos y camperas', to: catalogPath('Buzos y camperas') },
  { label: 'Calzas', to: catalogPath('Calzas') },
  { label: 'Accesorios', to: catalogPath('Accesorios') },
  { label: 'Sale', to: catalogPath(SALE_CATEGORY), highlight: true },
];

export const MOBILE_NAV: NavLink[] = [
  { label: 'Lo nuevo', to: catalogPath() },
  { label: 'Buzos y camperas', to: catalogPath('Buzos y camperas') },
  { label: 'Calzas', to: catalogPath('Calzas') },
  { label: 'Remeras y tops', to: catalogPath('Remeras y tops') },
  { label: 'Joggers y pantalones', to: catalogPath('Joggers y pantalones') },
  { label: 'Sale', to: catalogPath(SALE_CATEGORY), highlight: true },
];
