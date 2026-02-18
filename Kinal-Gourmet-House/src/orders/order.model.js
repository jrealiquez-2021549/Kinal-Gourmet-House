import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema(
    {
        dish: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dish",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        },
        specialInstructions: {
            type: String,
            maxLength: 200
        }
    },
    { _id: false }
);

orderDetailSchema.pre('validate', function () {
    this.subtotal = this.quantity * this.unitPrice;
});

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,  // ⚠️ CAMBIO: String en vez de ObjectId
            required: [true, 'El ID del usuario es requerido']
        },

        userInfo: {
            name: { type: String },
            email: { type: String }
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: [true, 'El restaurante es requerido']
        },

        orderType: {
            type: String,
            enum: ['EN_MESA', 'PARA_LLEVAR', 'DOMICILIO'],
            required: true,
            default: 'EN_MESA'
        },

        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: function() {
                return this.orderType === 'EN_MESA';
            }
        },

        deliveryAddress: {
            street: String,
            city: String,
            zone: String,
            additionalInfo: String
        },

        deliveryPhone: {
            type: String,
            required: function() {
                return this.orderType === 'DOMICILIO';
            }
        },

        details: {
            type: [orderDetailSchema],
            required: true,
            validate: {
                validator: function(v) {
                    return v && v.length > 0;
                },
                message: 'Debe incluir al menos un platillo'
            }
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        deliveryFee: {
            type: Number,
            default: 0,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        appliedCoupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon"
        },

        status: {
            type: String,
            enum: [
                'PENDIENTE',
                'CONFIRMADO',
                'EN_PREPARACION',
                'LISTO',
                'EN_CAMINO',
                'ENTREGADO',
                'CANCELADO'
            ],
            default: 'PENDIENTE'
        },

        statusHistory: [{
            status: String,
            timestamp: { type: Date, default: Date.now },
            notes: String
        }],

        notes: {
            type: String,
            maxLength: 500
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });

export default mongoose.model("Order", orderSchema);