'use strict';

import mongoose from 'mongoose';

const tableSchema = mongoose.Schema(
    {
        number: {
            type: String,
            required: [true, 'El número de mesa es requerido'],
            trim: true
        },

        capacity: {
            type: Number,
            required: [true, 'La capacidad es requerida'],
            min: [1, 'Debe tener al menos 1 persona'],
            max: [20, 'La capacidad máxima es de 20 personas']
        },

        location: {
            type: String,
            enum: {
                values: ['INTERIOR', 'TERRAZA', 'VIP', 'BAR', 'PRIVADO'],
                message: 'Ubicación no válida'
            },
            required: true
        },

        status: {
            type: String,
            enum: {
                values: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
                message: 'Estado no válido'
            },
            default: 'AVAILABLE'
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'La mesa debe pertenecer a un restaurante']
        },

        description: {
            type: String,
            trim: true,
            maxLength: [200, 'La descripción no puede exceder 200 caracteres']
        },

        features: {
            isAccessible: {
                type: Boolean,
                default: false
            },
            hasView: {
                type: Boolean,
                default: false
            },
            isQuiet: {
                type: Boolean,
                default: false
            },
            hasPowerOutlet: {
                type: Boolean,
                default: false
            },
            nearWindow: {
                type: Boolean,
                default: false
            },
            nearKitchen: {
                type: Boolean,
                default: false
            }
        },

        shape: {
            type: String,
            enum: ['CUADRADA', 'RECTANGULAR', 'CIRCULAR', 'OVAL'],
            default: 'CUADRADA'
        },

        minCapacity: {
            type: Number,
            min: 1,
            default: 1,
            validate: {
                validator: function(v) {
                    return v <= this.capacity;
                },
                message: 'La capacidad mínima no puede ser mayor que la capacidad máxima'
            }
        },

        extraCharge: {
            type: Number,
            min: 0,
            default: 0
        },

        requiresReservation: {
            type: Boolean,
            default: false
        },

        position: {
            x: Number,
            y: Number,
            floor: {
                type: Number,
                default: 1
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

        isActive: {
            type: Boolean,
            default: true
        },

        internalNotes: {
            type: String,
            trim: true,
            maxLength: [500, 'Las notas no pueden exceder 500 caracteres']
        },

        lastOccupiedAt: {
            type: Date,
            default: null
        },

        reservationCount: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

tableSchema.index({ restaurant: 1, number: 1 }, { unique: true });

tableSchema.index({ status: 1 });
tableSchema.index({ location: 1 });
tableSchema.index({ restaurant: 1, status: 1 });
tableSchema.index({ restaurant: 1, isActive: 1 });
tableSchema.index({ restaurant: 1, capacity: 1 });

tableSchema.virtual('isAvailable').get(function() {
    return this.status === 'AVAILABLE' && this.isActive;
});

tableSchema.virtual('displayName').get(function() {
    return `Mesa ${this.number} - ${this.location}`;
});

tableSchema.virtual('isPremium').get(function() {
    return this.location === 'VIP' || this.location === 'PRIVADO' || this.extraCharge > 0;
});

tableSchema.methods.isAvailableAt = async function(date, time) {
    const Reservation = mongoose.model('Reservation');
    
    const reservationDate = new Date(date);
    const [hours, minutes] = time.split(':');
    reservationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const startTime = new Date(reservationDate.getTime() - 2 * 60 * 60 * 1000);
    const endTime = new Date(reservationDate.getTime() + 2 * 60 * 60 * 1000);
    
    const conflicts = await Reservation.countDocuments({
        table: this._id,
        date: {
            $gte: startTime,
            $lte: endTime
        },
        status: { $in: ['PENDING', 'CONFIRMED'] },
        isActive: true
    });
    
    return conflicts === 0;
};

tableSchema.methods.markAsOccupied = async function() {
    this.status = 'OCCUPIED';
    this.lastOccupiedAt = new Date();
    await this.save();
    return this;
};

tableSchema.methods.markAsAvailable = async function() {
    this.status = 'AVAILABLE';
    await this.save();
    return this;
};

tableSchema.methods.reserve = async function() {
    if (this.status !== 'AVAILABLE') {
        throw new Error('La mesa no está disponible');
    }
    
    this.status = 'RESERVED';
    this.reservationCount += 1;
    await this.save();
    return this;
};

tableSchema.statics.findAvailable = async function(restaurantId, capacity, date, time) {
    const tables = await this.find({
        restaurant: restaurantId,
        status: 'AVAILABLE',
        isActive: true,
        capacity: { $gte: capacity },
        minCapacity: { $lte: capacity }
    }).sort({ capacity: 1 });
    
    const availableTables = [];
    for (const table of tables) {
        const isAvailable = await table.isAvailableAt(date, time);
        if (isAvailable) {
            availableTables.push(table);
        }
    }
    
    return availableTables;
};

tableSchema.statics.getRestaurantStats = async function(restaurantId) {
    const stats = await this.aggregate([
        { $match: { restaurant: mongoose.Types.ObjectId(restaurantId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalCapacity: { $sum: '$capacity' }
            }
        }
    ]);
    
    const total = await this.countDocuments({ restaurant: restaurantId });
    const totalCapacity = await this.aggregate([
        { $match: { restaurant: mongoose.Types.ObjectId(restaurantId), isActive: true } },
        { $group: { _id: null, total: { $sum: '$capacity' } } }
    ]);
    
    return {
        byStatus: stats,
        total: total,
        totalCapacity: totalCapacity[0]?.total || 0
    };
};

tableSchema.pre('save', async function() {
    if (this.minCapacity > this.capacity) {
        throw new Error('La capacidad mínima no puede ser mayor que la capacidad máxima');
    }
});

tableSchema.set('toJSON', { virtuals: true });
tableSchema.set('toObject', { virtuals: true });

export default mongoose.model('Table', tableSchema);