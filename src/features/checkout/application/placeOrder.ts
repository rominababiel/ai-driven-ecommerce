import type { CartItem } from '@/features/cart/domain/cart';
import { calculateTotals } from '@/features/cart/domain/pricing';
import type { Order, OrderRepository, ShippingAddress } from '@/features/orders/domain/order';
import { hasErrors } from '@/shared/lib/validation';
import { validateShipping } from '../domain/checkoutValidation';

interface PlaceOrderCommand {
  customerId: string;
  items: readonly CartItem[];
  shipping: ShippingAddress;
}

export async function placeOrder(orders: OrderRepository, command: PlaceOrderCommand): Promise<Order> {
  if (command.items.length === 0) throw new Error('El carrito está vacío');
  if (hasErrors(validateShipping(command.shipping))) throw new Error('La dirección de envío es inválida');

  const { total } = calculateTotals(command.items);

  return orders.create({
    customerId: command.customerId,
    items: command.items.map(({ productId, name, price, quantity }) => ({ productId, name, price, quantity })),
    shipping: command.shipping,
    total,
    status: 'PAID',
  });
}
