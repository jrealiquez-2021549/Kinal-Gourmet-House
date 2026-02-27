import { Router } from "express";
import { createReservation, getReservations, getReservationById, updateReservation, deleteReservation } from "./reservation.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post('/create', belongsToRestaurant, createReservation);

router.get('/', getReservations);

router.get('/:id', getReservationById);

router.put('/:id', belongsToRestaurant, updateReservation);

router.delete('/:id', deleteReservation);

export default router;