# GymTech - Microservicios

Arquitectura de microservicios para la plataforma GymTech, construida con Node.js, Express y Docker.

## Arquitectura

Este proyecto sigue el patrón de arquitectura de microservicios con las siguientes características:

- **API Gateway**: Punto de entrada único que enruta las peticiones al microservicio correspondiente.
- **Database-per-Service**: Cada microservicio tiene su propia base de datos PostgreSQL independiente.
- **Independencia**: Cada servicio es completamente autónomo y desplegable por separado.
- **Docker & Docker Compose**: Orquestación de contenedores para desarrollo y producción.

## Servicios

| Servicio         | Puerto Interno | Puerto Externo (Dev) | Descripción                         |
|------------------|------------------|----------------------|-------------------------------------|
| Gateway          | 3000             | 3000                 | Punto de entrada, proxy/routing     |
| Auth Service     | 3001             | 3001                 | Autenticación y autorización        |
| Membership       | 3002             | 3002                 | Gestión de membresías               |
| Activity         | 3003             | 3003                 | Gestión de actividades/gimnasio     |
| Reporting        | 3004             | 3004                 | Reportes y analytics                |
| Notification     | 3005             | 3005                 | Notificaciones (email, push, SMS)   |

## Bases de Datos

| Base de Datos    | Puerto Externo (Dev) | Descripción                         |
|------------------|----------------------|-------------------------------------|
| auth-db          | 5433                 | Usuarios, credenciales, sesiones    |
| membership-db    | 5434                 | Planes, suscripciones, pagos        |
| activity-db      | 5435                 | Actividades, reservas, horarios     |
| reporting-db     | 5436                 | Logs, métricas, reportes generados  |
| notification-db  | 5437                 | Templates, colas de envío, historial|

## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 20+ (solo para desarrollo local sin Docker)

## Estructura de Carpetas

```
gymtech/
├── docker-compose.yml              # Orquestación de producción
├── docker-compose.dev.yml          # Orquestación de desarrollo
├── .env.example                    # Variables de entorno globales
├── README.md                       # Este archivo
│
├── gateway/                        # API Gateway
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js               # Entry point Express
│       ├── app.js                  # Configuración de Express
│       ├── config/
│       ├── routes/                 # Proxy/rutas hacia microservicios
│       └── middlewares/            # Error handler, rate limiter, auth
│
├── services/                       # Microservicios
│   ├── auth-service/
│   ├── membership-service/
│   ├── activity-service/
│   ├── reporting-service/
│   └── notification-service/
│
└── shared/                         # Utilidades compartidas
    ├── logger/
    ├── helpers/
    ├── validations/
    └── constants/
```

Cada microservicio contiene:
- `src/controllers/` - Manejadores de peticiones HTTP
- `src/services/` - Lógica de negocio
- `src/routes/` - Definición de rutas
- `src/models/` - Esquemas de base de datos
- `src/middlewares/` - Middlewares específicos del servicio
- `config/` - Variables de entorno y configuración

## Inicio Rápido

### 1. Clonar y configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` según tus necesidades.

### 2. Levantar todos los servicios (Desarrollo)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

El flag `--build` fuerza la reconstrucción de las imágenes. En desarrollo, los volúmenes permiten hot-reload.

### 3. Verificar que todo funciona

- Gateway: http://localhost:3000/health
- Auth Service: http://localhost:3001/health
- Membership Service: http://localhost:3002/health
- Activity Service: http://localhost:3003/health
- Reporting Service: http://localhost:3004/health
- Notification Service: http://localhost:3005/health

### 4. Detener los servicios

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Para eliminar también los volúmenes de base de datos:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

## Desarrollo Individual de un Servicio

Si quieres trabajar en un servicio específico sin levantar todo:

```bash
cd services/auth-service
cp .env.example .env
npm install
npm run dev
```

Asegúrate de tener la base de datos correspondiente corriendo (puedes levantar solo `auth-db` desde Docker Compose).

## Convenciones

- Cada servicio expone un endpoint `/health` para health checks.
- El gateway enruta peticiones basándose en prefijos de path:
  - `/auth/*` -> auth-service
  - `/memberships/*` -> membership-service
  - `/activities/*` -> activity-service
  - `/reports/*` -> reporting-service
  - `/notifications/*` -> notification-service
- Las respuestas siguen el formato definido en `shared/helpers/responseHelper.js`.
- Los errores son manejados centralmente por el middleware `errorHandler`.

## Tecnologías

- **Node.js 20**
- **Express.js**
- **PostgreSQL 16**
- **Docker & Docker Compose**
- **Winston** (logging)
- **Joi** (validaciones)

## Licencia

UNLICENSED
