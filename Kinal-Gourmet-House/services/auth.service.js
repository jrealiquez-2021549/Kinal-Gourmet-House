import axios from 'axios';

const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3005';

export const getUserById = async (userId, token) => {
    try {
        const response = await axios.get(`${AUTH_API_URL}/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo usuario:', error.message);
        return null;
    }
};

export const getUsersByRole = async (role, token) => {
    try {
        const response = await axios.get(`${AUTH_API_URL}/api/users?role=${role}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo usuarios:', error.message);
        return null;
    }
};