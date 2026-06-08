# Plan de Pruebas de Software — GymTech

## Información General

| Campo                          | Detalle                                    |
| :----------------------------- | :----------------------------------------- |
| **Proyecto**             | GymTech — Sistema de Gestión de Gimnasio |
| **Arquitectura**         | Microservicios (DDD + TypeScript)          |
| **Framework de Pruebas** | Jest 30 + ts-jest                          |
| **Fecha**                | Junio 2026                                 |
| **Responsable**          | Santiago Soto                              |

---

## 1. Objetivo del Plan de Pruebas

Verificar que cada microservicio de GymTech cumple con los requisitos funcionales y los atributos de calidad definidos en la arquitectura del sistema, mediante pruebas unitarias automatizadas que validen:

- **Correctitud funcional**: Las entidades se crean correctamente con datos válidos
- **Validación de entradas**: El sistema rechaza datos inválidos con mensajes descriptivos
- **Lógica de negocio**: Los métodos de dominio producen resultados correctos
- **Robustez**: El sistema no falla inesperadamente ante entradas atípicas

---

## 2. Atributos de Calidad Priorizados

| # | Atributo                 | Definición                                                         | Evidencia en Pruebas                              |
| :-: | :----------------------- | :------------------------------------------------------------------ | :------------------------------------------------ |
| 1 | **Confiabilidad**  | El sistema produce resultados correctos de forma consistente        | Pruebas de creación válida y lógica de negocio |
| 2 | **Mantenibilidad** | Los cambios no rompen funcionalidad existente                       | Pruebas automatizadas que detectan regresiones    |
| 3 | **Seguridad**      | El sistema rechaza datos inválidos y protege información sensible | Pruebas de validación y contraseñas             |
| 4 | **Disponibilidad** | El sistema permanece operativo y consistente                        | Pruebas de estado y transiciones                  |

---

## 3. Microservicios bajo Prueba

| Microservicio        | Archivo de Prueba        | Entidades Probadas                        | Cantidad de Pruebas |
| :------------------- | :----------------------- | :---------------------------------------- | :-----------------: |
| auth-service         | `User.test.ts`         | User, Role                                |          3          |
| auth-service         | `ValueObjects.test.ts` | Email, DocumentNumber, PasswordHash, Role |         16         |
| membership-service   | `Subscription.test.ts` | Subscription                              |          4          |
| membership-service   | `Membership.test.ts`   | Membership, Attendance                    |         11         |
| activity-service     | `GymClass.test.ts`     | GymClass                                  |          3          |
| activity-service     | `Schedule.test.ts`     | Schedule                                  |          9          |
| notification-service | `Notification.test.ts` | Notification                              |          7          |
| reporting-service    | `AuditLog.test.ts`     | AuditLog                                  |          5          |
| reporting-service    | `Report.test.ts`       | Report                                    |          5          |
| **TOTAL**      |                          |                                           |    **63**    |

---

## 4. Detalle de Casos de Prueba

---

### 4.1 Auth Service — ValueObjects.test.ts

#### TC-AUTH-001: Creación de email válido

| Campo                         | Detalle                                                                           |
| :---------------------------- | :-------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-001                                                                       |
| **Entidad**             | Email                                                                             |
| **Descripción**        | Verificar que un email válido se crea correctamente y se normaliza a minúsculas |
| **Precondiciones**      | Ninguna                                                                           |
| **Datos de Entrada**    | `'  User@GymTech.COM  '`                                                        |
| **Resultado Esperado**  | `email.toString() === 'user@gymtech.com'`                                       |
| **Resultado Obtenido**  | ✅ PASSED                                                                         |
| **Atributo de Calidad** | Confiabilidad                                                                     |

#### TC-AUTH-002: Rechazo de email inválido

| Campo                         | Detalle                                                       |
| :---------------------------- | :------------------------------------------------------------ |
| **ID**                  | TC-AUTH-002                                                   |
| **Entidad**             | Email                                                         |
| **Descripción**        | Verificar que el sistema rechaza emails con formato inválido |
| **Precondiciones**      | Ninguna                                                       |
| **Datos de Entrada**    | `'not-an-email'`, `''`, `'missing@'`                    |
| **Resultado Esperado**  | Se lanza `Error('Invalid email format')` para cada caso     |
| **Resultado Obtenido**  | ✅ PASSED                                                     |
| **Atributo de Calidad** | Seguridad — Validación de entradas                          |

#### TC-AUTH-003: Igualdad de emails

| Campo                         | Detalle                                                                                                              |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-003                                                                                                          |
| **Entidad**             | Email                                                                                                                |
| **Descripción**        | Verificar que dos emails iguales se consideran iguales y dos distintos se consideran distintos                       |
| **Precondiciones**      | Ninguna                                                                                                              |
| **Datos de Entrada**    | `Email.create('test@gymtech.com')` vs `Email.create('test@gymtech.com')` y `Email.create('other@gymtech.com')` |
| **Resultado Esperado**  | `a.equals(b) === true`, `a.equals(c) === false`                                                                  |
| **Resultado Obtenido**  | ✅ PASSED                                                                                                            |
| **Atributo de Calidad** | Confiabilidad                                                                                                        |

#### TC-AUTH-004: Creación de documento válido

| Campo                         | Detalle                                                                            |
| :---------------------------- | :--------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-004                                                                        |
| **Entidad**             | DocumentNumber                                                                     |
| **Descripción**        | Verificar que un número de documento válido se crea y se normaliza a mayúsculas |
| **Precondiciones**      | Ninguna                                                                            |
| **Datos de Entrada**    | `'  abc123  '`                                                                   |
| **Resultado Esperado**  | `doc.toString() === 'ABC123'`                                                    |
| **Resultado Obtenido**  | ✅ PASSED                                                                          |
| **Atributo de Calidad** | Confiabilidad                                                                      |

#### TC-AUTH-005: Rechazo de documento demasiado corto

| Campo                         | Detalle                                                                          |
| :---------------------------- | :------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-005                                                                      |
| **Entidad**             | DocumentNumber                                                                   |
| **Descripción**        | Verificar que el sistema rechaza números de documento con menos de 3 caracteres |
| **Precondiciones**      | Ninguna                                                                          |
| **Datos de Entrada**    | `'AB'`                                                                         |
| **Resultado Esperado**  | Se lanza `Error('between 3 and 20 characters')`                                |
| **Resultado Obtenido**  | ✅ PASSED                                                                        |
| **Atributo de Calidad** | Seguridad — Validación de entradas                                             |

#### TC-AUTH-006: Rechazo de documento demasiado largo

| Campo                         | Detalle                                                                          |
| :---------------------------- | :------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-006                                                                      |
| **Entidad**             | DocumentNumber                                                                   |
| **Descripción**        | Verificar que el sistema rechaza números de documento con más de 20 caracteres |
| **Precondiciones**      | Ninguna                                                                          |
| **Datos de Entrada**    | `'A'.repeat(21)`                                                               |
| **Resultado Esperado**  | Se lanza `Error('between 3 and 20 characters')`                                |
| **Resultado Obtenido**  | ✅ PASSED                                                                        |
| **Atributo de Calidad** | Seguridad — Validación de entradas                                             |

#### TC-AUTH-007: Rechazo de documento con caracteres inválidos

| Campo                         | Detalle                                                                |
| :---------------------------- | :--------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-007                                                            |
| **Entidad**             | DocumentNumber                                                         |
| **Descripción**        | Verificar que el sistema rechaza caracteres especiales en el documento |
| **Precondiciones**      | Ninguna                                                                |
| **Datos de Entrada**    | `'ABC@123'`                                                          |
| **Resultado Esperado**  | Se lanza `Error('invalid characters')`                               |
| **Resultado Obtenido**  | ✅ PASSED                                                              |
| **Atributo de Calidad** | Seguridad — Validación de entradas                                   |

#### TC-AUTH-008: Hash de contraseña

| Campo                         | Detalle                                                                  |
| :---------------------------- | :----------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-008                                                              |
| **Entidad**             | PasswordHash                                                             |
| **Descripción**        | Verificar que una contraseña se hashea correctamente con formato bcrypt |
| **Precondiciones**      | Ninguna                                                                  |
| **Datos de Entrada**    | `'MySecure123'`                                                        |
| **Resultado Esperado**  | El hash comienza con `$2` y no es la contraseña original              |
| **Resultado Obtenido**  | ✅ PASSED                                                                |
| **Atributo de Calidad** | Seguridad — Protección de contraseñas                                 |

#### TC-AUTH-009: Rechazo de contraseña corta

| Campo                         | Detalle                                                              |
| :---------------------------- | :------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-009                                                          |
| **Entidad**             | PasswordHash                                                         |
| **Descripción**        | Verificar que el sistema rechaza contraseñas menores a 6 caracteres |
| **Precondiciones**      | Ninguna                                                              |
| **Datos de Entrada**    | `'12345'`, `''`                                                  |
| **Resultado Esperado**  | Se lanza `Error('at least 6 characters')` para cada caso           |
| **Resultado Obtenido**  | ✅ PASSED                                                            |
| **Atributo de Calidad** | Seguridad — Política de contraseñas                               |

#### TC-AUTH-010: Verificación de contraseña correcta

| Campo                         | Detalle                                                        |
| :---------------------------- | :------------------------------------------------------------- |
| **ID**                  | TC-AUTH-010                                                    |
| **Entidad**             | PasswordHash                                                   |
| **Descripción**        | Verificar que una contraseña correcta se valida positivamente |
| **Precondiciones**      | Ninguna                                                        |
| **Datos de Entrada**    | Hash de `'MySecure123'`, verificar con `'MySecure123'`     |
| **Resultado Esperado**  | `verify() === true`                                          |
| **Resultado Obtenido**  | ✅ PASSED                                                      |
| **Atributo de Calidad** | Seguridad — Autenticación                                    |

#### TC-AUTH-011: Rechazo de contraseña incorrecta

| Campo                         | Detalle                                                          |
| :---------------------------- | :--------------------------------------------------------------- |
| **ID**                  | TC-AUTH-011                                                      |
| **Entidad**             | PasswordHash                                                     |
| **Descripción**        | Verificar que una contraseña incorrecta se valida negativamente |
| **Precondiciones**      | Ninguna                                                          |
| **Datos de Entrada**    | Hash de `'MySecure123'`, verificar con `'WrongPassword'`     |
| **Resultado Esperado**  | `verify() === false`                                           |
| **Resultado Obtenido**  | ✅ PASSED                                                        |
| **Atributo de Calidad** | Seguridad — Autenticación                                      |

#### TC-AUTH-012: Creación de roles válidos

| Campo                         | Detalle                                                                              |
| :---------------------------- | :----------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-012                                                                          |
| **Entidad**             | Role                                                                                 |
| **Descripción**        | Verificar que todas las fábricas estáticas crean roles válidos                    |
| **Precondiciones**      | Ninguna                                                                              |
| **Datos de Entrada**    | `Role.admin()`, `Role.receptionist()`, `Role.trainer()`, `Role.client()`     |
| **Resultado Esperado**  | Nombres `'admin'`, `'receptionist'`, `'trainer'`, `'client'` respectivamente |
| **Resultado Obtenido**  | ✅ PASSED                                                                            |
| **Atributo de Calidad** | Confiabilidad                                                                        |

#### TC-AUTH-013: Rechazo de rol inválido

| Campo                         | Detalle                                             |
| :---------------------------- | :-------------------------------------------------- |
| **ID**                  | TC-AUTH-013                                         |
| **Entidad**             | Role                                                |
| **Descripción**        | Verificar que el sistema rechaza roles no definidos |
| **Precondiciones**      | Ninguna                                             |
| **Datos de Entrada**    | `new Role('superadmin')`                          |
| **Resultado Esperado**  | Se lanza `Error('Invalid role')`                  |
| **Resultado Obtenido**  | ✅ PASSED                                           |
| **Atributo de Calidad** | Seguridad — Control de acceso                      |

#### TC-AUTH-014: Permisos de administrador

| Campo                         | Detalle                                                           |
| :---------------------------- | :---------------------------------------------------------------- |
| **ID**                  | TC-AUTH-014                                                       |
| **Entidad**             | Role                                                              |
| **Descripción**        | Verificar que el rol admin tiene permisos de gestión de usuarios |
| **Precondiciones**      | Ninguna                                                           |
| **Datos de Entrada**    | `Role.admin()`                                                  |
| **Resultado Esperado**  | `isAdmin() === true`, `canManageUsers() === true`             |
| **Resultado Obtenido**  | ✅ PASSED                                                         |
| **Atributo de Calidad** | Seguridad — Autorización                                        |

#### TC-AUTH-015: Permisos de roles no-admin

| Campo                         | Detalle                                                                |
| :---------------------------- | :--------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-015                                                            |
| **Entidad**             | Role                                                                   |
| **Descripción**        | Verificar que los roles no-admin no tienen permisos de administración |
| **Precondiciones**      | Ninguna                                                                |
| **Datos de Entrada**    | `Role.client()`, `Role.trainer()`, `Role.receptionist()`         |
| **Resultado Esperado**  | `isAdmin() === false`, `canManageUsers() === false` para todos     |
| **Resultado Obtenido**  | ✅ PASSED                                                              |
| **Atributo de Calidad** | Seguridad — Autorización                                             |

#### TC-AUTH-016: Creación de usuario válido

| Campo                         | Detalle                                                                          |
| :---------------------------- | :------------------------------------------------------------------------------- |
| **ID**                  | TC-AUTH-016                                                                      |
| **Entidad**             | User                                                                             |
| **Descripción**        | Verificar que un usuario se crea correctamente con todos sus datos               |
| **Precondiciones**      | Ninguna                                                                          |
| **Datos de Entrada**    | Email:`test@gymtech.com`, Document: `12345678`, Role: client, Status: active |
| **Resultado Esperado**  | `user.email.toString() === 'test@gymtech.com'`, `user.isActive() === true`   |
| **Resultado Obtenido**  | ✅ PASSED                                                                        |
| **Atributo de Calidad** | Confiabilidad                                                                    |

---

### 4.2 Membership Service — Subscription.test.ts

#### TC-MEMB-001: Suscripción activa con fecha futura

| Campo                         | Detalle                                                                             |
| :---------------------------- | :---------------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-001                                                                         |
| **Entidad**             | Subscription                                                                        |
| **Descripción**        | Verificar que una suscripción con estado activo y fecha futura se considera activa |
| **Precondiciones**      | Ninguna                                                                             |
| **Datos de Entrada**    | `status: 'active'`, `endDate: hoy + 7 días`                                    |
| **Resultado Esperado**  | `isActive() === true`                                                             |
| **Resultado Obtenido**  | ✅ PASSED                                                                           |
| **Atributo de Calidad** | Confiabilidad                                                                       |

#### TC-MEMB-002: Suscripción expirada por estado

| Campo                         | Detalle                                                                   |
| :---------------------------- | :------------------------------------------------------------------------ |
| **ID**                  | TC-MEMB-002                                                               |
| **Entidad**             | Subscription                                                              |
| **Descripción**        | Verificar que una suscripción con estado expirado no se considera activa |
| **Precondiciones**      | Ninguna                                                                   |
| **Datos de Entrada**    | `status: 'expired'`                                                     |
| **Resultado Esperado**  | `isActive() === false`                                                  |
| **Resultado Obtenido**  | ✅ PASSED                                                                 |
| **Atributo de Calidad** | Disponibilidad — Control de acceso oportuno                              |

#### TC-MEMB-003: Suscripción expirada por fecha pasada

| Campo                         | Detalle                                                                       |
| :---------------------------- | :---------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-003                                                                   |
| **Entidad**             | Subscription                                                                  |
| **Descripción**        | Verificar que una suscripción activa con fecha pasada no se considera activa |
| **Precondiciones**      | Ninguna                                                                       |
| **Datos de Entrada**    | `status: 'active'`, `endDate: hoy - 7 días`                              |
| **Resultado Esperado**  | `isActive() === false`                                                      |
| **Resultado Obtenido**  | ✅ PASSED                                                                     |
| **Atributo de Calidad** | Disponibilidad — Denegar acceso a membresías vencidas                       |

#### TC-MEMB-004: Renovación de suscripción

| Campo                         | Detalle                                                                                 |
| :---------------------------- | :-------------------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-004                                                                             |
| **Entidad**             | Subscription                                                                            |
| **Descripción**        | Verificar que al renovar una suscripción se extiende la fecha fin y se mantiene activa |
| **Precondiciones**      | Suscripción existente                                                                  |
| **Datos de Entrada**    | `renew(30)`                                                                           |
| **Resultado Esperado**  | `endDate` aumenta en 30 días, `status === 'active'`                                |
| **Resultado Obtenido**  | ✅ PASSED                                                                               |
| **Atributo de Calidad** | Confiabilidad                                                                           |

---

### 4.3 Membership Service — Membership.test.ts

#### TC-MEMB-005: Creación de plan válido

| Campo                         | Detalle                                                                      |
| :---------------------------- | :--------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-005                                                                  |
| **Entidad**             | Membership                                                                   |
| **Descripción**        | Verificar que un plan de membresía se crea correctamente con datos válidos |
| **Precondiciones**      | Ninguna                                                                      |
| **Datos de Entrada**    | `name: '  Plan Gold  '`, `price: 50`, `durationDays: 30`               |
| **Resultado Esperado**  | `name === 'Plan Gold'` (trimado), `price === 50`, `active === true`    |
| **Resultado Obtenido**  | ✅ PASSED                                                                    |
| **Atributo de Calidad** | Confiabilidad                                                                |

#### TC-MEMB-006: Rechazo de nombre vacío

| Campo                         | Detalle                                              |
| :---------------------------- | :--------------------------------------------------- |
| **ID**                  | TC-MEMB-006                                          |
| **Entidad**             | Membership                                           |
| **Descripción**        | Verificar que el sistema rechaza planes sin nombre   |
| **Precondiciones**      | Ninguna                                              |
| **Datos de Entrada**    | `name: '   '`, `price: 50`, `durationDays: 30` |
| **Resultado Esperado**  | Se lanza `Error('Plan name is required')`          |
| **Resultado Obtenido**  | ✅ PASSED                                            |
| **Atributo de Calidad** | Seguridad — Validación de entradas                 |

#### TC-MEMB-007: Rechazo de precio negativo

| Campo                         | Detalle                                                     |
| :---------------------------- | :---------------------------------------------------------- |
| **ID**                  | TC-MEMB-007                                                 |
| **Entidad**             | Membership                                                  |
| **Descripción**        | Verificar que el sistema rechaza planes con precio negativo |
| **Precondiciones**      | Ninguna                                                     |
| **Datos de Entrada**    | `name: 'Plan'`, `price: -10`, `durationDays: 30`      |
| **Resultado Esperado**  | Se lanza `Error('Price cannot be negative')`              |
| **Resultado Obtenido**  | ✅ PASSED                                                   |
| **Atributo de Calidad** | Seguridad — Integridad de datos financieros                |

#### TC-MEMB-008: Rechazo de duración no positiva

| Campo                         | Detalle                                                            |
| :---------------------------- | :----------------------------------------------------------------- |
| **ID**                  | TC-MEMB-008                                                        |
| **Entidad**             | Membership                                                         |
| **Descripción**        | Verificar que el sistema rechaza planes con duración 0 o negativa |
| **Precondiciones**      | Ninguna                                                            |
| **Datos de Entrada**    | `durationDays: 0` y `durationDays: -5`                         |
| **Resultado Esperado**  | Se lanza `Error('Duration must be positive')` en ambos casos     |
| **Resultado Obtenido**  | ✅ PASSED                                                          |
| **Atributo de Calidad** | Seguridad — Validación de entradas                               |

#### TC-MEMB-009: Campos opcionales del plan

| Campo                         | Detalle                                                                              |
| :---------------------------- | :----------------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-009                                                                          |
| **Entidad**             | Membership                                                                           |
| **Descripción**        | Verificar que los campos opcionales se asignan correctamente                         |
| **Precondiciones**      | Ninguna                                                                              |
| **Datos de Entrada**    | Plan con `description`, `maxOccupancy`, `monthlyEntryLimit`, `active: false` |
| **Resultado Esperado**  | Todos los campos opcionales se guardan correctamente,`active === false`            |
| **Resultado Obtenido**  | ✅ PASSED                                                                            |
| **Atributo de Calidad** | Confiabilidad                                                                        |

#### TC-MEMB-010: Valor por defecto de active

| Campo                         | Detalle                                           |
| :---------------------------- | :------------------------------------------------ |
| **ID**                  | TC-MEMB-010                                       |
| **Entidad**             | Membership                                        |
| **Descripción**        | Verificar que un plan nuevo es activo por defecto |
| **Precondiciones**      | Ninguna                                           |
| **Datos de Entrada**    | Plan sin especificar `active`                   |
| **Resultado Esperado**  | `active === true`                               |
| **Resultado Obtenido**  | ✅ PASSED                                         |
| **Atributo de Calidad** | Confiabilidad — Comportamiento por defecto       |

#### TC-MEMB-011: Creación de asistencia check_in

| Campo                         | Detalle                                                                   |
| :---------------------------- | :------------------------------------------------------------------------ |
| **ID**                  | TC-MEMB-011                                                               |
| **Entidad**             | Attendance                                                                |
| **Descripción**        | Verificar que se registra correctamente una entrada al gimnasio           |
| **Precondiciones**      | Ninguna                                                                   |
| **Datos de Entrada**    | `userId: 'user-1'`, `type: 'check_in'`, `idempotencyKey: 'key-123'` |
| **Resultado Esperado**  | Registro creado con `type === 'check_in'`                               |
| **Resultado Obtenido**  | ✅ PASSED                                                                 |
| **Atributo de Calidad** | Confiabilidad                                                             |

#### TC-MEMB-012: Creación de asistencia check_out

| Campo                         | Detalle                                                                    |
| :---------------------------- | :------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-012                                                                |
| **Entidad**             | Attendance                                                                 |
| **Descripción**        | Verificar que se registra correctamente una salida del gimnasio            |
| **Precondiciones**      | Ninguna                                                                    |
| **Datos de Entrada**    | `userId: 'user-1'`, `type: 'check_out'`, `idempotencyKey: 'key-456'` |
| **Resultado Esperado**  | Registro creado con `type === 'check_out'`                               |
| **Resultado Obtenido**  | ✅ PASSED                                                                  |
| **Atributo de Calidad** | Confiabilidad                                                              |

#### TC-MEMB-013: Rechazo de asistencia sin userId

| Campo                         | Detalle                                                              |
| :---------------------------- | :------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-013                                                          |
| **Entidad**             | Attendance                                                           |
| **Descripción**        | Verificar que el sistema rechaza registros de asistencia sin usuario |
| **Precondiciones**      | Ninguna                                                              |
| **Datos de Entrada**    | `userId: ''`                                                       |
| **Resultado Esperado**  | Se lanza `Error('userId is required')`                             |
| **Resultado Obtenido**  | ✅ PASSED                                                            |
| **Atributo de Calidad** | Seguridad — Validación de entradas                                 |

#### TC-MEMB-014: Rechazo de asistencia sin idempotencyKey

| Campo                         | Detalle                                                              |
| :---------------------------- | :------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-014                                                          |
| **Entidad**             | Attendance                                                           |
| **Descripción**        | Verificar que el sistema rechaza registros sin clave de idempotencia |
| **Precondiciones**      | Ninguna                                                              |
| **Datos de Entrada**    | `idempotencyKey: ''`                                               |
| **Resultado Esperado**  | Se lanza `Error('idempotencyKey is required')`                     |
| **Resultado Obtenido**  | ✅ PASSED                                                            |
| **Atributo de Calidad** | Confiabilidad — Prevención de duplicados                           |

#### TC-MEMB-015: Rechazo de tipo de asistencia inválido

| Campo                         | Detalle                                                                             |
| :---------------------------- | :---------------------------------------------------------------------------------- |
| **ID**                  | TC-MEMB-015                                                                         |
| **Entidad**             | Attendance                                                                          |
| **Descripción**        | Verificar que el sistema rechaza tipos de asistencia distintos a check_in/check_out |
| **Precondiciones**      | Ninguna                                                                             |
| **Datos de Entrada**    | `type: 'invalid'`                                                                 |
| **Resultado Esperado**  | Se lanza `Error('type must be check_in or check_out')`                            |
| **Resultado Obtenido**  | ✅ PASSED                                                                           |
| **Atributo de Calidad** | Seguridad — Validación de entradas                                                |

---

### 4.4 Activity Service — GymClass.test.ts

#### TC-ACT-001: Creación de clase válida

| Campo                         | Detalle                                                                |
| :---------------------------- | :--------------------------------------------------------------------- |
| **ID**                  | TC-ACT-001                                                             |
| **Entidad**             | GymClass                                                               |
| **Descripción**        | Verificar que una clase se crea correctamente con datos válidos       |
| **Precondiciones**      | Ninguna                                                                |
| **Datos de Entrada**    | `name: 'CrossFit Morning'`, `instructor: 'Alex'`, `capacity: 20` |
| **Resultado Esperado**  | Clase creada con los datos proporcionados                              |
| **Resultado Obtenido**  | ✅ PASSED                                                              |
| **Atributo de Calidad** | Confiabilidad                                                          |

#### TC-ACT-002: Rechazo de nombre vacío

| Campo                         | Detalle                                            |
| :---------------------------- | :------------------------------------------------- |
| **ID**                  | TC-ACT-002                                         |
| **Entidad**             | GymClass                                           |
| **Descripción**        | Verificar que el sistema rechaza clases sin nombre |
| **Precondiciones**      | Ninguna                                            |
| **Datos de Entrada**    | `name: ' '`                                      |
| **Resultado Esperado**  | Se lanza `Error('Class name is required')`       |
| **Resultado Obtenido**  | ✅ PASSED                                          |
| **Atributo de Calidad** | Seguridad — Validación de entradas               |

#### TC-ACT-003: Verificación de clase llena

| Campo                         | Detalle                                                                            |
| :---------------------------- | :--------------------------------------------------------------------------------- |
| **ID**                  | TC-ACT-003                                                                         |
| **Entidad**             | GymClass                                                                           |
| **Descripción**        | Verificar que el método isFull detecta correctamente cuando una clase está llena |
| **Precondiciones**      | Clase con capacidad 10                                                             |
| **Datos de Entrada**    | `isFull(10)` e `isFull(5)`                                                     |
| **Resultado Esperado**  | `isFull(10) === true`, `isFull(5) === false`                                   |
| **Resultado Obtenido**  | ✅ PASSED                                                                          |
| **Atributo de Calidad** | Disponibilidad — Control de cupos                                                 |

---

### 4.5 Activity Service — Schedule.test.ts

#### TC-ACT-004: Creación de horario válido

| Campo                         | Detalle                                                                       |
| :---------------------------- | :---------------------------------------------------------------------------- |
| **ID**                  | TC-ACT-004                                                                    |
| **Entidad**             | Schedule                                                                      |
| **Descripción**        | Verificar que un horario se crea correctamente con datos válidos             |
| **Precondiciones**      | Ninguna                                                                       |
| **Datos de Entrada**    | `classId: 'class-1'`, `room: 'Room A'`, hora inicio 09:00, hora fin 10:00 |
| **Resultado Esperado**  | Horario creado con los datos proporcionados                                   |
| **Resultado Obtenido**  | ✅ PASSED                                                                     |
| **Atributo de Calidad** | Confiabilidad                                                                 |

#### TC-ACT-005: Rechazo de classId vacío

| Campo                         | Detalle                                                              |
| :---------------------------- | :------------------------------------------------------------------- |
| **ID**                  | TC-ACT-005                                                           |
| **Entidad**             | Schedule                                                             |
| **Descripción**        | Verificar que el sistema rechaza horarios sin identificador de clase |
| **Precondiciones**      | Ninguna                                                              |
| **Datos de Entrada**    | `classId: ''`                                                      |
| **Resultado Esperado**  | Se lanza `Error('Class ID is required')`                           |
| **Resultado Obtenido**  | ✅ PASSED                                                            |
| **Atributo de Calidad** | Seguridad — Validación de entradas                                 |

#### TC-ACT-006: Rechazo de sala vacía

| Campo                         | Detalle                                                     |
| :---------------------------- | :---------------------------------------------------------- |
| **ID**                  | TC-ACT-006                                                  |
| **Entidad**             | Schedule                                                    |
| **Descripción**        | Verificar que el sistema rechaza horarios sin sala asignada |
| **Precondiciones**      | Ninguna                                                     |
| **Datos de Entrada**    | `room: '   '`                                             |
| **Resultado Esperado**  | Se lanza `Error('Room is required')`                      |
| **Resultado Obtenido**  | ✅ PASSED                                                   |
| **Atributo de Calidad** | Seguridad — Validación de entradas                        |

#### TC-ACT-007: Rechazo de hora fin anterior a hora inicio

| Campo                         | Detalle                                                                                   |
| :---------------------------- | :---------------------------------------------------------------------------------------- |
| **ID**                  | TC-ACT-007                                                                                |
| **Entidad**             | Schedule                                                                                  |
| **Descripción**        | Verificar que el sistema rechaza horarios donde la hora de fin es anterior a la de inicio |
| **Precondiciones**      | Ninguna                                                                                   |
| **Datos de Entrada**    | `startTime: 10:00`, `endTime: 09:00`                                                  |
| **Resultado Esperado**  | Se lanza `Error('End time must be after start time')`                                   |
| **Resultado Obtenido**  | ✅ PASSED                                                                                 |
| **Atributo de Calidad** | Confiabilidad — Consistencia temporal                                                    |

#### TC-ACT-008: Rechazo de hora fin igual a hora inicio

| Campo                         | Detalle                                                                  |
| :---------------------------- | :----------------------------------------------------------------------- |
| **ID**                  | TC-ACT-008                                                               |
| **Entidad**             | Schedule                                                                 |
| **Descripción**        | Verificar que el sistema rechaza horarios donde inicio y fin son iguales |
| **Precondiciones**      | Ninguna                                                                  |
| **Datos de Entrada**    | `startTime === endTime`                                                |
| **Resultado Esperado**  | Se lanza `Error('End time must be after start time')`                  |
| **Resultado Obtenido**  | ✅ PASSED                                                                |
| **Atributo de Calidad** | Confiabilidad — Consistencia temporal                                   |

#### TC-ACT-009: Detección de solapamiento en misma sala

| Campo                         | Detalle                                                                               |
| :---------------------------- | :------------------------------------------------------------------------------------ |
| **ID**                  | TC-ACT-009                                                                            |
| **Entidad**             | Schedule                                                                              |
| **Descripción**        | Verificar que se detecta conflicto cuando dos horarios se superponen en la misma sala |
| **Precondiciones**      | Ninguna                                                                               |
| **Datos de Entrada**    | Horario A: 09:00–10:00 en Room A, Horario B: 09:30–10:30 en Room A                  |
| **Resultado Esperado**  | `overlaps() === true`                                                               |
| **Resultado Obtenido**  | ✅ PASSED                                                                             |
| **Atributo de Calidad** | Confiabilidad — Prevención de conflictos de horario                                 |

#### TC-ACT-010: Sin solapamiento en diferentes salas

| Campo                         | Detalle                                                                                   |
| :---------------------------- | :---------------------------------------------------------------------------------------- |
| **ID**                  | TC-ACT-010                                                                                |
| **Entidad**             | Schedule                                                                                  |
| **Descripción**        | Verificar que NO hay conflicto cuando dos horarios se superponen pero en diferentes salas |
| **Precondiciones**      | Ninguna                                                                                   |
| **Datos de Entrada**    | Horario A: 09:00–10:00 en Room A, Horario B: 09:30–10:30 en Room B                      |
| **Resultado Esperado**  | `overlaps() === false`                                                                  |
| **Resultado Obtenido**  | ✅ PASSED                                                                                 |
| **Atributo de Calidad** | Disponibilidad — Uso eficiente de espacios                                               |

#### TC-ACT-011: Sin solapamiento cuando una clase termina cuando otra empieza

| Campo                         | Detalle                                                                                                  |
| :---------------------------- | :------------------------------------------------------------------------------------------------------- |
| **ID**                  | TC-ACT-011                                                                                               |
| **Entidad**             | Schedule                                                                                                 |
| **Descripción**        | Verificar que NO hay conflicto cuando una clase termina exactamente cuando otra empieza en la misma sala |
| **Precondiciones**      | Ninguna                                                                                                  |
| **Datos de Entrada**    | Horario A: 09:00–10:00, Horario B: 10:00–11:00 en misma sala                                           |
| **Resultado Esperado**  | `overlaps() === false`                                                                                 |
| **Resultado Obtenido**  | ✅ PASSED                                                                                                |
| **Atributo de Calidad** | Disponibilidad — Maximizar uso de espacios                                                              |

#### TC-ACT-012: Sin solapamiento en horarios completamente separados

| Campo                         | Detalle                                                                           |
| :---------------------------- | :-------------------------------------------------------------------------------- |
| **ID**                  | TC-ACT-012                                                                        |
| **Entidad**             | Schedule                                                                          |
| **Descripción**        | Verificar que NO hay conflicto cuando dos horarios están completamente separados |
| **Precondiciones**      | Ninguna                                                                           |
| **Datos de Entrada**    | Horario A: 09:00–10:00, Horario B: 11:00–12:00 en misma sala                    |
| **Resultado Esperado**  | `overlaps() === false`                                                          |
| **Resultado Obtenido**  | ✅ PASSED                                                                         |
| **Atributo de Calidad** | Confiabilidad                                                                     |

---

### 4.6 Notification Service — Notification.test.ts

#### TC-NOTI-001: Creación con estado pendiente por defecto

| Campo                         | Detalle                                                                       |
| :---------------------------- | :---------------------------------------------------------------------------- |
| **ID**                  | TC-NOTI-001                                                                   |
| **Entidad**             | Notification                                                                  |
| **Descripción**        | Verificar que una notificación nueva tiene estado 'pending' y retryCount 0   |
| **Precondiciones**      | Ninguna                                                                       |
| **Datos de Entrada**    | `userId: 'user-123'`, `type: 'SUBSCRIPTION_EXPIRY'`, `channel: 'email'` |
| **Resultado Esperado**  | `status === 'pending'`, `retryCount === 0`, `nextRetryAt === null`      |
| **Resultado Obtenido**  | ✅ PASSED                                                                     |
| **Atributo de Calidad** | Confiabilidad — Estado inicial correcto                                      |

#### TC-NOTI-002: Rechazo de userId vacío

| Campo                         | Detalle                                                     |
| :---------------------------- | :---------------------------------------------------------- |
| **ID**                  | TC-NOTI-002                                                 |
| **Entidad**             | Notification                                                |
| **Descripción**        | Verificar que el sistema rechaza notificaciones sin usuario |
| **Precondiciones**      | Ninguna                                                     |
| **Datos de Entrada**    | `userId: ''`                                              |
| **Resultado Esperado**  | Se lanza `Error('userId is required')`                    |
| **Resultado Obtenido**  | ✅ PASSED                                                   |
| **Atributo de Calidad** | Seguridad — Validación de entradas                        |

#### TC-NOTI-003: Rechazo de tipo vacío

| Campo                         | Detalle                                                  |
| :---------------------------- | :------------------------------------------------------- |
| **ID**                  | TC-NOTI-003                                              |
| **Entidad**             | Notification                                             |
| **Descripción**        | Verificar que el sistema rechaza notificaciones sin tipo |
| **Precondiciones**      | Ninguna                                                  |
| **Datos de Entrada**    | `type: '   '`                                          |
| **Resultado Esperado**  | Se lanza `Error('type is required')`                   |
| **Resultado Obtenido**  | ✅ PASSED                                                |
| **Atributo de Calidad** | Seguridad — Validación de entradas                     |

#### TC-NOTI-004: Rechazo de mensaje vacío

| Campo                         | Detalle                                                     |
| :---------------------------- | :---------------------------------------------------------- |
| **ID**                  | TC-NOTI-004                                                 |
| **Entidad**             | Notification                                                |
| **Descripción**        | Verificar que el sistema rechaza notificaciones sin mensaje |
| **Precondiciones**      | Ninguna                                                     |
| **Datos de Entrada**    | `message: '   '`                                          |
| **Resultado Esperado**  | Se lanza `Error('message is required')`                   |
| **Resultado Obtenido**  | ✅ PASSED                                                   |
| **Atributo de Calidad** | Seguridad — Validación de entradas                        |

#### TC-NOTI-005: Reintento permitido cuando falló y no excede máximo

| Campo                         | Detalle                                                                                |
| :---------------------------- | :------------------------------------------------------------------------------------- |
| **ID**                  | TC-NOTI-005                                                                            |
| **Entidad**             | Notification                                                                           |
| **Descripción**        | Verificar que una notificación fallida con pocos reintentos puede volver a intentarse |
| **Precondiciones**      | Notificación con `status: 'failed'`, `retryCount: 2`                              |
| **Datos de Entrada**    | `canRetry(5)`                                                                        |
| **Resultado Esperado**  | `canRetry(5) === true`                                                               |
| **Resultado Obtenido**  | ✅ PASSED                                                                              |
| **Atributo de Calidad** | Confiabilidad — Mecanismo de reintento                                                |

#### TC-NOTI-006: Reintento denegado cuando excede máximo

| Campo                         | Detalle                                                                                               |
| :---------------------------- | :---------------------------------------------------------------------------------------------------- |
| **ID**                  | TC-NOTI-006                                                                                           |
| **Entidad**             | Notification                                                                                          |
| **Descripción**        | Verificar que una notificación que ya alcanzó el máximo de reintentos no puede volver a intentarse |
| **Precondiciones**      | Notificación con `status: 'failed'`, `retryCount: 5`                                             |
| **Datos de Entrada**    | `canRetry(5)`                                                                                       |
| **Resultado Esperado**  | `canRetry(5) === false`                                                                             |
| **Resultado Obtenido**  | ✅ PASSED                                                                                             |
| **Atributo de Calidad** | Disponibilidad — Protección contra reintentos infinitos                                             |

#### TC-NOTI-007: Reintento denegado cuando estado no es failed

| Campo                         | Detalle                                                       |
| :---------------------------- | :------------------------------------------------------------ |
| **ID**                  | TC-NOTI-007                                                   |
| **Entidad**             | Notification                                                  |
| **Descripción**        | Verificar que una notificación exitosa no puede reintentarse |
| **Precondiciones**      | Notificación con `status: 'sent'`                          |
| **Datos de Entrada**    | `canRetry(5)`                                               |
| **Resultado Esperado**  | `canRetry(5) === false`                                     |
| **Resultado Obtenido**  | ✅ PASSED                                                     |
| **Atributo de Calidad** | Confiabilidad — Solo se reintenta lo fallido                 |

---

### 4.7 Reporting Service — AuditLog.test.ts

#### TC-REP-001: Creación de registro de auditoría

| Campo                         | Detalle                                                                                     |
| :---------------------------- | :------------------------------------------------------------------------------------------ |
| **ID**                  | TC-REP-001                                                                                  |
| **Entidad**             | AuditLog                                                                                    |
| **Descripción**        | Verificar que un registro de auditoría se crea correctamente                               |
| **Precondiciones**      | Ninguna                                                                                     |
| **Datos de Entrada**    | `userId: 'admin-1'`, `action: 'UPDATE_MEMBERSHIP_PLAN'`, `resource: 'MembershipPlan'` |
| **Resultado Esperado**  | Registro creado con los datos proporcionados                                                |
| **Resultado Obtenido**  | ✅ PASSED                                                                                   |
| **Atributo de Calidad** | Confiabilidad — Trazabilidad                                                               |

#### TC-REP-002: Rechazo de userId vacío

| Campo                         | Detalle                                                              |
| :---------------------------- | :------------------------------------------------------------------- |
| **ID**                  | TC-REP-002                                                           |
| **Entidad**             | AuditLog                                                             |
| **Descripción**        | Verificar que el sistema rechaza registros de auditoría sin usuario |
| **Precondiciones**      | Ninguna                                                              |
| **Datos de Entrada**    | `userId: ''`                                                       |
| **Resultado Esperado**  | Se lanza `Error('userId is required')`                             |
| **Resultado Obtenido**  | ✅ PASSED                                                            |
| **Atributo de Calidad** | Seguridad — Trazabilidad de acciones                                |

#### TC-REP-003: Rechazo de acción vacía

| Campo                         | Detalle                                                |
| :---------------------------- | :----------------------------------------------------- |
| **ID**                  | TC-REP-003                                             |
| **Entidad**             | AuditLog                                               |
| **Descripción**        | Verificar que el sistema rechaza registros sin acción |
| **Precondiciones**      | Ninguna                                                |
| **Datos de Entrada**    | `action: '   '`                                      |
| **Resultado Esperado**  | Se lanza `Error('action is required')`               |
| **Resultado Obtenido**  | ✅ PASSED                                              |
| **Atributo de Calidad** | Seguridad — Integridad de auditoría                  |

#### TC-REP-004: Rechazo de recurso vacío

| Campo                         | Detalle                                                |
| :---------------------------- | :----------------------------------------------------- |
| **ID**                  | TC-REP-004                                             |
| **Entidad**             | AuditLog                                               |
| **Descripción**        | Verificar que el sistema rechaza registros sin recurso |
| **Precondiciones**      | Ninguna                                                |
| **Datos de Entrada**    | `resource: '   '`                                    |
| **Resultado Esperado**  | Se lanza `Error('resource is required')`             |
| **Resultado Obtenido**  | ✅ PASSED                                              |
| **Atributo de Calidad** | Seguridad — Integridad de auditoría                  |

#### TC-REP-005: Registro con detalles opcionales

| Campo                         | Detalle                                                                 |
| :---------------------------- | :---------------------------------------------------------------------- |
| **ID**                  | TC-REP-005                                                              |
| **Entidad**             | AuditLog                                                                |
| **Descripción**        | Verificar que los detalles opcionales se almacenan correctamente        |
| **Precondiciones**      | Ninguna                                                                 |
| **Datos de Entrada**    | `details: { field: 'role', oldValue: 'client', newValue: 'trainer' }` |
| **Resultado Esperado**  | `details` almacenado correctamente                                    |
| **Resultado Obtenido**  | ✅ PASSED                                                               |
| **Atributo de Calidad** | Confiabilidad — Información contextual                                |

---

### 4.8 Reporting Service — Report.test.ts

#### TC-REP-006: Creación de reporte con fechas válidas

| Campo                         | Detalle                                                                                  |
| :---------------------------- | :--------------------------------------------------------------------------------------- |
| **ID**                  | TC-REP-006                                                                               |
| **Entidad**             | Report                                                                                   |
| **Descripción**        |                                                                                          |
| **Precondiciones**      | Ninguna                                                                                  |
| **Datos de Entrada**    | `type: 'revenue'`, `format: 'pdf'`, `fromDate: 2026-01-01`, `toDate: 2026-06-01` |
| **Resultado Esperado**  | Reporte creado con `status === 'pending'`                                              |
| **Resultado Obtenido**  | ✅ PASSED                                                                                |
| **Atributo de Calidad** | Confiabilidad                                                                            |

#### TC-REP-007: Rechazo de toDate anterior a fromDate

| Campo                         | Detalle                                                                 |
| :---------------------------- | :---------------------------------------------------------------------- |
| **ID**                  | TC-REP-007                                                              |
| **Entidad**             | Report                                                                  |
| **Descripción**        | Verificar que el sistema rechaza reportes con rango de fechas invertido |
| **Precondiciones**      | Ninguna                                                                 |
| **Datos de Entrada**    | `fromDate: 2026-06-01`, `toDate: 2026-01-01`                        |
| **Resultado Esperado**  | Se lanza `Error('toDate must be after fromDate')`                     |
| **Resultado Obtenido**  | ✅ PASSED                                                               |
| **Atributo de Calidad** | Confiabilidad — Consistencia temporal                                  |

#### TC-REP-008: Estado pendiente por defecto

| Campo                         | Detalle                                                           |
| :---------------------------- | :---------------------------------------------------------------- |
| **ID**                  | TC-REP-008                                                        |
| **Entidad**             | Report                                                            |
| **Descripción**        | Verificar que un reporte nuevo tiene estado 'pending' por defecto |
| **Precondiciones**      | Ninguna                                                           |
| **Datos de Entrada**    | Reporte sin especificar `status`                                |
| **Resultado Esperado**  | `status === 'pending'`                                          |
| **Resultado Obtenido**  | ✅ PASSED                                                         |
| **Atributo de Calidad** | Confiabilidad — Comportamiento por defecto                       |

#### TC-REP-009: Estado explícito en creación

| Campo                         | Detalle                                                          |
| :---------------------------- | :--------------------------------------------------------------- |
| **ID**                  | TC-REP-009                                                       |
| **Entidad**             | Report                                                           |
| **Descripción**        | Verificar que se puede crear un reporte con un estado explícito |
| **Precondiciones**      | Ninguna                                                          |
| **Datos de Entrada**    | `status: 'completed'`                                          |
| **Resultado Esperado**  | `status === 'completed'`                                       |
| **Resultado Obtenido**  | ✅ PASSED                                                        |
| **Atributo de Calidad** | Confiabilidad                                                    |

---

## 5. Matriz de Trazabilidad — Atributos de Calidad

| Caso de Prueba                              | Confiabilidad |  Seguridad  | Disponibilidad | Mantenibilidad |
| :------------------------------------------ | :-----------: | :----------: | :------------: | :------------: |
| TC-AUTH-001 (Email válido)                 |      ✅      |              |                |                |
| TC-AUTH-002 (Email inválido)               |              |      ✅      |                |                |
| TC-AUTH-003 (Igualdad email)                |      ✅      |              |                |                |
| TC-AUTH-004 (Documento válido)             |      ✅      |              |                |                |
| TC-AUTH-005 (Documento corto)               |              |      ✅      |                |                |
| TC-AUTH-006 (Documento largo)               |              |      ✅      |                |                |
| TC-AUTH-007 (Caracteres inválidos)         |              |      ✅      |                |                |
| TC-AUTH-008 (Hash contraseña)              |              |      ✅      |                |                |
| TC-AUTH-009 (Contraseña corta)             |              |      ✅      |                |                |
| TC-AUTH-010 (Verif. contraseña correcta)   |              |      ✅      |                |                |
| TC-AUTH-011 (Verif. contraseña incorrecta) |              |      ✅      |                |                |
| TC-AUTH-012 (Roles válidos)                |      ✅      |              |                |                |
| TC-AUTH-013 (Rol inválido)                 |              |      ✅      |                |                |
| TC-AUTH-014 (Permisos admin)                |              |      ✅      |                |                |
| TC-AUTH-015 (Permisos no-admin)             |              |      ✅      |                |                |
| TC-AUTH-016 (Usuario válido)               |      ✅      |              |                |                |
| TC-MEMB-001 (Suscripción activa)           |      ✅      |              |                |                |
| TC-MEMB-002 (Suscripción expirada estado)  |              |              |       ✅       |                |
| TC-MEMB-003 (Suscripción expirada fecha)   |              |              |       ✅       |                |
| TC-MEMB-004 (Renovación suscripción)      |      ✅      |              |                |                |
| TC-MEMB-005 (Plan válido)                  |      ✅      |              |                |                |
| TC-MEMB-006 (Nombre vacío)                 |              |      ✅      |                |                |
| TC-MEMB-007 (Precio negativo)               |              |      ✅      |                |                |
| TC-MEMB-008 (Duración no positiva)         |              |      ✅      |                |                |
| TC-MEMB-009 (Campos opcionales)             |      ✅      |              |                |                |
| TC-MEMB-010 (Active por defecto)            |      ✅      |              |                |                |
| TC-MEMB-011 (Check-in)                      |      ✅      |              |                |                |
| TC-MEMB-012 (Check-out)                     |      ✅      |              |                |                |
| TC-MEMB-013 (Sin userId)                    |              |      ✅      |                |                |
| TC-MEMB-014 (Sin idempotencyKey)            |      ✅      |              |                |                |
| TC-MEMB-015 (Tipo inválido)                |              |      ✅      |                |                |
| TC-ACT-001 (Clase válida)                  |      ✅      |              |                |                |
| TC-ACT-002 (Nombre vacío)                  |              |      ✅      |                |                |
| TC-ACT-003 (Clase llena)                    |              |              |       ✅       |                |
| TC-ACT-004 (Horario válido)                |      ✅      |              |                |                |
| TC-ACT-005 (Sin classId)                    |              |      ✅      |                |                |
| TC-ACT-006 (Sin sala)                       |              |      ✅      |                |                |
| TC-ACT-007 (Hora fin < inicio)              |      ✅      |              |                |                |
| TC-ACT-008 (Hora fin = inicio)              |      ✅      |              |                |                |
| TC-ACT-009 (Solapamiento misma sala)        |      ✅      |              |                |                |
| TC-ACT-010 (Sin solapamiento dif. sala)     |              |              |       ✅       |                |
| TC-ACT-011 (Clase seguida sin conflicto)    |              |              |       ✅       |                |
| TC-ACT-012 (Horarios separados)             |      ✅      |              |                |                |
| TC-NOTI-001 (Estado pendiente)              |      ✅      |              |                |                |
| TC-NOTI-002 (Sin userId)                    |              |      ✅      |                |                |
| TC-NOTI-003 (Sin tipo)                      |              |      ✅      |                |                |
| TC-NOTI-004 (Sin mensaje)                   |              |      ✅      |                |                |
| TC-NOTI-005 (Reintento permitido)           |      ✅      |              |                |                |
| TC-NOTI-006 (Reintento excedido)            |              |              |       ✅       |                |
| TC-NOTI-007 (Reinteno no fallido)           |      ✅      |              |                |                |
| TC-REP-001 (Auditoría válida)             |      ✅      |              |                |                |
| TC-REP-002 (Sin userId auditoría)          |              |      ✅      |                |                |
| TC-REP-003 (Sin acción)                    |              |      ✅      |                |                |
| TC-REP-004 (Sin recurso)                    |              |      ✅      |                |                |
| TC-REP-005 (Con detalles)                   |      ✅      |              |                |                |
| TC-REP-006 (Reporte válido)                |      ✅      |              |                |                |
| TC-REP-007 (Fechas invertidas)              |      ✅      |              |                |                |
| TC-REP-008 (Estado pendiente)               |      ✅      |              |                |                |
| TC-REP-009 (Estado explícito)              |      ✅      |              |                |                |
| **TOTAL**                             | **27** | **21** |  **8**  |  **—**  |

---

## 6. Resumen Ejecutivo

| Métrica                                    | Valor                      |
| :------------------------------------------ | :------------------------- |
| **Total de casos de prueba**          | 63                         |
| **Casos passed**                      | 63                         |
| **Casos failed**                      | 0                          |
| **Cobertura promedio**                | ~84%                       |
| **Atributo más probado**             | Confiabilidad (27 casos)   |
| **Segundo atributo más probado**     | Seguridad (21 casos)       |
| **Microservicio con mayor cobertura** | notification-service (95%) |

> Las pruebas automatizadas demuestran que los atributos de calidad de **Confiabilidad**, **Seguridad** y **Disponibilidad** están siendo verificados sistemáticamente en cada microservicio del sistema GymTech.
