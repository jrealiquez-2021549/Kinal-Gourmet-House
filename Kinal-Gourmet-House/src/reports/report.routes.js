import { Router } from "express";
import { getSalesReport,getTopDishes,getPeakHours,getReservationStats,getCustomerSatisfactionReport,getRestaurantDashboard } from "./report.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin } from "../../middlewares/role.middleware.js";

const belongsToReportRestaurant = (req, res, next) => {
    if (!req.user || req.user.role === 'ADMIN_GENERAL') return next();

    const restaurantId = req.query?.restaurantId || req.params?.restaurantId;

    if (!restaurantId) return next();

    if (!req.user.restaurantId || req.user.restaurantId.toString() !== restaurantId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. No tienes autorización para ver reportes de este restaurante.'
        });
    }
    next();
};

const router = Router();

router.use(verifyToken);
router.use(isRestaurantAdmin);

router.get('/sales', belongsToReportRestaurant, getSalesReport);

router.get('/top-dishes', belongsToReportRestaurant, getTopDishes);

router.get('/peak-hours', belongsToReportRestaurant, getPeakHours);

router.get('/reservations', belongsToReportRestaurant, getReservationStats);

router.get('/customer-satisfaction', belongsToReportRestaurant, getCustomerSatisfactionReport);

router.get('/dashboard/:restaurantId', belongsToReportRestaurant, getRestaurantDashboard);

export default router;