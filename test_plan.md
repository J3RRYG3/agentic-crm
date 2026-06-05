# Plan de Pruebas Automatizadas y Estrategia Resiliente (Test Plan) - Mini-CRM

## 1. Alcance, Objetivos y Verificación de Infraestructura
Este plan de pruebas define la estrategia para asegurar la calidad y el correcto funcionamiento del MVP del Mini-CRM mediante un enfoque agéntico resiliente.

### Control Automático del Entorno:
- El entorno debe ser auto-orquestado. Si los servicios web locales mapeados en los contenedores Docker están inactivos, el sistema ejecutará un 'docker compose up --build -d' para levantar el entorno de desarrollo de forma desatendida.

---

## 2. Estrategia de Pruebas End-to-End (E2E Testing Automatizado)
Se implementará una suite completa de pruebas de interfaz de usuario de extremo a extremo (E2E) utilizando Playwright y TypeScript para simular el comportamiento real de un usuario comercial en el navegador:

1. Caso de Test E2E - Dashboard Analytics: Validación de la carga asíncrona de los KPIs financieros ($223.700) y consistencia en los gráficos de barras y dona tras el impacto del seed data.
2. Caso de Test E2E - Flujo de Contactos (M1): Navegación a la sección de contactos, apertura del modal, creación de un lead y verificación de la inserción de notas en tiempo real dentro de la tabla.
3. Caso de Test E2E - Gestión del Pipeline (M2): Simulación de actualización de etapas del tablero Kanban y verificación de persistencia en la base de datos tras la recarga del sitio web.
4. Caso de Test E2E - Soporte e Incidencias (M3): Apertura de un ticket de soporte, cambio de prioridad y verificación de la nomenclatura secuencial única (TKT-XXXXX).

---

## 3. Mecanismo de Resiliencia: Auto-Heal (Auto-reparación)
Para evitar que las pruebas fallen por factores externos ("Flaky Tests") o cambios menores en el código de la UI, se implementará una política de auto-reparación guiada por IA:
- Análisis de Fallos: Ante un error de aserción o tiempo de espera agotado, el agente analizará el árbol DOM de la página.
- Refactorización Dinámica: El código del test se auto-modificará reemplazando selectores CSS frágiles por selectores semánticos estables y esperas asíncronas explícitas, repitiendo la prueba hasta confirmar estabilidad.

---

## 4. Gestión de Evidencias Visuales
- Capturas Automatizadas: Playwright tomará capturas de pantalla (.png) automáticas en cada paso clave de los flujos de prueba.
- Reporte Consolidado: Se generará un documento llamado 'evidencias_testing.md' que servirá como registro oficial e indexará todas las imágenes de éxito obtenidas durante la ejecución.

---

## 5. Arquitectura Multi-Agente: Generador de Pruebas Manuales
Dado que la automatización E2E cubre flujos lógicos, se delega a un agente alterno especializado ('agente_manual.md') el diseño del testing exploratorio y de usabilidad:
- Objetivo del Segundo Agente: Analizar los casos de borde, flujos alternativos, experiencia de usuario (UX) e interfaces del CRM para redactar paso a paso un catálogo formal de pruebas manuales y asegurar el 100% de cobertura del software.