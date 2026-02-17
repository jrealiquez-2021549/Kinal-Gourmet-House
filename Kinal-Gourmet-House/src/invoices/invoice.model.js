'use strict';

import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'La referencia a la orden es requerida'],
            unique: true
        },
        invoiceNumber: {
            type: String,
            required: [true, 'El número de factura es requerido'],
            unique: true,
            trim: true
        },
        taxAmount: {
            type: Number,
            required: [true, 'El monto de impuesto es requerido'],
            min: [0, 'El impuesto no puede ser negativo'],
            default: 0
        },
        serviceCharge: {
            type: Number,
            required: [true, 'El cargo por servicio es requerido'],
            min: [0, 'El cargo por servicio no puede ser negativo'],
            default: 0
        },
        totalAmount: {
            type: Number,
            required: [true, 'El monto total es requerido'],
            min: [0, 'El monto total no puede ser negativo']
        },
        paymentMethod: {
            type: String,
            required: [true, 'El método de pago es requerido'],
            enum: {
                values: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'WALLET'],
                message: 'Método de pago no válido'
            }
        },
        paymentStatus: {
            type: String,
            required: [true, 'El estado de pago es requerido'],
            enum: {
                values: ['PENDIENTE', 'PAGADO', 'CANCELADO', 'REEMBOLSADO'],
                message: 'Estado de pago no válido'
            },
            default: 'PENDIENTE'
        },
        issuedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

invoiceSchema.index({ order: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ issuedAt: 1 });

invoiceSchema.pre('save', async function(next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

export default mongoose.model('Invoice', invoiceSchema);