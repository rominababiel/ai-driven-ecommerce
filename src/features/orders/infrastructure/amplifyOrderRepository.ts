import { getDataClient, type Schema } from '@/infrastructure/amplify/dataClient';
import { collectPages, unwrap } from '@/infrastructure/amplify/results';
import { isDeliveryMethod, isPaymentMethod } from '../../../../amplify/shared/pricing';
import { sortByNewest, type Order, type OrderRepository } from '../domain/order';

type OrderRecord = Schema['Order']['type'];

function toOrder(record: OrderRecord): Order {
  return {
    id: record.id,
    customerId: record.customerId,
    items: record.items.map(({ productId, name, price, quantity, size }) => ({ productId, name, price, quantity, size: size ?? null })),
    shipping: {
      fullName: record.shipping.fullName,
      email: record.shipping.email,
      address: record.shipping.address,
      city: record.shipping.city,
      postalCode: record.shipping.postalCode,
      country: record.shipping.country,
    },
    total: record.total,
    status: record.status,
    createdAt: record.createdAt,
    delivery: isDeliveryMethod(record.delivery) ? record.delivery : null,
    payment: isPaymentMethod(record.payment) ? record.payment : null,
    discount: record.discount ?? null,
  };
}

export function createAmplifyOrderRepository(): OrderRepository {
  const client = () => getDataClient().models.Order;

  return {
    async place({ lines, shipping, delivery, payment }) {
      return toOrder(unwrap(await getDataClient().mutations.placeOrder({ lines, shipping, delivery, payment })));
    },
    async listByCustomer(customerId) {
      const records = await collectPages((nextToken) => client().listOrderByCustomerId({ customerId }, { nextToken }));
      return sortByNewest(records.map(toOrder));
    },
    async listAll() {
      const records = await collectPages((nextToken) => client().list({ limit: 100, nextToken }));
      return sortByNewest(records.map(toOrder));
    },
    async updateStatus(id, status) {
      return toOrder(unwrap(await client().update({ id, status })));
    },
  };
}
