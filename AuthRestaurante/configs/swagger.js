import swaggerJSDoc from 'swagger-jsdoc'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kinal Gourmet House API',
      version: '1.0.0',
      description: 'API de autenticación',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'Juan Pérez' },
            email:    { type: 'string', format: 'email', example: 'juan@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'juan@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id:        { type: 'integer', example: 1 },
            name:      { type: 'string', example: 'Juan Pérez' },
            email:     { type: 'string', example: 'juan@example.com' },
            isActive:  { type: 'boolean', example: false },
            roleId:    { type: 'integer', example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'El correo ya está registrado' },
          },
        },
      },
    },
  },
  apis: [
    join(__dirname, '../src/auth/auth.routes.js'),
    join(__dirname, '../src/users/user.routes.js'),
    // agrega aquí cualquier otro archivo de rutas
  ],
}

export const swaggerSpec = swaggerJSDoc(options)