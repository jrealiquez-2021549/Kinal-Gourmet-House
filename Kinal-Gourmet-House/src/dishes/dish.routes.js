import { Router } from "express";
import { createDish, getDishes, getDishById, updateDish, deleteDish } from "./dish.controller.js";
import { uploadDishImages } from "../../middlewares/files-uploaders.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /dishes:
 *   get:
 *     summary: Listar platillos con filtros y paginación
 *     tags: [Dishes]
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
 *         name: isAvailable
 *         schema: { type: boolean }
 *         description: Filtrar por disponibilidad
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *         description: Filtrar por tipo de platillo
 *       - in: query
 *         name: restaurant
 *         schema: { type: string }
 *         description: ID del restaurante (ADMIN_RESTAURANTE solo ve los suyos)
 *     responses:
 *       200:
 *         description: Lista de platillos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/DishResponse' }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', verifyToken, getDishes);

/**
 * @swagger
 * /dishes/{id}:
 *   get:
 *     summary: Obtener platillo por ID
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del platillo (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Platillo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/DishResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Platillo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Actualizar un platillo (soporta subida de imagen)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:         { type: string,  example: Tacos de Canasta }
 *               description:  { type: string,  example: Tacos tradicionales }
 *               price:        { type: number,  example: 45.00 }
 *               type:         { type: string,  example: MAIN }
 *               isAvailable:  { type: boolean, example: true }
 *               ingredients:  { type: string,  example: "tortilla, frijoles, chile" }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nueva imagen del platillo (reemplaza la anterior en Cloudinary)
 *     responses:
 *       200:
 *         description: Platillo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Platillo actualizado exitosamente }
 *                 data:    { $ref: '#/components/schemas/DishResponse' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin autorización para modificar este platillo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Platillo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Eliminar un platillo (también elimina imagen en Cloudinary)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Platillo eliminado exitosamente
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
 *         description: Sin autorización para eliminar este platillo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Platillo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getDishById);
router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, uploadDishImages.single('image'), updateDish);
router.delete('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, deleteDish);

/**
 * @swagger
 * /dishes/create:
 *   post:
 *     summary: Crear un nuevo platillo (soporta subida de imagen)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, type, restaurant]
 *             properties:
 *               name:        { type: string,  example: Tacos de Canasta }
 *               description: { type: string,  example: Tacos tradicionales mexicanos }
 *               price:       { type: number,  example: 45.00 }
 *               type:        { type: string,  example: MAIN }
 *               restaurant:  { type: string,  example: 64f1a2b3c4d5e6f7a8b9c0d2 }
 *               isAvailable: { type: boolean, example: true }
 *               ingredients:
 *                 type: string
 *                 example: "tortilla, frijoles, chile"
 *                 description: Ingredientes separados por coma
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del platillo (se sube a Cloudinary)
 *     responses:
 *       201:
 *         description: Platillo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string,  example: Platillo creado exitosamente }
 *                 data:    { $ref: '#/components/schemas/DishResponse' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Sin autorización para crear platillos en este restaurante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, uploadDishImages.single('image'), createDish);

export default router;