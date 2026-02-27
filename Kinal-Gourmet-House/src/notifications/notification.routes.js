import { Router } from "express";
import { createNotification, getNotifications,getNotificationById,markAsRead,markAllAsRead,deleteNotification,deleteAllRead,getUnreadCount } from "./notification.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin, isRestaurantAdmin } from "../../middlewares/role.middleware.js";

const belongsToNotificationRestaurant = (req, res, next) => {
    if (!req.user || req.user.role === 'ADMIN_GENERAL') return next();

    const restaurantId = req.body?.restaurantId;

    if (!restaurantId) return next();

    if (!req.user.restaurantId || req.user.restaurantId.toString() !== restaurantId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. No tienes autorización para operar en este restaurante.'
        });
    }
    next();
};

const router = Router();

router.use(verifyToken);

router.post('/create', isPlatformAdmin, belongsToNotificationRestaurant, createNotification);
router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/read-all', deleteAllRead);
router.delete('/:id', deleteNotification);

export default router;