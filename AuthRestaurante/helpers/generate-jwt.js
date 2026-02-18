import jwt from 'jsonwebtoken'
import { config } from '../configs/config.js'

export const generateJWT = (user) => {
  return jwt.sign(
    {
      uid: user.id,
      role: user.roleId
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  )
}
