'use strict';

import mongoose from 'mongoose';

const restaurantSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxLength: [100, 'No puede exceder 100 caracteres']
        },

        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true
        },

        address: {
            type: String,
            required: [true, 'La dirección es requerida'],
            trim: true
        },

        phone: {
            type: String,
            required: [true, 'El teléfono es requerido'],
            trim: true
        },

        email: {
            type: String,
            required: [true, 'El email es requerido'],
            trim: true,
            lowercase: true
        },

        category: {
            type: String,
            required: true,
            enum: ['GOURMET', 'CASUAL', 'CAFETERIA', 'FAST_FOOD', 'OTRO']
        },

        averagePrice: {
            type: Number,
            required: true,
            min: 0
        },

        openingHours: {
            type: String,
            required: true
        },

        closingHours: {
            type: String,
            required: true
        },

        images:{
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

restaurantSchema.index({ name: 1 });
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ owner: 1 });

export default mongoose.model('Restaurant', restaurantSchema);
