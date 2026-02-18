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

        // NUEVO: Descripción adicional
        description: {
            type: String,
            trim: true,
            maxLength: [200, 'La descripción no puede exceder 200 caracteres']
        },

        // NUEVO: Características especiales
        features: {
            isAccessible: {
                type: Boolean,
                default: false // Accesible para sillas de ruedas
            },
            hasView: {
                type: Boolean,
                default: false // Tiene vista especial
            },
            isQuiet: {
                type: Boolean,
                default: false // Zona tranquila
            },
            hasPowerOutlet: {
                type: Boolean,
                default: false // Tiene enchufe
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

        // NUEVO: Forma de la mesa
        shape: {
            type: String,
            enum: ['CUADRADA', 'RECTANGULAR', 'CIRCULAR', 'OVAL'],
            default: 'CUADRADA'
        },

        // NUEVO: Mínimo de personas requerido
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

        // NUEVO: Precio extra (para mesas VIP)
        extraCharge: {
            type: Number,
            min: 0,
            default: 0
        },

        // NUEVO: Requiere reservación previa
        requiresReservation: {
            type: Boolean,
            default: false
        },

        // NUEVO: Posición en el plano del restaurante
        position: {
            x: Number,
            y: Number,
            floor: {
                type: Number,
                default: 1
            }
        },

        // NUEVO: Imagen de la mesa/ubicación
        image: {
            type: String,
            default: null
        },

        image_public_id: {
            type: String,
            default: null
        },

        // NUEVO: Activa o no
        isActive: {
            type: Boolean,
            default: true
        },

        // NUEVO: Notas internas
        internalNotes: {
            type: String,
            trim: true,
            maxLength: [500, 'Las notas no pueden exceder 500 caracteres']
        },

        // NUEVO: Última vez que estuvo ocupada
        lastOccupiedAt: {
            type: Date,
            default: null
        },

        // NUEVO: Contador de veces reservada
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

// NUEVO: Índice único compuesto - No pueden haber dos mesas con el mismo número en un restaurante
tableSchema.index({ restaurant: 1, number: 1 }, { unique: true });

// Índices adicionales
tableSchema.index({ status: 1 });
tableSchema.index({ location: 1 });
tableSchema.index({ restaurant: 1, status: 1 });
tableSchema.index({ restaurant: 1, isActive: 1 });
tableSchema.index({ restaurant: 1, capacity: 1 });

// Virtual para verificar si está disponible
tableSchema.virtual('isAvailable').get(function() {
    return this.status === 'AVAILABLE' && this.isActive;
});

// Virtual para obtener nombre completo
tableSchema.virtual('displayName').get(function() {
    return `Mesa ${this.number} - ${this.location}`;
});

// Virtual para verificar si es premium
tableSchema.virtual('isPremium').get(function() {
    return this.location === 'VIP' || this.location === 'PRIVADO' || this.extraCharge > 0;
});

// Método para verificar disponibilidad en un horario
tableSchema.methods.isAvailableAt = async function(date, time) {
    const Reservation = mongoose.model('Reservation');
    
    // Crear fecha y hora completa
    const reservationDate = new Date(date);
    const [hours, minutes] = time.split(':');
    reservationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Buscar conflictos (2 horas antes y después)
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

// Método para marcar como ocupada
tableSchema.methods.markAsOccupied = async function() {
    this.status = 'OCCUPIED';
    this.lastOccupiedAt = new Date();
    await this.save();
    return this;
};

// Método para marcar como disponible
tableSchema.methods.markAsAvailable = async function() {
    this.status = 'AVAILABLE';
    await this.save();
    return this;
};

// Método para reservar
tableSchema.methods.reserve = async function() {
    if (this.status !== 'AVAILABLE') {
        throw new Error('La mesa no está disponible');
    }
    
    this.status = 'RESERVED';
    this.reservationCount += 1;
    await this.save();
    return this;
};

// Método estático para buscar mesas disponibles
tableSchema.statics.findAvailable = async function(restaurantId, capacity, date, time) {
    const tables = await this.find({
        restaurant: restaurantId,
        status: 'AVAILABLE',
        isActive: true,
        capacity: { $gte: capacity },
        minCapacity: { $lte: capacity }
    }).sort({ capacity: 1 }); // Ordenar por capacidad ascendente
    
    // Filtrar por disponibilidad de horario
    const availableTables = [];
    for (const table of tables) {
        const isAvailable = await table.isAvailableAt(date, time);
        if (isAvailable) {
            availableTables.push(table);
        }
    }
    
    return availableTables;
};

// Método estático para obtener estadísticas
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

// Middleware para validar capacidad mínima antes de guardar
tableSchema.pre('save', async function() {
    if (this.minCapacity > this.capacity) {
        throw new Error('La capacidad mínima no puede ser mayor que la capacidad máxima');
    }
});

// Incluir virtuals
tableSchema.set('toJSON', { virtuals: true });
tableSchema.set('toObject', { virtuals: true });

export default mongoose.model('Table', tableSchema);