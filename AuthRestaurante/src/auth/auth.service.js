import { User, Role } from '../models/index.js'
import { hashPassword, comparePassword } from '../../helpers/hash-password.js'
import { generateJWT } from '../../helpers/generate-jwt.js'
import { generateVerificationToken } from '../../helpers/generate-verification-token.js'
import { sendVerificationEmail } from '../../helpers/send-email.js'
import { Op } from 'sequelize'
import jwt from 'jsonwebtoken'
import { config } from '../../configs/config.js'


export const registerUser = async (data) => {
  const { name, email, password } = data

  // Validaciones de campos vacíos
  if (!name     || !name.trim())     throw new Error('El nombre es requerido')
  if (!email    || !email.trim())    throw new Error('El correo es requerido')
  if (!password || !password.trim()) throw new Error('La contraseña es requerida')

  // Validar longitud mínima antes de hashear
  if (password.trim().length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')

  // Verificar duplicados
  const emailExists = await User.findOne({ where: { email: email.trim() } })
  if (emailExists) throw new Error('El correo ya está registrado')

  const clientRole = await Role.findOne({ where: { name: 'CLIENTE' } })
  if (!clientRole) throw new Error('Rol CLIENTE no encontrado')

  const hashedPassword = await hashPassword(password.trim())

  const user = await User.create({
    name:     name.trim(),
    email:    email.trim(),
    password: hashedPassword,
    roleId:   clientRole.id,
    isActive: false
  })

  const verificationToken = generateVerificationToken(user)

  await sendVerificationEmail(user.email, verificationToken)

  const userWithoutPassword = user.toJSON()
  delete userWithoutPassword.password

  return {
    user: userWithoutPassword,
    verificationToken
  }
}

export const loginUser = async (identifier, password) => {
  // Validaciones de campos vacíos
  if (!identifier || !identifier.trim()) throw new Error('El correo o username es requerido')
  if (!password   || !password.trim())   throw new Error('La contraseña es requerida')

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier.trim() }
      ]
    },
    include: Role
  })

  if (!user) throw new Error('Credenciales inválidas')

  const validPassword = await comparePassword(password.trim(), user.password)
  if (!validPassword) throw new Error('Credenciales inválidas')

  if (!user.isActive) throw new Error('Cuenta no verificada. Revisa tu correo')

  const token = generateJWT(user)

  const userWithoutPassword = user.toJSON()
  delete userWithoutPassword.password

  return { token, user: userWithoutPassword }
}

export const verifyAccount = async (token) => {
  try {
    const { uid } = jwt.verify(token, config.jwt.secret)

    const user = await User.findByPk(uid)
    if (!user) throw new Error('Usuario no encontrado')

    if (user.isActive) {
      return { message: 'Cuenta ya verificada' }
    }

    user.isActive = true
    await user.save()

    return { message: 'Cuenta verificada correctamente' }

  } catch (error) {
    throw new Error('Token inválido o expirado')
  }
}