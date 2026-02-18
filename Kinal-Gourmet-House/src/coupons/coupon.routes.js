import { Router } from "express";
import { 
    createCoupon, 
    getCoupons,
    getCouponById,
    getCouponByCode,
    validateCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponUsageHistory,
    getUserCouponUsage
} from "./coupon.controller.js";
import { verifyToken } from "../../middlewares/auth-integration.middleware.js";
import { isPlatformAdmin, isRestaurantAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

// Rutas públicas
router.post(
    '/validate', 
    validateCoupon
); // Validar cupón antes de aplicarlo

router.get(
    '/code/:code',
    getCouponByCode
); // Buscar cupón por código

// Rutas protegidas - Solo administradores
router.post(
    '/create',
    verifyToken,
    isRestaurantAdmin, // REST_ADMIN o PLATFORM_ADMIN
    createCoupon
);

router.get(
    '/',
    verifyToken,
    getCoupons
);

router.get(
    '/:id',
    verifyToken,
    getCouponById
);

router.put(
    '/:id',
    verifyToken,
    isRestaurantAdmin,
    updateCoupon
);

router.delete(
    '/:id',
    verifyToken,
    isPlatformAdmin, // Solo admin de plataforma puede eliminar
    deleteCoupon
);

// Historial de uso
router.get(
    '/:id/usage',
    verifyToken,
    isRestaurantAdmin,
    getCouponUsageHistory
);

router.get(
    '/user/:userId/usage',
    verifyToken,
    getUserCouponUsage
);

export default router;