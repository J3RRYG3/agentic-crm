import { defineConfig, devices } from '@playwright/test';

/**
 * Config exclusiva para la captura de screenshots manuales.
 * No requiere backend: solo el frontend Vite en localhost:5173.
 * No usa globalSetup para no bloquear cuando el backend esté apagado.
 */
export default defineConfig({
  testDir: './tests/screenshots',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 25_000,
  expect: { timeout: 10_000 },

  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
    viewport: { width: 1440, height: 900 },
  },

  projects: [
    {
      name: 'screenshots',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
