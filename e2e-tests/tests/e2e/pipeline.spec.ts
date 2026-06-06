import { test, expect } from '@playwright/test';

/**
 * Caso de Test 5: Kanban Pipeline — Cambio de Etapa y Persistencia
 *
 * Oportunidad objetivo del Seed:
 *   Título: "Módulo Analítica MKT Pro"
 *   Etapa inicial: Prospecto
 *   Valor: 9.500
 *
 * Flujo:
 *   1. Navegar a /pipeline
 *   2. Localizar la tarjeta en columna "Prospecto"
 *   3. Cambiar etapa a "Calificado" vía select inline
 *   4. Recargar la página
 *   5. Verificar que la tarjeta aparece en columna "Calificado"
 *   6. Restaurar etapa a "Prospecto" (cleanup)
 */

const OPP_TITLE = 'Módulo Analítica MKT Pro';
const API = 'http://localhost:8080';

test.describe('E2E – M2 Pipeline Kanban', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pipeline');
    // Esperar a que desaparezca el spinner de carga
    await expect(page.getByText('Cargando pipeline...')).not.toBeVisible({
      timeout: 15_000,
    });
    // Esperar columnas del Kanban — selector semántico estable apuntando al encabezado de columna
    await expect(page.locator('span.text-xs.font-semibold', { hasText: 'Prospecto' }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Pipeline carga todas las columnas del Kanban', async ({ page }) => {
    const stages = ['Prospecto', 'Calificado', 'Propuesta', 'Negociación', 'Ganado', 'Perdido'];
    for (const stage of stages) {
      // Selector semántico estable: encabezado de columna span, no las options de los selects
      await expect(page.locator('span.text-xs.font-semibold', { hasText: stage }).first()).toBeVisible();
    }
  });

  test('Tarjeta de oportunidad muestra datos del Seed (título, valor, contacto)', async ({
    page,
  }) => {
    // Buscar la tarjeta por su título
    const card = page.locator('div.bg-white.rounded-lg', { hasText: OPP_TITLE });
    await expect(card).toBeVisible();
    // El valor 9500 puede renderizarse como "9.500" o "9500" según ICU del entorno
    const cardText = await card.textContent();
    expect(cardText).toMatch(/9[.,]?500/);
    await expect(card).toContainText('Elena Ruiz Navarro'); // contacto del seed
  });

  test('Cambio de etapa via select — persiste después de recarga (Test 5)', async ({ page, request }) => {
    // ── 1. Localizar la tarjeta en columna Prospecto ──
    const prospectoCol = page
      .locator('.flex-shrink-0.w-64')
      .filter({ hasText: 'Prospecto' })
      .first();
    await expect(prospectoCol).toBeVisible();

    const card = prospectoCol.locator('div.bg-white.rounded-lg', { hasText: OPP_TITLE });
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Obtener el ID de la oportunidad para el cleanup
    let oppId = '';
    const allOpps = await request.get(`${API}/api/opportunities`);
    const opps = (await allOpps.json()) as Array<{ _id: string; title: string; stage: string }>;
    const targetOpp = opps.find((o) => o.title === OPP_TITLE);
    if (targetOpp) oppId = targetOpp._id;

    try {
      // ── 2. Cambiar etapa a "Calificado" ──
      const stageSelect = card.locator('select');
      await expect(stageSelect).toBeVisible();
      await stageSelect.selectOption('Calificado');

      // Esperar a que la API persista el cambio
      await page.waitForTimeout(1000);

      // ── 3. Verificar en la misma página que la card se movió ──
      // La columna Prospecto ya no debe tener esta card
      await expect(
        page.locator('.flex-shrink-0.w-64').filter({ hasText: 'Prospecto' }).first().locator('div.bg-white.rounded-lg', { hasText: OPP_TITLE })
      ).not.toBeVisible({ timeout: 5_000 });

      // ── 4. Recargar y verificar persistencia ──
      await page.reload();
      await expect(page.getByText('Cargando pipeline...')).not.toBeVisible({ timeout: 15_000 });
      await expect(page.getByText('Calificado').first()).toBeVisible({ timeout: 10_000 });

      const calificadoCol = page
        .locator('.flex-shrink-0.w-64')
        .filter({ hasText: 'Calificado' })
        .first();
      await expect(
        calificadoCol.locator('div.bg-white.rounded-lg', { hasText: OPP_TITLE })
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      // ── 5. Restaurar etapa original (cleanup) ──
      if (oppId) {
        await request.put(`${API}/api/opportunities/${oppId}`, {
          data: { stage: 'Prospecto' },
        });
      }
    }
  });

  test('Botón "Nueva Oportunidad" abre el modal', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Nueva Oportunidad/i });
    await expect(btn).toBeVisible();
    await btn.click();
    // Modal debe aparecer
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 }).catch(async () => {
      // Alternativa: buscar por texto del modal
      await expect(page.getByText('Nueva Oportunidad').nth(1)).toBeVisible();
    });
    // Cerrar modal con Escape
    await page.keyboard.press('Escape');
  });
});
