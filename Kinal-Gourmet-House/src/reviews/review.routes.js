import { Router } from "express";
import { createReview, getReviews, getReviewById, updateReview, deleteReview } from "./review.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Reseñas
 *   description: Gestión de reseñas de restaurantes y platillos
 */

const router = Router();

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Obtener todas las reseñas
 *     tags: [Reseñas]
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
 *         name: restaurant
 *         schema:
 *           type: string
 *       - in: query
 *         name: dish
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get('/', getReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Obtener reseña por ID
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña encontrada
 *       404:
 *         description: Reseña no encontrada
 */
router.get('/:id', getReviewById);

/**
 * @swagger
 * /api/reviews/create:
 *   post:
 *     summary: Crear una reseña
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               restaurant:
 *                 type: string
 *               dish:
 *                 type: string
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Error en datos
 */
router.post('/create', verifyToken, createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Actualizar reseña
 *     tags: [Reseñas]
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
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reseña actualizada
 */
router.put('/:id', verifyToken, updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Eliminar reseña
 *     tags: [Reseñas]
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
 *         description: Reseña eliminada
 */
router.delete('/:id', verifyToken, deleteReview);

export default router;