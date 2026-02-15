'use strict';

import { Router } from "express";
import { 
    generateInvoice, 
    getInvoicesByRestaurant, 
    updateInvoice, 
    deleteInvoice 
} from "./invoice.controller.js";

const router = Router();

router.post(
    '/generate', 
    generateInvoice
);

router.get(
    '/restaurant/:restaurantId', 
    getInvoicesByRestaurant
);

router.put(
    '/update/:id', 
    updateInvoice
);

router.delete(
    '/delete/:id', 
    deleteInvoice
);

export default router;