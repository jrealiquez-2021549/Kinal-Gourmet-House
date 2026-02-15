'use strict';

import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    items: [{
        dishName: String,
        price: Number,
        quantity: Number
    }],
    subtotal: { type: Number, required: true },
    serviceTax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'CARD'], default: 'CASH' }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Invoice', invoiceSchema);