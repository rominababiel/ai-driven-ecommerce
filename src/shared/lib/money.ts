const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatPrice(value: number): string {
  return formatter.format(value);
}
