'use strict';

import mongoose from 'mongoose';

const reservationSchema = mongoose.Schema(
    {
        user :{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'La reservación debe pertenecer a un usuario']
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La reservación debe pertenecer a un restaurante']
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: [true,'La reservación debe pertenecer a una mesa']
        },
        date:{
            type: Date,
            required: [true,'La fecha de reservación debe ser válida']
        },
        time: {
            type: String,
            required: [true,'La hora de reservación debe ser válida']
        },
        numberOfPeople: {
            type: Number,
            required: true,
            min: [1, 'La reservación debe ser minimo de una persona']
        },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            default: 'PENDING'
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
)

reservationSchema.index({ isActive: 1 })
reservationSchema.index({ restaurant: 1 })
reservationSchema.index({ table: 1 })
reservationSchema.index({ date: 1 })


reservationSchema.index({ table: 1, date: 1, time: 1, isActive: 1 })

export default mongoose.model('Reservation', reservationSchema)