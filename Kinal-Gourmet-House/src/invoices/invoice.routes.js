import { Router } from "express";
import { createInvoice, getInvoices, getInvoiceById, getInvoiceByNumber, updateInvoice, deleteInvoice } from "./invoice.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// 🔒 Todas las rutas requieren autenticación
router.use(verifyToken);

// Clientes pueden ver sus propias facturas; admins ven todas
router.get('/', getInvoices);
router.get('/number/:invoiceNumber', getInvoiceByNumber);
router.get('/:id', getInvoiceById);

// Solo admins de restaurante generan/modifican facturas
router.post('/create', isRestaurantAdmin, createInvoice);
router.put('/:id', isRestaurantAdmin, updateInvoice);
router.delete('/:id', isPlatformAdmin, deleteInvoice);

export default router;
