import { Router } from "express";
import { createReservation, getReservations, getReservationById, updateReservation, deleteReservation } from "./reservation.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Reservaciones
 *   description: Gestión de reservaciones
 */

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /api/reservations/create:
 *   post:
 *     summary: Crear una reservación
 *     tags: [Reservaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant
 *               - table
 *               - date
 *               - time
 *               - numberOfGuests
 *             properties:
 *               restaurant:
 *                 type: string
 *               table:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 example: "18:00"
 *               numberOfGuests:
 *                 type: integer
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservación creada exitosamente
 *       400:
 *         description: Error en datos
 *       409:
 *         description: Conflicto de reservación
 */
router.post('/create', belongsToRestaurant, createReservation);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Obtener todas las reservaciones
 *     tags: [Reservaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: restaurant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reservaciones
 */
router.get('/', getReservations);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Obtener reservación por ID
 *     tags: [Reservaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación encontrada
 *       404:
 *         description: No encontrada
 */
router.get('/:id', getReservationById);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Actualizar reservación
 *     tags: [Reservaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               numberOfGuests:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reservación actualizada
 */
router.put('/:id', belongsToRestaurant, updateReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Eliminar reservación
 *     tags: [Reservaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación eliminada
 */
router.delete('/:id', deleteReservation);

export default router;