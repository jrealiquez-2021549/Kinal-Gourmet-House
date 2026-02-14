import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} from "./order.controller.js";

const router = Router();

router.post("/create", createOrder);

router.get("/", getOrders);

router.get("/:id", getOrderById);

router.put("/status/:id", updateOrderStatus);

router.put("/cancel/:id", cancelOrder);

export default router;
