import { Router } from 'express'
import { register, login, verify } from './auth.controller.js'

import { validateJWT } from '../../middlewares/validate-jwt.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verify/:token', verify)

router.get('/profile', validateJWT, (req, res) => {
  res.json({
    message: 'Acceso permitido',
    user: req.user
  })
})

export default router
