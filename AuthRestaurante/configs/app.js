// configs/app.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.js'
import authRoutes from '../src/auth/auth.routes.js'
import userRoutes from '../src/users/user.routes.js'

export const createApp = () => {
  const app = express()

  app.use(express.json())
  app.use(cors())

  // ✅ Helmet con CSP relajado para Swagger UI
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", "data:", "https://validator.swagger.io"],
      },
    },
  }))

  app.use(morgan('dev'))

  // ✅ Swagger antes de las rutas
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)

  return app
}