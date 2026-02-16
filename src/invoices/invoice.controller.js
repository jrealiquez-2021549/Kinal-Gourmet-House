import Invoice from './invoice.model.js';
import Order from '../orders/order.model.js';
import mongoose from 'mongoose';

export const createInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;

        // Verificar que la orden existe
        if (invoiceData.order && mongoose.Types.ObjectId.isValid(invoiceData.order)) {
            const order = await Order.findById(invoiceData.order);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            
            // Verificar que no exista ya una factura para esta orden
            const existingInvoice = await Invoice.findOne({ order: invoiceData.order });
            if (existingInvoice) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una factura para esta orden'
                });
            }
        }

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name email' },
                    { path: 'restaurant', select: 'name address' }
                ]
            });

        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente',
            data: populatedInvoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la factura',
            error: error.message
        });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, paymentStatus, paymentMethod } = req.query;
        
        const filter = {};
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (paymentMethod) filter.paymentMethod = paymentMethod;

        const invoices = await Invoice.find(filter)
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name email phone' },
                    { path: 'restaurant', select: 'name address phone' }
                ]
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ issuedAt: -1 });

        const total = await Invoice.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: invoices,
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
            message: 'Error al obtener las facturas',
            error: error.message
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const invoice = await Invoice.findById(id)
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name email phone' },
                    { path: 'restaurant', select: 'name address phone email' },
                    { path: 'table', select: 'number capacity' },
                    { path: 'details.dish', select: 'name price' }
                ]
            });
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la factura",
            error: error.message,
        });
    }
};

export const getInvoiceByNumber = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;

        const invoice = await Invoice.findOne({ invoiceNumber })
            .populate({
                path: 'order',
                populate: [
                    { path: 'user', select: 'name email phone' },
                    { path: 'restaurant', select: 'name address phone' },
                    { path: 'details.dish', select: 'name price' }
                ]
            });
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada",
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la factura",
            error: error.message,
        });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const currentInvoice = await Invoice.findById(id);
        
        if (!currentInvoice) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada",
            });
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )
        .populate({
            path: 'order',
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'restaurant', select: 'name address' }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Factura actualizada exitosamente",
            data: updatedInvoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar factura",
            error: error.message,
        });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const invoice = await Invoice.findById(id);
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada",
            });
        }

        await Invoice.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Factura eliminada exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar factura",
            error: error.message,
        });
    }
};