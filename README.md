# Mini-CRM Modular — MERN Stack con TypeScript

> Sistema de Gestión de Relaciones con el Cliente (CRM) desarrollado como MVP funcional sobre el stack MERN completo con **TypeScript estricto** en toda la aplicación. Desplegable en un solo comando mediante Docker.

---

## Índice

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Arquitectura del Monorepo](#2-arquitectura-del-monorepo)
3. [Requisitos Previos](#3-requisitos-previos)
4. [Instalación y Configuración](#4-instalación-y-configuración)
5. [Ejecución con Docker](#5-ejecución-con-docker)
6. [Módulos Funcionales](#6-módulos-funcionales)
7. [Stack Tecnológico](#7-stack-tecnológico)
8. [API Reference](#8-api-reference)

---

## 1. Descripción del Proyecto

**Mini-CRM Modular** es un MVP completo que implementa los cinco pilares fundamentales de un sistema CRM empresarial:

| Módulo | Funcionalidad |
|--------|--------------|
| **Contactos** | CRUD completo con historial de notas por contacto, búsqueda en tiempo real y filtrado por estado de lead |
| **Pipeline de Ventas** | Tablero Kanban con 6 etapas (Prospecto → Ganado/Perdido), selector de etapa interactivo y valor acumulado por columna |
| **Soporte (Ticketing)** | Gestión de incidencias con códigos auto-generados (`TKT-00001`), cambio de estado y prioridad directamente en la tabla |
| **Marketing (Campañas)** | Creación de campañas segmentadas por estado de lead con acción de envío simulado que registra actividad en contactos |
| **Dashboard Analítico** | KPIs en tiempo real: valor total del pipeline, tasa de conversión, tickets por estado y campañas ejecutadas, con gráficas interactivas |

El proyecto aplica **tipado estricto de extremo a extremo**: interfaces TypeScript compartidas en frontend y backend, sin ningún uso de `any`. La verificación de tipos (`tsc --noEmit`) pasa sin errores en ambos proyectos.

---

## 2. Arquitectura del Monorepo

```
mini-crm/
│
├── docker-compose.yml          # Orquestación: database + backend + frontend
├── CLAUDE.md                   # Fuente de verdad técnica del proyecto
├── README.md
│
├── server/                     # API REST — Node.js + Express + TypeScript
│   ├── Dockerfile
│   ├── .env                    # PORT=8080, MONGODB_URI=mongodb://database:27017/minicrm
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts           # Punto de entrada Express
│       ├── seed.ts             # Script de siembra de datos de prueba
│       ├── config/
│       │   └── db.ts           # Conexión Mongoose
│       ├── types/
│       │   └── index.ts        # Tipos compartidos: LeadStatus, PipelineStage, etc.
│       ├── models/             # Esquemas Mongoose
│       │   ├── Contact.ts
│       │   ├── Opportunity.ts
│       │   ├── Ticket.ts
│       │   └── Campaign.ts
│       ├── controllers/        # Lógica de negocio por módulo
│       │   ├── contactController.ts
│       │   ├── opportunityController.ts
│       │   ├── ticketController.ts
│       │   ├── campaignController.ts
│       │   └── dashboardController.ts
│       └── routes/             # Definición de endpoints REST
│           ├── contacts.ts
│           ├── opportunities.ts
│           ├── tickets.ts
│           ├── campaigns.ts
│           └── dashboard.ts
│
└── client/                     # SPA — React 18 + Vite + TypeScript + Tailwind
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts          # Proxy /api → backend (configurable vía API_TARGET)
    ├── tailwind.config.js
    └── src/
        ├── App.tsx             # Router principal con layout de sidebar
        ├── main.tsx
        ├── index.css           # Directivas Tailwind + clases utilitarias
        ├── types/
        │   └── index.ts        # Interfaces TypeScript del frontend
        ├── services/
        │   └── api.ts          # Cliente Axios tipado por módulo
        ├── components/
        │   ├── Navbar.tsx
        │   ├── ContactModal.tsx
        │   └── OpportunityModal.tsx
        └── pages/
            ├── Dashboard.tsx
            ├── Contacts.tsx
            ├── Pipeline.tsx
            ├── Tickets.tsx
            └── Campaigns.tsx
```

### Red interna Docker

```
┌──────────────────────────── crm_network ────────────────────────────┐
│                                                                       │
│  crm_database          crm_backend           crm_frontend            │
│  mongo:6.0      ◄───   node:20-alpine  ◄───  node:20-alpine          │
│  :27017 (int.)         :8080 (ext.)          :5173 (ext.)            │
│  mongo_data vol.       PORT=8080             API_TARGET=             │
│                        MONGODB_URI=          http://backend:8080     │
│                        mongodb://database    Proxy Vite → backend    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 3. Requisitos Previos

> **No es necesario instalar Node.js ni MongoDB** en tu máquina local. Todo el entorno de ejecución está contenido en los contenedores Docker.

| Software | Versión mínima | Enlace |
|----------|---------------|--------|
| **Docker Desktop** | 24.x | https://www.docker.com/products/docker-desktop |
| **Git** | 2.x | https://git-scm.com |

Verifica que Docker está operativo antes de continuar:

```bash
docker --version
docker compose version
```

---

## 4. Instalación y Configuración

### Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd mini-crm
```

### Variables de entorno

El archivo `server/.env` ya está incluido en el repositorio con los valores correctos para el entorno Docker:

```env
PORT=8080
MONGODB_URI=mongodb://database:27017/minicrm
```

> `database` es el nombre del servicio MongoDB definido en `docker-compose.yml`. Docker resuelve automáticamente ese hostname dentro de la red interna `crm_network`. No es necesario modificar este archivo para el flujo Docker estándar.

---

## 5. Ejecución con Docker

### Paso 1 — Construir y levantar el ecosistema completo

```bash
docker compose up --build
```

Este comando:
1. Construye las imágenes de `backend` y `frontend` desde sus respectivos `Dockerfile`
2. Descarga la imagen oficial `mongo:6.0`
3. Levanta los tres contenedores interconectados en `crm_network`
4. El backend espera a que MongoDB pase su health check antes de arrancar

Para ejecutar en segundo plano (modo detached):

```bash
docker compose up --build -d
```

### Paso 2 — Poblar la base de datos con datos de prueba

```bash
docker exec -it crm_backend npm run seed
```

Este script inserta en MongoDB:
- **10 contactos** con distintos estados de lead y notas de historial
- **8 oportunidades** distribuidas en las 6 etapas del pipeline
- **6 tickets** de soporte con prioridades y estados variados
- **3 campañas** (2 enviadas, 1 en borrador)

> Ejecuta el seed solo una vez. El script es idempotente: limpia las colecciones antes de insertar, por lo que puede re-ejecutarse para resetear los datos.

### Paso 3 — Abrir la aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación React (SPA) |
| **Backend API** | http://localhost:8080/api | REST API Express |
| **Health check** | http://localhost:8080/api/health | Estado del servidor |

### Gestión del entorno

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Detener todos los contenedores
docker compose down

# Detener y eliminar el volumen de MongoDB (reset completo)
docker compose down -v

# Reconstruir solo el backend tras cambios en el código
docker compose up --build backend
```

---

## 6. Módulos Funcionales

### M1 — Gestión de Contactos

- Tabla interactiva con búsqueda en tiempo real (debounce) por nombre, email y empresa
- Filtro por estado del lead: `Nuevo` · `Contactado` · `Cualificado` · `Inactivo`
- Modal con dos pestañas: **Detalles** (edición completa) e **Historial de Notas** (con formulario para añadir nuevas notas con timestamp automático)
- CRUD completo con confirmación de eliminación

### M2 — Pipeline de Ventas (Kanban)

- Tablero de 6 columnas: `Prospecto` → `Calificado` → `Propuesta` → `Negociación` → `Ganado` → `Perdido`
- Cada tarjeta muestra: título, contacto asociado, valor monetario y fecha de cierre estimada
- Cambio de etapa mediante selector interactivo en la propia tarjeta
- Valor acumulado por columna y total del pipeline en el encabezado

### M3 — Soporte y Ticketing

- Códigos únicos auto-generados en formato `TKT-00001` mediante pre-save hook de Mongoose
- Cambio de **estado** (`Abierto` / `En Progreso` / `Resuelto`) y **prioridad** (`Baja` / `Media` / `Alta`) directamente en la fila de la tabla sin abrir modal
- Filtros combinables por estado y prioridad

### M4 — Marketing y Campañas

- Segmentación de destinatarios por estado de lead (selección múltiple)
- Formulario con asunto y cuerpo del email
- Botón **"Enviar Campaña"** que: cambia el estado a `Enviada`, registra timestamp, cuenta contactos afectados e inserta una nota en cada contacto del segmento

### M5 — Dashboard Analítico

- **5 KPI cards**: Valor total del pipeline · Tasa de conversión · Tickets abiertos · Campañas enviadas · Total de contactos
- **BarChart**: Valor monetario del pipeline desglosado por etapa
- **PieChart**: Distribución de tickets por estado
- **Barras de progreso**: Tickets por prioridad con porcentajes
- Botón de actualización manual; todas las métricas se calculan en tiempo real mediante aggregations de MongoDB

---

## 7. Stack Tecnológico

Las dependencias se instalan automáticamente al construir los contenedores Docker. No es necesario ejecutar `npm install` manualmente.

### Backend (`/server`)

| Paquete | Versión | Función |
|---------|---------|---------|
| `express` | ^4.19.2 | Framework HTTP |
| `mongoose` | ^8.4.0 | ODM para MongoDB con esquemas tipados |
| `typescript` | ^5.4.5 | Compilador TypeScript |
| `ts-node-dev` | ^2.0.0 | Hot-reload en desarrollo |
| `cors` | ^2.8.5 | Cabeceras CORS |
| `dotenv` | ^16.4.5 | Carga de variables de entorno |

### Frontend (`/client`)

| Paquete | Versión | Función |
|---------|---------|---------|
| `react` | ^18.3.1 | Librería de UI |
| `vite` | ^5.3.1 | Bundler y servidor de desarrollo |
| `typescript` | ^5.4.5 | Tipado estricto |
| `tailwindcss` | ^3.4.4 | Estilos utilitarios |
| `axios` | ^1.7.2 | Cliente HTTP |
| `react-router-dom` | ^6.24.0 | Enrutamiento SPA |
| `recharts` | ^2.12.7 | Gráficas del Dashboard |
| `lucide-react` | ^0.395.0 | Iconografía |

---

## 8. API Reference

Base URL: `http://localhost:8080/api`

### Contactos
```
GET    /contacts              ?search=&status=
POST   /contacts
GET    /contacts/:id
PUT    /contacts/:id
DELETE /contacts/:id
POST   /contacts/:id/notes    { "text": "..." }
```

### Oportunidades
```
GET    /opportunities
POST   /opportunities
PUT    /opportunities/:id     { "stage": "Ganado" }
DELETE /opportunities/:id
```

### Tickets
```
GET    /tickets               ?status=&priority=
POST   /tickets
PUT    /tickets/:id           { "status": "Resuelto" }
DELETE /tickets/:id
```

### Campañas
```
GET    /campaigns
POST   /campaigns
DELETE /campaigns/:id
POST   /campaigns/:id/send
```

### Dashboard
```
GET    /dashboard/metrics     → DashboardMetrics (KPIs + aggregations)
GET    /health                → { status: "ok", timestamp }
```

---

<div align="center">
  <sub>Mini-CRM · MERN Stack · TypeScript Estricto · Dockerizado</sub>
</div>
