import { Router } from "express";
import { createNotification, getNotifications,getNotificationById,markAsRead,markAllAsRead,deleteNotification,deleteAllRead,getUnreadCount } from "./notification.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.post(
    '/create',
    isPlatformAdmin,
    createNotification
);

router.get(
    '/',
    getNotifications
);

router.get(
    '/unread/count',
    getUnreadCount
);

router.get(
    '/:id',
    getNotificationById
);

router.patch(
    '/:id/read',
    markAsRead
);

router.patch(
    '/read-all',
    markAllAsRead
);

router.delete(
    '/:id',
    deleteNotification
);

router.delete(
    '/read-all',
    deleteAllRead
);

export default router;