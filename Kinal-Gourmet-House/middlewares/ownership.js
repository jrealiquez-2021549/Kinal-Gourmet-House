export const belongsToRestaurant = (req, res, next) => {
    if (req.user.role === 'ADMIN_GENERAL') {
        return next();
    }

    const restaurantId = 
        req.params.restaurantId || 
        req.body.restaurant || 
        req.query.restaurant;

    if (!restaurantId) {
        return next();
    }

    if (req.user.restaurantId !== restaurantId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para operar en este restaurante'
        });
    }

    next();
};