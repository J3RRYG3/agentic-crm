import { test, expect } from '@playwright/test';

/**
 * Caso de Test 4: Dashboard KPI Check
 *
 * Verifica métricas financieras y contadores calculados desde los datos del Seed:
 *   - 10 contactos insertados
 *   - Total pipeline: $223.700 (8 oportunidades, formato es-ES)
 *   - 1 oportunidad Ganada → Tasa de Conversión: 12.5%
 *   - 3 tickets Abiertos, 1 En Progreso, 2 Resueltos
 *   - 2 campañas Enviadas
 */
test.describe('E2E – M5 Dashboard KPIs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    // Esperar a que carguen las KPI cards (el spinner desaparece)
    await expect(page.getByText('Cargando métricas...')).not.toBeVisible({
      timeout: 15_000,
    });
    // Esperar a que aparezca al menos un KPI card
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 15_000 });
  });

  test('Dashboard carga sin errores y muestra los KPI cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Métricas consolidadas en tiempo real')).toBeVisible();
    // Los 5 KPI cards deben estar presentes
    await expect(page.getByText('Valor Pipeline')).toBeVisible();
    await expect(page.getByText('Tasa Conversión')).toBeVisible();
    await expect(page.getByText('Tickets Abiertos')).toBeVisible();
    await expect(page.getByText('Campañas Enviadas')).toBeVisible();
    await expect(page.getByText('Total Contactos')).toBeVisible();
  });

  test('KPI "Total Contactos" muestra 10 (exactamente los del Seed)', async ({ page }) => {
    // Localizar la card de Total Contactos y verificar su valor
    const contactsCard = page.locator('.card', { hasText: 'Total Contactos' });
    await expect(contactsCard).toBeVisible();
    // El valor del KPI está en el h3 bold dentro de la card
    await expect(contactsCard.locator('p.text-3xl')).toHaveText('10');
    await expect(contactsCard).toContainText('Contactos en la base de datos');
  });

  test('KPI "Valor Pipeline" muestra $223.700 (suma total del Seed)', async ({ page }) => {
    // En locale es-ES: 223700.toLocaleString('es-ES') → "223.700"
    const pipelineCard = page.locator('.card', { hasText: 'Valor Pipeline' });
    await expect(pipelineCard).toBeVisible();
    await expect(pipelineCard.locator('p.text-3xl')).toContainText('223');
    // Verificar el símbolo dólar y el separador de miles es-ES
    const valueText = await pipelineCard.locator('p.text-3xl').textContent();
    expect(valueText).toMatch(/\$223[.,]700/);
  });

  test('KPI "Tasa Conversión" muestra 12.5% (1 de 8 oportunidades ganadas)', async ({ page }) => {
    const convCard = page.locator('.card', { hasText: 'Tasa Conversión' });
    await expect(convCard).toBeVisible();
    await expect(convCard.locator('p.text-3xl')).toContainText('12.5%');
  });

  test('KPI "Tickets Abiertos" muestra 3', async ({ page }) => {
    const ticketsCard = page.locator('.card', { hasText: 'Tickets Abiertos' });
    await expect(ticketsCard).toBeVisible();
    await expect(ticketsCard.locator('p.text-3xl')).toHaveText('3');
    await expect(ticketsCard).toContainText('1 en progreso');
    await expect(ticketsCard).toContainText('2 resueltos');
  });

  test('KPI "Campañas Enviadas" muestra 2', async ({ page }) => {
    const campaignsCard = page.locator('.card', { hasText: 'Campañas Enviadas' });
    await expect(campaignsCard).toBeVisible();
    await expect(campaignsCard.locator('p.text-3xl')).toHaveText('2');
  });

  test('Gráfico de Pipeline por Etapa está visible', async ({ page }) => {
    await expect(page.getByText('Valor del Pipeline por Etapa')).toBeVisible();
    // El contenedor Recharts debe estar presente
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('Botón "Actualizar" recarga las métricas', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /Actualizar/i });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    // Después del click puede aparecer brevemente el spinner
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 15_000 });
    // KPIs siguen mostrándose
    await expect(page.locator('.card', { hasText: 'Total Contactos' })).toBeVisible();
  });
});
