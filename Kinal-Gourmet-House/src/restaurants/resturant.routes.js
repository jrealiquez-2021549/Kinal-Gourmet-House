import { Router } from "express";
import { createRestaurant, getRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } from "./restaurant.controller.js";
import { uploadRestaurantImages } from "../../middlewares/files-uploaders.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin, isRestaurantAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// ✅ Público: cualquiera puede ver restaurantes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// 🔒 Solo PLATFORM_ADMIN puede crear/eliminar restaurantes
router.post('/create', verifyToken, isPlatformAdmin, uploadRestaurantImages.single('image'), createRestaurant);
router.delete('/:id', verifyToken, isPlatformAdmin, deleteRestaurant);

// 🔒 REST_ADMIN o PLATFORM_ADMIN pueden actualizar su restaurante
router.put('/:id', verifyToken, isRestaurantAdmin, uploadRestaurantImages.single('image'), updateRestaurant);

export default router;
