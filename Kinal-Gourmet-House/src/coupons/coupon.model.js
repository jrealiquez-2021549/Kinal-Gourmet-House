'use strict';

import mongoose from 'mongoose';

const couponSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'El código del cupón es requerido'],
            unique: true,
            uppercase: true,
            trim: true,
            minLength: [4, 'El código debe tener al menos 4 caracteres'],
            maxLength: [20, 'El código no puede exceder 20 caracteres']
        },
        
        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxLength: [200, 'La descripción no puede exceder 200 caracteres']
        },

        discountType: {
            type: String,
            required: [true, 'El tipo de descuento es requerido'],
            enum: {
                values: ['PERCENTAGE', 'FIXED'],
                message: 'Tipo de descuento debe ser PERCENTAGE o FIXED'
            }
        },

        discountValue: {
            type: Number,
            required: [true, 'El valor del descuento es requerido'],
            min: [0, 'El valor del descuento no puede ser negativo'],
            validate: {
                validator: function(value) {
                    if (this.discountType === 'PERCENTAGE') {
                        return value >= 0 && value <= 100;
                    }
                    return value >= 0;
                },
                message: 'Para descuento porcentual, el valor debe estar entre 0 y 100'
            }
        },

        // Descuento máximo en dinero (útil para porcentajes)
        maxDiscount: {
            type: Number,
            min: [0, 'El descuento máximo no puede ser negativo'],
            default: null
        },

        // Monto mínimo de compra para aplicar el cupón
        minPurchaseAmount: {
            type: Number,
            min: [0, 'El monto mínimo no puede ser negativo'],
            default: 0
        },

        validFrom: {
            type: Date,
            required: [true, 'La fecha de inicio es requerida'],
            default: Date.now
        },

        validUntil: {
            type: Date,
            required: [true, 'La fecha de expiración es requerida'],
            validate: {
                validator: function(value) {
                    return value > this.validFrom;
                },
                message: 'La fecha de expiración debe ser posterior a la fecha de inicio'
            }
        },

        // Límite de usos totales (null = ilimitado)
        usageLimit: {
            type: Number,
            min: [1, 'El límite de uso debe ser al menos 1'],
            default: null
        },

        // Cantidad de veces que ya se ha usado
        usedCount: {
            type: Number,
            min: [0, 'El contador de uso no puede ser negativo'],
            default: 0
        },

        // Límite de uso por usuario (null = ilimitado)
        usageLimitPerUser: {
            type: Number,
            min: [1, 'El límite por usuario debe ser al menos 1'],
            default: 1
        },

        // Restaurantes donde aplica (vacío = todos)
        applicableRestaurants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant'
        }],

        // Tipo de pedido donde aplica (vacío = todos)
        applicableOrderTypes: [{
            type: String,
            enum: ['EN_MESA', 'PARA_LLEVAR', 'DOMICILIO']
        }],

        // Solo para nuevos usuarios
        newUsersOnly: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // Usuario que creó el cupón (ID como string desde AuthRestaurante)
        createdByUserId: {
            type: String,
            required: true
        },

        createdByName: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ applicableRestaurants: 1 });

// Virtual para verificar si está vigente
couponSchema.virtual('isCurrentlyValid').get(function() {
    const now = new Date();
    return this.isActive && 
           this.validFrom <= now && 
           this.validUntil >= now &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Virtual para verificar si está disponible
couponSchema.virtual('remainingUses').get(function() {
    if (this.usageLimit === null) {
        return 'Ilimitado';
    }
    return Math.max(0, this.usageLimit - this.usedCount);
});

// ✅ MÉTODO PARA VALIDAR SI UN USUARIO PUEDE USAR EL CUPÓN
couponSchema.methods.validateForUse = async function(userId, restaurantId = null, orderTotal = 0) {
    const now = new Date();

    // Verificar si está activo
    if (!this.isActive) {
        return { valid: false, message: 'El cupón no está activo' };
    }

    // Verificar fechas
    if (now < this.validFrom) {
        return { valid: false, message: 'El cupón aún no es válido' };
    }

    if (now > this.validUntil) {
        return { valid: false, message: 'El cupón ha expirado' };
    }

    // Verificar límite global de usos
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'El cupón ha alcanzado su límite de usos' };
    }

    // Verificar monto mínimo de compra
    if (orderTotal < this.minPurchaseAmount) {
        return { 
            valid: false, 
            message: `El monto mínimo de compra es ${this.minPurchaseAmount}` 
        };
    }

    // Verificar usos por usuario
    try {
        const CouponUsage = mongoose.model('CouponUsage');
        const userUsageCount = await CouponUsage.countDocuments({
            coupon: this._id,
            user: userId
        });

        if (this.usageLimitPerUser !== null && userUsageCount >= this.usageLimitPerUser) {
            return { 
                valid: false, 
                message: 'Ya has usado este cupón el máximo de veces permitido' 
            };
        }
    } catch (error) {
        console.error('Error verificando uso por usuario:', error);
    }

    // Verificar si aplica al restaurante
    if (this.applicableRestaurants.length > 0 && restaurantId) {
        const restaurantMatch = this.applicableRestaurants.some(
            r => r.toString() === restaurantId.toString()
        );
        if (!restaurantMatch) {
            return { 
                valid: false, 
                message: 'Este cupón no es válido para este restaurante' 
            };
        }
    }

    // Verificar si es solo para nuevos usuarios
    if (this.newUsersOnly) {
        try {
            const Order = mongoose.model('Order');
            const previousOrders = await Order.countDocuments({
                user: userId,
                status: 'ENTREGADO'
            });

            if (previousOrders > 0) {
                return { 
                    valid: false, 
                    message: 'Este cupón es solo para nuevos usuarios' 
                };
            }
        } catch (error) {
            console.error('Error verificando si es nuevo usuario:', error);
        }
    }

    return { valid: true, message: 'Cupón válido' };
};

// ✅ MÉTODO PARA REGISTRAR EL USO DEL CUPÓN
couponSchema.methods.recordUsage = async function(userId, orderId) {
    try {
        const CouponUsage = mongoose.model('CouponUsage');
        
        // Crear registro de uso
        await CouponUsage.create({
            coupon: this._id,
            user: userId,
            order: orderId,
            discountApplied: 0, // Se calculará en el controlador
            usedAt: new Date()
        });

        // Incrementar contador
        this.usedCount += 1;
        await this.save();

        return true;
    } catch (error) {
        console.error('Error registrando uso del cupón:', error);
        throw error;
    }
};

// Incluir virtuals en JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

export default mongoose.model('Coupon', couponSchema);