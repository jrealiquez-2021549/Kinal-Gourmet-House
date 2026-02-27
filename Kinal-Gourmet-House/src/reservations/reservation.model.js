'use strict';

import mongoose from 'mongoose';

const reservationSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'La reservación debe pertenecer a un usuario']
        },
        userInfo: {
            name: { type: String },
            email: { type: String }
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La reservación debe pertenecer a un restaurante']
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: [true, 'La reservación debe pertenecer a una mesa']
        },
        date: {
            type: Date,
            required: [true, 'La fecha es requerida']
        },
        time: {
            type: String,
            required: [true, 'La hora es requerida']
        },
        numberOfGuests: {
            type: Number,
            required: [true, 'El número de comensales es requerido'],
            min: [1, 'Debe haber al menos 1 comensal']
        },
        status: {
            type: String,
            enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'],
            default: 'PENDIENTE'
        },
        specialRequests: {
            type: String,
            maxLength: 500
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model('Reservation', reservationSchema);
