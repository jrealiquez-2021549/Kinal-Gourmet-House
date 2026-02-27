import { Router } from "express";
import { createTable, getTables, getTableById, updateTable, deleteTable } from "./table.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', getTables);

router.get('/:id', getTableById);

router.post('/create', verifyToken, isRestaurantAdmin, createTable);

router.put('/:id', verifyToken, isRestaurantAdmin, updateTable);

router.delete('/:id', verifyToken, isPlatformAdmin, deleteTable);

export default router;
