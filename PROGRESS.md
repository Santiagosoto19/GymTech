# Progreso del Proyecto - GymTech

Este archivo sirve como memoria compartida y registro de avances del proyecto. Se actualizará después de cada tarea significativa.

## Estado Actual
**Fase:** Sprint 2 - Core de Negocio (MembershipPlan Context) y Setup Frontend PWA.
**Resumen:** Implementación completa del dominio e infraestructura de `membership-service`, reglas de negocio de validación y renovación, configuración del Frontend PWA con diseño premium, e integración de la UI con el backend de autenticación y membresías.

## Plan de Desarrollo (Roadmap)

### Sprint 0: Configuración Inicial del Ecosistema e Infraestructura Global
- [x] **Actividad 0.1**: Definición del mapa de estructura de carpetas DDD y configuración de variables de entorno globales.
- [x] **Actividad 0.2**: Creación de `docker-compose.yml` base, aislamiento de redes y volúmenes persistentes.

### Sprint 1: Identity & Access Context con Express
- [x] **Actividad 1.1**: Implementación de la estructura interna de `auth-service` y configuración de Dockerfile.
- [x] **Actividad 1.2**: Implementación de la capa de Dominio (VOs, Entidades y Agregados de Usuario y Rol).
- [x] **Actividad 1.3**: Desarrollo de `AuthService` y `AuthorizationService` (JWT, Hashing).
- [x] **Actividad 1.4**: Construcción de la capa de Infraestructura y Aplicación (Controladores, Repositorios, Rutas).

### Sprint 2: Core de Negocio (MembershipPlan Context) y Setup Frontend PWA
- [x] **Actividad 2.1**: Implementación de `membership-service` (Dominio e Infraestructura: Membership, Subscription, Money, Days, Status VOs, Repositorios, Controladores, Rutas).
- [x] **Actividad 2.2**: Reglas de negocio en `MembershipValidationService` y `SubscriptionRenewalService`.
- [x] **Actividad 2.3**: Configuración inicial de Frontend PWA (Maquetación premium minimalista, fondo blanco, tipografía Inter, manifest.json, Service Worker).
- [x] **Actividad 2.4**: Integración UI de la PWA con backend (Login, Registro, Dashboard de Membresías, Tarjetas de Planes, Suscripción interactiva).

### Sprint 3: Gestión Operativa (Activity Context y Agendamiento)
- [ ] **Actividad 3.1**: Implementación de `activity-service` (GymClass, Routine, Schedule).
- [ ] **Actividad 3.2**: Desarrollo de `ClassSchedulingService` (Validación de horarios y cupos).
- [ ] **Actividad 3.3**: Desarrollo de `RoutineAssignmentService` (Asignación de rutinas).
- [ ] **Actividad 3.4**: Interfaz de usuario de calendario interactivo y rutinas en PWA.

### Sprint 4: Resiliencia Offline y Notification Context
- [ ] **Actividad 4.1**: Optimización de Service Worker (Strategies de caché, IndexedDB).
- [ ] **Actividad 4.2**: Implementación de Background Sync para operaciones offline.
- [ ] **Actividad 4.3**: Implementación de `notification-service` (Dominio e Infraestructura).
- [ ] **Actividad 4.4**: Programación de `NotificationService` con Web Push y diseño de banners UI.

### Sprint 5: Auditoría, Analítica y Cierre del Ecosistema (Reporting Context)
- [ ] **Actividad 5.1**: Middlewares de captura de eventos para `AuditLog`.
- [ ] **Actividad 5.2**: Implementación de `reporting-service` y `ReportGenerationService`.
- [ ] **Actividad 5.3**: Diseño y desarrollo del Dashboard Analítico premium en la PWA.
- [ ] **Actividad 5.4**: Orquestación final, pruebas E2E y validación de Bounded Contexts.

## Bitácora de Actividades
*2026-06-02*
- [x] **Actividad 0.1**: Reestructuración completa a arquitectura multi-bounded context (DDD) y consolidación de `.env` global.
- [x] **Actividad 0.2**: Configuración de `docker-compose.yml` y `docker-compose.dev.yml` con aislamiento de red y persistencia de DBs.
- [x] **Actividad 1.1**: Implementación de la infraestructura base de `auth-service`.
- [x] **Actividad 1.2**: Implementación de la capa de dominio del `auth-service` (Value Objects y Entidades auto-validadas).
- [x] **Actividad 1.3**: Implementación de `AuthService` (bcrypt + JWT) y `AuthorizationService` (RBAC).
- [x] **Actividad 1.4**: Construcción de la API REST funcional de `auth-service` (Register, Login, Health).
- [x] **Actividad 2.1**: Implementación de `membership-service` con arquitectura DDD completa.
- [x] **Actividad 2.2**: Implementación de `MembershipValidationService` y `SubscriptionRenewalService`.
- [x] **Actividad 2.3**: Configuración inicial del Frontend PWA con diseño premium.
- [x] **Actividad 2.4**: Integración UI/UX completa (Login, Registro, Dashboard de Membresías, Tarjetas de Planes, Suscripción interactiva, Navegación SPA, Cierre de sesión).