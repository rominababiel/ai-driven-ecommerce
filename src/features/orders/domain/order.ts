export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
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
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  shipping: ShippingAddress;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderLine {
  productId: string;
  quantity: number;
}

export interface PlaceOrderRequest {
  customerId: string;
  lines: OrderLine[];
  shipping: ShippingAddress;
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
