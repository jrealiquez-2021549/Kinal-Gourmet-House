================================================================================
KINAL GOURMET HOUSE - SISTEMA DE GESTION DE RESTAURANTES
================================================================================

Este sistema esta compuesto por dos APIs que trabajan juntas:

  - AuthRestaurante  : Maneja autenticacion, roles y tokens JWT
                       Tecnologia: Node.js + PostgreSQL
                       Puerto: 3005

  - Kinal-Gourmet-House : Maneja restaurantes, pedidos, reservaciones y mas
                          Tecnologia: Node.js + MongoDB
                          Puerto: 3006

--------------------------------------------------------------------------------
REQUISITOS PREVIOS
--------------------------------------------------------------------------------

Antes de comenzar, asegurate de tener instalado lo siguiente:

  - Node.js v18 o superior       https://nodejs.org/
  - pnpm (gestor de paquetes)    https://pnpm.io/
  - Docker Desktop               https://www.docker.com/products/docker-desktop/
  - MongoDB corriendo localmente en el puerto 27017
  - pgAdmin 4 (opcional)         https://www.pgadmin.org/download/
  - Postman para probar endpoints https://www.postman.com/downloads/

--------------------------------------------------------------------------------
ESTRUCTURA DEL PROYECTO
--------------------------------------------------------------------------------

  Kinal-Gourmet-House/
  |
  |-- AuthRestaurante/         API de autenticacion (Puerto 3005)
  |
  |-- Kinal-Gourmet-House/     API principal del sistema (Puerto 3006)

--------------------------------------------------------------------------------
PARTE 1 - CONFIGURAR Y CORRER AuthRestaurante
--------------------------------------------------------------------------------

PASO 1 - Abrir Docker Desktop
  Abre Docker Desktop y asegurate de que este corriendo antes de continuar.

PASO 2 - Levantar PostgreSQL con Docker
  Abre una terminal y ejecuta el siguiente comando. Esto crea el contenedor
  de PostgreSQL con la base de datos y credenciales que necesita el proyecto:

    docker run -d --name kinal-gourmet-postgres -e POSTGRES_DB=KGourmetAuth -e POSTGRES_USER=root -e POSTGRES_PASSWORD=admin -p 5438:5432 postgres:16

  IMPORTANTE: Este comando solo se ejecuta la primera vez. Si el contenedor
  ya existe y esta apagado, usa este comando en su lugar:

    docker start kinal-gourmet-postgres

  Verifica en Docker Desktop que el contenedor "kinal-gourmet-postgres"
  aparezca con estado "Running".

PASO 3 - (Opcional) Conectar pgAdmin 4
  Si deseas visualizar la base de datos en pgAdmin, conéctate con estos datos:

    Host     : localhost
    Port     : 5438
    Database : KGourmetAuth
    Username : root
    Password : admin

  NOTA: Las tablas se crean automáticamente cuando corres la API por primera
  vez. No necesitas crearlas manualmente.

PASO 4 - Instalar dependencias
  Abre una terminal en la carpeta AuthRestaurante y ejecuta:

    cd AuthRestaurante
    pnpm install

PASO 5 - Verificar el archivo .env
  Confirma que el archivo .env dentro de AuthRestaurante tenga este contenido:

    # Server
    NODE_ENV=development
    PORT=3005

    # Database PostgreSQL
    DB_HOST=localhost
    DB_PORT=5438
    DB_NAME=KGourmetAuth
    DB_USERNAME=root
    DB_PASSWORD=admin
    DB_SQL_LOGGING=false

    # JWT Configuration
    JWT_SECRET=JWTSECRETOnoEmail!
    JWT_EXPIRES_IN=30m

    EMAIL_USER=quuuiiinntooo@gmail.com
    EMAIL_PASS=eldq idpb vivv ycel   

    JWT_REFRESH_EXPIRES_IN=7d
    JWT_ISSUER=AuthService
    JWT_AUDIENCE=AuthService

    # Frontend URL
    FRONTEND_URL=http://localhost:5173

    # Security
    ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
    ADMIN_ALLOWED_ORIGINS=http://localhost:5173

PASO 6 - Iniciar AuthRestaurante
  En la misma terminal ejecuta:

    pnpm run dev

  Si todo esta correcto veras esto en la terminal:

    PostgreSQL | Trying to connect...
    PostgreSQL | Connected to PostgreSQL
    PostgreSQL | Models synchronized with database
    Servidor corriendo en el puerto: 3005

--------------------------------------------------------------------------------
PARTE 2 - CONFIGURAR Y CORRER Kinal-Gourmet-House
--------------------------------------------------------------------------------

PASO 1 - Asegurate de que MongoDB este corriendo
  MongoDB debe estar activo en localhost:27017. Si lo instalaste como servicio
  en Windows, normalmente ya corre automaticamente. Puedes verificarlo con:

    mongosh

PASO 2 - Instalar dependencias
  Abre una SEGUNDA terminal en la carpeta Kinal-Gourmet-House y ejecuta:

    cd Kinal-Gourmet-House
    pnpm install
    pnpm install nodemon
    pnpm install mongoose

PASO 3 - Verificar el archivo .env
  Confirma que el archivo .env dentro de Kinal-Gourmet-House tenga esto:

    NODE_ENV = development
    PORT = 3006

    URI_MONGO = mongodb://localhost:27017/kinalgourmethouse

    JWT_SECRET = ClaveSuperSecretadeKinalGourmetparaJWT
    JWT_ISSUER = AuthService
    JWT_AUDIENCE = AuthService

    AUTH_API_URL = http://localhost:3005

    CLOUDINARY_CLOUD_NAME = dmukpwpu2
    CLOUDINARY_API_KEY = 859931433891872
    CLOUDINARY_API_SECRET = sD_eVYjgsWRA6czGwMxBk-3ekVo

  IMPORTANTE: La variable AUTH_API_URL es fundamental. Le indica a
  Kinal-Gourmet-House donde encontrar AuthRestaurante para validar los tokens.

PASO 4 - Iniciar Kinal-Gourmet-House
  En la segunda terminal ejecuta:

    pnpm run dev

  Si todo esta correcto veras esto en la terminal:

    Starting KinalGourmetHouse Admin Server...
    MongoDB | intentando conectar a mongoDB
    MongoDB | conectado a mongoDB
    MongoDB | conectado a la base de datos kinalGourmetHouse
    Kinal Gourmet House Server running on port 3006
    Health check: http://localhost:3006/kinalGourmetHouse/v1/health

--------------------------------------------------------------------------------
ORDEN DE INICIO (respeta siempre este orden)
--------------------------------------------------------------------------------

  1. Docker Desktop         Iniciar primero
  2. AuthRestaurante        pnpm run dev  (Terminal 1)
  3. Kinal-Gourmet-House    pnpm run dev  (Terminal 2)

--------------------------------------------------------------------------------
ROLES DEL SISTEMA
--------------------------------------------------------------------------------

  ADMIN_GENERAL
    - Administra toda la plataforma
    - Se crea automáticamente al iniciar AuthRestaurante
    - Email   : admin@system.com
    - Password: Admin123!

  ADMIN_RESTAURANTE
    - Administra un restaurante especifico
    - Solo el ADMIN_GENERAL puede crearlo

  CLIENTE
    - Usuario final del sistema
    - Se registra libremente desde el endpoint /register

--------------------------------------------------------------------------------
LINK DE POSTMAN
--------------------------------------------------------------------------------
https://www.postman.com/jrealiquez-2021549-6909089/workspace/ahorcado/collection/48329923-14232fd2-5e93-4592-b4be-386c566ed2a1?action=share&creator=48329923

--------------------------------------------------------------------------------
PROBAR LOS ENDPOINTS EN POSTMAN - FLUJO CORRECTO
--------------------------------------------------------------------------------

Como usar el token en Postman:
  En cada request protegida, ve a la pestana "Authorization",
  selecciona tipo "Bearer Token" y pega el token del rol correspondiente.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

PASO 1 - Login como ADMIN_GENERAL

  Metodo : POST
  URL    : http://localhost:3005/api/auth/login
  Body   : raw / JSON

  {
    "email": "admin@system.com",
    "password": "Admin123!"
  }

  Copia el "token" de la respuesta. Lo necesitas en el siguiente paso.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

PASO 2 - Crear un ADMIN_RESTAURANTE

  Metodo        : POST
  URL           : http://localhost:3005/api/users/create-admin-restaurant
  Authorization : Bearer Token -> pega el token del ADMIN_GENERAL
  Body          : raw / JSON

  {
    "name": "Carlos Admin",
    "email": "carlos@restaurante.com",
    "password": "Admin123!"
  }

  Este usuario queda activo de inmediato, sin necesidad de verificar email.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

PASO 3 - Registrar un CLIENTE

  Metodo : POST
  URL    : http://localhost:3005/api/auth/register
  Body   : raw / JSON

  {
    "name": "Ana Cliente",
    "email": "ana@gmail.com",
    "password": "Cliente123!"
  }

  El cliente nace con la cuenta inactiva. Copia el "verificationToken"
  que viene en la respuesta, lo necesitas en el siguiente paso.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

PASO 4 - Verificar la cuenta del CLIENTE

  Metodo : GET
  URL    : http://localhost:3005/api/auth/verify/<verificationToken>

  Reemplaza <verificationToken> con el token que copiaste en el paso anterior.
  No lleva body ni authorization. Solo pegalo en la URL.

  Respuesta esperada: { "message": "Cuenta verificada correctamente" }

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

PASO 5 - Login como ADMIN_RESTAURANTE

  Metodo : POST
  URL    : http://localhost:3005/api/auth/login
  Body   : raw / JSON

  {
    "email": "carlos@restaurante.com",
    "password": "Admin123!"
  }

  Guarda el token de la respuesta.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

PASO 6 - Login como CLIENTE

  Metodo : POST
  URL    : http://localhost:3005/api/auth/login
  Body   : raw / JSON

  {
    "email": "ana@gmail.com",
    "password": "Cliente123!"
  }

  Guarda el token de la respuesta.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Con los 3 tokens guardados ya puedes operar en Kinal-Gourmet-House (puerto 3006).

--------------------------------------------------------------------------------
ENDPOINTS DE AuthRestaurante (Puerto 3005)
--------------------------------------------------------------------------------

  POST   /api/auth/register                     Publico           Registrar cliente
  POST   /api/auth/login                        Publico           Iniciar sesion
  GET    /api/auth/verify/:token                Publico           Verificar cuenta
  GET    /api/auth/profile                      Token requerido   Ver perfil
  POST   /api/users/create-admin-restaurant     ADMIN_GENERAL     Crear admin restaurante
  PATCH  /api/users/change-password             Token requerido   Cambiar contrasena

--------------------------------------------------------------------------------
ENDPOINTS DE Kinal-Gourmet-House (Puerto 3006)
--------------------------------------------------------------------------------

  Base URL: http://localhost:3006/kinalGourmetHouse/v1

  /auth              Proxy hacia AuthRestaurante (login y register)
  /restaurants       ADMIN_GENERAL crea, ADMIN_RESTAURANTE actualiza
  /tables            ADMIN_RESTAURANTE gestiona
  /dishes            ADMIN_RESTAURANTE gestiona
  /reservations      CLIENTE crea, ADMIN_RESTAURANTE gestiona
  /orders            CLIENTE crea, ADMIN_RESTAURANTE actualiza estado
  /reviews           CLIENTE crea y gestiona las suyas
  /promotions        ADMIN_RESTAURANTE gestiona
  /events            ADMIN_RESTAURANTE gestiona
  /invoices          ADMIN_RESTAURANTE crea, CLIENTE consulta las suyas
  /coupons           ADMIN_RESTAURANTE crea, CLIENTE usa
  /notifications     Todos los roles
  /reports           ADMIN_RESTAURANTE y ADMIN_GENERAL
  /users             ADMIN_GENERAL

--------------------------------------------------------------------------------
PERMISOS POR ROL
--------------------------------------------------------------------------------

  Accion                                          CLIENTE   ADMIN_REST   ADMIN_GEN
  Ver restaurantes, mesas y platillos               SI         SI           SI
  Crear reservacion y pedido                        SI         SI           SI
  Ver y cancelar sus propias reservaciones          SI         --           --
  Crear mesas, platillos, eventos, promociones      NO         SI           SI
  Cambiar estado de pedidos                         NO         SI           SI
  Generar facturas                                  NO         SI           SI
  Ver reportes del restaurante                      NO         SI           SI
  Crear restaurantes                                NO         NO           SI
  Crear ADMIN_RESTAURANTE                           NO         NO           SI
  Eliminar cualquier recurso                        NO         NO           SI

--------------------------------------------------------------------------------
ERRORES COMUNES Y SOLUCIONES
--------------------------------------------------------------------------------

  Error: ConnectionRefusedError en AuthRestaurante
  Causa: PostgreSQL no esta corriendo
  Solucion: Verifica que Docker Desktop este activo y el contenedor corriendo

  Error: ECONNREFUSED al iniciar Kinal-Gourmet-House
  Causa: MongoDB no esta corriendo
  Solucion: Inicia MongoDB y vuelve a correr la API

  Error: 503 AuthRestaurante no disponible
  Causa: Kinal no puede conectarse al puerto 3005
  Solucion: Asegurate de haber iniciado AuthRestaurante primero y que
            AUTH_API_URL=http://localhost:3005 este en el .env

  Error: 401 Token invalido o expirado
  Causa: El JWT vence a los 30 minutos
  Solucion: Vuelve a hacer login y usa el nuevo token

  Error: relation "role" does not exist
  Causa: Sequelize no sincronizo las tablas
  Solucion: Verifica que en index.js de AuthRestaurante el llamado sea
            "await dbConnection()" con parentesis, no "await dbConnection"

  Error: Usuario no aprobado al hacer login
  Causa: El cliente no verifico su cuenta
  Solucion: Ejecuta GET /api/auth/verify/:token con el token del registro

================================================================================
FIN DEL DOCUMENTO
================================================================================