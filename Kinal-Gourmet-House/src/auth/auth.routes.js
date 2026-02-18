import { Router } from 'express';
import { login, register, profile } from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth-integration.middleware.js';

const router = Router();

/**
 * @route  POST /kinalGourmetHouse/v1/auth/register
 * @desc   Registro de nuevos clientes
 * @access Público
 */
router.post('/register', register);

/**
 * @route  POST /kinalGourmetHouse/v1/auth/login
 * @desc   Login → devuelve token JWT
 * @access Público
 */
router.post('/login', login);

/**
 * @route  GET /kinalGourmetHouse/v1/auth/profile
 * @desc   Ver perfil del usuario autenticado
 * @access Requiere token
 */
router.get('/profile', verifyToken, profile);

export default router;
