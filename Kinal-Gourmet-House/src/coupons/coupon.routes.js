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

router.post(
    '/validate', 
    validateCoupon
);

router.get(
    '/code/:code',
    getCouponByCode
);

router.post(
    '/create',
    verifyToken,
    isRestaurantAdmin,
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
    isPlatformAdmin,
    deleteCoupon
);

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