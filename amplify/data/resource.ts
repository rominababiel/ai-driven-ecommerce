import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
import { placeOrderFunction } from '../functions/place-order/resource';
import { ADMIN_GROUP } from '../shared/constants';

const ASSISTANT_PROMPT = `Eres el asistente de moda de una tienda de ropa urbana.
Responde siempre en español, de forma breve y amable.
Usa la herramienta searchCatalog para consultar productos reales antes de recomendar algo.
Nunca inventes productos, precios ni stock. Si algo no existe en el catálogo, dilo.
Cuando recomiendes prendas indica nombre, precio y una razón corta.
Si te piden un outfit, combínalo solo con prendas del catálogo que tengan stock.`;

const schema = a.schema({
  Product: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      price: a.float().required(),
      category: a.string().required(),
      imageUrl: a.url(),
      stock: a.integer().required(),
      rating: a.float(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.group(ADMIN_GROUP),
    ]),

  OrderStatus: a.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),

  OrderItem: a.customType({
    productId: a.id().required(),
    name: a.string().required(),
    price: a.float().required(),
    quantity: a.integer().required(),
  }),

  ShippingAddress: a.customType({
    fullName: a.string().required(),
    email: a.email().required(),
    address: a.string().required(),
    city: a.string().required(),
    postalCode: a.string().required(),
    country: a.string().required(),
  }),

  OrderLine: a.customType({
    productId: a.id().required(),
    quantity: a.integer().required(),
  }),

  Order: a
    .model({
      customerId: a.id().required(),
      owner: a.string().authorization((allow) => [allow.owner().to(['read']), allow.group(ADMIN_GROUP)]),
      items: a.ref('OrderItem').required().array().required(),
      shipping: a.ref('ShippingAddress').required(),
      total: a.float().required(),
      status: a.ref('OrderStatus').required(),
    })
    .secondaryIndexes((index) => [index('customerId')])
    .authorization((allow) => [allow.owner().to(['read']), allow.group(ADMIN_GROUP)]),

  placeOrder: a
    .mutation()
    .arguments({
      lines: a.ref('OrderLine').required().array().required(),
      shipping: a.ref('ShippingAddress').required(),
    })
    .returns(a.ref('Order'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(placeOrderFunction)),

  shopAssistant: a
    .conversation({
      aiModel: a.ai.model('Claude Haiku 4.5'),
      systemPrompt: ASSISTANT_PROMPT,
      tools: [
        a.ai.dataTool({
          name: 'searchCatalog',
          description: 'Lista los productos del catálogo con nombre, descripción, categoría, precio, stock y valoración.',
          model: a.ref('Product'),
          modelOperation: 'list',
        }),
      ],
    })
    .authorization((allow) => allow.owner()),
}).authorization((allow) => [allow.resource(placeOrderFunction)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
