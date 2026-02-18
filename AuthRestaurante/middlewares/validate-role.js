export const validateRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        error: 'Se intenta verificar rol sin validar JWT primero'
      })
    }

    const userRole = req.user.role.name

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Rol ${userRole} no autorizado`
      })
    }

    next()
  }
}
