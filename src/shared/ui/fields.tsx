import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const controlStyles = (error?: string) =>
  cn(
    'w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 outline-none transition-shadow',
    'focus:ring-2 focus:ring-violet-500 disabled:bg-zinc-100',
    error ? 'border-red-500' : 'border-zinc-300',
  );

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, error, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function useFieldA11y(id: string | undefined, error: string | undefined) {
  const generated = useId();
  const fieldId = id ?? generated;
  return {
    fieldId,
    a11y: { id: fieldId, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${fieldId}-error` : undefined },
  };
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const { fieldId, a11y } = useFieldA11y(id, error);
  return (
    <FieldShell id={fieldId} label={label} error={error} className={className}>
      <input {...a11y} className={cn(controlStyles(error), 'h-10')} {...props} />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, id, className, ...props }: TextAreaFieldProps) {
  const { fieldId, a11y } = useFieldA11y(id, error);
  return (
    <FieldShell id={fieldId} label={label} error={error} className={className}>
      <textarea {...a11y} className={cn(controlStyles(error), 'min-h-24 py-2')} {...props} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export function SelectField({ label, error, id, className, options, ...props }: SelectFieldProps) {
  const { fieldId, a11y } = useFieldA11y(id, error);
  return (
    <FieldShell id={fieldId} label={label} error={error} className={className}>
      <select {...a11y} className={cn(controlStyles(error), 'h-10')} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
