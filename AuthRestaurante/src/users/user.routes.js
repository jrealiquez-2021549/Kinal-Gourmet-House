import { Router } from 'express'
import { createAdminRest } from './user.controller.js'
import { validateJWT } from '../../middlewares/validate-jwt.js'
import { validateRole } from '../../middlewares/validate-role.js'
import { updateMyPassword } from './user.controller.js'

const router = Router()

router.post(
  '/create-admin-restaurant',
  validateJWT,
  validateRole('ADMIN_GENERAL'),
  createAdminRest
)

router.patch(
  '/change-password',
  validateJWT,
  validateRole('ADMIN_RESTAURANTE', 'ADMIN_GENERAL', 'CLIENTE'),
  updateMyPassword
)

export default router
