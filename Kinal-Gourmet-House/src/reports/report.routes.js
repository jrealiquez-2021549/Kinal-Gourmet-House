import { Router } from "express";
import { 
    getSalesReport,
    getTopDishes,
    getPeakHours,
    getReservationStats,
    getCustomerSatisfactionReport,
    getRestaurantDashboard
} from "./report.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin, isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación y permisos de admin
router.use(verifyToken);

// Reporte de ventas
router.get(
    '/sales',
    isRestaurantAdmin,
    getSalesReport
);

// Platillos más vendidos
router.get(
    '/top-dishes',
    isRestaurantAdmin,
    getTopDishes
);

// Horas pico
router.get(
    '/peak-hours',
    isRestaurantAdmin,
    getPeakHours
);

// Estadísticas de reservaciones
router.get(
    '/reservations',
    isRestaurantAdmin,
    getReservationStats
);

// Satisfacción del cliente
router.get(
    '/customer-satisfaction',
    isRestaurantAdmin,
    getCustomerSatisfactionReport
);

// Dashboard del restaurante
router.get(
    '/dashboard/:restaurantId',
    isRestaurantAdmin,
    getRestaurantDashboard
);

export default router;