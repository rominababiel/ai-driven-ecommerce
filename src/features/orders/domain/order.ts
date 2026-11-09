import type { DeliveryMethod, PaymentMethod } from '../../../../amplify/shared/pricing';

export type { DeliveryMethod, PaymentMethod } from '../../../../amplify/shared/pricing';

export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pago aprobado',
  SHIPPED: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  total: number;
  status: OrderStatus;
  createdAt: string;
  delivery?: DeliveryMethod | null;
  payment?: PaymentMethod | null;
  discount?: number | null;
}

export interface OrderLine {
  productId: string;
  quantity: number;
  size?: string | null;
}

export interface PlaceOrderRequest {
  customerId: string;
  lines: OrderLine[];
  shipping: ShippingAddress;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
}

export interface OrderRepository {
  place(request: PlaceOrderRequest): Promise<Order>;
  listByCustomer(customerId: string): Promise<Order[]>;
  listAll(): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}

export function sortByNewest(orders: readonly Order[]): Order[] {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  MERCADO_PAGO: 'Mercado Pago',
  CARD: 'Tarjeta · Stripe',
  TRANSFER: 'Transferencia',
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  HOME: 'Envío a domicilio',
  PICKUP: 'Retiro en local',
};

export function shortOrderId(id: string): string {
  return `OF-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}
