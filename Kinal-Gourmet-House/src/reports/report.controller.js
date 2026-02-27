'use strict';

import Order from '../orders/order.model.js';
import Reservation from '../reservations/reservation.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Review from '../reviews/review.model.js';
import Dish from '../dishes/dish.model.js';
import mongoose from 'mongoose';

export const getSalesReport = async (req, res) => {
    try {
        const { restaurantId, startDate, endDate, groupBy = 'day' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Fechas de inicio y fin son requeridas'
            });
        }

        const filter = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            status: 'ENTREGADO'
        };

        if (restaurantId) {
            if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de restaurante inválido'
                });
            }
            filter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        }

        let dateFormat;
        switch (groupBy) {
            case 'hour':
                dateFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
                break;
            case 'day':
                dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                break;
            case 'week':
                dateFormat = { $week: "$createdAt" };
                break;
            case 'month':
                dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
                break;
            default:
                dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        }

        const salesData = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: dateFormat,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    averageOrderValue: { $avg: '$totalPrice' },
                    totalDeliveryFees: { $sum: '$deliveryFee' },
                    totalDiscounts: { $sum: '$discount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const summary = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    averageOrderValue: { $avg: '$totalPrice' },
                    totalDeliveryFees: { $sum: '$deliveryFee' },
                    totalDiscounts: { $sum: '$discount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                period: { startDate, endDate, groupBy },
                summary: summary[0] || {},
                details: salesData
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de ventas',
            error: error.message
        });
    }
};

export const getTopDishes = async (req, res) => {
    try {
        const { restaurantId, startDate, endDate, limit = 10 } = req.query;

        const matchFilter = {
            status: 'ENTREGADO'
        };

        if (startDate && endDate) {
            matchFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (restaurantId) {
            matchFilter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        }

        const topDishes = await Order.aggregate([
            { $match: matchFilter },
            { $unwind: '$details' },
            {
                $group: {
                    _id: '$details.dish',
                    totalOrders: { $sum: 1 },
                    totalQuantity: { $sum: '$details.quantity' },
                    totalRevenue: { $sum: '$details.subtotal' },
                    averagePrice: { $avg: '$details.unitPrice' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'dishes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'dish'
                }
            },
            { $unwind: '$dish' },
            {
                $project: {
                    _id: 1,
                    dishName: '$dish.name',
                    dishType: '$dish.type',
                    dishImage: '$dish.image',
                    totalOrders: 1,
                    totalQuantity: 1,
                    totalRevenue: 1,
                    averagePrice: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: topDishes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener platillos más vendidos',
            error: error.message
        });
    }
};

export const getPeakHours = async (req, res) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        const filter = {};

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (restaurantId) {
            filter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        }

        const peakHours = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { totalOrders: -1 } },
            {
                $project: {
                    hour: '$_id',
                    totalOrders: 1,
                    totalRevenue: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: peakHours
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener horas pico',
            error: error.message
        });
    }
};

export const getReservationStats = async (req, res) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        const filter = {};

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (restaurantId) {
            filter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        }

        const stats = await Reservation.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalPeople: { $sum: '$numberOfPeople' }
                }
            }
        ]);

        const total = await Reservation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                total,
                byStatus: stats
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de reservaciones',
            error: error.message
        });
    }
};

export const getCustomerSatisfactionReport = async (req, res) => {
    try {
        const { restaurantId, startDate, endDate } = req.query;

        const filter = {};

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (restaurantId) {
            filter.restaurant = new mongoose.Types.ObjectId(restaurantId);
        }

        const reviewStats = await Review.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$restaurant',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratings: {
                        $push: '$rating'
                    }
                }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: { path: '$restaurant', preserveNullAndEmptyArrays: true } }
        ]);

        const ratingDistribution = await Review.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        const orderRatings = await Order.aggregate([
            {
                $match: {
                    status: 'ENTREGADO',
                    rating: { $exists: true, $ne: null },
                    ...(restaurantId && { restaurant: new mongoose.Types.ObjectId(restaurantId) }),
                    ...(startDate && endDate && {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    })
                }
            },
            {
                $group: {
                    _id: null,
                    averageOrderRating: { $avg: '$rating' },
                    totalRatedOrders: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews: {
                    stats: reviewStats,
                    distribution: ratingDistribution
                },
                orders: orderRatings[0] || {
                    averageOrderRating: 0,
                    totalRatedOrders: 0
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte de satisfacción',
            error: error.message
        });
    }
};

export const getRestaurantDashboard = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de restaurante inválido'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayOrders = await Order.countDocuments({
            restaurant: restaurantId,
            createdAt: { $gte: today, $lt: tomorrow }
        });

        const todayRevenue = await Order.aggregate([
            {
                $match: {
                    restaurant: new mongoose.Types.ObjectId(restaurantId),
                    createdAt: { $gte: today, $lt: tomorrow },
                    status: 'ENTREGADO'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        const todayReservations = await Reservation.countDocuments({
            restaurant: restaurantId,
            date: { $gte: today, $lt: tomorrow },
            status: { $in: ['PENDING', 'CONFIRMED'] }
        });

        const avgRating = await Review.aggregate([
            { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        
        const activeOrders = await Order.countDocuments({
            restaurant: restaurantId,
            status: { $in: ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION'] }
        });

        res.status(200).json({
            success: true,
            data: {
                today: {
                    orders: todayOrders,
                    revenue: todayRevenue[0]?.total || 0,
                    reservations: todayReservations
                },
                averageRating: avgRating[0]?.avgRating || 0,
                activeOrders: activeOrders
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener dashboard',
            error: error.message
        });
    }
};