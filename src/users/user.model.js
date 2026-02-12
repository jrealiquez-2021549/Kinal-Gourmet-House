'use strict';

import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
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
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
            minLength: [6, 'La contraseña debe tener al menos 6 caracteres']
        },
        role: {
            type: String,
            required: [true, 'El rol es requerido'],
            enum: {
                values: ['CLIENT', 'REST_ADMIN', 'PLATFORM_ADMIN'],
                message: 'Rol no válido'
            },
            default: 'CLIENT'
        },
        phone: {
            type: String,
            required: [true, 'El teléfono es requerido'],
            trim: true
        },
        profileImage: {
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

userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);