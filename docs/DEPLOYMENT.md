# Diagrama de Despliegue - GymTech

Este documento describe la infraestructura física y lógica donde se despliega la plataforma GymTech.

## Diagrama de Despliegue

```mermaid
graph TD
    subgraph Cliente ["Cliente (Navegador / Móvil)"]
        PWA["Frontend PWA <br/>(Service Worker / Cache)"]
    end

    subgraph Host ["Servidor de Aplicaciones (Docker Host)"]
        subgraph Network ["Red Virtual: gymtech-network"]
            
            FE_Cont["Contenedor Frontend <br/>(Nginx/Node)"]
            GW_Cont["Contenedor API Gateway <br/>(Node.js Express)"]
            
            subgraph Microservices ["Microservicios (Node.js)"]
                Auth_S["Auth Service <br/>:3001"]
                Mem_S["Membership Service <br/>:3002"]
                Act_S["Activity Service <br/>:3003"]
                Rep_S["Reporting Service <br/>:3004"]
                Not_S["Notification Service <br/>:3005"]
            end
            
            subgraph Databases ["Capa de Datos (PostgreSQL)"]
                DB_Auth["Auth DB <br/>:5432"]
                DB_Mem["Membership DB <br/>:5432"]
                DB_Act["Activity DB <br/>:5432"]
                DB_Rep["Reporting DB <br/>:5432"]
                DB_Not["Notification DB <br/>:5432"]
            end
        end
    end

    subgraph Disk ["Almacenamiento Persistente (Host Disk)"]
        V_Auth[("auth-db-data")]
        V_Mem[("membership-db-data")]
        V_Act[("activity-db-data")]
        V_Rep[("reporting-db-data")]
        V_Not[("notification-db-data")]
    end

    %% Flujos de Tráfico
    PWA -->|Puerto 8087| FE_Cont
    FE_Cont -->|Puerto 3000| GW_Cont
    
    GW_Cont --> Auth_S
    GW_Cont --> Mem_S
    GW_Cont --> Act_S
    GW_Cont --> Rep_S
    GW_Cont --> Not_S

    Auth_S --> DB_Auth
    Mem_S --> DB_Mem
    Act_S --> DB_Act
    Rep_S --> DB_Rep
    Not_S --> DB_Not

    %% Persistencia
    DB_Auth -.-> V_Auth
    DB_Mem -.-> V_Mem
    DB_Act -.-> V_Act
    DB_Rep -.-> V_Rep
    DB_Not -.-> V_Not

    %% Estilos
    style Cliente fill:#f9f,stroke:#333,stroke-width:2px
    style Host fill:#dfd,stroke:#333,stroke-width:2px
    style Disk fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Network fill:#e1f5fe,stroke:#01579b,stroke-dasharray: 5 5
```

## Detalles Técnicos del Despliegue

### 1. Infraestructura de Contenedores
El proyecto utiliza **Docker** y **Docker Compose** para encapsular cada componente. Esto garantiza que el entorno de ejecución sea idéntico entre desarrollo y producción.

### 2. Red y Comunicación
Todos los contenedores están unidos por la red `gymtech-network`. 
- El **API Gateway** actúa como el único punto de entrada externo para las peticiones de backend.
- La comunicación interna se realiza mediante el DNS interno de Docker (ej. `http://auth-service:3001`).

### 3. Estrategia de Persistencia
Para evitar la pérdida de datos al reiniciar o actualizar los contenedores, se utilizan **Volúmenes Nombrados de Docker**. Cada base de datos tiene su propio volumen mapeado al disco físico del servidor host.

### 4. Puertos Expuestos
| Componente | Puerto Externo | Puerto Interno | Protocolo |
|------------|----------------|----------------|-----------|
| Frontend   | 8087           | 80             | HTTP/HTTPS|
| Gateway    | 3000           | 3000           | HTTP      |
| Microservicios | N/A        | 3001-3005      | HTTP      |
| Bases de Datos | N/A        | 5432           | TCP/SQL   |
