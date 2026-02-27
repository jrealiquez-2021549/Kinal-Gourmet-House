import { Router } from "express";
import { createDish, getDishes, getDishById, updateDish, deleteDish } from "./dish.controller.js";
import { uploadDishImages } from "../../middlewares/files-uploaders.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', verifyToken, getDishes);

router.get('/:id', getDishById);

router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, uploadDishImages.single('image'), createDish);

router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, uploadDishImages.single('image'), updateDish);

router.delete('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, deleteDish);

export default router;