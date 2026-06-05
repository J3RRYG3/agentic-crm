import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración Playwright para Mini-CRM.
 * Frontend:  http://localhost:5173 (Vite / Docker crm_frontend)
 * Backend:   http://localhost:8080 (Express / Docker crm_backend)
 *
 * El globalSetup verifica/arranca Docker Compose antes de correr tests.
 * Screenshots en TODOS los tests (éxito + fallo) para evidencias.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 15_000 },
  globalSetup: './global-setup',

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
