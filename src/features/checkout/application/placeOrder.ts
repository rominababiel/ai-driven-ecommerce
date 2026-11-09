import type { CartItem } from '@/features/cart/domain/cart';
import type { DeliveryMethod, Order, OrderRepository, PaymentMethod, ShippingAddress } from '@/features/orders/domain/order';
import { hasErrors } from '@/shared/lib/validation';
import { validateShipping } from '../domain/checkoutValidation';

interface PlaceOrderCommand {
  customerId: string;
  items: readonly CartItem[];
  shipping: ShippingAddress;
  delivery?: DeliveryMethod;
  payment?: PaymentMethod;
}

export async function placeOrder(orders: OrderRepository, command: PlaceOrderCommand): Promise<Order> {
  if (command.items.length === 0) throw new Error('El carrito está vacío');
  if (hasErrors(validateShipping(command.shipping))) throw new Error('La dirección de envío es inválida');

  return orders.place({
    customerId: command.customerId,
    lines: command.items.map(({ productId, quantity, size }) => ({ productId, quantity, size: size ?? null })),
    shipping: command.shipping,
    delivery: command.delivery ?? 'HOME',
    payment: command.payment ?? 'MERCADO_PAGO',
  });
}
