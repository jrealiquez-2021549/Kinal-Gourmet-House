import { Router } from "express";
import { createInvoice, getInvoices, getInvoiceById, getInvoiceByNumber, updateInvoice, deleteInvoice } from "./invoice.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.get('/', getInvoices);

router.get('/number/:invoiceNumber', getInvoiceByNumber);

router.get('/:id', getInvoiceById);

router.post('/create', isRestaurantAdmin, createInvoice);

router.put('/:id', isRestaurantAdmin, updateInvoice);

router.delete('/:id', isPlatformAdmin, deleteInvoice);

export default router;
