import mongoose from "mongoose";
import Order from "./order.model.js";

export const createOrder = async (req, res) => {
    try {
        const { restaurant, table, orderType, details, deliveryAddress, deliveryPhone, couponCode } = req.body;

        if (!restaurant || !details || details.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Restaurante y detalles del pedido son requeridos"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(restaurant)) {
            return res.status(400).json({
                success: false,
                message: "ID de restaurante inválido"
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

        // Aplicar cupón si se envió
        let discount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const Coupon = mongoose.model('Coupon');
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'El cupón ingresado no existe'
                });
            }

            const validation = await coupon.validateForUse(req.user.id, restaurant, totalPrice);

            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }

            if (coupon.discountType === 'PERCENTAGE') {
                discount = totalPrice * (coupon.discountValue / 100);
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount;
                }
            } else {
                discount = coupon.discountValue;
            }

            // No dejar que el descuento supere el total
            discount = Math.min(discount, totalPrice);
            appliedCoupon = coupon._id;
        }

        const order = new Order({
            userId: req.user.id,
            userInfo: {
                name: req.user.name,
                email: req.user.email
            },
            restaurant,
            table: table || undefined,
            orderType: orderType || 'EN_MESA',
            details,
            totalPrice: totalPrice - discount,
            discount,
            appliedCoupon: appliedCoupon || undefined,
            deliveryAddress: deliveryAddress || undefined,
            deliveryPhone: deliveryPhone || undefined
        });

        await order.save();

        // Registrar uso del cupón ahora que ya tenemos el ID de la orden
        if (appliedCoupon) {
            const Coupon = mongoose.model('Coupon');
            const coupon = await Coupon.findById(appliedCoupon);
            await coupon.recordUsage(req.user.id, order._id);
        }

        res.status(201).json({
            success: true,
            message: "Pedido creado exitosamente",
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
        const { page = 1, limit = 10, status, restaurant } = req.query;
        const filter = {};

        if (status) filter.status = status;

        if (req.user.role === 'CLIENTE') {
            filter.userId = req.user.id;
        } else if (req.user.role === 'ADMIN_RESTAURANTE') {
            filter.restaurant = req.user.restaurantId;
        } else if (req.user.role === 'ADMIN_GENERAL') {
            if (restaurant) filter.restaurant = restaurant;
        }

        const orders = await Order.find(filter)
            .populate("restaurant", "name address phone")
            .populate("table", "number capacity")
            .populate("details.dish", "name price")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
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
            return res.status(400).json({ success: false, message: "ID inválido" });
        }

        const order = await Order.findById(id)
            .populate("restaurant", "name address phone")
            .populate("table", "number capacity location")
            .populate("details.dish", "name price description");

        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        if (req.user.role === 'CLIENTE' && order.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "No tienes acceso a este pedido" });
        }

        res.status(200).json({ success: true, data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener pedido", error: error.message });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID inválido" });
        }

        const currentOrder = await Order.findById(id);
        if (!currentOrder) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        if (req.user.role === 'CLIENTE') {
            if (currentOrder.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: "No tienes acceso a este pedido" });
            }
            if (currentOrder.status !== 'PENDIENTE') {
                return res.status(400).json({ success: false, message: "Solo se pueden modificar pedidos en estado PENDIENTE" });
            }
        }

        if (req.body.details) {
            let totalPrice = 0;
            req.body.details.forEach(item => { totalPrice += item.quantity * item.unitPrice; });
            req.body.totalPrice = totalPrice;
        }

        delete req.body.userId;
        delete req.body.userInfo;

        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
            .populate("restaurant", "name address")
            .populate("table", "number capacity")
            .populate("details.dish", "name price");

        res.status(200).json({ success: true, message: "Pedido actualizado exitosamente", data: updatedOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error al actualizar pedido", error: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID inválido" });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        await Order.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Pedido eliminado exitosamente" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error al eliminar pedido", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = ["PENDIENTE", "EN_PREPARACION", "LISTO", "ENTREGADO", "CANCELADO"];

        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado inválido. Estados válidos: " + statusValidos.join(", ")
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, message: "Estado actualizado correctamente", data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error al actualizar estado", error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }
        
        if (req.user.role === 'CLIENTE' && order.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "No tienes acceso a este pedido" });
        }

        if (order.status === 'ENTREGADO') {
            return res.status(400).json({ success: false, message: "No se puede cancelar un pedido ya entregado" });
        }

        order.status = "CANCELADO";
        await order.save();

        res.status(200).json({ success: true, message: "Pedido cancelado correctamente", data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error al cancelar pedido", error: error.message });
    }
};