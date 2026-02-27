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

        type: {
            type: String,
            enum: {
                values: [
                    'DESCUENTO_PORCENTAJE',
                    'DESCUENTO_FIJO',
                    '2X1',
                    'COMBO',
                    'ENVIO_GRATIS',
                    'REGALO',
                    'HAPPY_HOUR'
                ],
                message: 'Tipo de promoción no válido'
            },
            required: true
        },

        discountPercentage: {
            type: Number,
            min: [0, 'El descuento no puede ser negativo'],
            max: [100, 'El descuento no puede exceder 100%'],
            required: function() {
                return this.type === 'DESCUENTO_PORCENTAJE';
            }
        },

        discountAmount: {
            type: Number,
            min: [0, 'El descuento no puede ser negativo'],
            required: function() {
                return this.type === 'DESCUENTO_FIJO';
            }
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

        timeRestriction: {
            startTime: {
                type: String,
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido']
            },
            endTime: {
                type: String,
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido']
            }
        },

        applicableDays: {
            type: [String],
            enum: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
            default: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La referencia al restaurante es requerida']
        },

        applicableDishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }],

        applicableDishCategories: {
            type: [String],
            enum: ['VEGETARIANO', 'VEGANO', 'SIN_GLUTEN', 'KETO', 'LIGHT', 'PICANTE', 'INFANTIL', 'PREMIUM'],
            default: []
        },

        applicableDishTypes: {
            type: [String],
            enum: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'GUARNICION'],
            default: []
        },

        minPurchaseAmount: {
            type: Number,
            min: 0,
            default: 0
        },

        usageLimit: {
            type: Number,
            min: 1,
            default: null
        },

        usedCount: {
            type: Number,
            min: 0,
            default: 0
        },

        usageLimitPerUser: {
            type: Number,
            min: 1,
            default: 1
        },

        promoCode: {
            type: String,
            trim: true,
            uppercase: true,
            sparse: true,
            unique: true
        },

        requiresCode: {
            type: Boolean,
            default: false
        },

        newCustomersOnly: {
            type: Boolean,
            default: false
        },

        applicableOrderTypes: {
            type: [String],
            enum: ['EN_MESA', 'PARA_LLEVAR', 'DOMICILIO'],
            default: ['EN_MESA', 'PARA_LLEVAR', 'DOMICILIO']
        },

        image: {
            type: String,
            default: null
        },

        image_public_id: {
            type: String,
            default: null
        },

        priority: {
            type: Number,
            min: 0,
            default: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        termsAndConditions: {
            type: String,
            trim: true,
            maxLength: [1000, 'Los términos no pueden exceder 1000 caracteres']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

promotionSchema.index({ isActive: 1 });
promotionSchema.index({ restaurant: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ restaurant: 1, isActive: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ isFeatured: 1, priority: -1 });
promotionSchema.index({ applicableDishes: 1 });

promotionSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    
    if (!(this.startDate <= now && this.endDate >= now && this.isActive)) {
        return false;
    }
    
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return false;
    }
    
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const today = days[now.getDay()];
    if (!this.applicableDays.includes(today)) {
        return false;
    }
    
    if (this.timeRestriction && this.timeRestriction.startTime && this.timeRestriction.endTime) {
        const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const [startH, startM] = this.timeRestriction.startTime.split(':').map(Number);
        const [endH, endM] = this.timeRestriction.endTime.split(':').map(Number);
        const [currH, currM] = currentTime.split(':').map(Number);
        
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const currentMinutes = currH * 60 + currM;
        
        if (!(currentMinutes >= startMinutes && currentMinutes <= endMinutes)) {
            return false;
        }
    }
    
    return true;
});

promotionSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

promotionSchema.virtual('usesRemaining').get(function() {
    if (this.usageLimit === null) {
        return 'Ilimitado';
    }
    return Math.max(0, this.usageLimit - this.usedCount);
});

promotionSchema.methods.appliesToDish = function(dish) {

    if (this.applicableDishes && this.applicableDishes.length > 0) {
        const dishId = typeof dish === 'object' ? dish._id : dish;
        return this.applicableDishes.some(d => d.toString() === dishId.toString());
    }
    
    if (this.applicableDishCategories && this.applicableDishCategories.length > 0) {
        if (typeof dish === 'object' && dish.category) {
            return this.applicableDishCategories.includes(dish.category);
        }
    }
    
    if (this.applicableDishTypes && this.applicableDishTypes.length > 0) {
        if (typeof dish === 'object' && dish.type) {
            return this.applicableDishTypes.includes(dish.type);
        }
    }
    
    return true;
};

promotionSchema.methods.calculateDiscount = function(subtotal, items = []) {
    if (!this.isCurrentlyActive) {
        return 0;
    }
    
    if (subtotal < this.minPurchaseAmount) {
        return 0;
    }
    
    let discount = 0;
    
    switch (this.type) {
        case 'DESCUENTO_PORCENTAJE':
            discount = subtotal * (this.discountPercentage / 100);
            break;
            
        case 'DESCUENTO_FIJO':
            discount = this.discountAmount;
            break;
            
        case '2X1':
            const applicableItems = items.filter(item => this.appliesToDish(item.dish));
            applicableItems.sort((a, b) => b.price - a.price);
            
            let pairs = 0;
            for (const item of applicableItems) {
                pairs += Math.floor(item.quantity / 2);
            }
            
            discount = applicableItems.slice(0, pairs).reduce((sum, item) => sum + item.price, 0);
            break;
            
        case 'ENVIO_GRATIS':

            discount = 0;
            break;
            
        default:
            discount = 0;
    }
    
    return Math.min(discount, subtotal);
};

promotionSchema.methods.recordUsage = async function() {
    this.usedCount += 1;
    await this.save();
    return this;
};

promotionSchema.statics.getActivePromotions = async function(restaurantId, filters = {}) {
    const now = new Date();
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const today = days[now.getDay()];
    
    const query = {
        restaurant: restaurantId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        applicableDays: today,
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
    };
    
    if (filters.orderType) {
        query.applicableOrderTypes = filters.orderType;
    }
    
    return await this.find(query).sort({ priority: -1, isFeatured: -1 });
};

promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Promotion', promotionSchema);