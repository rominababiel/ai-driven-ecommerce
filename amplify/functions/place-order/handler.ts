import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/place-order';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';
import { computeOrderAmounts, INITIAL_ORDER_STATUS } from '../../shared/pricing';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_UNITS_PER_LINE = 20;

type Shipping = Schema['ShippingAddress']['type'];

function assertValidShipping(shipping: Shipping): void {
  const values = Object.values(shipping);
  if (values.some((value) => typeof value !== 'string' || !value.trim())) throw new Error('La dirección de envío está incompleta');
  if (!EMAIL_PATTERN.test(shipping.email.trim())) throw new Error('Correo de envío inválido');
}

function mergeLines(lines: ReadonlyArray<{ productId: string; quantity: number }>): Map<string, number> {
  const merged = new Map<string, number>();
  for (const { productId, quantity } of lines) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Cantidad inválida');
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  for (const quantity of merged.values()) {
    if (quantity > MAX_UNITS_PER_LINE) throw new Error(`Máximo ${MAX_UNITS_PER_LINE} unidades por producto`);
  }
  return merged;
}

export const handler: Schema['placeOrder']['functionHandler'] = async (event) => {
  const identity = event.identity;
  if (!identity || !('sub' in identity) || !('username' in identity)) throw new Error('No autorizado');

  const { lines, shipping } = event.arguments;
  if (lines.length === 0) throw new Error('El carrito está vacío');
  assertValidShipping(shipping);

  const quantities = mergeLines(lines);

  const products = await Promise.all(
    [...quantities.keys()].map(async (id) => {
      const { data, errors } = await client.models.Product.get({ id });
      if (errors?.length || !data) throw new Error('Producto no disponible');
      return data;
    }),
  );

  const items = products.map((product) => {
    const quantity = quantities.get(product.id) ?? 0;
    if (product.stock < quantity) throw new Error(`Stock insuficiente para ${product.name}`);
    return { productId: product.id, name: product.name, price: product.price, quantity };
  });

  await Promise.all(
    products.map((product) =>
      client.models.Product.update({ id: product.id, stock: product.stock - (quantities.get(product.id) ?? 0) }),
    ),
  );

  const { data: order, errors } = await client.models.Order.create({
    customerId: identity.sub,
    owner: `${identity.sub}::${identity.username}`,
    items,
    shipping,
    total: computeOrderAmounts(items).total,
    status: INITIAL_ORDER_STATUS,
  });
  if (errors?.length || !order) throw new Error('No fue posible registrar el pedido');

  return order;
};
