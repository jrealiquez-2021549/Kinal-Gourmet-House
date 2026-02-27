import { DataTypes } from 'sequelize'

export const initRoleModel = (sequelize) => {
  return sequelize.define('role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  })
}
