import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, updateOrderStatus, cancelOrder } from "./order.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// 🔒 Todas las rutas requieren autenticación
router.use(verifyToken);

// Crear pedido (todos los autenticados)
router.post('/create', createOrder);

// Ver pedidos: clientes ven solo los suyos, admins ven todos (lógica en controller)
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Actualizar pedido (clientes el suyo, admins cualquiera)
router.put('/:id', updateOrder);
router.patch('/:id/cancel', cancelOrder);

// Cambiar estado (solo admins de restaurante)
router.patch('/:id/status', isRestaurantAdmin, updateOrderStatus);

// Eliminar (solo PLATFORM_ADMIN)
router.delete('/:id', isPlatformAdmin, deleteOrder);

export default router;
