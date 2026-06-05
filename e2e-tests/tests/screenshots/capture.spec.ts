import { test } from '@playwright/test';
import * as path from 'path';

/**
 * Suite de captura de screenshots para las pruebas manuales del Mini-CRM.
 * Cada test navega a un módulo, espera la carga máxima posible y guarda
 * la captura en e2e-tests/screenshots/.
 *
 * Funciona con solo el frontend Vite activo (sin backend):
 * los módulos mostrarán estados de carga o error, que son evidencia
 * válida del estado real de la UI.
 */

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../screenshots');
const BASE = 'http://localhost:5173';

// Helper: esperar a que desaparezca el spinner O que aparezca un error/contenido
async function waitForPageLoad(page: import('@playwright/test').Page, spinnerText: string) {
  try {
    await page.waitForFunction(
      (text: string) => !document.body.innerText.includes(text),
      spinnerText,
      { timeout: 8_000 }
    );
  } catch {
    // Si el spinner no desapareció, igual tomamos la captura del estado actual
  }
  await page.waitForTimeout(500);
}

test.use({
  baseURL: BASE,
  viewport: { width: 1440, height: 900 },
  screenshot: 'off', // manejamos screenshots manualmente con rutas explícitas
});

test.describe('Screenshots — Mini-CRM (todas las páginas)', () => {

  test('SCR-01 — Dashboard: KPIs y gráficos', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await waitForPageLoad(page, 'Cargando métricas');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-01_dashboard_kpis.png`,
      fullPage: true,
    });
  });

  test('SCR-02 — Dashboard: estado de error (sin backend)', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    // Esperar a que aparezca el mensaje de error o la carga termine
    await page.waitForTimeout(6_000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-02_dashboard_sin_backend.png`,
      fullPage: true,
    });
  });

  test('SCR-03 — Contactos: tabla y filtros', async ({ page }) => {
    await page.goto(`${BASE}/contacts`);
    await waitForPageLoad(page, 'Cargando contactos');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-03_contactos_tabla.png`,
      fullPage: true,
    });
  });

  test('SCR-04 — Contactos: modal "Nuevo Contacto" abierto', async ({ page }) => {
    await page.goto(`${BASE}/contacts`);
    await page.waitForTimeout(3_000);
    // Abrir el modal de creación
    const btn = page.getByRole('button', { name: /Nuevo Contacto/i });
    try {
      await btn.click({ timeout: 5_000 });
      await page.waitForTimeout(800);
    } catch {
      // Si no hay botón visible, igual capturamos el estado de la página
    }
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-04_contactos_modal_nuevo.png`,
      fullPage: true,
    });
  });

  test('SCR-05 — Pipeline: tablero Kanban completo', async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    await waitForPageLoad(page, 'Cargando pipeline');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-05_pipeline_kanban.png`,
      fullPage: true,
    });
  });

  test('SCR-06 — Pipeline: modal "Nueva Oportunidad"', async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    await page.waitForTimeout(3_000);
    const btn = page.getByRole('button', { name: /Nueva Oportunidad/i });
    try {
      await btn.click({ timeout: 5_000 });
      await page.waitForTimeout(800);
    } catch {
      // Capturamos el estado actual
    }
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-06_pipeline_modal_oportunidad.png`,
      fullPage: true,
    });
  });

  test('SCR-07 — Soporte: tabla de tickets con códigos TKT', async ({ page }) => {
    await page.goto(`${BASE}/tickets`);
    await waitForPageLoad(page, 'Cargando tickets');
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-07_tickets_tabla.png`,
      fullPage: true,
    });
  });

  test('SCR-08 — Soporte: formulario "Nuevo Ticket"', async ({ page }) => {
    await page.goto(`${BASE}/tickets`);
    await page.waitForTimeout(3_000);
    const btn = page.getByRole('button', { name: /Nuevo Ticket/i });
    try {
      await btn.click({ timeout: 5_000 });
      await page.waitForTimeout(800);
    } catch {
      // Capturamos el estado actual
    }
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-08_tickets_formulario_nuevo.png`,
      fullPage: true,
    });
  });

  test('SCR-09 — Marketing: listado de campañas', async ({ page }) => {
    await page.goto(`${BASE}/campaigns`);
    await page.waitForTimeout(4_000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-09_campanas_listado.png`,
      fullPage: true,
    });
  });

  test('SCR-10 — Navbar: vista completa del menú lateral', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(2_000);
    // Captura enfocada en el navbar (viewport ancho para verlo completo)
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-10_navbar_menu_lateral.png`,
      fullPage: false,
    });
  });

  test('SCR-11 — Pipeline: columnas Kanban con scroll horizontal', async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    await page.waitForTimeout(4_000);
    // Viewport más ancho para capturar más columnas
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-11_pipeline_kanban_wide.png`,
      fullPage: false,
    });
  });

  test('SCR-12 — Vista móvil: Dashboard en 390px (iPhone 15)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(4_000);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/SCR-12_dashboard_mobile_390px.png`,
      fullPage: true,
    });
  });

});
