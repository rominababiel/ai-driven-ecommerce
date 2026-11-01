interface QuantityStepperProps {
  value: number;
  max: number;
  min?: number;
  label: string;
  onChange(value: number): void;
}

export function QuantityStepper({ value, max, min = 1, label, onChange }: QuantityStepperProps) {
  const buttonClass = 'flex size-9 items-center justify-center text-lg text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-300';
  return (
    <div className="inline-flex items-center rounded-lg ring-1 ring-inset ring-zinc-300" role="group" aria-label={label}>
      <button type="button" className={buttonClass} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Disminuir cantidad">
        −
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={buttonClass} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Aumentar cantidad">
        +
      </button>
    </div>
  );
}
