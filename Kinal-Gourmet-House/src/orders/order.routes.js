import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, updateOrderStatus, cancelOrder } from "./order.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin, belongsToRestaurant } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post('/create', belongsToRestaurant, createOrder);

router.get('/', getOrders);

router.get('/:id', getOrderById);

router.put('/:id', belongsToRestaurant, updateOrder);

router.patch('/:id/cancel', cancelOrder);

router.patch('/:id/status', isRestaurantAdmin, belongsToRestaurant, updateOrderStatus);

router.delete('/:id', isPlatformAdmin, deleteOrder);

export default router;