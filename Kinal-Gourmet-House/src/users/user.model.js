'use strict';

/**
 * UserCache — modelo de MongoDB para Kinal-Gourmet-House
 *
 * NO almacena contraseñas ni genera tokens.
 * Sirve como referencia local de usuarios cuya autenticación
 * vive en AuthRestaurante (PostgreSQL, puerto 3005).
 *
 * Se usa para guardar datos de perfil extra como foto de perfil
 * o preferencias que no existen en AuthRestaurante.
 */

import mongoose from 'mongoose';

const userCacheSchema = mongoose.Schema(
    {
        // authId: el UUID que asigna AuthRestaurante al usuario
        authId: {
            type: String,
            required: [true, 'El ID de AuthRestaurante es requerido'],
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        email: {
            type: String,
            required: [true, 'El email es requerido'],
            unique: true,
            trim: true,
            lowercase: true
        },
        role: {
            type: String,
            enum: ['CLIENTE', 'ADMIN_RESTAURANTE', 'ADMIN_GENERAL'],
            default: 'CLIENTE'
        },
        phone: {
            type: String,
            trim: true
        },
        profileImage: {
            type: String,
            default: null
        },
        profileImage_public_id: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

userCacheSchema.index({ isActive: 1 });
userCacheSchema.index({ role: 1 });

export default mongoose.model('UserCache', userCacheSchema);
