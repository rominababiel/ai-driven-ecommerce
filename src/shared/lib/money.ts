const formatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatPrice(value: number): string {
  return `$${formatter.format(Math.round(value))}`;
}
