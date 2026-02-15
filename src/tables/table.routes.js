import { Router } from "express";
import { createTable, getTables,getTableById,updateTable,deleteTable } from "./table.controller.js";

const router = Router();

router.post(
    '/create', 
    createTable);

router.get(
    '/', 
    getTables);

router.get(
    '/:id', 
    getTableById);

router.put(
    '/:id', 
    updateTable);

router.delete(
    '/:id', 
    deleteTable);

export default router;