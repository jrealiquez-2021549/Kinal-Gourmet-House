import Invoice from './invoice.model.js';
import Order from '../orders/order.model.js';
import mongoose from 'mongoose';

export const createInvoice = async (req, res) => {
    try {
        const {
            order,
            restaurant,
            customerInfo,
            restaurantInfo,
            items,
            subtotal,
            taxRate,
            discount,
            tip,
            serviceCharge,
            deliveryFee,
            paymentMethod,
            amountPaid,
            paymentReference,
            invoiceType,
            notes
        } = req.body;

        if (!order || !restaurant) {
            return res.status(400).json({ success: false, message: 'Orden y restaurante son requeridos' });
        }

        if (!mongoose.Types.ObjectId.isValid(order)) {
            return res.status(400).json({ success: false, message: 'ID de orden inválido' });
        }

        const existingOrder = await Order.findById(order);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        }

        const existingInvoice = await Invoice.findOne({ order });
        if (existingInvoice) {
            return res.status(400).json({ success: false, message: 'Ya existe una factura para esta orden' });
        }
        
        const sub    = subtotal || 0;
        const tax    = sub * ((taxRate || 0) / 100);
        const desc   = discount || 0;
        const serv   = serviceCharge || 0;
        const deliv  = deliveryFee || 0;
        const tipAmt = tip || 0;
        const total  = sub + tax + serv + deliv + tipAmt - desc;
        const paid   = amountPaid || 0;
        const change = Math.max(0, paid - total);

        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const invoice = new Invoice({
            userId:          req.user.id,
            userInfo:        { name: req.user.name, email: req.user.email },
            restaurant,
            order,
            invoiceNumber,
            customerInfo,
            restaurantInfo,
            items:           items || [],
            subtotal:        sub,
            taxRate:         taxRate || 0,
            taxAmount:       tax,
            serviceCharge:   serv,
            deliveryFee:     deliv,
            tip:             tipAmt,
            discount:        desc,
            totalAmount:     total,
            paymentMethod:   paymentMethod || 'EFECTIVO',
            amountPaid:      paid,
            changeReturned:  change,
            paymentStatus:   paid >= total ? 'PAGADO' : 'PENDIENTE',
            paymentReference,
            invoiceType:     invoiceType || 'FACTURA',
            notes
        });

        await invoice.save();

        res.status(201).json({ success: true, message: 'Factura creada exitosamente', data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear factura', error: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurant } = req.query;
        const filter = {};

        if (restaurant) filter.restaurant = restaurant;

        if (req.user.role === 'CLIENTE') {
            filter.userId = req.user.id;
        }

        const invoices = await Invoice.find(filter)
            .populate('restaurant', 'name address')
            .populate('order', 'orderType status totalPrice')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Invoice.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: invoices,
            pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalRecords: total, limit: parseInt(limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener facturas', error: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

        const invoice = await Invoice.findById(id)
            .populate('restaurant', 'name address phone')
            .populate('order');

        if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

        if (req.user.role === 'CLIENTE' && invoice.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No tienes acceso a esta factura' });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener factura', error: error.message });
    }
};

export const getInvoiceByNumber = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const invoice = await Invoice.findOne({ invoiceNumber })
            .populate('restaurant', 'name address')
            .populate('order');

        if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

        if (req.user.role === 'CLIENTE' && invoice.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No tienes acceso a esta factura' });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener factura', error: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

        delete req.body.userId;
        delete req.body.userInfo;
        delete req.body.invoiceNumber;
        delete req.body.order;

        const updated = await Invoice.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: 'Factura actualizada', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar factura', error: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

        await Invoice.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Factura eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar factura', error: error.message });
    }
};