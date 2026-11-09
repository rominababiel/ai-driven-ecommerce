const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

export function formatOrderDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
