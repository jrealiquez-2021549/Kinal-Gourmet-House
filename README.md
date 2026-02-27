# INSTRUCCIONES GENERALES
1er paso - Crear una carpeta en el disco local C: (De preferencia llamarla Kinal-Gourmet-House)
2do paso - Abrir la terminar y situarse dentro de la carpeta anteriormente creada
3er paso - Realizar git 
4to paso - Clonar el repositorio dentro de la carpeta ya antes mencionada por medio del siguiente comando: git clone https://github.com/jrealiquez-2021549/Kinal-Gourmet-House.git

5to paso - Ingresar a la carpeta clonada por medio del siguiente comando: cd Kinal-Gourmet-House
6to paso - Realizar "code . " dentro de la terminar para abrir el proyecto en Visual Studio Code
7mo paso - Dentro e VS abrir 2 terminales distintas
	Terminal 1 - Para la autenticacion 
	Terminal 2 - Para probar el sistema del restaurante

8vo paso - Para probar los endpoints se recomienda ir a PostMan e importar las peticiones por medio de import -- IMPORTAR EL ARCHIVO LLAMADO Kinal-Gourmet-House.postman_collection ubicado en la carpeta ArchivoJSONpostMan


# INTRUCCIONES AUTENTICACION DE USUARIO
1er paso - Ubicarse dentro de la terminal 1 y situarse en la carpeta AuthRestaurante por medio del siguiente comando : cd AuthRestaurante
2do paso - Estando ahi, realizar el comando: pnpm install nodemon

ANTES DE CONTINUAR, IMPORTANTE: ES IMPORTANTE QUE TENGA ABIERTO docker desktop y asi mismo, pgAdmin

3er paso - en la terminal 1, ingresar el siguiente comando: docker run -d --name restaurante-postgres -e POSTGRES_DB=KGourmetAuth -e POSTGRES_USER=root -e POSTGRES_PASSWORD=admin -p 5436:5432 postgres:16
4to paso - Verificar en docker-desktop que el contenedor se haya inicializado correctamente y este activo
5to paso - Ejecutar en la terminal 1 el siguiente comando : pnpm add -D cross-env
7mo paso - Ejecutar en la terminal 1 el siguiente comando : docker compose up -d
8vo paso - Realizar el siguiente comando para correr el programa: pnpm run dev

Forma de probar las peticiones:
1. Probar la carpeta llamada (FuncionesUsuario - Registrar)
	1.1 Registrate (reemplaza el correo, nombre y contraseña por una original)
	1.2 En Verificar tu cuenta ingresa el token que se mando a tu correo únicamente lo que sigue luego del verify/ DENTRO DE LA URL
	1.3 Inicia sesión y copia tu token
	1.4 Si deseas cambiar tu contraseña, PARA PROBAR LA PETICION, ve a Authorization, elige la opción de BEARER TOKEN e  ingresa el token que se te dio al iniciar sesión e ingresa tu contraseña actual y contraseña nueva

2. Probar la carpeta llamada (FuncionesAdmin - Login)
  1.1 Inicia sesion con las credenciales del admin general (CREADO AUTOMATICAMENTE)
  1.2 Para crear un Admin de restaurante debes haber hecho primero el paso 1.1 ya que para crear el Admin de restaurante, aparte los datos, se te pedira el token que se genero al iniciar sesion, esto confimara que eres el ADMIN GENERAL
  1.3 Para obtener el token de un Admin de restaurante, el admin general tuvo que haber creado primeramente el usuario, con la cuenta creada puedes hacer login en el admin de restaurante, para probar las consultas del mismo en furutas ocasiones, copia el token generado al iniciar sesion.

3. Probar la carpeta llamada (CambiarContrasena - Cualquier rol)
  1.1 Para poder cambiar tu contraseña unicamente debes antes de ingresar tu contrasena pasada y la nueva, debes poner tu token generado al iniciar sesion en la parte de Authorization y escoge BEARER TOKEN e ingresalo.


# Api Kinal-Gourmet-House

/ Para probar el Kinal-Gourmet-House se debe de estar en la ruta:
  C:\Kinal-Gourmet-House\Kinal-Gourmet-House\Kinal-Gourmet-House

/ **Instalar en la terminal pnpm con:** pnpm install nodemon

/ **Instalar la dependencia en la terminar de axios con: :** pnpm add axios

/ **En la terminar iniciar la API:** pnpm run dev

/ La API Kinal-Gourmet-House utiliza autenticación mediante JWT (JSON Web Token).

 **IMPORTANTE: Cada peticion debe llevar su BEARER TOKEN correspondiente, segun sea la peticion debe ser, token de ADMIN_GENERAL, ADMIN_RESTAURANTE o CLIENTE **

Forma de probar las peticiones:

🔴 FUNCIONES ADMIN_GENERAL
El ADMIN_GENERAL tiene la función de crear restaurantes.

Forma de probar:
Probar la carpeta llamada (Restaurantes - Crear Restaurante)
1.1 Inicia sesión como ADMIN_GENERAL
1.2 Copia el token generado al iniciar sesión
1.3 Ve a la petición de crear restaurante (POST)
1.4 En Authorization selecciona BEARER TOKEN
1.5 Ingresa el token del ADMIN_GENERAL
1.6 Ingresa los datos requeridos del restaurante y envía la petición

⚠ IMPORTANTE:
Si no ingresas el token del ADMIN_GENERAL la petición no será autorizada.

🟡 FUNCIONES ADMIN_RESTAURANTE
El ADMIN_RESTAURANTE puede:
- Agregar mesa
- Agregar platillo
- Crear cupón
- Crear factura

⚠ IMPORTANTE:
Todas estas funciones requieren el token del ADMIN_RESTAURANTE.

1. Agregar Mesa
Inicia sesión como ADMIN_RESTAURANTE
Copia el token generado
Ve a la petición (POST - Crear Mesa)
En Authorization selecciona BEARER TOKEN
Ingresa el token del ADMIN_RESTAURANTE
Envía la petición con los datos correspondientes

2. Agregar Platillo
Inicia sesión como ADMIN_RESTAURANTE
Copia el token generado
Ve a la petición (POST - Crear Platillo)
En Authorization selecciona BEARER TOKEN
Ingresa el token del ADMIN_RESTAURANTE
Envía la petición

3. Crear Cupón
Inicia sesión como ADMIN_RESTAURANTE
Copia el token generado
Ve a la petición (POST - Crear Cupón)
En Authorization selecciona BEARER TOKEN
Ingresa el token del ADMIN_RESTAURANTE
Envía la petición con los datos del cupón

4. Crear Factura
Inicia sesión como ADMIN_RESTAURANTE
Copia el token generado
Ve a la petición (POST - Crear Factura)
En Authorization selecciona BEARER TOKEN
Ingresa el token del ADMIN_RESTAURANTE
Envía la petición

🟢 FUNCIONES USUARIO
El USUARIO puede:
- Hacer reseña
- Listar platillos (ver menú)
- Crear pedido / orden
- Iniciar sesión

⚠ Todas las funciones (excepto registro y login) requieren BEARER TOKEN del CLIENTE.

1. Hacer Reseña
Inicia sesión como CLIENTE
Copia el token generado
Ve a la petición (POST - Crear Reseña)
En Authorization selecciona BEARER TOKEN
Ingresa el token del CLIENTE
Envía la petición

2. Listar Platillos (Menú)
Inicia sesión como CLIENTE
Copia el token generado
Ve a la petición (GET - Listar Platillos)
En Authorization selecciona BEARER TOKEN
Ingresa el token del CLIENTE
Envía la petición

3. Crear Pedido / Orden
Inicia sesión como CLIENTE
Copia el token generado
Ve a la petición (POST - Crear Orden)
En Authorization selecciona BEARER TOKEN
Ingresa el token del CLIENTE
Envía la petición


# 🔐 IMPORTANTE SOBRE LOS TOKENS
ADMIN_GENERAL solo puede usar endpoints de ADMIN_GENERAL.
ADMIN_RESTAURANTE solo puede usar endpoints de su rol.
CLIENTE solo puede usar endpoints de cliente.
Todas las peticiones protegidas requieren BEARER TOKEN.
El token se obtiene únicamente al iniciar sesión.