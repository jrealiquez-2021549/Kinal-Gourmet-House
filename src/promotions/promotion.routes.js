import { Router } from "express";
import { createPromotion, getPromotions,getPromotionById,updatePromotion,deletePromotion } from "./promotion.controller.js";

const router = Router();

router.post(
    '/create', 
    createPromotion);

router.get(
    '/', 
    getPromotions);

router.get(
    '/:id', 
    getPromotionById);

router.put(
    '/:id', 
    updatePromotion);

router.delete(
    '/:id', 
    deletePromotion);

export default router;