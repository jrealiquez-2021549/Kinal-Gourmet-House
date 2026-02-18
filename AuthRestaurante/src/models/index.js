import { sequelize } from '../../configs/database.js'
import { initRoleModel } from '../roles/role.model.js'
import { initUserModel } from '../users/user.model.js'

// Inicializamos modelos
const Role = initRoleModel(sequelize)
const User = initUserModel(sequelize)

// Configuramos asociaciones
Role.hasMany(User, { foreignKey: 'roleId' })
User.belongsTo(Role, { foreignKey: 'roleId' })

export { sequelize, Role, User }
