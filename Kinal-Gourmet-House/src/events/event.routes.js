import { Router } from "express";
import { createEvent, getEvents,getEventById,getEventsByRestaurant,updateEvent,updateEventStatus,cancelEvent,deleteEvent } from "./event.controller.js";

const router = Router();

router.post(
    '/create', 
    createEvent);

router.get(
    '/', 
    getEvents);

router.get(
    '/:id', 
    getEventById);

router.get(
    '/restaurant/:restaurantId', 
    getEventsByRestaurant);

router.put(
    '/:id', 
    updateEvent);

router.patch(
    '/:id/status', 
    updateEventStatus);

router.patch(
    '/:id/cancel', 
    cancelEvent);

router.delete(
    '/:id', 
    deleteEvent);

export default router;