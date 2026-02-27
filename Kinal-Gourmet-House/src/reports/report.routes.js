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

router.use(verifyToken);

router.get(
    '/sales',
    isRestaurantAdmin,
    getSalesReport
);

router.get(
    '/top-dishes',
    isRestaurantAdmin,
    getTopDishes
);

router.get(
    '/peak-hours',
    isRestaurantAdmin,
    getPeakHours
);

router.get(
    '/reservations',
    isRestaurantAdmin,
    getReservationStats
);

router.get(
    '/customer-satisfaction',
    isRestaurantAdmin,
    getCustomerSatisfactionReport
);

router.get(
    '/dashboard/:restaurantId',
    isRestaurantAdmin,
    getRestaurantDashboard
);

export default router;