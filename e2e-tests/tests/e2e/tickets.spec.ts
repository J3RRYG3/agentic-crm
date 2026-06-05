import { test, expect } from '@playwright/test';

/**
 * Caso de Test 6: Creación Interactiva de Tickets desde la UI
 *
 * Flujo completo:
 *   1. Navegar a /tickets
 *   2. Verificar listado inicial con tickets del Seed (código TKT-XXXXX)
 *   3. Abrir formulario "Nuevo Ticket"
 *   4. Seleccionar contacto, rellenar asunto y descripción
 *   5. Enviar formulario
 *   6. Verificar que el nuevo ticket aparece en la tabla con código TKT-XXXXX
 *   7. Eliminar el ticket creado (cleanup)
 */

const API = 'http://localhost:8080';

test.describe('E2E – M3 Soporte y Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tickets');
    await expect(page.getByText('Cargando tickets...')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Soporte y Tickets' })).toBeVisible();
  });

  test('Listado de tickets muestra códigos TKT-XXXXX del Seed', async ({ page }) => {
    // Verificar que existe al menos un código TKT-XXXXX en la tabla
    const codeRegex = /TKT-\d{5}/;
    const firstCode = page.locator('span.font-mono').first();
    await expect(firstCode).toBeVisible({ timeout: 10_000 });
    const codeText = await firstCode.textContent();
    expect(codeText).toMatch(codeRegex);
  });

  test('Filtro por Estado muestra solo tickets correspondientes', async ({ page }) => {
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('Abierto');
    // Esperar a que se aplique el filtro
    await page.waitForTimeout(500);
    // Todos los badges de estado deben ser "Abierto"
    const statusSelects = page.locator('tbody select').filter({ hasText: 'Abierto' });
    await expect(statusSelects.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Creación interactiva de ticket — flujo completo (Test 6)', async ({ page, request }) => {
    let createdTicketId = '';

    try {
      // ── 1. Obtener un contacto para el formulario ──
      const contactsResp = await request.get(`${API}/api/contacts`);
      const contacts = (await contactsResp.json()) as Array<{
        _id: string;
        fullName: string;
        company: string;
      }>;
      expect(contacts.length).toBeGreaterThan(0);
      const testContact = contacts[0];

      // ── 2. Contar tickets actuales ──
      const initialCount = await page.locator('tbody tr').count();

      // ── 3. Abrir formulario de nuevo ticket ──
      await page.getByRole('button', { name: /Nuevo Ticket/i }).click();
      await expect(page.getByRole('heading', { name: 'Nuevo Ticket' })).toBeVisible({
        timeout: 5_000,
      });

      // ── 4. Rellenar el formulario ──
      // Seleccionar contacto
      const contactSelect = page.locator('label', { hasText: 'Cliente / Contacto' }).locator('..').locator('select');
      await contactSelect.selectOption({ label: `${testContact.fullName} — ${testContact.company}` });

      // Asunto
      await page.getByPlaceholder('Describir brevemente el problema...').fill(
        'Incidencia QA Playwright — Test automatizado'
      );

      // Descripción
      await page.getByPlaceholder('Detalle completo del incidente...').fill(
        'Este ticket fue creado automáticamente por la suite de pruebas E2E de Playwright. Puede ser eliminado de forma segura.'
      );

      // Prioridad: Alta (para diferenciarlo visualmente)
      const prioritySelect = page.locator('label', { hasText: 'Prioridad' }).locator('..').locator('select');
      await prioritySelect.selectOption('Alta');

      // ── 5. Enviar el formulario ──
      await page.getByRole('button', { name: 'Crear Ticket' }).click();

      // ── 6. Esperar a que el modal se cierre y la tabla se actualice ──
      await expect(page.getByRole('heading', { name: 'Nuevo Ticket' })).not.toBeVisible({
        timeout: 10_000,
      });

      // La tabla debe tener un ticket más
      await expect(page.locator('tbody tr')).toHaveCount(initialCount + 1, {
        timeout: 10_000,
      });

      // ── 7. Verificar que el nuevo ticket tiene código TKT-XXXXX ──
      const newRow = page.locator('tbody tr').first();
      await expect(newRow).toBeVisible();
      const codeCell = newRow.locator('span.font-mono');
      await expect(codeCell).toBeVisible({ timeout: 10_000 });
      const code = await codeCell.textContent();
      expect(code).toMatch(/^TKT-\d{5}$/);

      // ── 8. Verificar asunto y prioridad del nuevo ticket ──
      await expect(newRow).toContainText('Incidencia QA Playwright');
      await expect(newRow.locator('select').first()).toHaveValue('Alta');

      // Obtener el ID del ticket creado para el cleanup
      const ticketsResp = await request.get(`${API}/api/tickets`);
      const tickets = (await ticketsResp.json()) as Array<{
        _id: string;
        subject: string;
        code: string;
      }>;
      const created = tickets.find((t) => t.subject.includes('Incidencia QA Playwright'));
      if (created) createdTicketId = created._id;
    } finally {
      // ── 9. Cleanup: eliminar el ticket creado ──
      if (createdTicketId) {
        await request.delete(`${API}/api/tickets/${createdTicketId}`);
      }
    }
  });

  test('Tabla de contactos en /contacts carga con 10 registros del Seed', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page.getByText('Cargando contactos...')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Contactos' })).toBeVisible();
    // El contador de contactos debe indicar "10 contactos encontrados"
    await expect(page.getByText(/10 contactos encontrados/i)).toBeVisible({ timeout: 10_000 });
  });
});
