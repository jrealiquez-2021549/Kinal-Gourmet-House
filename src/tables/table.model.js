'use strict';

import mongoose from 'mongoose';

const tableSchema = mongoose.Schema(
    {
        number: {
            type: Number,
            required: [true, 'El número de mesa es requerido']
        },

        capacity: {
            type: Number,
            required: [true, 'La capacidad es requerida'],
            min: [1, 'Debe tener al menos 1 persona']
        },

        location: {
            type: String,
            enum: ['INTERIOR', 'TERRAZA', 'VIP'],
            required: true
        },

        status: {
            type: String,
            enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
            default: 'AVAILABLE'
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La mesa debe pertenecer a un restaurante']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model('Table', tableSchema);
