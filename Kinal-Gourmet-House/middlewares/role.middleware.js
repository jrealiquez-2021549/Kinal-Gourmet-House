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
