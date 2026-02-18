import { Router } from "express";
import { createDish, getDishes, getDishById, updateDish, deleteDish } from "./dish.controller.js";
import { uploadDishImages } from "../../middlewares/files-uploaders.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// ✅ Público: ver platillos
router.get('/', getDishes);
router.get('/:id', getDishById);

// 🔒 Solo admins de restaurante pueden gestionar platillos
router.post('/create', verifyToken, isRestaurantAdmin, uploadDishImages.single('image'), createDish);
router.put('/:id', verifyToken, isRestaurantAdmin, uploadDishImages.single('image'), updateDish);
router.delete('/:id', verifyToken, isRestaurantAdmin, deleteDish);

export default router;
