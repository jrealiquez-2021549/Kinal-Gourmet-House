import mongoose from "mongoose";
import Order from "./order.model.js";

export const createOrder = async (req, res) => {
    try {
        const { user, restaurant, table, details } = req.body;

        // Validar campos obligatorios
        if (!user || !restaurant || !details || details.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Usuario, restaurante y detalles son requeridos"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(user) ||
            !mongoose.Types.ObjectId.isValid(restaurant)
        ) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario o restaurante inválido"
            });
        }


        for (let item of details) {
            if (!item.dish || !item.quantity || !item.unitPrice) {
                return res.status(400).json({
                    success: false,
                    message: "Cada detalle debe tener dish, quantity y unitPrice"
                });
            }

            if (item.quantity <= 0 || item.unitPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cantidad y precio deben ser mayores a 0"
                });
            }
        }

        let totalPrice = 0;
        details.forEach(item => {
            totalPrice += item.quantity * item.unitPrice;
        });

        const order = new Order({
            user,
            restaurant,
            table,
            details,
            totalPrice
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: "Pedido creado correctamente",
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear pedido",
            error: error.message
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user")
            .populate("restaurant")
            .populate("table")
            .populate("details.dish");

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener pedidos",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const order = await Order.findById(id)
            .populate("user")
            .populate("restaurant")
            .populate("table")
            .populate("details.dish");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener pedido",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = [
            "EN_PREPARACION",
            "LISTO",
            "ENTREGADO",
            "CANCELADO"
        ];

        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado inválido"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Estado actualizado correctamente",
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar estado",
            error: error.message
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        order.status = "CANCELADO";
        await order.save();

        res.status(200).json({
            success: true,
            message: "Pedido cancelado correctamente",
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al cancelar pedido",
            error: error.message
        });
    }
};
