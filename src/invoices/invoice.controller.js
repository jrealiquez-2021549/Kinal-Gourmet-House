'use strict';

import Invoice from './invoice.model.js';

// Generar Factura con cálculos automáticos
export const generateInvoice = async (req, res) => {
    try {
        const { user, restaurant, reservation, items, paymentMethod } = req.body;

        // Validamos que vengan items
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'La factura debe tener al menos un item' });
        }

        // Cálculo automático del subtotal
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        // Impuesto de servicio
        const serviceTax = subtotal * 0.10;
        const total = subtotal + serviceTax;

        const invoice = new Invoice({
            user,
            restaurant,
            reservation,
            items,
            subtotal,
            serviceTax,
            total,
            paymentMethod
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            message: 'Factura generada exitosamente',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Obtener facturas por restaurante
export const getInvoicesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const invoices = await Invoice.find({ restaurant: restaurantId })
            .populate('user', 'name email')
            .populate('restaurant', 'name');
            
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Actualizar
export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInvoice = await Invoice.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedInvoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });

        res.status(200).json({ success: true, data: updatedInvoice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Eliminar
export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoiceDeleted = await Invoice.findByIdAndDelete(id);

        if (!invoiceDeleted) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la factura para eliminar'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Factura eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};