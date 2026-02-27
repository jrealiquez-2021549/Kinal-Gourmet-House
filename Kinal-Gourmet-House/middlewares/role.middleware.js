/**
 * Middleware de roles adaptado a los roles reales de AuthRestaurante:
 * - ADMIN_GENERAL    → Administrador de la plataforma
 * - ADMIN_RESTAURANTE → Administrador de restaurante
 * - CLIENTE          → Cliente/usuario final
 */

export const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado. Se requiere token válido.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para esta acción',
                requiredRoles: allowedRoles,
                yourRole: req.user.role
            });
        }

        next();
    };
};

// Solo ADMIN_GENERAL puede realizar esta acción
export const isPlatformAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN_GENERAL') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo el Administrador General puede realizar esta acción.'
        });
    }
    next();
};

// ADMIN_RESTAURANTE o ADMIN_GENERAL pueden realizar esta acción
export const isRestaurantAdmin = (req, res, next) => {
    if (!req.user || !['ADMIN_RESTAURANTE', 'ADMIN_GENERAL'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo administradores de restaurante pueden realizar esta acción.'
        });
    }
    next();
};

// Solo CLIENTE puede realizar esta acción
export const isClient = (req, res, next) => {
    if (!req.user || req.user.role !== 'CLIENTE') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Solo para clientes.'
        });
    }
    next();
};

// Cualquier usuario autenticado (sin importar rol) puede continuar
export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado. Se requiere token válido.'
        });
    }
    next();
};

// Verifica que el ADMIN_RESTAURANTE solo opere en su propio restaurante
export const belongsToRestaurant = (req, res, next) => {
    // ADMIN_GENERAL puede operar en cualquier restaurante
    if (!req.user || req.user.role === 'ADMIN_GENERAL') {
        return next();
    }

    // CLIENTE no necesita esta validación
    if (req.user.role === 'CLIENTE') {
        return next();
    }

    // Obtener el restaurantId de la request (body, params o query)
    const restaurantId =
        req.body?.restaurant ||
        req.params?.restaurantId ||
        req.query?.restaurant;

    // Si no viene restaurantId en la request, dejar pasar (el controlador lo manejará)
    if (!restaurantId) {
        return next();
    }

    // Si el token aún no trae restaurantId (AuthRestaurante pendiente de actualizar), dejar pasar
    if (!req.user.restaurantId) {
        return next();
    }

    // Verificar que el restaurantId de la request coincida con el del token
    if (req.user.restaurantId.toString() !== restaurantId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. No tienes autorización para operar en este restaurante.'
        });
    }

    next();
};