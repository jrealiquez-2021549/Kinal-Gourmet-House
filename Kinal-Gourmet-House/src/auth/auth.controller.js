'use strict';

import axios from 'axios';

const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3005';

const authError = (res, error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            message: 'AuthRestaurante no disponible. ¿Está corriendo en el puerto 3005?'
        });
    }
    const status = error.response?.status || 500;
    const msg    = error.response?.data?.message || error.response?.data?.error || 'Error de autenticación';
    return res.status(status).json({ success: false, message: msg });
};

export const login = async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/api/auth/login`, req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        return authError(res, error);
    }
};

export const register = async (req, res) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/api/auth/register`, req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        return authError(res, error);
    }
};

export const profile = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: req.user
    });
};