import mongoose from "mongoose"
import Order from "../orders/order.model.js";

export const getRestaurantStats = async (req, res) => {
    try{
        const { id } = req.params;
        const restaurantId = new mongoose.Types.ObjectId(id);

        //Variable en donde se almacenara para ver el total de pedidos
        const totalOrders = await Order.countDocuments({ restaurant: restaurantId });

        //Variable en donde se almacenaran los ingresos totales
        const revenueRestult = await Order.aggregare([
            { $match: { restaurant: restauranteId, status: 'ENTREGADO' } },
            { $group: { _id: null, total: { $sum: '$totalPrice'} } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Variable en donde se almacenaran todos los platos vendidos
        const dishesSoldResult = await Order.aggregate([
            { $match: { restaurant: restaurantId, status: { $ne: 'CANCELADO' } } },
            { $unwind: '$details' },
            { $group: { _id: null, total: { $sum: '$details.quantity' } } }
        ]);
        const dishesSold = dishesSoldResult[0]?.total || 0;

        //Variable en donde se almacenaran el plato mas vendido
        const topDish = await Order.aggregate([
            { $match: { restaurant: restaurantId, status: { $ne: 'CANCELADO' } } },
            { $unwind: '$details' },
            {
                $group: {
                    _id: '$details.dish',
                    totalSold: { $sum: '$details.quantity' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'dishes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'dishInfo'
                }
            },
            { $unwind: '$dishInfo' },
            {
                $project: {
                    _id: 0,
                    dishId: '$dishInfo._id',
                    name: '$dishInfo.name',
                    totalSold: 1
                }
            }
        ]);

        //Variable en donde se almacenaran los pedidos segun sea su estado
        const ordersByStatus = await Order.aggregate([
            { $match: { restaurant: restaurantId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        //Variable en donde se almacenara el total promedio de la factura
        const avgTicketResult = await Order.aggregate([
            { $match: { restaurant: restaurantId, status: 'ENTREGADO' } },
            {
                $group: {
                    _id: null,
                    avg: { $avg: '$totalPrice' }
                }
            }
        ]);
        const avgTicket = avgTicketResult[0]?.avg || 0;

        //RESPUESTA JSON AL HABER CALCULADO TODAS LAS STATS
        res.json({
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                dishesSold,
                avgTicket,
                topDish: topDish[0] || null,
                ordersByStatus
            }
        });

    } catch(error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las estadisticas del restaurante",
            error: error.message
        });
    }
};