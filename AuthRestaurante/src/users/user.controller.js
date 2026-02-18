import { createAdminRestaurant } from './user.service.js'
import { changePassword } from './user.service.js'

export const createAdminRest = async (req, res) => {
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
