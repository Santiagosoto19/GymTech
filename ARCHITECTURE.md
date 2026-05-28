# GymTech - Documentación de Arquitectura

## Índice
1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Archivos Raíz](#archivos-raíz)
4. [API Gateway](#api-gateway)
5. [Microservicios](#microservicios)
   - [Auth Service](#auth-service)
   - [Membership Service](#membership-service)
   - [Activity Service](#activity-service)
   - [Reporting Service](#reporting-service)
   - [Notification Service](#notification-service)
6. [Utilidades Compartidas (shared/)](#utilidades-compartidas)
7. [Flujo de una Petición](#flujo-de-una-petición)
8. [Base de Datos](#base-de-datos)
9. [Desarrollo y Debug](#desarrollo-y-debug)

---

## Visión General

Este proyecto implementa una **arquitectura de microservicios** para la plataforma GymTech. La idea central es dividir la aplicación en servicios pequeños, independientes y especializados, cada uno con su propia base de datos. Esto permite escalar, desplegar y mantener cada parte del sistema por separado.

### Componentes principales

| Componente | Rol | Puerto |
|------------|-----|--------|
| **API Gateway** | Punto de entrada único. Recibe todas las peticiones del cliente y las redirige al microservicio correspondiente. | 3000 |
| **Auth Service** | Gestiona usuarios, login, registro y tokens JWT. | 3001 |
| **Membership Service** | Administra planes de membresía, suscripciones y pagos. | 3002 |
| **Activity Service** | Controla actividades del gimnasio, horarios y reservas. | 3003 |
| **Reporting Service** | Genera reportes, métricas y dashboards. | 3004 |
| **Notification Service** | Envía notificaciones por email, push o SMS. | 3005 |

### Patrón Database-per-Service
Cada microservicio tiene su propia instancia de PostgreSQL. Esto garantiza:
- **Desacoplamiento total**: un servicio no puede acceder directamente a la base de datos de otro.
- **Independencia tecnológica**: si mañana quieres cambiar PostgreSQL por MongoDB en un solo servicio, puedes hacerlo sin afectar a los demás.
- **Escalabilidad individual**: puedes escalar solo la base de datos del servicio que más carga tenga.

---

## Estructura del Proyecto

```
gymtech/
├── .env.example                    # Variables de entorno globales (plantilla)
├── .gitignore                      # Archivos ignorados por Git
├── docker-compose.yml              # Orquestación de contenedores (producción)
├── docker-compose.dev.yml          # Orquestación de contenedores (desarrollo)
├── README.md                       # Guía rápida de uso
├── ARCHITECTURE.md                 # Este documento
│
├── gateway/                        # API Gateway
│   ├── Dockerfile                  # Instrucciones para crear la imagen Docker
│   ├── package.json                # Dependencias de Node.js
│   ├── .env.example                # Variables del gateway (plantilla)
│   └── src/                        # Código fuente
│       ├── server.js               # Punto de entrada: inicia el servidor Express
│       ├── app.js                  # Configura Express (middlewares, rutas)
│       ├── config/
│       │   └── index.js            # Lee y expone las variables de entorno
│       ├── routes/
│       │   └── index.js            # Define las rutas proxy hacia microservicios
│       └── middlewares/
│           ├── errorHandler.js     # Captura errores y responde al cliente
│           ├── rateLimiter.js      # Limita peticiones por IP
│           └── authMiddleware.js   # Verifica que venga un token JWT
│
├── services/                       # Carpeta contenedora de microservicios
│   ├── auth-service/
│   ├── membership-service/
│   ├── activity-service/
│   ├── reporting-service/
│   └── notification-service/
│       ├── Dockerfile              # Imagen Docker del servicio
│       ├── package.json            # Dependencias del servicio
│       ├── .env.example            # Variables del servicio (plantilla)
│       └── src/
│           ├── server.js           # Inicia el servidor
│           ├── app.js              # Configura Express
│           ├── config/
│           │   └── index.js        # Variables de entorno del servicio
│           ├── controllers/
│           │   └── xxxController.js# Recibe la petición HTTP, delega al service
│           ├── services/
│           │   └── xxxService.js   # Lógica de negocio y reglas
│           ├── routes/
│           │   └── xxxRoutes.js   # Asocia URLs a controllers
│           ├── models/
│           │   └── xxxModel.js     # Estructura de datos / esquema de BD
│           └── middlewares/
│               └── validateXxx.js# Validaciones específicas del dominio
│
└── shared/                         # Código compartido entre servicios
    ├── logger/
    │   └── index.js                # Configuración de Winston (logs)
    ├── helpers/
    │   ├── responseHelper.js       # Formato uniforme de respuestas HTTP
    │   └── asyncHandler.js         # Wrapper para evitar try/catch en controllers
    ├── validations/
    │   └── commonValidations.js    # Validaciones reutilizables (Joi)
    └── constants/
        └── index.js                # Constantes globales (status codes, mensajes)
```

---

## Archivos Raíz

### `.env.example`
**Qué es**: Plantilla de variables de entorno. Aquí se definen todos los valores que Docker Compose y los servicios necesitan para funcionar, sin incluir datos sensibles reales.

**Qué hace**:
- Define los puertos de cada servicio.
- Configura la conexión a cada base de datos PostgreSQL.
- Establece el secreto para firmar tokens JWT.
- Define el entorno de ejecución (`development` o `production`).

**Cómo se usa**: El desarrollador copia este archivo a `.env` y rellena los valores reales. Docker Compose lee `.env` automáticamente al arrancar.

---

### `.gitignore`
**Qué es**: Lista de archivos y carpetas que Git debe ignorar.

**Qué contiene**:
- `node_modules/`: dependencias de Node.js (se instalan con `npm install`).
- `.env` y variantes: archivos con secretos reales.
- `logs/`, `dist/`, `build/`: archivos generados en tiempo de ejecución o compilación.
- Archivos de editores (`.vscode/`, `.idea/`) y del sistema (`.DS_Store`).

---

### `docker-compose.yml`
**Qué es**: Archivo principal de orquestación Docker. Describe todos los contenedores que forman la aplicación, sus imágenes, puertos, variables de entorno, redes y volúmenes.

**Qué hace**:
1. **Define 6 servicios de aplicación**: `gateway`, `auth-service`, `membership-service`, `activity-service`, `reporting-service`, `notification-service`.
2. **Define 5 bases de datos**: una PostgreSQL por cada microservicio.
3. **Configura redes**: todos los contenedores se comunican a través de la red Docker `gymtech-network`.
4. **Configura volúmenes**: los datos de cada PostgreSQL se persisten en volúmenes nombrados, para que no se pierdan al reiniciar contenedores.
5. **Establece dependencias**: por ejemplo, `auth-service` no arranca hasta que `auth-db` esté listo.
6. **Configura `restart: unless-stopped`**: si un contenedor falla, Docker intenta reiniciarlo automáticamente.

**Por qué es importante**: este archivo permite levantar toda la infraestructura con un solo comando (`docker-compose up`). Garantiza que todos los servicios se comuniquen correctamente y que las bases de datos persistan.

---

### `docker-compose.dev.yml`
**Qué es**: Archivo de extensión para desarrollo. Se usa **junto** con `docker-compose.yml`.

**Qué hace**:
- **Hot-reload**: monta las carpetas `src/` de cada servicio como volúmenes Docker. Cuando editas un archivo en tu máquina, el cambio se refleja inmediatamente dentro del contenedor sin necesidad de reconstruir la imagen.
- **Sobreescribe el comando de arranque**: cambia `npm start` por `npm run dev` (que usa `nodemon`).
- **Expone puertos adicionales**: en desarrollo puedes acceder directamente a cada microservicio (por ejemplo, `http://localhost:3001` para auth-service), lo cual facilita debuggear.
- **Expone puertos de bases de datos**: para poder conectarte con herramientas como pgAdmin o DBeaver desde tu máquina host.

**Cómo se usa**:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
Docker fusiona ambos archivos, dando prioridad a las configuraciones de `docker-compose.dev.yml`.

---

### `README.md`
**Qué es**: Documentación de alto nivel del proyecto.

**Qué contiene**:
- Descripción de la arquitectura y sus decisiones.
- Tabla de servicios con puertos.
- Tabla de bases de datos con puertos.
- Requisitos previos (Docker, Docker Compose).
- Estructura de carpetas explicada.
- Instrucciones paso a paso para levantar el proyecto.
- Convenciones adoptadas (rutas, formato de respuesta, health checks).
- Lista de tecnologías utilizadas.

---

## API Gateway

### `gateway/package.json`
**Qué es**: Manifesto del proyecto Node.js del Gateway.

**Qué contiene**:
- Nombre del paquete (`gymtech-gateway`), versión y descripción.
- **Scripts**:
  - `start`: ejecuta `node src/server.js` (modo producción).
  - `dev`: ejecuta `nodemon src/server.js` (modo desarrollo, reinicia automáticamente ante cambios).
- **Dependencias**:
  - `express`: framework web.
  - `http-proxy-middleware`: middleware que redirige peticiones HTTP a otros servicios.
  - `helmet`: añade headers de seguridad.
  - `cors`: habilita peticiones desde otros dominios.
  - `morgan`: logger de peticiones HTTP en consola.
  - `dotenv`: carga variables de entorno desde `.env`.
- **DevDependencies**:
  - `nodemon`: reinicia el servidor cuando detecta cambios en archivos.

---

### `gateway/Dockerfile`
**Qué es**: Script de instrucciones para Docker construir la imagen del Gateway.

**Qué hace paso a paso**:
1. `FROM node:20-alpine`: usa una imagen base ligera de Node.js 20 basada en Alpine Linux (~40MB en vez de ~900MB de la imagen completa).
2. `WORKDIR /app`: crea y establece el directorio de trabajo dentro del contenedor.
3. `COPY package*.json ./`: copia los archivos de dependencias.
4. `RUN npm install --production`: instala solo las dependencias de producción (no `nodemon`, no devDependencies).
5. `COPY . .`: copia todo el código fuente restante.
6. `EXPOSE 3000`: documenta que el contenedor escuchará en el puerto 3000.
7. `CMD ["npm", "start"]`: comando que se ejecuta al arrancar el contenedor.

**Por qué es eficiente**: copiar primero `package.json` y luego el código permite que Docker use caché de capas. Si no cambias dependencias, Docker no reinstala `node_modules` al reconstruir.

---

### `gateway/.env.example`
**Qué es**: Plantilla de variables de entorno del Gateway.

**Qué contiene**:
- `PORT`: puerto en el que escucha el Gateway (3000).
- URLs internas de cada microservicio. Docker Compose resuelve estos nombres (por ejemplo, `http://auth-service:3001`) automáticamente dentro de la red `gymtech-network`.
- `NODE_ENV`: modo de ejecución.

**Por qué son URLs internas**: el Gateway no habla con los servicios a través de `localhost`, sino a través de los nombres de contenedor definidos en `docker-compose.yml`. Docker tiene un DNS interno que traduce `auth-service` a la IP del contenedor correspondiente.

---

### `gateway/src/server.js`
**Qué es**: Punto de entrada de la aplicación. El archivo que Node.js ejecuta primero.

**Qué hace**:
1. Importa `app.js` (la instancia de Express configurada).
2. Importa `config` para leer el puerto.
3. Llama a `app.listen(PORT)`, que abre el socket TCP y empieza a escuchar peticiones HTTP.
4. Loguea en consola que el servidor está corriendo.

**Por qué es simple**: delega toda la configuración a `app.js` y todo el arranque a `server.js`, separando responsabilidades.

---

### `gateway/src/app.js`
**Qué es**: Fábrica de la aplicación Express. Configura todos los middlewares globales y monta las rutas.

**Qué hace**:
1. **Seguridad**:
   - `helmet()`: añade headers HTTP de seguridad (X-Frame-Options, X-XSS-Protection, Strict-Transport-Security, etc.).
   - `cors()`: permite que navegadores desde otros dominios hagan peticiones al API.
2. **Logging**:
   - `morgan('combined')`: registra cada petición con formato Apache combined (método, URL, status, tiempo, user-agent).
3. **Parsing**:
   - `express.json()`: convierte el body de peticiones `Content-Type: application/json` en un objeto JavaScript accesible en `req.body`.
   - `express.urlencoded()`: hace lo mismo para formularios HTML tradicionales.
4. **Health Check**:
   - Ruta `GET /health`: responde con `{"status": "UP", "service": "gateway"}`. Docker y balanceadores de carga la usan para saber si el servicio está vivo.
5. **Rutas**:
   - `app.use('/', routes)`: monta las rutas definidas en `routes/index.js`.
6. **Manejo de errores**:
   - `app.use(errorHandler)`: middleware al final de la pila que captura cualquier error lanzado por los controllers o middlewares anteriores.

---

### `gateway/src/config/index.js`
**Qué es**: Centralizador de configuración. Un único lugar donde se leen todas las variables de entorno.

**Qué hace**:
1. `require('dotenv').config()`: carga el archivo `.env` del Gateway en `process.env`.
2. Exporta un objeto con:
   - `port`: puerto de escucha.
   - `nodeEnv`: entorno de ejecución.
   - `services`: objeto con las URLs de cada microservicio.

**Por qué es útil**: si cambia el nombre de una variable de entorno, solo modificas este archivo. El resto del código importa `config` y no depende directamente de `process.env`.

---

### `gateway/src/routes/index.js`
**Qué es**: Definición del enrutamiento del Gateway. Aquí es donde ocurre la magia del proxy.

**Qué hace**:
1. Importa `createProxyMiddleware` de `http-proxy-middleware`.
2. Define una función `createServiceProxy(target, pathRewrite)` que crea un middleware proxy configurado.
3. **Redirige peticiones**:
   - Cualquier petición que empiece con `/auth` se redirige al `auth-service`.
   - `/memberships` -> `membership-service`.
   - `/activities` -> `activity-service`.
   - `/reports` -> `reporting-service`.
   - `/notifications` -> `notification-service`.
4. `pathRewrite`: elimina el prefijo antes de enviar la petición al microservicio. Por ejemplo, `/auth/login` llega al `auth-service` como `/login`.
5. Manejo de errores del proxy: si un servicio está caído, responde con HTTP 502 (Bad Gateway).

**Ejemplo de flujo**:
```
Cliente -> GET http://localhost:3000/auth/login
Gateway -> Proxy -> GET http://auth-service:3001/login
Auth Service -> Responde -> Gateway -> Cliente
```

---

### `gateway/src/middlewares/errorHandler.js`
**Qué es**: Middleware de manejo de errores centralizado.

**Qué hace**:
1. Recibe 4 parámetros: `(err, req, res, next)`.
2. Loguea la traza del error en consola.
3. Determina el código de estado: usa `err.statusCode`, `err.status` o por defecto 500.
4. Responde al cliente con un JSON uniforme:
   ```json
   {
     "success": false,
     "error": {
       "message": "...",
       "stack": "..."  // solo en desarrollo
     }
   }
   ```
5. En desarrollo incluye el `stack` para facilitar debug. En producción lo oculta por seguridad.

---

### `gateway/src/middlewares/authMiddleware.js`
**Qué es**: Middleware que verifica la presencia de un token de autorización.

**Qué hace**:
1. Lee `req.headers.authorization`.
2. Si no existe, responde con 401 (Unauthorized).
3. En la versión actual, no verifica la firma del JWT (es un mock). En producción, aquí se validaría el token con la clave secreta y se extraería el usuario.
4. Adjunta `req.user` con información del usuario para que los controllers la usen.

**Cómo se usaría**: se añadiría a rutas protegidas con `app.use('/memberships', authMiddleware, createProxyMiddleware(...))`.

---

### `gateway/src/middlewares/rateLimiter.js`
**Qué es**: Middleware que limita la cantidad de peticiones por IP.

**Qué hace**:
1. Mantiene un `Map` en memoria (`rateLimit`) donde la clave es la IP del cliente.
2. Cada entrada almacena:
   - `count`: cuántas peticiones ha hecho.
   - `resetTime`: timestamp en el que se reinicia el contador.
3. Si una IP excede `maxRequests` dentro del `windowMs` (por defecto 100 peticiones en 60 segundos), responde con 429 (Too Many Requests).
4. Si pasa el tiempo de ventana, reinicia el contador.

**Limitaciones actuales**: el contador se guarda en memoria local, por lo que si reinicias el Gateway se pierde. En producción con múltiples réplicas del Gateway, se usaría Redis.

---

## Microservicios

Cada microservicio sigue **exactamente la misma estructura interna**, por lo que explico el patrón una vez y luego detallo qué hace cada servicio en particular.

### Patrón común de archivos

| Archivo | Responsabilidad |
|---------|----------------|
| `server.js` | Arranca el servidor Express en el puerto configurado. |
| `app.js` | Configura Express: middlewares globales, health check, monta rutas, manejo de errores. |
| `config/index.js` | Lee variables de entorno (puerto, host de BD, credenciales) y las expone como un objeto. |
| `controllers/xxxController.js` | Recibe `req` y `res`, valida inputs básicos, llama al Service, responde al cliente usando `responseHelper`. |
| `services/xxxService.js` | Contiene la lógica de negocio pura. No sabe nada de HTTP. Opera sobre los Modelos. |
| `routes/xxxRoutes.js` | Asocia URLs a métodos del Controller. Define qué verbo HTTP (`GET`, `POST`, etc.) llama a qué función. |
| `models/xxxModel.js` | Define la estructura de datos. Actualmente es una clase mock; en producción sería un modelo Sequelize/Prisma. |
| `middlewares/validateXxx.js` | Validaciones específicas del dominio antes de llegar al Controller. |

---

### Auth Service (`services/auth-service/`)

**Responsabilidad del dominio**: todo lo relacionado con usuarios, credenciales y sesiones.

**Archivos clave**:
- `controllers/authController.js`: tiene 3 métodos:
  - `register`: llama a `authService.register(req.body)` y responde 201.
  - `login`: llama a `authService.login(req.body)` y devuelve el token JWT.
  - `me`: llama a `authService.getProfile(req.user.id)` y devuelve los datos del usuario autenticado.
- `services/authService.js`: implementa la lógica:
  - `register`: hashea la contraseña con `bcryptjs` (10 salt rounds). Devuelve el usuario creado sin la contraseña.
  - `login`: compara la contraseña ingresada con el hash almacenado. Si coincide, firma un JWT con `jsonwebtoken` que expira en 24 horas.
  - `getProfile`: busca el usuario por ID.
- `models/userModel.js`: clase mock que simula una tabla `users`.
  - Campos: `id`, `email`, `password`, `role`, `createdAt`, `updatedAt`.
  - Métodos estáticos: `create`, `findByEmail`, `findById`.
- `middlewares/validateAuth.js`: valida que `email` y `password` estén presentes, que el email tenga formato válido, y que la contraseña tenga al menos 6 caracteres.

**Dependencias adicionales**: `bcryptjs` (hash de contraseñas) y `jsonwebtoken` (firma de tokens).

---

### Membership Service (`services/membership-service/`)

**Responsabilidad del dominio**: planes de membresía, precios, duraciones, suscripciones activas.

**Archivos clave**:
- `controllers/membershipController.js`: CRUD completo:
  - `list`: lista todas las membresías.
  - `create`: crea una nueva.
  - `getById`: obtiene una por ID.
  - `update`: modifica una existente.
  - `remove`: elimina una.
- `services/membershipService.js`: mantiene un array en memoria (`this.memberships`) con datos mock iniciales (Basic $29.99, Premium $59.99).
- `models/membershipModel.js`: estructura de datos con campos: `id`, `name`, `description`, `price`, `duration`, `features`, `isActive`, timestamps.
- `middlewares/validateMembership.js`: valida que `name`, `price` y `duration` estén presentes, y que `price` sea un número positivo.

---

### Activity Service (`services/activity-service/`)

**Responsabilidad del dominio**: actividades del gimnasio, instructores, horarios, capacidad de salones.

**Archivos clave**:
- `controllers/activityController.js`: CRUD completo.
- `services/activityService.js`: array mock con actividades (Yoga a las 9:00, Spinning a las 10:00).
- `models/activityModel.js`: campos: `id`, `name`, `description`, `instructor`, `schedule`, `capacity`, `isActive`, timestamps.
- `middlewares/validateActivity.js`: valida `name`, `instructor`, `schedule`, `capacity` (debe ser número positivo).

---

### Reporting Service (`services/reporting-service/`)

**Responsabilidad del dominio**: generar reportes y métricas del negocio.

**Archivos clave**:
- `controllers/reportController.js`:
  - `list`: lista reportes generados.
  - `create`: genera un nuevo reporte.
  - `getById`: obtiene un reporte específico.
  - `getDashboard`: devuelve métricas agregadas en tiempo real (usuarios totales, membresías activas, asistencia de hoy, ingresos del mes).
- `services/reportService.js`: array mock de reportes + método `getDashboard` que devuelve estadísticas hardcodeadas.
- `models/reportModel.js`: estructura de datos con campos: `id`, `type`, `title`, `description`, `data`, `generatedAt`, timestamps.
- `middlewares/validateReport.js`: valida `type` y `title`. El tipo debe ser uno de: `attendance`, `revenue`, `user-growth`, `activity`.

---

### Notification Service (`services/notification-service/`)

**Responsabilidad del dominio**: enviar comunicaciones a los usuarios (email, push, SMS).

**Archivos clave**:
- `controllers/notificationController.js`:
  - `send`: envía una notificación.
  - `list`: lista notificaciones enviadas.
  - `getById`: obtiene una notificación.
  - `getTemplates`: devuelve plantillas predefinidas (welcome, membership-renewal, class-reminder).
- `services/notificationService.js`:
  - `send`: simula el envío, añade a la lista interna y loguea en consola.
  - `getTemplates`: devuelve plantillas con nombre, asunto y canal.
- `models/notificationModel.js`: campos: `id`, `recipient`, `channel`, `subject`, `body`, `status`, `sentAt`, timestamps.
- `middlewares/validateNotification.js`: valida que todos los campos obligatorios estén presentes y que `channel` sea `email`, `sms` o `push`.
- `config/index.js`: además de la BD, incluye configuración SMTP para envío real de emails.

---

## Utilidades Compartidas (`shared/`)

Esta carpeta contiene código que cualquier microservicio puede importar. **Nota importante**: en la arquitectura actual, `shared/` no es un paquete npm publicado ni un módulo Node linkado. Los servicios lo importan con rutas relativas (`../../../shared/...`). En producción, esto se reemplazaría por un paquete privado en un registry o por un monorepo con workspaces.

### `shared/logger/index.js`
**Qué es**: Configuración de [Winston](https://github.com/winstonjs/winston), una biblioteca de logging muy popular en Node.js.

**Qué hace**:
- Crea un logger con 3 transports (destinos de salida):
  1. **Consola**: en desarrollo usa colores y formato legible. En producción usa JSON.
  2. **Archivo de errores**: solo guarda logs de nivel `error` en `logs/error.log`.
  3. **Archivo combinado**: guarda todos los niveles en `logs/combined.log`.
- Nivel de log configurable vía `LOG_LEVEL` (por defecto `info`).
- Añade metadatos por defecto: `service: 'gymtech'`.

**Cómo se usaría**:
```js
const logger = require('../../../shared/logger');
logger.info('Usuario creado', { userId: 123 });
logger.error('Error de base de datos', { error: err.message });
```

---

### `shared/helpers/responseHelper.js`
**Qué es**: Funciones para estandarizar las respuestas HTTP de todos los servicios.

**Qué hace**:
- `success(res, data, statusCode)`: responde con:
  ```json
  { "success": true, "data": ... }
  ```
- `error(res, message, statusCode)`: responde con:
  ```json
  { "success": false, "error": { "message": "..." } }
  ```

**Por qué es útil**: garantiza que todos los servicios respondan con el mismo formato, facilitando que el frontend maneje las respuestas de forma uniforme.

---

### `shared/helpers/asyncHandler.js`
**Qué es**: Función utilidad para evitar escribir `try/catch` en cada controller asíncrono.

**Qué hace**:
Envuelve una función async para que, si lanza una excepción, la envíe al middleware de manejo de errores de Express automáticamente.

**Sin asyncHandler**:
```js
const list = async (req, res, next) => {
  try {
    const result = await service.list();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
```

**Con asyncHandler**:
```js
const list = asyncHandler(async (req, res) => {
  const result = await service.list();
  res.json(result);
});
```

Los controllers actuales no lo usan todavía (usan try/catch explícito), pero está disponible para adopción futura.

---

### `shared/validations/commonValidations.js`
**Qué es**: Esquemas de validación reutilizables usando [Joi](https://joi.dev/).

**Qué contiene**:
- `idSchema`: valida que un ID sea un UUID válido.
- `emailSchema`: valida formato de email.
- `paginationSchema`: valida y sanea parámetros de paginación (`page`, `limit`), asignando valores por defecto.
- `validate(schema)`: función de orden superior que devuelve un middleware Express. Valida `req.body` (o `req.query` en GET) contra el esquema Joi. Si falla, responde 400 con los mensajes de error.

**Cómo se usaría**:
```js
const { validate, paginationSchema } = require('../../../shared/validations/commonValidations');
router.get('/', validate(paginationSchema), controller.list);
```

---

### `shared/constants/index.js`
**Qué es**: Diccionario de constantes globales.

**Qué contiene**:
- `HTTP_STATUS`: códigos HTTP como constantes nombradas (`OK`, `CREATED`, `NOT_FOUND`, etc.).
- `ERROR_MESSAGES`: mensajes de error estándar.
- `SERVICES`: nombres internos de cada servicio (útil para logs, métricas, tracing).
- `DB_TYPES`: tipos de base de datos soportados.

**Por qué es útil**: evita magic numbers y magic strings. En vez de escribir `res.status(404)`, escribes `res.status(HTTP_STATUS.NOT_FOUND)`, lo cual es más legible y menos propenso a errores.

---

## Flujo de una Petición

Veamos paso a paso qué ocurre cuando un cliente (por ejemplo, una app móvil) quiere **consultar las actividades del gimnasio**:

```
1. CLIENTE
   Hace: GET http://localhost:3000/activities
   Headers: Authorization: Bearer <token>

2. API GATEWAY (puerto 3000)
   a. Recibe la petición en Express.
   b. helmet() añade headers de seguridad.
   c. cors() valida el origen.
   d. morgan() loguea la petición.
   e. express.json() parsea el body (en este caso vacío).
   f. La ruta /activities coincide con el proxy middleware.
   g. createProxyMiddleware redirige la petición a:
      GET http://activity-service:3003/
      (Docker resuelve activity-service a su IP interna)

3. ACTIVITY SERVICE (puerto 3003)
   a. Recibe la petición en su app.js.
   b. Aplica los mismos middlewares globales (helmet, cors, morgan, parsing).
   c. La ruta GET / coincide con activityRoutes.js.
   d. activityRoutes.js llama a activityController.list().
   e. El controller usa responseHelper.success(res, result).
   f. Responde con JSON: { "success": true, "data": [...] }

4. API GATEWAY
   a. Recibe la respuesta del Activity Service.
   b. La reenvía al cliente sin modificarla.

5. CLIENTE
   Recibe: { "success": true, "data": [ { id: "act-1", name: "Yoga" }, ... ] }
```

Si en cualquier punto ocurre un error:
- El controller lo pasa a `next(err)`.
- El middleware de errores de Express lo captura.
- Responde con `{ "success": false, "error": { "message": "..." } }`.

---

## Base de Datos

### Configuración en Docker Compose

Cada base de datos es un contenedor PostgreSQL 16 con:
- **Nombre de contenedor**: `gymtech-<service>-db`.
- **Volumen persistente**: los datos se guardan en un volumen Docker nombrado (por ejemplo, `auth-db-data`). Si el contenedor se reinicia, los datos sobreviven.
- **Variables de entorno**: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.

### Puertos en desarrollo

| Base de Datos | Puerto Host | Puerto Contenedor |
|---------------|-------------|-------------------|
| auth-db       | 5433        | 5432              |
| membership-db | 5434        | 5432              |
| activity-db   | 5435        | 5432              |
| reporting-db  | 5436        | 5432              |
| notification-db | 5437      | 5432              |

Esto permite conectar desde herramientas externas (pgAdmin, DBeaver, IntelliJ) sin conflictos de puertos.

### Modelos actuales

Los archivos en `models/` son **clases JavaScript mock**. No conectan a PostgreSQL todavía. Simulan una base de datos en memoria usando arrays estáticos.

**Cómo migrar a una ORM real**:
1. Instalar la dependencia en cada servicio (por ejemplo, `npm install pg sequelize` o `npm install pg @prisma/client`).
2. Configurar la conexión en `config/index.js` usando las variables `DB_HOST`, `DB_PORT`, etc.
3. Reemplazar la clase mock por un modelo Sequelize/Prisma/Mongoose que ejecute SQL real.
4. Los controllers y services no necesitan cambios significativos, porque ya usan los métodos `create`, `findById`, `findAll`, etc.

---

## Desarrollo y Debug

### Levantar todo el sistema
```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Construir imágenes y levantar contenedores
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 3. Ver logs en tiempo real
docker-compose logs -f gateway
```

### Levantar un solo servicio
```bash
cd services/auth-service
cp .env.example .env
npm install
npm run dev
```
*(Nota: necesitas la base de datos corriendo, puedes levantar solo auth-db desde Docker Compose).*

### Hot-reload
En desarrollo, `docker-compose.dev.yml` monta las carpetas `src/` como volúmenes. Si editas `services/auth-service/src/controllers/authController.js` en tu editor, el cambio se refleja inmediatamente en el contenedor porque `nodemon` detecta el cambio y reinicia el proceso Node.js.

### Verificar health checks
```bash
curl http://localhost:3000/health      # Gateway
curl http://localhost:3001/health      # Auth Service
curl http://localhost:3002/health      # Membership Service
# ... etc
```

### Ejecutar peticiones reales
```bash
# Registrar un usuario (a través del Gateway)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Listar actividades
curl http://localhost:3000/activities

# Obtener dashboard de reportes
curl http://localhost:3000/reports/dashboard
```

---

## Próximos Pasos Sugeridos

1. **Conectar bases de datos reales**: reemplazar los modelos mock por Sequelize/Prisma y configurar migraciones.
2. **Autenticación real**: implementar verificación de JWT en el Gateway y en cada servicio.
3. **Comunicación inter-servicios**: si un servicio necesita datos de otro, usar HTTP directo (REST) o un message broker como RabbitMQ/Redis.
4. **Tests**: añadir Jest + Supertest para tests unitarios y de integración en cada servicio.
5. **CI/CD**: crear un pipeline que construya las imágenes Docker y las publique en un registry.
6. **Observabilidad**: integrar el logger de `shared/logger` en todos los servicios y añadir métricas Prometheus.
