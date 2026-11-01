import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useCart } from '@/features/cart/state/CartContext';
import { CartSummary } from '@/features/cart/ui/CartSummary';
import type { ShippingAddress } from '@/features/orders/domain/order';
import { useServices } from '@/services/ServicesContext';
import { toErrorMessage } from '@/shared/lib/errors';
import { hasErrors, type FieldErrors } from '@/shared/lib/validation';
import { Alert } from '@/shared/ui/Alert';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/fields';
import { placeOrder } from '../application/placeOrder';
import { validatePayment, validateShipping, type PaymentDetails } from '../domain/checkoutValidation';

const SHIPPING_FIELDS: ReadonlyArray<{ name: keyof ShippingAddress; label: string; autoComplete: string; wide?: boolean }> = [
  { name: 'fullName', label: 'Nombre completo', autoComplete: 'name', wide: true },
  { name: 'email', label: 'Correo', autoComplete: 'email', wide: true },
  { name: 'address', label: 'Dirección', autoComplete: 'street-address', wide: true },
  { name: 'city', label: 'Ciudad', autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'Código postal', autoComplete: 'postal-code' },
  { name: 'country', label: 'País', autoComplete: 'country-name', wide: true },
];

const EMPTY_PAYMENT: PaymentDetails = { cardNumber: '', expiry: '', cvc: '' };

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, totals, clear } = useCart();
  const { orders } = useServices();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: '',
    email: user?.email ?? '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [payment, setPayment] = useState<PaymentDetails>(EMPTY_PAYMENT);
  const [shippingErrors, setShippingErrors] = useState<FieldErrors<ShippingAddress>>({});
  const [paymentErrors, setPaymentErrors] = useState<FieldErrors<PaymentDetails>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (items.length === 0 && !submitting) return <Navigate to="/cart" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextShippingErrors = validateShipping(shipping);
    const nextPaymentErrors = validatePayment(payment);
    setShippingErrors(nextShippingErrors);
    setPaymentErrors(nextPaymentErrors);
    if (hasErrors(nextShippingErrors) || hasErrors(nextPaymentErrors)) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await placeOrder(orders, { customerId: user.id, items, shipping });
      navigate('/orders', { replace: true, state: { placedOrderId: order.id } });
      clear();
    } catch (error) {
      setSubmitError(toErrorMessage(error, 'No pudimos procesar tu pedido'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Checkout</h1>
        {submitError && <Alert tone="error">{submitError}</Alert>}

        <fieldset className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 sm:grid-cols-2">
          <legend className="sr-only">Datos de envío</legend>
          <h2 className="text-lg font-semibold text-zinc-900 sm:col-span-2">Envío</h2>
          {SHIPPING_FIELDS.map((field) => (
            <TextField
              key={field.name}
              className={field.wide ? 'sm:col-span-2' : undefined}
              label={field.label}
              autoComplete={field.autoComplete}
              value={shipping[field.name]}
              error={shippingErrors[field.name]}
              onChange={(e) => setShipping((current) => ({ ...current, [field.name]: e.target.value }))}
            />
          ))}
        </fieldset>

        <fieldset className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-zinc-200 sm:grid-cols-2">
          <legend className="sr-only">Pago</legend>
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold text-zinc-900">Pago</h2>
            <p className="text-xs text-zinc-500">Pago simulado. Usa la tarjeta de prueba 4242 4242 4242 4242.</p>
          </div>
          <TextField
            className="sm:col-span-2"
            label="Número de tarjeta"
            inputMode="numeric"
            autoComplete="cc-number"
            value={payment.cardNumber}
            error={paymentErrors.cardNumber}
            onChange={(e) => setPayment((current) => ({ ...current, cardNumber: e.target.value }))}
          />
          <TextField
            label="Vencimiento (MM/AA)"
            autoComplete="cc-exp"
            placeholder="12/29"
            value={payment.expiry}
            error={paymentErrors.expiry}
            onChange={(e) => setPayment((current) => ({ ...current, expiry: e.target.value }))}
          />
          <TextField
            label="CVC"
            inputMode="numeric"
            autoComplete="cc-csc"
            value={payment.cvc}
            error={paymentErrors.cvc}
            onChange={(e) => setPayment((current) => ({ ...current, cvc: e.target.value }))}
          />
        </fieldset>
      </div>

      <div className="lg:pt-14">
        <CartSummary totals={totals}>
          <Button type="submit" size="lg" loading={submitting}>
            Confirmar pedido
          </Button>
        </CartSummary>
      </div>
    </form>
  );
}
