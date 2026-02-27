'use strict';

import Notification from './notification.model.js';
import mongoose from 'mongoose';

export const createNotification = async (req, res) => {
    try {
        const notificationData = req.body;
        const notification = new Notification(notificationData);
        await notification.save();

        res.status(201).json({
            success: true,
            message: 'Notificación creada exitosamente',
            data: notification
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la notificación',
            error: error.message
        });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            isRead, 
            type,
            priority 
        } = req.query;

        const filter = {};
        
        if (req.user.role === 'ADMIN_GENERAL') {
            if (req.query.user) filter.userId = req.query.user;
        } else if (req.user.role === 'ADMIN_RESTAURANTE') {
            filter.$or = [
                { userId: req.user.id },
                { restaurantId: req.user.restaurantId }
            ];
        } else {
            filter.userId = req.user.id;
        }

        if (isRead !== undefined) filter.isRead = isRead === 'true';
        if (type) filter.type = type;
        if (priority) filter.priority = priority;

        filter.$or = [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ];

        const notifications = await Notification.find(filter)
            
            .populate('relatedResource.resourceId')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ 
            ...filter, 
            isRead: false 
        });

        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            },
            unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las notificaciones',
            error: error.message
        });
    }
};

export const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const notification = await Notification.findById(id)
            
            .populate('relatedResource.resourceId');
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada",
            });
        }

        if (req.user.role !== 'ADMIN_GENERAL' && 
            notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para ver esta notificación"
            });
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la notificación",
            error: error.message,
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada",
            });
        }

        if (req.user.role !== 'ADMIN_GENERAL' && 
            notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para modificar esta notificación"
            });
        }

        await notification.markAsRead();

        res.status(200).json({
            success: true,
            message: "Notificación marcada como leída",
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al marcar notificación como leída",
            error: error.message,
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { user: userId, isRead: false },
            { 
                $set: { 
                    isRead: true, 
                    readAt: new Date() 
                } 
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notificaciones marcadas como leídas`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al marcar notificaciones como leídas",
            error: error.message,
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
            });
        }

        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada",
            });
        }
        
        if (req.user.role !== 'ADMIN_GENERAL' && 
            notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para eliminar esta notificación"
            });
        }

        await Notification.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Notificación eliminada exitosamente",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar notificación",
            error: error.message,
        });
    }
};

export const deleteAllRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.deleteMany({
            user: userId,
            isRead: true
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} notificaciones leídas eliminadas`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar notificaciones",
            error: error.message,
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Notification.countDocuments({
            user: userId,
            isRead: false,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener contador de no leídas",
            error: error.message,
        });
    }
};