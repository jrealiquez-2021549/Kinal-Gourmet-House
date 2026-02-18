import jwt from 'jsonwebtoken'
import { config } from '../configs/config.js'

export const generateVerificationToken = (user) => {
  return jwt.sign(
    { uid: user.id },
    config.jwt.secret,
    { expiresIn: '1h' } // token corto
  )
}
