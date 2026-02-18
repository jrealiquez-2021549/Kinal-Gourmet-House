import { Router } from "express";
import { createTable, getTables, getTableById, updateTable, deleteTable } from "./table.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// ✅ Público: ver mesas disponibles
router.get('/', getTables);
router.get('/:id', getTableById);

// 🔒 Solo admins de restaurante gestionan mesas
router.post('/create', verifyToken, isRestaurantAdmin, createTable);
router.put('/:id', verifyToken, isRestaurantAdmin, updateTable);
router.delete('/:id', verifyToken, isPlatformAdmin, deleteTable);

export default router;
