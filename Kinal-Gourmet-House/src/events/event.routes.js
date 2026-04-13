import { Router } from "express";
import { createEvent, getEvents, getEventById, getEventsByRestaurant, updateEvent, updateEventStatus, cancelEvent, deleteEvent } from "./event.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Listar eventos con filtros y paginación
 *     tags: [Events]
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
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO] }
 *       - in: query
 *         name: restaurant
 *         schema: { type: string }
 *         description: ID del restaurante (ADMIN_RESTAURANTE solo ve los suyos)
 *       - in: query
 *         name: upcoming
 *         schema: { type: boolean }
 *         description: Solo eventos en los próximos 30 días
 *       - in: query
 *         name: past
 *         schema: { type: boolean }
 *         description: Solo eventos pasados
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/EventResponse' }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyToken, getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/EventResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Actualizar un evento
 *     tags: [Events]
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
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Evento actualizado exitosamente }
 *                 data:    { $ref: '#/components/schemas/EventResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Eliminar un evento (solo ADMIN_PLATAFORMA)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
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
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getEventById);
router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateEvent);
router.delete('/:id', verifyToken, isPlatformAdmin, deleteEvent);

/**
 * @swagger
 * /events/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtener eventos activos de un restaurante
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema: { type: string }
 *         description: ID del restaurante (MongoDB ObjectId)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO] }
 *       - in: query
 *         name: upcoming
 *         schema: { type: boolean }
 *         description: Solo eventos futuros
 *     responses:
 *       200:
 *         description: Lista de eventos del restaurante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/EventResponse' }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       400:
 *         description: ID de restaurante inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/restaurant/:restaurantId', getEventsByRestaurant);

/**
 * @swagger
 * /events/create:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Evento creado exitosamente }
 *                 data:    { $ref: '#/components/schemas/EventResponse' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createEvent);

/**
 * @swagger
 * /events/{id}/status:
 *   patch:
 *     summary: Actualizar estado de un evento
 *     tags: [Events]
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO]
 *                 example: EN_CURSO
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Estado del evento actualizado correctamente }
 *                 data:    { $ref: '#/components/schemas/EventResponse' }
 *       400:
 *         description: Estado inválido o ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/status', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateEventStatus);

/**
 * @swagger
 * /events/{id}/cancel:
 *   patch:
 *     summary: Cancelar un evento (status=CANCELADO, isActive=false)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Evento cancelado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Evento cancelado correctamente }
 *                 data:    { $ref: '#/components/schemas/EventResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/cancel', verifyToken, isRestaurantAdmin, belongsToRestaurant, cancelEvent);

export default router;