'use strict';

import { Router } from 'express';
import { createEvent, getEvents, deleteEvent } from './event.controller.js';

const router = Router();

router.post(
    '/create', 
    createEvent
);

router.get(
    '/', 
    getEvents
);

router.delete(
    '/:id', 
    deleteEvent
);

export default router;