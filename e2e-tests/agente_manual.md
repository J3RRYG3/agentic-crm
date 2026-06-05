# Agente Consultor de QA Manual — Mini-CRM

> **Rol**: Agente de QA Manual especializado en pruebas exploratorias de UX/UI, validación visual y flujos que la automatización no puede cubrir.  
> **Alcance**: Pruebas complementarias a la suite Playwright. Se ejecutan sobre la aplicación en vivo (http://localhost:5173).  
> **Audiencia**: QA Engineer, Product Owner, o cualquier miembro del equipo con acceso al entorno Docker.

---

## Módulo 0 — Preparación del Entorno

**Prerrequisitos antes de iniciar cualquier prueba manual:**

1. `docker compose up --build -d` (desde la raíz del proyecto)
2. `docker exec -it crm_backend npm run seed` (poblar datos)
3. Abrir el navegador en `http://localhost:5173`
4. Usar DevTools (F12) para monitorear llamadas de red

---

## M1 — Gestión de Contactos (UI Exploratoria)

### CM-001: Creación de contacto con validación de formulario

| Campo | Detalle |
|-------|---------|
| **ID** | CM-001 |
| **Prioridad** | Alta |
| **Tipo** | Funcional + Validación UI |

**Pasos:**
1. Navegar a `http://localhost:5173/contacts`
2. Hacer clic en **"Nuevo Contacto"**
3. Intentar guardar el formulario vacío (sin rellenar ningún campo)
4. Verificar que los campos obligatorios muestren errores de validación HTML5
5. Rellenar **Nombre**: `Test Manual QA`
6. Rellenar **Email**: `no-es-un-email` (email inválido)
7. Intentar guardar → verificar mensaje de error de formato de email
8. Corregir email a: `test.manual@qa.com`
9. Rellenar el resto de campos válidos
10. Guardar → verificar aparición del contacto en la tabla

**Datos de Entrada:**
```
fullName: Test Manual QA
email: test.manual@qa.com
phone: +34 600 999 888
company: Manual QA Corp
position: QA Tester
leadStatus: Nuevo
```

**Resultado Esperado:**
- El formulario debe impedir envío con campos vacíos (validación HTML5 `required`)
- El campo email debe rechazar formatos inválidos
- Al guardar correctamente, el contacto aparece en la primera fila de la tabla (orden: más reciente primero)
- El contador superior "X contactos encontrados" incrementa en 1

**Lo que la automatización NO cubre:** Validación visual del diseño del modal, accesibilidad de los mensajes de error, comportamiento del foco en campos.

---

### CM-002: Búsqueda en tiempo real con debounce

| Campo | Detalle |
|-------|---------|
| **ID** | CM-002 |
| **Prioridad** | Media |
| **Tipo** | UX / Comportamiento Asíncrono |

**Pasos:**
1. En `/contacts`, escribir `Ana` en el campo de búsqueda
2. **Observar**: la lista debe filtrar en tiempo real sin presionar Enter (debounce de 300ms)
3. Escribir `@techcorp` → verificar que también filtra por email parcial
4. Escribir una cadena que no coincida con ningún contacto: `xyzabc123`
5. Verificar el mensaje "No se encontraron contactos"
6. Borrar el campo → verificar que la lista vuelve a mostrar todos los contactos

**Resultado Esperado:**
- El filtrado ocurre ~300ms después de dejar de escribir (no en cada pulsación)
- La combinación de búsqueda + filtro de estado funciona simultáneamente
- El estado vacío muestra un mensaje descriptivo

**Lo que la automatización NO cubre:** Medir el debounce real (timing subjetivo), comportamiento visual del spinner durante la carga.

---

### CM-003: Modal de vista de notas — Scroll y accesibilidad

| Campo | Detalle |
|-------|---------|
| **ID** | CM-003 |
| **Prioridad** | Media |
| **Tipo** | UX / Accesibilidad Visual |

**Pasos:**
1. Hacer clic en el ícono de ojo 👁 de un contacto con múltiples notas (ej: Ana García López)
2. Verificar que el modal muestra las notas con fecha formateada en español
3. Agregar una nueva nota: `Nota de prueba manual QA ${fecha actual}`
4. Verificar que la nota aparece al final de la lista con timestamp correcto
5. Cerrar el modal (X o clic fuera del modal)
6. Reabrir el mismo contacto → verificar que la nota persiste

**Datos de Entrada:**
```
Texto de nota: Seguimiento Q3 2026 — Reunión programada con CTO para demostración del módulo de analytics
```

**Resultado Esperado:**
- El modal muestra notas en orden cronológico
- La nueva nota aparece con la fecha/hora del momento de creación
- El modal se cierra correctamente al hacer clic en la X o fuera del overlay
- Las notas persisten tras cerrar y reabrir el modal

---

## M2 — Pipeline de Ventas (Kanban Visual)

### PL-001: Inspección visual del tablero Kanban

| Campo | Detalle |
|-------|---------|
| **ID** | PL-001 |
| **Prioridad** | Alta |
| **Tipo** | Visual / Diseño Gráfico |

**Pasos:**
1. Navegar a `http://localhost:5173/pipeline`
2. Verificar que las 6 columnas Kanban tienen colores diferenciados:
   - **Prospecto**: gris/slate
   - **Calificado**: azul
   - **Propuesta**: violeta
   - **Negociación**: naranja
   - **Ganado**: verde
   - **Perdido**: rojo
3. Verificar que el header de cada columna muestra `(N oportunidades)` y `$Xk` de valor
4. Hacer scroll horizontal para verificar que el board es navegable con overflow-x
5. Verificar que las tarjetas muestran: título, nombre del contacto, valor en €, fecha de cierre
6. Verificar el comportamiento hover de las tarjetas (sombra elevada)

**Resultado Esperado:**
- Todos los colores de columna coinciden con el diseño del sistema de diseño Tailwind
- El scroll horizontal funciona sin cortar contenido
- Las tarjetas muestran información completa sin desbordamiento de texto

**Lo que la automatización NO cubre:** Inspección de colores CSS reales, verificación de proporciones visuales, comportamiento en pantallas pequeñas (responsive).

---

### PL-002: Prueba de responsividad del Kanban en ventana estrecha

| Campo | Detalle |
|-------|---------|
| **ID** | PL-002 |
| **Prioridad** | Baja |
| **Tipo** | Responsive Design |

**Pasos:**
1. Abrir DevTools → Device Toolbar → simular iPhone 13 (390×844)
2. Navegar a `/pipeline`
3. Verificar que el Kanban es navegable horizontalmente con scroll táctil
4. Verificar que las tarjetas no se solapan ni se cortan

**Resultado Esperado:** La interfaz es usable en móvil aunque sea solo horizontal.

---

## M3 — Soporte y Tickets

### TK-001: Cambio de estado inline sin recarga de página

| Campo | Detalle |
|-------|---------|
| **ID** | TK-001 |
| **Prioridad** | Alta |
| **Tipo** | Funcional / UX Interactivo |

**Pasos:**
1. Navegar a `/tickets`
2. Localizar un ticket con estado "Abierto" (color rojo)
3. Hacer clic en el select de estado inline → cambiar a "En Progreso"
4. **Observar sin recargar**: el badge/select debe cambiar de color rojo a amarillo instantáneamente
5. Cambiar a "Resuelto" → el select debe volverse verde
6. Verificar en DevTools → Network que se realizó una llamada `PUT /api/tickets/:id`
7. Recargar la página y verificar que el estado persiste

**Resultado Esperado:**
- El cambio de color del badge ocurre inmediatamente (actualización optimista del estado React)
- La llamada API se realiza en background
- El estado persiste después de recarga

**Lo que la automatización NO cubre:** Verificar los colores CSS exactos del badge, observar la animación de transición del color.

---

### TK-002: Confirmación de diálogo nativo al eliminar ticket

| Campo | Detalle |
|-------|---------|
| **ID** | TK-002 |
| **Prioridad** | Media |
| **Tipo** | UX / Diálogos Nativos |

**Pasos:**
1. Hacer clic en el ícono de papelera 🗑 de cualquier ticket
2. Verificar que aparece un diálogo nativo del navegador: `"¿Eliminar este ticket?"`
3. Hacer clic en **Cancelar** → verificar que el ticket NO se elimina
4. Repetir y hacer clic en **Aceptar** → verificar que el ticket desaparece de la tabla
5. Verificar que no aparece notificación de éxito (comportamiento actual del diseño)

**Resultado Esperado:**
- El diálogo nativo aparece correctamente
- Cancelar no tiene efecto secundario
- Aceptar elimina el ticket sin recargar la página completa

---

## M4 — Marketing y Campañas

### MK-001: Flujo completo de creación y envío de campaña

| Campo | Detalle |
|-------|---------|
| **ID** | MK-001 |
| **Prioridad** | Alta |
| **Tipo** | Funcional / Flujo de Negocio |

**Pasos:**
1. Navegar a `/campaigns`
2. Hacer clic en **"Nueva Campaña"**
3. Rellenar el formulario:
   - **Nombre**: `Campaña Black Friday 2026`
   - **Segmento objetivo**: Seleccionar `Contactado` + `Nuevo` (multi-select si aplica)
   - **Asunto del email**: `¡Oferta exclusiva Black Friday para ti!`
   - **Cuerpo**: `Querido cliente, este Black Friday tenemos algo especial...`
4. Guardar → verificar que aparece en la lista con estado "Borrador"
5. Hacer clic en **"Enviar Campaña"** (si existe botón)
6. Verificar cambio de estado a "Enviada" con timestamp
7. Navegar a `/contacts` y verificar que los contactos del segmento tienen una nueva nota con el nombre de la campaña

**Datos de Entrada:**
```
name: Campaña Black Friday 2026
targetSegment: [Contactado, Nuevo]
emailSubject: ¡Oferta exclusiva Black Friday para ti!
emailBody: Querido cliente, este Black Friday tenemos algo especial preparado para ti...
```

**Resultado Esperado:**
- La campaña aparece en estado "Borrador" tras crear
- Tras enviar, el estado cambia a "Enviada" con fecha/hora
- Los contactos del segmento seleccionado tienen una nota automática insertada
- El campo "Contactos afectados" muestra el número correcto

---

## M5 — Dashboard de Informes

### DB-001: Verificación visual de los gráficos Recharts

| Campo | Detalle |
|-------|---------|
| **ID** | DB-001 |
| **Prioridad** | Alta |
| **Tipo** | Visual / Gráficos |

**Pasos:**
1. Navegar a `/dashboard`
2. Esperar a que carguen los gráficos (BarChart y PieChart)
3. Pasar el cursor sobre las barras del **Gráfico de Pipeline por Etapa**
4. Verificar que el tooltip muestra el valor exacto en formato `$X.XXX` (locale es-ES)
5. Pasar el cursor sobre los segmentos del **Gráfico de Estado de Tickets (PieChart)**
6. Verificar que el tooltip muestra el número de tickets
7. Verificar que la leyenda del PieChart muestra los 3 estados con colores correctos:
   - Abierto → rojo (`#ef4444`)
   - En Progreso → amarillo (`#f59e0b`)
   - Resuelto → verde (`#22c55e`)

**Resultado Esperado:**
- Tooltips interactivos funcionan en hover
- Los colores coinciden con el sistema de diseño definido en el código
- Los valores numéricos son exactos según los datos del Seed

**Lo que la automatización NO cubre:** Inspección de colores SVG, interactividad hover/tooltip visual, renderizado de animaciones de entrada de los gráficos.

---

### DB-002: Comportamiento del Dashboard sin datos (BD vacía)

| Campo | Detalle |
|-------|---------|
| **ID** | DB-002 |
| **Prioridad** | Media |
| **Tipo** | Estado Vacío / Edge Case |

**Pasos:**
1. Ejecutar `docker exec -it crm_backend npx ts-node -e "require('./src/seed')" --reset-only` (limpiar BD)
2. Navegar a `/dashboard`
3. Verificar que los KPI cards muestran "0" o "0%" sin errores visuales
4. Verificar que el gráfico de Pipeline muestra "Sin datos de pipeline"
5. Verificar que el PieChart de tickets muestra "Sin tickets registrados"
6. Ejecutar el seed nuevamente y hacer clic en "Actualizar"

**Resultado Esperado:**
- El dashboard maneja el estado vacío sin errores JavaScript en consola
- Los textos de estado vacío son informativos y visualmente coherentes
- El botón "Actualizar" recarga los datos correctamente

---

## Checklist Final de Regresión Visual

Ejecutar este checklist después de cualquier cambio de CSS/UI:

- [ ] Navbar se muestra correctamente con todos los íconos Lucide
- [ ] El link activo en Navbar tiene highlight visual (color primario)
- [ ] Todas las tablas tienen bordes y separadores visibles
- [ ] Los badges de estado usan colores semánticos (verde=bueno, rojo=urgente, amarillo=pendiente)
- [ ] Los modales tienen overlay oscuro (`bg-black/40`) y blur de fondo
- [ ] Los botones primarios tienen color azul y hover visible
- [ ] Los botones de eliminar tienen hover en rojo
- [ ] El scroll del Kanban funciona en horizontal
- [ ] El spinner de carga aparece durante peticiones lentas (simular con throttle 3G en DevTools)
- [ ] La app se ve correctamente en resolución 1280×720, 1920×1080 y 1440×900

---

## Herramientas Recomendadas para QA Manual

| Herramienta | Uso |
|-------------|-----|
| Chrome DevTools Network Tab | Inspeccionar llamadas API, verificar payloads |
| Chrome DevTools Device Toolbar | Pruebas responsive en móvil/tablet |
| axe DevTools Extension | Auditoría de accesibilidad WCAG |
| Lighthouse (DevTools) | Performance, SEO, accesibilidad automatizada |
| Postman / Thunder Client | Pruebas directas de los endpoints API |
| React DevTools | Inspección del estado React en tiempo real |
