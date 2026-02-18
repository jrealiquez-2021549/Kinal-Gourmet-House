'use strict';

import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'El ID del usuario es requerido']
        },
        userInfo: {
            name: { type: String },
            email: { type: String }
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La referencia al restaurante es requerida']
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'La referencia a la orden es requerida'],
            unique: true
        },
        invoiceNumber: {
            type: String,
            unique: true,
            trim: true
        },
        customerInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: String,
            address: String,
            nit: { type: String, default: 'CF' }
        },
        restaurantInfo: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            phone: String,
            email: String,
            nit: String
        },
        items: [{
            dishName: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            unitPrice: { type: Number, required: true, min: 0 },
            subtotal: { type: Number, required: true, min: 0 },
            dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }
        }],
        subtotal: {
            type: Number,
            required: [true, 'El subtotal es requerido'],
            min: 0,
            default: 0
        },
        taxAmount: { type: Number, min: 0, default: 0 },
        taxRate: { type: Number, min: 0, max: 100, default: 12 },
        serviceCharge: { type: Number, min: 0, default: 0 },
        serviceChargeRate: { type: Number, min: 0, max: 100, default: 0 },
        deliveryFee: { type: Number, min: 0, default: 0 },
        discount: { type: Number, min: 0, default: 0 },
        discountDetails: { type: String, trim: true },
        tip: { type: Number, min: 0, default: 0 },
        totalAmount: { type: Number, min: 0, default: 0 },
        paymentMethod: {
            type: String,
            required: [true, 'El método de pago es requerido'],
            enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'WALLET', 'MIXTO'],
            default: 'EFECTIVO'
        },
        paymentStatus: {
            type: String,
            enum: ['PENDIENTE', 'PAGADO', 'CANCELADO', 'REEMBOLSADO'],
            default: 'PENDIENTE'
        },
        amountPaid: { type: Number, min: 0, default: 0 },
        changeReturned: { type: Number, min: 0, default: 0 },
        paymentReference: { type: String, trim: true },
        issuedAt: { type: Date, default: Date.now },
        paidAt: { type: Date },
        invoiceSeries: { type: String, default: 'A' },
        invoiceType: {
            type: String,
            enum: ['FACTURA', 'NOTA_CREDITO', 'RECIBO'],
            default: 'FACTURA'
        },
        cancellationReason: { type: String, trim: true, maxLength: 500 },
        cancelledAt: { type: Date },
        cancelledByUserId: { type: String },   // userId string (no ObjectId)
        notes: { type: String, trim: true, maxLength: 1000 },
        currency: { type: String, default: 'GTQ', enum: ['GTQ', 'USD'] },
        pdfUrl: { type: String },
        pdfPublicId: { type: String }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// ─── Índices (sin duplicados) ───────────────────────────────────────────────
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ issuedAt: 1 });
invoiceSchema.index({ userId: 1, issuedAt: -1 });
invoiceSchema.index({ restaurant: 1, issuedAt: -1 });
invoiceSchema.index({ paymentMethod: 1 });
invoiceSchema.index({ invoiceType: 1 });

// ─── Pre-save: número de factura automático ─────────────────────────────────
invoiceSchema.pre('save', async function() {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        this.invoiceNumber = `${this.invoiceSeries}-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    }
    // Calcular totalAmount si no viene del body
    if (!this.totalAmount || this.totalAmount === 0) {
        const tax = this.subtotal * (this.taxRate / 100);
        this.taxAmount = tax;
        this.totalAmount = this.subtotal + tax + this.serviceCharge + this.deliveryFee + this.tip - this.discount;
    }
});

// ─── Virtual: saldo pendiente ───────────────────────────────────────────────
invoiceSchema.virtual('balanceDue').get(function() {
    return Math.max(0, this.totalAmount - this.amountPaid);
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

export default mongoose.model('Invoice', invoiceSchema);
