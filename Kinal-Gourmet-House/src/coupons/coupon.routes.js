import { Router } from "express";
import { createCoupon, getCoupons, getCouponById, getCouponByCode, validateCoupon, updateCoupon, deleteCoupon, getCouponUsageHistory, getUserCouponUsage } from "./coupon.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin, isRestaurantAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validar un cupón antes de aplicarlo
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, userId]
 *             properties:
 *               code:
 *                 type: string
 *                 example: DESCUENTO20
 *               userId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               restaurantId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d2
 *               orderTotal:
 *                 type: number
 *                 example: 150.00
 *     responses:
 *       200:
 *         description: Cupón válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cupón válido
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupon:
 *                       type: object
 *                       properties:
 *                         id:           { type: string }
 *                         code:         { type: string, example: DESCUENTO20 }
 *                         description:  { type: string }
 *                         discountType: { type: string, enum: [PERCENTAGE, FIXED] }
 *                         discountValue:{ type: number, example: 20 }
 *                     estimatedDiscount:
 *                       type: number
 *                       example: 30.00
 *       400:
 *         description: Cupón inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cupón no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/validate', validateCoupon);

/**
 * @swagger
 * /coupons/code/{code}:
 *   get:
 *     summary: Obtener cupón por código
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: DESCUENTO20
 *         description: Código del cupón (se convierte a mayúsculas automáticamente)
 *     responses:
 *       200:
 *         description: Cupón encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/CouponResponse' }
 *       404:
 *         description: Cupón no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/code/:code', getCouponByCode);

/**
 * @swagger
 * /coupons/create:
 *   post:
 *     summary: Crear un nuevo cupón
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponInput'
 *     responses:
 *       201:
 *         description: Cupón creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Cupón creado exitosamente }
 *                 data:    { $ref: '#/components/schemas/CouponResponse' }
 *       400:
 *         description: Error de validación o código duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin autorización para crear cupones en este restaurante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createCoupon);

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Listar cupones con filtros y paginación
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: restaurant
 *         schema: { type: string }
 *         description: ID del restaurante para filtrar
 *       - in: query
 *         name: current
 *         schema: { type: boolean }
 *         description: Solo cupones vigentes (dentro de fecha de validez y con usos disponibles)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Buscar por código o descripción
 *     responses:
 *       200:
 *         description: Lista de cupones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CouponResponse' }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyToken, getCoupons);

/**
 * @swagger
 * /coupons/{id}/usage:
 *   get:
 *     summary: Historial de uso de un cupón
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del cupón (MongoDB ObjectId)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Historial de uso del cupón
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:  { type: object, properties: { name: { type: string }, email: { type: string } } }
 *                       order: { type: object, properties: { totalPrice: { type: number }, status: { type: string }, createdAt: { type: string, format: date-time } } }
 *                       usedAt: { type: string, format: date-time }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/usage', verifyToken, isRestaurantAdmin, getCouponUsageHistory);

/**
 * @swagger
 * /coupons/user/{userId}/usage:
 *   get:
 *     summary: Cupones usados por un usuario específico
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *         description: ID del usuario (MongoDB ObjectId)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de cupones usados por el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       coupon: { type: object, properties: { code: { type: string }, description: { type: string }, discountType: { type: string }, discountValue: { type: number } } }
 *                       order:  { type: object, properties: { totalPrice: { type: number }, status: { type: string } } }
 *                       usedAt: { type: string, format: date-time }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user/:userId/usage', verifyToken, getUserCouponUsage);

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Obtener cupón por ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del cupón (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Cupón encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/CouponResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cupón no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Actualizar un cupón
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponInput'
 *     responses:
 *       200:
 *         description: Cupón actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Cupón actualizado exitosamente }
 *                 data:    { $ref: '#/components/schemas/CouponResponse' }
 *       400:
 *         description: ID inválido o no se puede cambiar código de cupón ya usado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin autorización para modificar este cupón
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cupón no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Eliminar o desactivar un cupón
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cupón eliminado o desactivado (si ya fue usado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Sin autorización para eliminar este cupón
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cupón no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', verifyToken, getCouponById);
router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateCoupon);
router.delete('/:id', verifyToken, isRestaurantAdmin, deleteCoupon);

export default router;