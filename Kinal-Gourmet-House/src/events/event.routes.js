import { Router } from "express";
import { createEvent, getEvents, getEventById, getEventsByRestaurant, updateEvent, updateEventStatus, cancelEvent, deleteEvent } from "./event.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', verifyToken, getEvents);

router.get('/:id', getEventById);

router.get('/restaurant/:restaurantId', getEventsByRestaurant);

router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createEvent);

router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateEvent);

router.patch('/:id/status', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateEventStatus);

router.patch('/:id/cancel', verifyToken, isRestaurantAdmin, belongsToRestaurant, cancelEvent);

router.delete('/:id', verifyToken, isPlatformAdmin, deleteEvent);

export default router;