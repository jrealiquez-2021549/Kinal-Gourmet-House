'use strict';

import axios from 'axios';

const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3005';

/**
 * Valida el token llamando a AuthRestaurante.
 * Si es válido, pone req.user = { id, email, name, role } y continúa.
 */
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Usa: Authorization: Bearer <token>'
            });
        }

        const token = authHeader.replace('Bearer ', '').trim();

        // Llama a AuthRestaurante para verificar el token
        const response = await axios.get(`${AUTH_API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data?.user;

        if (!userData) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }

        // req.user queda disponible en todos los controllers
        req.user = {
            id:    userData.id,
            email: userData.email,
            name:  userData.name,
            role:  userData.role?.name || userData.Role?.name || userData.role
        };

        next();

    } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(503).json({
                success: false,
                message: 'AuthRestaurante no disponible. ¿Está corriendo en el puerto 3005?'
            });
        }
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: error.response.data?.error || 'Token inválido o expirado'
            });
        }
        console.error('Error en verifyToken:', error.message);
        return res.status(500).json({ success: false, message: 'Error al verificar autenticación' });
    }
};