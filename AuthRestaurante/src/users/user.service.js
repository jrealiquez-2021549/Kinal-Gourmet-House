import { User, Role } from '../models/index.js'
import { hashPassword } from '../../helpers/hash-password.js'
import bcrypt from 'bcryptjs'

export const createAdminRestaurant = async (data) => {
  const { name, email, password } = data

  const exists = await User.findOne({ where: { email } })
  if (exists) throw new Error('Correo ya registrado')

  const role = await Role.findOne({
    where: { name: 'ADMIN_RESTAURANTE' }
  })

  const hashedPassword = await hashPassword(password)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    roleId: role.id,
    isActive: true
  })

  const userWithoutPassword = user.toJSON()
  delete userWithoutPassword.password

  return userWithoutPassword
}

export const changePassword = async (userId, currentPassword, newPassword) => {

  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password)

  if (!isMatch) {
    throw new Error('Contraseña actual incorrecta')
  }

  const newHashedPassword = await hashPassword(newPassword)

  await user.update({ password: newHashedPassword })

  return { message: 'Contraseña actualizada correctamente' }
}
