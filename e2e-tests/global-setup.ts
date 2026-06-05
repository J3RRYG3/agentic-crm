import { execSync, spawnSync } from 'child_process';
import * as http from 'http';
import * as path from 'path';

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8080/api/health';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const MAX_WAIT_MS = 90_000;
const POLL_INTERVAL_MS = 3_000;

async function isServiceUp(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2_000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServices(timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const [feUp, beUp] = await Promise.all([
      isServiceUp(FRONTEND_URL),
      isServiceUp(BACKEND_URL),
    ]);
    if (feUp && beUp) {
      console.log('✅ Frontend y Backend están activos.');
      return true;
    }
    console.log(
      `⏳ Esperando servicios... Frontend: ${feUp ? 'OK' : 'NO'} | Backend: ${beUp ? 'OK' : 'NO'}`
    );
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return false;
}

async function startDockerServices(): Promise<void> {
  console.log('🐳 Iniciando servicios Docker (docker compose up --build -d)...');
  try {
    spawnSync('docker', ['compose', 'up', '--build', '-d'], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      timeout: 120_000,
      shell: true,
    });
  } catch (err) {
    console.warn('⚠️  docker compose up falló (puede que Docker Desktop no esté activo):', err);
  }
}

async function runSeed(): Promise<void> {
  console.log('🌱 Ejecutando seed de datos de prueba...');
  try {
    execSync('docker exec crm_backend npm run seed', {
      cwd: PROJECT_ROOT,
      timeout: 30_000,
      stdio: 'inherit',
    });
  } catch {
    console.warn('⚠️  Seed falló (puede que ya esté ejecutado o el contenedor no esté disponible).');
  }
}

export default async function globalSetup(): Promise<void> {
  console.log('\n🔍 Verificando disponibilidad de servicios Mini-CRM...');

  // Primer chequeo: ¿ya están arriba?
  const alreadyUp = await waitForServices(5_000);

  if (!alreadyUp) {
    console.log('🚀 Servicios no disponibles. Intentando arrancar Docker Compose...');
    await startDockerServices();

    const nowUp = await waitForServices(MAX_WAIT_MS);
    if (!nowUp) {
      console.error(`\n❌ Los servicios no respondieron en ${MAX_WAIT_MS / 1000}s.`);
      console.error('   → Asegúrate de que Docker Desktop esté corriendo y vuelve a ejecutar:');
      console.error('     docker compose up --build -d   (desde la raíz del proyecto)');
      console.error('     docker exec -it crm_backend npm run seed');
      throw new Error('Mini-CRM services are not available. Start Docker Desktop first.');
    }

    // Ejecutar seed si los servicios acaban de arrancar
    await runSeed();
  }

  console.log('✅ Entorno listo. Iniciando suite de pruebas.\n');
}
