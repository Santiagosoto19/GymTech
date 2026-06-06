# 📘 Guía Maestra de GymTech

Bienvenido al proyecto **GymTech**. Esta guía está diseñada para llevarte de la mano desde el concepto más básico hasta la comprensión técnica total del sistema.

---

## 🌟 1. ¿Qué es GymTech?
GymTech es una plataforma de gestión para gimnasios. A diferencia de una aplicación tradicional (monolito), GymTech utiliza una **Arquitectura de Microservicios**.

**¿Qué significa esto?**
Imagina que el sistema es como un centro comercial. En lugar de tener una sola tienda gigante que vende todo, tenemos varias tiendas especializadas (microservicios). Si la tienda de "Membresías" tiene mucha gente y se colapsa, la tienda de "Notificaciones" sigue funcionando perfectamente.

---

## 🗺️ 2. Mapa General del Sistema (El Flujo)

Cuando un usuario interactúa con la app, ocurre lo siguiente:

1.  **Frontend PWA**: El usuario ve una interfaz moderna. Si no tiene internet, la PWA usa un *Service Worker* para mostrar datos guardados en caché.
2.  **API Gateway**: El Frontend no habla con los servicios directamente. Envía todo al Gateway. El Gateway dice: *"Ah, quieres loguearte $\rightarrow$ ve al Auth Service"* o *"Quieres ver clases $\rightarrow$ ve al Activity Service"*.
3.  **Microservicios**: Cada servicio recibe la orden, procesa la lógica de negocio y consulta su propia base de datos.
4.  **Bases de Datos (PostgreSQL)**: Cada servicio tiene su propia "bodega" de datos. El servicio de Auth no puede entrar a la base de datos de Actividades. Esto se llama **Database-per-Service**.

---

## 🛠️ 3. Desglose de Componentes

### 💻 Frontend (PWA)
- **Tecnologías**: React, Vite, Tailwind CSS, TypeScript.
- **Superpoder**: Es una *Progressive Web App*. Se puede instalar en el móvil y funciona offline.
- **Ubicación**: `/frontend`

### 🛡️ API Gateway
- **Rol**: El portero del sistema.
- **Funciones**: 
    - **Routing**: Redirige las rutas (`/auth`, `/activities`, etc.).
    - **Seguridad**: Usa `helmet` y `cors` para proteger el sistema.
    - **Rate Limiting**: Evita que alguien ataque el sistema haciendo miles de peticiones por segundo.
- **Ubicación**: `/gateway`

### ⚙️ Los Microservicios
Cada uno sigue el mismo patrón: `Rutas` $\rightarrow$ `Controlador` $\rightarrow$ `Servicio` $\rightarrow$ `Modelo`.

| Servicio | Responsabilidad | Dato Clave |
| :--- | :--- | :--- |
| **Auth** | Usuarios y Tokens | Maneja JWT y contraseñas hasheadas con bcrypt. |
| **Membership** | Planes y Pagos | Gestiona quién tiene acceso y qué plan paga. |
| **Activity** | Clases y Horarios | Controla la capacidad de los salones y reservas. |
| **Reporting** | Métricas y Gráficos | Analiza los datos para dar reportes al dueño del gym. |
| **Notification** | Avisos y Emails | Envía alertas al usuario (email, SMS, Push). |

---

## 📂 4. Guía de Carpetas (¿Dónde busco qué?)

Si quieres modificar algo, busca aquí:

- **"Quiero cambiar el diseño o una pantalla"** $\rightarrow$ `frontend/src/pages` o `frontend/src/components`.
- **"Quiero cambiar cómo se redirigen las rutas"** $\rightarrow$ `gateway/src/routes/index.js`.
- **"Quiero cambiar la lógica de cómo se cobra una membresía"** $\rightarrow$ `services/membership-service/src/services/membershipService.js`.
- **"Quiero cambiar los campos de la tabla de usuarios"** $\rightarrow$ `services/auth-service/src/models/userModel.js`.
- **"Quiero cambiar un mensaje de error estándar"** $\rightarrow$ `shared/constants/index.js`.

---

## 🚀 5. Manual de Operaciones (Comandos)

### Levantar el proyecto completo (Modo Desarrollo)
Este comando construye las imágenes y activa el *hot-reload* (cambios instantáneos).
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Detener el proyecto
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Borrar todo (incluyendo los datos de la BD)
Cuidado: esto borra todos los usuarios y membresías creadas.
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

---

## 🎓 6. Resumen Tecnológico (Stack)
- **Lenguaje**: TypeScript / JavaScript (Node.js 20).
- **Framework Backend**: Express.js.
- **Framework Frontend**: React + Vite.
- **Estilos**: Tailwind CSS.
- **Base de Datos**: PostgreSQL 16.
- **Infraestructura**: Docker & Docker Compose.
- **Validaciones**: Joi.
- **Logs**: Winston.
