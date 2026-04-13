import { Router } from "express";
import { createNotification, getNotifications, getNotificationById, markAsRead, markAllAsRead, deleteNotification, deleteAllRead, getUnreadCount } from "./notification.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin, isRestaurantAdmin } from "../../middlewares/role.middleware.js";

const belongsToNotificationRestaurant = (req, res, next) => {
    if (!req.user || req.user.role === 'ADMIN_GENERAL') return next();
    const restaurantId = req.body?.restaurantId;
    if (!restaurantId) return next();
    if (!req.user.restaurantId || req.user.restaurantId.toString() !== restaurantId.toString()) {
        return res.status(403).json({ success: false, message: 'Acceso denegado. No tienes autorización para operar en este restaurante.' });
    }
    next();
};

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /notifications/create:
 *   post:
 *     summary: Crear una notificación (solo ADMIN_GENERAL)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Notificación creada exitosamente }
 *                 data:    { $ref: '#/components/schemas/NotificationResponse' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', isPlatformAdmin, belongsToNotificationRestaurant, createNotification);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Listar notificaciones (filtrado automático por rol)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **ADMIN_GENERAL**: ve todas; puede filtrar por `user`
 *       - **ADMIN_RESTAURANTE**: ve las suyas y las de su restaurante
 *       - **CLIENTE**: solo ve las suyas
 *       
 *       Solo retorna notificaciones no expiradas.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *         description: Tipo de notificación
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: user
 *         schema: { type: string }
 *         description: ID de usuario (solo ADMIN_GENERAL)
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:     { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/NotificationResponse' }
 *                 pagination:  { $ref: '#/components/schemas/PaginationMeta' }
 *                 unreadCount: { type: integer, example: 5 }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /notifications/unread/count:
 *   get:
 *     summary: Obtener cantidad de notificaciones no leídas del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contador de no leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:     { type: boolean, example: true }
 *                 unreadCount: { type: integer, example: 3 }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/unread/count', getUnreadCount);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Obtener notificación por ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notificación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/NotificationResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos para ver esta notificación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Notificación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
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
 *       403:
 *         description: Sin permisos para eliminar esta notificación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Notificación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getNotificationById);
router.delete('/:id', deleteNotification);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Notificación marcada como leída }
 *                 data:    { $ref: '#/components/schemas/NotificationResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin permisos para modificar esta notificación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Notificación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/read', markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones del usuario como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:       { type: boolean, example: true }
 *                 message:       { type: string,  example: 5 notificaciones marcadas como leídas }
 *                 modifiedCount: { type: integer, example: 5 }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Eliminar todas las notificaciones leídas del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones leídas eliminadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:      { type: boolean, example: true }
 *                 message:      { type: string,  example: 3 notificaciones leídas eliminadas }
 *                 deletedCount: { type: integer, example: 3 }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/read-all', markAllAsRead);
router.delete('/read-all', deleteAllRead);

export default router;