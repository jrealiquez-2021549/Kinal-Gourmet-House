import { Router } from "express";
import { createPromotion, getPromotions, getPromotionById, updatePromotion, deletePromotion } from "./promotion.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', getPromotions);

router.get('/:id', getPromotionById);

router.post('/create', verifyToken, isRestaurantAdmin, createPromotion);

router.put('/:id', verifyToken, isRestaurantAdmin, updatePromotion);

router.delete('/:id', verifyToken, isPlatformAdmin, deletePromotion);

export default router;
