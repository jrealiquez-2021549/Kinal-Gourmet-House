import { Router } from "express";
import { createInvoice, getInvoices, getInvoiceById, getInvoiceByNumber, updateInvoice, deleteInvoice } from "./invoice.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.get('/', getInvoices);

router.get('/number/:invoiceNumber', getInvoiceByNumber);

router.get('/:id', getInvoiceById);

router.post('/create', isRestaurantAdmin, belongsToRestaurant, createInvoice);

router.put('/:id', isRestaurantAdmin, belongsToRestaurant, updateInvoice);

router.delete('/:id', isPlatformAdmin, deleteInvoice);

export default router;