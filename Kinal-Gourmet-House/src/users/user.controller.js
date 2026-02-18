'use strict';

import UserCache from './user.model.js';
import mongoose from 'mongoose';
import { cloudinary } from '../../middlewares/files-uploaders.js';

/**
 * Sincronizar / registrar perfil extendido de un usuario
 * que ya existe en AuthRestaurante.
 * POST /users/sync
 * Solo ADMIN_GENERAL puede crear entradas manualmente.
 * Normalmente se crea automáticamente cuando el usuario opera
 * por primera vez (lazy sync).
 */
export const createUser = async (req, res) => {
    try {
        const { authId, name, email, role, phone } = req.body;

        if (!authId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: 'authId, name y email son requeridos'
            });
        }

        const userData = { authId, name, email, role: role || 'CLIENTE', phone };

        if (req.file) {
            userData.profileImage = req.file.path;
            userData.profileImage_public_id = req.file.filename;
        }

        const user = new UserCache(userData);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Perfil de usuario registrado',
            data: user
        });
    } catch (error) {
        if (req.file?.filename) {
            await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
        }
        res.status(400).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive, role } = req.query;
        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (role) filter.role = role;

        const users = await UserCache.find(filter)
            .select('-profileImage_public_id')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await UserCache.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Puede buscarse por MongoDB _id o por authId
        let user;
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await UserCache.findById(id).select('-profileImage_public_id');
        } else {
            user = await UserCache.findOne({ authId: id }).select('-profileImage_public_id');
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado en caché local' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuario', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Solo puede actualizarse su propio perfil o ADMIN_GENERAL actualiza cualquiera
        const isOwner = req.user.id === id;
        const isAdmin = req.user.role === 'ADMIN_GENERAL';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes editar tu propio perfil'
            });
        }

        // Campos que NO se pueden cambiar aquí (los maneja AuthRestaurante)
        const { authId, role, ...updateData } = req.body;

        if (req.file) {
            // Eliminar imagen anterior si existe
            const existing = await UserCache.findOne({ authId: id });
            if (existing?.profileImage_public_id) {
                await cloudinary.uploader.destroy(existing.profileImage_public_id).catch(() => {});
            }
            updateData.profileImage = req.file.path;
            updateData.profileImage_public_id = req.file.filename;
        }

        const user = await UserCache.findOneAndUpdate(
            { authId: id },
            updateData,
            { new: true, runValidators: true }
        ).select('-profileImage_public_id');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, message: 'Perfil actualizado', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar usuario', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserCache.findOne({ authId: id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Eliminar imagen de Cloudinary si existe
        if (user.profileImage_public_id) {
            await cloudinary.uploader.destroy(user.profileImage_public_id).catch(() => {});
        }

        await UserCache.findOneAndDelete({ authId: id });

        res.status(200).json({ success: true, message: 'Perfil de usuario eliminado del sistema local' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar usuario', error: error.message });
    }
};
