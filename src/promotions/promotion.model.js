'use strict';

import mongoose from 'mongoose';

const promotionSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El título es requerido'],
            trim: true,
            maxLength: [100, 'El título no puede exceder 100 caracteres']
        },
        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxLength: [500, 'La descripción no puede exceder 500 caracteres']
        },
        discountPercentage: {
            type: Number,
            required: [true, 'El porcentaje de descuento es requerido'],
            min: [0, 'El descuento no puede ser negativo'],
            max: [100, 'El descuento no puede exceder 100%']
        },
        startDate: {
            type: Date,
            required: [true, 'La fecha de inicio es requerida']
        },
        endDate: {
            type: Date,
            required: [true, 'La fecha de fin es requerida'],
            validate: {
                validator: function(value) {
                    return value > this.startDate;
                },
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            }
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La referencia al restaurante es requerida']
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

// Índices
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ restaurant: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ restaurant: 1, isActive: 1 });

// Método virtual para verificar si la promoción está vigente
promotionSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    return this.isActive && 
        this.startDate <= now && 
        this.endDate >= now;
});

// Incluir virtuals en JSON y Object
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Promotion', promotionSchema);