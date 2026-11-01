const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export function formatOrderDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function shortOrderId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
