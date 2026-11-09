import { useState, type FormEvent } from 'react';
import { validateProductInput, type Product, type ProductInput } from '@/features/catalog/domain/product';
import { hasErrors, type FieldErrors } from '@/shared/lib/validation';
import { Button } from '@/shared/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/shared/ui/fields';

type FormValues = Record<keyof ProductInput, string>;

const optionalNumber = (value: string) => (value.trim() ? Number(value) : null);
const optionalText = (value: string) => value.trim() || null;

const toFormValues = (product?: Product): FormValues => ({
  name: product?.name ?? '',
  description: product?.description ?? '',
  category: product?.category ?? '',
  imageUrl: product?.imageUrl ?? '',
  price: product ? String(product.price) : '',
  stock: product ? String(product.stock) : '0',
  rating: product ? String(product.rating) : '0',
  compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : '',
  color: product?.color ?? '',
  hoverImageUrl: product?.hoverImageUrl ?? '',
  isNew: product?.isNew ? 'true' : 'false',
});

const toInput = (values: FormValues): ProductInput => ({
  name: values.name.trim(),
  description: values.description.trim(),
  category: values.category.trim(),
  imageUrl: values.imageUrl.trim(),
  price: Number(values.price),
  stock: Number(values.stock),
  rating: Number(values.rating),
  compareAtPrice: optionalNumber(values.compareAtPrice),
  color: optionalText(values.color),
  hoverImageUrl: optionalText(values.hoverImageUrl),
  isNew: values.isNew === 'true',
});

interface ProductFormProps {
  product?: Product;
  submitting: boolean;
  onSubmit(input: ProductInput): void;
  onCancel(): void;
}

export function ProductForm({ product, submitting, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState(() => toFormValues(product));
  const [errors, setErrors] = useState<FieldErrors<ProductInput>>({});

  const bind = (name: keyof ProductInput) => ({
    value: values[name],
    error: errors[name],
    onChange: (event: { target: { value: string } }) => setValues((current) => ({ ...current, [name]: event.target.value })),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = toInput(values);
    const validation = validateProductInput(input);
    setErrors(validation);
    if (!hasErrors(validation)) onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 rounded-md bg-surface p-6 ring-1 ring-border sm:grid-cols-2">
      <h2 className="text-lg font-semibold text-foreground sm:col-span-2">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
      <TextField label="Nombre" {...bind('name')} />
      <TextField label="Categoría" {...bind('category')} />
      <TextAreaField className="sm:col-span-2" label="Descripción" {...bind('description')} />
      <TextField className="sm:col-span-2" label="URL de imagen" type="url" {...bind('imageUrl')} />
      <TextField className="sm:col-span-2" label="URL de segunda imagen (hover)" type="url" {...bind('hoverImageUrl')} />
      <TextField label="Precio anterior (opcional)" type="number" min="0" step="1" {...bind('compareAtPrice')} />
      <TextField label="Color" {...bind('color')} />
      <SelectField
        label="Etiqueta"
        options={[
          { value: 'false', label: 'Sin etiqueta' },
          { value: 'true', label: 'Nuevo' },
        ]}
        {...bind('isNew')}
      />
      <TextField label="Precio (USD)" type="number" min={0} step="0.01" {...bind('price')} />
      <TextField label="Stock" type="number" min={0} step="1" {...bind('stock')} />
      <TextField label="Valoración (0-5)" type="number" min={0} max={5} step="0.1" {...bind('rating')} />
      <div className="flex items-end justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
