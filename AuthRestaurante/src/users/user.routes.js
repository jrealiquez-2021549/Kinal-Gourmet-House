import { Router } from 'express'
import { createAdminRest, updateMyPassword, assignRestaurant } from './user.controller.js'
import { validateJWT } from '../../middlewares/validate-jwt.js'
import { validateRole } from '../../middlewares/validate-role.js'

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

router.patch(
  '/:id/assign-restaurant',
  validateJWT,
  validateRole('ADMIN_GENERAL'),
  assignRestaurant
)

export default router