# AI Driven E-Commerce

E-commerce de **ropa y moda urbana** con catálogo, filtros, carrito, checkout, roles (admin/cliente) y un agente IA que recomienda prendas y arma outfits con el catálogo real.

**Stack:** React 19 · TypeScript · Context API + `useReducer` · React Router · Tailwind CSS · AWS Amplify Gen 2 (Cognito, AppSync + DynamoDB, Bedrock vía AI Kit) · Vitest + Testing Library.

## Inicio rápido

```bash
npm install
npm run dev
```

Sin `amplify_outputs.json` la app arranca en **modo local**: los datos viven en `localStorage` y el asistente usa un motor de intención local. Cuentas demo:

| Rol     | Correo             | Contraseña    |
| ------- | ------------------ | ------------- |
| Admin   | `admin@shop.dev`   | `Admin123!`   |
| Cliente | `cliente@shop.dev` | `Cliente123!` |

## Conectar AWS

```bash
npx ampx sandbox
```

El sandbox despliega Cognito, la API GraphQL con tablas DynamoDB y la ruta de conversación con Bedrock (Claude Haiku 4.5), y genera `amplify_outputs.json`. Al detectarlo la app pasa sola a los adaptadores de AWS. Para forzar el modo local usa `VITE_DATA_SOURCE=local`.

1. Activa el acceso al modelo en la consola de Amazon Bedrock para la región del sandbox.
2. Regístrate en la app y agrega tu usuario al grupo `ADMINS` desde la consola de Cognito.
3. En **Admin → Productos** usa “Cargar catálogo demo” para poblar DynamoDB.

**Deploy:** conecta el repositorio en Amplify Hosting; `amplify.yml` despliega backend y frontend por rama. Agrega la regla de rewrite SPA `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` → `/index.html` (200).

## Arquitectura

```
amplify/                    Backend como código (auth, data, agente IA)
src/
  app/                      Composición: router, layout, providers
  services/                 Contrato de servicios + fábrica (AWS o local)
  infrastructure/amplify/   Configuración y cliente de Amplify
  shared/                   UI base, hooks y utilidades sin dominio
  features/
    <feature>/
      domain/               Tipos, reglas puras y puertos (interfaces)
      application/          Casos de uso
      infrastructure/       Adaptadores (Amplify / local)
      state/                Context + useReducer
      ui/                   Páginas y componentes
```

- Las reglas de negocio (filtros, carrito, precios, validación de checkout) son funciones puras sin dependencias de React ni AWS.
- La UI depende de puertos (`ProductRepository`, `OrderRepository`, `AuthGateway`, `AssistantGateway`) inyectados por `ServicesContext`. Cambiar de proveedor solo afecta `services/createServices.ts`.
- La seguridad se aplica en el backend: productos de lectura pública y escritura solo para `ADMINS`; pedidos visibles para su dueño y para `ADMINS`; conversaciones del agente aisladas por usuario.

### Agente IA

`shopAssistant` es una ruta de conversación de Amplify AI Kit con la herramienta `searchCatalog`, que consulta el modelo `Product` en DynamoDB con los permisos del usuario. El agente responde en streaming y solo recomienda productos reales del catálogo.

## Scripts

| Script              | Descripción                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Servidor de desarrollo            |
| `npm run build`     | Type-check y build de producción  |
| `npm test`          | Tests unitarios y de integración  |
| `npm run lint`      | Linter (oxlint)                   |
| `npm run sandbox`   | Sandbox de Amplify en tu cuenta   |
