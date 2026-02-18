import { Router } from "express";
import { 
    createNotification, 
    getNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getUnreadCount
} from "./notification.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Crear notificación (solo admin de plataforma)
router.post(
    '/create',
    isPlatformAdmin,
    createNotification
);

// Obtener notificaciones del usuario
router.get(
    '/',
    getNotifications
);

// Obtener contador de no leídas
router.get(
    '/unread/count',
    getUnreadCount
);

// Obtener notificación por ID
router.get(
    '/:id',
    getNotificationById
);

// Marcar como leída
router.patch(
    '/:id/read',
    markAsRead
);

// Marcar todas como leídas
router.patch(
    '/read-all',
    markAllAsRead
);

// Eliminar notificación
router.delete(
    '/:id',
    deleteNotification
);

// Eliminar todas las leídas
router.delete(
    '/read-all',
    deleteAllRead
);

export default router;