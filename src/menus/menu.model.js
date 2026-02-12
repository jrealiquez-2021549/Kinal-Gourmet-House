'use strict';

import mongoose from 'mongoose';

const menuSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del menú es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxLength: [500, 'La descripción no puede exceder 500 caracteres']
        },
        price: {
            type: mongoose.Decimal128,
            required: [true, 'El precio es requerido'],
            min: [0, 'El precio debe ser mayor o igual a 0']
        },
        dishType: {
            type: String,
            required: [true, 'El tipo de platillo es requerido'],
            trim: true
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La referencia del restaurante es requerida']
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

menuSchema.index({ isActive: 1 });
menuSchema.index({ restaurant: 1 });
menuSchema.index({ isActive: 1, restaurant: 1 });

export default mongoose.model('Menu', menuSchema);