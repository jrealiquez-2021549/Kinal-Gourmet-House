import { Router } from "express";
import { createReview, getReviews, getReviewById, updateReview, deleteReview } from "./review.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', getReviews);

router.get('/:id', getReviewById);

router.post('/create', verifyToken, createReview);

router.put('/:id', verifyToken, updateReview);

router.delete('/:id', verifyToken, deleteReview);

export default router;
