import { User, Role } from '../models/index.js'
import { hashPassword, comparePassword } from '../../helpers/hash-password.js'
import { generateJWT } from '../../helpers/generate-jwt.js'
import { generateVerificationToken } from '../../helpers/generate-verification-token.js'
import { sendVerificationEmail } from '../../helpers/send-email.js'

import jwt from 'jsonwebtoken'
import { config } from '../../configs/config.js'


export const registerUser = async (data) => {
  const { name, email, password } = data

  const exists = await User.findOne({ where: { email } })
  if (exists) throw new Error('El correo ya está registrado')

  const clientRole = await Role.findOne({
    where: { name: 'CLIENTE' }
  })

  const hashedPassword = await hashPassword(password)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    roleId: clientRole.id,
    isActive: false
  })

 const verificationToken = generateVerificationToken(user)

 //Enviar el correo
 await sendVerificationEmail(user.email, verificationToken)
 

  const userWithoutPassword = user.toJSON()
  delete userWithoutPassword.password

  return {
    user: userWithoutPassword,
    verificationToken // simulamos envío por correo
  }
}

export const loginUser = async (email, password) => {
  const user = await User.findOne({
    where: { email },
    include: Role
  })

  if (!user) throw new Error('Credenciales inválidas')

  const validPassword = await comparePassword(password, user.password)
  if (!validPassword) throw new Error('Credenciales inválidas')

  if (!user.isActive) throw new Error('Usuario no aprobado')

  const token = generateJWT(user)

  return {
    token,
    user
  }
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
