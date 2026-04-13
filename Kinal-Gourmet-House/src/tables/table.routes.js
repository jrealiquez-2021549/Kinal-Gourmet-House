import { Router } from "express";
import { createTable, getTables, getTableById, updateTable, deleteTable } from "./table.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Mesas
 *   description: Gestión de mesas en restaurantes
 */

const router = Router();

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Obtener todas las mesas
 *     tags: [Mesas]
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
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: restaurant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de mesas
 */
router.get('/', verifyToken, getTables);

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Obtener mesa por ID
 *     tags: [Mesas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mesa encontrada
 *       404:
 *         description: Mesa no encontrada
 */
router.get('/:id', getTableById);

/**
 * @swagger
 * /api/tables/create:
 *   post:
 *     summary: Crear mesa
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - capacity
 *               - restaurant
 *             properties:
 *               number:
 *                 type: integer
 *                 example: 5
 *               capacity:
 *                 type: integer
 *                 example: 4
 *               location:
 *                 type: string
 *                 example: "Terraza"
 *               status:
 *                 type: string
 *                 example: "AVAILABLE"
 *               restaurant:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mesa creada exitosamente
 */
router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createTable);

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Actualizar mesa
 *     tags: [Mesas]
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
 *               number:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mesa actualizada
 */
router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateTable);

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Eliminar mesa
 *     tags: [Mesas]
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
 *         description: Mesa eliminada exitosamente
 */
router.delete('/:id', verifyToken, isPlatformAdmin, deleteTable);

export default router;