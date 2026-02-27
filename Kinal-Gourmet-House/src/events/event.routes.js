import { Router } from "express";
import { createEvent, getEvents, getEventById, getEventsByRestaurant, updateEvent, updateEventStatus, cancelEvent, deleteEvent } from "./event.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', getEvents);

router.get('/:id', getEventById);

router.get('/restaurant/:restaurantId', getEventsByRestaurant);

router.post('/create', verifyToken, isRestaurantAdmin, createEvent);

router.put('/:id', verifyToken, isRestaurantAdmin, updateEvent);

router.patch('/:id/status', verifyToken, isRestaurantAdmin, updateEventStatus);

router.patch('/:id/cancel', verifyToken, isRestaurantAdmin, cancelEvent);

router.delete('/:id', verifyToken, isPlatformAdmin, deleteEvent);

export default router;
