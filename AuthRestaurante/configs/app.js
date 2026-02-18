import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRoutes from '../src/auth/auth.routes.js'
import userRoutes from '../src/users/user.routes.js'


export const createApp = () => {
    const app = express()

    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(morgan('dev'))

    app.use('/api/auth', authRoutes)
    app.use('/api/users', userRoutes)


    return app
}
