import { Router } from "express";
import { createTable, getTables, getTableById, updateTable, deleteTable } from "./table.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.get('/', verifyToken, getTables);

router.get('/:id', getTableById);

router.post('/create', verifyToken, isRestaurantAdmin, belongsToRestaurant, createTable);

router.put('/:id', verifyToken, isRestaurantAdmin, belongsToRestaurant, updateTable);

router.delete('/:id', verifyToken, isPlatformAdmin, deleteTable);

export default router;