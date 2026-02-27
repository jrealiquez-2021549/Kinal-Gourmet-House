import { User, Role } from '../models/index.js'
import { createAdminRestaurant } from './user.service.js'
import { changePassword } from './user.service.js'

export const createAdminRest = async (req, res) => {
  const { name, email, password, restaurantId } = req.body

  try {
    const user = await createAdminRestaurant(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const response = await changePassword(
      req.user.id,
      currentPassword,
      newPassword
    )

    res.json(response)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const assignRestaurant = async (req, res) => {
    try {
        const { id } = req.params
        const { restaurantId } = req.body

        const user = await User.findByPk(id)
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

        await user.update({ restaurantId })

        const updated = user.toJSON()
        delete updated.password

        res.json({ message: 'Restaurante asignado correctamente', user: updated })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}