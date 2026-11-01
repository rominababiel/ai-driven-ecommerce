# Brief de diseño — M5 Moda

## Contexto
E-commerce de ropa urbana y básicos esenciales con asistente de moda con IA. Proyecto del curso "AI Driven Web Development" (catálogo, filtros, carrito, checkout, roles admin/cliente, flujo end-to-end).
Stack: React 19 + TypeScript + Tailwind CSS v4. Todo lo diseñado debe poder implementarse con utilidades de Tailwind y componentes React reutilizables. Sin librerías de UI pesadas.

## Objetivo
La interfaz actual es funcional pero genérica. Necesito una identidad de marca de moda: editorial, minimalista, con protagonismo de la fotografía y microinteracciones cuidadas. Premium pero accesible. Referencias de tono: tiendas urbanas contemporáneas (fondo claro, tipografía grande, mucho aire, acentos de color puntuales).

## Público
Personas de 18 a 35 años, compran principalmente desde el celular. Diseño mobile-first, responsive (360px, 768px, 1280px+).

## Marca
- Nombre: M5 Moda. Proponer logotipo tipográfico simple (sirve como favicon).
- Voz: cercana, breve, en español rioplatense neutro ("Agregá al carrito" / "Agregar al carrito" — elegir uno y sostenerlo).
- Moneda: USD. Envío gratis desde USD 100, si no USD 9,99.

## Sistema de diseño (entregable obligatorio)
- Tokens de color: fondo, superficie, texto principal/secundario, borde, acento de marca, éxito, advertencia, error, info. Versión clara y oscura.
- Tipografía: una display para títulos y una para texto (Google Fonts). Escala de tamaños, pesos e interlineados.
- Espaciados, radios, sombras, grilla y breakpoints.
- Iconografía: un solo set lineal consistente (carrito, usuario, búsqueda, filtro, corazón, chat, cerrar, flechas, estrella).
- Motion: duraciones y curvas para hover, aparición de drawer/modal, agregado al carrito, mensajes del chat.

## Componentes (con estados default, hover, focus visible, active, disabled, loading, error)
Button (primario, secundario, ghost, destructivo, solo ícono) · Input, Textarea, Select, Checkbox, Radio, Range de precio · Badge de estado de pedido y de stock · Chip de filtro removible · Card de producto · Rating de estrellas · Stepper de cantidad · Alert / Toast · Modal y Drawer · Tabs · Tabla (admin) · Paginación · Skeleton de carga · Spinner · Empty state · Breadcrumb · Avatar / menú de usuario.

## Pantallas

### Globales
- Header: logo, buscador, Catálogo, Mis pedidos, Admin (solo rol admin), carrito con contador animado, menú de usuario (login / cerrar sesión). Versión mobile con menú hamburguesa.
- Footer: enlaces, redes, aviso de proyecto académico.
- Mini-carrito en drawer al agregar un producto.

### 1. Home / Catálogo
- Hero de temporada ("Nueva temporada") con imagen grande y CTA.
- Accesos a categorías: Remeras, Pantalones, Calzado, Abrigos, Accesorios.
- Grilla de productos (2 columnas mobile, 3–4 desktop).
- Filtros: categoría, rango de precio, solo con stock, buscador y orden (relevancia, menor precio, mayor precio, mejor valorado). En mobile, en un drawer. Contador de filtros activos, chips removibles y "Limpiar filtros".
- Contador de resultados, skeletons de carga y estado "sin resultados".

### 2. Card de producto
Imagen (con segunda imagen en hover), nombre, categoría, precio, rating, badge "Sin stock" / "Últimas unidades", botón agregar al carrito y favorito.

### 3. Detalle de producto
Galería con miniaturas, nombre, precio, rating, descripción, stock disponible, selector de talle y color (fase 2, dejar previsto), stepper de cantidad, agregar al carrito, info de envío y devoluciones, productos relacionados y botón "Preguntale al asistente".

### 4. Carrito
Lista de ítems con imagen, stepper, eliminar, subtotal por ítem. Resumen: subtotal, envío, total. Barra de progreso hacia el envío gratis ("Te faltan USD X para el envío gratis"). Estado vacío con CTA al catálogo.

### 5. Checkout
Pasos: Envío → Pago → Confirmación (indicador de progreso).
- Envío: nombre, email, dirección, ciudad, código postal, país.
- Pago: tarjeta (número, nombre, vencimiento, CVC) con aviso de modo prueba. Dejar previsto botón "Pagar con Stripe / Mercado Pago".
- Validación inline, resumen del pedido fijo a un costado (desktop) o colapsable (mobile).
- Pantalla de éxito con número de pedido y CTA a "Mis pedidos". Pantalla de error de pago.

### 6. Mis pedidos
Lista de pedidos con fecha, número, cantidad de ítems, total y badge de estado (Pagado, Enviado, Entregado, Cancelado). Detalle expandible con ítems y dirección. Estado vacío.

### 7. Autenticación
Login, Registro y Confirmación por código de 6 dígitos (enviado al email). Mensajes de error claros, mostrar/ocultar contraseña, requisitos de contraseña. Accesos rápidos a cuentas demo (solo en modo demo).

### 8. Panel Admin (rol admin)
- Layout con navegación lateral (desktop) / tabs (mobile).
- Dashboard (fase 2): ventas totales, pedidos del día, más vendidos, alertas de stock bajo.
- Productos: tabla con imagen, nombre, categoría, precio, stock, acciones (editar / eliminar con confirmación). Botón "Nuevo producto" y "Cargar catálogo demo". Formulario de alta/edición con preview de imagen y validaciones.
- Pedidos: tabla con cliente, fecha, total, estado editable (select), filtro por estado.

### 9. Asistente de moda con IA (pieza destacada)
- Botón flotante con identidad propia (no un ícono genérico de chat).
- Panel: desktop flotante, mobile pantalla completa.
- Mensaje de bienvenida, sugerencias rápidas ("Remeras de menos de 25", "Busco un jean", "Armame un outfit para el finde").
- Burbujas usuario / asistente, indicador "escribiendo…", streaming de texto.
- Cards de producto dentro de la conversación con "Agregar al carrito".
- Estados: requiere iniciar sesión, error de conexión, reintentar, limpiar conversación.

### 10. Sistema
Página 404, error genérico, pantallas de carga, toasts de confirmación ("Agregado al carrito", "Pedido confirmado").

## Accesibilidad
WCAG AA: contraste mínimo 4.5:1 en texto, foco visible en todo lo interactivo, labels en todos los campos, áreas táctiles de 44px, sin depender solo del color para estados.

## Fotografía
Estilo: fondo neutro o urbano, luz natural, modelos diversos. Proporción de producto 4:5. Indicar placeholders si no hay fotos.

## Entregables
1. Sistema de diseño (tokens + componentes con estados).
2. Todas las pantallas en mobile y desktop.
3. Flujo prototipado: catálogo → detalle → carrito → checkout → confirmación → mis pedidos.
4. Flujo del asistente: pregunta → recomendación → agregar al carrito.
5. Tokens exportables como variables CSS para Tailwind v4 (`@theme`).
