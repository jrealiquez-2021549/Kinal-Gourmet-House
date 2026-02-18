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

        // NUEVO: Tipo de promoción
        type: {
            type: String,
            enum: {
                values: [
                    'DESCUENTO_PORCENTAJE',  // 20% de descuento
                    'DESCUENTO_FIJO',        // Q50 de descuento
                    '2X1',                   // 2x1 en productos
                    'COMBO',                 // Combo especial
                    'ENVIO_GRATIS',          // Envío gratis
                    'REGALO',                // Regalo con compra
                    'HAPPY_HOUR'             // Happy hour
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

        // NUEVO: Descuento fijo en dinero
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

        // NUEVO: Horarios específicos (para Happy Hour)
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

        // NUEVO: Días de la semana donde aplica
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

        // NUEVO: Platillos específicos donde aplica
        applicableDishes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }],

        // NUEVO: Categorías de platillos donde aplica
        applicableDishCategories: {
            type: [String],
            enum: ['VEGETARIANO', 'VEGANO', 'SIN_GLUTEN', 'KETO', 'LIGHT', 'PICANTE', 'INFANTIL', 'PREMIUM'],
            default: []
        },

        // NUEVO: Tipos de platillos donde aplica
        applicableDishTypes: {
            type: [String],
            enum: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'GUARNICION'],
            default: []
        },

        // NUEVO: Monto mínimo de compra
        minPurchaseAmount: {
            type: Number,
            min: 0,
            default: 0
        },

        // NUEVO: Límite de usos totales
        usageLimit: {
            type: Number,
            min: 1,
            default: null // null = ilimitado
        },

        // NUEVO: Contador de usos
        usedCount: {
            type: Number,
            min: 0,
            default: 0
        },

        // NUEVO: Límite por usuario
        usageLimitPerUser: {
            type: Number,
            min: 1,
            default: 1
        },

        // NUEVO: Código promocional (opcional)
        promoCode: {
            type: String,
            trim: true,
            uppercase: true,
            sparse: true,
            unique: true
        },

        // NUEVO: Requiere código para aplicar
        requiresCode: {
            type: Boolean,
            default: false
        },

        // NUEVO: Solo para nuevos clientes
        newCustomersOnly: {
            type: Boolean,
            default: false
        },

        // NUEVO: Tipos de pedido donde aplica
        applicableOrderTypes: {
            type: [String],
            enum: ['EN_MESA', 'PARA_LLEVAR', 'DOMICILIO'],
            default: ['EN_MESA', 'PARA_LLEVAR', 'DOMICILIO']
        },

        // NUEVO: Imagen de la promoción
        image: {
            type: String,
            default: null
        },

        image_public_id: {
            type: String,
            default: null
        },

        // NUEVO: Prioridad (para mostrar primero las más importantes)
        priority: {
            type: Number,
            min: 0,
            default: 0
        },

        // NUEVO: Destacada
        isFeatured: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // NUEVO: Términos y condiciones
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

// Índices
// Índices (promoCode ya tiene unique:true en el schema, no se repite aquí)
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ restaurant: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ restaurant: 1, isActive: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ isFeatured: 1, priority: -1 });
// promoCode index already defined via 'unique: true, sparse: true' in field definition
promotionSchema.index({ applicableDishes: 1 });

// Virtual para verificar si está vigente
promotionSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    
    // Verificar fechas
    if (!(this.startDate <= now && this.endDate >= now && this.isActive)) {
        return false;
    }
    
    // Verificar límite de usos
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return false;
    }
    
    // Verificar día de la semana
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const today = days[now.getDay()];
    if (!this.applicableDays.includes(today)) {
        return false;
    }
    
    // Verificar horario
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

// Virtual para días restantes
promotionSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

// Virtual para usos disponibles
promotionSchema.virtual('usesRemaining').get(function() {
    if (this.usageLimit === null) {
        return 'Ilimitado';
    }
    return Math.max(0, this.usageLimit - this.usedCount);
});

// Método para verificar si aplica a un platillo
promotionSchema.methods.appliesToDish = function(dish) {
    // Si hay platillos específicos, verificar
    if (this.applicableDishes && this.applicableDishes.length > 0) {
        const dishId = typeof dish === 'object' ? dish._id : dish;
        return this.applicableDishes.some(d => d.toString() === dishId.toString());
    }
    
    // Si hay categorías específicas, verificar
    if (this.applicableDishCategories && this.applicableDishCategories.length > 0) {
        if (typeof dish === 'object' && dish.category) {
            return this.applicableDishCategories.includes(dish.category);
        }
    }
    
    // Si hay tipos específicos, verificar
    if (this.applicableDishTypes && this.applicableDishTypes.length > 0) {
        if (typeof dish === 'object' && dish.type) {
            return this.applicableDishTypes.includes(dish.type);
        }
    }
    
    // Si no hay restricciones, aplica a todos
    return true;
};

// Método para calcular descuento
promotionSchema.methods.calculateDiscount = function(subtotal, items = []) {
    if (!this.isCurrentlyActive) {
        return 0;
    }
    
    // Verificar monto mínimo
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
            // Calcular 2x1 en items aplicables
            const applicableItems = items.filter(item => this.appliesToDish(item.dish));
            applicableItems.sort((a, b) => b.price - a.price); // Ordenar por precio descendente
            
            let pairs = 0;
            for (const item of applicableItems) {
                pairs += Math.floor(item.quantity / 2);
            }
            
            // El descuento es el precio del item más barato de cada par
            discount = applicableItems.slice(0, pairs).reduce((sum, item) => sum + item.price, 0);
            break;
            
        case 'ENVIO_GRATIS':
            // Este descuento se maneja en el cálculo de delivery fee
            discount = 0;
            break;
            
        default:
            discount = 0;
    }
    
    return Math.min(discount, subtotal); // No puede ser mayor que el subtotal
};

// Método para registrar uso
promotionSchema.methods.recordUsage = async function() {
    this.usedCount += 1;
    await this.save();
    return this;
};

// Método estático para obtener promociones activas
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

// Incluir virtuals
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Promotion', promotionSchema);