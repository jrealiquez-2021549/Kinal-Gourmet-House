import { Router } from "express";
import { createPromotion, getPromotions, getPromotionById, updatePromotion, deletePromotion } from "./promotion.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', verifyToken, getPromotions);

router.get('/:id', getPromotionById);

router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createPromotion);

router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updatePromotion);

router.delete('/:id', verifyToken, isPlatformAdmin, deletePromotion);

export default router;