'use strict';

import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, 'El ID del usuario es requerido']
        },
        userInfo: {
            name: { type: String },
            email: { type: String }
        },

        type: {
            type: String,
            required: [true, 'El tipo de notificación es requerido'],
            enum: {
                values: [
                    'RESERVATION_CONFIRMED',
                    'RESERVATION_CANCELLED',
                    'RESERVATION_REMINDER',
                    'ORDER_CONFIRMED',
                    'ORDER_READY',
                    'ORDER_ON_WAY',
                    'ORDER_DELIVERED',
                    'ORDER_CANCELLED',
                    'PROMOTION_AVAILABLE',
                    'EVENT_REMINDER',
                    'COUPON_EXPIRING',
                    'GENERAL'
                ],
                message: 'Tipo de notificación no válido'
            }
        },

        title: {
            type: String,
            required: [true, 'El título es requerido'],
            trim: true,
            maxLength: [100, 'El título no puede exceder 100 caracteres']
        },

        message: {
            type: String,
            required: [true, 'El mensaje es requerido'],
            trim: true,
            maxLength: [500, 'El mensaje no puede exceder 500 caracteres']
        },

        relatedResource: {
            resourceType: {
                type: String,
                enum: ['Order', 'Reservation', 'Event', 'Promotion', 'Coupon', null]
            },
            resourceId: {
                type: String,
                refPath: 'relatedResource.resourceType'
            }
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        },

        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM'
        },

        channel: {
            type: String,
            enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
            default: 'IN_APP'
        },

        sent: {
            type: Boolean,
            default: false
        },

        sentAt: {
            type: Date,
            default: null
        },

        expiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 });

notificationSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

notificationSchema.methods.markAsRead = async function() {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

notificationSchema.statics.createOrderNotification = async function(order, type) {
    const titles = {
        'ORDER_CONFIRMED': 'Pedido Confirmado',
        'ORDER_READY': 'Pedido Listo',
        'ORDER_ON_WAY': 'Pedido en Camino',
        'ORDER_DELIVERED': 'Pedido Entregado',
        'ORDER_CANCELLED': 'Pedido Cancelado'
    };

    const messages = {
        'ORDER_CONFIRMED': `Tu pedido #${order._id.toString().slice(-6)} ha sido confirmado.`,
        'ORDER_READY': `Tu pedido #${order._id.toString().slice(-6)} está listo.`,
        'ORDER_ON_WAY': `Tu pedido #${order._id.toString().slice(-6)} está en camino.`,
        'ORDER_DELIVERED': `Tu pedido #${order._id.toString().slice(-6)} ha sido entregado. ¡Buen provecho!`,
        'ORDER_CANCELLED': `Tu pedido #${order._id.toString().slice(-6)} ha sido cancelado.`
    };

    return await this.create({
        userId: order.userId,
        type: type,
        title: titles[type],
        message: messages[type],
        relatedResource: {
            resourceType: 'Order',
            resourceId: order._id
        },
        metadata: {
            orderId: order._id,
            orderStatus: order.status,
            totalPrice: order.totalPrice
        },
        priority: type === 'ORDER_READY' ? 'HIGH' : 'MEDIUM'
    });
};

notificationSchema.statics.createReservationNotification = async function(reservation, type) {
    const titles = {
        'RESERVATION_CONFIRMED': 'Reservación Confirmada',
        'RESERVATION_CANCELLED': 'Reservación Cancelada',
        'RESERVATION_REMINDER': 'Recordatorio de Reservación'
    };

    const Restaurant = mongoose.model('Restaurant');
    const restaurant = await Restaurant.findById(reservation.restaurant);

    const messages = {
        'RESERVATION_CONFIRMED': `Tu reservación en ${restaurant.name} ha sido confirmada.`,
        'RESERVATION_CANCELLED': `Tu reservación en ${restaurant.name} ha sido cancelada.`,
        'RESERVATION_REMINDER': `Recordatorio: Tienes una reservación hoy en ${restaurant.name}.`
    };

    return await this.create({
        userId: reservation.userId,
        type: type,
        title: titles[type],
        message: messages[type],
        relatedResource: {
            resourceType: 'Reservation',
            resourceId: reservation._id
        },
        metadata: {
            reservationId: reservation._id,
            restaurantName: restaurant.name,
            date: reservation.date,
            time: reservation.time
        },
        priority: type === 'RESERVATION_REMINDER' ? 'HIGH' : 'MEDIUM'
    });
};

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);