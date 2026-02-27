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
            default: [],
            validate: {
                validator: function(v) {
                    return v.length > 0;
                },
                message: 'Debe incluir al menos un ingrediente'
            }
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
                values: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'GUARNICION'],
                message: 'Tipo no válido. Debe ser: ENTRADA, PLATO_FUERTE, POSTRE, BEBIDA o GUARNICION'
            }
        },

        category: {
            type: String,
            enum: {
                values: [
                    'VEGETARIANO',
                    'VEGANO',
                    'SIN_GLUTEN',
                    'KETO',
                    'LIGHT',
                    'PICANTE',
                    'INFANTIL',
                    'PREMIUM',
                    'ESPECIAL_DEL_DIA',
                    'NINGUNA'
                ],
                message: 'Categoría no válida'
            },
            default: 'NINGUNA'
        },

        allergens: {
            type: [String],
            enum: {
                values: [
                    'GLUTEN',
                    'LACTEOS',
                    'HUEVO',
                    'PESCADO',
                    'MARISCOS',
                    'FRUTOS_SECOS',
                    'SOYA',
                    'APIO',
                    'MOSTAZA',
                    'SESAMO',
                    'SULFITOS',
                    'CACAHUATES'
                ],
                message: 'Alergeno no válido'
            },
            default: []
        },

        nutritionalInfo: {
            calories: {
                type: Number,
                min: 0
            },
            protein: {
                type: Number,
                min: 0
            },
            carbs: {
                type: Number,
                min: 0
            },
            fats: {
                type: Number,
                min: 0
            },
            servingSize: {
                type: String,
                trim: true
            }
        },

        preparationTime: {
            type: Number,
            min: [1, 'El tiempo de preparación debe ser al menos 1 minuto'],
            max: [180, 'El tiempo de preparación no puede exceder 3 horas'],
            default: 15
        },

        spicyLevel: {
            type: String,
            enum: {
                values: ['NINGUNO', 'SUAVE', 'MEDIO', 'PICANTE', 'MUY_PICANTE'],
                message: 'Nivel de picante no válido'
            },
            default: 'NINGUNO'
        },
        
        image: {
            type: String,
            default: null
        },
        
        image_public_id: {
            type: String,
            default: null
        },

        gallery: [{
            url: String,
            public_id: String,
            description: String
        }],
        
        isAvailable: {
            type: Boolean,
            default: true
        },

        hasLimitedStock: {
            type: Boolean,
            default: false
        },

        currentStock: {
            type: Number,
            min: 0,
            default: null,
            required: function() {
                return this.hasLimitedStock === true;
            }
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La referencia al restaurante es requerida']
        },

        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },

        reviewCount: {
            type: Number,
            min: 0,
            default: 0
        },

        orderedCount: {
            type: Number,
            min: 0,
            default: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        sortOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

dishSchema.index({ isAvailable: 1 });
dishSchema.index({ restaurant: 1 });
dishSchema.index({ type: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ restaurant: 1, type: 1, isAvailable: 1 });
dishSchema.index({ restaurant: 1, isFeatured: 1 });
dishSchema.index({ restaurant: 1, sortOrder: 1 });

dishSchema.index({ name: 'text', description: 'text', ingredients: 'text' });

dishSchema.index({ allergens: 1 });

dishSchema.virtual('inStock').get(function() {
    if (!this.hasLimitedStock) {
        return true;
    }
    return this.currentStock > 0;
});

dishSchema.virtual('isFullyAvailable').get(function() {
    return this.isAvailable && this.inStock;
});

dishSchema.virtual('priceNumber').get(function() {
    return parseFloat(this.price.toString());
});

dishSchema.methods.decrementStock = async function(quantity) {
    if (!this.hasLimitedStock) {
        return true;
    }

    if (this.currentStock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${this.currentStock}, Solicitado: ${quantity}`);
    }

    this.currentStock -= quantity;
    await this.save();
    return true;
};

dishSchema.methods.incrementStock = async function(quantity) {
    if (!this.hasLimitedStock) {
        return true;
    }

    this.currentStock += quantity;
    await this.save();
    return true;
};

dishSchema.methods.updateRating = async function(newRating) {
    const totalRating = (this.averageRating * this.reviewCount) + newRating;
    this.reviewCount += 1;
    this.averageRating = totalRating / this.reviewCount;
    await this.save();
    return this.averageRating;
};

dishSchema.pre('save', async function() {
    if (this.hasLimitedStock && this.currentStock === null) {
        throw new Error('Debe especificar la cantidad en stock');
    }
    if (!this.hasLimitedStock) {
        this.currentStock = null;
    }
});

dishSchema.set('toJSON', { virtuals: true });
dishSchema.set('toObject', { virtuals: true });

export default mongoose.model('Dish', dishSchema);