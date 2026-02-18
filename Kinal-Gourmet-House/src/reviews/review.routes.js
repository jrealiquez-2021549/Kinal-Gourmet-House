import { Router } from "express";
import { createReview, getReviews, getReviewById, updateReview, deleteReview } from "./review.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// ✅ Público: ver reseñas
router.get('/', getReviews);
router.get('/:id', getReviewById);

// 🔒 Crear reseñas: cualquier usuario autenticado
router.post('/create', verifyToken, createReview);

// 🔒 Editar/eliminar: el dueño de la reseña o admin (lógica en controller)
router.put('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);

export default router;
