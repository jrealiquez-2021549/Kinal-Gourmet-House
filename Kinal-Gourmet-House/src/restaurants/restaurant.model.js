'use strict';

import mongoose from 'mongoose';

const restaurantSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxLength: [100, 'No puede exceder 100 caracteres']
        },

        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxLength: [1000, 'No puede exceder 1000 caracteres']
        },

        address: {
            type: String,
            required: [true, 'La dirección es requerida'],
            trim: true
        },

        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: [true, 'Las coordenadas son requeridas'],
                validate: {
                    validator: function(v) {
                        return v.length === 2 && 
                                v[0] >= -180 && v[0] <= 180 &&
                                v[1] >= -90 && v[1] <= 90;
                    },
                    message: 'Coordenadas inválidas. Formato: [longitude, latitude]'
                }
            }
        },

        addressDetails: {
            street: String,
            zone: String,
            city: {
                type: String,
                required: true,
                default: 'Guatemala'
            },
            department: String,
            country: {
                type: String,
                default: 'Guatemala'
            },
            postalCode: String,
            landmark: String
        },

        phone: {
            type: String,
            required: [true, 'El teléfono es requerido'],
            trim: true,
            validate: {
                validator: function(v) {
                    return /^[\d\s\-\(\)\+]+$/.test(v);
                },
                message: 'Formato de teléfono inválido'
            }
        },

        alternativePhones: {
            type: [String],
            default: []
        },

        email: {
            type: String,
            required: [true, 'El email es requerido'],
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
        },

        website: {
            type: String,
            trim: true
        },

        socialMedia: {
            facebook: String,
            instagram: String,
            twitter: String,
            tiktok: String
        },

        category: {
            type: String,
            required: true,
            enum: {
                values: [
                    'GOURMET', 
                    'CASUAL', 
                    'CAFETERIA', 
                    'FAST_FOOD', 
                    'BAR',
                    'PIZZERIA',
                    'ITALIANA',
                    'MEXICANA',
                    'ASIATICA',
                    'MARISCOS',
                    'PARRILLADA',
                    'VEGETARIANA',
                    'POSTRES',
                    'OTRO'
                ],
                message: 'Categoría no válida'
            }
        },

        subcategories: {
            type: [String],
            enum: [
                'DESAYUNOS',
                'ALMUERZOS',
                'CENAS',
                'BRUNCH',
                'BUFFET',
                'COMIDA_RAPIDA',
                'FINE_DINING',
                'FAMILIAR',
                'ROMANTICO',
                'NEGOCIOS'
            ],
            default: []
        },

        averagePrice: {
            type: Number,
            required: true,
            min: [0, 'El precio no puede ser negativo']
        },

        priceRange: {
            type: String,
            enum: ['$', '$$', '$$$', '$$$$'],
            default: '$$'
        },

        openingHours: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Formato de hora inválido (HH:MM)'
            }
        },

        closingHours: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Formato de hora inválido (HH:MM)'
            }
        },

        weeklySchedule: [{
            day: {
                type: String,
                enum: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']
            },
            openingTime: String,
            closingTime: String,
            isClosed: {
                type: Boolean,
                default: false
            }
        }],

        images: {
            type: String,
            default: null
        },

        images_public_id: {
            type: String,
            default: null
        },

        gallery: [{
            url: String,
            public_id: String,
            description: String,
            category: {
                type: String,
                enum: ['EXTERIOR', 'INTERIOR', 'COMIDA', 'AMBIENTE', 'OTRO']
            }
        }],

        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'],
            default: 'PENDING_APPROVAL'
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        ownerUserId: {
            type: String,
            required: true
        },
        ownerInfo: {
            name: { type: String },
            email: { type: String }
        },

        totalCapacity: {
            type: Number,
            min: 0,
            default: 0
        },

        features: {
            hasParking: {
                type: Boolean,
                default: false
            },
            hasWifi: {
                type: Boolean,
                default: false
            },
            hasDelivery: {
                type: Boolean,
                default: false
            },
            hasTakeout: {
                type: Boolean,
                default: true
            },
            acceptsReservations: {
                type: Boolean,
                default: true
            },
            isWheelchairAccessible: {
                type: Boolean,
                default: false
            },
            hasOutdoorSeating: {
                type: Boolean,
                default: false
            },
            allowsPets: {
                type: Boolean,
                default: false
            },
            hasLiveMusic: {
                type: Boolean,
                default: false
            },
            hasAirConditioning: {
                type: Boolean,
                default: false
            }
        },

        paymentMethods: {
            type: [String],
            enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'WALLET', 'CHEQUE'],
            default: ['EFECTIVO', 'TARJETA']
        },

        deliveryRadius: {
            type: Number,
            min: 0,
            default: 0
        },

        deliveryFee: {
            type: Number,
            min: 0,
            default: 0
        },

        minimumDeliveryOrder: {
            type: Number,
            min: 0,
            default: 0
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

        isFeatured: {
            type: Boolean,
            default: false
        },

        certifications: {
            type: [String],
            enum: [
                'CERTIFICADO_SALUD',
                'ORGANICO',
                'COMERCIO_JUSTO',
                'SOSTENIBLE',
                'HALAL',
                'KOSHER'
            ],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

restaurantSchema.index({ name: 1 });
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ owner: 1 });

restaurantSchema.index({ category: 1 });
restaurantSchema.index({ averageRating: -1 });
restaurantSchema.index({ isFeatured: 1 });
restaurantSchema.index({ 'features.hasDelivery': 1 });
restaurantSchema.index({ location: '2dsphere' });

restaurantSchema.index({ 
    name: 'text', 
    description: 'text', 
    category: 'text' 
});

restaurantSchema.virtual('isOpenNow').get(function () {
    if (!this.openingHours || !this.closingHours) {
        return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = this.openingHours.split(':').map(Number);
    const [closeH, closeM] = this.closingHours.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
});

restaurantSchema.virtual('averagePriceFormatted').get(function () {
    if (this.averagePrice === undefined || this.averagePrice === null) {
        return null;
    }
    return `Q${Number(this.averagePrice).toFixed(2)}`;
});

restaurantSchema.methods.distanceFrom = function(longitude, latitude) {
    const R = 6371;
    const dLat = this.toRad(latitude - this.location.coordinates[1]);
    const dLon = this.toRad(longitude - this.location.coordinates[0]);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(this.location.coordinates[1])) * 
              Math.cos(this.toRad(latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
};

restaurantSchema.methods.toRad = function(value) {
    return value * Math.PI / 180;
};

restaurantSchema.methods.canDeliverTo = function(longitude, latitude) {
    if (!this.features.hasDelivery || this.deliveryRadius === 0) {
        return false;
    }
    
    const distance = this.distanceFrom(longitude, latitude);
    return distance <= this.deliveryRadius;
};

restaurantSchema.statics.findNearby = async function(longitude, latitude, maxDistance = 10000) {
    return await this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance
            }
        },
        status: 'ACTIVE'
    });
};

restaurantSchema.methods.updateRating = async function(newRating) {
    const totalRating = (this.averageRating * this.reviewCount) + newRating;
    this.reviewCount += 1;
    this.averageRating = totalRating / this.reviewCount;
    await this.save();
    return this.averageRating;
};

restaurantSchema.set('toJSON', { virtuals: true });
restaurantSchema.set('toObject', { virtuals: true });

export default mongoose.model('Restaurant', restaurantSchema);