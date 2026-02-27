import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, updateOrderStatus, cancelOrder } from "./order.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post('/create', createOrder);

router.get('/', getOrders);

router.get('/:id', getOrderById);

router.put('/:id', updateOrder);

router.patch('/:id/cancel', cancelOrder);

router.patch('/:id/status', isRestaurantAdmin, updateOrderStatus);

router.delete('/:id', isPlatformAdmin, deleteOrder);

export default router;
