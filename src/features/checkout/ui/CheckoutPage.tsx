import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/state/AuthContext';
import { calculateTotals, INSTALLMENTS, type CheckoutOptions } from '@/features/cart/domain/pricing';
import { useCart } from '@/features/cart/state/CartContext';
import { describeItem } from '@/features/cart/domain/cart';
import { shortOrderId, type DeliveryMethod, type Order, type PaymentMethod } from '@/features/orders/domain/order';
import { useServices } from '@/services/ServicesContext';
import { cn } from '@/shared/lib/cn';
import { toErrorMessage } from '@/shared/lib/errors';
import { formatPrice } from '@/shared/lib/money';
import { hasErrors, type FieldErrors } from '@/shared/lib/validation';
import { Icon } from '@/shared/ui/Icon';
import { StatusBlock } from '@/shared/ui/StatusBlock';
import { placeOrder } from '../application/placeOrder';
import { validatePayment, validateShipping, type PaymentDetails } from '../domain/checkoutValidation';

interface ContactForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
}

const DELIVERY_OPTIONS: Array<{ value: DeliveryMethod; title: string; description: string }> = [
  { value: 'HOME', title: 'Envío a domicilio', description: 'Andreani · llega en 48–72 h' },
  { value: 'PICKUP', title: 'Retiro en local', description: 'Palermo o Villa Devoto · desde mañana' },
];

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; title: string; description: string; icon: string }> = [
  { value: 'MERCADO_PAGO', title: 'Mercado Pago', description: 'Dinero en cuenta, tarjetas y hasta 6 cuotas', icon: 'wallet' },
  { value: 'CARD', title: 'Tarjeta de crédito o débito', description: `Procesado por Stripe · ${INSTALLMENTS} cuotas sin interés`, icon: 'credit-card' },
  { value: 'TRANSFER', title: 'Transferencia bancaria', description: '15% de descuento · se acredita en 24 h', icon: 'bank' },
];

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

function RadioCard({ selected, onSelect, children }: { selected: boolean; onSelect(): void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn('flex w-full cursor-pointer items-center gap-3 bg-surface p-4 text-left', selected ? 'border-[1.5px] border-foreground' : 'border border-border')}
    >
      <span className={cn('size-5 flex-none rounded-full', selected ? 'border-[6px] border-foreground' : 'border-[1.5px] border-border-strong')} />
      {children}
    </button>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {['Envío', 'Pago', 'Confirmación'].map((label, index) => {
        const step = index + 1;
        const done = current > step || current === 3;
        const active = done || current === step;
        return (
          <li key={label} aria-current={current === step ? 'step' : undefined} className="flex flex-col gap-2">
            <div className={cn('h-[3px]', active ? 'bg-foreground' : 'bg-border')} />
            <span className={cn('flex items-center gap-2 text-xs font-semibold tracking-[0.04em] uppercase', active ? 'text-foreground' : 'text-muted-foreground')}>
              <span className={cn('grid size-[22px] place-items-center rounded-full border font-mono text-[11px]', done ? 'border-foreground bg-foreground text-primary-foreground' : active ? 'border-foreground' : 'border-border')}>
                {done ? '✓' : step}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function CheckoutPage() {
  const { orders } = useServices();
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [contact, setContact] = useState<ContactForm>({ email: user?.email ?? '', firstName: '', lastName: '', address: '', postalCode: '', city: '' });
  const [contactErrors, setContactErrors] = useState<FieldErrors<ContactForm>>({});
  const [options, setOptions] = useState<CheckoutOptions>({ delivery: 'HOME', payment: 'MERCADO_PAGO' });
  const [card, setCard] = useState<PaymentDetails>({ cardNumber: '', expiry: '', cvc: '' });
  const [cardErrors, setCardErrors] = useState<FieldErrors<PaymentDetails>>({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const totals = calculateTotals(cart.items, options);
  const shipping = {
    fullName: `${contact.firstName} ${contact.lastName}`.trim(),
    email: contact.email.trim(),
    address: contact.address.trim(),
    city: contact.city.trim(),
    postalCode: contact.postalCode.trim(),
    country: 'Argentina',
  };

  if (!user) return null;
  if (cart.items.length === 0 && !order) {
    return (
      <section className="page py-16">
        <StatusBlock icon="handbag" title="Tu carrito está vacío" description="Agregá productos para finalizar la compra.">
          <Link to="/catalogo" className="btn-primary h-11 text-sm no-underline">Ver lo nuevo</Link>
        </StatusBlock>
      </section>
    );
  }

  const update = (field: keyof ContactForm) => (event: ChangeEvent<HTMLInputElement>) => setContact((current) => ({ ...current, [field]: event.target.value }));

  const toPayment = () => {
    const base = validateShipping(shipping);
    const errors: FieldErrors<ContactForm> = {
      email: base.email,
      address: base.address,
      city: base.city,
      postalCode: base.postalCode,
      firstName: contact.firstName.trim() ? undefined : 'Campo obligatorio',
      lastName: contact.lastName.trim() ? undefined : 'Campo obligatorio',
    };
    setContactErrors(errors);
    if (hasErrors(errors)) return;
    setStep(2);
    window.scrollTo({ top: 0 });
  };

  const pay = async () => {
    if (paying) return;
    if (options.payment === 'CARD') {
      const errors = validatePayment(card);
      setCardErrors(errors);
      if (hasErrors(errors)) return;
    }
    setPaying(true);
    setPayError(null);
    try {
      const placed = await placeOrder(orders, { customerId: user.id, items: cart.items, shipping, ...options });
      cart.clear();
      setOrder(placed);
      setStep(3);
      window.scrollTo({ top: 0 });
    } catch (error) {
      setPayError(toErrorMessage(error, 'El pago fue rechazado. No se hizo ningún cobro.'));
    } finally {
      setPaying(false);
    }
  };

  const payLabel = paying ? 'Procesando pago' : `${options.payment === 'MERCADO_PAGO' ? 'Pagar con Mercado Pago' : 'Pagar'} ${formatPrice(totals.total)}`;

  return (
    <section className="mx-auto flex max-w-[1120px] flex-col gap-7 px-4 pt-6 pb-16 lg:px-10">
      <Steps current={step} />

      {step === 3 && order ? (
        <div className="mx-auto flex w-full max-w-[560px] animate-rise flex-col items-center gap-4 py-6 text-center">
          <span className="grid size-[72px] place-items-center rounded-full bg-success-soft text-success">
            <Icon name="check" className="text-[34px]" />
          </span>
          <span className="eyebrow text-xs">Pedido #{shortOrderId(order.id)}</span>
          <h1 className="display text-[44px] lg:text-7xl">¡Listo{contact.firstName ? `, ${contact.firstName}` : ''}! Ya es tuyo.</h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Te mandamos el detalle a <b className="text-foreground">{order.shipping.email}</b>.
          </p>
          <div className="flex w-full flex-col gap-3 border border-border p-4.5 text-left text-sm">
            <div className="flex justify-between">
              <span>Total pagado</span>
              <span className="font-mono text-[15px] font-medium">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega</span>
              <span className="font-semibold">{order.delivery === 'PICKUP' ? 'Retiro en local desde mañana' : 'Llega en 48–72 h'}</span>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2">
            <button type="button" onClick={() => navigate('/orders')} className="btn-primary min-w-[180px] flex-1 text-sm">
              Ver mis pedidos
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn-outline min-w-[180px] flex-1">
              Seguir comprando
            </button>
          </div>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="order-2 flex flex-col gap-6 lg:order-1">
            {step === 1 && (
              <>
                <div className="flex flex-col gap-3.5">
                  <span className="heading text-2xl">Contacto</span>
                  <Field label="Email" error={contactErrors.email}>
                    <input type="email" autoComplete="email" value={contact.email} onChange={update('email')} aria-invalid={Boolean(contactErrors.email)} className="field" />
                  </Field>
                </div>
                <div className="flex flex-col gap-3.5">
                  <span className="heading text-2xl">Entrega</span>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nombre" error={contactErrors.firstName}>
                      <input autoComplete="given-name" value={contact.firstName} onChange={update('firstName')} aria-invalid={Boolean(contactErrors.firstName)} className="field" />
                    </Field>
                    <Field label="Apellido" error={contactErrors.lastName}>
                      <input autoComplete="family-name" value={contact.lastName} onChange={update('lastName')} aria-invalid={Boolean(contactErrors.lastName)} className="field" />
                    </Field>
                  </div>
                  <Field label="Calle y número" error={contactErrors.address}>
                    <input autoComplete="street-address" value={contact.address} onChange={update('address')} aria-invalid={Boolean(contactErrors.address)} className="field" />
                  </Field>
                  <div className="grid grid-cols-[1fr_1.4fr] gap-3">
                    <Field label="Código postal" error={contactErrors.postalCode}>
                      <input autoComplete="postal-code" inputMode="numeric" value={contact.postalCode} onChange={update('postalCode')} aria-invalid={Boolean(contactErrors.postalCode)} className="field" />
                    </Field>
                    <Field label="Localidad" error={contactErrors.city}>
                      <input autoComplete="address-level2" value={contact.city} onChange={update('city')} aria-invalid={Boolean(contactErrors.city)} className="field" />
                    </Field>
                  </div>
                </div>
                <div role="radiogroup" aria-label="Envío" className="flex flex-col gap-2.5">
                  <span className="heading text-2xl">Envío</span>
                  {DELIVERY_OPTIONS.map((option) => {
                    const cost = calculateTotals(cart.items, { ...options, delivery: option.value }).shipping;
                    return (
                      <RadioCard key={option.value} selected={options.delivery === option.value} onSelect={() => setOptions((current) => ({ ...current, delivery: option.value }))}>
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-semibold">{option.title}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </span>
                        <span className="font-mono text-sm font-medium">{cost ? formatPrice(cost) : 'Gratis'}</span>
                      </RadioCard>
                    );
                  })}
                </div>
                <button type="button" onClick={toPayment} className="btn-primary h-[54px]">
                  Continuar al pago
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div role="radiogroup" aria-label="Pago" className="flex flex-col gap-2.5">
                  <span className="heading text-2xl">Pago</span>
                  {payError && (
                    <div role="alert" className="flex gap-2.5 bg-danger-soft px-3.5 py-3 text-sm leading-snug text-danger">
                      <Icon name="x-circle" fill className="flex-none text-xl" />
                      <span>
                        <b>No pudimos procesar el pago.</b> {payError}
                      </span>
                    </div>
                  )}
                  {PAYMENT_OPTIONS.map((option) => {
                    const selected = options.payment === option.value;
                    return (
                      <div key={option.value} className={cn('bg-surface', selected ? 'border-[1.5px] border-foreground' : 'border border-border')}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            setOptions((current) => ({ ...current, payment: option.value }));
                            setPayError(null);
                          }}
                          className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
                        >
                          <span className={cn('size-5 flex-none rounded-full', selected ? 'border-[6px] border-foreground' : 'border-[1.5px] border-border-strong')} />
                          <Icon name={option.icon} className="text-[22px]" />
                          <span className="flex flex-1 flex-col gap-0.5">
                            <span className="text-sm font-semibold">{option.title}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </span>
                        </button>
                        {selected && option.value === 'MERCADO_PAGO' && (
                          <p className="mx-4 mb-4 border-[1.5px] border-dashed border-border-strong p-4 text-center text-xs leading-normal text-muted-foreground">
                            Modo prueba: el pago con Mercado Pago se aprueba al confirmar. En producción acá va el botón de Checkout Pro.
                          </p>
                        )}
                        {selected && option.value === 'CARD' && (
                          <div className="mx-4 mb-4 flex flex-col gap-2.5">
                            <Field label="Número de tarjeta" error={cardErrors.cardNumber}>
                              <input inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card.cardNumber} onChange={(event) => setCard((current) => ({ ...current, cardNumber: event.target.value }))} aria-invalid={Boolean(cardErrors.cardNumber)} className="field font-mono" />
                            </Field>
                            <div className="grid grid-cols-2 gap-2.5">
                              <Field label="Vencimiento" error={cardErrors.expiry}>
                                <input autoComplete="cc-exp" placeholder="MM/AA" value={card.expiry} onChange={(event) => setCard((current) => ({ ...current, expiry: event.target.value }))} aria-invalid={Boolean(cardErrors.expiry)} className="field font-mono" />
                              </Field>
                              <Field label="CVC" error={cardErrors.cvc}>
                                <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(event) => setCard((current) => ({ ...current, cvc: event.target.value }))} aria-invalid={Boolean(cardErrors.cvc)} className="field font-mono" />
                              </Field>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Modo prueba: usá 4242 4242 4242 4242. {INSTALLMENTS} cuotas sin interés de {formatPrice(totals.total / INSTALLMENTS)}.
                            </span>
                          </div>
                        )}
                        {selected && option.value === 'TRANSFER' && (
                          <p className="mx-4 mb-4 bg-muted p-3.5 text-[13px] leading-relaxed">
                            Te mostramos el CBU al confirmar. Total con descuento: <b className="font-mono">{formatPrice(totals.total)}</b>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline h-[54px]">
                    Volver
                  </button>
                  <button type="button" onClick={pay} disabled={paying} className="btn-primary h-[54px] flex-1">
                    {paying && <Icon name="circle-notch" className="animate-spin text-lg" />}
                    {payLabel}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="order-1 border border-border bg-surface lg:sticky lg:top-6 lg:order-2">
            <button type="button" onClick={() => setSummaryOpen((open) => !open)} aria-expanded={summaryOpen} className="flex w-full cursor-pointer items-center justify-between px-4.5 py-4 lg:cursor-default">
              <span className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.04em] uppercase">
                <Icon name="handbag" className="text-lg" />
                Tu pedido ({totals.itemCount})
                <Icon name={summaryOpen ? 'caret-up' : 'caret-down'} className="text-sm lg:hidden" />
              </span>
              <span className="font-mono text-base font-medium">{formatPrice(totals.total)}</span>
            </button>
            <div className={cn('flex-col gap-3 px-4.5 pb-4.5 lg:flex', summaryOpen ? 'flex' : 'hidden')}>
              {cart.items.map((item) => (
                <div key={item.productId} className="grid grid-cols-[52px_1fr_auto] items-center gap-3">
                  <div className="relative aspect-[4/5] bg-photo">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="size-full object-cover" />}
                    <span className="absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] rounded-full bg-muted-foreground text-center font-mono text-[10px] leading-[18px] font-semibold text-white">{item.quantity}</span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs leading-tight font-semibold uppercase">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground">{describeItem(item)}</span>
                  </div>
                  <span className="font-mono text-[13px] font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex flex-col gap-2 border-t border-border pt-3 text-[13px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="font-mono">{totals.shipping ? formatPrice(totals.shipping) : 'Gratis'}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Transferencia −15%</span>
                    <span className="font-mono">−{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-border pt-2.5">
                  <span className="text-sm font-bold">Total</span>
                  <span className="font-mono text-lg font-medium">{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
