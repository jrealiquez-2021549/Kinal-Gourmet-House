import { createApp } from './configs/app.js'
import { dbConnection } from './configs/database.js'
import { config } from './configs/config.js'

// Importamos modelos y asociaciones
import './src/models/index.js'
import { seedRoles } from './src/seed/role.seed.js'
import { seedAdminGeneral } from './src/seed/admin.seed.js'

const app = createApp()

const startServer = async () => {
  await dbConnection
  await seedRoles()
  await seedAdminGeneral()

  app.listen(config.app?.port || process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${process.env.PORT}`)
  })
}

startServer()
