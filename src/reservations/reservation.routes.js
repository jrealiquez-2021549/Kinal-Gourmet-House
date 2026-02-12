'use strict';
import { Router } from "express";
import { createReservation, getReservations } from "./reservation.controller.js";

const router = Router();

router.post(
    '/create',
    createReservation
);

router.get(
    '/',
    getReservations
);

export default router;