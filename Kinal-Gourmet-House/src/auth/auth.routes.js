import { Router } from 'express';
import { login, register, profile } from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth-integration.middleware.js';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', verifyToken, profile);

export default router;
