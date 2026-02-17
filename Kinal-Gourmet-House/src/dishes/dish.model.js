'use strict';

import mongoose from 'mongoose';

const dishSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del platillo es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxLength: [500, 'La descripción no puede exceder 500 caracteres']
        },
        ingredients: {
            type: [String],
            default: []
        },
        price: {
            type: mongoose.Decimal128,
            required: [true, 'El precio es requerido'],
            min: [0, 'El precio debe ser mayor o igual a 0']
        },
        type: {
            type: String,
            required: [true, 'El tipo de platillo es requerido'],
            enum: {
                values: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'],
                message: 'Tipo no válido. Debe ser: ENTRADA, PLATO_FUERTE, POSTRE o BEBIDA'
            }
        },
        image: {
            type: String,
            default: null
        },
        image_public_id: {
            type: String,
            default: null
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        menu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: [true, 'La referencia al menú es requerida']
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La referencia al restaurante es requerida']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices para mejorar búsquedas
dishSchema.index({ isAvailable: 1 });
dishSchema.index({ menu: 1 });
dishSchema.index({ restaurant: 1 });
dishSchema.index({ type: 1 });
dishSchema.index({ restaurant: 1, type: 1, isAvailable: 1 });

export default mongoose.model('Dish', dishSchema);