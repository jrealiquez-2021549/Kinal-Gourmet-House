import jwt from 'jsonwebtoken'
import { config } from '../configs/config.js'
import { User, Role } from '../src/models/index.js'

export const validateJWT = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    const token = authHeader.replace('Bearer ', '')

    const { uid } = jwt.verify(token, config.jwt.secret)

    const user = await User.findByPk(uid, { include: Role })

    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido' })
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuario inactivo' })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

