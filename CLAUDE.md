# CLAUDE.md — Fuente de Verdad Técnica: Mini-CRM MERN Stack

> **Última actualización**: 2026-06-04 | **Estado general**: MVP 100% completo + Dockerizado + Suite E2E

## Estado Actual del Proyecto

| Módulo | Estado | Archivos Clave |
|--------|--------|----------------|
| Setup Backend (Express + TS) | ✅ Completo | `server/src/server.ts`, `server/src/config/db.ts` |
| Setup Frontend (React + Vite + Tailwind) | ✅ Completo | `client/vite.config.ts`, `client/tailwind.config.js` |
| M1: Gestión de Contactos | ✅ Completo | `Contact.ts`, `contactController.ts`, `Contacts.tsx`, `ContactModal.tsx` |
| M2: Pipeline de Ventas (Kanban) | ✅ Completo | `Opportunity.ts`, `opportunityController.ts`, `Pipeline.tsx`, `OpportunityModal.tsx` |
| M3: Servicio y Ticketing | ✅ Completo | `Ticket.ts`, `ticketController.ts`, `Tickets.tsx` |
| M4: Marketing (Campañas) | ✅ Completo | `Campaign.ts`, `campaignController.ts`, `Campaigns.tsx` |
| M5: Dashboard de Informes | ✅ Completo | `dashboardController.ts`, `Dashboard.tsx` |
| Script de Seed | ✅ Completo | `server/src/seed.ts` (10 contactos, 8 opps, 6 tickets, 3 campañas) |
| TypeScript Strict Check | ✅ 0 errores | `tsc --noEmit` limpio en server y client |
| **Dockerización** | ✅ Completo | `docker-compose.yml`, `server/Dockerfile`, `client/Dockerfile` |
| **Suite E2E (Playwright)** | ✅ Completo | `e2e-tests/` — 22 tests, 6 módulos, TypeScript strict |

---

## Comandos para Levantar el Entorno

### Opción A — Docker (recomendado, no requiere MongoDB local)

```bash
# Desde la raíz del proyecto
docker compose up --build        # Levanta database + backend + frontend en una sola red interna

# En otra terminal — poblar la BD con datos de prueba
docker exec -it crm_backend npm run seed

# Detener todos los servicios
docker compose down

# Detener y borrar volumen de MongoDB (reset completo)
docker compose down -v
```

URLs con Docker:
- Frontend → http://localhost:5173
- Backend API → http://localhost:8080/api
- Health check → http://localhost:8080/api/health

### Opción B — Desarrollo local (requiere MongoDB corriendo en localhost:27017)

**Terminal 1 — Backend:**
```bash
cd server
# Cambiar MONGODB_URI en server/.env a: mongodb://localhost:27017/minicrm
# Cambiar PORT en server/.env a: 5000 (opcional)
npm run dev          # http://localhost:5000
```

**Terminal 2 — Seed:**
```bash
cd server
npm run seed
```

**Terminal 3 — Frontend:**
```bash
cd client
npm run dev          # http://localhost:5173
```

### Build de producción
```bash
cd server && npm run build    # Compila TypeScript → server/dist/
cd client && npm run build    # Empaqueta React → client/dist/
```

---

## Arquitectura Docker

```
┌─────────────────────────── crm_network (bridge) ────────────────────────────┐
│                                                                               │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │  crm_database    │    │   crm_backend    │    │    crm_frontend      │  │
│  │  mongo:6.0       │◄───│  node:20-alpine  │◄───│   node:20-alpine     │  │
│  │  :27017 (int.)   │    │  :8080 (ext.)    │    │   :5173 (ext.)       │  │
│  └──────────────────┘    └──────────────────┘    └──────────────────────┘  │
│       mongo_data                 PORT=8080         API_TARGET=               │
│       (volumen)          MONGODB_URI=              http://backend:8080        │
│                          mongodb://database:27017  Vite proxy /api → backend │
└───────────────────────────────────────────────────────────────────────────────┘
         ▲                        ▲                        ▲
    (interno)              localhost:8080            localhost:5173
                           (desde el host)           (desde el host)
```

### Variables de entorno por servicio

| Servicio | Variable | Valor en Docker | Valor en local |
|----------|----------|----------------|----------------|
| backend | `PORT` | `8080` | `5000` |
| backend | `MONGODB_URI` | `mongodb://database:27017/minicrm` | `mongodb://localhost:27017/minicrm` |
| frontend | `API_TARGET` | `http://backend:8080` | *(no definida → localhost:5000)* |

---

## Estructura de Archivos (Docker añadido)

### Backend (`/server`)
```
server/
├── src/
│   ├── config/db.ts
│   ├── models/          Contact.ts, Opportunity.ts, Ticket.ts, Campaign.ts
│   ├── controllers/     contactController.ts, opportunityController.ts,
│   │                    ticketController.ts, campaignController.ts, dashboardController.ts
│   ├── routes/          contacts.ts, opportunities.ts, tickets.ts, campaigns.ts, dashboard.ts
│   ├── types/index.ts
│   ├── server.ts        PORT = process.env.PORT ?? 8080
│   └── seed.ts
├── Dockerfile           node:20-alpine, EXPOSE 8080, CMD ["npm","run","dev"]
├── .dockerignore
├── .env                 PORT=8080, MONGODB_URI=mongodb://database:27017/minicrm
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/      Navbar.tsx, ContactModal.tsx, OpportunityModal.tsx
│   ├── pages/           Dashboard.tsx, Contacts.tsx, Pipeline.tsx, Tickets.tsx, Campaigns.tsx
│   ├── services/api.ts
│   ├── types/index.ts
│   └── App.tsx, main.tsx, index.css
├── Dockerfile           node:20-alpine, EXPOSE 5173, --host 0.0.0.0
├── .dockerignore
├── vite.config.ts       API_TARGET env var → proxy /api (Docker: backend:8080 | local: localhost:5000)
└── package.json
```

### Raíz
```
actividad1/
├── docker-compose.yml   3 servicios: database + backend + frontend en crm_network
└── CLAUDE.md
```

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/contacts?search=&status=` | Listar con búsqueda y filtro |
| POST | `/api/contacts` | Crear contacto |
| GET/PUT/DELETE | `/api/contacts/:id` | Detalle / Editar / Eliminar |
| POST | `/api/contacts/:id/notes` | Agregar nota con timestamp |
| GET | `/api/opportunities` | Listar (populated contact) |
| POST/GET/PUT/DELETE | `/api/opportunities/:id` | CRUD completo |
| GET | `/api/tickets?status=&priority=` | Listar con filtros |
| POST | `/api/tickets` | Crear (auto-genera código TKT-XXXXX) |
| GET/PUT/DELETE | `/api/tickets/:id` | Actualizar estado+prioridad / Eliminar |
| GET/POST | `/api/campaigns` | Listar / Crear |
| DELETE | `/api/campaigns/:id` | Eliminar |
| POST | `/api/campaigns/:id/send` | Enviar campaña → actualiza contactos |
| GET | `/api/dashboard/metrics` | Métricas consolidadas |
| GET | `/api/health` | Health check |

---

## Decisiones Técnicas Críticas

1. **Strict TypeScript sin `any`**: Verificado con `tsc --noEmit` (0 errores).
2. **Puerto 8080**: Puerto estándar de contenedor para APIs REST. El `.env` define `PORT=8080`.
3. **health check MongoDB**: `docker-compose.yml` usa `healthcheck` en el servicio `database` con `condition: service_healthy` en el backend — garantiza que Express no arranca antes de que Mongo esté listo.
4. **Vite host 0.0.0.0**: Obligatorio para que el servidor de desarrollo sea accesible desde fuera del contenedor.
5. **API_TARGET env var**: Permite que el proxy de Vite apunte a `http://backend:8080` dentro de Docker y a `http://localhost:5000` en local, sin cambiar código.
6. **Volúmenes de código fuente `:ro`**: `./server/src` y `./client/src` se montan en modo read-only para hot-reload sin exponer archivos sensibles.
7. **Volumen mongo_data**: Persistencia de datos de MongoDB entre reinicios del contenedor.
8. **Campaign Send**: `$push` de nota en contactos del segmento + actualiza campaña con `affectedContacts` y `sentAt`.
9. **Dashboard**: `Promise.all` con 11 aggregations en paralelo.
10. **Seed idempotente**: `deleteMany` en todas las colecciones antes de insertar.

---

## Flujo de Testing Automatizado

### Prerequisito — Docker Desktop debe estar activo

```bash
# 1. Iniciar Docker Desktop (abrir la aplicación GUI en Windows)
# 2. Desde la raíz del proyecto, levantar servicios
docker compose up --build -d

# 3. Poblar la BD con datos del Seed (necesario antes de los tests E2E)
docker exec -it crm_backend npm run seed

# 4. Verificar que los servicios responden
curl http://localhost:8080/api/health   # → 200 OK
```

### Ejecutar la suite completa

```bash
cd e2e-tests

# Suite completa (22 tests: API + E2E)
npm test

# Solo tests de integración de la API REST (Bloque A)
npm run test:api

# Solo tests E2E de interfaz (Bloque B)
npm run test:e2e

# Con navegador visible (útil para depurar)
npm run test:headed

# Modo depuración interactiva con Playwright Inspector
npm run test:debug
```

### Ver reportes y evidencias

```bash
# Abrir reporte HTML interactivo con capturas de pantalla
cd e2e-tests && npm run report
# → Abre e2e-tests/playwright-report/index.html en el navegador

# Ver trace de un test fallido (línea de tiempo de peticiones)
npx playwright show-trace e2e-tests/test-results/<nombre-test>/trace.zip
```

### Arquitectura del Framework E2E

```
e2e-tests/
├── playwright.config.ts        ← Configuración: 2 proyectos (api + chromium), screenshots ON
├── global-setup.ts             ← Health-check + auto-start docker compose
├── tsconfig.json               ← TypeScript strict, sin any
├── tests/
│   ├── api/                    ← Bloque A: Integración REST
│   │   ├── contacts.spec.ts    ← POST create, POST note, PUT update (M1)
│   │   ├── tickets.spec.ts     ← PUT status/priority, GET format, GET filter (M3)
│   │   └── campaigns.spec.ts   ← POST send transaccional + impacto relacional (M4)
│   └── e2e/                    ← Bloque B: End-to-End UI
│       ├── dashboard.spec.ts   ← 7 tests: KPIs ($223.700, 10 contactos, 12.5%) (M5)
│       ├── pipeline.spec.ts    ← Kanban columnas, cambio etapa + persistencia (M2)
│       └── tickets.spec.ts     ← Creación interactiva TKT-XXXXX, filtros (M3)
├── evidencias_testing.md       ← Registro de evidencias y capturas generadas
└── agente_manual.md            ← 10 casos de prueba manual (UX/Visual/Exploratorio)
```

### Datos esperados del Seed (base de los assertions E2E)

| KPI | Valor | Fuente |
|-----|-------|--------|
| Total Contactos | 10 | seed.ts — 10 contactos insertados |
| Valor Pipeline | $223.700 (es-ES) | Suma 8 oportunidades: 28500+12000+75000+18900+9500+42000+6800+31000 |
| Tasa Conversión | 12.5% | 1 oportunidad Ganada / 8 totales |
| Tickets Abiertos | 3 | SAP + Analytics + Exportación |
| Campañas Enviadas | 2 | Reactivación Q2 + Upsell Enterprise |

---

## Pendientes Técnicos (Tech Debt)

- [ ] **Autenticación JWT**: Middleware de protección de rutas + login/logout
- [ ] **Drag-and-drop Kanban**: Reemplazar select inline por @dnd-kit/core
- [ ] **Paginación server-side**: Para listas grandes (contactos, tickets)
- [x] **Tests E2E**: Playwright + TypeScript — 22 tests en `e2e-tests/` (API + UI)
- [ ] **Tests unitarios**: Jest + Supertest (backend), React Testing Library (frontend)
- [ ] **Notificaciones realtime**: Socket.io para alertas de nuevos tickets
- [ ] **Exportación CSV**: Botón exportar contactos y reportes
- [ ] **Validación Zod**: Validación estricta de payloads en API endpoints
- [ ] **Recharts v3**: Migrar de v2.x a v3.x
- [ ] **Docker producción**: Multi-stage build (`tsc` → `node dist/`) para imagen más pequeña
- [ ] **CI/CD**: GitHub Actions → build + test + push a registry
