import { DataTypes } from 'sequelize'

export const initUserModel = (sequelize) => {
  return sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'El nombre es requerido' },
        notEmpty: { msg: 'El nombre no puede estar vacío' }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'El email es requerido' },
        notEmpty: { msg: 'El email no puede estar vacío' },
        isEmail: { msg: 'El email no tiene un formato válido' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'La contraseña es requerida' },
        notEmpty: { msg: 'La contraseña no puede estar vacía' },
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    },
    restaurantId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  })
}