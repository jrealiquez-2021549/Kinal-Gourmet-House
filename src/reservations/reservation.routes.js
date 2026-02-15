import { Router } from "express";
import { createReservation, getReservations,getReservationById,updateReservation,deleteReservation } from "./reservation.controller.js";

const router = Router();

router.post(
    '/create', 
    createReservation);

router.get(
    '/', 
    getReservations);

router.get(
    '/:id', 
    getReservationById);

router.put(
    '/:id', 
    updateReservation);

router.delete(
    '/:id', 
    deleteReservation);

export default router;