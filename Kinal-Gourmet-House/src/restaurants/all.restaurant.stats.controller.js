import mongoose from "mongoose";
import Order from "../orders/order.model.js";

export const getAllRestaurantsStats = async (req, res) => {
    try {

        const stats = await Order.aggregate([

            // Ignorar cancelados
            { $match: { status: { $ne: "CANCELADO" } } },

            // Agrupar por restaurante
            {
                $group: {
                    _id: "$restaurant",
                    totalOrders: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "ENTREGADO"] },
                                "$totalPrice",
                                0
                            ]
                        }
                    },
                    avgTicket: { $avg: "$totalPrice" }
                }
            },

            // Traer info del restaurante
            {
                $lookup: {
                    from: "restaurants",
                    localField: "_id",
                    foreignField: "_id",
                    as: "restaurantInfo"
                }
            },

            { $unwind: "$restaurantInfo" },

            // Formato final
            {
                $project: {
                    _id: 0,
                    restaurantId: "$restaurantInfo._id",
                    name: "$restaurantInfo.name",
                    totalOrders: 1,
                    totalRevenue: 1,
                    avgTicket: { $round: ["$avgTicket", 2] }
                }
            },

            { $sort: { totalRevenue: -1 } }

        ]);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas globales",
            error: error.message
        });
    }
};