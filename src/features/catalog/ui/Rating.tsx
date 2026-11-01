export function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600" aria-label={`Valoración ${value.toFixed(1)} de 5`}>
      <span aria-hidden className="text-amber-500">★</span>
      {value.toFixed(1)}
    </span>
  );
}
