import { Router } from "express";
import { createInvoice, getInvoices,getInvoiceById,getInvoiceByNumber,updateInvoice,deleteInvoice } from "./invoice.controller.js";

const router = Router();

router.post(
    '/create', 
    createInvoice);

router.get(
    '/', 
    getInvoices);

router.get(
    '/:id', 
    getInvoiceById);

router.get(
    '/number/:invoiceNumber', 
    getInvoiceByNumber);

router.put(
    '/:id', 
    updateInvoice);

router.delete(
    '/:id', 
    deleteInvoice);

export default router;