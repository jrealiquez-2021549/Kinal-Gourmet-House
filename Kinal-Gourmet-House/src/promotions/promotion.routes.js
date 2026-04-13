import { Router } from "express";
import { createPromotion, getPromotions, getPromotionById, updatePromotion, deletePromotion } from "./promotion.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /promotions:
 *   get:
 *     summary: Listar promociones con filtros y paginación
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     description: ADMIN_RESTAURANTE solo ve las promociones de su propio restaurante.
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
 *         description: ID del restaurante
 *       - in: query
 *         name: current
 *         schema: { type: boolean }
 *         description: Solo promociones vigentes (dentro de startDate y endDate, y activas)
 *     responses:
 *       200:
 *         description: Lista de promociones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PromotionResponse' }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyToken, getPromotions);

/**
 * @swagger
 * /promotions/{id}:
 *   get:
 *     summary: Obtener promoción por ID
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de la promoción (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Promoción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/PromotionResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Promoción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Actualizar una promoción
 *     tags: [Promotions]
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
 *             $ref: '#/components/schemas/PromotionInput'
 *     responses:
 *       200:
 *         description: Promoción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Promoción actualizada exitosamente }
 *                 data:    { $ref: '#/components/schemas/PromotionResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Promoción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Eliminar una promoción (solo ADMIN_PLATAFORMA)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Promoción eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Promoción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getPromotionById);
router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updatePromotion);
router.delete('/:id', verifyToken, isPlatformAdmin, deletePromotion);

/**
 * @swagger
 * /promotions/create:
 *   post:
 *     summary: Crear una nueva promoción
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromotionInput'
 *     responses:
 *       201:
 *         description: Promoción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Promoción creada exitosamente }
 *                 data:    { $ref: '#/components/schemas/PromotionResponse' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createPromotion);

export default router;