import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BASE_PATH = '/kinalGourmetHouse/v1'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kinal Gourmet House API',
      version: '1.0.0',
      description: `
## 🍽️ API REST — Kinal Gourmet House

Documentación oficial de todos los endpoints del sistema de gestión de restaurantes.

### Módulos disponibles
- **Auth** — Registro, login y verificación de cuenta
- **Users** — Gestión de usuarios
- **Restaurants** — Restaurantes
- **Tables** — Mesas
- **Dishes** — Platillos
- **Reservations** — Reservaciones
- **Orders** — Pedidos
- **Reviews** — Reseñas
- **Promotions** — Promociones
- **Events** — Eventos
- **Invoices** — Facturas
- **Coupons** — Cupones
- **Notifications** — Notificaciones
- **Reports** — Reportes
      `,
      contact: {
        name: 'Kinal Gourmet House',
        email: 'soporte@kinalgourmet.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}${BASE_PATH}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido en /auth/login',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string',  example: 'Juan Pérez' },
            email:    { type: 'string',  format: 'email', example: 'juan@example.com' },
            password: { type: 'string',  minLength: 6,    example: 'secret123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'juan@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        DishInput: {
  type: 'object',
  required: ['name', 'price', 'type', 'restaurant'],
  properties: {
    name: {
      type: 'string',
      example: 'Tacos de Canasta'
    },
    description: {
      type: 'string',
      example: 'Tacos tradicionales mexicanos'
    },
    price: {
      type: 'number',
      example: 45.00
    },
    type: {
      type: 'string',
      example: 'MAIN'
    },
    restaurant: {
      type: 'string',
      example: '64f1a2b3c4d5e6f7a8b9c0d2'
    },
    isAvailable: {
      type: 'boolean',
      example: true
    },
    ingredients: {
      type: 'array',
      items: { type: 'string' },
      example: ['tortilla', 'frijoles', 'chile']
    }
  }
},

DishResponse: {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string', example: 'Tacos de Canasta' },
    description: { type: 'string' },
    price: { type: 'number', example: 45.00 },
    type: { type: 'string', example: 'MAIN' },
    isAvailable: { type: 'boolean', example: true },
    ingredients: {
      type: 'array',
      items: { type: 'string' }
    },
    image: {
      type: 'string',
      example: 'https://res.cloudinary.com/...'
    },
    image_public_id: {
      type: 'string',
      example: 'dishes/abc123'
    },
    restaurant: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' }
      }
    },
    menu: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' }
      }
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    }
  }
},
CouponInput: {
  type: 'object',
  required: ['code', 'discountType', 'discountValue', 'validFrom', 'validUntil'],
  properties: {
    code:                   { type: 'string',  example: 'DESCUENTO20' },
    description:            { type: 'string',  example: '20% de descuento en tu pedido' },
    discountType:           { type: 'string',  enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' },
    discountValue:          { type: 'number',  example: 20 },
    maxDiscount:            { type: 'number',  example: 100 },
    minOrderAmount:         { type: 'number',  example: 50 },
    usageLimit:             { type: 'integer', example: 100 },
    usageLimitPerUser:      { type: 'integer', example: 1 },
    validFrom:              { type: 'string',  format: 'date-time' },
    validUntil:             { type: 'string',  format: 'date-time' },
    isActive:               { type: 'boolean', example: true },
    applicableRestaurants:  { type: 'array', items: { type: 'string' }, example: ['64f1a2b3c4d5e6f7a8b9c0d2'] },
  },
},
CouponResponse: {
  type: 'object',
  properties: {
    _id:                    { type: 'string' },
    code:                   { type: 'string',  example: 'DESCUENTO20' },
    description:            { type: 'string' },
    discountType:           { type: 'string',  enum: ['PERCENTAGE', 'FIXED'] },
    discountValue:          { type: 'number',  example: 20 },
    usageLimit:             { type: 'integer', example: 100 },
    usedCount:              { type: 'integer', example: 5 },
    validFrom:              { type: 'string',  format: 'date-time' },
    validUntil:             { type: 'string',  format: 'date-time' },
    isActive:               { type: 'boolean', example: true },
    applicableRestaurants:  { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, address: { type: 'string' } } } },
    createdByName:          { type: 'string',  example: 'Admin' },
    createdAt:              { type: 'string',  format: 'date-time' },
  },
},
EventInput: {
  type: 'object',
  required: ['name', 'date', 'restaurant'],
  properties: {
    name:               { type: 'string',  example: 'Noche de Jazz' },
    description:        { type: 'string',  example: 'Una velada con música en vivo' },
    date:               { type: 'string',  format: 'date-time' },
    restaurant:         { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d2' },
    specialMenu:        { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d3' },
    capacity:           { type: 'integer', example: 50 },
    price:              { type: 'number',  example: 150.00 },
    isActive:           { type: 'boolean', example: true },
    additionalServices: { type: 'string',  example: 'estacionamiento, fotografía' },
  },
},
EventResponse: {
  type: 'object',
  properties: {
    _id:                { type: 'string' },
    name:               { type: 'string',  example: 'Noche de Jazz' },
    description:        { type: 'string' },
    date:               { type: 'string',  format: 'date-time' },
    status:             { type: 'string',  enum: ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'] },
    isActive:           { type: 'boolean', example: true },
    capacity:           { type: 'integer', example: 50 },
    price:              { type: 'number',  example: 150.00 },
    additionalServices: { type: 'array',   items: { type: 'string' } },
    restaurant:         { type: 'object',  properties: { name: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } },
    specialMenu:        { type: 'object',  properties: { name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' } } },
    createdAt:          { type: 'string',  format: 'date-time' },
    updatedAt:          { type: 'string',  format: 'date-time' },
  },
},
InvoiceInput: {
  type: 'object',
  required: ['order', 'restaurant', 'subtotal', 'paymentMethod'],
  properties: {
    order:            { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
    restaurant:       { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
    subtotal:         { type: 'number', example: 200.00 },
    taxRate:          { type: 'number', example: 12 },
    discount:         { type: 'number', example: 20.00 },
    tip:              { type: 'number', example: 30.00 },
    serviceCharge:    { type: 'number', example: 10.00 },
    deliveryFee:      { type: 'number', example: 15.00 },
    paymentMethod:    { type: 'string', enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'], example: 'EFECTIVO' },
    amountPaid:       { type: 'number', example: 250.00 },
    paymentReference: { type: 'string', example: 'REF-001' },
    invoiceType:      { type: 'string', enum: ['FACTURA', 'RECIBO'], example: 'FACTURA' },
    notes:            { type: 'string', example: 'Sin observaciones' },
    customerInfo:     { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, nit: { type: 'string' } } },
    restaurantInfo:   { type: 'object', properties: { name: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } },
    items:            { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, quantity: { type: 'integer' }, unitPrice: { type: 'number' }, total: { type: 'number' } } } },
  },
},
InvoiceUpdateInput: {
  type: 'object',
  description: 'Campos actualizables (no se permite cambiar order, invoiceNumber ni userId)',
  properties: {
    paymentStatus:    { type: 'string', enum: ['PENDIENTE', 'PAGADO', 'ANULADO'], example: 'PAGADO' },
    paymentReference: { type: 'string', example: 'REF-002' },
    notes:            { type: 'string', example: 'Pago recibido en caja' },
    tip:              { type: 'number', example: 40.00 },
  },
},
InvoiceResponse: {
  type: 'object',
  properties: {
    _id:             { type: 'string' },
    invoiceNumber:   { type: 'string',  example: 'INV-1718000000000-123' },
    invoiceType:     { type: 'string',  enum: ['FACTURA', 'RECIBO'] },
    paymentStatus:   { type: 'string',  enum: ['PENDIENTE', 'PAGADO', 'ANULADO'] },
    paymentMethod:   { type: 'string',  example: 'EFECTIVO' },
    subtotal:        { type: 'number',  example: 200.00 },
    taxRate:         { type: 'number',  example: 12 },
    taxAmount:       { type: 'number',  example: 24.00 },
    discount:        { type: 'number',  example: 20.00 },
    tip:             { type: 'number',  example: 30.00 },
    serviceCharge:   { type: 'number',  example: 10.00 },
    deliveryFee:     { type: 'number',  example: 15.00 },
    totalAmount:     { type: 'number',  example: 259.00 },
    amountPaid:      { type: 'number',  example: 300.00 },
    changeReturned:  { type: 'number',  example: 41.00 },
    restaurant:      { type: 'object',  properties: { name: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } },
    order:           { type: 'object',  properties: { orderType: { type: 'string' }, status: { type: 'string' }, totalPrice: { type: 'number' } } },
    userInfo:        { type: 'object',  properties: { name: { type: 'string' }, email: { type: 'string' } } },
    createdAt:       { type: 'string',  format: 'date-time' },
  },
},
MenuInput: {
  type: 'object',
  required: ['name', 'restaurant'],
  properties: {
    name:        { type: 'string',  example: 'Menú del Día' },
    description: { type: 'string',  example: 'Menú especial de temporada' },
    restaurant:  { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d2' },
    isActive:    { type: 'boolean', example: true },
  },
},
MenuResponse: {
  type: 'object',
  properties: {
    _id:         { type: 'string' },
    name:        { type: 'string',  example: 'Menú del Día' },
    description: { type: 'string' },
    isActive:    { type: 'boolean', example: true },
    restaurant:  { type: 'object',  properties: { _id: { type: 'string' }, name: { type: 'string' }, address: { type: 'string' } } },
    createdAt:   { type: 'string',  format: 'date-time' },
    updatedAt:   { type: 'string',  format: 'date-time' },
  },
},
NotificationInput: {
  type: 'object',
  required: ['userId', 'title', 'message'],
  properties: {
    userId:       { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d1' },
    restaurantId: { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d2' },
    title:        { type: 'string',  example: 'Tu reservación fue confirmada' },
    message:      { type: 'string',  example: 'Tu mesa está lista para el viernes a las 8pm' },
    type:         { type: 'string',  example: 'RESERVATION' },
    priority:     { type: 'string',  enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM' },
    expiresAt:    { type: 'string',  format: 'date-time' },
  },
},
NotificationResponse: {
  type: 'object',
  properties: {
    _id:       { type: 'string' },
    userId:    { type: 'string' },
    title:     { type: 'string',  example: 'Tu reservación fue confirmada' },
    message:   { type: 'string' },
    type:      { type: 'string',  example: 'RESERVATION' },
    priority:  { type: 'string',  enum: ['LOW', 'MEDIUM', 'HIGH'] },
    isRead:    { type: 'boolean', example: false },
    readAt:    { type: 'string',  format: 'date-time', nullable: true },
    expiresAt: { type: 'string',  format: 'date-time', nullable: true },
    createdAt: { type: 'string',  format: 'date-time' },
  },
},
OrderInput: {
  type: 'object',
  required: ['restaurant', 'details'],
  properties: {
    restaurant:      { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d2' },
    table:           { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d3' },
    orderType:       { type: 'string',  enum: ['EN_MESA', 'PARA_LLEVAR', 'DELIVERY'], example: 'EN_MESA' },
    couponCode:      { type: 'string',  example: 'DESCUENTO20' },
    deliveryAddress: { type: 'string',  example: '5a Avenida 10-20, Zona 1' },
    deliveryPhone:   { type: 'string',  example: '50250000000' },
    details: {
      type: 'array',
      items: {
        type: 'object',
        required: ['dish', 'quantity', 'unitPrice'],
        properties: {
          dish:       { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d4' },
          quantity:   { type: 'integer', example: 2 },
          unitPrice:  { type: 'number',  example: 45.00 },
          notes:      { type: 'string',  example: 'Sin cebolla' },
        },
      },
    },
  },
},
OrderResponse: {
  type: 'object',
  properties: {
    _id:             { type: 'string' },
    status:          { type: 'string',  enum: ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'] },
    orderType:       { type: 'string',  enum: ['EN_MESA', 'PARA_LLEVAR', 'DELIVERY'] },
    totalPrice:      { type: 'number',  example: 80.00 },
    discount:        { type: 'number',  example: 10.00 },
    appliedCoupon:   { type: 'string',  nullable: true },
    deliveryAddress: { type: 'string',  nullable: true },
    deliveryPhone:   { type: 'string',  nullable: true },
    userInfo:        { type: 'object',  properties: { name: { type: 'string' }, email: { type: 'string' } } },
    restaurant:      { type: 'object',  properties: { name: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } },
    table:           { type: 'object',  nullable: true, properties: { number: { type: 'integer' }, capacity: { type: 'integer' } } },
    details: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dish:      { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } } },
          quantity:  { type: 'integer', example: 2 },
          unitPrice: { type: 'number',  example: 45.00 },
          notes:     { type: 'string',  nullable: true },
        },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
},
PromotionInput: {
  type: 'object',
  required: ['title', 'restaurant', 'startDate', 'endDate'],
  properties: {
    title:       { type: 'string',  example: '2x1 en pizzas' },
    description: { type: 'string',  example: 'Lleva dos pizzas al precio de una' },
    restaurant:  { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d2' },
    startDate:   { type: 'string',  format: 'date-time' },
    endDate:     { type: 'string',  format: 'date-time' },
    isActive:    { type: 'boolean', example: true },
    discount:    { type: 'number',  example: 50 },
    discountType:{ type: 'string',  enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' },
  },
},
PromotionResponse: {
  type: 'object',
  properties: {
    _id:         { type: 'string' },
    title:       { type: 'string',  example: '2x1 en pizzas' },
    description: { type: 'string' },
    startDate:   { type: 'string',  format: 'date-time' },
    endDate:     { type: 'string',  format: 'date-time' },
    isActive:    { type: 'boolean', example: true },
    discount:    { type: 'number',  example: 50 },
    discountType:{ type: 'string',  enum: ['PERCENTAGE', 'FIXED'] },
    restaurant:  { type: 'object',  properties: { name: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } },
    createdAt:   { type: 'string',  format: 'date-time' },
    updatedAt:   { type: 'string',  format: 'date-time' },
  },
},
        // ── Respuestas comunes ────────────────────────────
        UserResponse: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            name:      { type: 'string',  example: 'Juan Pérez' },
            email:     { type: 'string',  example: 'juan@example.com' },
            isActive:  { type: 'boolean', example: true },
            roleId:    { type: 'integer', example: 2 },
            createdAt: { type: 'string',  format: 'date-time' },
            updatedAt: { type: 'string',  format: 'date-time' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Operación exitosa' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'Error al procesar la solicitud' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total:       { type: 'integer', example: 100 },
            page:        { type: 'integer', example: 1 },
            limit:       { type: 'integer', example: 10 },
            totalPages:  { type: 'integer', example: 10 },
          },
        },
      },
    },
    tags: [
      { name: 'Health',        description: 'Estado del servidor' },
      { name: 'Auth',          description: 'Autenticación y autorización' },
      { name: 'Users',         description: 'Gestión de usuarios' },
      { name: 'Restaurants',   description: 'Gestión de restaurantes' },
      { name: 'Tables',        description: 'Gestión de mesas' },
      { name: 'Dishes',        description: 'Gestión de platillos' },
      { name: 'Reservations',  description: 'Gestión de reservaciones' },
      { name: 'Orders',        description: 'Gestión de pedidos' },
      { name: 'Reviews',       description: 'Reseñas de usuarios' },
      { name: 'Promotions',    description: 'Promociones activas' },
      { name: 'Events',        description: 'Eventos del restaurante' },
      { name: 'Invoices',      description: 'Facturas y pagos' },
      { name: 'Coupons',       description: 'Cupones de descuento' },
      { name: 'Notifications', description: 'Notificaciones del sistema' },
      { name: 'Reports',       description: 'Reportes y estadísticas' },
    ],
  },
  // Apunta a todos los archivos de rutas
  apis: [
    join(__dirname, '../src/auth/auth.routes.js'),
    join(__dirname, '../src/users/user.routes.js'),
    join(__dirname, '../src/restaurants/resturant.routes.js'),
    join(__dirname, '../src/tables/table.routes.js'),
    join(__dirname, '../src/dishes/dish.routes.js'),
    join(__dirname, '../src/reservations/reservation.routes.js'),
    join(__dirname, '../src/orders/order.routes.js'),
    join(__dirname, '../src/reviews/review.routes.js'),
    join(__dirname, '../src/promotions/promotion.routes.js'),
    join(__dirname, '../src/events/event.routes.js'),
    join(__dirname, '../src/invoices/invoice.routes.js'),
    join(__dirname, '../src/coupons/coupon.routes.js'),
    join(__dirname, '../src/notifications/notification.routes.js'),
    join(__dirname, '../src/reports/report.routes.js'),
  ],
}

export const swaggerSpec = swaggerJSDoc(options)
export { swaggerUi }