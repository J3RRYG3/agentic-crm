# Requisitos del Proyecto: Mini-CRM MERN Stack (TypeScript)

## 1. Descripción General
Este documento especifica el diseño funcional y técnico para el desarrollo automatizado de un Sistema de Gestión de Relaciones con el Cliente (CRM) simplificado. El objetivo es construir un MVP (Producto Mínimo Viable) robusto utilizando TypeScript en todo el stack (MERN).

## 2. Stack Tecnológico Estricto
- **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS, Lucide React (iconos).
- **Backend:** Node.js, Express, TypeScript, ts-node-dev (entorno de desarrollo).
- **Base de Datos:** MongoDB (vía Mongoose con Schemas estrictos en TypeScript).
- **Arquitectura de Software:** Monorepo o carpetas limpias separadas (`/client` y `/server`).

---

## 3. Especificación de Módulos Funcionales

### Módulo 1: Gestión de Contactos y Cuentas
- **Funcionalidad:** CRUD completo de contactos.
- **Campos Obligatorios:** Nombre Completo, Email, Teléfono, Compañía, Cargo, Estado del Lead (Nuevo, Contactado, Cualificado, Inactivo) y Notas (Array de strings con fecha).
- **Interfaz:** Tabla interactiva con opción de búsqueda, filtrado por estado y un modal para ver el detalle e historial de notas.

### Módulo 2: Pipeline de Ventas (Kanban)
- **Funcionalidad:** Gestión visual del ciclo de venta de Oportunidades.
- **Campos de Oportunidad:** Título, Contacto/Cuenta Asociado, Valor Monetario ($), Etapa del Pipeline, Fecha de Cierre Estimada.
- **Etapas del Pipeline:** 1. Prospecto | 2. Calificado | 3. Propuesta | 4. Negociación | 5. Ganado | 6. Perdido.
- **Interfaz:** Vista de tablero con columnas por etapa. Cada oportunidad es una tarjeta. Debe permitir cambiar la etapa (vía select interactivo o drag-and-drop).

### Módulo 3: Servicio y Atención al Cliente (Ticketing)
- **Funcionalidad:** Sistema de gestión de incidencias de clientes.
- **Campos del Ticket:** Código Único (auto-generado), Cliente Asociado, Asunto, Descripción, Prioridad (Baja, Media, Alta), Estado (Abierto, En Progreso, Resuelto), Fecha de Creación.
- **Interfaz:** Lista de tickets con selectores rápidos para cambiar el estado y la prioridad directamente desde la vista general.

### Módulo 4: Módulo de Marketing (Campañas)
- **Funcionalidad:** Configuración y lanzamiento simulado de campañas promocionales.
- **Campos de Campaña:** Nombre de la Campaña, Segmento de Clientes (Filtro por Estado del Lead), Contenido del Email (Asunto y Cuerpo), Estado de la Campaña (Borrador, Enviada).
- **Acción Especial:** Botón "Enviar Campaña" que simula el envío cambiando el estado a "Enviada" e insertando un registro de actividad en los contactos afectados.

### Módulo 5: Dashboard de Informes y Análisis
- **Funcionalidad:** Pantalla principal con métricas consolidadas en tiempo real.
- **Métricas Requeridas:**
  - **KPIs Financieros:** Valor total acumulado en el Pipeline (Suma de todas las oportunidades).
  - **KPIs de Ventas:** Tasa de conversión de oportunidades (Ganadas vs Totales).
  - **KPIs de Soporte:** Gráfico o contador de Tickets Abiertos vs Resueltos.
  - **Métricas de Marketing:** Número de campañas ejecutadas con éxito.

---

## 4. Requisitos Técnicos y de Código
1. **Tipado Completo:** No se permite el uso de `any`. Todos los modelos, payloads de API y estados de React deben estar completamente tipados con Interfaces de TypeScript.
2. **Estructura del Proyecto sugerida:**
   - `/server`: `/src/models`, `/src/controllers`, `/src/routes`, `/src/config/db.ts`, `server.ts`
   - `/client`: `/src/components`, `/src/pages`, `/src/context` o `/src/hooks`, `/src/services` (Llamadas Axios/Fetch).
3. **Persistencia:** Todos los datos deben guardarse en la base de datos de MongoDB. Proveer un script de seed (`seed.ts`) para poblar datos de prueba iniciales para los 5 módulos automáticamente.