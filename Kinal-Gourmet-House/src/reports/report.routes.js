import { Router } from "express";
import { getSalesReport,getTopDishes,getPeakHours,getReservationStats,getCustomerSatisfactionReport,getRestaurantDashboard } from "./report.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isRestaurantAdmin } from "../../middlewares/role.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Endpoints de reportes del sistema
 */

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

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Obtener reporte de ventas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *     responses:
 *       200:
 *         description: Reporte generado correctamente
 */
router.get('/sales', belongsToReportRestaurant, getSalesReport);

/**
 * @swagger
 * /api/reports/top-dishes:
 *   get:
 *     summary: Obtener platillos más vendidos
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/top-dishes', belongsToReportRestaurant, getTopDishes);

/**
 * @swagger
 * /api/reports/peak-hours:
 *   get:
 *     summary: Obtener horas pico
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/peak-hours', belongsToReportRestaurant, getPeakHours);

/**
 * @swagger
 * /api/reports/reservations:
 *   get:
 *     summary: Estadísticas de reservaciones
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/reservations', belongsToReportRestaurant, getReservationStats);

/**
 * @swagger
 * /api/reports/customer-satisfaction:
 *   get:
 *     summary: Reporte de satisfacción del cliente
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customer-satisfaction', belongsToReportRestaurant, getCustomerSatisfactionReport);

/**
 * @swagger
 * /api/reports/dashboard/{restaurantId}:
 *   get:
 *     summary: Dashboard del restaurante
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del dashboard
 */
router.get('/dashboard/:restaurantId', belongsToReportRestaurant, getRestaurantDashboard);

export default router;