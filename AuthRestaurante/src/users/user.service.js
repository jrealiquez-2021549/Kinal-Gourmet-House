import { User, Role } from '../models/index.js'
import { hashPassword } from '../../helpers/hash-password.js'
import bcrypt from 'bcryptjs'

export const createAdminRestaurant = async (data) => {
  const { name, email, password } = data

  // Validar que los campos no estén vacíos o solo con espacios
  if (!name || !name.trim()) throw new Error('El nombre es requerido')
  if (!email || !email.trim()) throw new Error('El correo es requerido')
  if (!password || !password.trim()) throw new Error('La contraseña es requerida')

  // Validar longitud mínima de contraseña
  if (password.trim().length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')

  const exists = await User.findOne({ where: { email: email.trim() } })
  if (exists) throw new Error('Correo ya registrado')

  const role = await Role.findOne({
    where: { name: 'ADMIN_RESTAURANTE' }
  })

  if (!role) throw new Error('Rol ADMIN_RESTAURANTE no encontrado')

  const hashedPassword = await hashPassword(password.trim())

  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    password: hashedPassword,
    roleId: role.id,
    isActive: true
  })

  const userWithoutPassword = user.toJSON()
  delete userWithoutPassword.password

  return userWithoutPassword
}

export const changePassword = async (userId, currentPassword, newPassword) => {

  // Validar que los campos no estén vacíos o solo con espacios
  if (!currentPassword || !currentPassword.trim()) throw new Error('La contraseña actual es requerida')
  if (!newPassword || !newPassword.trim()) throw new Error('La nueva contraseña es requerida')

  // Validar longitud mínima de la nueva contraseña
  if (newPassword.trim().length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres')

  const user = await User.findByPk(userId)

  if (!user) throw new Error('Usuario no encontrado')

  const isMatch = await bcrypt.compare(currentPassword.trim(), user.password)

  if (!isMatch) throw new Error('Contraseña actual incorrecta')

  const newHashedPassword = await hashPassword(newPassword.trim())

  await user.update({ password: newHashedPassword })

  return { message: 'Contraseña actualizada correctamente' }
}