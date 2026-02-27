'use strict';

import mongoose from 'mongoose';

const couponUsageSchema = mongoose.Schema(
    {
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            required: [true, 'La referencia al cupón es requerida']
        },
        
        userId: {
            type: String,
            required: [true, 'El ID del usuario es requerido']
        },
        userInfo: {
            name: { type: String },
            email: { type: String }
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'La referencia a la orden es requerida']
        },
        discountApplied: {
            type: Number,
            required: [true, 'El monto del descuento es requerido'],
            min: [0, 'El descuento no puede ser negativo'],
            default: 0
        },
        usedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

couponUsageSchema.index({ coupon: 1, userId: 1 });
couponUsageSchema.index({ userId: 1 });
couponUsageSchema.index({ order: 1 }, { unique: true });
couponUsageSchema.index({ usedAt: -1 });

export default mongoose.model('CouponUsage', couponUsageSchema);
