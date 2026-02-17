import { Router } from "express";
import { createOrder, getOrders,getOrderById,updateOrder,deleteOrder,updateOrderStatus,cancelOrder } from "./order.controller.js";

const router = Router();

router.post(
    '/create', 
    createOrder);

router.get(
    '/', 
    getOrders);

router.get(
    '/:id', 
    getOrderById);

router.put(
    '/:id', 
    updateOrder);

router.delete(
    '/:id', 
    deleteOrder);

router.patch(
    '/:id/status', 
    updateOrderStatus);

router.patch(
    '/:id/cancel', 
    cancelOrder);

export default router;