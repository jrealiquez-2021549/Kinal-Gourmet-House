import { Router } from "express";
import { createReservation, getReservations, getReservationById, updateReservation, deleteReservation } from "./reservation.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post('/create', createReservation);

router.get('/', getReservations);

router.get('/:id', getReservationById);

router.put('/:id', updateReservation);

router.delete('/:id', deleteReservation);

export default router;
