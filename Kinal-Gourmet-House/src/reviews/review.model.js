'use strict';

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'El usuario es requerido']
        },
        userInfo: {
            name: { type: String },
            email: { type: String }
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: false
        },
        dish: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dish",
            required: false
        },
        rating: {
            type: Number,
            required: [true, 'La calificación es requerida'],
            min: [1, 'La calificación mínima es 1'],
            max: [5, 'La calificación máxima es 5']
        },
        comment: {
            type: String,
            maxLength: 1000
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

reviewSchema.pre('validate', function() {
    if (!this.restaurant && !this.dish) {
        return next(new Error('Debe especificar un restaurante o un platillo a reseñar'));
    }
});

export default mongoose.model("Review", reviewSchema);
