import { User, Role } from '../models/index.js'
import { hashPassword } from '../../helpers/hash-password.js'

export const seedAdminGeneral = async () => {
  const adminRole = await Role.findOne({
    where: { name: 'ADMIN_GENERAL' }
  })

  const exists = await User.findOne({
    where: { email: 'admin@system.com' }
  })

  if (!exists) {
    const hashedPassword = await hashPassword('Admin123!')

    await User.create({
      name: 'Super Admin',
      email: 'admin@system.com',
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true
    })

    console.log('ADMIN_GENERAL creado automáticamente')
  }
}
