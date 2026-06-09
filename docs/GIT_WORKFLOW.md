# GymTech — Guía de Comandos Git por Tarea del Backlog

> **Convención global:** Nunca uses `git add .`. Cada tarea lista los archivos exactos a versionar.
> **Encargados normalizados:** Equipo de Infraestructura · Benis Gómez · Santiago Soto
> **Flujo:** `main` → `sprint-X` → `feature/nombre-corto` → Pull Request → merge a `sprint-X`

---

## Fase 0 — Preparación del repositorio (solo líder técnico / infra, una vez)

```bash
git clone https://github.com/<org>/GymTech.git
cd GymTech
git checkout main
git pull origin main

# Crear ramas base de sprints desde main
git checkout -b sprint-1 && git push -u origin sprint-1
git checkout main && git checkout -b sprint-2 && git push -u origin sprint-2
git checkout main && git checkout -b sprint-3 && git push -u origin sprint-3
git checkout main && git checkout -b sprint-4 && git push -u origin sprint-4
git checkout main && git checkout -b sprint-5 && git push -u origin sprint-5
```

---

# SPRINT 1: CONFIGURACIÓN E IDENTIDAD

---

#### 👤 ENCARGADO: Benis

- **ID Tarea:** GT-001
- **Actividad:** Definir la arquitectura del sistema basada en microservicios
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/arquitectura-microservicios`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/arquitectura-microservicios
```

```bash
git add ARCHITECTURE.md README.md docs/DEPLOYMENT.md gateway/src/routes.ts gateway/src/server.ts
git commit -m "docs(GT-001): definir arquitectura de microservicios y mapa de servicios"
git push -u origin feature/arquitectura-microservicios
```

Abrir PR: `feature/arquitectura-microservicios` → `sprint-1`

---

#### 👤 ENCARGADO: Soto

- **ID Tarea:** GT-002
- **Actividad:** Diseñar el modelo de base de datos
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/modelo-base-datos`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/modelo-base-datos
```

```bash
git add services/auth-service/src/infrastructure/db.ts services/membership-service/src/infrastructure/db.ts services/activity-service/src/infrastructure/db.ts services/reporting-service/src/infrastructure/db.ts services/notification-service/src/infrastructure/db.ts ARCHITECTURE.md
git commit -m "feat(GT-002): esquemas iniciales database-per-service en PostgreSQL"
git push -u origin feature/modelo-base-datos
```

Abrir PR: `feature/modelo-base-datos` → `sprint-1`

---

#### 👤 ENCARGADO: Benis

- **ID Tarea:** GT-003
- **Actividad:** Definir los endpoints iniciales de la API
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/endpoints-api-iniciales`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/endpoints-api-iniciales
```

```bash
git add gateway/src/routes.ts services/auth-service/src/interfaces/http/routes/authRoutes.ts services/membership-service/src/interfaces/http/routes/membershipRoutes.ts services/activity-service/src/interfaces/http/routes/activityRoutes.ts shared/contracts/auth.ts
git commit -m "feat(GT-003): definir contratos y rutas iniciales del API Gateway"
git push -u origin feature/endpoints-api-iniciales
```

Abrir PR: `feature/endpoints-api-iniciales` → `sprint-1`

---

#### 👤 ENCARGADO: Soto

- **ID Tarea:** GT-004
- **Actividad:** Configurar el repositorio Git del proyecto
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/config-repositorio-git`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/config-repositorio-git
```

```bash
git add .gitignore .env.example docs/GIT_WORKFLOW.md README.md
git commit -m "chore(GT-004): configurar repositorio, gitignore y guía de flujo"
git push -u origin feature/config-repositorio-git
```

Abrir PR: `feature/config-repositorio-git` → `sprint-1`

---

#### 👤 ENCARGADO: Benis

- **ID Tarea:** GT-005
- **Actividad:** Crear la estructura base del proyecto
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/estructura-base-proyecto`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/estructura-base-proyecto
```

```bash
git add gateway/package.json gateway/tsconfig.json gateway/Dockerfile services/auth-service/package.json services/auth-service/Dockerfile services/membership-service/package.json services/membership-service/Dockerfile services/activity-service/package.json services/activity-service/Dockerfile services/reporting-service/package.json services/reporting-service/Dockerfile services/notification-service/package.json services/notification-service/Dockerfile frontend/package.json frontend/Dockerfile shared/constants/index.js
git commit -m "feat(GT-005): estructura base DDD por microservicio y gateway"
git push -u origin feature/estructura-base-proyecto
```

Abrir PR: `feature/estructura-base-proyecto` → `sprint-1`

---

#### 👤 ENCARGADO: Soto

- **ID Tarea:** GT-006
- **Actividad:** Configurar el entorno del backend
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/entorno-backend`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/entorno-backend
```

```bash
git add docker-compose.yml docker-compose.dev.yml .env.example gateway/src/config gateway/src/middleware services/auth-service/src/config.ts services/auth-service/src/server.ts services/auth-service/src/app.ts services/membership-service/src/config.ts services/membership-service/src/server.ts services/membership-service/src/app.ts
git commit -m "chore(GT-006): configurar entorno backend con Docker y variables de entorno"
git push -u origin feature/entorno-backend
```

Abrir PR: `feature/entorno-backend` → `sprint-1`

---

#### 👤 ENCARGADO: Benis

- **ID Tarea:** GT-007
- **Actividad:** Configurar el entorno del frontend PWA
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/entorno-frontend-pwa`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/entorno-frontend-pwa
```

```bash
git add frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/src/main.ts frontend/src/styles/tokens.css frontend/src/styles/base.css frontend/public/icons/icon.svg frontend/Dockerfile.dev
git commit -m "chore(GT-007): configurar entorno PWA con Vite, Tailwind y app shell"
git push -u origin feature/entorno-frontend-pwa
```

Abrir PR: `feature/entorno-frontend-pwa` → `sprint-1`

---

#### 👤 ENCARGADO: Soto

- **ID Tarea:** GT-008
- **Actividad:** Configurar la base de datos inicial
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/base-datos-inicial`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/base-datos-inicial
```

```bash
git add docker-compose.yml docker-compose.dev.yml services/auth-service/src/infrastructure/db.ts services/membership-service/src/infrastructure/db.ts services/activity-service/src/infrastructure/db.ts services/reporting-service/src/infrastructure/db.ts services/notification-service/src/infrastructure/db.ts .env.example
git commit -m "feat(GT-008): contenedores PostgreSQL por servicio y scripts initSchema"
git push -u origin feature/base-datos-inicial
```

Abrir PR: `feature/base-datos-inicial` → `sprint-1`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-101
- **Actividad:** Como administrador, necesito implementar autenticación de usuarios, con la finalidad de garantizar acceso seguro al sistema.
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/auth-jwt-login`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/auth-jwt-login
```

```bash
git add services/auth-service/src/domain/services/AuthService.ts services/auth-service/src/interfaces/http/controllers/authController.ts services/auth-service/src/interfaces/http/routes/authRoutes.ts services/auth-service/src/interfaces/http/middlewares/authenticate.ts gateway/src/middleware/auth.ts frontend/src/views/public/login.ts frontend/src/state/auth.ts frontend/src/lib/api.ts
git commit -m "feat(GT-101): autenticación JWT con login seguro en auth-service y PWA"
git push -u origin feature/auth-jwt-login
```

Abrir PR: `feature/auth-jwt-login` → `sprint-1`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-102
- **Actividad:** Como administrador, necesito registrar los nuevos usuarios del sistema (recepcionistas, entrenadores y clientes), con la finalidad de agregar nuevos usuarios y otorgarles acceso según su rol.
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/registro-usuarios`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/registro-usuarios
```

```bash
git add services/auth-service/src/infrastructure/repositories/UserRepository.ts services/auth-service/src/domain/repositories/IUserRepository.ts services/auth-service/src/interfaces/http/controllers/authController.ts services/auth-service/src/interfaces/http/routes/authRoutes.ts frontend/src/views/admin/users.ts frontend/src/lib/api.ts shared/contracts/auth.ts
git commit -m "feat(GT-102): registro de usuarios con roles admin, recepcionista, entrenador y cliente"
git push -u origin feature/registro-usuarios
```

Abrir PR: `feature/registro-usuarios` → `sprint-1`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-103
- **Actividad:** Como administrador, necesito implementar la gestión de roles, con la finalidad de controlar lo que cada tipo de usuario puede hacer en el sistema.
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/gestion-roles-rbac`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/gestion-roles-rbac
```

```bash
git add services/auth-service/src/domain/services/AuthorizationService.ts services/membership-service/src/interfaces/http/middlewares/requireRoles.ts services/activity-service/src/interfaces/http/middlewares/requireRoles.ts services/reporting-service/src/interfaces/http/middlewares/requireAdmin.ts frontend/src/router.ts frontend/src/components/navConfig.ts gateway/src/middleware/auth.ts
git commit -m "feat(GT-103): RBAC por rol en gateway, microservicios y rutas PWA"
git push -u origin feature/gestion-roles-rbac
```

Abrir PR: `feature/gestion-roles-rbac` → `sprint-1`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-104
- **Actividad:** Como administrador, necesito validar las credenciales de acceso, con la finalidad de asegurar que solo usuarios autorizados ingresen al sistema.
- **Rama Base:** `sprint-1`
- **Rama de la Tarea:** `feature/validacion-credenciales`

**Comandos para la Terminal:**

```bash
git checkout sprint-1
git pull origin sprint-1
git checkout -b feature/validacion-credenciales
```

```bash
git add services/auth-service/src/domain/services/AuthService.ts services/auth-service/src/infrastructure/repositories/UserRepository.ts services/auth-service/src/interfaces/http/controllers/authController.ts services/auth-service/src/interfaces/http/middlewares/authenticate.ts frontend/src/views/public/login.ts frontend/src/state/auth.ts
git commit -m "feat(GT-104): validación de credenciales con bcrypt y bloqueo de acceso no autorizado"
git push -u origin feature/validacion-credenciales
```

Abrir PR: `feature/validacion-credenciales` → `sprint-1`

---

# SPRINT 2: OPERACIONES CORE Y MEMBRESÍAS

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-201
- **Actividad:** Como administrador, necesito registrar las membresías, con la finalidad de definir las opciones de suscripción disponibles para la venta.
- **Rama Base:** `sprint-2`
- **Rama de la Tarea:** `feature/registro-membresias`

**Comandos para la Terminal:**

```bash
git checkout sprint-2
git pull origin sprint-2
git checkout -b feature/registro-membresias
```

```bash
git add services/membership-service/src/domain/entities/Membership.ts services/membership-service/src/infrastructure/repositories/MembershipPlanRepository.ts services/membership-service/src/interfaces/http/controllers/membershipController.ts services/membership-service/src/interfaces/http/routes/membershipRoutes.ts frontend/src/views/admin/memberships.ts frontend/src/views/reception/memberships.ts frontend/src/lib/api.ts
git commit -m "feat(GT-201): CRUD de planes de membresía y suscripciones"
git push -u origin feature/registro-membresias
```

Abrir PR: `feature/registro-membresias` → `sprint-2`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-202
- **Actividad:** Como recepcionista, necesito registrar el ingreso de los clientes, con la finalidad de validar la entrada de los socios al gimnasio.
- **Rama Base:** `sprint-2`
- **Rama de la Tarea:** `feature/registro-ingreso-clientes`

**Comandos para la Terminal:**

```bash
git checkout sprint-2
git pull origin sprint-2
git checkout -b feature/registro-ingreso-clientes
```

```bash
git add services/membership-service/src/domain/entities/Attendance.ts services/membership-service/src/infrastructure/repositories/AttendanceRepository.ts services/membership-service/src/interfaces/http/controllers/membershipController.ts services/membership-service/src/interfaces/http/routes/membershipRoutes.ts frontend/src/views/reception/attendance.ts frontend/src/lib/api.ts
git commit -m "feat(GT-202): registro de check-in/check-out en recepción con idempotencia"
git push -u origin feature/registro-ingreso-clientes
```

Abrir PR: `feature/registro-ingreso-clientes` → `sprint-2`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-203
- **Actividad:** Como recepcionista, necesito validar el estado activo de la suscripción, con la finalidad de permitir el ingreso solo a clientes con suscripción vigente.
- **Rama Base:** `sprint-2`
- **Rama de la Tarea:** `feature/validar-suscripcion-activa`

**Comandos para la Terminal:**

```bash
git checkout sprint-2
git pull origin sprint-2
git checkout -b feature/validar-suscripcion-activa
```

```bash
git add services/membership-service/src/domain/services/MembershipValidationService.ts services/membership-service/src/domain/entities/Subscription.ts services/membership-service/src/infrastructure/repositories/SubscriptionRepository.ts services/membership-service/src/interfaces/http/controllers/membershipController.ts frontend/src/views/reception/attendance.ts frontend/src/lib/api.ts
git commit -m "feat(GT-203): validación de suscripción activa antes de permitir ingreso"
git push -u origin feature/validar-suscripcion-activa
```

Abrir PR: `feature/validar-suscripcion-activa` → `sprint-2`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-205
- **Actividad:** Como administrador, necesito registrar los pagos de los clientes, con la finalidad de formalizar el ingreso de dinero y activar los servicios del cliente.
- **Rama Base:** `sprint-2`
- **Rama de la Tarea:** `feature/registro-pagos`

**Comandos para la Terminal:**

```bash
git checkout sprint-2
git pull origin sprint-2
git checkout -b feature/registro-pagos
```

```bash
git add services/membership-service/src/infrastructure/repositories/PaymentRepository.ts services/membership-service/src/interfaces/http/controllers/membershipController.ts services/membership-service/src/interfaces/http/routes/membershipRoutes.ts frontend/src/views/reception/payments.ts frontend/src/views/admin/dashboard.ts frontend/src/lib/api.ts
git commit -m "feat(GT-205): registro de pagos y métricas de ingresos mensuales"
git push -u origin feature/registro-pagos
```

Abrir PR: `feature/registro-pagos` → `sprint-2`

---

# SPRINT 3: ACTIVIDADES Y PLANES DE ENTRENAMIENTO

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-301
- **Actividad:** Como administrador, necesito registrar las clases del gimnasio, con la finalidad de organizar la agenda de actividades.
- **Rama Base:** `sprint-3`
- **Rama de la Tarea:** `feature/registro-clases`

**Comandos para la Terminal:**

```bash
git checkout sprint-3
git pull origin sprint-3
git checkout -b feature/registro-clases
```

```bash
git add services/activity-service/src/domain/entities/GymClass.ts services/activity-service/src/domain/entities/Schedule.ts services/activity-service/src/domain/services/ClassSchedulingService.ts services/activity-service/src/interfaces/http/controllers/activityController.ts services/activity-service/src/infrastructure/db.ts frontend/src/views/trainer/classes.ts frontend/src/views/trainer/schedule.ts frontend/src/lib/api.ts
git commit -m "feat(GT-301): registro de clases con fecha, horario y salón"
git push -u origin feature/registro-clases
```

Abrir PR: `feature/registro-clases` → `sprint-3`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-302
- **Actividad:** Como entrenador, necesito asignar rutinas a los clientes, con la finalidad de ofrecer planes de entrenamiento personalizados.
- **Rama Base:** `sprint-3`
- **Rama de la Tarea:** `feature/asignar-rutinas`

**Comandos para la Terminal:**

```bash
git checkout sprint-3
git pull origin sprint-3
git checkout -b feature/asignar-rutinas
```

```bash
git add services/activity-service/src/domain/entities/Routine.ts services/activity-service/src/domain/services/RoutineAssignmentService.ts services/activity-service/src/infrastructure/repositories/RoutineRepository.ts services/activity-service/src/infrastructure/repositories/TrainerClientRepository.ts services/activity-service/src/interfaces/http/controllers/activityController.ts frontend/src/views/trainer/routines.ts frontend/src/views/client/routine.ts frontend/src/router.ts frontend/src/components/navConfig.ts
git commit -m "feat(GT-302): creación y asignación de rutinas personalizadas a clientes"
git push -u origin feature/asignar-rutinas
```

Abrir PR: `feature/asignar-rutinas` → `sprint-3`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-303
- **Actividad:** Como cliente, necesito consultar los horarios de las clases en la página web, con la finalidad de reservar un cupo en la clase que me interese.
- **Rama Base:** `sprint-3`
- **Rama de la Tarea:** `feature/horarios-reserva-clases`

**Comandos para la Terminal:**

```bash
git checkout sprint-3
git pull origin sprint-3
git checkout -b feature/horarios-reserva-clases
```

```bash
git add services/activity-service/src/infrastructure/repositories/GymClassRepository.ts services/activity-service/src/infrastructure/repositories/ScheduleRepository.ts services/activity-service/src/interfaces/http/routes/activityRoutes.ts frontend/src/views/client/classes.ts frontend/src/components/ActivityCalendar.ts frontend/src/lib/api.ts
git commit -m "feat(GT-303): calendario de clases y reserva de cupos para clientes"
git push -u origin feature/horarios-reserva-clases
```

Abrir PR: `feature/horarios-reserva-clases` → `sprint-3`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-304
- **Actividad:** Como administrador, necesito que el sistema envíe notificaciones de vencimiento, con la finalidad de alertar a los clientes antes de que su membresía expire.
- **Rama Base:** `sprint-3`
- **Rama de la Tarea:** `feature/notificaciones-vencimiento`

**Comandos para la Terminal:**

```bash
git checkout sprint-3
git pull origin sprint-3
git checkout -b feature/notificaciones-vencimiento
```

```bash
git add services/notification-service/src/domain/services/NotificationService.ts services/notification-service/src/infrastructure/repositories/NotificationRepository.ts services/notification-service/src/interfaces/http/controllers/notificationController.ts services/membership-service/src/domain/services/SubscriptionRenewalService.ts services/membership-service/src/server.ts frontend/src/views/client/settings.ts frontend/src/lib/api.ts
git commit -m "feat(GT-304): notificaciones automáticas de vencimiento de membresía"
git push -u origin feature/notificaciones-vencimiento
```

Abrir PR: `feature/notificaciones-vencimiento` → `sprint-3`

---

# SPRINT 4: CAPACIDADES PWA Y MODO OFFLINE

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-401
- **Actividad:** Como recepcionista, necesito que el sistema funcione sin conexión a internet, con la finalidad de continuar registrando ingresos aunque no haya red.
- **Rama Base:** `sprint-4`
- **Rama de la Tarea:** `feature/pwa-modo-offline`

**Comandos para la Terminal:**

```bash
git checkout sprint-4
git pull origin sprint-4
git checkout -b feature/pwa-modo-offline
```

```bash
git add frontend/src/sw.ts frontend/vite.config.ts frontend/src/lib/pwa.ts frontend/src/lib/network.ts frontend/src/components/ConnectionBanner.ts frontend/src/components/NetworkBadge.ts frontend/src/main.ts frontend/public/icons/icon.svg
git commit -m "feat(GT-401): PWA con service worker y soporte offline en recepción"
git push -u origin feature/pwa-modo-offline
```

Abrir PR: `feature/pwa-modo-offline` → `sprint-4`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-402
- **Actividad:** Como administrador, necesito que los datos se sincronicen automáticamente, con la finalidad de actualizar el sistema cuando la conexión se restaure.
- **Rama Base:** `sprint-4`
- **Rama de la Tarea:** `feature/sincronizacion-automatica`

**Comandos para la Terminal:**

```bash
git checkout sprint-4
git pull origin sprint-4
git checkout -b feature/sincronizacion-automatica
```

```bash
git add frontend/src/lib/syncQueue.ts frontend/src/lib/indexeddb.ts frontend/src/sw.ts frontend/src/components/OfflineBar.ts frontend/src/lib/network.ts
git commit -m "feat(GT-402): cola de sincronización automática al restaurar conexión"
git push -u origin feature/sincronizacion-automatica
```

Abrir PR: `feature/sincronizacion-automatica` → `sprint-4`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-403
- **Actividad:** Como recepcionista, necesito poder registrar la asistencia sin conexión a internet, con la finalidad de no interrumpir la operación diaria por problemas de red.
- **Rama Base:** `sprint-4`
- **Rama de la Tarea:** `feature/asistencia-offline`

**Comandos para la Terminal:**

```bash
git checkout sprint-4
git pull origin sprint-4
git checkout -b feature/asistencia-offline
```

```bash
git add frontend/src/views/reception/attendance.ts frontend/src/lib/indexeddb.ts frontend/src/lib/syncQueue.ts frontend/src/sw.ts services/membership-service/src/interfaces/http/controllers/membershipController.ts
git commit -m "feat(GT-403): registro de asistencia offline con cola IndexedDB e idempotencia"
git push -u origin feature/asistencia-offline
```

Abrir PR: `feature/asistencia-offline` → `sprint-4`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-404
- **Actividad:** Como usuario del sistema, necesito poder instalar la aplicación en mi dispositivo móvil, con la finalidad de acceder al sistema fácilmente como si fuera una app.
- **Rama Base:** `sprint-4`
- **Rama de la Tarea:** `feature/instalacion-pwa`

**Comandos para la Terminal:**

```bash
git checkout sprint-4
git pull origin sprint-4
git checkout -b feature/instalacion-pwa
```

```bash
git add frontend/vite.config.ts frontend/index.html frontend/public/icons/icon.svg frontend/src/lib/pwa.ts frontend/src/styles/components.css
git commit -m "feat(GT-404): manifest PWA instalable en dispositivos móviles"
git push -u origin feature/instalacion-pwa
```

Abrir PR: `feature/instalacion-pwa` → `sprint-4`

---

# SPRINT 5: ANALÍTICA, AUDITORÍA Y CALIDAD

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-501
- **Actividad:** Como administrador, necesito que el sistema genere reportes del negocio, con la finalidad de obtener datos que muestren el desempeño del gimnasio en un período de tiempo.
- **Rama Base:** `sprint-5`
- **Rama de la Tarea:** `feature/reportes-negocio`

**Comandos para la Terminal:**

```bash
git checkout sprint-5
git pull origin sprint-5
git checkout -b feature/reportes-negocio
```

```bash
git add services/reporting-service/src/domain/services/ReportGenerationService.ts services/reporting-service/src/infrastructure/repositories/ReportRepository.ts services/reporting-service/src/interfaces/http/controllers/reportingController.ts services/reporting-service/src/interfaces/http/routes/reportingRoutes.ts frontend/src/views/admin/reports.ts frontend/src/lib/api.ts
git commit -m "feat(GT-501): generación de reportes de ingresos y asistencia en PDF/Excel"
git push -u origin feature/reportes-negocio
```

Abrir PR: `feature/reportes-negocio` → `sprint-5`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-502
- **Actividad:** Como administrador, necesito que el sistema registre un historial de las acciones importantes, con la finalidad de tener trazabilidad de los cambios realizados.
- **Rama Base:** `sprint-5`
- **Rama de la Tarea:** `feature/auditoria-historial`

**Comandos para la Terminal:**

```bash
git checkout sprint-5
git pull origin sprint-5
git checkout -b feature/auditoria-historial
```

```bash
git add services/reporting-service/src/domain/entities/AuditLog.ts services/reporting-service/src/infrastructure/repositories/AuditLogRepository.ts services/reporting-service/src/interfaces/http/routes/reportingRoutes.ts frontend/src/views/admin/audit.ts frontend/src/lib/api.ts
git commit -m "feat(GT-502): registro y consulta de historial de auditoría"
git push -u origin feature/auditoria-historial
```

Abrir PR: `feature/auditoria-historial` → `sprint-5`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-503
- **Actividad:** Optimizar el rendimiento general del sistema
- **Rama Base:** `sprint-5`
- **Rama de la Tarea:** `feature/optimizacion-rendimiento`

**Comandos para la Terminal:**

```bash
git checkout sprint-5
git pull origin sprint-5
git checkout -b feature/optimizacion-rendimiento
```

```bash
git add gateway/src/server.ts services/auth-service/src/infrastructure/db.ts services/membership-service/src/infrastructure/db.ts services/activity-service/src/infrastructure/db.ts frontend/vite.config.ts docker-compose.yml
git commit -m "perf(GT-503): optimizar pools de BD, caché del gateway y build del frontend"
git push -u origin feature/optimizacion-rendimiento
```

Abrir PR: `feature/optimizacion-rendimiento` → `sprint-5`

---

#### 👤 ENCARGADO: Santiago Soto

- **ID Tarea:** GT-504
- **Actividad:** Validar que el sistema cumple con los requisitos de calidad definidos
- **Rama Base:** `sprint-5`
- **Rama de la Tarea:** `feature/validacion-calidad`

**Comandos para la Terminal:**

```bash
git checkout sprint-5
git pull origin sprint-5
git checkout -b feature/validacion-calidad
```

```bash
git add docs/GIT_WORKFLOW.md PROGRESS.md README.md frontend/package.json services/auth-service/package.json services/membership-service/package.json services/activity-service/package.json
git commit -m "test(GT-504): checklist de calidad, scripts de verificación y documentación QA"
git push -u origin feature/validacion-calidad
```

Abrir PR: `feature/validacion-calidad` → `sprint-5`

---

#### 👤 ENCARGADO: Benis Gómez

- **ID Tarea:** GT-105
- **Actividad:** Como administrador, necesito visualizar un panel principal al ingresar, con la finalidad de tener una visión general del estado del gimnasio.
- **Rama Base:** `sprint-5`
- **Rama de la Tarea:** `feature/dashboard-admin`

**Comandos para la Terminal:**

```bash
git checkout sprint-5
git pull origin sprint-5
git checkout -b feature/dashboard-admin
```

```bash
git add services/membership-service/src/interfaces/http/controllers/membershipController.ts services/membership-service/src/interfaces/http/routes/membershipRoutes.ts frontend/src/views/admin/dashboard.ts frontend/src/styles/components.css frontend/src/lib/api.ts
git commit -m "feat(GT-105): panel principal con KPIs de aforo, ingresos y suscripciones"
git push -u origin feature/dashboard-admin
```

Abrir PR: `feature/dashboard-admin` → `sprint-5`

---

## Cierre de Sprint (líder técnico)

Al terminar todas las features de un sprint:

```bash
git checkout sprint-X
git pull origin sprint-X
# Verificar PRs mergeados en GitHub
git checkout main
git pull origin main
git merge --no-ff sprint-X -m "release: cierre sprint X"
git push origin main
git tag -a v0.X.0 -m "GymTech Sprint X"
git push origin v0.X.0
```

## Reglas de seguridad

- ❌ Prohibido: `git add .`
- ❌ Prohibido: push directo a `main` o `sprint-X`
- ❌ Prohibido: `git push --force` en ramas compartidas
- ✅ Obligatorio: Pull Request con revisión de código
- ✅ Obligatorio: `git pull origin sprint-X` antes de crear cada feature
